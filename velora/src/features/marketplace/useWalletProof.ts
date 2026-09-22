"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { buildAuthMessage, type WalletProof } from "./auth";

/**
 * Produces the signed proof every mutating server action requires.
 *
 * The user signs a short, readable message naming the action. It never
 * authorises a transfer — signing this cannot move funds — which is worth
 * saying in the message itself so people are not trained to approve blindly.
 */
export function useWalletProof() {
  const { publicKey, signMessage } = useWallet();

  const createProof = useCallback(
    async (action: string): Promise<WalletProof> => {
      if (!publicKey) {
        throw new Error("Connect your wallet first");
      }
      if (!signMessage) {
        throw new Error("This wallet cannot sign messages. Try Phantom or Solflare.");
      }

      const message = buildAuthMessage(action, Date.now());
      const signature = await signMessage(new TextEncoder().encode(message));

      return {
        walletAddress: publicKey.toBase58(),
        message,
        signature: Array.from(signature),
      };
    },
    [publicKey, signMessage]
  );

  return { createProof, walletAddress: publicKey?.toBase58() ?? null };
}
