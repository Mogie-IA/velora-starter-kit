export interface Consumer {
  id: string;
  walletAddress: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}
