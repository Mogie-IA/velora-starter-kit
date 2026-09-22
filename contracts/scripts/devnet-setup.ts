/**
 * One-time devnet setup: test USDC mint, treasury wallet, and the on-chain
 * fee config (3% client, 1% contractor, 1% inspector).
 *
 * Idempotent — re-running reuses the saved mint and treasury in .keys/.
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import idl from "../target/idl/velora_escrow.json";

const loadOrCreate = (path: string) => {
  if (existsSync(path)) return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))));
  const kp = Keypair.generate();
  writeFileSync(path, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
  return kp;
};

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = new anchor.Program(idl as anchor.Idl, provider);
  const payer = (provider.wallet as anchor.Wallet).payer;
  const conn = provider.connection;

  const treasury = loadOrCreate(".keys/treasury.json");

  let mint: PublicKey;
  if (existsSync(".keys/usdc-mint.txt")) {
    mint = new PublicKey(readFileSync(".keys/usdc-mint.txt", "utf8").trim());
    console.log("reusing test USDC mint:", mint.toBase58());
  } else {
    mint = await createMint(conn, payer, payer.publicKey, null, 6);
    writeFileSync(".keys/usdc-mint.txt", mint.toBase58());
    console.log("created test USDC mint:", mint.toBase58());
  }

  const treasuryAta = await getOrCreateAssociatedTokenAccount(conn, payer, mint, treasury.publicKey);
  console.log("treasury wallet:", treasury.publicKey.toBase58());
  console.log("treasury USDC account:", treasuryAta.address.toBase58());

  const [config] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
  const existing = await conn.getAccountInfo(config);
  if (existing) {
    console.log("config already initialised:", config.toBase58());
  } else {
    const sig = await program.methods
      .initializeConfig(300, 100, 100)
      .accounts({ authority: payer.publicKey, treasury: treasury.publicKey, config, systemProgram: SystemProgram.programId })
      .rpc();
    console.log("config initialised:", config.toBase58(), "tx:", sig);
  }

  const cfg = (await (program.account as any).config.fetch(config)) as any;
  console.log(`fees on-chain → client ${cfg.clientFeeBps / 100}% · contractor ${cfg.contractorFeeBps / 100}% · inspector ${cfg.inspectorFeeBps / 100}%`);
  console.log(`\nNEXT_PUBLIC_USDC_MINT=${mint.toBase58()}`);
  console.log(`NEXT_PUBLIC_VELORA_TREASURY=${treasury.publicKey.toBase58()}`);
  void BN;
})();
