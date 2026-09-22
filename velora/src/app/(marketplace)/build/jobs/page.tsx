"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOpenJobs } from "@/app/actions/marketplace";
import type { Job } from "@/types/marketplace";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getOpenJobs().then((res) => {
      if (res.ok) setJobs(res.data);
      else setError(res.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-semibold text-on-surface">Open builds</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Jobs waiting on a contractor. Every one pays through escrow, stage by stage.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/build/jobs/new">
            <Plus className="h-4 w-4" aria-hidden />
            Post a build
          </Link>
        </Button>
      </div>

      {loading && <p className="mt-8 text-on-surface-variant">Loading…</p>}
      {error && (
        <p role="alert" className="mt-8 text-error">
          {error}
        </p>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="mt-8 rounded-[20px] border border-dashed border-outline-variant p-10 text-center">
          <p className="text-body-md text-on-surface-variant">
            No open jobs yet. Post the first one.
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/build/jobs/${job.id}`}
              className="block rounded-[20px] border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-title-md font-semibold text-on-surface">{job.title}</h2>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {job.locationCity}
                    {job.locationState ? `, ${job.locationState}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 max-w-prose text-body-sm text-on-surface-variant">
                    {job.description}
                  </p>
                </div>
                <div className="text-right">
                  {job.budgetMinUsd !== null && job.budgetMaxUsd !== null ? (
                    <p className="text-title-sm font-semibold tabular-nums text-on-surface">
                      {usd(job.budgetMinUsd)} – {usd(job.budgetMaxUsd)}
                    </p>
                  ) : (
                    <p className="text-body-sm text-on-surface-variant">Budget open</p>
                  )}
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {job.expectedMilestones} stages
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
