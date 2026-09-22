"use client";

import { useState } from "react";
import { Check, Clock, ExternalLink, Hammer, Lock, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { explorerTx } from "@/lib/escrow/client";
import { payoutBreakdown } from "@/types/marketplace";
import type { ConstructionMilestone, ConstructionProject } from "@/types/marketplace";
import { ClientFundingBreakdown } from "./FeeBreakdown";
import { useEscrowActions } from "../useEscrowActions";

type Viewer = "client" | "contractor" | "inspector" | "observer";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

export function MilestoneCard({
  project,
  milestone,
  viewer,
  onChanged,
}: {
  project: ConstructionProject;
  milestone: ConstructionMilestone;
  viewer: Viewer;
  onChanged: () => void;
}) {
  const { busy, fundMilestone, submitWork, approveMilestone, refundMilestone } =
    useEscrowActions();
  const [evidenceUri, setEvidenceUri] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showFunding, setShowFunding] = useState(false);

  const isBusy = busy?.endsWith(`-${milestone.index}`) ?? false;

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="rounded-[20px] border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label-sm uppercase tracking-wide text-on-surface-variant">
            Stage {milestone.index + 1}
          </p>
          <h3 className="mt-0.5 text-title-md font-semibold text-on-surface">{milestone.title}</h3>
          {milestone.description && (
            <p className="mt-1 max-w-prose text-body-sm text-on-surface-variant">
              {milestone.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-title-lg font-semibold tabular-nums text-on-surface">
            {usd(milestone.amountUsd)}
          </p>
          <StatusPill status={milestone.status} />
        </div>
      </div>

      {/* The dual sign-off. This is the part that makes the money safe, so it
          is shown as state, not buried in a log. */}
      {(milestone.status === "submitted" || milestone.status === "released") && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ApprovalSlot
            label="Inspector verified on site"
            approved={milestone.inspectorApproved}
            icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
          />
          <ApprovalSlot
            label="Client approved"
            approved={milestone.clientApproved}
            icon={<Check className="h-4 w-4" aria-hidden />}
          />
        </div>
      )}

      {milestone.status === "submitted" && !(milestone.inspectorApproved && milestone.clientApproved) && (
        <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {usd(milestone.amountUsd + milestone.inspectionFeeUsd)} stays locked in escrow until
            both approvals are in. One approval alone cannot release it.
          </span>
        </p>
      )}

      {milestone.evidenceUri && (
        <p className="mt-3 text-body-sm">
          <span className="text-on-surface-variant">Evidence: </span>
          <a
            href={milestone.evidenceUri}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {milestone.evidenceUri}
          </a>
        </p>
      )}

      {/* Actions, scoped to who is looking. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {viewer === "client" && milestone.status === "pending" && (
          <>
            <Button size="sm" onClick={() => setShowFunding((v) => !v)} disabled={isBusy}>
              <Wallet className="h-4 w-4" aria-hidden />
              {showFunding ? "Hide costs" : "Fund this stage"}
            </Button>
            {showFunding && (
              <div className="w-full">
                <div className="mb-3">
                  <ClientFundingBreakdown
                    amountUsd={milestone.amountUsd}
                    inspectionFeeUsd={milestone.inspectionFeeUsd}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => run(() => fundMilestone(project, milestone))}
                  disabled={isBusy}
                >
                  {isBusy ? "Confirming…" : "Confirm and fund"}
                </Button>
              </div>
            )}
          </>
        )}

        {viewer === "client" && milestone.status === "funded" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => run(() => refundMilestone(project, milestone))}
            disabled={isBusy}
          >
            {isBusy ? "Processing…" : "Cancel and refund"}
          </Button>
        )}

        {viewer === "contractor" && milestone.status === "funded" && (
          <div className="w-full space-y-2">
            <label
              htmlFor={`evidence-${milestone.index}`}
              className="text-label-md font-medium text-on-surface"
            >
              Link to your photos or video of the completed work
            </label>
            <input
              id={`evidence-${milestone.index}`}
              value={evidenceUri}
              onChange={(e) => setEvidenceUri(e.target.value)}
              placeholder="https://… or ipfs://…"
              className="h-11 w-full rounded-[12px] border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button
              size="sm"
              onClick={() => run(() => submitWork(project, milestone, evidenceUri.trim()))}
              disabled={isBusy || evidenceUri.trim().length === 0}
            >
              <Hammer className="h-4 w-4" aria-hidden />
              {isBusy ? "Submitting…" : "Submit work for verification"}
            </Button>
          </div>
        )}

        {viewer === "inspector" &&
          milestone.status === "submitted" &&
          !milestone.inspectorApproved && (
            <Button
              size="sm"
              onClick={() => run(() => approveMilestone(project, milestone, "inspector"))}
              disabled={isBusy}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              {isBusy ? "Confirming…" : "Confirm work is complete"}
            </Button>
          )}

        {viewer === "client" && milestone.status === "submitted" && !milestone.clientApproved && (
          <Button
            size="sm"
            onClick={() => run(() => approveMilestone(project, milestone, "client"))}
            disabled={isBusy}
          >
            <Check className="h-4 w-4" aria-hidden />
            {isBusy
              ? "Confirming…"
              : milestone.inspectorApproved
                ? "Approve and release payment"
                : "Approve this stage"}
          </Button>
        )}
      </div>

      {milestone.status === "released" && (
        <ReleaseReceipt milestone={milestone} />
      )}

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {error}
        </p>
      )}

      <TxLinks milestone={milestone} />
    </div>
  );
}

function ApprovalSlot({
  label,
  approved,
  icon,
}: {
  label: string;
  approved: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[12px] border p-3 text-body-sm ${
        approved
          ? "border-tertiary/30 bg-tertiary-container/10 text-on-surface"
          : "border-outline-variant bg-surface-container-low text-on-surface-variant"
      }`}
    >
      <span className={approved ? "text-tertiary" : "text-outline"}>
        {approved ? icon : <Clock className="h-4 w-4" aria-hidden />}
      </span>
      <span>{label}</span>
      <span className="ml-auto font-medium">{approved ? "Done" : "Waiting"}</span>
    </div>
  );
}

function ReleaseReceipt({ milestone }: { milestone: ConstructionMilestone }) {
  const b = payoutBreakdown(milestone.amountUsd, milestone.inspectionFeeUsd);
  return (
    <div className="mt-4 rounded-[12px] border border-tertiary/30 bg-tertiary-container/10 p-4 text-body-sm">
      <p className="font-medium text-on-surface">Paid out</p>
      <ul className="mt-2 space-y-1 text-on-surface-variant">
        <li className="flex justify-between gap-4">
          <span>Contractor</span>
          <span className="tabular-nums text-on-surface">{usd(b.contractorNet)}</span>
        </li>
        {b.inspectorGross > 0 && (
          <li className="flex justify-between gap-4">
            <span>Inspector</span>
            <span className="tabular-nums text-on-surface">{usd(b.inspectorNet)}</span>
          </li>
        )}
        <li className="flex justify-between gap-4">
          <span>Velora fee</span>
          <span className="tabular-nums">{usd(b.protocolTotal)}</span>
        </li>
      </ul>
    </div>
  );
}

/** Every state change links to the chain, so nothing here has to be taken on trust. */
function TxLinks({ milestone }: { milestone: ConstructionMilestone }) {
  const links = [
    ["Funded", milestone.fundedTx],
    ["Submitted", milestone.submittedTx],
    ["Inspector approved", milestone.inspectorApprovedTx],
    ["Released", milestone.releasedTx],
    ["Refunded", milestone.refundedTx],
  ].filter(([, sig]) => Boolean(sig)) as Array<[string, string]>;

  if (links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-outline-variant pt-3">
      {links.map(([label, sig]) => (
        <a
          key={label}
          href={explorerTx(sig)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary"
        >
          {label}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: ConstructionMilestone["status"] }) {
  const map: Record<ConstructionMilestone["status"], { label: string; className: string }> = {
    pending: { label: "Not funded", className: "bg-surface-container text-on-surface-variant" },
    funded: { label: "In escrow", className: "bg-primary/10 text-primary" },
    submitted: { label: "Awaiting approval", className: "bg-secondary-container text-on-secondary-container" },
    released: { label: "Paid", className: "bg-tertiary-container/30 text-tertiary" },
    refunded: { label: "Refunded", className: "bg-error-container text-on-error-container" },
  };
  const { label, className } = map[status];
  return (
    <span
      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-label-sm font-medium ${className}`}
    >
      {label}
    </span>
  );
}
