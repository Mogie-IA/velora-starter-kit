"use server";

import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/types/auth";

export interface AuthResult {
  userId: string;
  role: UserRole | null;
  isNew: boolean;
}

function makeLocalId(walletAddress: string): string {
  return `local_${walletAddress.slice(0, 16)}`;
}

export async function authenticateWallet(
  walletAddress: string,
  message: string,
  signature: number[]
): Promise<AuthResult | null> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(signature);
    const publicKeyBytes = new PublicKey(walletAddress).toBytes();

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      console.error("[Velora Auth] Signature verification failed for", walletAddress);
      return null;
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data: existing, error: fetchError } = await supabase
      .from("users")
      .select("id, is_merchant")
      .eq("primary_wallet_address", walletAddress)
      .maybeSingle();

    if (fetchError) {
      console.error("[Velora Auth] DB fetch error:", fetchError.message);
      return { userId: makeLocalId(walletAddress), role: null, isNew: true };
    }

    if (existing) {
      await supabase
        .from("users")
        .update({ updated_at: now })
        .eq("id", existing.id);

      const role: UserRole = existing.is_merchant ? "merchant" : "consumer";
      return { userId: existing.id, role, isNew: false };
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        primary_wallet_address: walletAddress,
        is_merchant: false,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (insertError || !newUser) {
      console.error("[Velora Auth] DB insert error:", insertError?.message);
      return { userId: makeLocalId(walletAddress), role: null, isNew: true };
    }

    return { userId: newUser.id, role: null, isNew: true };
  } catch (err) {
    console.error("[Velora Auth] Unexpected error:", err);
    return { userId: makeLocalId(walletAddress), role: null, isNew: true };
  }
}

export async function updateUserRole(
  userId: string,
  walletAddress: string,
  role: UserRole
): Promise<boolean> {
  if (userId.startsWith("local_")) return true;

  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update({ is_merchant: role === "merchant", updated_at: now })
      .eq("id", userId);

    if (error) {
      console.error("[Velora Auth] Role update error:", error.message);
      return false;
    }

    await supabase.from("wallets").insert({
      user_id: userId,
      address: walletAddress,
      wallet_type: "phantom",
      is_primary: true,
      last_connected_at: now,
    });

    return true;
  } catch (err) {
    console.error("[Velora Auth] Role update exception:", err);
    return false;
  }
}
