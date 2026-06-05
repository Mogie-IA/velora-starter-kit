import { lamportsToSol } from "@/lib/solana/config";

/** Returns the trimmed URL only when it uses a safe http(s) scheme, else null. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const protocol = new URL(trimmed).protocol;
    return protocol === "http:" || protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatSolAmount(lamports: number): string {
  const sol = lamportsToSol(lamports);
  if (sol < 0.001) return `◎ <0.001`;
  if (sol < 1) return `◎ ${sol.toFixed(4)}`;
  return `◎ ${sol.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatWalletAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
