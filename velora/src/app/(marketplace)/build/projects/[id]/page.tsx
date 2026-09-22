"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { AlertCircle, ArrowLeft, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MilestoneCard } from "@/features/marketplace/components/MilestoneCard";
import { useEscrowActions } from "@/features/marketplace/useEscrowActions";
import { useWalletProof } from "@/features/marketplace/useWalletProof";
import {
  assignInspector,
  getProjectDetail,
  listInspectors,
} from "@/app/actions/marketplace";
import type {
  ConstructionMilestone,
  ConstructionProject,
  MarketplaceProfile,
} from "@/types/marketplace";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;

  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [milestones, setMilestones] = useState<ConstructionMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getProjectDetail(params.id);
    if (res.ok) {
      setProject(res.data.project);
      setMilestones(res.data.milestones);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Shell><p className="text-on-surface-variant">Loading project…</p></Shell>;
  }

  if (error || !project) {
    return (
      <Shell>
        <p className="text-error">{error ?? "Project not found"}</p>
      </Shell>
    );
  }

  const viewer: "client" | "contractor" | "inspector" | "observer" =
    wallet === project.clientWallet
      ? "client"
      : wallet === project.contractorWallet
        ? "contractor"
        : wallet === project.inspectorWallet
          ? "inspector"
          : "observer";

  const escrowed = milestones
    .filter((m) => m.status === "funded" || m.status === "submitted")
    .reduce((sum, m) => sum + m.amountUsd + m.inspectionFeeUsd, 0);
  const paid = milestones
    .filter((m) => m.status === "released")
    .reduce((sum, m) => sum + m.amountUsd, 0);

  return (
    <Shell>
      <Link
        href="/build/projects"
        className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All projects
      </Link>

      <header className="mt-4">
        <h1 className="text-headline-md font-semibold text-on-surface">{project.title}</h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-body-md text-on-surface-variant">
          <MapPin className="h-4 w-4" aria-hidden />
          {project.locationCity}, {project.country}
        </p>
      </header>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Contract value" value={usd(project.totalAmountUsd)} />
        <Stat label="Held in escrow" value={usd(escrowed)} />
        <Stat label="Paid out so far" value={usd(paid)} />
      </dl>

      {viewer === "observer" && (
        <Note>
          You are viewing this project read-only. Only the client, contractor and assigned
          inspector can act on it.
        </Note>
      )}

      {!project.inspectorWallet && viewer === "client" && (
        <AssignInspector projectId={project.id} city={project.locationCity} onDone={load} />
      )}

      {project.inspectorWallet && !project.onchainProjectId && viewer === "client" && (
        <PutOnChain project={project} milestones={milestones} onDone={load} />
      )}

      <section className="mt-8">
        <h2 className="text-title-lg font-semibold text-on-surface">Stages</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Each stage is funded separately and pays out only when your inspector and you both
          approve it.
        </p>
        <div className="mt-4 space-y-4">
          {milestones.map((m) => (
            <MilestoneCard
              key={m.id}
              project={project}
              milestone={m}
              viewer={viewer}
              onChanged={load}
            />
          ))}
        </div>
      </section>
    </Shell>
  );
}

function AssignInspector({
  projectId,
  city,
  onDone,
}: {
  projectId: string;
  city: string;
  onDone: () => void;
}) {
  const { createProof } = useWalletProof();
  const [inspectors, setInspectors] = useState<MarketplaceProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listInspectors(city).then((res) => {
      if (res.ok) setInspectors(res.data);
    });
  }, [city]);

  const choose = async (inspectorWallet: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await assignInspector(await createProof("assign-inspector"), {
        projectId,
        inspectorWallet,
      });
      if (!res.ok) setError(res.error);
      else onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not assign inspector");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-[20px] border border-outline-variant bg-surface-container-low p-5">
      <h2 className="inline-flex items-center gap-2 text-title-md font-semibold text-on-surface">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        Choose an inspector
      </h2>
      <p className="mt-1 max-w-prose text-body-sm text-on-surface-variant">
        An independent surveyor or engineer verifies each stage on site before money is released.
        They cannot be the contractor, and the contractor cannot approve their own work.
      </p>

      {inspectors.length === 0 ? (
        <p className="mt-4 text-body-sm text-on-surface-variant">
          No inspectors listed in {city} yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {inspectors.map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-outline-variant bg-surface-container-lowest p-3"
            >
              <div>
                <p className="text-body-md font-medium text-on-surface">{i.displayName}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {i.qualification ?? "Inspector"}
                  {i.licenseNumber ? ` · Licence ${i.licenseNumber}` : ""}
                  {` · ${i.jobsCompleted} verified`}
                </p>
              </div>
              <Button size="sm" onClick={() => choose(i.walletAddress)} disabled={saving}>
                Assign
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {error}
        </p>
      )}
    </section>
  );
}

function PutOnChain({
  project,
  milestones,
  onDone,
}: {
  project: ConstructionProject;
  milestones: ConstructionMilestone[];
  onDone: () => void;
}) {
  const { createOnchainProject, busy } = useEscrowActions();
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setError(null);
    try {
      await createOnchainProject(project, milestones);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the on-chain project");
    }
  };

  return (
    <section className="mt-6 rounded-[20px] border border-primary/20 bg-primary/5 p-5">
      <h2 className="text-title-md font-semibold text-on-surface">Set up the escrow</h2>
      <p className="mt-1 max-w-prose text-body-sm text-on-surface-variant">
        This creates the project and its {milestones.length} stages on Solana. The vault that
        holds your money is owned by the project itself — not by Velora, not by the contractor.
      </p>
      <Button className="mt-4" size="sm" onClick={go} disabled={busy !== null}>
        {busy === "create-project" ? "Creating…" : "Create escrow on Solana"}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {error}
        </p>
      )}
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-outline-variant bg-surface-container-lowest p-4">
      <dt className="text-label-sm uppercase tracking-wide text-on-surface-variant">{label}</dt>
      <dd className="mt-1 text-title-lg font-semibold tabular-nums text-on-surface">{value}</dd>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 flex items-start gap-2 rounded-[12px] border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
