export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";
export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface Subscription {
  id: string;
  merchantId: string;
  consumerWalletAddress: string;
  productId: string;
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  intervalCount: number;
  amountLamports: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
