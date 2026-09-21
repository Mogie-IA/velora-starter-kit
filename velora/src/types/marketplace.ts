/**
 * Types for the construction marketplace.
 *
 * Money is handled in two units and it matters which is which:
 *   - `*_usd` fields are human amounts (dollars, two decimals) used in the UI
 *     and stored in Postgres as numeric.
 *   - on-chain amounts are base units (USDC has 6 decimals) and are always
 *     `bigint`/`BN`, never floats.
 */

export type MarketplaceRole = "client" | "contractor" | "inspector";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface MarketplaceProfile {
  id: string;
  walletAddress: string;
  role: MarketplaceRole;
  displayName: string;
  email: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  avatarUrl: string | null;
  bio: string | null;
  /** Contractor-only */
  companyName: string | null;
  yearsExperience: number | null;
  specialties: string[] | null;
  /** Inspector-only: the real credential that makes their sign-off mean something */
  qualification: string | null;
  licenseNumber: string | null;
  serviceAreas: string[] | null;
  verificationStatus: VerificationStatus;
  jobsCompleted: number;
  disputesRaised: number;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "open" | "awarded" | "cancelled";

export interface Job {
  id: string;
  clientWallet: string;
  title: string;
  description: string;
  locationCity: string;
  locationState: string | null;
  country: string;
  budgetMinUsd: number | null;
  budgetMaxUsd: number | null;
  expectedMilestones: number;
  status: JobStatus;
  bidsCloseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

/** A contractor's proposed stage breakdown, shown to the client before award. */
export interface ProposedMilestone {
  title: string;
  description?: string;
  amountUsd: number;
}

export interface Bid {
  id: string;
  jobId: string;
  contractorWallet: string;
  amountUsd: number;
  timelineDays: number;
  proposal: string;
  proposedMilestones: ProposedMilestone[];
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | "awaiting_inspector"
  | "awaiting_funding"
  | "active"
  | "completed"
  | "cancelled";

export interface ConstructionProject {
  id: string;
  jobId: string | null;
  bidId: string | null;
  clientWallet: string;
  contractorWallet: string;
  inspectorWallet: string | null;
  title: string;
  locationCity: string;
  country: string;
  /** u64 nonce used as a PDA seed; string because it exceeds Number.MAX_SAFE_INTEGER */
  onchainProjectId: string | null;
  onchainProjectPda: string | null;
  onchainVaultAta: string | null;
  mint: string | null;
  totalAmountUsd: number;
  inspectionFeeUsd: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus = "pending" | "funded" | "submitted" | "released" | "refunded";

export interface ConstructionMilestone {
  id: string;
  projectId: string;
  index: number;
  title: string;
  description: string | null;
  amountUsd: number;
  inspectionFeeUsd: number;
  status: MilestoneStatus;
  inspectorApproved: boolean;
  clientApproved: boolean;
  evidenceUri: string | null;
  fundedTx: string | null;
  submittedTx: string | null;
  inspectorApprovedTx: string | null;
  releasedTx: string | null;
  refundedTx: string | null;
  fundedAt: string | null;
  submittedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EvidenceFileType = "image" | "video" | "document";

export interface MilestoneEvidence {
  id: string;
  milestoneId: string;
  uploadedByWallet: string;
  uploaderRole: "contractor" | "inspector";
  fileUrl: string;
  fileType: EvidenceFileType;
  caption: string | null;
  capturedAt: string | null;
  createdAt: string;
}

export type InspectorAssignmentStatus = "invited" | "accepted" | "declined";

export interface InspectorAssignment {
  id: string;
  projectId: string;
  inspectorWallet: string;
  feeUsd: number;
  status: InspectorAssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Protocol fees, as agreed: the client pays 3% on top of what they fund, and
 * the contractor and inspector each give up 1% of their payout.
 *
 * These mirror the on-chain `Config` account. The chain is the source of truth;
 * these exist so the UI can show exact numbers before anyone commits.
 */
export const FEE_BPS = {
  client: 300,
  contractor: 100,
  inspector: 100,
} as const;

const BPS_DENOMINATOR = 10_000;

/** Basis-point fee, rounded down the same way the on-chain program does. */
export function feeOf(amount: number, bps: number): number {
  return Math.floor((amount * bps) / BPS_DENOMINATOR);
}

/**
 * What a client actually pays to fund a milestone: the escrowed amount plus
 * the platform fee on top. Shown before they confirm, never after.
 */
export function clientFundingBreakdown(amountUsd: number, inspectionFeeUsd: number) {
  const escrowed = round2(amountUsd + inspectionFeeUsd);
  const platformFee = round2((escrowed * FEE_BPS.client) / BPS_DENOMINATOR);
  return {
    milestoneAmount: round2(amountUsd),
    inspectionFee: round2(inspectionFeeUsd),
    escrowed,
    platformFee,
    total: round2(escrowed + platformFee),
  };
}

/**
 * What the contractor and inspector actually receive once a milestone clears.
 * Shown to a contractor before they bid, so the fee is never a surprise.
 */
export function payoutBreakdown(amountUsd: number, inspectionFeeUsd: number) {
  const contractorFee = round2((amountUsd * FEE_BPS.contractor) / BPS_DENOMINATOR);
  const inspectorFee = round2((inspectionFeeUsd * FEE_BPS.inspector) / BPS_DENOMINATOR);
  return {
    contractorGross: round2(amountUsd),
    contractorFee,
    contractorNet: round2(amountUsd - contractorFee),
    inspectorGross: round2(inspectionFeeUsd),
    inspectorFee,
    inspectorNet: round2(inspectionFeeUsd - inspectorFee),
    protocolTotal: round2(contractorFee + inspectorFee),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** USDC base units (6 decimals). Use for anything crossing to the chain. */
export function toBaseUnits(usd: number, decimals = 6): bigint {
  return BigInt(Math.round(usd * 10 ** decimals));
}

export function fromBaseUnits(units: bigint | number, decimals = 6): number {
  return Number(units) / 10 ** decimals;
}
