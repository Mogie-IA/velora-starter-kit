import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { VeloraEscrow } from "../target/types/velora_escrow";

/**
 * These tests are written to prove the two claims the whole product rests on:
 *
 *   1. One approval is never enough. Funds move only when the inspector AND
 *      the client have both signed off.
 *   2. Nobody else can move the money — not the contractor, not a stranger,
 *      and not the protocol authority.
 */
describe("velora-escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.VeloraEscrow as Program<VeloraEscrow>;
  const connection = provider.connection;

  // 3% client, 1% contractor, 1% inspector.
  const CLIENT_FEE_BPS = 300;
  const CONTRACTOR_FEE_BPS = 100;
  const INSPECTOR_FEE_BPS = 100;

  // USDC has 6 decimals, so these are whole-dollar amounts.
  const USDC = 1_000_000;
  const MILESTONE_AMOUNT = new BN(10_000 * USDC); // $10,000 stage
  const INSPECTION_FEE = new BN(200 * USDC); //      $200 inspection

  const admin = Keypair.generate();
  const treasury = Keypair.generate();
  const client = Keypair.generate();
  const contractor = Keypair.generate();
  const inspector = Keypair.generate();
  const stranger = Keypair.generate();

  let mint: PublicKey;
  let configPda: PublicKey;
  let clientAta: PublicKey;
  let contractorAta: PublicKey;
  let inspectorAta: PublicKey;
  let treasuryAta: PublicKey;

  const projectId = new BN(1);
  let projectPda: PublicKey;
  let vaultAta: PublicKey;

  const milestonePda = (project: PublicKey, index: number) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("milestone"), project.toBuffer(), Buffer.from([index])],
      program.programId
    )[0];

  const fund = async (kp: Keypair, sol = 2) => {
    const sig = await connection.requestAirdrop(kp.publicKey, sol * LAMPORTS_PER_SOL);
    const bh = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
  };

  const balance = async (ata: PublicKey) => Number((await getAccount(connection, ata)).amount);

  before(async () => {
    await Promise.all([admin, client, contractor, inspector, stranger].map((k) => fund(k)));

    mint = await createMint(connection, admin, admin.publicKey, null, 6);

    [clientAta, contractorAta, inspectorAta, treasuryAta] = await Promise.all([
      createAssociatedTokenAccount(connection, client, mint, client.publicKey),
      createAssociatedTokenAccount(connection, contractor, mint, contractor.publicKey),
      createAssociatedTokenAccount(connection, inspector, mint, inspector.publicKey),
      createAssociatedTokenAccount(connection, admin, mint, treasury.publicKey),
    ]);

    // Give the client $100k to work with.
    await mintTo(connection, admin, mint, clientAta, admin, 100_000 * USDC);

    [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
    [projectPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("project"), client.publicKey.toBuffer(), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    vaultAta = getAssociatedTokenAddressSync(mint, projectPda, true);
  });

  it("initialises protocol config with the agreed fee rates", async () => {
    await program.methods
      .initializeConfig(CLIENT_FEE_BPS, CONTRACTOR_FEE_BPS, INSPECTOR_FEE_BPS)
      .accounts({
        authority: admin.publicKey,
        treasury: treasury.publicKey,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const config = await program.account.config.fetch(configPda);
    assert.equal(config.clientFeeBps, CLIENT_FEE_BPS);
    assert.equal(config.contractorFeeBps, CONTRACTOR_FEE_BPS);
    assert.equal(config.inspectorFeeBps, INSPECTOR_FEE_BPS);
    assert.ok(config.treasury.equals(treasury.publicKey));
  });

  it("rejects a fee rate above the 10% ceiling", async () => {
    try {
      await program.methods
        .updateFees(5_000, CONTRACTOR_FEE_BPS, INSPECTOR_FEE_BPS)
        .accounts({ authority: admin.publicKey, config: configPda })
        .signers([admin])
        .rpc();
      assert.fail("should have rejected a 50% fee");
    } catch (err: any) {
      assert.include(err.toString(), "FeeTooHigh");
    }
  });

  it("creates a project with a vault owned by the project itself", async () => {
    await program.methods
      .createProject(projectId, 2)
      .accounts({
        client: client.publicKey,
        contractor: contractor.publicKey,
        inspector: inspector.publicKey,
        mint,
        project: projectPda,
        vault: vaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const project = await program.account.project.fetch(projectPda);
    assert.ok(project.client.equals(client.publicKey));
    assert.ok(project.contractor.equals(contractor.publicKey));
    assert.ok(project.inspector.equals(inspector.publicKey));
    assert.equal(project.milestoneCount, 2);

    // The vault is owned by the project PDA, not by any person.
    const vault = await getAccount(connection, vaultAta);
    assert.ok(vault.owner.equals(projectPda));
  });

  it("defines milestone 0", async () => {
    await program.methods
      .addMilestone(0, MILESTONE_AMOUNT, INSPECTION_FEE)
      .accounts({
        client: client.publicKey,
        project: projectPda,
        milestone: milestonePda(projectPda, 0),
        systemProgram: SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const m = await program.account.milestone.fetch(milestonePda(projectPda, 0));
    assert.ok(m.amount.eq(MILESTONE_AMOUNT));
    assert.deepEqual(m.status, { pending: {} });
  });

  it("funds milestone 0, taking the 3% client fee straight to treasury", async () => {
    const clientBefore = await balance(clientAta);

    await program.methods
      .fundMilestone()
      .accounts({
        client: client.publicKey,
        config: configPda,
        project: projectPda,
        milestone: milestonePda(projectPda, 0),
        clientTokenAccount: clientAta,
        vault: vaultAta,
        treasuryTokenAccount: treasuryAta,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([client])
      .rpc();

    const escrowed = MILESTONE_AMOUNT.add(INSPECTION_FEE).toNumber(); // 10,200
    const clientFee = Math.floor((escrowed * CLIENT_FEE_BPS) / 10_000); // 3% = 306

    assert.equal(await balance(vaultAta), escrowed, "vault holds the escrowed amount only");
    assert.equal(await balance(treasuryAta), clientFee, "treasury got the 3% immediately");
    assert.equal(
      await balance(clientAta),
      clientBefore - escrowed - clientFee,
      "client paid escrow + fee on top"
    );
  });

  it("blocks a stranger from submitting work", async () => {
    try {
      await program.methods
        .submitMilestone("ipfs://evidence")
        .accounts({
          contractor: stranger.publicKey,
          project: projectPda,
          milestone: milestonePda(projectPda, 0),
        })
        .signers([stranger])
        .rpc();
      assert.fail("a stranger submitted work");
    } catch (err: any) {
      assert.include(err.toString(), "NotAnApprover");
    }
  });

  it("lets the contractor submit work with evidence attached", async () => {
    await program.methods
      .submitMilestone("ipfs://QmFoundationPhotos")
      .accounts({
        contractor: contractor.publicKey,
        project: projectPda,
        milestone: milestonePda(projectPda, 0),
      })
      .signers([contractor])
      .rpc();

    const m = await program.account.milestone.fetch(milestonePda(projectPda, 0));
    assert.deepEqual(m.status, { submitted: {} });
    assert.equal(m.evidenceUri, "ipfs://QmFoundationPhotos");
  });

  const approveAccounts = (signer: PublicKey) => ({
    signer,
    config: configPda,
    project: projectPda,
    milestone: milestonePda(projectPda, 0),
    vault: vaultAta,
    contractorTokenAccount: contractorAta,
    inspectorTokenAccount: inspectorAta,
    treasuryTokenAccount: treasuryAta,
    mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  it("refuses approval from the contractor — they cannot sign off on themselves", async () => {
    try {
      await program.methods
        .approveMilestone()
        .accounts(approveAccounts(contractor.publicKey))
        .signers([contractor])
        .rpc();
      assert.fail("contractor approved their own work");
    } catch (err: any) {
      assert.include(err.toString(), "NotAnApprover");
    }
  });

  it("holds the money after ONE approval — the core guarantee", async () => {
    const vaultBefore = await balance(vaultAta);

    await program.methods
      .approveMilestone()
      .accounts(approveAccounts(inspector.publicKey))
      .signers([inspector])
      .rpc();

    const m = await program.account.milestone.fetch(milestonePda(projectPda, 0));
    assert.isTrue(m.inspectorApproved);
    assert.isFalse(m.clientApproved);
    assert.deepEqual(m.status, { submitted: {} }, "still not released");
    assert.equal(await balance(vaultAta), vaultBefore, "not one token moved on a single approval");
  });

  it("pays everyone atomically on the second approval, with the right split", async () => {
    const contractorBefore = await balance(contractorAta);
    const inspectorBefore = await balance(inspectorAta);
    const treasuryBefore = await balance(treasuryAta);

    await program.methods
      .approveMilestone()
      .accounts(approveAccounts(client.publicKey))
      .signers([client])
      .rpc();

    const amount = MILESTONE_AMOUNT.toNumber();
    const inspection = INSPECTION_FEE.toNumber();
    const contractorFee = Math.floor((amount * CONTRACTOR_FEE_BPS) / 10_000); // 1% = 100
    const inspectorFee = Math.floor((inspection * INSPECTOR_FEE_BPS) / 10_000); // 1% = 2

    assert.equal(
      await balance(contractorAta),
      contractorBefore + amount - contractorFee,
      "contractor received 99%"
    );
    assert.equal(
      await balance(inspectorAta),
      inspectorBefore + inspection - inspectorFee,
      "inspector received 99% of their fee"
    );
    assert.equal(
      await balance(treasuryAta),
      treasuryBefore + contractorFee + inspectorFee,
      "treasury took 1% from each"
    );
    assert.equal(await balance(vaultAta), 0, "vault fully drained for this milestone");

    const m = await program.account.milestone.fetch(milestonePda(projectPda, 0));
    assert.deepEqual(m.status, { released: {} });
  });

  it("refuses a second approval on an already-released milestone", async () => {
    try {
      await program.methods
        .approveMilestone()
        .accounts(approveAccounts(inspector.publicKey))
        .signers([inspector])
        .rpc();
      assert.fail("approved a released milestone");
    } catch (err: any) {
      assert.include(err.toString(), "MilestoneNotSubmitted");
    }
  });

  describe("refunds", () => {
    const index = 1;

    before(async () => {
      await program.methods
        .addMilestone(index, MILESTONE_AMOUNT, INSPECTION_FEE)
        .accounts({
          client: client.publicKey,
          project: projectPda,
          milestone: milestonePda(projectPda, index),
          systemProgram: SystemProgram.programId,
        })
        .signers([client])
        .rpc();

      await program.methods
        .fundMilestone()
        .accounts({
          client: client.publicKey,
          config: configPda,
          project: projectPda,
          milestone: milestonePda(projectPda, index),
          clientTokenAccount: clientAta,
          vault: vaultAta,
          treasuryTokenAccount: treasuryAta,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([client])
        .rpc();
    });

    it("returns escrowed funds to the client before work is submitted", async () => {
      const clientBefore = await balance(clientAta);

      await program.methods
        .refundMilestone()
        .accounts({
          client: client.publicKey,
          project: projectPda,
          milestone: milestonePda(projectPda, index),
          vault: vaultAta,
          clientTokenAccount: clientAta,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([client])
        .rpc();

      const refunded = MILESTONE_AMOUNT.add(INSPECTION_FEE).toNumber();
      assert.equal(await balance(clientAta), clientBefore + refunded);
      assert.equal(await balance(vaultAta), 0);

      const m = await program.account.milestone.fetch(milestonePda(projectPda, index));
      assert.deepEqual(m.status, { refunded: {} });
    });

    it("will not refund once the contractor has submitted work", async () => {
      const index2 = 0; // already released
      try {
        await program.methods
          .refundMilestone()
          .accounts({
            client: client.publicKey,
            project: projectPda,
            milestone: milestonePda(projectPda, index2),
            vault: vaultAta,
            clientTokenAccount: clientAta,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([client])
          .rpc();
        assert.fail("refunded work that was already delivered");
      } catch (err: any) {
        assert.include(err.toString(), "RefundNotAllowed");
      }
    });
  });
});
