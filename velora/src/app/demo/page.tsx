import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout";
import { LandingFooter } from "@/features/marketing/components/LandingFooter";

export const metadata: Metadata = {
  title: "Demo Guide",
  description: "Run the full Velora payment flow end to end on Solana Devnet.",
};

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff]">
        <div className="page-container py-14">
          <div className="max-w-3xl mx-auto space-y-10 animate-slide-up">
            {/* Header */}
            <div>
              <Link
                href="/"
                className="btn-ghost inline-flex items-center gap-2 -ml-4 mb-6 text-label-md"
              >
                ← Back to home
              </Link>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="chip chip-primary uppercase tracking-widest">
                  Demo
                </span>
                <span className="chip chip-warning">Devnet</span>
                <span className="chip chip-neutral">Test funds only</span>
              </div>
              <h1 className="text-headline-lg text-[#1a1b21] mb-3">
                Try Velora end to end
              </h1>
              <p className="text-body-lg text-[#484556]">
                Velora runs entirely on Solana Devnet. You&apos;ll never spend
                real money — Devnet SOL is free test currency. This guide walks
                you through the complete merchant-to-customer payment flow in a
                few minutes.
              </p>
            </div>

            {/* Prereqs */}
            <Block title="What you need">
              <ul className="space-y-2">
                {prereqs.map((p) => (
                  <Bullet key={p}>{p}</Bullet>
                ))}
              </ul>
            </Block>

            {/* Get Devnet SOL */}
            <Block title="1 · Get free Devnet SOL">
              <p className="text-body-md text-[#484556] mb-3">
                Switch your wallet to <strong>Devnet</strong> (Settings →
                Network), then fund it with free test SOL using either option:
              </p>
              <ul className="space-y-2">
                <Bullet>
                  Visit{" "}
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5427e6] font-medium"
                  >
                    faucet.solana.com
                  </a>
                  , paste your wallet address, and request an airdrop.
                </Bullet>
                <Bullet>
                  Or run <Code>solana airdrop 2 &lt;your-address&gt; --url devnet</Code>{" "}
                  from the Solana CLI.
                </Bullet>
              </ul>
              <Callout>
                Devnet SOL has no real value and only works on the Devnet
                network. Both merchant and customer wallets need a little Devnet
                SOL to cover transaction fees.
              </Callout>
            </Block>

            {/* Steps */}
            <Block title="2 · Run the full flow">
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-velora-gradient flex items-center justify-center text-white text-label-md font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-body-md font-semibold text-[#1a1b21]">
                        {s.title}
                      </p>
                      <p className="text-body-md text-[#484556] mt-0.5">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>

            {/* Receipts */}
            <Block title="3 · View receipts & history">
              <p className="text-body-md text-[#484556] mb-3">
                After a successful payment, the customer sees an on-chain receipt
                with the transaction signature — clickable through to the Solana
                Explorer. As the merchant, open your dashboard to see the payment
                reflected in revenue, counts, and history.
              </p>
              <ul className="space-y-2">
                <Bullet>
                  Receipt: amount, merchant, wallets, status, and a verifiable
                  Devnet transaction link.
                </Bullet>
                <Bullet>
                  Merchant dashboard: live revenue, payment counts, and recent
                  activity.
                </Bullet>
              </ul>
            </Block>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/get-started" className="btn-primary">
                Create an account
              </Link>
              <Link href="/docs" className="btn-secondary">
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="velora-card p-7">
      <h2 className="text-headline-md text-[#1a1b21] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-body-md text-[#484556]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#5427e6] opacity-60 flex-shrink-0 mt-2.5" />
      <span>{children}</span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-label-md bg-[#f4f3fb] text-[#5427e6] rounded-md px-1.5 py-0.5">
      {children}
    </code>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-[14px] bg-[#f4f3fb] border border-[#e8e7ef] px-4 py-3">
      <span className="w-2 h-2 rounded-full bg-[#007d51] flex-shrink-0 mt-1.5" />
      <p className="text-label-md text-[#484556]">{children}</p>
    </div>
  );
}

const prereqs = [
  "A Solana wallet — Phantom or Solflare (browser extension).",
  "Your wallet switched to the Devnet network.",
  "A little free Devnet SOL (see step 1).",
  "Optional: a second wallet to play the customer.",
];

const steps = [
  {
    title: "Connect your merchant wallet",
    body: "From the home page, choose Create Account → Merchant and connect your wallet. Your wallet address is your merchant identity.",
  },
  {
    title: "Complete your merchant profile",
    body: "Add your business name and upload a logo. Your branding appears on checkout and receipts.",
  },
  {
    title: "Create a payment link",
    body: "Give it a title and an amount in SOL. Velora generates a shareable checkout link.",
  },
  {
    title: "Open the checkout",
    body: "Open the payment link in a new tab (or share it). You'll see your branded checkout page with the amount.",
  },
  {
    title: "Connect a customer wallet",
    body: "Connect the paying wallet — this can be the same wallet or a second one with Devnet SOL.",
  },
  {
    title: "Pay with Devnet SOL",
    body: "Approve the transfer in your wallet. Velora verifies the transaction on-chain before confirming.",
  },
];
