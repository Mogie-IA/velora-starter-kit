"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Hammer, HardHat, Home, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveProfile } from "@/app/actions/marketplace";
import { useWalletProof } from "@/features/marketplace/useWalletProof";
import type { MarketplaceRole } from "@/types/marketplace";

const ROLES: Array<{
  role: MarketplaceRole;
  title: string;
  blurb: string;
  icon: typeof Home;
}> = [
  {
    role: "client",
    title: "I'm building",
    blurb:
      "Fund a build back home stage by stage. Money only moves when the work is verified.",
    icon: Home,
  },
  {
    role: "contractor",
    title: "I build",
    blurb: "Bid on jobs and get paid automatically the moment a stage is approved.",
    icon: Hammer,
  },
  {
    role: "inspector",
    title: "I inspect",
    blurb:
      "Verify work on site as an independent surveyor or engineer, and get paid per visit.",
    icon: ShieldCheck,
  },
];

export default function BuildHomePage() {
  const { connected } = useWallet();
  const { createProof } = useWalletProof();
  const [saving, setSaving] = useState<MarketplaceRole | null>(null);
  const [done, setDone] = useState<MarketplaceRole | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const join = async (role: MarketplaceRole) => {
    setSaving(role);
    setError(null);
    try {
      const res = await saveProfile(await createProof("save-profile"), role, {
        displayName: name.trim() || "Unnamed",
        city: city.trim() || null,
        country: "NG",
      });
      if (!res.ok) setError(res.error);
      else setDone(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section className="max-w-2xl">
        <h1 className="text-headline-lg font-semibold text-on-surface">
          Build back home without losing the money.
        </h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Pay your contractor stage by stage. Each payment is held in escrow and released only
          when an independent inspector confirms the work is actually done — and you agree.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/build/jobs/new">Post a build</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/build/jobs">Find work</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-3">
        <HowItWorks
          icon={<Lock className="h-5 w-5" aria-hidden />}
          title="Money is locked, not sent"
          body="Funds sit in a vault owned by the project itself. Velora cannot move them either."
        />
        <HowItWorks
          icon={<HardHat className="h-5 w-5" aria-hidden />}
          title="Work is verified on site"
          body="A qualified inspector visits and confirms each stage before anything is released."
        />
        <HowItWorks
          icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
          title="Two approvals, always"
          body="The inspector and you both sign off. One approval alone releases nothing."
        />
      </section>

      <section className="mt-14">
        <h2 className="text-title-lg font-semibold text-on-surface">Join as</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          You can hold more than one role — build for others and fund your own project.
        </p>

        {connected && (
          <div className="mt-5 grid max-w-lg gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-label-md font-medium text-on-surface">
                Your name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-label-md font-medium text-on-surface">
                City
              </label>
              <input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lagos"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {ROLES.map(({ role, title, blurb, icon: Icon }) => (
            <div
              key={role}
              className="rounded-[20px] border border-outline-variant bg-surface-container-lowest p-5"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 text-title-sm font-semibold text-on-surface">{title}</h3>
              <p className="mt-1 text-body-sm text-on-surface-variant">{blurb}</p>
              <Button
                className="mt-4 w-full"
                size="sm"
                variant={done === role ? "secondary" : "primary"}
                onClick={() => join(role)}
                disabled={!connected || saving !== null}
              >
                {!connected
                  ? "Connect wallet"
                  : done === role
                    ? "Joined"
                    : saving === role
                      ? "Saving…"
                      : "Join"}
              </Button>
            </div>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-body-sm text-error">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-[12px] border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary";

function HowItWorks({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[20px] border border-outline-variant bg-surface-container-low p-5">
      <span className="text-primary">{icon}</span>
      <h3 className="mt-3 text-title-sm font-semibold text-on-surface">{title}</h3>
      <p className="mt-1 text-body-sm text-on-surface-variant">{body}</p>
    </div>
  );
}
