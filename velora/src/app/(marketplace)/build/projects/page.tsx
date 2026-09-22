"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { MapPin } from "lucide-react";

import { getMyProjects } from "@/app/actions/marketplace";
import type { ConstructionProject } from "@/types/marketplace";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const STATUS_LABEL: Record<ConstructionProject["status"], string> = {
  awaiting_inspector: "Needs an inspector",
  awaiting_funding: "Ready to fund",
  active: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function ProjectsPage() {
  const { publicKey, connected } = useWallet();
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }
    void getMyProjects(publicKey.toBase58()).then((res) => {
      if (res.ok) setProjects(res.data);
      setLoading(false);
    });
  }, [publicKey]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-headline-md font-semibold text-on-surface">My projects</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Everything you are building, inspecting, or paying for.
      </p>

      {!connected && (
        <p className="mt-8 rounded-[16px] border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface-variant">
          Connect your wallet to see your projects.
        </p>
      )}

      {connected && loading && <p className="mt-8 text-on-surface-variant">Loading…</p>}

      {connected && !loading && projects.length === 0 && (
        <div className="mt-8 rounded-[20px] border border-dashed border-outline-variant p-10 text-center">
          <p className="text-body-md text-on-surface-variant">
            Nothing here yet.{" "}
            <Link href="/build/jobs" className="text-primary underline underline-offset-4">
              Browse open builds
            </Link>{" "}
            or post one.
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {projects.map((p) => {
          const role =
            publicKey?.toBase58() === p.clientWallet
              ? "Client"
              : publicKey?.toBase58() === p.contractorWallet
                ? "Contractor"
                : "Inspector";
          return (
            <li key={p.id}>
              <Link
                href={`/build/projects/${p.id}`}
                className="block rounded-[20px] border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-title-md font-semibold text-on-surface">{p.title}</h2>
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
                        {role}
                      </span>
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {p.locationCity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-title-sm font-semibold tabular-nums text-on-surface">
                      {usd(p.totalAmountUsd)}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {STATUS_LABEL[p.status]}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
