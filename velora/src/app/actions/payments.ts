"use server";

import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { createPaymentLinkSchema } from "@/features/payments/schemas";
import { effectiveStatus } from "@/features/payments/status";
import { SOLANA_NETWORK, solToLamports } from "@/lib/solana/config";
import type {
  ActionResult,
  CreatePaymentLinkInput,
  PaymentLink,
  Payment,
  PaymentReceipt,
  RecordPaymentInput,
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
 * Phase 2 foundation: records a (simulated, Devnet) payment plus an on-chain
 * transaction placeholder, and marks the link paid. No real funds move; the
 * checkout UI clearly labels this as a test transaction.
 */
export async function recordPayment(
  input: RecordPaymentInput
): Promise<ActionResult<PaymentReceipt>> {
  if (!input.payerWallet) {
    return {
      ok: false,
      error: "Connect a wallet to complete payment.",
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

  const now = new Date().toISOString();
  const simulated = input.simulated ?? true;
  const amount = Number(link.amount);
  const amountLamports = link.currency === "SOL" ? solToLamports(amount) : null;

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      payment_link_id: link.id,
      payer_wallet: input.payerWallet,
      amount,
      currency: link.currency,
      status: "confirmed",
      network: link.network,
      tx_signature: input.txSignature ?? null,
      confirmed_at: now,
      metadata: { simulated },
    })
    .select("*")
    .single();

  if (payErr) return dbError<PaymentReceipt>(payErr);

  // On-chain transaction placeholder record (Phase 2 foundation).
  // Errors are propagated (fail-fast) rather than silently ignored. Note: this
  // is not a single DB transaction (PostgREST has no multi-statement tx), so a
  // failure here can leave a confirmed payment without its transaction row —
  // acceptable for the Phase 2 simulated foundation, hardened in a later phase.
  const { error: txErr } = await supabase.from("transactions").insert({
    payment_id: (payment as Payment).id,
    payment_link_id: link.id,
    merchant_wallet: link.merchant_wallet,
    consumer_wallet_address: input.payerWallet,
    amount_lamports: amountLamports,
    currency: link.currency,
    status: "confirmed",
    transaction_type: "payment",
    solana_signature: input.txSignature ?? null,
    block_time: now,
    network: link.network,
    metadata: { simulated },
  });

  if (txErr) return dbError<PaymentReceipt>(txErr);

  const { data: updatedLink, error: linkErr } = await supabase
    .from("payment_links")
    .update({ status: "paid", updated_at: now })
    .eq("id", link.id)
    .select("*")
    .single();

  if (linkErr) return dbError<PaymentReceipt>(linkErr);

  return {
    ok: true,
    data: {
      payment: payment as Payment,
      link: (updatedLink ?? link) as PaymentLink,
    },
  };
}
