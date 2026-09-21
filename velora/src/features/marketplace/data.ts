import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/database";
import type {
  Bid,
  ConstructionMilestone,
  ConstructionProject,
  Job,
  MarketplaceProfile,
  MarketplaceRole,
  MilestoneEvidence,
  MilestoneStatus,
  ProposedMilestone,
} from "@/types/marketplace";

/**
 * Data access for the marketplace.
 *
 * Everything here runs server-side with the service key, so callers must have
 * already established who the user is — see `requireWalletAuth`. Nothing in
 * this file checks permissions; that is the caller's job.
 */

type Row = Record<string, unknown>;

const num = (v: unknown, fallback = 0): number =>
  v === null || v === undefined ? fallback : Number(v);

// ---------------------------------------------------------------------------
// Mappers: snake_case rows -> camelCase domain objects
// ---------------------------------------------------------------------------

function toProfile(r: Row): MarketplaceProfile {
  return {
    id: r.id as string,
    walletAddress: r.wallet_address as string,
    role: r.role as MarketplaceRole,
    displayName: r.display_name as string,
    email: (r.email as string) ?? null,
    phone: (r.phone as string) ?? null,
    country: r.country as string,
    city: (r.city as string) ?? null,
    avatarUrl: (r.avatar_url as string) ?? null,
    bio: (r.bio as string) ?? null,
    companyName: (r.company_name as string) ?? null,
    yearsExperience: r.years_experience === null ? null : num(r.years_experience),
    specialties: (r.specialties as string[]) ?? null,
    qualification: (r.qualification as string) ?? null,
    licenseNumber: (r.license_number as string) ?? null,
    serviceAreas: (r.service_areas as string[]) ?? null,
    verificationStatus: r.verification_status as MarketplaceProfile["verificationStatus"],
    jobsCompleted: num(r.jobs_completed),
    disputesRaised: num(r.disputes_raised),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toJob(r: Row): Job {
  return {
    id: r.id as string,
    clientWallet: r.client_wallet as string,
    title: r.title as string,
    description: r.description as string,
    locationCity: r.location_city as string,
    locationState: (r.location_state as string) ?? null,
    country: r.country as string,
    budgetMinUsd: r.budget_min_usd === null ? null : num(r.budget_min_usd),
    budgetMaxUsd: r.budget_max_usd === null ? null : num(r.budget_max_usd),
    expectedMilestones: num(r.expected_milestones, 4),
    status: r.status as Job["status"],
    bidsCloseAt: (r.bids_close_at as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toBid(r: Row): Bid {
  return {
    id: r.id as string,
    jobId: r.job_id as string,
    contractorWallet: r.contractor_wallet as string,
    amountUsd: num(r.amount_usd),
    timelineDays: num(r.timeline_days),
    proposal: r.proposal as string,
    proposedMilestones: (r.proposed_milestones as ProposedMilestone[]) ?? [],
    status: r.status as Bid["status"],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toProject(r: Row): ConstructionProject {
  return {
    id: r.id as string,
    jobId: (r.job_id as string) ?? null,
    bidId: (r.bid_id as string) ?? null,
    clientWallet: r.client_wallet as string,
    contractorWallet: r.contractor_wallet as string,
    inspectorWallet: (r.inspector_wallet as string) ?? null,
    title: r.title as string,
    locationCity: r.location_city as string,
    country: r.country as string,
    onchainProjectId: r.onchain_project_id === null ? null : String(r.onchain_project_id),
    onchainProjectPda: (r.onchain_project_pda as string) ?? null,
    onchainVaultAta: (r.onchain_vault_ata as string) ?? null,
    mint: (r.mint as string) ?? null,
    totalAmountUsd: num(r.total_amount_usd),
    inspectionFeeUsd: num(r.inspection_fee_usd),
    status: r.status as ConstructionProject["status"],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toMilestone(r: Row): ConstructionMilestone {
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    index: num(r.index),
    title: r.title as string,
    description: (r.description as string) ?? null,
    amountUsd: num(r.amount_usd),
    inspectionFeeUsd: num(r.inspection_fee_usd),
    status: r.status as MilestoneStatus,
    inspectorApproved: Boolean(r.inspector_approved),
    clientApproved: Boolean(r.client_approved),
    evidenceUri: (r.evidence_uri as string) ?? null,
    fundedTx: (r.funded_tx as string) ?? null,
    submittedTx: (r.submitted_tx as string) ?? null,
    inspectorApprovedTx: (r.inspector_approved_tx as string) ?? null,
    releasedTx: (r.released_tx as string) ?? null,
    refundedTx: (r.refunded_tx as string) ?? null,
    fundedAt: (r.funded_at as string) ?? null,
    submittedAt: (r.submitted_at as string) ?? null,
    releasedAt: (r.released_at as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function toEvidence(r: Row): MilestoneEvidence {
  return {
    id: r.id as string,
    milestoneId: r.milestone_id as string,
    uploadedByWallet: r.uploaded_by_wallet as string,
    uploaderRole: r.uploader_role as MilestoneEvidence["uploaderRole"],
    fileUrl: r.file_url as string,
    fileType: r.file_type as MilestoneEvidence["fileType"],
    caption: (r.caption as string) ?? null,
    capturedAt: (r.captured_at as string) ?? null,
    createdAt: r.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getProfile(
  walletAddress: string,
  role: MarketplaceRole
): Promise<MarketplaceProfile | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .eq("role", role)
    .maybeSingle();

  if (error) throw new Error(`getProfile: ${error.message}`);
  return data ? toProfile(data as Row) : null;
}

export async function getProfilesForWallet(walletAddress: string): Promise<MarketplaceProfile[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("wallet_address", walletAddress);

  if (error) throw new Error(`getProfilesForWallet: ${error.message}`);
  return (data ?? []).map((r) => toProfile(r as Row));
}

export async function upsertProfile(
  walletAddress: string,
  role: MarketplaceRole,
  fields: Partial<
    Pick<
      MarketplaceProfile,
      | "displayName"
      | "email"
      | "phone"
      | "country"
      | "city"
      | "avatarUrl"
      | "bio"
      | "companyName"
      | "yearsExperience"
      | "specialties"
      | "qualification"
      | "licenseNumber"
      | "serviceAreas"
    >
  >
): Promise<MarketplaceProfile> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .upsert(
      {
        wallet_address: walletAddress,
        role,
        display_name: fields.displayName ?? "Unnamed",
        email: fields.email ?? null,
        phone: fields.phone ?? null,
        country: fields.country ?? "NG",
        city: fields.city ?? null,
        avatar_url: fields.avatarUrl ?? null,
        bio: fields.bio ?? null,
        company_name: fields.companyName ?? null,
        years_experience: fields.yearsExperience ?? null,
        specialties: fields.specialties ?? null,
        qualification: fields.qualification ?? null,
        license_number: fields.licenseNumber ?? null,
        service_areas: fields.serviceAreas ?? null,
      },
      { onConflict: "wallet_address,role" }
    )
    .select("*")
    .single();

  if (error) throw new Error(`upsertProfile: ${error.message}`);
  return toProfile(data as Row);
}

export async function listProfilesByRole(
  role: MarketplaceRole,
  opts: { city?: string; limit?: number } = {}
): Promise<MarketplaceProfile[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("role", role)
    .order("jobs_completed", { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.city) query = query.eq("city", opts.city);

  const { data, error } = await query;
  if (error) throw new Error(`listProfilesByRole: ${error.message}`);
  return (data ?? []).map((r) => toProfile(r as Row));
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function createJob(
  clientWallet: string,
  input: Pick<
    Job,
    | "title"
    | "description"
    | "locationCity"
    | "locationState"
    | "country"
    | "budgetMinUsd"
    | "budgetMaxUsd"
    | "expectedMilestones"
  >
): Promise<Job> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      client_wallet: clientWallet,
      title: input.title,
      description: input.description,
      location_city: input.locationCity,
      location_state: input.locationState,
      country: input.country,
      budget_min_usd: input.budgetMinUsd,
      budget_max_usd: input.budgetMaxUsd,
      expected_milestones: input.expectedMilestones,
    })
    .select("*")
    .single();

  if (error) throw new Error(`createJob: ${error.message}`);
  return toJob(data as Row);
}

export async function listOpenJobs(opts: { city?: string; limit?: number } = {}): Promise<Job[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.city) query = query.eq("location_city", opts.city);

  const { data, error } = await query;
  if (error) throw new Error(`listOpenJobs: ${error.message}`);
  return (data ?? []).map((r) => toJob(r as Row));
}

export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (error) throw new Error(`getJob: ${error.message}`);
  return data ? toJob(data as Row) : null;
}

export async function listJobsForClient(clientWallet: string): Promise<Job[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_wallet", clientWallet)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listJobsForClient: ${error.message}`);
  return (data ?? []).map((r) => toJob(r as Row));
}

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

export async function placeBid(
  contractorWallet: string,
  input: Pick<Bid, "jobId" | "amountUsd" | "timelineDays" | "proposal" | "proposedMilestones">
): Promise<Bid> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bids")
    .upsert(
      {
        job_id: input.jobId,
        contractor_wallet: contractorWallet,
        amount_usd: input.amountUsd,
        timeline_days: input.timelineDays,
        proposal: input.proposal,
        // Stored as jsonb; the shape is validated before it reaches here.
        proposed_milestones: input.proposedMilestones as unknown as Json,
        status: "pending",
      },
      { onConflict: "job_id,contractor_wallet" }
    )
    .select("*")
    .single();

  if (error) throw new Error(`placeBid: ${error.message}`);
  return toBid(data as Row);
}

export async function listBidsForJob(jobId: string): Promise<Bid[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`listBidsForJob: ${error.message}`);
  return (data ?? []).map((r) => toBid(r as Row));
}

export async function listBidsForContractor(contractorWallet: string): Promise<Bid[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("contractor_wallet", contractorWallet)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listBidsForContractor: ${error.message}`);
  return (data ?? []).map((r) => toBid(r as Row));
}

export async function getBid(bidId: string): Promise<Bid | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("bids").select("*").eq("id", bidId).maybeSingle();
  if (error) throw new Error(`getBid: ${error.message}`);
  return data ? toBid(data as Row) : null;
}

/**
 * Accepts one bid and rejects the rest, then marks the job awarded. Done in
 * sequence rather than a transaction — if a later step fails the job stays
 * open and the client can retry, which is the safe direction to fail.
 */
export async function acceptBid(jobId: string, bidId: string): Promise<void> {
  const supabase = createServiceClient();

  const { error: acceptError } = await supabase
    .from("bids")
    .update({ status: "accepted" })
    .eq("id", bidId)
    .eq("job_id", jobId);
  if (acceptError) throw new Error(`acceptBid: ${acceptError.message}`);

  const { error: rejectError } = await supabase
    .from("bids")
    .update({ status: "rejected" })
    .eq("job_id", jobId)
    .neq("id", bidId)
    .eq("status", "pending");
  if (rejectError) throw new Error(`acceptBid (rejecting others): ${rejectError.message}`);

  const { error: jobError } = await supabase
    .from("jobs")
    .update({ status: "awarded" })
    .eq("id", jobId);
  if (jobError) throw new Error(`acceptBid (awarding job): ${jobError.message}`);
}

// ---------------------------------------------------------------------------
// Projects and milestones
// ---------------------------------------------------------------------------

export async function createProject(input: {
  jobId: string | null;
  bidId: string | null;
  clientWallet: string;
  contractorWallet: string;
  inspectorWallet: string | null;
  title: string;
  locationCity: string;
  country: string;
  totalAmountUsd: number;
  inspectionFeeUsd: number;
}): Promise<ConstructionProject> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("construction_projects")
    .insert({
      job_id: input.jobId,
      bid_id: input.bidId,
      client_wallet: input.clientWallet,
      contractor_wallet: input.contractorWallet,
      inspector_wallet: input.inspectorWallet,
      title: input.title,
      location_city: input.locationCity,
      country: input.country,
      total_amount_usd: input.totalAmountUsd,
      inspection_fee_usd: input.inspectionFeeUsd,
      status: input.inspectorWallet ? "awaiting_funding" : "awaiting_inspector",
    })
    .select("*")
    .single();

  if (error) throw new Error(`createProject: ${error.message}`);
  return toProject(data as Row);
}

export async function getProject(projectId: string): Promise<ConstructionProject | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("construction_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw new Error(`getProject: ${error.message}`);
  return data ? toProject(data as Row) : null;
}

/** Every project a wallet touches, in any of the three roles. */
export async function listProjectsForWallet(wallet: string): Promise<ConstructionProject[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("construction_projects")
    .select("*")
    .or(
      `client_wallet.eq.${wallet},contractor_wallet.eq.${wallet},inspector_wallet.eq.${wallet}`
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listProjectsForWallet: ${error.message}`);
  return (data ?? []).map((r) => toProject(r as Row));
}

export async function attachOnchainProject(
  projectId: string,
  onchain: { projectId: string; pda: string; vaultAta: string; mint: string }
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("construction_projects")
    .update({
      onchain_project_id: onchain.projectId,
      onchain_project_pda: onchain.pda,
      onchain_vault_ata: onchain.vaultAta,
      mint: onchain.mint,
      status: "active",
    })
    .eq("id", projectId);

  if (error) throw new Error(`attachOnchainProject: ${error.message}`);
}

export async function setProjectInspector(
  projectId: string,
  inspectorWallet: string
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("construction_projects")
    .update({ inspector_wallet: inspectorWallet, status: "awaiting_funding" })
    .eq("id", projectId);

  if (error) throw new Error(`setProjectInspector: ${error.message}`);
}

export async function createMilestones(
  projectId: string,
  milestones: Array<{
    index: number;
    title: string;
    description?: string | null;
    amountUsd: number;
    inspectionFeeUsd: number;
  }>
): Promise<ConstructionMilestone[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("construction_milestones")
    .insert(
      milestones.map((m) => ({
        project_id: projectId,
        index: m.index,
        title: m.title,
        description: m.description ?? null,
        amount_usd: m.amountUsd,
        inspection_fee_usd: m.inspectionFeeUsd,
      }))
    )
    .select("*");

  if (error) throw new Error(`createMilestones: ${error.message}`);
  return (data ?? []).map((r) => toMilestone(r as Row));
}

export async function listMilestones(projectId: string): Promise<ConstructionMilestone[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("construction_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("index", { ascending: true });

  if (error) throw new Error(`listMilestones: ${error.message}`);
  return (data ?? []).map((r) => toMilestone(r as Row));
}

/**
 * Records what the chain already did. The on-chain account is the source of
 * truth; this table exists so the UI can render history without replaying
 * every transaction.
 */
export async function recordMilestoneState(
  projectId: string,
  index: number,
  patch: {
    status?: MilestoneStatus;
    inspectorApproved?: boolean;
    clientApproved?: boolean;
    evidenceUri?: string;
    fundedTx?: string;
    submittedTx?: string;
    inspectorApprovedTx?: string;
    releasedTx?: string;
    refundedTx?: string;
  }
): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  type MilestoneUpdate = Partial<{
    status: MilestoneStatus;
    inspector_approved: boolean;
    client_approved: boolean;
    evidence_uri: string;
    funded_tx: string;
    funded_at: string;
    submitted_tx: string;
    submitted_at: string;
    inspector_approved_tx: string;
    released_tx: string;
    released_at: string;
    refunded_tx: string;
  }>;

  const update: MilestoneUpdate = {};
  if (patch.status) update.status = patch.status;
  if (patch.inspectorApproved !== undefined) update.inspector_approved = patch.inspectorApproved;
  if (patch.clientApproved !== undefined) update.client_approved = patch.clientApproved;
  if (patch.evidenceUri !== undefined) update.evidence_uri = patch.evidenceUri;
  if (patch.fundedTx) {
    update.funded_tx = patch.fundedTx;
    update.funded_at = now;
  }
  if (patch.submittedTx) {
    update.submitted_tx = patch.submittedTx;
    update.submitted_at = now;
  }
  if (patch.inspectorApprovedTx) update.inspector_approved_tx = patch.inspectorApprovedTx;
  if (patch.releasedTx) {
    update.released_tx = patch.releasedTx;
    update.released_at = now;
  }
  if (patch.refundedTx) update.refunded_tx = patch.refundedTx;

  const { error } = await supabase
    .from("construction_milestones")
    .update(update)
    .eq("project_id", projectId)
    .eq("index", index);

  if (error) throw new Error(`recordMilestoneState: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export async function addEvidence(input: {
  milestoneId: string;
  uploadedByWallet: string;
  uploaderRole: "contractor" | "inspector";
  fileUrl: string;
  fileType?: MilestoneEvidence["fileType"];
  caption?: string | null;
  capturedAt?: string | null;
}): Promise<MilestoneEvidence> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("milestone_evidence")
    .insert({
      milestone_id: input.milestoneId,
      uploaded_by_wallet: input.uploadedByWallet,
      uploader_role: input.uploaderRole,
      file_url: input.fileUrl,
      file_type: input.fileType ?? "image",
      caption: input.caption ?? null,
      captured_at: input.capturedAt ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`addEvidence: ${error.message}`);
  return toEvidence(data as Row);
}

export async function listEvidence(milestoneId: string): Promise<MilestoneEvidence[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("milestone_evidence")
    .select("*")
    .eq("milestone_id", milestoneId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`listEvidence: ${error.message}`);
  return (data ?? []).map((r) => toEvidence(r as Row));
}
