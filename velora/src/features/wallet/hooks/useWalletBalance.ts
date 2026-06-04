"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { lamportsToSol } from "@/lib/solana/config";

interface WalletBalance {
  lamports: number;
  sol: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWalletBalance(): WalletBalance {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [lamports, setLamports] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setLamports(0);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const balance = await connection.getBalance(publicKey);
      setLamports(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, connected]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    lamports,
    sol: lamportsToSol(lamports),
    isLoading,
    error,
    refresh: fetchBalance,
  };
}
