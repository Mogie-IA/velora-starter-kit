"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CreditCard,
  RefreshCcw,
  ShoppingBag,
  Receipt,
  AppWindow,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { shortenAddress } from "@/lib/solana/config";
import type { UserRole } from "@/types/auth";

const merchantNav = [
  { href: "/merchant/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/merchant/payments",
    label: "Payments",
    icon: CreditCard,
    soon: true,
  },
  {
    href: "/merchant/subscriptions",
    label: "Subscriptions",
    icon: RefreshCcw,
    soon: true,
  },
];

const consumerNav = [
  { href: "/consumer/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/consumer/receipts", label: "Receipts", icon: Receipt, soon: true },
  {
    href: "/consumer/subscriptions",
    label: "Subscriptions",
    icon: RefreshCcw,
    soon: true,
  },
  {
    href: "/consumer/connected-apps",
    label: "Connected Apps",
    icon: AppWindow,
    soon: true,
  },
];

function getNavItems(role: UserRole | null) {
  if (role === "merchant") return merchantNav;
  if (role === "consumer") return consumerNav;
  return [];
}

function NavItem({
  href,
  label,
  icon: Icon,
  soon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  soon?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all duration-150 group",
        isActive
          ? "bg-[rgba(84,39,230,0.08)] text-[#5427e6]"
          : "text-[#484556] hover:bg-[#f4f3fb] hover:text-[#1a1b21]"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-colors",
          isActive ? "text-[#5427e6]" : "text-[#797588] group-hover:text-[#484556]"
        )}
      />
      <span className="text-label-md font-medium flex-1">{label}</span>
      {soon && (
        <span className="text-[10px] font-semibold text-[#797588] bg-[#eeedf5] px-2 py-0.5 rounded-full">
          Soon
        </span>
      )}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-[#5427e6] opacity-60" />
      )}
    </Link>
  );
}

function SidebarContent({
  role,
  walletAddress,
  onSignOut,
  onNavClick,
}: {
  role: UserRole | null;
  walletAddress: string | null;
  onSignOut: () => void;
  onNavClick?: () => void;
}) {
  const navItems = getNavItems(role);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#eeedf5]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-velora-gradient flex items-center justify-center shadow-primary-glow">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-[17px] font-semibold text-[#1a1b21] tracking-tight">
            Velora
          </span>
        </Link>
        <span className="chip chip-primary text-[10px] py-0.5 ml-auto">
          {role === "merchant" ? "Merchant" : role === "consumer" ? "Consumer" : "Devnet"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Wallet + sign out */}
      <div className="px-3 py-4 border-t border-[#eeedf5]">
        {walletAddress && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] bg-[#f4f3fb] mb-2">
            <div className="w-7 h-7 rounded-full bg-velora-gradient flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-mono font-semibold text-[#1a1b21] truncate">
                {shortenAddress(walletAddress)}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007d51] flex-shrink-0" />
                <span className="text-[11px] text-[#007d51] font-medium">Devnet</span>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[#484556] hover:bg-[#fdf3f3] hover:text-[#ba1a1a] transition-colors duration-150 group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 transition-colors group-hover:text-[#ba1a1a]" />
          <span className="text-label-md font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, walletAddress, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#faf8ff]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 border-r border-[#eeedf5] bg-white">
        <SidebarContent
          role={user?.role ?? null}
          walletAddress={walletAddress}
          onSignOut={signOut}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#eeedf5] shadow-floating lg:hidden"
            >
              <SidebarContent
                role={user?.role ?? null}
                walletAddress={walletAddress}
                onSignOut={async () => {
                  setMobileOpen(false);
                  await signOut();
                }}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#eeedf5] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-velora-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-[16px] font-semibold text-[#1a1b21]">
              Velora
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-[10px] hover:bg-[#f4f3fb] transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[#484556]" />
            ) : (
              <Menu className="w-5 h-5 text-[#484556]" />
            )}
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10 max-w-[1040px]">
          {children}
        </main>
      </div>
    </div>
  );
}
