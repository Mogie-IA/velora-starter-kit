export interface WalletUser {
  id: string;
  walletAddress: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  isMerchant: boolean;
  createdAt: string;
}

export interface AuthState {
  user: WalletUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
}
