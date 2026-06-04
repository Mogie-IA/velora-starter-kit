import type { Metadata } from "next";
import { Navbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff] page-container py-16">
        <div className="max-w-3xl mx-auto space-y-10 animate-slide-up">

          {/* Header */}
          <div>
            <span className="text-label-sm text-[#797588] uppercase tracking-widest mb-3 block">
              Docs
            </span>
            <h1 className="text-headline-lg text-[#1a1b21] mb-2">Documentation</h1>
            <p className="text-body-lg text-[#484556]">
              Integration guides and API references for building with Velora.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {docSections.map((section) => (
              <Card key={section.title} hoverable={!!section.available}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="tx-icon flex-shrink-0">
                        <span>{section.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-[18px]">{section.title}</CardTitle>
                        <CardDescription className="mt-1">{section.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={section.available ? "success" : "secondary"}>
                      {section.available ? "Available" : section.phase}
                    </Badge>
                  </div>
                </CardHeader>
                {section.items && section.items.length > 0 && (
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-label-md text-[#484556]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5427e6] opacity-60 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

const docSections = [
  {
    icon: "🚀",
    title: "Getting Started",
    description: "Set up Velora and connect your first wallet on Devnet.",
    available: true,
    phase: "",
    items: [
      "Connect a Phantom or Solflare wallet",
      "Switch to Solana Devnet in wallet settings",
      "Airdrop test SOL from faucet.solana.com",
      "Explore the Merchant and Consumer portals",
    ],
  },
  {
    icon: "💳",
    title: "Payments API",
    description: "Accept SOL and USDC payments via Solana Pay.",
    available: false,
    phase: "Phase 1",
    items: [],
  },
  {
    icon: "🔄",
    title: "Subscriptions API",
    description: "Create recurring billing plans backed by on-chain transactions.",
    available: false,
    phase: "Phase 1",
    items: [],
  },
  {
    icon: "🛒",
    title: "Checkout SDK",
    description: "Embed the Velora checkout flow into any website or app.",
    available: false,
    phase: "Phase 2",
    items: [],
  },
  {
    icon: "⚡",
    title: "Helius Webhooks",
    description: "Real-time transaction notifications via Helius enhanced APIs.",
    available: false,
    phase: "Phase 3",
    items: [],
  },
];
