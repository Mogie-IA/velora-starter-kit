import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Velora — Wallet-Native Commerce on Solana",
    template: "%s | Velora",
  },
  description:
    "Velora is a wallet-native commerce platform for Solana. Accept payments, manage subscriptions, and build commerce flows — entirely on-chain.",
  keywords: ["Solana", "Web3", "payments", "subscriptions", "blockchain", "commerce"],
  authors: [{ name: "Velora" }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#5427e6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#faf8ff] text-[#1a1b21]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
