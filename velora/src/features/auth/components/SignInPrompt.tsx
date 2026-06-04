"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Loader2, Wallet, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { shortenAddress } from "@/lib/solana/config";

const steps = [
  { key: "connect", label: "Connect", icon: Wallet },
  { key: "sign", label: "Sign", icon: ShieldCheck },
  { key: "access", label: "Access", icon: Sparkles },
];

function getStepIndex(step: string): number {
  if (step === "idle") return 0;
  if (step === "wallet_connected") return 1;
  if (step === "signing" || step === "creating_account") return 2;
  return 3;
}

export function SignInPrompt() {
  const { step, isSigningIn, error, walletAddress, signIn, clearError } =
    useAuthContext();
  const { setVisible } = useWalletModal();

  const currentIndex = getStepIndex(step);
  const isConnected = step === "wallet_connected";
  const isSigning = step === "signing" || step === "creating_account";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#faf8ff]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="velora-card p-8 shadow-floating">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] bg-velora-gradient shadow-primary-glow mb-5"
            >
              <span className="text-white font-bold text-xl">V</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-headline-md text-[#1a1b21] mb-2"
            >
              Connect to Velora
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-body-md text-[#484556]"
            >
              Your wallet is your identity — no email or password required.
            </motion.p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => {
              const isDone = i < currentIndex;
              const isActive = i === currentIndex;
              return (
                <div key={s.key} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: isDone
                        ? "#5427e6"
                        : isActive
                        ? "#6d4aff"
                        : "#e8e7ef",
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDone
                          ? "#5427e6"
                          : isActive
                          ? "#6d4aff"
                          : "#e8e7ef",
                        boxShadow: isActive
                          ? "0 0 0 4px rgba(109,74,255,0.15)"
                          : undefined,
                      }}
                    >
                      {isDone ? (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <s.icon
                          className={`w-4 h-4 ${
                            isActive ? "text-white" : "text-[#797588]"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className="text-[11px] font-semibold tracking-wide"
                      style={{
                        color: isDone || isActive ? "#5427e6" : "#797588",
                      }}
                    >
                      {s.label}
                    </span>
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div
                      className="w-16 h-0.5 mb-5 mx-1"
                      style={{
                        backgroundColor:
                          i < currentIndex - 1 ? "#5427e6" : "#e8e7ef",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 bg-[rgba(186,26,26,0.06)] border border-[rgba(186,26,26,0.15)] rounded-[14px] px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#ba1a1a] leading-relaxed">{error}</p>
                  <button
                    onClick={clearError}
                    className="ml-auto text-[#ba1a1a] opacity-60 hover:opacity-100 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-[#f4f3fb] rounded-[16px] p-4 mb-6">
                  <p className="text-label-md text-[#484556] text-center leading-relaxed">
                    Connect your Phantom or Solflare wallet to get started. No
                    funds required.
                  </p>
                </div>
                <button
                  onClick={() => setVisible(true)}
                  className="btn-primary w-full"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              </motion.div>
            )}

            {isConnected && (
              <motion.div
                key="connected"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {walletAddress && (
                  <div className="flex items-center gap-3 bg-[#f4f3fb] rounded-[16px] p-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-velora-gradient flex-shrink-0" />
                    <div>
                      <p className="text-label-md text-[#1a1b21] font-semibold">
                        {shortenAddress(walletAddress)}
                      </p>
                      <p className="text-label-sm text-[#007d51]">
                        Wallet connected · Devnet
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-[#f4f3fb] rounded-[16px] p-4 mb-6">
                  <p className="text-label-md text-[#484556] leading-relaxed">
                    Sign a message to verify ownership of your wallet. This is{" "}
                    <strong className="text-[#1a1b21]">free</strong> and won&apos;t
                    trigger any transaction.
                  </p>
                </div>
                <button onClick={signIn} className="btn-primary w-full">
                  <ShieldCheck className="w-4 h-4" />
                  Sign to Authenticate
                </button>
              </motion.div>
            )}

            {isSigning && (
              <motion.div
                key="signing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-[#5427e6] animate-spin" />
                </div>
                <p className="text-label-md text-[#1a1b21] font-semibold mb-1">
                  {step === "signing" ? "Waiting for signature…" : "Setting up your account…"}
                </p>
                <p className="text-label-sm text-[#797588]">
                  {step === "signing"
                    ? "Approve the signature request in your wallet"
                    : "Almost there — creating your Velora account"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer note */}
          {!isSigning && (
            <p className="text-center text-label-sm text-[#797588] mt-6">
              Solana Devnet · No real funds required
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
