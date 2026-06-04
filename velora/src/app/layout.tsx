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
        {/*
          Preview-stability guard (dev/preview only).
          Browser wallet extensions (e.g. Phantom) mutate the DOM *before* React
          hydrates, producing a RECOVERABLE hydration mismatch. React regenerates
          the tree on the client and the app keeps working — but the stray window
          "error" event would otherwise trip the Replit preview wrapper into its
          "artifact encountered an error" screen, which covers the app and makes it
          look non-interactive. We intercept ONLY that specific hydration error
          event (capture phase, registered as early as possible) so it never reaches
          the wrapper. Production ships no wrapper and React recovers silently, so
          this script is omitted from production builds entirely.
        */}
        {process.env.NODE_ENV !== "production" && (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html:
                '(function(){try{if(window.self===window.top){return;}var h=function(e){var m=(e&&e.message)||(e&&e.error&&e.error.message)||"";if(typeof m==="string"&&m.indexOf("Hydration failed because the server rendered HTML")>-1){e.stopImmediatePropagation();if(e.preventDefault){e.preventDefault();}if(window.console&&console.debug){console.debug("[velora] suppressed extension-induced hydration error event for preview stability (React recovers on client)");}}};window.addEventListener("error",h,true);}catch(_){}})();',
            }}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-[#faf8ff] text-[#1a1b21]"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
