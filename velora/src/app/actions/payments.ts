"use server";

import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { createPaymentLinkSchema } from "@/features/payments/schemas";
import { effectiveStatus } from "@/features/payments/status";
import {
  SOLANA_NETWORK,
  solToLamports,
  isValidSolanaAddress,
} from "@/lib/solana/config";
import { verifySolTransfer } from "@/lib/solana/verify";
import type {
  ActionResult,
  CreatePaymentLinkInput,
  PaymentLink,
  Payment,
  PaymentReceipt,
  MerchantPayment,
  SubmitPaymentInput,
} from "@/features/payments/types";

const DB_NOT_SETUP =
  "Database not set up. Run the Phase 2 migration (velora/supabase/migrations/0001_phase2_payment_links.sql) in your Supabase SQL editor.";

function genSlug(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return (
    err.code === "PGRST205" ||
    err.code === "42P01" ||
    msg.includes("schema cache") ||
    msg.includes("does not exist")
  );
}

function dbError<T>(err: { code?: string; message?: string }): ActionResult<T> {
  if (isMissingTable(err)) {
    return { ok: false, error: DB_NOT_SETUP, code: "DB_NOT_SETUP" };
  }
  return {
    ok: false,
    error: err.message ?? "Unexpected database error",
    code: "UNKNOWN",
  };
}

export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<ActionResult<PaymentLink>> {
  const parsed = createPaymentLinkSchema.safeParse({
    title: input.title,
    description: input.description ?? "",
    amount: input.amount,
    currency: input.currency,
    customerContact: input.customerContact ?? "",
    expiresAt: input.expiresAt ?? "",
    saveAsDraft: input.saveAsDraft ?? false,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  if (!input.merchantWallet) {
    return {
      ok: false,
      error: "A connected merchant wallet is required.",
      code: "VALIDATION",
    };
  }

  const v = parsed.data;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("payment_links")
    .insert({
      slug: genSlug(),
      merchant_user_id: input.merchantUserId ?? null,
      merchant_wallet: input.merchantWallet,
      merchant_name: input.merchantName || "Velora Merchant",
      title: v.title,
      description: v.description ? v.description : null,
      amount: v.amount,
      currency: v.currency,
      customer_contact: v.customerContact ? v.customerContact : null,
      status: v.saveAsDraft ? "draft" : "active",
      expires_at: v.expiresAt ? new Date(v.expiresAt).toISOString() : null,
      network: SOLANA_NETWORK,
    })
    .select("*")
    .single();

  if (error) return dbError<PaymentLink>(error);
  return { ok: true, data: data as PaymentLink };
}

export async function listPaymentLinks(
  merchantWallet: string
): Promise<ActionResult<PaymentLink[]>> {
  if (!merchantWallet) return { ok: true, data: [] };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("merchant_wallet", merchantWallet)
    .order("created_at", { ascending: false });

  if (error) return dbError<PaymentLink[]>(error);
  return { ok: true, data: (data ?? []) as PaymentLink[] };
}

export async function getPaymentLinkBySlug(
  slug: string
): Promise<ActionResult<PaymentLink>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return dbError<PaymentLink>(error);
  if (!data) {
    return { ok: false, error: "Payment link not found.", code: "NOT_FOUND" };
  }
  return { ok: true, data: data as PaymentLink };
}

export async function setPaymentLinkStatus(
  id: string,
  status: "draft" | "active"
): Promise<ActionResult<PaymentLink>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_links")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return dbError<PaymentLink>(error);
  return { ok: true, data: data as PaymentLink };
}

/**
 * Phase 3: records a REAL Devnet payment. The checkout client builds, signs
 * (in the user's wallet), sends, and confirms a native SOL transfer, then calls
 * this action with the resulting signature. The server independently verifies
 * the signature on-chain (no execution error + recipient received at least the
 * requested amount) before marking the payment confirmed.
 *
 * Status engine: a `pending` payment row is written first, then transitioned to
 * `confirmed` (link → paid) or `failed` based on on-chain verification.
 */
export async function submitPayment(
  input: SubmitPaymentInput
): Promise<ActionResult<PaymentReceipt>> {
  if (!input.payerWallet || !isValidSolanaAddress(input.payerWallet)) {
    return {
      ok: false,
      error: "A valid payer wallet is required.",
      code: "VALIDATION",
    };
  }
  if (!input.txSignature) {
    return {
      ok: false,
      error: "A transaction signature is required.",
      code: "VALIDATION",
    };
  }

  const supabase = createServiceClient();

  const linkRes = await supabase
    .from("payment_links")
    .select("*")
    .eq("slug", input.slug)
    .maybeSingle();

  if (linkRes.error) return dbError<PaymentReceipt>(linkRes.error);
  const link = linkRes.data as PaymentLink | null;
  if (!link) {
    return { ok: false, error: "Payment link not found.", code: "NOT_FOUND" };
  }

  const eff = effectiveStatus(link);
  if (eff === "paid") {
    return {
      ok: false,
      error: "This payment link has already been paid.",
      code: "VALIDATION",
    };
  }
  if (eff !== "active") {
    return {
      ok: false,
      error: `This payment link is ${eff} and cannot accept payments.`,
      code: "VALIDATION",
    };
  }
  if (link.currency !== "SOL") {
    return {
      ok: false,
      error: "Only SOL payments are supported on Devnet right now.",
      code: "VALIDATION",
    };
  }

  const amount = Number(link.amount);
  const amountLamports = solToLamports(amount);

  // 0) Reject a signature that has already been recorded (replay/double-submit).
  // There is no DB unique constraint (no schema change in this phase), so this
  // precheck is the guard; it makes replaying a prior signature a no-op.
  const dupRes = await supabase
    .from("payments")
    .select("id")
    .eq("tx_signature", input.txSignature)
    .maybeSingle();

  if (dupRes.error) return dbError<PaymentReceipt>(dupRes.error);
  if (dupRes.data) {
    return {
      ok: false,
      error: "This transaction has already been submitted.",
      code: "VALIDATION",
    };
  }

  // 1) Record the in-flight payment as pending with its signature.
  const { data: pending, error: pendErr } = await supabase
    .from("payments")
    .insert({
      payment_link_id: link.id,
      payer_wallet: input.payerWallet,
      amount,
      currency: link.currency,
      status: "pending",
      network: link.network,
      tx_signature: input.txSignature,
      metadata: { simulated: false },
    })
    .select("*")
    .single();

  if (pendErr) return dbError<PaymentReceipt>(pendErr);
  const payment = pending as Payment;

  const markFailed = async (reason: string | null) => {
    await supabase
      .from("payments")
      .update({
        status: "failed",
        metadata: { simulated: false, reason },
      })
      .eq("id", payment.id);
  };

  // 2) Verify the transfer on-chain (Helius RPC, server-side), bound to the
  // paying wallet. verifySolTransfer never throws, but guard regardless so an
  // unexpected error transitions the pending row to failed instead of stranding
  // it.
  let verification;
  try {
    verification = await verifySolTransfer({
      signature: input.txSignature,
      toAddress: link.merchant_wallet,
      fromAddress: input.payerWallet,
      minLamports: amountLamports,
    });
  } catch {
    await markFailed("Verification failed unexpectedly");
    return {
      ok: false,
      error: "The payment could not be verified on-chain.",
      code: "PAYMENT_FAILED",
    };
  }

  if (verification.status === "failed") {
    await markFailed(verification.reason ?? null);
    return {
      ok: false,
      error:
        verification.reason ?? "The payment could not be verified on-chain.",
      code: "PAYMENT_FAILED",
    };
  }

  // The RPC could not yet see the transaction. Do NOT mark the link paid on an
  // unverified signature — keep the payment pending and ask the caller to
  // retry once the cluster has propagated the transaction.
  if (verification.status !== "confirmed") {
    return {
      ok: false,
      error:
        "Your transaction was sent but is not yet confirmed on-chain. Please retry in a moment.",
      code: "PAYMENT_PENDING",
    };
  }

  const now = new Date().toISOString();
  const blockTimeIso =
    verification.blockTime != null
      ? new Date(verification.blockTime * 1000).toISOString()
      : now;

  // 3) Promote payment to confirmed.
  const { data: confirmed, error: confErr } = await supabase
    .from("payments")
    .update({
      status: "confirmed",
      confirmed_at: blockTimeIso,
      metadata: { simulated: false, serverVerified: true },
    })
    .eq("id", payment.id)
    .select("*")
    .single();

  if (confErr) return dbError<PaymentReceipt>(confErr);

  // 4) Write the on-chain transaction record. Not atomic with the steps above
  // (PostgREST has no multi-statement tx); fail-fast on error.
  const { error: txErr } = await supabase.from("transactions").insert({
    payment_id: payment.id,
    payment_link_id: link.id,
    merchant_wallet: link.merchant_wallet,
    consumer_wallet_address: input.payerWallet,
    amount_lamports: verification.lamportsReceived ?? amountLamports,
    currency: link.currency,
    status: "confirmed",
    transaction_type: "payment",
    solana_signature: input.txSignature,
    slot: verification.slot,
    block_time: blockTimeIso,
    network: link.network,
    metadata: { simulated: false, serverVerified: true },
  });

  if (txErr) return dbError<PaymentReceipt>(txErr);

  // 5) Mark the link paid. Conditional on the link still being active so two
  // concurrent confirmations can't both claim it; if another payment already
  // claimed it, fall back to the current link state for the receipt.
  const { data: claimedLink, error: linkErr } = await supabase
    .from("payment_links")
    .update({ status: "paid", updated_at: now })
    .eq("id", link.id)
    .eq("status", "active")
    .select("*")
    .maybeSingle();

  if (linkErr) return dbError<PaymentReceipt>(linkErr);

  let receiptLink = claimedLink as PaymentLink | null;
  if (!receiptLink) {
    const refetch = await supabase
      .from("payment_links")
      .select("*")
      .eq("id", link.id)
      .maybeSingle();
    receiptLink = (refetch.data as PaymentLink | null) ?? link;
  }

  return {
    ok: true,
    data: {
      payment: (confirmed ?? payment) as Payment,
      link: receiptLink,
    },
  };
}

/**
 * Lists all payments destined for a merchant wallet (newest first), with the
 * originating link's display fields embedded for the dashboard history view.
 */
export async function listPaymentsForMerchant(
  merchantWallet: string
): Promise<ActionResult<MerchantPayment[]>> {
  if (!merchantWallet) return { ok: true, data: [] };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, payment_links!inner(title, merchant_name, merchant_wallet, slug)"
    )
    .eq("payment_links.merchant_wallet", merchantWallet)
    .order("created_at", { ascending: false });

  if (error) return dbError<MerchantPayment[]>(error);
  return { ok: true, data: (data ?? []) as unknown as MerchantPayment[] };
}
