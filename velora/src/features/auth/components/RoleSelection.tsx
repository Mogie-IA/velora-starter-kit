"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ShoppingBag, ArrowRight, Loader2, Check } from "lucide-react";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { shortenAddress } from "@/lib/solana/config";
import type { UserRole } from "@/types/auth";

const roles: {
  id: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  coming: string[];
}[] = [
  {
    id: "merchant",
    icon: Building2,
    title: "Merchant",
    description: "Accept payments and build your on-chain storefront.",
    features: [
      "Receive SOL payments instantly",
      "Dashboard & payment overview",
      "Wallet-native identity",
    ],
    coming: ["Payment links · Phase 2", "Subscriptions · Phase 2"],
  },
  {
    id: "consumer",
    icon: ShoppingBag,
    title: "Consumer",
    description: "Manage your purchases, subscriptions, and apps.",
    features: [
      "View all receipts & history",
      "Manage connected apps",
      "Wallet-native identity",
    ],
    coming: ["Subscriptions · Phase 2", "Spending insights · Phase 3"],
  },
];

export function RoleSelection() {
  const { user, setRole, isSigningIn } = useAuthContext();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await setRole(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#faf8ff]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-velora-gradient shadow-primary-glow mb-4">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-headline-md text-[#1a1b21] mb-2">
            Welcome to Velora
            {user?.walletAddress && (
              <span className="text-[#797588] font-normal">
                {" "}
                · {shortenAddress(user.walletAddress)}
              </span>
            )}
          </h1>
          <p className="text-body-md text-[#484556]">
            How would you like to use Velora?
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.06,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setSelected(role.id)}
                disabled={isSigningIn}
                className="text-left w-full"
                whileHover={{ translateY: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="velora-card p-6 h-full transition-all duration-200"
                  style={{
                    borderColor: isSelected ? "#5427e6" : "#e8e7ef",
                    boxShadow: isSelected
                      ? "0 0 0 2px rgba(84,39,230,0.18), 0 8px 32px rgba(84,39,230,0.10)"
                      : undefined,
                  }}
                >
                  {/* Icon + selected check */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(84,39,230,0.10)"
                          : "#f4f3fb",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isSelected ? "#5427e6" : "#484556" }}
                      />
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isSelected ? 1 : 0.5,
                        opacity: isSelected ? 1 : 0,
                      }}
                      transition={{ duration: 0.18 }}
                      className="w-6 h-6 rounded-full bg-[#5427e6] flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  </div>

                  {/* Title + description */}
                  <h3
                    className="text-label-md font-semibold mb-1.5 transition-colors duration-200"
                    style={{ color: isSelected ? "#5427e6" : "#1a1b21" }}
                  >
                    {role.title}
                  </h3>
                  <p className="text-label-sm text-[#484556] mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#007d51]/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-[#007d51]" />
                        </div>
                        <span className="text-label-sm text-[#1a1b21]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Coming soon */}
                  <div className="pt-3 border-t border-[#eeedf5]">
                    {role.coming.map((c) => (
                      <p key={c} className="text-[11px] text-[#797588] mb-0.5">
                        🔜 {c}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <button
            onClick={handleContinue}
            disabled={!selected || isSigningIn}
            className="btn-primary w-full"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue as {selected ? roles.find((r) => r.id === selected)?.title : "…"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>

        <p className="text-center text-label-sm text-[#797588] mt-4">
          You can switch roles later from your account settings
        </p>
      </motion.div>
    </div>
  );
}
