"use client";

import { motion } from "framer-motion";
import {
  Store,
  Wallet,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { CopyButton } from "@/features/payments/components/CopyButton";
import { useAuthContext } from "@/features/auth";
import { shortenAddress, SOLANA_NETWORK } from "@/lib/solana/config";
import { useMerchantProfile } from "../hooks/useMerchantProfile";
import { computeProfileCompletion } from "../completion";
import { MerchantProfileForm } from "./MerchantProfileForm";
import { MerchantAvatar } from "./MerchantAvatar";
import { ProfileCompletionMeter } from "./ProfileCompletion";

const ease = [0.16, 1, 0.3, 1] as const;

export function MerchantSettingsView() {
  const { walletAddress } = useAuthContext();
  const { data: profile, isLoading, error } = useMerchantProfile(walletAddress);

  const dbNotSetup =
    error instanceof Error &&
    error.message.toLowerCase().includes("database not set up");
  const completion = computeProfileCompletion(profile ?? null);

  return (
    <div className="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="mb-8"
      >
        <p className="text-label-sm text-[#797588] uppercase tracking-widest mb-1">
          Merchant
        </p>
        <h1 className="text-headline-lg text-[#1a1b21]">Settings</h1>
        <p className="text-body-md text-[#484556] mt-1">
          Manage your storefront identity, wallet, and payment preferences.
        </p>
      </motion.div>

      {dbNotSetup && (
        <div className="velora-card p-5 mb-6 border-l-4 border-l-[#a87900]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#a87900] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-label-md font-semibold text-[#1a1b21]">
                Database setup required
              </p>
              <p className="text-body-sm text-[#484556] mt-1">
                Apply the Phase 4 migration{" "}
                <code className="text-[12px] bg-[#f4f3fb] px-1.5 py-0.5 rounded font-mono">
                  0002_phase4_merchant_profiles.sql
                </code>{" "}
                in your Supabase SQL editor to enable merchant profiles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Profile */}
      <Section
        icon={Store}
        title="Business Profile"
        description="How your business appears on the dashboard and at checkout."
        delay={0.05}
      >
        {!dbNotSetup && (
          <div className="mb-6 flex items-center gap-4">
            <MerchantAvatar
              name={profile?.business_name || "Velora"}
              logoUrl={profile?.logo_url}
              size={56}
            />
            <div className="flex-1">
              <ProfileCompletionMeter completion={completion} />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 bg-[#f4f3fb] rounded-[12px] animate-pulse"
              />
            ))}
          </div>
        ) : walletAddress ? (
          <MerchantProfileForm
            walletAddress={walletAddress}
            profile={profile ?? null}
          />
        ) : (
          <p className="text-body-sm text-[#484556]">
            Connect your wallet to edit your profile.
          </p>
        )}
      </Section>

      {/* Wallet Info */}
      <Section
        icon={Wallet}
        title="Wallet Information"
        description="Your connected wallet is your merchant identity and receiving address."
        delay={0.1}
      >
        <div className="space-y-3">
          <InfoRow label="Receiving wallet">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-body-sm text-[#1a1b21]">
                  {shortenAddress(walletAddress, 6)}
                </span>
                <CopyButton value={walletAddress} label="Copy" className="h-8 px-2.5 text-label-sm" />
              </div>
            ) : (
              <span className="text-body-sm text-[#797588]">Not connected</span>
            )}
          </InfoRow>
          <InfoRow label="Network">
            <span className="chip chip-warning capitalize">
              {SOLANA_NETWORK}
            </span>
          </InfoRow>
          <InfoRow label="Status">
            <span className="inline-flex items-center gap-1.5 text-body-sm text-[#007d51]">
              <CheckCircle2 className="w-4 h-4" />
              {walletAddress ? "Connected & ready" : "Awaiting connection"}
            </span>
          </InfoRow>
        </div>
      </Section>

      {/* Payment Preferences */}
      <Section
        icon={SlidersHorizontal}
        title="Payment Preferences"
        description="Defaults applied to new payment links."
        delay={0.15}
      >
        <div className="space-y-3">
          <InfoRow label="Settlement currency">
            <span className="inline-flex items-center gap-1.5 text-body-sm text-[#1a1b21]">
              <Coins className="w-4 h-4 text-[#5427e6]" />
              SOL (native)
            </span>
          </InfoRow>
          <InfoRow label="Settlement">
            <span className="text-body-sm text-[#1a1b21]">
              Direct to wallet · non-custodial
            </span>
          </InfoRow>
          <InfoRow label="Confirmation">
            <span className="text-body-sm text-[#1a1b21]">
              On-chain signature verification
            </span>
          </InfoRow>
        </div>
        <p className="text-label-sm text-[#797588] mt-4">
          USDC settlement and configurable confirmation thresholds arrive in a
          later phase.
        </p>
      </Section>

      {/* Devnet Info */}
      <Section
        icon={Info}
        title="Devnet Information"
        description="This environment runs on Solana Devnet."
        delay={0.2}
      >
        <div className="rounded-[12px] bg-[#f4f3fb] p-4">
          <p className="text-body-sm text-[#484556] leading-relaxed">
            Velora is currently running on{" "}
            <span className="font-semibold text-[#1a1b21] capitalize">
              {SOLANA_NETWORK}
            </span>
            . No real funds are involved — payments use test SOL. Use a Devnet
            faucet to fund wallets for testing. Mainnet support arrives in a
            later phase.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  delay,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease }}
      className="velora-card p-6 mb-5"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-[12px] bg-[rgba(84,39,230,0.08)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#5427e6]" />
        </div>
        <div>
          <h2 className="text-title-sm font-semibold text-[#1a1b21]">{title}</h2>
          <p className="text-label-sm text-[#797588] mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f4f3fb] last:border-0">
      <span className="text-label-md text-[#484556]">{label}</span>
      {children}
    </div>
  );
}
