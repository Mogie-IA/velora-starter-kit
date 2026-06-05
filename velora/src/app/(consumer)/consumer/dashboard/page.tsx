"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Receipt,
  RefreshCcw,
  AppWindow,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { shortenAddress } from "@/lib/solana/config";
import { useWalletBalance } from "@/features/wallet";

export default function ConsumerDashboardPage() {
  const { user, walletAddress } = useAuthContext();
  const { sol, isLoading: balanceLoading } = useWalletBalance();

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
              Consumer Portal
            </p>
            <h1 className="text-headline-lg text-[#1a1b21]">
              My Dashboard
              {user?.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="text-body-md text-[#484556] mt-1">
              Your on-chain purchase history and connected apps.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#f4f3fb] border border-[#e8e7ef] rounded-full px-3 py-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#007d51]" style={{ boxShadow: "0 0 5px rgba(0,125,81,0.5)" }} />
            <span className="text-label-sm text-[#484556]">Devnet</span>
          </div>
        </div>
      </motion.div>

      {/* Wallet status card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3 }}
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
                  Identity verified · Devnet
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

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {consumerStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value text-[#c9c4d9] text-2xl">—</p>
            <p className="text-[11px] text-[#797588] mt-1.5 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Connected Apps */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3 }}
        className="velora-card mb-6 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Connected Apps
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              Merchants and apps you&apos;ve authorized
            </p>
          </div>
          <span className="chip chip-neutral">Phase 2</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-[16px] bg-[#f4f3fb] flex items-center justify-center mb-4">
            <AppWindow className="w-5 h-5 text-[#797588]" />
          </div>
          <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
            No connected apps
          </p>
          <p className="text-label-sm text-[#797588] max-w-[280px] leading-relaxed">
            Apps and merchants you authorize will appear here so you can manage
            permissions in one place.
          </p>
          <div className="flex items-center gap-1.5 mt-4 chip chip-neutral">
            <Clock className="w-3 h-3" />
            Coming in Phase 2
          </div>
        </div>
      </motion.div>

      {/* Receipts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="velora-card mb-6 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Receipts
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              Verified on-chain purchase receipts
            </p>
          </div>
          <span className="chip chip-neutral">Phase 2</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-[16px] bg-[#f4f3fb] flex items-center justify-center mb-4">
            <Receipt className="w-5 h-5 text-[#797588]" />
          </div>
          <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
            No receipts yet
          </p>
          <p className="text-label-sm text-[#797588] max-w-[280px] leading-relaxed">
            Every purchase you make through Velora generates a verifiable
            on-chain receipt stored here.
          </p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.3 }}
        className="velora-card mb-8 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Recent Activity
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              Transactions across all merchants
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-12 h-12 rounded-[16px] bg-[#f4f3fb] flex items-center justify-center mb-4">
            <Activity className="w-5 h-5 text-[#797588]" />
          </div>
          <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
            No activity yet
          </p>
          <p className="text-label-sm text-[#797588] max-w-[280px] leading-relaxed">
            Your transaction history will appear here once you start making
            purchases through Velora merchants.
          </p>
        </div>
      </motion.div>

      {/* Coming soon features */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.3 }}
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

const consumerStats = [
  { label: "Total Spent", sub: "Lifetime SOL spent" },
  { label: "Active Subscriptions", sub: "Recurring plans" },
  { label: "Connected Apps", sub: "Authorized merchants" },
];

const upcomingFeatures = [
  {
    icon: Receipt,
    title: "Purchase Receipts",
    desc: "Immutable on-chain receipts for every transaction you make.",
  },
  {
    icon: RefreshCcw,
    title: "Subscriptions",
    desc: "View and manage all recurring plans from a single dashboard.",
  },
  {
    icon: AppWindow,
    title: "App Permissions",
    desc: "Control exactly which merchants and apps can access your data.",
  },
];
