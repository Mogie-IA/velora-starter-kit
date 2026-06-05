"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Store,
  Wallet,
  Code2,
  Link2,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Zap,
  Globe,
  Boxes,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { LandingNav } from "@/features/marketing/components/LandingNav";
import { LandingFooter } from "@/features/marketing/components/LandingFooter";
import { useAuthContext } from "@/features/auth";

const ease = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { isAuthenticated, user } = useAuthContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardHref =
    mounted && isAuthenticated && user?.role
      ? user.role === "merchant"
        ? "/merchant/dashboard"
        : "/consumer/dashboard"
      : null;

  return (
    <>
      <LandingNav />
      <main className="bg-[#faf8ff]">
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[680px]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(109,74,255,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="page-container relative pt-24 pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <span className="chip chip-primary mb-7 inline-flex">
                <Sparkles className="w-3.5 h-3.5" />
                Wallet-native commerce infrastructure for Solana
              </span>
              <h1
                className="text-display text-balance text-[#1a1b21] mb-6 mx-auto"
                style={{ maxWidth: 820 }}
              >
                Accept and send payments{" "}
                <span className="velora-gradient-text">natively on Solana.</span>
              </h1>
              <p
                className="text-body-lg text-[#484556] text-balance mx-auto mb-9"
                style={{ maxWidth: 600 }}
              >
                Create payment links, accept wallet payments, verify transactions
                on-chain, and manage commerce without intermediaries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {dashboardHref ? (
                  <Link href={dashboardHref} className="btn-primary btn-primary-lg">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/get-started" className="btn-primary btn-primary-lg">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/demo"
                  className="btn-secondary"
                  style={{ height: 56, fontSize: 18, padding: "0 32px" }}
                >
                  Try Demo
                </Link>
              </div>

              <div className="mt-7 inline-flex items-center gap-2 bg-white border border-[#e8e7ef] rounded-full px-4 py-2 shadow-surface">
                <span
                  className="w-2 h-2 rounded-full bg-[#007d51]"
                  style={{ boxShadow: "0 0 6px rgba(0,125,81,0.6)" }}
                />
                <span className="text-label-md text-[#484556]">
                  Live on Solana Devnet · No real funds required
                </span>
              </div>
            </motion.div>

            {/* Product previews */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 text-left"
            >
              <DashboardPreview />
              <CheckoutPreview />
              <ReceiptPreview />
            </motion.div>
          </div>
        </section>

        {/* ───────── Merchants ───────── */}
        <Section
          id="merchants"
          eyebrow="For merchants"
          icon={Store}
          title="Built for merchants."
          description="Everything you need to accept Solana payments and run your business — no payment processor, no chargebacks, no middlemen."
          items={merchantItems}
          cta={{ href: "/get-started", label: "Continue as Merchant" }}
        />

        {/* ───────── Consumers ───────── */}
        <Section
          id="consumers"
          eyebrow="For customers"
          icon={Wallet}
          title="Built for customers."
          description="Pay any merchant straight from your wallet. Every payment is transparent, verifiable, and settles in seconds."
          items={consumerItems}
          cta={{ href: "/get-started", label: "Continue as Consumer" }}
          tinted
        />

        {/* ───────── Developers ───────── */}
        <Section
          id="developers"
          eyebrow="For builders"
          icon={Code2}
          title="Built for builders."
          description="A Solana-native commerce foundation with on-chain verification — and developer tooling on the roadmap."
          items={developerItems}
          cta={{ href: "/docs", label: "Read the docs" }}
        />

        {/* ───────── Demo ───────── */}
        <section id="demo" className="page-container py-20 scroll-mt-20">
          <div className="velora-card p-8 md:p-12 relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 w-96 h-96 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at 100% 0%, rgba(109,74,255,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="chip chip-primary uppercase tracking-widest">
                  Demo
                </span>
                <span className="chip chip-warning">Devnet</span>
                <span className="chip chip-neutral">Test funds only</span>
              </div>
              <h2 className="text-headline-lg text-[#1a1b21] mb-3">
                See the full payment flow, end to end.
              </h2>
              <p className="text-body-lg text-[#484556] mb-8 max-w-2xl">
                Run the complete merchant-to-consumer journey on Devnet in a few
                minutes — no real money involved.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {demoSteps.map((step, i) => (
                  <div
                    key={step}
                    className="bg-[#f4f3fb] rounded-[16px] p-4 border border-[#e8e7ef]"
                  >
                    <div className="w-7 h-7 rounded-full bg-velora-gradient flex items-center justify-center text-white text-label-sm font-bold mb-3">
                      {i + 1}
                    </div>
                    <p className="text-label-md text-[#1a1b21] leading-snug">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/demo" className="btn-primary">
                  Open the demo guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/get-started" className="btn-secondary">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Roadmap ───────── */}
        <section id="roadmap" className="page-container py-20 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="chip chip-neutral mb-4 inline-flex uppercase tracking-widest">
              Roadmap
            </span>
            <h2 className="text-headline-lg text-[#1a1b21] mb-3">
              Shipping in the open.
            </h2>
            <p className="text-body-lg text-[#484556]">
              Velora is live on Devnet today, with a clear path to a full
              wallet-native commerce platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="velora-card p-7">
              <div className="flex items-center gap-2 mb-5">
                <span className="chip chip-success">Live now</span>
              </div>
              <ul className="space-y-3">
                {roadmapCurrent.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#007d51] flex-shrink-0 mt-0.5" />
                    <span className="text-body-md text-[#1a1b21]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="velora-card p-7">
              <div className="flex items-center gap-2 mb-5">
                <span className="chip chip-primary">Coming up</span>
              </div>
              <ul className="space-y-3">
                {roadmapUpcoming.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full border-2 border-[#c9bfff] flex-shrink-0 mt-0.5" />
                    <span className="text-body-md text-[#484556]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────── Grant narrative ───────── */}
        <section className="page-container pb-24">
          <div className="velora-card-glass p-8 md:p-12 relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(109,74,255,0.10) 0%, transparent 60%)",
              }}
            />
            <div className="relative max-w-3xl">
              <span className="chip chip-primary mb-4 inline-flex uppercase tracking-widest">
                Why Velora matters for Solana
              </span>
              <h2 className="text-headline-lg text-[#1a1b21] mb-4">
                Commerce that belongs to merchants, settled on-chain.
              </h2>
              <p className="text-body-lg text-[#484556] mb-6">
                Traditional payments route every transaction through processors
                that own the merchant relationship, hold funds, and add fees.
                Velora makes the wallet the account — merchants accept payments
                directly, customers pay peer-to-peer, and every transaction is
                verified on Solana.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {grantPoints.map((p) => (
                  <div key={p} className="flex items-start gap-3">
                    <div className="tx-icon flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#5427e6]" />
                    </div>
                    <span className="text-body-md text-[#1a1b21]">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}

/* ─────────────────────────── Section block ─────────────────────────── */

function Section({
  id,
  eyebrow,
  icon: Icon,
  title,
  description,
  items,
  cta,
  tinted,
}: {
  id: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  items: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  cta: { href: string; label: string };
  tinted?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${tinted ? "bg-white border-y border-[#e8e7ef]" : ""}`}
    >
      <div className="page-container py-20">
        <div className="max-w-2xl mb-10">
          <span className="chip chip-primary mb-4 inline-flex uppercase tracking-widest">
            <Icon className="w-3.5 h-3.5" />
            {eyebrow}
          </span>
          <h2 className="text-headline-lg text-[#1a1b21] mb-3">{title}</h2>
          <p className="text-body-lg text-[#484556]">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 velora-card p-5"
            >
              <div className="tx-icon flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#5427e6]" />
              </div>
              <span className="text-body-md font-medium text-[#1a1b21]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Link href={cta.href} className="btn-primary">
          {cta.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* ─────────────────────────── Product previews ─────────────────────────── */

function PreviewFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="velora-card p-0 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#eeedf5] bg-[#faf8ff]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e9]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e9]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e9]" />
        <span className="ml-2 text-label-sm text-[#797588]">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <PreviewFrame label="Merchant dashboard">
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="w-4 h-4 text-[#5427e6]" />
        <span className="text-label-md font-semibold text-[#1a1b21]">
          Overview
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#f4f3fb] rounded-[12px] p-3">
          <p className="text-label-sm text-[#797588]">Revenue</p>
          <p className="text-headline-md text-[#1a1b21] tabular-nums">◎ 48.20</p>
        </div>
        <div className="bg-[#f4f3fb] rounded-[12px] p-3">
          <p className="text-label-sm text-[#797588]">Payments</p>
          <p className="text-headline-md text-[#1a1b21] tabular-nums">126</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {[40, 70, 55].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-[9px] bg-velora-gradient flex-shrink-0" />
            <span
              className="h-2 rounded-full bg-[#eeedf5]"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}

function CheckoutPreview() {
  return (
    <PreviewFrame label="Checkout">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-9 h-9 rounded-[11px] bg-velora-gradient flex items-center justify-center text-white font-bold">
          A
        </span>
        <div>
          <p className="text-label-sm text-[#797588]">Paying</p>
          <p className="text-label-md font-semibold text-[#1a1b21]">
            Acme Coffee
          </p>
        </div>
      </div>
      <div className="text-center py-4 border-y border-[#eeedf5]">
        <p className="text-headline-lg text-[#1a1b21] tabular-nums">◎ 1.50</p>
        <p className="text-label-md text-[#484556] mt-1">Monthly roast box</p>
      </div>
      <div className="mt-4 btn-primary w-full pointer-events-none">
        <Wallet className="w-4 h-4" />
        Pay with wallet
      </div>
    </PreviewFrame>
  );
}

function ReceiptPreview() {
  return (
    <PreviewFrame label="Receipt">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(0,125,81,0.1)] flex items-center justify-center mb-2">
          <CheckCircle2 className="w-7 h-7 text-[#007d51]" />
        </div>
        <p className="text-label-md font-semibold text-[#1a1b21]">
          Payment successful
        </p>
      </div>
      <div className="mt-4 bg-[#f4f3fb] rounded-[12px] p-3 space-y-2">
        {[
          ["Amount", "◎ 1.50"],
          ["Status", "Confirmed"],
          ["Network", "Devnet"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-label-sm text-[#797588]">{k}</span>
            <span className="text-label-md text-[#1a1b21]">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-[#797588]">Transaction</span>
          <span className="text-label-sm font-mono text-[#5427e6]">5xK2…9aBc</span>
        </div>
      </div>
    </PreviewFrame>
  );
}

/* ─────────────────────────── Content data ─────────────────────────── */

const merchantItems = [
  { icon: Link2, label: "Payment links" },
  { icon: LayoutDashboard, label: "Merchant dashboard" },
  { icon: ReceiptText, label: "Transaction history" },
  { icon: CheckCircle2, label: "On-chain receipts" },
  { icon: Sparkles, label: "Merchant branding" },
  { icon: Wallet, label: "Branded checkout" },
];

const consumerItems = [
  { icon: Wallet, label: "Wallet-native checkout" },
  { icon: ShieldCheck, label: "Transparent payments" },
  { icon: ReceiptText, label: "On-chain receipts" },
  { icon: Globe, label: "No card processors" },
  { icon: Zap, label: "Fast settlement" },
  { icon: CheckCircle2, label: "Full payment history" },
];

const developerItems = [
  { icon: Boxes, label: "Solana-native architecture" },
  { icon: ShieldCheck, label: "On-chain verification" },
  { icon: Link2, label: "Commerce infrastructure" },
  { icon: Code2, label: "Future APIs" },
  { icon: KeyRound, label: "Future SDKs" },
  { icon: Globe, label: "Open building blocks" },
];

const demoSteps = [
  "Connect merchant wallet",
  "Complete merchant profile",
  "Create a payment link",
  "Open checkout",
  "Connect consumer wallet",
  "Pay with Devnet SOL",
  "Receive a receipt",
  "View merchant history",
];

const roadmapCurrent = [
  "Wallet authentication",
  "Merchant profiles & branding",
  "Payment links",
  "Real Devnet payments",
  "On-chain receipts",
  "Merchant operations",
];

const roadmapUpcoming = [
  "Subscriptions",
  "Embedded wallets",
  "Mainnet support",
  "Public APIs",
  "Developer SDKs",
  "Hosted storefronts",
];

const grantPoints = [
  "Wallet-native commerce — the wallet is the account",
  "Merchant-owned payments with no intermediaries",
  "Payment links anyone can pay from a wallet",
  "On-chain verification of every transaction",
  "Real merchant operations, end to end",
  "End-to-end Devnet payments today",
];
