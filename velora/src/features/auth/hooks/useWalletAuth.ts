"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

/**
 * Phase 0: Auth-ready hook structure.
 * Actual wallet sign-in (challenge/signature flow) is implemented in Phase 1.
 * This hook exposes the interface and wallet connection state.
 */
export function useWalletAuth(): UseWalletAuthReturn {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [user, setUser] = useState<WalletUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = publicKey?.toBase58() ?? null;

  // Sync wallet connection state
  useEffect(() => {
    if (!connected || !walletAddress) {
      setUser(null);
      return;
    }
    // Phase 1: fetch/create user record from Supabase here
    // For Phase 0, we expose the wallet address only
  }, [connected, walletAddress]);

  const signIn = useCallback(async () => {
    if (!connected || !walletAddress) {
      setError("No wallet connected");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Phase 1: Sign a challenge message and authenticate with Supabase
      const supabase = createClient();
      type UserRow = {
        id: string;
        primary_wallet_address: string | null;
        display_name: string | null;
        avatar_url: string | null;
        email: string | null;
        is_merchant: boolean;
        created_at: string;
      };

      const { data: existingUser } = await supabase
        .from("users")
        .select("id, primary_wallet_address, display_name, avatar_url, email, is_merchant, created_at")
        .eq("primary_wallet_address", walletAddress)
        .single() as { data: UserRow | null; error: unknown };

      if (existingUser) {
        setUser({
          id: existingUser.id,
          walletAddress: existingUser.primary_wallet_address ?? walletAddress,
          displayName: existingUser.display_name,
          avatarUrl: existingUser.avatar_url,
          email: existingUser.email,
          isMerchant: existingUser.is_merchant,
          createdAt: existingUser.created_at,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [connected, walletAddress]);

  const signOut = useCallback(async () => {
    setUser(null);
    await disconnect();
  }, [disconnect]);

  return {
    user,
    isLoading: isLoading || connecting,
    isAuthenticated: !!user,
    walletAddress,
    signIn,
    signOut,
    error,
  };
}
