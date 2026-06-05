"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { merchantProfileSchema } from "@/features/merchant/schemas";
import { effectiveStatus } from "@/features/payments/status";
import { isValidSolanaAddress } from "@/lib/solana/config";
import type {
  ActionResult,
  MerchantProfile,
  MerchantStats,
  UpsertMerchantProfileInput,
} from "@/features/merchant/types";
import type { MerchantPayment, PaymentLink } from "@/features/payments/types";

const DB_NOT_SETUP =
  "Database not set up. Run the Phase 4 migration (velora/supabase/migrations/0002_phase4_merchant_profiles.sql) in your Supabase SQL editor.";

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

/**
 * Reads the merchant profile for a wallet. Returns `null` data when no profile
 * exists yet (used to drive onboarding) — that is a success, not an error.
 */
export async function getMerchantProfile(
  walletAddress: string
): Promise<ActionResult<MerchantProfile | null>> {
  if (!walletAddress) return { ok: true, data: null };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("merchant_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (error) return dbError<MerchantProfile | null>(error);
  return { ok: true, data: (data as MerchantProfile | null) ?? null };
}

/**
 * Creates or updates the merchant profile for the connected wallet.
 *
 * SECURITY (Phase-1 hardening item): `walletAddress` is client-supplied and the
 * service role bypasses RLS, so this trusts the caller's wallet. There is no
 * server session yet (wallet sign-in challenge/signature is Phase 1). The UI
 * only ever edits the *connected* wallet's own profile. When Phase 1 lands,
 * derive caller identity server-side and enforce ownership here — do NOT trust
 * a client-provided wallet address.
 */
export async function upsertMerchantProfile(
  input: UpsertMerchantProfileInput
): Promise<ActionResult<MerchantProfile>> {
  if (!input.walletAddress || !isValidSolanaAddress(input.walletAddress)) {
    return {
      ok: false,
      error: "A connected, valid merchant wallet is required.",
      code: "VALIDATION",
    };
  }

  const parsed = merchantProfileSchema.safeParse({
    businessName: input.businessName,
    displayName: input.displayName ?? "",
    description: input.description ?? "",
    website: input.website ?? "",
    supportEmail: input.supportEmail ?? "",
    logoUrl: input.logoUrl ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  const v = parsed.data;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("merchant_profiles")
    .upsert(
      {
        wallet_address: input.walletAddress,
        business_name: v.businessName,
        display_name: v.displayName ? v.displayName : null,
        description: v.description ? v.description : null,
        website: v.website ? v.website : null,
        support_email: v.supportEmail ? v.supportEmail : null,
        logo_url: v.logoUrl ? v.logoUrl : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    )
    .select("*")
    .single();

  if (error) return dbError<MerchantProfile>(error);
  return { ok: true, data: data as MerchantProfile };
}

/**
 * Aggregates live dashboard metrics for a merchant wallet from the Phase 2/3
 * payment tables: confirmed revenue (SOL), confirmed/pending/failed counts,
 * active link count, and the latest payments. These tables are independent of
 * `merchant_profiles`, so the dashboard works even before the Phase 4 migration
 * has been applied.
 */
export async function getMerchantDashboardStats(
  walletAddress: string
): Promise<ActionResult<MerchantStats>> {
  const empty: MerchantStats = {
    totalConfirmedRevenueSol: 0,
    confirmedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    activeLinksCount: 0,
    totalLinksCount: 0,
    latestPayments: [],
  };

  if (!walletAddress) return { ok: true, data: empty };

  const supabase = createServiceClient();

  const [paymentsRes, linksRes] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "*, payment_links!inner(title, merchant_name, merchant_wallet, slug)"
      )
      .eq("payment_links.merchant_wallet", walletAddress)
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_wallet", walletAddress),
  ]);

  if (paymentsRes.error) return dbError<MerchantStats>(paymentsRes.error);
  if (linksRes.error) return dbError<MerchantStats>(linksRes.error);

  const payments = (paymentsRes.data ?? []) as unknown as MerchantPayment[];
  const links = (linksRes.data ?? []) as PaymentLink[];

  let totalConfirmedRevenueSol = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const p of payments) {
    if (p.status === "confirmed") {
      confirmedCount += 1;
      if (p.currency === "SOL") {
        totalConfirmedRevenueSol += Number(p.amount);
      }
    } else if (p.status === "pending") {
      pendingCount += 1;
    } else if (p.status === "failed") {
      failedCount += 1;
    }
  }

  const activeLinksCount = links.filter(
    (l) => effectiveStatus(l) === "active"
  ).length;

  return {
    ok: true,
    data: {
      totalConfirmedRevenueSol,
      confirmedCount,
      pendingCount,
      failedCount,
      activeLinksCount,
      totalLinksCount: links.length,
      latestPayments: payments.slice(0, 5),
    },
  };
}
