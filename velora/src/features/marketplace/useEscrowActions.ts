"use client";

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import {
  addMilestoneTx,
  approveMilestoneTx,
  createProjectTx,
  fundMilestoneTx,
  getProgram,
  newProjectId,
  projectPda,
  refundMilestoneTx,
  submitMilestoneTx,
  vaultAta,
  USDC_MINT,
  type EscrowWallet,
} from "@/lib/escrow/client";
import { linkOnchainProject, recordMilestoneChange } from "@/app/actions/marketplace";
import { useWalletProof } from "./useWalletProof";
import type { ConstructionMilestone, ConstructionProject } from "@/types/marketplace";

/**
 * Wraps the escrow program in the flows the UI actually performs.
 *
 * Each call sends the transaction, waits for confirmation, then records the
 * result in Postgres. If the recording step fails the money has still moved —
 * the chain is authoritative — so failures here are surfaced as a sync warning
 * rather than an error that implies the payment did not happen.
 */

const TREASURY = new PublicKey(
  process.env.NEXT_PUBLIC_VELORA_TREASURY ?? "11111111111111111111111111111111"
);

export function useEscrowActions() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { createProof } = useWalletProof();
  const [busy, setBusy] = useState<string | null>(null);

  const program = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      throw new Error("Connect your wallet first");
    }
    return getProgram(
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as EscrowWallet,
      connection
    );
  }, [wallet, connection]);

  const send = useCallback(
    async (tx: Awaited<ReturnType<typeof createProjectTx>>) => {
      if (!wallet.sendTransaction || !wallet.publicKey) throw new Error("Wallet not ready");
      const signature = await wallet.sendTransaction(tx, connection);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");
      return signature;
    },
    [wallet, connection]
  );

  /**
   * Puts the whole project on-chain: the project account, its vault, and every
   * milestone. Run once, by the client, before the first funding.
   */
  const createOnchainProject = useCallback(
    async (project: ConstructionProject, milestones: ConstructionMilestone[]) => {
      setBusy("create-project");
      try {
        if (!wallet.publicKey) throw new Error("Connect your wallet first");
        if (!project.inspectorWallet) throw new Error("Assign an inspector before funding");

        const p = program();
        const onchainId = newProjectId();
        const pda = projectPda(wallet.publicKey, onchainId);

        await send(
          await createProjectTx(p, {
            client: wallet.publicKey,
            contractor: new PublicKey(project.contractorWallet),
            inspector: new PublicKey(project.inspectorWallet),
            projectId: onchainId,
            milestoneCount: milestones.length,
          })
        );

        // Each milestone is its own account, so these go one at a time.
        for (const m of milestones) {
          await send(
            await addMilestoneTx(p, {
              client: wallet.publicKey,
              projectId: onchainId,
              index: m.index,
              amountUsd: m.amountUsd,
              inspectionFeeUsd: m.inspectionFeeUsd,
            })
          );
        }

        await linkOnchainProject(await createProof("link-onchain-project"), {
          projectId: project.id,
          onchainProjectId: onchainId.toString(),
          pda: pda.toBase58(),
          vaultAta: vaultAta(pda).toBase58(),
          mint: USDC_MINT.toBase58(),
        });

        return { onchainProjectId: onchainId.toString(), pda: pda.toBase58() };
      } finally {
        setBusy(null);
      }
    },
    [program, send, wallet.publicKey, createProof]
  );

  const fundMilestone = useCallback(
    async (project: ConstructionProject, milestone: ConstructionMilestone) => {
      setBusy(`fund-${milestone.index}`);
      try {
        if (!wallet.publicKey) throw new Error("Connect your wallet first");
        if (!project.onchainProjectId) throw new Error("This project is not on-chain yet");

        const signature = await send(
          await fundMilestoneTx(program(), {
            client: wallet.publicKey,
            projectId: BigInt(project.onchainProjectId),
            index: milestone.index,
            treasury: TREASURY,
          })
        );

        await recordMilestoneChange(await createProof("record-milestone"), {
          projectId: project.id,
          index: milestone.index,
          status: "funded",
          signature,
          kind: "funded",
        });

        return signature;
      } finally {
        setBusy(null);
      }
    },
    [program, send, wallet.publicKey, createProof]
  );

  const submitWork = useCallback(
    async (
      project: ConstructionProject,
      milestone: ConstructionMilestone,
      evidenceUri: string
    ) => {
      setBusy(`submit-${milestone.index}`);
      try {
        if (!wallet.publicKey) throw new Error("Connect your wallet first");
        if (!project.onchainProjectId) throw new Error("This project is not on-chain yet");

        const signature = await send(
          await submitMilestoneTx(program(), {
            contractor: wallet.publicKey,
            clientWallet: new PublicKey(project.clientWallet),
            projectId: BigInt(project.onchainProjectId),
            index: milestone.index,
            evidenceUri,
          })
        );

        await recordMilestoneChange(await createProof("record-milestone"), {
          projectId: project.id,
          index: milestone.index,
          status: "submitted",
          evidenceUri,
          signature,
          kind: "submitted",
        });

        return signature;
      } finally {
        setBusy(null);
      }
    },
    [program, send, wallet.publicKey, createProof]
  );

  /**
   * Approve as inspector or client. When this is the second approval the
   * program releases the money inside the same transaction.
   */
  const approveMilestone = useCallback(
    async (
      project: ConstructionProject,
      milestone: ConstructionMilestone,
      as: "inspector" | "client"
    ) => {
      setBusy(`approve-${milestone.index}`);
      try {
        if (!wallet.publicKey) throw new Error("Connect your wallet first");
        if (!project.onchainProjectId) throw new Error("This project is not on-chain yet");
        if (!project.inspectorWallet) throw new Error("No inspector assigned");

        const willRelease =
          as === "inspector" ? milestone.clientApproved : milestone.inspectorApproved;

        const signature = await send(
          await approveMilestoneTx(program(), {
            signer: wallet.publicKey,
            clientWallet: new PublicKey(project.clientWallet),
            contractor: new PublicKey(project.contractorWallet),
            inspector: new PublicKey(project.inspectorWallet),
            treasury: TREASURY,
            projectId: BigInt(project.onchainProjectId),
            index: milestone.index,
          })
        );

        await recordMilestoneChange(await createProof("record-milestone"), {
          projectId: project.id,
          index: milestone.index,
          status: willRelease ? "released" : "submitted",
          inspectorApproved: as === "inspector" ? true : undefined,
          clientApproved: as === "client" ? true : undefined,
          signature,
          kind: willRelease ? "released" : as === "inspector" ? "inspector-approved" : "funded",
        });

        return { signature, released: willRelease };
      } finally {
        setBusy(null);
      }
    },
    [program, send, wallet.publicKey, createProof]
  );

  const refundMilestone = useCallback(
    async (project: ConstructionProject, milestone: ConstructionMilestone) => {
      setBusy(`refund-${milestone.index}`);
      try {
        if (!wallet.publicKey) throw new Error("Connect your wallet first");
        if (!project.onchainProjectId) throw new Error("This project is not on-chain yet");

        const signature = await send(
          await refundMilestoneTx(program(), {
            client: wallet.publicKey,
            projectId: BigInt(project.onchainProjectId),
            index: milestone.index,
          })
        );

        await recordMilestoneChange(await createProof("record-milestone"), {
          projectId: project.id,
          index: milestone.index,
          status: "refunded",
          signature,
          kind: "refunded",
        });

        return signature;
      } finally {
        setBusy(null);
      }
    },
    [program, send, wallet.publicKey, createProof]
  );

  return {
    busy,
    createOnchainProject,
    fundMilestone,
    submitWork,
    approveMilestone,
    refundMilestone,
  };
}
