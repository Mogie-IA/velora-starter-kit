/**
 * End-to-end on devnet: fund → submit → inspector approves (money must stay
 * locked) → client approves (money must release with the right split).
 *
 * Contractor and inspector are fresh wallets with no USDC account, mirroring a
 * real first-time user, so this also proves payouts create those accounts.
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction,
  getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo,
} from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import idl from "../target/idl/velora_escrow.json";

const kp = (p: string) => Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8"))));
const ex = (s: string) => `https://explorer.solana.com/tx/${s}?cluster=devnet`;
const U = 1_000_000;

(async () => {
  const provider = anchor.AnchorProvider.env();
  const conn = provider.connection;
  const admin = (provider.wallet as anchor.Wallet).payer;
  const mint = new PublicKey(readFileSync(".keys/usdc-mint.txt", "utf8").trim());
  const treasury = kp(".keys/treasury.json").publicKey;

  const client = Keypair.generate(), contractor = Keypair.generate(), inspector = Keypair.generate();
  const fundSol = new Transaction();
  for (const [k, sol] of [[client, 0.08], [contractor, 0.02], [inspector, 0.03]] as const)
    fundSol.add(SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: k.publicKey, lamports: sol * LAMPORTS_PER_SOL }));
  await sendAndConfirmTransaction(conn, fundSol, [admin]);

  const clientAta = await getOrCreateAssociatedTokenAccount(conn, admin, mint, client.publicKey);
  await mintTo(conn, admin, mint, clientAta.address, admin, 20_000 * U);

  const as = (w: Keypair) => new anchor.Program(idl as anchor.Idl, new anchor.AnchorProvider(conn, new anchor.Wallet(w), { commitment: "confirmed" }));
  const pid = new BN(Date.now());
  const [config] = PublicKey.findProgramAddressSync([Buffer.from("config")], as(client).programId);
  const [project] = PublicKey.findProgramAddressSync([Buffer.from("project"), client.publicKey.toBuffer(), pid.toArrayLike(Buffer, "le", 8)], as(client).programId);
  const [milestone] = PublicKey.findProgramAddressSync([Buffer.from("milestone"), project.toBuffer(), Buffer.from([0])], as(client).programId);
  const vault = getAssociatedTokenAddressSync(mint, project, true);
  const ata = (o: PublicKey) => getAssociatedTokenAddressSync(mint, o);
  const bal = async (a: PublicKey) => { try { return Number((await getAccount(conn, a)).amount) / U; } catch { return 0; } };
  const ensure = (payer: PublicKey, o: PublicKey) => createAssociatedTokenAccountIdempotentInstruction(payer, ata(o), o, mint);

  console.log("contractor has a USDC account before payout?", (await conn.getAccountInfo(ata(contractor.publicKey))) ? "yes" : "no — fresh wallet");

  const s1 = await as(client).methods.createProject(pid, 1).accounts({ client: client.publicKey, contractor: contractor.publicKey, inspector: inspector.publicKey, mint, project, vault, tokenProgram: TOKEN_PROGRAM_ID, associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).rpc();
  console.log("1. project created          ", ex(s1));
  await as(client).methods.addMilestone(0, new BN(10_000 * U), new BN(200 * U)).accounts({ client: client.publicKey, project, milestone, systemProgram: SystemProgram.programId }).rpc();

  const s2 = await as(client).methods.fundMilestone().accounts({ client: client.publicKey, config, project, milestone, clientTokenAccount: clientAta.address, vault, treasuryTokenAccount: ata(treasury), mint, tokenProgram: TOKEN_PROGRAM_ID }).preInstructions([ensure(client.publicKey, treasury)]).rpc();
  console.log(`2. funded — vault $${await bal(vault)}, client paid $${20000 - (await bal(clientAta.address))}   `, ex(s2));

  const s3 = await as(contractor).methods.submitMilestone("ipfs://QmFoundationPhotos").accounts({ contractor: contractor.publicKey, project, milestone }).rpc();
  console.log("3. contractor submitted work", ex(s3));

  const approve = (w: Keypair) => as(w).methods.approveMilestone().accounts({ signer: w.publicKey, config, project, milestone, vault, contractorTokenAccount: ata(contractor.publicKey), inspectorTokenAccount: ata(inspector.publicKey), treasuryTokenAccount: ata(treasury), mint, tokenProgram: TOKEN_PROGRAM_ID })
    .preInstructions([ensure(w.publicKey, contractor.publicKey), ensure(w.publicKey, inspector.publicKey), ensure(w.publicKey, treasury)]).rpc();

  const s4 = await approve(inspector);
  console.log(`4. inspector approved — vault still $${await bal(vault)}, contractor $${await bal(ata(contractor.publicKey))}   `, ex(s4));

  const tBefore = await bal(ata(treasury));
  const s5 = await approve(client);
  console.log(`5. client approved — RELEASED`, ex(s5));
  console.log(`   contractor received $${await bal(ata(contractor.publicKey))}  (expected $9,900)`);
  console.log(`   inspector received  $${await bal(ata(inspector.publicKey))}  (expected $198)`);
  console.log(`   treasury took       $${(await bal(ata(treasury))) - tBefore}  on release (expected $102 = 1% + 1%)`);
  console.log(`   vault now           $${await bal(vault)}`);
})().catch((e) => { console.error("FAILED:", e.message ?? e); process.exit(1); });
