"use server";

import { revalidatePath } from "next/cache";

import * as db from "@/features/marketplace/data";
import {
  requireWalletAuth,
  WalletAuthError,
  type WalletProof,
} from "@/features/marketplace/auth";
import type {
  Bid,
  ConstructionMilestone,
  ConstructionProject,
  Job,
  MarketplaceProfile,
  MarketplaceRole,
  MilestoneStatus,
  ProposedMilestone,
} from "@/types/marketplace";

/**
 * Server actions for the marketplace.
 *
 * Every mutation takes a `WalletProof` and derives the acting wallet from the
 * verified signature — never from a plain address in the payload. Ownership is
 * then checked against the record being touched, so holding a wallet is not
 * enough on its own to act on someone else's project.
 */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof WalletAuthError) return { ok: false, error: error.message };
  const message = error instanceof Error ? error.message : "Something went wrong";
  // Database errors carry internals; keep those off the client.
  return { ok: false, error: message.startsWith("Velora:") ? message.slice(7).trim() : "Request failed" };
}

class UserFacing extends Error {
  constructor(message: string) {
    super(`Velora: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function saveProfile(
  proof: WalletProof,
  role: MarketplaceRole,
  fields: Parameters<typeof db.upsertProfile>[2]
): Promise<ActionResult<MarketplaceProfile>> {
  try {
    const wallet = requireWalletAuth(proof, "save-profile");
    const profile = await db.upsertProfile(wallet, role, fields);
    revalidatePath("/build");
    return { ok: true, data: profile };
  } catch (error) {
    return fail(error);
  }
}

export async function getMyProfiles(wallet: string): Promise<ActionResult<MarketplaceProfile[]>> {
  try {
    return { ok: true, data: await db.getProfilesForWallet(wallet) };
  } catch (error) {
    return fail(error);
  }
}

export async function listContractors(city?: string): Promise<ActionResult<MarketplaceProfile[]>> {
  try {
    return { ok: true, data: await db.listProfilesByRole("contractor", { city }) };
  } catch (error) {
    return fail(error);
  }
}

export async function listInspectors(city?: string): Promise<ActionResult<MarketplaceProfile[]>> {
  try {
    return { ok: true, data: await db.listProfilesByRole("inspector", { city }) };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function postJob(
  proof: WalletProof,
  input: Parameters<typeof db.createJob>[1]
): Promise<ActionResult<Job>> {
  try {
    const wallet = requireWalletAuth(proof, "post-job");

    if (!input.title?.trim()) throw new UserFacing("A job needs a title");
    if (!input.description?.trim()) throw new UserFacing("A job needs a description");
    if (!input.locationCity?.trim()) throw new UserFacing("Where is the build?");

    const job = await db.createJob(wallet, input);
    revalidatePath("/build/jobs");
    return { ok: true, data: job };
  } catch (error) {
    return fail(error);
  }
}

export async function getOpenJobs(city?: string): Promise<ActionResult<Job[]>> {
  try {
    return { ok: true, data: await db.listOpenJobs({ city }) };
  } catch (error) {
    return fail(error);
  }
}

export async function getJobWithBids(
  jobId: string
): Promise<ActionResult<{ job: Job | null; bids: Bid[] }>> {
  try {
    const [job, bids] = await Promise.all([db.getJob(jobId), db.listBidsForJob(jobId)]);
    return { ok: true, data: { job, bids } };
  } catch (error) {
    return fail(error);
  }
}

export async function getMyJobs(wallet: string): Promise<ActionResult<Job[]>> {
  try {
    return { ok: true, data: await db.listJobsForClient(wallet) };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

export async function submitBid(
  proof: WalletProof,
  input: {
    jobId: string;
    amountUsd: number;
    timelineDays: number;
    proposal: string;
    proposedMilestones: ProposedMilestone[];
  }
): Promise<ActionResult<Bid>> {
  try {
    const wallet = requireWalletAuth(proof, "submit-bid");

    const job = await db.getJob(input.jobId);
    if (!job) throw new UserFacing("That job no longer exists");
    if (job.status !== "open") throw new UserFacing("This job is no longer accepting bids");
    if (job.clientWallet === wallet) throw new UserFacing("You cannot bid on your own job");
    if (input.amountUsd <= 0) throw new UserFacing("Bid amount must be more than zero");

    const total = input.proposedMilestones.reduce((sum, m) => sum + m.amountUsd, 0);
    if (input.proposedMilestones.length > 0 && Math.abs(total - input.amountUsd) > 0.01) {
      throw new UserFacing("Your milestone amounts must add up to your total bid");
    }

    const bid = await db.placeBid(wallet, input);
    revalidatePath(`/build/jobs/${input.jobId}`);
    return { ok: true, data: bid };
  } catch (error) {
    return fail(error);
  }
}

export async function getMyBids(wallet: string): Promise<ActionResult<Bid[]>> {
  try {
    return { ok: true, data: await db.listBidsForContractor(wallet) };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Client accepts a bid. Creates the project record and its milestones from the
 * contractor's proposed breakdown. Nothing touches the chain yet — that
 * happens when the client funds the first milestone.
 */
export async function acceptBidAndCreateProject(
  proof: WalletProof,
  input: { jobId: string; bidId: string; inspectionFeePerMilestoneUsd: number }
): Promise<ActionResult<ConstructionProject>> {
  try {
    const wallet = requireWalletAuth(proof, "accept-bid");

    const [job, bid] = await Promise.all([db.getJob(input.jobId), db.getBid(input.bidId)]);
    if (!job) throw new UserFacing("That job no longer exists");
    if (job.clientWallet !== wallet) throw new UserFacing("Only the client who posted this job can award it");
    if (job.status !== "open") throw new UserFacing("This job has already been awarded");
    if (!bid || bid.jobId !== job.id) throw new UserFacing("That bid does not belong to this job");

    await db.acceptBid(job.id, bid.id);

    const project = await db.createProject({
      jobId: job.id,
      bidId: bid.id,
      clientWallet: wallet,
      contractorWallet: bid.contractorWallet,
      inspectorWallet: null,
      title: job.title,
      locationCity: job.locationCity,
      country: job.country,
      totalAmountUsd: bid.amountUsd,
      inspectionFeeUsd: input.inspectionFeePerMilestoneUsd,
    });

    const stages: ProposedMilestone[] =
      bid.proposedMilestones.length > 0
        ? bid.proposedMilestones
        : evenlySplit(bid.amountUsd, job.expectedMilestones);

    await db.createMilestones(
      project.id,
      stages.map((s, i) => ({
        index: i,
        title: s.title,
        description: s.description ?? null,
        amountUsd: s.amountUsd,
        inspectionFeeUsd: input.inspectionFeePerMilestoneUsd,
      }))
    );

    revalidatePath("/build/projects");
    return { ok: true, data: project };
  } catch (error) {
    return fail(error);
  }
}

/** Fallback breakdown when a contractor bid without proposing stages. */
function evenlySplit(total: number, count: number): ProposedMilestone[] {
  const n = Math.max(1, count);
  const each = Math.floor((total / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => ({
    title: `Stage ${i + 1}`,
    // Last stage absorbs the rounding remainder so the parts sum to the whole.
    amountUsd: i === n - 1 ? Math.round((total - each * (n - 1)) * 100) / 100 : each,
  }));
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getMyProjects(wallet: string): Promise<ActionResult<ConstructionProject[]>> {
  try {
    return { ok: true, data: await db.listProjectsForWallet(wallet) };
  } catch (error) {
    return fail(error);
  }
}

export async function getProjectDetail(
  projectId: string
): Promise<ActionResult<{ project: ConstructionProject | null; milestones: ConstructionMilestone[] }>> {
  try {
    const project = await db.getProject(projectId);
    const milestones = project ? await db.listMilestones(project.id) : [];
    return { ok: true, data: { project, milestones } };
  } catch (error) {
    return fail(error);
  }
}

export async function assignInspector(
  proof: WalletProof,
  input: { projectId: string; inspectorWallet: string }
): Promise<ActionResult<true>> {
  try {
    const wallet = requireWalletAuth(proof, "assign-inspector");

    const project = await db.getProject(input.projectId);
    if (!project) throw new UserFacing("Project not found");
    if (project.clientWallet !== wallet) throw new UserFacing("Only the client can assign the inspector");
    if (input.inspectorWallet === project.contractorWallet) {
      throw new UserFacing("The inspector cannot be the same person as the contractor");
    }
    if (input.inspectorWallet === project.clientWallet) {
      throw new UserFacing("The inspector must be an independent third party");
    }

    await db.setProjectInspector(input.projectId, input.inspectorWallet);
    revalidatePath(`/build/projects/${input.projectId}`);
    return { ok: true, data: true };
  } catch (error) {
    return fail(error);
  }
}

/** Records the on-chain project once the client has created it from their wallet. */
export async function linkOnchainProject(
  proof: WalletProof,
  input: {
    projectId: string;
    onchainProjectId: string;
    pda: string;
    vaultAta: string;
    mint: string;
  }
): Promise<ActionResult<true>> {
  try {
    const wallet = requireWalletAuth(proof, "link-onchain-project");

    const project = await db.getProject(input.projectId);
    if (!project) throw new UserFacing("Project not found");
    if (project.clientWallet !== wallet) throw new UserFacing("Only the client can do this");

    await db.attachOnchainProject(input.projectId, {
      projectId: input.onchainProjectId,
      pda: input.pda,
      vaultAta: input.vaultAta,
      mint: input.mint,
    });
    revalidatePath(`/build/projects/${input.projectId}`);
    return { ok: true, data: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Milestones — these record what the chain already did.
// ---------------------------------------------------------------------------

/**
 * Mirrors a confirmed on-chain state change into Postgres so the UI can render
 * history cheaply. The chain stays the source of truth; if these ever disagree,
 * trust the chain.
 */
export async function recordMilestoneChange(
  proof: WalletProof,
  input: {
    projectId: string;
    index: number;
    status?: MilestoneStatus;
    inspectorApproved?: boolean;
    clientApproved?: boolean;
    evidenceUri?: string;
    signature: string;
    kind: "funded" | "submitted" | "inspector-approved" | "released" | "refunded";
  }
): Promise<ActionResult<true>> {
  try {
    const wallet = requireWalletAuth(proof, "record-milestone");

    const project = await db.getProject(input.projectId);
    if (!project) throw new UserFacing("Project not found");

    const isParty =
      wallet === project.clientWallet ||
      wallet === project.contractorWallet ||
      wallet === project.inspectorWallet;
    if (!isParty) throw new UserFacing("You are not part of this project");

    // Only the party whose action it was may record it.
    const allowed: Record<typeof input.kind, string | null> = {
      funded: project.clientWallet,
      submitted: project.contractorWallet,
      "inspector-approved": project.inspectorWallet,
      released: project.clientWallet,
      refunded: project.clientWallet,
    };
    if (allowed[input.kind] !== wallet) {
      throw new UserFacing("That is not your action to record");
    }

    await db.recordMilestoneState(input.projectId, input.index, {
      status: input.status,
      inspectorApproved: input.inspectorApproved,
      clientApproved: input.clientApproved,
      evidenceUri: input.evidenceUri,
      fundedTx: input.kind === "funded" ? input.signature : undefined,
      submittedTx: input.kind === "submitted" ? input.signature : undefined,
      inspectorApprovedTx: input.kind === "inspector-approved" ? input.signature : undefined,
      releasedTx: input.kind === "released" ? input.signature : undefined,
      refundedTx: input.kind === "refunded" ? input.signature : undefined,
    });

    revalidatePath(`/build/projects/${input.projectId}`);
    return { ok: true, data: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addMilestoneEvidence(
  proof: WalletProof,
  input: {
    projectId: string;
    milestoneId: string;
    fileUrl: string;
    fileType?: "image" | "video" | "document";
    caption?: string;
    capturedAt?: string;
  }
): Promise<ActionResult<true>> {
  try {
    const wallet = requireWalletAuth(proof, "add-evidence");

    const project = await db.getProject(input.projectId);
    if (!project) throw new UserFacing("Project not found");

    const role =
      wallet === project.contractorWallet
        ? "contractor"
        : wallet === project.inspectorWallet
          ? "inspector"
          : null;
    if (!role) throw new UserFacing("Only the contractor or inspector can add evidence");

    await db.addEvidence({
      milestoneId: input.milestoneId,
      uploadedByWallet: wallet,
      uploaderRole: role,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      caption: input.caption ?? null,
      capturedAt: input.capturedAt ?? null,
    });

    revalidatePath(`/build/projects/${input.projectId}`);
    return { ok: true, data: true };
  } catch (error) {
    return fail(error);
  }
}

export async function getMilestoneEvidence(milestoneId: string) {
  try {
    return { ok: true as const, data: await db.listEvidence(milestoneId) };
  } catch (error) {
    return fail(error);
  }
}
