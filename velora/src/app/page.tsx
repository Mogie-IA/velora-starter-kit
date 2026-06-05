import Link from "next/link";
import { Navbar } from "@/components/layout";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8ff]">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(109,74,255,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="page-container relative pt-28 pb-20 text-center">
            {/* Phase badge */}
            <span className="chip chip-primary mb-8 inline-flex">
              ✦ Phase 0 — Foundation
            </span>

            {/* Headline */}
            <h1
              className="text-display text-balance text-[#1a1b21] mb-6 mx-auto"
              style={{ maxWidth: 760 }}
            >
              Commerce for the{" "}
              <span className="velora-gradient-text">Solana Economy</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-body-lg text-[#484556] text-balance mx-auto mb-10"
              style={{ maxWidth: 560 }}
            >
              Velora is a wallet-native commerce platform built on Solana.
              Accept payments, manage subscriptions, and build on-chain commerce
              flows — no intermediaries, no friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/merchant/dashboard" className="btn-primary btn-primary-lg">
                Open Merchant Dashboard
              </Link>
              <Link href="/consumer/dashboard" className="btn-secondary" style={{ height: 56, fontSize: 18, padding: "0 32px" }}>
                Consumer Portal
              </Link>
            </div>

            {/* Network pill */}
            <div className="mt-10 inline-flex items-center gap-2 bg-white border border-[#e8e7ef] rounded-full px-4 py-2 shadow-surface">
              <span
                className="w-2 h-2 rounded-full bg-[#007d51]"
                style={{ boxShadow: "0 0 6px rgba(0,125,81,0.6)" }}
              />
              <span className="text-label-md text-[#484556]">
                Connected to Solana Devnet
              </span>
            </div>
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="page-container pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="velora-card p-6">
                {/* Icon container — 40px, 10% primary tint */}
                <div className="tx-icon mb-5">
                  <span className="text-lg">{f.icon}</span>
                </div>
                <h3 className="text-headline-md text-[#1a1b21] mb-2">
                  {f.title}
                </h3>
                <p className="text-body-md text-[#484556] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Architecture preview ── */}
        <section className="page-container pb-28">
          <div className="velora-card p-8 md:p-12 relative overflow-hidden">
            {/* Background accent */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 w-96 h-96 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 100% 0%, rgba(109,74,255,0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative max-w-2xl">
              <span className="chip chip-neutral mb-4 inline-flex text-label-sm uppercase tracking-widest">
                Architecture
              </span>
              <h2 className="text-headline-lg text-[#1a1b21] mb-4">
                Built for production from day one
              </h2>
              <p className="text-body-lg text-[#484556] mb-8">
                A clean, layered architecture separates UI, business logic,
                blockchain, and database — so each phase builds cleanly on the
                last.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {layers.map((layer) => (
                  <div
                    key={layer.name}
                    className="flex items-start gap-3 bg-[#f4f3fb] rounded-[16px] p-4 border border-[#e8e7ef]"
                  >
                    <div className="tx-icon flex-shrink-0">
                      <span>{layer.icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md font-semibold text-[#1a1b21]">
                        {layer.name}
                      </p>
                      <p className="text-label-sm text-[#797588] mt-0.5">
                        {layer.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#e8e7ef] bg-white">
          <div className="page-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[8px] bg-velora-gradient flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="text-label-md text-[#484556]">
                Velora — Phase 0 Foundation
              </span>
            </div>
            <span className="text-label-sm text-[#797588]">
              Solana Devnet · No real funds required
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}

const features = [
  {
    icon: "⚡",
    title: "Instant Settlements",
    description:
      "Payments settle on-chain in seconds. No chargebacks, no holds, no intermediaries taking a cut.",
  },
  {
    icon: "🔄",
    title: "Subscription Management",
    description:
      "Create and manage recurring billing plans backed entirely by Solana transactions.",
  },
  {
    icon: "👛",
    title: "Wallet-Native Identity",
    description:
      "Your wallet is your identity. No email, no password — just connect and transact.",
  },
];

const layers = [
  { icon: "🖥", name: "UI Layer", desc: "Next.js App Router · shadcn/ui" },
  { icon: "⚙️", name: "Feature Modules", desc: "Auth · Wallet · Merchant · Consumer" },
  { icon: "🔗", name: "Blockchain", desc: "Solana Wallet Adapter · Devnet" },
  { icon: "🗄", name: "Database", desc: "Supabase · PostgreSQL" },
];
