import Link from "next/link";
import type { ReactNode } from "react";

import { WalletButton } from "@/features/marketplace/components/WalletButton";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/build" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-on-primary font-semibold">
              V
            </span>
            <span className="text-title-sm font-semibold text-on-surface">Velora Build</span>
          </Link>

          <nav className="ml-2 hidden gap-1 sm:flex">
            <NavLink href="/build/jobs">Find work</NavLink>
            <NavLink href="/build/projects">My projects</NavLink>
          </nav>

          <div className="ml-auto">
            <WalletButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[10px] px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {children}
    </Link>
  );
}
