export type TransactionStatus = "pending" | "confirmed" | "failed" | "refunded";
export type TransactionType = "payment" | "subscription" | "refund";

export interface Transaction {
  id: string;
  merchantId: string;
  consumerWalletAddress: string;
  productId: string | null;
  subscriptionId: string | null;
  amountLamports: number;
  currency: string;
  status: TransactionStatus;
  transactionType: TransactionType;
  solanaSignature: string | null;
  blockTime: string | null;
  slot: number | null;
  createdAt: string;
  updatedAt: string;
}
