import "server-only";
import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_NETWORK, SOLANA_RPC_URL } from "./config";

/**
 * Server-side Solana connection.
 *
 * Uses NEXT_PUBLIC_SOLANA_RPC_URL (the SAME endpoint the client signs and
 * confirms against) whenever it is set, so a transaction the client confirmed is
 * guaranteed to be visible to server verification — they hit the identical RPC
 * and cluster. The standalone HELIUS_API_KEY secret is only a fallback for when
 * no explicit RPC URL is configured; preferring it previously caused every
 * verification to fail with `401 Invalid API key` (the key did not match the one
 * embedded in NEXT_PUBLIC_SOLANA_RPC_URL), leaving payments stuck "pending".
 */
function getServerConnection(): Connection {
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    return new Connection(SOLANA_RPC_URL, "confirmed");
  }
  const heliusKey = process.env.HELIUS_API_KEY;
  if (heliusKey) {
    const cluster = SOLANA_NETWORK === "mainnet-beta" ? "mainnet" : "devnet";
    return new Connection(
      `https://${cluster}.helius-rpc.com/?api-key=${heliusKey}`,
      "confirmed"
    );
  }
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export type VerifyStatus = "confirmed" | "failed" | "pending";

export interface VerifyResult {
  status: VerifyStatus;
  slot: number | null;
  blockTime: number | null;
  lamportsReceived: number | null;
  reason?: string;
}

export interface VerifySolTransferArgs {
  signature: string;
  toAddress: string;
  /**
   * The wallet that is expected to have sent the funds. When provided, the
   * transfer is only accepted if this account is present in the transaction and
   * its balance decreased by at least `minLamports` — this binds the signature
   * to the paying wallet and prevents attributing an unrelated transfer.
   */
  fromAddress?: string;
  /** Minimum lamports the recipient must have received. */
  minLamports: number;
  /** Number of poll attempts before giving up (default 6). */
  attempts?: number;
  /** Delay between attempts in ms (default 1500). */
  delayMs?: number;
}

function indexOfKey(
  keys: { length: number; get: (i: number) => PublicKey | undefined },
  target: PublicKey
): number {
  for (let i = 0; i < keys.length; i++) {
    if (keys.get(i)?.equals(target)) return i;
  }
  return -1;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Verifies a SOL transfer on-chain by signature:
 *  - the transaction exists and has no execution error
 *  - the recipient's balance increased by at least `minLamports`
 *
 * Returns `pending` if the transaction is not yet visible to the RPC after all
 * retry attempts (the caller decides how to treat an unverified-but-sent tx).
 */
export async function verifySolTransfer({
  signature,
  toAddress,
  fromAddress,
  minLamports,
  attempts = 10,
  delayMs = 1500,
}: VerifySolTransferArgs): Promise<VerifyResult> {
  const connection = getServerConnection();
  const cluster = SOLANA_NETWORK === "mainnet-beta" ? "mainnet" : "devnet";
  console.log(
    `[velora] verifySolTransfer start sig=${signature.slice(0, 12)}… cluster=${cluster} endpoint=${connection.rpcEndpoint.replace(/(api-key=)[^&]+/i, "$1***")}`
  );

  let recipient: PublicKey;
  try {
    recipient = new PublicKey(toAddress);
  } catch {
    return {
      status: "failed",
      slot: null,
      blockTime: null,
      lamportsReceived: null,
      reason: "Invalid recipient address",
    };
  }

  let sender: PublicKey | null = null;
  if (fromAddress) {
    try {
      sender = new PublicKey(fromAddress);
    } catch {
      return {
        status: "failed",
        slot: null,
        blockTime: null,
        lamportsReceived: null,
        reason: "Invalid payer address",
      };
    }
  }

  // Phase 1 — confirm the signature reached the chain. getSignatureStatuses
  // reflects "confirmed" almost immediately (and well before getTransaction can
  // serve the full record), so this is the fast, reliable confirmation gate.
  // searchTransactionHistory lets the RPC look past its recent-status cache.
  let confirmedOnChain = false;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const { value } = await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });
      const info = value[0];
      if (info) {
        if (info.err) {
          console.log(
            `[velora] verifySolTransfer reverted sig=${signature.slice(0, 12)}…`
          );
          return {
            status: "failed",
            slot: info.slot ?? null,
            blockTime: null,
            lamportsReceived: null,
            reason: "Transaction reverted on-chain",
          };
        }
        const cs = info.confirmationStatus;
        if (cs === "confirmed" || cs === "finalized") {
          confirmedOnChain = true;
          console.log(
            `[velora] verifySolTransfer confirmed via status (attempt ${attempt + 1}, ${cs})`
          );
          break;
        }
      }
    } catch (e) {
      // Surface RPC errors (e.g. 401 invalid key) instead of silently masking
      // them as "pending" — a persistent error here means misconfiguration.
      console.log(
        `[velora] verifySolTransfer getSignatureStatuses RPC error (attempt ${attempt + 1}): ${e instanceof Error ? e.message : String(e)}`
      );
    }
    if (attempt < attempts - 1) await sleep(delayMs);
  }

  if (!confirmedOnChain) {
    console.log(
      `[velora] verifySolTransfer still pending after status polling sig=${signature.slice(0, 12)}…`
    );
    return {
      status: "pending",
      slot: null,
      blockTime: null,
      lamportsReceived: null,
      reason: "Transaction not yet confirmed by the RPC",
    };
  }

  // Phase 2 — fetch the full transaction for the balance/payer checks.
  // getTransaction lags behind confirmation, so retry generously now that we
  // know the signature is confirmed and not reverted.
  for (let attempt = 0; attempt < attempts; attempt++) {
    let tx;
    try {
      tx = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
    } catch (e) {
      console.log(
        `[velora] verifySolTransfer getTransaction RPC error (attempt ${attempt + 1}): ${e instanceof Error ? e.message : String(e)}`
      );
      if (attempt < attempts - 1) await sleep(delayMs);
      continue;
    }

    if (!tx || !tx.meta) {
      if (attempt < attempts - 1) await sleep(delayMs);
      continue;
    }

    if (tx.meta.err) {
      return {
        status: "failed",
        slot: tx.slot ?? null,
        blockTime: tx.blockTime ?? null,
        lamportsReceived: null,
        reason: "Transaction reverted on-chain",
      };
    }

    const keys = tx.transaction.message.getAccountKeys();
    const index = indexOfKey(keys, recipient);

    if (index === -1) {
      return {
        status: "failed",
        slot: tx.slot ?? null,
        blockTime: tx.blockTime ?? null,
        lamportsReceived: null,
        reason: "Recipient not found in transaction",
      };
    }

    // Bind the transfer to the expected payer: the wallet must be present and
    // must have spent at least the requested amount (it also pays the fee).
    if (sender) {
      const senderIdx = indexOfKey(keys, sender);
      if (senderIdx === -1) {
        return {
          status: "failed",
          slot: tx.slot ?? null,
          blockTime: tx.blockTime ?? null,
          lamportsReceived: null,
          reason: "Payer wallet did not send this transaction",
        };
      }
      const spent =
        tx.meta.preBalances[senderIdx] - tx.meta.postBalances[senderIdx];
      if (spent < minLamports) {
        return {
          status: "failed",
          slot: tx.slot ?? null,
          blockTime: tx.blockTime ?? null,
          lamportsReceived: null,
          reason: "Payer wallet did not send the requested amount",
        };
      }
    }

    const received = tx.meta.postBalances[index] - tx.meta.preBalances[index];

    if (received < minLamports) {
      return {
        status: "failed",
        slot: tx.slot ?? null,
        blockTime: tx.blockTime ?? null,
        lamportsReceived: received,
        reason: "Transferred amount is less than the requested amount",
      };
    }

    return {
      status: "confirmed",
      slot: tx.slot ?? null,
      blockTime: tx.blockTime ?? null,
      lamportsReceived: received,
    };
  }

  // Confirmed on-chain (Phase 1) but the full record never became available for
  // the balance checks within the retry budget. Keep it retriable rather than
  // settling a transfer whose amount/payer we could not verify.
  console.log(
    `[velora] verifySolTransfer confirmed but details unavailable sig=${signature.slice(0, 12)}…`
  );
  return {
    status: "pending",
    slot: null,
    blockTime: null,
    lamportsReceived: null,
    reason: "Transaction confirmed on-chain but details are not yet available",
  };
}
