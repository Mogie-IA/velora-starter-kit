export type UserRole = "merchant" | "consumer";

export interface WalletUser {
  id: string;
  walletAddress: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: UserRole | null;
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthState {
  user: WalletUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
}

export type AuthStep =
  | "idle"
  | "wallet_connected"
  | "signing"
  | "creating_account"
  | "role_selection"
  | "complete";

export interface StoredSession {
  walletAddress: string;
  userId: string;
  role: UserRole | null;
  signedAt: number;
  expiresAt: number;
}
