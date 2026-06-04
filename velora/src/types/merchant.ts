export interface Merchant {
  id: string;
  userId: string;
  walletAddress: string;
  businessName: string;
  businessDescription: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantStats {
  totalRevenueLamports: number;
  totalTransactions: number;
  activeSubscriptions: number;
  totalProducts: number;
  revenueChange30d: number;
  transactionChange30d: number;
}
