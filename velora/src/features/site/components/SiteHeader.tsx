"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROLE_CONTENT, ROLE_ORDER } from "@/features/site/content";
import { cn } from "@/lib/utils";
import type { MarketplaceRole } from "@/types/marketplace";

/**
 * Shared header.
 *
 * The nav is the same everywhere — How it works and the three role pages — so
 * a visitor who lands on the wrong page can correct course in one click from
 * anywhere on the site. The current role page is marked rather than linked.
 *
 * Everything collapses into one sheet below `lg`, which keeps the role links
 * reachable at tablet widths instead of stranding them in a breakpoint gap.
 */
export function SiteHeader({ role }: { role?: MarketplaceRole }) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "How it works", href: "/how-it-works", active: false },
    ...ROLE_ORDER.map((r) => ({
      label: ROLE_CONTENT[r].navLabel,
      href: ROLE_CONTENT[r].path,
      active: r === role,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-title-sm font-bold text-on-primary">
            V
          </span>
          <span className="text-title-md font-semibold tracking-tight text-on-surface">Velora</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-[10px] px-3 py-2 text-label-md transition-colors",
                link.active
                  ? "bg-surface-container text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          <Link
            href="/build"
            className="whitespace-nowrap text-label-md font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Log in
          </Link>
          <Button asChild size="sm">
            <Link href={role ? `/signup/${role}` : "/signup"}>Get started</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto grid h-10 w-10 place-items-center rounded-[12px] text-on-surface-variant transition-colors hover:bg-surface-container lg:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-outline-variant/70 bg-background px-4 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <MobileLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </MobileLink>
            ))}
          </nav>
          <div className="mt-2 flex flex-col border-t border-outline-variant/70 pt-2">
            <MobileLink href="/build" onClick={() => setOpen(false)}>
              Log in
            </MobileLink>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link href={role ? `/signup/${role}` : "/signup"} onClick={() => setOpen(false)}>
              Get started
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-[10px] px-2 py-2.5 text-body-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {children}
    </Link>
  );
}
