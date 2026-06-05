"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { href: "#merchants", label: "Merchants" },
  { href: "#consumers", label: "Consumers" },
  { href: "#developers", label: "Developers" },
  { href: "#demo", label: "Demo" },
];

/**
 * Marketing navbar for the landing page. In-page links scroll to the relevant
 * section; "Create Account" routes to the role-selection screen.
 */
export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[rgba(255,255,255,0.80)] backdrop-blur-[20px]",
        "border-b border-[#e8e7ef]",
        "shadow-[0_2px_12px_rgba(11,16,38,0.04)]"
      )}
    >
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-velora-gradient flex items-center justify-center shadow-[0_4px_12px_rgba(109,74,255,0.35)]">
            <span className="text-white font-bold text-sm leading-none">V</span>
          </div>
          <span className="text-[18px] font-semibold text-[#1a1b21] tracking-tight">
            Velora
          </span>
          <span className="chip chip-primary ml-1 text-[10px] py-0.5">Devnet</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {sections.map((s) => (
            <a key={s.href} href={s.href} className="btn-ghost text-label-md">
              {s.label}
            </a>
          ))}
          <Link href="/docs" className="btn-ghost text-label-md">
            Docs
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/get-started" className="btn-primary h-10 px-5 text-label-md">
            Create Account
          </Link>
        </div>

        <button
          type="button"
          className="btn-ghost md:hidden h-10 w-10 px-0"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#e8e7ef] bg-white">
          <div className="page-container py-3 flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="btn-ghost justify-start text-label-md"
                onClick={() => setOpen(false)}
              >
                {s.label}
              </a>
            ))}
            <Link
              href="/docs"
              className="btn-ghost justify-start text-label-md"
              onClick={() => setOpen(false)}
            >
              Docs
            </Link>
            <Link
              href="/get-started"
              className="btn-primary mt-2"
              onClick={() => setOpen(false)}
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
