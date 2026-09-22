"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PayoutBreakdown } from "@/features/marketplace/components/FeeBreakdown";
import { useWalletProof } from "@/features/marketplace/useWalletProof";
import {
  acceptBidAndCreateProject,
  getJobWithBids,
  submitBid,
} from "@/app/actions/marketplace";
import type { Bid, Job, ProposedMilestone } from "@/types/marketplace";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;

  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getJobWithBids(params.id);
    if (res.ok) {
      setJob(res.data.job);
      setBids(res.data.bids);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Shell><p className="text-on-surface-variant">Loading…</p></Shell>;
  }
  if (!job) {
    return <Shell><p className="text-error">Job not found</p></Shell>;
  }

  const isOwner = wallet === job.clientWallet;
  const myBid = bids.find((b) => b.contractorWallet === wallet) ?? null;

  return (
    <Shell>
      <Link
        href="/build/jobs"
        className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Open builds
      </Link>

      <header className="mt-4">
        <h1 className="text-headline-md font-semibold text-on-surface">{job.title}</h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-body-md text-on-surface-variant">
          <MapPin className="h-4 w-4" aria-hidden />
          {job.locationCity}
          {job.locationState ? `, ${job.locationState}` : ""}
        </p>
        <p className="mt-4 max-w-prose whitespace-pre-line text-body-md text-on-surface">
          {job.description}
        </p>
        {job.budgetMinUsd !== null && job.budgetMaxUsd !== null && (
          <p className="mt-3 text-body-md text-on-surface-variant">
            Budget {usd(job.budgetMinUsd)} – {usd(job.budgetMaxUsd)} · {job.expectedMilestones}{" "}
            stages
          </p>
        )}
      </header>

      {isOwner ? (
        <ClientBidList job={job} bids={bids} onAwarded={load} />
      ) : (
        <ContractorBidForm job={job} existing={myBid} onSubmitted={load} />
      )}
    </Shell>
  );
}

function ContractorBidForm({
  job,
  existing,
  onSubmitted,
}: {
  job: Job;
  existing: Bid | null;
  onSubmitted: () => void;
}) {
  const { connected } = useWallet();
  const { createProof } = useWalletProof();
  const [amount, setAmount] = useState(existing ? String(existing.amountUsd) : "");
  const [days, setDays] = useState(existing ? String(existing.timelineDays) : "");
  const [proposal, setProposal] = useState(existing?.proposal ?? "");
  const [stages, setStages] = useState<ProposedMilestone[]>(
    existing?.proposedMilestones.length
      ? existing.proposedMilestones
      : Array.from({ length: job.expectedMilestones }, (_, i) => ({
          title: `Stage ${i + 1}`,
          amountUsd: 0,
        }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stagesTotal = stages.reduce((s, m) => s + (Number(m.amountUsd) || 0), 0);
  const bidAmount = Number(amount) || 0;
  const mismatch = stagesTotal > 0 && Math.abs(stagesTotal - bidAmount) > 0.01;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await submitBid(await createProof("submit-bid"), {
        jobId: job.id,
        amountUsd: bidAmount,
        timelineDays: Number(days) || 0,
        proposal: proposal.trim(),
        proposedMilestones: stages.map((s) => ({ ...s, amountUsd: Number(s.amountUsd) || 0 })),
      });
      if (!res.ok) setError(res.error);
      else onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit bid");
    } finally {
      setSaving(false);
    }
  };

  if (job.status !== "open") {
    return (
      <p className="mt-8 rounded-[16px] border border-outline-variant bg-surface-container-low p-4 text-body-md text-on-surface-variant">
        This job has been awarded and is no longer taking bids.
      </p>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-title-lg font-semibold text-on-surface">
        {existing ? "Update your bid" : "Place a bid"}
      </h2>

      <form onSubmit={submit} className="mt-4 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-label-md font-medium text-on-surface">
              Your total price (USD)
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="days" className="text-label-md font-medium text-on-surface">
              Timeline (days)
            </label>
            <input
              id="days"
              type="number"
              min="1"
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="proposal" className="text-label-md font-medium text-on-surface">
            Why you
          </label>
          <textarea
            id="proposal"
            rows={4}
            required
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Similar builds you have delivered, your team, materials you would use."
            className={`${inputClass} h-auto py-3`}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-label-md font-medium text-on-surface">
            How you would stage the work
          </legend>
          <p className="text-body-sm text-on-surface-variant">
            The client funds and approves these one at a time. They must add up to your total.
          </p>
          {stages.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Stage ${i + 1} name`}
                value={s.title}
                onChange={(e) =>
                  setStages((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, title: e.target.value } : p))
                  )
                }
                className={`${inputClass} flex-1`}
              />
              <input
                aria-label={`Stage ${i + 1} amount`}
                type="number"
                min="0"
                value={s.amountUsd || ""}
                onChange={(e) =>
                  setStages((prev) =>
                    prev.map((p, idx) =>
                      idx === i ? { ...p, amountUsd: Number(e.target.value) } : p
                    )
                  )
                }
                className={`${inputClass} w-36`}
              />
            </div>
          ))}
          <p
            className={`text-body-sm ${mismatch ? "text-error" : "text-on-surface-variant"}`}
          >
            Stages total {usd(stagesTotal)}
            {mismatch ? ` — does not match your bid of ${usd(bidAmount)}` : ""}
          </p>
        </fieldset>

        {bidAmount > 0 && (
          <PayoutBreakdown
            amountUsd={bidAmount}
            inspectionFeeUsd={0}
            audience="contractor"
          />
        )}

        {error && (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving || !connected || mismatch}>
          {saving ? "Submitting…" : connected ? (existing ? "Update bid" : "Submit bid") : "Connect wallet to bid"}
        </Button>
      </form>
    </section>
  );
}

function ClientBidList({
  job,
  bids,
  onAwarded,
}: {
  job: Job;
  bids: Bid[];
  onAwarded: () => void;
}) {
  const router = useRouter();
  const { createProof } = useWalletProof();
  const [inspectionFee, setInspectionFee] = useState("100");
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const award = async (bid: Bid) => {
    setWorking(bid.id);
    setError(null);
    try {
      const res = await acceptBidAndCreateProject(await createProof("accept-bid"), {
        jobId: job.id,
        bidId: bid.id,
        inspectionFeePerMilestoneUsd: Number(inspectionFee) || 0,
      });
      if (!res.ok) setError(res.error);
      else {
        onAwarded();
        router.push(`/build/projects/${res.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not award the job");
    } finally {
      setWorking(null);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-title-lg font-semibold text-on-surface">
        Bids ({bids.length})
      </h2>

      {job.status === "awarded" && (
        <p className="mt-2 text-body-sm text-on-surface-variant">
          This job has been awarded.
        </p>
      )}

      {bids.length === 0 ? (
        <p className="mt-4 text-body-md text-on-surface-variant">
          No bids yet. Contractors in {job.locationCity} will see this on the job board.
        </p>
      ) : (
        <>
          {job.status === "open" && (
            <div className="mt-4 max-w-xs space-y-1.5">
              <label htmlFor="fee" className="text-label-md font-medium text-on-surface">
                Inspection fee per stage (USD)
              </label>
              <input
                id="fee"
                type="number"
                min="0"
                value={inspectionFee}
                onChange={(e) => setInspectionFee(e.target.value)}
                className={inputClass}
              />
              <p className="text-body-sm text-on-surface-variant">
                Paid to the independent inspector each time they verify a stage.
              </p>
            </div>
          )}

          <ul className="mt-5 space-y-3">
            {bids.map((bid) => (
              <li
                key={bid.id}
                className="rounded-[20px] border border-outline-variant bg-surface-container-lowest p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-body-sm text-on-surface-variant">
                      {bid.contractorWallet.slice(0, 4)}…{bid.contractorWallet.slice(-4)}
                    </p>
                    <p className="mt-2 max-w-prose whitespace-pre-line text-body-md text-on-surface">
                      {bid.proposal}
                    </p>
                    {bid.proposedMilestones.length > 0 && (
                      <ul className="mt-3 space-y-1 text-body-sm text-on-surface-variant">
                        {bid.proposedMilestones.map((m, i) => (
                          <li key={i} className="flex justify-between gap-4 max-w-sm">
                            <span>{m.title}</span>
                            <span className="tabular-nums">{usd(m.amountUsd)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-title-lg font-semibold tabular-nums text-on-surface">
                      {usd(bid.amountUsd)}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {bid.timelineDays} days
                    </p>
                    {bid.status === "accepted" && (
                      <span className="mt-2 inline-block rounded-full bg-tertiary-container/30 px-2.5 py-0.5 text-label-sm font-medium text-tertiary">
                        Awarded
                      </span>
                    )}
                  </div>
                </div>

                {job.status === "open" && (
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => award(bid)}
                    disabled={working !== null}
                  >
                    {working === bid.id ? "Awarding…" : "Award this contractor"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-body-sm text-error">
          {error}
        </p>
      )}
    </section>
  );
}

const inputClass =
  "h-12 w-full rounded-[12px] border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">{children}</div>;
}
