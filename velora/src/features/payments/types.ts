import type { Database } from "@/types/database";

export type PaymentLink = Database["public"]["Tables"]["payment_links"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentLinkStatus = PaymentLink["status"];
export type PaymentStatus = Payment["status"];
export type Currency = PaymentLink["currency"];

export type ActionErrorCode =
  | "DB_NOT_SETUP"
  | "NOT_FOUND"
  | "VALIDATION"
  | "PAYMENT_FAILED"
  | "PAYMENT_PENDING"
  | "UNKNOWN";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode };

export interface CreatePaymentLinkInput {
  title: string;
  description?: string | null;
  amount: number;
  currency: Currency;
  customerContact?: string | null;
  expiresAt?: string | null;
  saveAsDraft?: boolean;
  merchantWallet: string;
  merchantName: string;
  merchantUserId?: string | null;
}

/**
 * Submitted by the checkout client after the user's wallet has sent and
 * confirmed a real Devnet transfer. The server independently verifies the
 * signature on-chain before recording the payment as confirmed.
 */
export interface SubmitPaymentInput {
  slug: string;
  payerWallet: string;
  txSignature: string;
}

export interface PaymentReceipt {
  payment: Payment;
  link: PaymentLink;
}

/** A merchant's payment with the originating link's display fields embedded. */
export type MerchantPayment = Payment & {
  payment_links:
    | Pick<PaymentLink, "title" | "merchant_name" | "merchant_wallet" | "slug">
    | null;
};
