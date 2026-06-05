import {
  clusterApiUrl,
  type Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) ?? "devnet";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(SOLANA_NETWORK);

export const MERCHANT_WALLET = process.env.NEXT_PUBLIC_MERCHANT_WALLET ?? "";

export const LAMPORTS = LAMPORTS_PER_SOL;

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function formatSol(lamports: number, decimals = 4): string {
  return `◎ ${lamportsToSol(lamports).toFixed(decimals)}`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Returns true if the string is a syntactically valid Solana public key. */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function createConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export const EXPLORER_BASE_URL =
  SOLANA_NETWORK === "mainnet-beta"
    ? "https://explorer.solana.com"
    : `https://explorer.solana.com?cluster=${SOLANA_NETWORK}`;

export function getExplorerTxUrl(signature: string): string {
  return `${EXPLORER_BASE_URL}/tx/${signature}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_BASE_URL}/address/${address}`;
}
