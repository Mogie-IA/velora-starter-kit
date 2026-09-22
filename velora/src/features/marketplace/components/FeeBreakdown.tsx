"use client";

import { clientFundingBreakdown, payoutBreakdown, FEE_BPS } from "@/types/marketplace";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const pct = (bps: number) => `${bps / 100}%`;

/**
 * What the client pays, itemised, before they fund anything.
 * The platform fee is shown as a separate line rather than folded into a
 * total, so nobody discovers it after the fact.
 */
export function ClientFundingBreakdown({
  amountUsd,
  inspectionFeeUsd,
}: {
  amountUsd: number;
  inspectionFeeUsd: number;
}) {
  const b = clientFundingBreakdown(amountUsd, inspectionFeeUsd);

  return (
    <div className="rounded-[16px] border border-outline-variant bg-surface-container-low p-4">
      <p className="text-label-md font-semibold text-on-surface">You will pay</p>
      <dl className="mt-3 space-y-2 text-body-sm">
        <Row label="Milestone payment" value={usd(b.milestoneAmount)} />
        {b.inspectionFee > 0 && <Row label="Inspection fee" value={usd(b.inspectionFee)} />}
        <Row
          label={`Velora platform fee (${pct(FEE_BPS.client)})`}
          value={usd(b.platformFee)}
          muted
        />
        <div className="border-t border-outline-variant pt-2">
          <Row label="Total from your wallet" value={usd(b.total)} bold />
        </div>
      </dl>
      <p className="mt-3 text-body-sm text-on-surface-variant">
        {usd(b.escrowed)} is locked in escrow. It is only released when both your inspector and
        you approve the work.
      </p>
    </div>
  );
}

/**
 * What a contractor and inspector actually take home. Shown on the job page
 * before a contractor bids, so the 1% is never a surprise later.
 */
export function PayoutBreakdown({
  amountUsd,
  inspectionFeeUsd,
  audience,
}: {
  amountUsd: number;
  inspectionFeeUsd: number;
  audience: "contractor" | "inspector";
}) {
  const b = payoutBreakdown(amountUsd, inspectionFeeUsd);
  const isContractor = audience === "contractor";

  const gross = isContractor ? b.contractorGross : b.inspectorGross;
  const fee = isContractor ? b.contractorFee : b.inspectorFee;
  const net = isContractor ? b.contractorNet : b.inspectorNet;
  const bps = isContractor ? FEE_BPS.contractor : FEE_BPS.inspector;

  return (
    <div className="rounded-[16px] border border-outline-variant bg-surface-container-low p-4">
      <p className="text-label-md font-semibold text-on-surface">You will receive</p>
      <dl className="mt-3 space-y-2 text-body-sm">
        <Row label={isContractor ? "Milestone payment" : "Inspection fee"} value={usd(gross)} />
        <Row label={`Velora fee (${pct(bps)})`} value={`− ${usd(fee)}`} muted />
        <div className="border-t border-outline-variant pt-2">
          <Row label="Paid to your wallet" value={usd(net)} bold />
        </div>
      </dl>
      <p className="mt-3 text-body-sm text-on-surface-variant">
        Paid automatically the moment the milestone is approved by both parties. No invoicing,
        no chasing.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? "text-on-surface-variant" : "text-on-surface"}>{label}</dt>
      <dd
        className={`tabular-nums ${bold ? "text-title-sm font-semibold text-on-surface" : muted ? "text-on-surface-variant" : "text-on-surface"}`}
      >
        {value}
      </dd>
    </div>
  );
}
