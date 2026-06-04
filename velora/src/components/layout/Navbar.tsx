"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/solana/config";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[rgba(255,255,255,0.80)] backdrop-blur-[20px]",
        "border-b border-[#e8e7ef]",
        "shadow-[0_2px_12px_rgba(11,16,38,0.04)]",
        className
      )}
    >
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-velora-gradient flex items-center justify-center shadow-[0_4px_12px_rgba(109,74,255,0.35)]">
              <span className="text-white font-bold text-sm leading-none">V</span>
            </div>
            <span className="text-[18px] font-semibold text-[#1a1b21] tracking-tight">
              Velora
            </span>
            <span className="chip chip-primary ml-1 text-[10px] py-0.5">
              Devnet
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="btn-ghost text-label-md">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side — wallet UI only rendered after mount to prevent SSR mismatch */}
        <div className="flex items-center gap-3">
          {mounted && connected && publicKey && (
            <div className="hidden sm:flex items-center gap-2 bg-[#f4f3fb] border border-[#e8e7ef] rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007d51] shadow-[0_0_4px_rgba(0,125,81,0.6)]" />
              <span className="text-[12px] font-mono font-medium text-[#484556]">
                {shortenAddress(publicKey.toBase58())}
              </span>
            </div>
          )}
          {mounted ? (
            <WalletMultiButton
              style={{
                background: "linear-gradient(135deg, #6d4aff 0%, #4f46e5 100%)",
                borderRadius: "16px",
                height: "40px",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 16px rgba(109, 74, 255, 0.28)",
                padding: "0 20px",
                border: "none",
              }}
            />
          ) : (
            <div
              style={{
                background: "linear-gradient(135deg, #6d4aff 0%, #4f46e5 100%)",
                borderRadius: "16px",
                height: "40px",
                width: "152px",
                boxShadow: "0 4px 16px rgba(109, 74, 255, 0.28)",
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

const navLinks = [
  { href: "/merchant/dashboard", label: "Merchant" },
  { href: "/consumer/dashboard", label: "Consumer" },
  { href: "/docs", label: "Docs" },
];
