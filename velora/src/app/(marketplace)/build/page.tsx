"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, Hammer, Home, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/features/marketplace/components/WalletButton";
import { getMyProfiles, getMyProjects } from "@/app/actions/marketplace";
import type {
  ConstructionProject,
  MarketplaceProfile,
  MarketplaceRole,
} from "@/types/marketplace";

/**
 * The signed-in hub.
 *
 * Sign-up lives on the marketing site now, so this page no longer asks who you
 * are — it reads the roles already on your wallet and shows the next useful
 * action for each. Holding more than one role is normal: a contractor in Lagos
 * may also be funding their own build.
 */

const ROLE_UI: Record<
  MarketplaceRole,
  { icon: typeof Home; title: string; actions: Array<{ label: string; href: string }> }
> = {
  client: {
    icon: Home,
    title: "Building",
    actions: [
      { label: "Post a build", href: "/build/jobs/new" },
      { label: "Browse contractors", href: "/build/contractors" },
      { label: "Browse inspectors", href: "/build/inspectors" },
    ],
  },
  contractor: {
    icon: Hammer,
    title: "Contracting",
    actions: [{ label: "Find open jobs", href: "/build/jobs" }],
  },
  inspector: {
    icon: ShieldCheck,
    title: "Inspecting",
    actions: [{ label: "Find jobs to inspect", href: "/build/jobs" }],
  },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function BuildHomePage() {
  const { publicKey, connected } = useWallet();
  const [profiles, setProfiles] = useState<MarketplaceProfile[]>([]);
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wallet = publicKey?.toBase58();
    if (!wallet) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.all([getMyProfiles(wallet), getMyProjects(wallet)]).then(([p, pr]) => {
      if (p.ok) setProfiles(p.data);
      if (pr.ok) setProjects(pr.data);
      setLoading(false);
    });
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-headline-md font-semibold text-on-surface">Log in to Velora</h1>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Your wallet is your account. Connect it to see your projects — signing in cannot move any
          money.
        </p>
        <div className="mt-7 flex justify-center">
          <WalletButton />
        </div>
        <p className="mt-6 text-body-sm text-on-surface-variant">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  const roles = profiles.map((p) => p.role);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-headline-lg font-semibold tracking-tight text-on-surface">
        {profiles[0] ? `Welcome back, ${firstName(profiles[0].displayName)}.` : "Welcome to Velora."}
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Everything you&apos;re building, inspecting, or paying for.
      </p>

      {loading && <p className="mt-10 text-body-md text-on-surface-variant">Loading…</p>}

      {!loading && roles.length === 0 && (
        <div className="mt-8 rounded-card border border-outline-variant bg-surface-container-lowest p-8">
          <h2 className="text-title-md font-semibold text-on-surface">
            This wallet has no Velora profile yet
          </h2>
          <p className="mt-2 max-w-lg text-body-md text-on-surface-variant">
            Pick how you&apos;ll use Velora and we&apos;ll set up your profile — it takes a minute.
          </p>
          <Button asChild className="mt-6">
            <Link href="/signup">Create my account</Link>
          </Button>
        </div>
      )}

      {!loading && roles.length > 0 && (
        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {profiles.map((profile) => {
            const ui = ROLE_UI[profile.role];
            const Icon = ui.icon;
            return (
              <div
                key={profile.id}
                className="rounded-card border border-outline-variant bg-surface-container-lowest p-5 shadow-surface"
              >
                <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-primary-fixed text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-title-sm font-semibold text-on-surface">{ui.title}</h2>
                <ul className="mt-3 space-y-1.5">
                  {ui.actions.map((action) => (
                    <li key={action.href + action.label}>
                      <Link
                        href={action.href}
                        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {!loading && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-title-lg font-semibold text-on-surface">Your projects</h2>
            {projects.length > 0 && (
              <Link
                href="/build/projects"
                className="text-body-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                See all
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-outline-variant p-8 text-center text-body-md text-on-surface-variant">
              Nothing under way yet.{" "}
              <Link href="/build/jobs" className="text-primary underline underline-offset-4">
                Browse open builds
              </Link>{" "}
              or post one.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {projects.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/build/projects/${p.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-primary/40"
                  >
                    <div>
                      <p className="text-title-sm font-semibold text-on-surface">{p.title}</p>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">
                        {p.locationCity}
                      </p>
                    </div>
                    <p className="text-title-sm font-semibold tabular-nums text-on-surface">
                      {usd(p.totalAmountUsd)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full.trim();
}
