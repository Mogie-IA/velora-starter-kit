import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, type Transaction } from "@solana/web3.js";

import idlJson from "./idl.json";
import { SOLANA_RPC_URL } from "@/lib/solana/config";

/**
 * Thin wrapper around the Velora escrow program.
 *
 * Everything the UI needs to read or build a transaction lives here, so no
 * component has to know about PDAs, token accounts or base units.
 */

export const ESCROW_PROGRAM_ID = new PublicKey(
  (idlJson as { address: string }).address
);

/**
 * USDC on devnet. Override in production with the mainnet mint via env.
 * Every amount crossing into the program is in base units (6 decimals).
 */
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ?? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const USDC_DECIMALS = 6;

/** The wallet shape Anchor needs. Satisfied by the wallet adapter. */
export interface EscrowWallet {
  publicKey: PublicKey;
  signTransaction: <T extends Transaction>(tx: T) => Promise<T>;
  signAllTransactions: <T extends Transaction>(txs: T[]) => Promise<T[]>;
}

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

export function getProgram(wallet: EscrowWallet, connection = getConnection()): Program<Idl> {
  const provider = new AnchorProvider(connection, wallet as never, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program(idlJson as Idl, provider);
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

export function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], ESCROW_PROGRAM_ID)[0];
}

export function projectPda(client: PublicKey, projectId: bigint | BN): PublicKey {
  const id = BN.isBN(projectId) ? projectId : new BN(projectId.toString());
  return PublicKey.findProgramAddressSync(
    [Buffer.from("project"), client.toBuffer(), id.toArrayLike(Buffer, "le", 8)],
    ESCROW_PROGRAM_ID
  )[0];
}

export function milestonePda(project: PublicKey, index: number): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("milestone"), project.toBuffer(), Buffer.from([index])],
    ESCROW_PROGRAM_ID
  )[0];
}

/** The project's vault — an ATA owned by the project PDA, not by any person. */
export function vaultAta(project: PublicKey, mint = USDC_MINT): PublicKey {
  return getAssociatedTokenAddressSync(mint, project, true);
}

export function userAta(owner: PublicKey, mint = USDC_MINT): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, false);
}

/**
 * Creates `owner`'s USDC account if it does not exist yet, and does nothing if
 * it does. A contractor or inspector who has never held USDC has no token
 * account, and the payout would fail without this.
 */
function ensureAta(payer: PublicKey, owner: PublicKey, mint: PublicKey) {
  return createAssociatedTokenAccountIdempotentInstruction(
    payer,
    userAta(owner, mint),
    owner,
    mint
  );
}

// ---------------------------------------------------------------------------
// Amounts
// ---------------------------------------------------------------------------

export function toBaseUnits(usd: number): BN {
  return new BN(Math.round(usd * 10 ** USDC_DECIMALS));
}

export function fromBaseUnits(units: BN | bigint | number): number {
  const n = BN.isBN(units) ? units.toNumber() : Number(units);
  return n / 10 ** USDC_DECIMALS;
}

/** A fresh project id. Milliseconds is unique enough per client wallet. */
export function newProjectId(): bigint {
  return BigInt(Date.now());
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export interface CreateProjectArgs {
  client: PublicKey;
  contractor: PublicKey;
  inspector: PublicKey;
  projectId: bigint;
  milestoneCount: number;
  mint?: PublicKey;
}

export async function createProjectTx(program: Program<Idl>, args: CreateProjectArgs) {
  const mint = args.mint ?? USDC_MINT;
  const project = projectPda(args.client, args.projectId);

  return program.methods
    .createProject(new BN(args.projectId.toString()), args.milestoneCount)
    .accounts({
      client: args.client,
      contractor: args.contractor,
      inspector: args.inspector,
      mint,
      project,
      vault: vaultAta(project, mint),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();
}

export interface AddMilestoneArgs {
  client: PublicKey;
  projectId: bigint;
  index: number;
  amountUsd: number;
  inspectionFeeUsd: number;
}

export async function addMilestoneTx(program: Program<Idl>, args: AddMilestoneArgs) {
  const project = projectPda(args.client, args.projectId);

  return program.methods
    .addMilestone(args.index, toBaseUnits(args.amountUsd), toBaseUnits(args.inspectionFeeUsd))
    .accounts({
      client: args.client,
      project,
      milestone: milestonePda(project, args.index),
      systemProgram: SystemProgram.programId,
    })
    .transaction();
}

export interface FundMilestoneArgs {
  client: PublicKey;
  projectId: bigint;
  index: number;
  treasury: PublicKey;
  mint?: PublicKey;
}

export async function fundMilestoneTx(program: Program<Idl>, args: FundMilestoneArgs) {
  const mint = args.mint ?? USDC_MINT;
  const project = projectPda(args.client, args.projectId);

  return program.methods
    .fundMilestone()
    .accounts({
      client: args.client,
      config: configPda(),
      project,
      milestone: milestonePda(project, args.index),
      clientTokenAccount: userAta(args.client, mint),
      vault: vaultAta(project, mint),
      treasuryTokenAccount: userAta(args.treasury, mint),
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions([ensureAta(args.client, args.treasury, mint)])
    .transaction();
}

export interface SubmitMilestoneArgs {
  contractor: PublicKey;
  clientWallet: PublicKey;
  projectId: bigint;
  index: number;
  evidenceUri: string;
}

export async function submitMilestoneTx(program: Program<Idl>, args: SubmitMilestoneArgs) {
  const project = projectPda(args.clientWallet, args.projectId);

  return program.methods
    .submitMilestone(args.evidenceUri)
    .accounts({
      contractor: args.contractor,
      project,
      milestone: milestonePda(project, args.index),
    })
    .transaction();
}

export interface ApproveMilestoneArgs {
  /** Either the inspector or the client — the program checks which. */
  signer: PublicKey;
  clientWallet: PublicKey;
  contractor: PublicKey;
  inspector: PublicKey;
  treasury: PublicKey;
  projectId: bigint;
  index: number;
  mint?: PublicKey;
}

/**
 * Approves a milestone. When this is the second of the two approvals the
 * program releases the money in the same transaction.
 */
export async function approveMilestoneTx(program: Program<Idl>, args: ApproveMilestoneArgs) {
  const mint = args.mint ?? USDC_MINT;
  const project = projectPda(args.clientWallet, args.projectId);

  return program.methods
    .approveMilestone()
    .accounts({
      signer: args.signer,
      config: configPda(),
      project,
      milestone: milestonePda(project, args.index),
      vault: vaultAta(project, mint),
      contractorTokenAccount: userAta(args.contractor, mint),
      inspectorTokenAccount: userAta(args.inspector, mint),
      treasuryTokenAccount: userAta(args.treasury, mint),
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions([
      ensureAta(args.signer, args.contractor, mint),
      ensureAta(args.signer, args.inspector, mint),
      ensureAta(args.signer, args.treasury, mint),
    ])
    .transaction();
}

export interface RefundMilestoneArgs {
  client: PublicKey;
  projectId: bigint;
  index: number;
  mint?: PublicKey;
}

export async function refundMilestoneTx(program: Program<Idl>, args: RefundMilestoneArgs) {
  const mint = args.mint ?? USDC_MINT;
  const project = projectPda(args.client, args.projectId);

  return program.methods
    .refundMilestone()
    .accounts({
      client: args.client,
      project,
      milestone: milestonePda(project, args.index),
      vault: vaultAta(project, mint),
      clientTokenAccount: userAta(args.client, mint),
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction();
}

// ---------------------------------------------------------------------------
// Reads — the chain is the source of truth for anything about money.
// ---------------------------------------------------------------------------

export interface OnchainMilestone {
  index: number;
  amount: number;
  inspectionFee: number;
  status: string;
  inspectorApproved: boolean;
  clientApproved: boolean;
  evidenceUri: string;
}

export async function fetchMilestone(
  program: Program<Idl>,
  clientWallet: PublicKey,
  projectId: bigint,
  index: number
): Promise<OnchainMilestone | null> {
  const project = projectPda(clientWallet, projectId);
  try {
    const raw = await (program.account as never as Record<string, {
      fetch: (a: PublicKey) => Promise<Record<string, unknown>>;
    }>).milestone.fetch(milestonePda(project, index));

    return {
      index: Number(raw.index),
      amount: fromBaseUnits(raw.amount as BN),
      inspectionFee: fromBaseUnits(raw.inspectionFee as BN),
      status: Object.keys(raw.status as object)[0],
      inspectorApproved: Boolean(raw.inspectorApproved),
      clientApproved: Boolean(raw.clientApproved),
      evidenceUri: String(raw.evidenceUri ?? ""),
    };
  } catch {
    // Account does not exist yet — the milestone has not been added on-chain.
    return null;
  }
}

/** Explorer link for a signature, on whichever cluster we are pointed at. */
export function explorerTx(signature: string): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const suffix = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${signature}${suffix}`;
}
