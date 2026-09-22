"use client";

import dynamic from "next/dynamic";

/**
 * The wallet adapter's button reads `window` on mount, so it has to stay out
 * of the server render. Loading it dynamically avoids the hydration mismatch
 * that bit the earlier version of this app.
 */
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false, loading: () => <div className="h-10 w-36 rounded-[12px] bg-surface-container" /> }
);

export function WalletButton() {
  return <WalletMultiButtonDynamic />;
}
