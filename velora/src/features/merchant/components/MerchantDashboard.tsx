"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  CheckCircle2,
  Clock,
  CreditCard,
  Link2,
  Coins,
  ExternalLink,
  ArrowUpRight,
  Receipt,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/features/auth";
import { useWalletBalance } from "@/features/wallet";
import {
  shortenAddress,
  getExplorerTxUrl,
} from "@/lib/solana/config";
import { formatAmount } from "@/features/payments";
import type { MerchantPayment, PaymentStatus } from "@/features/payments/types";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { useMerchantDashboardStats } from "../hooks/useMerchantStats";
import { MerchantAvatar } from "./MerchantAvatar";
import { OnboardingBanner } from "./OnboardingBanner";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "error"> = {
  confirmed: "success",
  pending: "warning",
  failed: "error",
};

const ease = [0.16, 1, 0.3, 1] as const;

export function MerchantDashboard() {
  const { walletAddress } = useAuthContext();
  const { sol, isLoading: balanceLoading } = useWalletBalance();
  const { data: profile } = useMerchantProfile(walletAddress);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useMerchantDashboardStats(walletAddress);

  const businessName =
    profile?.display_name || profile?.business_name || null;
  const greetingName = businessName ? `, ${businessName}` : "";

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {profile && (
              <MerchantAvatar
                name={profile.business_name}
                logoUrl={profile.logo_url}
                size={48}
              />
            )}
            <div className="min-w-0">
              <p className="text-label-sm text-[#797588] uppercase tracking-widest mb-1">
                Merchant Dashboard
              </p>
              <h1 className="text-headline-lg text-[#1a1b21] truncate">
                Welcome back{greetingName}
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[#f4f3fb] border border-[#e8e7ef] rounded-full px-3 py-1.5 flex-shrink-0">
            <span
              className="w-2 h-2 rounded-full bg-[#007d51]"
              style={{ boxShadow: "0 0 5px rgba(0,125,81,0.5)" }}
            />
            <span className="text-label-sm text-[#484556]">Devnet</span>
          </div>
        </div>
      </motion.div>

      {/* Onboarding prompt (non-blocking) */}
      {walletAddress && <OnboardingBanner walletAddress={walletAddress} />}

      {/* Wallet status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3, ease }}
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
                <p className="text-[13px] font-mono text-[#484556] break-all">
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
        transition={{ delay: 0.1, duration: 0.3, ease }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={Coins}
          label="Confirmed revenue"
          value={
            statsLoading
              ? null
              : `◎ ${(stats?.totalConfirmedRevenueSol ?? 0).toFixed(4)}`
          }
          sub="Lifetime SOL received"
          accent="#007d51"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed"
          value={statsLoading ? null : String(stats?.confirmedCount ?? 0)}
          sub="Settled payments"
          accent="#5427e6"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={statsLoading ? null : String(stats?.pendingCount ?? 0)}
          sub="Awaiting confirmation"
          accent="#a87900"
        />
        <StatCard
          icon={Link2}
          label="Active links"
          value={statsLoading ? null : String(stats?.activeLinksCount ?? 0)}
          sub={`of ${stats?.totalLinksCount ?? 0} total`}
          accent="#5427e6"
        />
      </motion.div>

      {/* Latest payments */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3, ease }}
        className="velora-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeedf5]">
          <div>
            <h2 className="text-label-md font-semibold text-[#1a1b21]">
              Latest payments
            </h2>
            <p className="text-label-sm text-[#797588] mt-0.5">
              Your most recent on-chain payment activity
            </p>
          </div>
          <Link
            href="/merchant/payments"
            className="text-label-sm font-semibold text-[#5427e6] inline-flex items-center gap-1 hover:underline"
          >
            View all
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {statsError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-body-sm text-[#484556]">
              Couldn&apos;t load payments: {(statsError as Error).message}
            </p>
          </div>
        ) : statsLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-40 bg-[#e2e2e9] rounded-full animate-pulse" />
                <div className="h-4 w-20 bg-[#eeedf5] rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-[#eeedf5] rounded-full animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : stats && stats.latestPayments.length > 0 ? (
          <ul className="divide-y divide-[#f4f3fb]">
            {stats.latestPayments.map((p) => (
              <LatestPaymentRow key={p.id} payment={p} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[16px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center mb-4">
              <Receipt className="w-5 h-5 text-[#5427e6]" />
            </div>
            <p className="text-label-md font-semibold text-[#1a1b21] mb-1">
              No payments yet
            </p>
            <p className="text-label-sm text-[#797588] max-w-[300px] leading-relaxed">
              Create a payment link and share it — confirmed payments will appear
              here with their on-chain signature.
            </p>
            <Link href="/merchant/payments" className="btn-secondary mt-5 h-10 text-label-md">
              <CreditCard className="w-4 h-4" />
              Create a payment link
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  sub: string;
  accent: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <p className="stat-label !mb-0">{label}</p>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      {value === null ? (
        <div className="h-8 w-20 bg-[#eeedf5] rounded-full animate-pulse" />
      ) : (
        <p className="stat-value text-2xl">{value}</p>
      )}
      <p className="text-[11px] text-[#797588] mt-1.5 font-medium">{sub}</p>
    </div>
  );
}

function LatestPaymentRow({ payment: p }: { payment: MerchantPayment }) {
  return (
    <li className="flex items-center gap-3 px-6 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-[#1a1b21] truncate">
          {p.payment_links?.title ?? "Payment"}
        </p>
        <p className="text-label-sm text-[#797588]">
          {new Date(p.confirmed_at ?? p.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <span className="text-body-sm font-medium text-[#1a1b21] tabular-nums">
        {formatAmount(Number(p.amount), p.currency as "SOL" | "USDC")}
      </span>
      <Badge variant={STATUS_VARIANT[p.status]}>
        {p.status === "confirmed" ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : p.status === "pending" ? (
          <Clock className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
      </Badge>
      {p.tx_signature ? (
        <a
          href={getExplorerTxUrl(p.tx_signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5427e6] hover:text-[#4f46e5] flex-shrink-0"
          aria-label="View on Solana Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <span className="w-4 flex-shrink-0" />
      )}
    </li>
  );
}
