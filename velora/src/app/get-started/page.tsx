"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Store, Wallet, Code2 } from "lucide-react";
import { LandingFooter } from "@/features/marketing/components/LandingFooter";

const roles = [
  {
    icon: Store,
    title: "Merchant",
    description:
      "Accept Solana payments, create payment links, manage transactions, and operate your business.",
    cta: "Continue as Merchant",
    href: "/merchant/dashboard",
    accent: "from-[#6d4aff] to-[#4f46e5]",
  },
  {
    icon: Wallet,
    title: "Consumer",
    description:
      "Pay merchants directly from your wallet and manage your payment history.",
    cta: "Continue as Consumer",
    href: "/consumer/dashboard",
    accent: "from-[#4f46e5] to-[#00623e]",
  },
  {
    icon: Code2,
    title: "Developer",
    description:
      "Explore wallet-native commerce infrastructure and future developer tooling.",
    cta: "Explore Developer Tools",
    href: "/docs",
    accent: "from-[#00623e] to-[#6d4aff]",
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-[#faf8ff] flex flex-col">
      <div className="page-container flex-1 pt-10 pb-20">
        <Link
          href="/"
          className="btn-ghost inline-flex items-center gap-2 -ml-4 mb-8 text-label-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="chip chip-primary mb-5 inline-flex">Create account</span>
          <h1 className="text-headline-lg text-[#1a1b21] mb-3">
            How will you use Velora?
          </h1>
          <p className="text-body-lg text-[#484556]">
            Choose a path to get started. You connect your Solana wallet next —
            no email or password required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.08, duration: 0.35 }}
            >
              <Link
                href={role.href}
                className="velora-card p-7 h-full flex flex-col group"
              >
                <div
                  className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${role.accent} flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(109,74,255,0.25)]`}
                >
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-headline-md text-[#1a1b21] mb-2">
                  {role.title}
                </h2>
                <p className="text-body-md text-[#484556] leading-relaxed flex-1">
                  {role.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-label-md font-semibold text-[#5427e6] group-hover:gap-3 transition-all">
                  {role.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-label-md text-[#797588]">
          <span className="w-2 h-2 rounded-full bg-[#007d51] shadow-[0_0_6px_rgba(0,125,81,0.6)]" />
          Connected to Solana Devnet · test funds only
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
