import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout";
import { LandingFooter } from "@/features/marketing/components/LandingFooter";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Overview, setup, Devnet testing, environment, limitations, and roadmap for Velora.",
};

export default function DocsPage() {
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
              <span className="text-label-sm text-[#797588] uppercase tracking-widest mb-3 block">
                Docs
              </span>
              <h1 className="text-headline-lg text-[#1a1b21] mb-2">
                Documentation
              </h1>
              <p className="text-body-lg text-[#484556]">
                What Velora is, how to set it up, and how to test the full
                payment flow on Solana Devnet.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href="/demo" className="chip chip-primary">
                  Demo guide →
                </Link>
                <span className="chip chip-warning">Devnet only</span>
              </div>
            </div>

            {/* Overview */}
            <Block title="Project overview">
              <p className="text-body-md text-[#484556]">
                Velora is wallet-native commerce infrastructure for Solana.
                Merchants accept payments, create payment links, and verify
                transactions on-chain — without a payment processor. The wallet
                is the account: there is no email or password. Velora currently
                runs on Solana Devnet using test funds only.
              </p>
            </Block>

            {/* Capabilities */}
            <Block title="What works today">
              <ul className="space-y-2">
                {capabilities.map((c) => (
                  <Bullet key={c}>{c}</Bullet>
                ))}
              </ul>
            </Block>

            {/* Environment setup */}
            <Block title="Environment setup">
              <p className="text-body-md text-[#484556] mb-3">
                Velora is a Next.js app. Configure these environment variables
                (see <Code>velora/.env.local.example</Code> for the full list).
                Never commit real secret values.
              </p>
              <ul className="space-y-2">
                {envVars.map((e) => (
                  <li key={e.name} className="flex flex-col gap-0.5">
                    <Code>{e.name}</Code>
                    <span className="text-label-md text-[#797588] pl-1">
                      {e.desc}
                    </span>
                  </li>
                ))}
              </ul>
              <Callout>
                Public values are prefixed <Code>NEXT_PUBLIC_</Code>. Server-only
                secrets (the Supabase secret key, session secret) must never be
                exposed to the browser or committed to source control.
              </Callout>
            </Block>

            {/* Supabase + storage */}
            <Block title="Supabase & storage setup">
              <p className="text-body-md text-[#484556] mb-3">
                Velora uses Supabase (PostgreSQL) for data and Supabase Storage
                for merchant logos.
              </p>
              <ul className="space-y-2">
                <Bullet>
                  Apply the SQL migrations in <Code>velora/supabase/migrations/</Code>{" "}
                  via the Supabase SQL Editor.
                </Bullet>
                <Bullet>
                  Create a <strong>public</strong> Storage bucket named{" "}
                  <Code>merchant-logos</Code> (allowed types: PNG, JPG, WEBP;
                  size limit 2 MB). Merchant logo uploads are stored here and
                  served by public URL.
                </Bullet>
                <Bullet>
                  Set the Supabase URL and keys in your environment as listed
                  above.
                </Bullet>
              </ul>
            </Block>

            {/* Devnet testing */}
            <Block title="Devnet testing guide">
              <p className="text-body-md text-[#484556] mb-3">
                Everything runs on Solana Devnet. To test payments:
              </p>
              <ul className="space-y-2">
                <Bullet>
                  Switch your wallet (Phantom / Solflare) to the Devnet network.
                </Bullet>
                <Bullet>
                  Get free test SOL from{" "}
                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5427e6] font-medium"
                  >
                    faucet.solana.com
                  </a>{" "}
                  or <Code>solana airdrop 2 &lt;address&gt; --url devnet</Code>.
                </Bullet>
                <Bullet>
                  Follow the{" "}
                  <Link href="/demo" className="text-[#5427e6] font-medium">
                    demo guide
                  </Link>{" "}
                  to run the full merchant-to-customer flow.
                </Bullet>
              </ul>
            </Block>

            {/* Limitations */}
            <Block title="Known MVP limitations">
              <ul className="space-y-2">
                {limitations.map((l) => (
                  <Bullet key={l}>{l}</Bullet>
                ))}
              </ul>
            </Block>

            {/* Roadmap */}
            <Block title="Phase roadmap">
              <ul className="space-y-2">
                {roadmap.map((r) => (
                  <li key={r.phase} className="flex items-start gap-3">
                    <span
                      className={`chip ${r.done ? "chip-success" : "chip-neutral"} flex-shrink-0`}
                    >
                      {r.done ? "Done" : "Planned"}
                    </span>
                    <span className="text-body-md text-[#1a1b21]">
                      <strong>{r.phase}.</strong> {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* Grant explanation */}
            <Block title="Why Velora matters for Solana">
              <p className="text-body-md text-[#484556] mb-3">
                Traditional payments route through processors that own the
                merchant relationship, hold funds, and charge fees. Velora makes
                the wallet the account — merchants accept payments directly,
                customers pay peer-to-peer, and every transaction is verified
                on-chain.
              </p>
              <ul className="space-y-2">
                {grantPoints.map((g) => (
                  <Bullet key={g}>{g}</Bullet>
                ))}
              </ul>
            </Block>
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

const capabilities = [
  "Wallet authentication (Phantom, Solflare) — wallet-native identity",
  "Merchant profiles with logo upload and branding",
  "Payment links with shareable, branded checkout",
  "Real Solana Devnet payments verified on-chain",
  "On-chain receipts with explorer links",
  "Merchant dashboard with revenue, counts, and history",
];

const envVars = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", desc: "Your Supabase project URL (public)." },
  {
    name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    desc: "Supabase publishable/anon key (public).",
  },
  {
    name: "SUPABASE_SECRET_KEY",
    desc: "Supabase service role key — server only, never exposed.",
  },
  { name: "SUPABASE_DB_URL", desc: "Postgres connection string — server only." },
  {
    name: "NEXT_PUBLIC_SOLANA_NETWORK",
    desc: "Solana cluster — set to devnet.",
  },
  {
    name: "NEXT_PUBLIC_SOLANA_RPC_URL",
    desc: "Solana RPC endpoint for the chosen cluster.",
  },
  {
    name: "NEXT_PUBLIC_MERCHANT_WALLET",
    desc: "Default merchant wallet for demos (optional).",
  },
  { name: "SESSION_SECRET", desc: "Server session secret — server only." },
];

const limitations = [
  "Devnet only — no mainnet support and no real funds.",
  "No server-side wallet session yet; merchant identity is the connected wallet (Phase-1 hardening item).",
  "No subscriptions, embedded wallets, or social sign-in.",
  "No public APIs or SDKs yet — these are on the roadmap.",
];

const roadmap = [
  { phase: "Phase 0", label: "Foundation & wallet-native identity", done: true },
  { phase: "Phase 1", label: "Wallet sign-in + real on-chain payments", done: true },
  { phase: "Phase 2", label: "Payment links + checkout foundation", done: true },
  { phase: "Phase 3", label: "Merchant operations & receipts", done: true },
  { phase: "Phase 4", label: "Merchant identity & branding", done: true },
  {
    phase: "Phase 5",
    label: "Launch readiness: landing, branding, demo, docs",
    done: true,
  },
  { phase: "Next", label: "Subscriptions, embedded wallets, mainnet, APIs/SDKs", done: false },
];

const grantPoints = [
  "Wallet-native commerce — the wallet is the account",
  "Merchant-owned payments with no intermediaries",
  "Payment links anyone can pay from a wallet",
  "On-chain verification of every transaction",
  "Real merchant operations, end to end on Devnet",
];
