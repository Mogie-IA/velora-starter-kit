import type { Currency } from "./types";

/** Trim trailing zeros while keeping up to 9 decimals (SOL precision). */
function trimAmount(amount: number): string {
  return amount
    .toFixed(9)
    .replace(/\.?0+$/, "")
    .replace(/\.$/, "");
}

export function formatAmount(amount: number, currency: Currency): string {
  const value = trimAmount(amount);
  return currency === "SOL" ? `◎ ${value}` : `${value} USDC`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
