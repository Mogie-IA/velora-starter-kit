import type { Database } from "@/types/database";
import type { MerchantPayment } from "@/features/payments/types";

export type MerchantProfile =
  Database["public"]["Tables"]["merchant_profiles"]["Row"];

export type ActionErrorCode =
  | "DB_NOT_SETUP"
  | "NOT_FOUND"
  | "VALIDATION"
  | "UNKNOWN";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode };

/**
 * Wallet-bound profile write. `walletAddress` is the merchant identity anchor —
 * the connected wallet is both the row key and the receiving wallet for
 * payments. (See the Phase-1 hardening note in actions/merchant.ts.)
 */
export interface UpsertMerchantProfileInput {
  walletAddress: string;
  businessName: string;
  displayName?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  description?: string | null;
  supportEmail?: string | null;
}

/** Live merchant metrics aggregated from confirmed/pending payments + links. */
export interface MerchantStats {
  totalConfirmedRevenueSol: number;
  confirmedCount: number;
  pendingCount: number;
  failedCount: number;
  activeLinksCount: number;
  totalLinksCount: number;
  latestPayments: MerchantPayment[];
}
