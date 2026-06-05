"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  CreditCard,
  RefreshCcw,
  Code2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { shortenAddress } from "@/lib/solana/config";
import { useWalletBalance } from "@/features/wallet";

export default function MerchantDashboardPage() {
  const { user, walletAddress } = useAuthContext();
  const { sol, isLoading: balanceLoading } = useWalletBalance();

  const displayName = user?.displayName ?? shortenAddress(walletAddress ?? "");

  return (
    <div>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label-sm text-[#797588] uppercase tracking-widest mb-1">
              Merchant Dashboard
            </p>
            <h1 className="text-headline-lg text-[#1a1b21]">
              Good morning
              {user?.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="text-body-md text-[#484556] mt-1">
              Your Velora merchant account is active and ready.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#f4f3fb] border border-[#e8e7ef] rounded-full px-3 py-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#007d51]" style={{ boxShadow: "0 0 5px rgba(0,125,81,0.5)" }} />
            <span className="text-label-sm text-[#484556]">Devnet</span>
          </div>
        </div>
      </motion.div>

      {/* Status overview card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="velora-card p-6 mb-6"
        style={{ background: "linear-gradient(145deg, #ffffff 0%, #faf8ff 100%)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-[14px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-[#5427e6]" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-[#1a1b21] mb-0.5">
                Wallet Connected
              </p>
              {walletAddress && (
                <p className="text-[13px] font-mono text-[#484556]">
                  {walletAddress}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#007d51]" />
                <span className="text-label-sm text-[#007d51]">
                  Ready to receive payments
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-label-sm text-[#797588] uppercase tracking-wide mb-1">
              Balance
            </p>
            <p className="text-[22px] font-semibold tabular-nums text-[#1a1b21]">
              {balanceLoading ? (
                <span className="text-[#c9c4d9]">—</span>
              ) : (
                `◎ ${sol.toFixed(4)}`
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value text-[#c9c4d9] text-2xl">—</p>
            <p className="text-[11px] text-[#797588] mt-1.5 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Empty Payment Links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3 }}
        className="velora-card mb-6 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Payment Links
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              Shareable Solana Pay links for your customers
            </p>
          </div>
          <span className="chip chip-neutral">Phase 2</span>
        </div>
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[16px] bg-[#f4f3fb] flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5 text-[#797588]" />
          </div>
          <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
            No payment links yet
          </p>
          <p className="text-label-sm text-[#797588] max-w-[280px] leading-relaxed">
            Create shareable payment links in Phase 2. Your customers will be
            able to pay with one click.
          </p>
          <div className="flex items-center gap-1.5 mt-4 chip chip-neutral">
            <Clock className="w-3 h-3" />
            Coming in Phase 2
          </div>
        </div>
      </motion.div>

      {/* Empty Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="velora-card mb-8 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Recent Transactions
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              On-chain payment activity will appear here
            </p>
          </div>
          <span className="chip chip-neutral">Phase 2</span>
        </div>
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[16px] bg-[#f4f3fb] flex items-center justify-center mb-4">
            <ArrowUpRight className="w-5 h-5 text-[#797588]" />
          </div>
          <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
            No transactions yet
          </p>
          <p className="text-label-sm text-[#797588] max-w-[280px] leading-relaxed">
            Once you start accepting payments, your transaction history will
            appear here.
          </p>
        </div>
      </motion.div>

      {/* Future features preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.3 }}
      >
        <p className="text-label-sm text-[#797588] uppercase tracking-widest mb-4">
          Coming in Phase 2
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upcomingFeatures.map((feat) => (
            <div
              key={feat.title}
              className="velora-card p-5 opacity-70 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-[12px] bg-[#f4f3fb] flex items-center justify-center mb-3">
                <feat.icon className="w-4 h-4 text-[#797588]" />
              </div>
              <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
                {feat.title}
              </p>
              <p className="text-label-sm text-[#797588] leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const statCards = [
  { label: "Total Revenue", sub: "Lifetime SOL received" },
  { label: "Transactions (30d)", sub: "Payments this month" },
  { label: "Active Subscriptions", sub: "Recurring billing" },
  { label: "Products", sub: "Listed items" },
];

const upcomingFeatures = [
  {
    icon: CreditCard,
    title: "Payment Links",
    desc: "Generate shareable Solana Pay links for any product or amount.",
  },
  {
    icon: RefreshCcw,
    title: "Subscriptions",
    desc: "Set up recurring billing plans backed by on-chain transactions.",
  },
  {
    icon: Code2,
    title: "Checkout SDK",
    desc: "Embed Velora checkout directly in your website or app.",
  },
];
