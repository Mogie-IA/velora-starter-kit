"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROLE_CONTENT, ROLE_ORDER } from "@/features/site/content";
import type { MarketplaceRole } from "@/types/marketplace";

/**
 * Shared header for the marketing pages.
 *
 * Only two things change between the three landing pages: the primary CTA and
 * which role-switch links are shown — the current page never links to itself,
 * so a visitor who landed on the wrong page can correct course in one click
 * instead of hitting a dead end.
 *
 * With no `role` (the homepage chooser) the nav anchors are hidden, because
 * there are no sections to anchor to.
 */
export function SiteHeader({ role }: { role?: MarketplaceRole }) {
  const [open, setOpen] = useState(false);
  const content = role ? ROLE_CONTENT[role] : null;
  const others = ROLE_ORDER.filter((r) => r !== role).map((r) => ROLE_CONTENT[r]);

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-title-sm font-bold text-on-primary">
            V
          </span>
          <span className="text-title-md font-semibold tracking-tight text-on-surface">Velora</span>
        </Link>

        {content && (
          <nav className="hidden items-center gap-1 lg:flex">
            <Anchor href="#how-it-works">How it works</Anchor>
            <Anchor href="#fees">Fees</Anchor>
            <Anchor href="#faq">FAQ</Anchor>
          </nav>
        )}

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          {others.length > 0 && (
            <div className="flex items-center gap-3 border-r border-outline-variant pr-5">
              {others.map((o) => (
                <Link
                  key={o.path}
                  href={o.path}
                  className="whitespace-nowrap text-label-md text-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {o.switchLabel}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/build"
            className="whitespace-nowrap text-label-md font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Log in
          </Link>
          <Button asChild size="sm">
            <Link href={content ? `/signup/${role}` : "/signup"}>
              {content ? content.hero.primaryCta : "Get started"}
            </Link>
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
          {content && (
            <nav className="flex flex-col">
              <MobileLink href="#how-it-works" onClick={() => setOpen(false)}>
                How it works
              </MobileLink>
              <MobileLink href="#fees" onClick={() => setOpen(false)}>
                Fees
              </MobileLink>
              <MobileLink href="#faq" onClick={() => setOpen(false)}>
                FAQ
              </MobileLink>
            </nav>
          )}
          <div className="mt-2 flex flex-col border-t border-outline-variant/70 pt-2">
            {others.map((o) => (
              <MobileLink key={o.path} href={o.path} onClick={() => setOpen(false)}>
                {o.switchLabel}
              </MobileLink>
            ))}
            <MobileLink href="/build" onClick={() => setOpen(false)}>
              Log in
            </MobileLink>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link href={content ? `/signup/${role}` : "/signup"} onClick={() => setOpen(false)}>
              {content ? content.hero.primaryCta : "Get started"}
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function Anchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap rounded-[10px] px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {children}
    </a>
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
