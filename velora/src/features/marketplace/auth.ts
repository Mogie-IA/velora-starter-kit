import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

/**
 * Proof that a request really comes from the wallet it claims.
 *
 * The previous version of this codebase took a `walletAddress` string from the
 * browser and trusted it, which meant anyone could act as anyone by editing a
 * request. Every mutating action in the marketplace goes through
 * `requireWalletAuth` instead: the caller signs a short-lived message and the
 * server verifies the signature against the public key before touching data.
 */

export interface WalletProof {
  walletAddress: string;
  /** The exact message that was signed. */
  message: string;
  /** Detached signature bytes. */
  signature: number[];
}

/** How long a signed message stays valid. Short, to limit replay. */
const MAX_PROOF_AGE_MS = 5 * 60 * 1000;

/**
 * Builds the message a wallet must sign. Includes the action and a timestamp
 * so a signature captured for one action cannot be replayed for another.
 */
export function buildAuthMessage(action: string, issuedAt: number): string {
  return [
    "Velora marketplace",
    `Action: ${action}`,
    `Issued: ${new Date(issuedAt).toISOString()}`,
    "Signing this proves you control this wallet. It does not move any funds.",
  ].join("\n");
}

export class WalletAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletAuthError";
  }
}

/**
 * Verifies a wallet proof for a given action. Throws on anything suspicious —
 * bad signature, wrong action, expired, or a malformed key.
 *
 * Returns the verified wallet address, which callers should use in place of
 * any address supplied separately by the client.
 */
export function requireWalletAuth(proof: WalletProof, expectedAction: string): string {
  const { walletAddress, message, signature } = proof;

  if (!walletAddress || !message || !Array.isArray(signature)) {
    throw new WalletAuthError("Missing wallet proof");
  }

  // The message must be the one we asked for, for this action specifically.
  if (!message.includes(`Action: ${expectedAction}`)) {
    throw new WalletAuthError("Signature was issued for a different action");
  }

  const issuedLine = message.split("\n").find((line) => line.startsWith("Issued: "));
  if (!issuedLine) {
    throw new WalletAuthError("Signed message is missing its timestamp");
  }

  const issuedAt = Date.parse(issuedLine.replace("Issued: ", "").trim());
  if (Number.isNaN(issuedAt)) {
    throw new WalletAuthError("Signed message has an unreadable timestamp");
  }

  const age = Date.now() - issuedAt;
  if (age > MAX_PROOF_AGE_MS || age < -60_000) {
    throw new WalletAuthError("Signature has expired, please try again");
  }

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = new PublicKey(walletAddress).toBytes();
  } catch {
    throw new WalletAuthError("Not a valid Solana address");
  }

  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(message),
    new Uint8Array(signature),
    publicKeyBytes
  );

  if (!verified) {
    throw new WalletAuthError("Signature does not match this wallet");
  }

  return walletAddress;
}
