import type { Database } from "@/types/database";

export type PaymentLink = Database["public"]["Tables"]["payment_links"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentLinkStatus = PaymentLink["status"];
export type Currency = PaymentLink["currency"];

export type ActionErrorCode =
  | "DB_NOT_SETUP"
  | "NOT_FOUND"
  | "VALIDATION"
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

export interface RecordPaymentInput {
  slug: string;
  payerWallet: string;
  txSignature?: string | null;
  simulated?: boolean;
}

export interface PaymentReceipt {
  payment: Payment;
  link: PaymentLink;
}
