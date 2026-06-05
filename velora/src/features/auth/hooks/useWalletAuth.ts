"use client";

import { useAuthContext } from "@/features/auth/context/AuthContext";
import type { WalletUser } from "@/types/auth";

interface UseWalletAuthReturn {
  user: WalletUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const {
    user,
    isLoading,
    isSigningIn,
    isAuthenticated,
    walletAddress,
    error,
    signIn,
    signOut,
  } = useAuthContext();

  return {
    user,
    isLoading: isLoading || isSigningIn,
    isAuthenticated,
    walletAddress,
    signIn,
    signOut,
    error,
  };
}
