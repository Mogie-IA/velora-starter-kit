import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly kind:
      | "invalid_recipient"
      | "rejected"
      | "send_failed"
      | "confirm_failed" = "send_failed"
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export interface SendSolPaymentArgs {
  connection: Connection;
  payer: PublicKey;
  sendTransaction: WalletContextState["sendTransaction"];
  toAddress: string;
  lamports: number;
}

/**
 * Builds, sends, and confirms a native SOL transfer on the connected cluster
 * (Devnet) using the user's wallet adapter. Returns the transaction signature.
 *
 * The transaction is signed inside the user's wallet (Phantom/Solflare) — no
 * private keys ever touch the app or server.
 */
export async function sendSolPayment({
  connection,
  payer,
  sendTransaction,
  toAddress,
  lamports,
}: SendSolPaymentArgs): Promise<string> {
  let recipient: PublicKey;
  try {
    recipient = new PublicKey(toAddress);
  } catch {
    throw new PaymentError(
      "The merchant wallet address is invalid.",
      "invalid_recipient"
    );
  }

  if (!Number.isFinite(lamports) || lamports <= 0) {
    throw new PaymentError("The payment amount is invalid.", "send_failed");
  }

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: payer,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient,
      lamports,
    })
  );

  let signature: string;
  try {
    console.log(
      `[velora] sendTransaction → endpoint=${connection.rpcEndpoint.replace(/(api-key=)[^&]+/i, "$1***")} payer=${payer.toBase58().slice(0, 6)}… lamports=${lamports}`
    );
    signature = await sendTransaction(transaction, connection);
    console.log(`[velora] sendTransaction returned signature=${signature}`);
    if (!signature) {
      throw new PaymentError(
        "The wallet did not return a transaction signature.",
        "send_failed"
      );
    }
  } catch (err) {
    if (err instanceof PaymentError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (/reject|denied|cancel/i.test(message)) {
      throw new PaymentError(
        "You declined the transaction in your wallet.",
        "rejected"
      );
    }
    throw new PaymentError(
      message || "Failed to send the transaction.",
      "send_failed"
    );
  }

  try {
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );
    if (confirmation.value.err) {
      throw new PaymentError(
        "The transaction failed to confirm on-chain.",
        "confirm_failed"
      );
    }
  } catch (err) {
    if (err instanceof PaymentError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new PaymentError(
      message || "Could not confirm the transaction.",
      "confirm_failed"
    );
  }

  return signature;
}
