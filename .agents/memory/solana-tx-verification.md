---
name: Solana tx verification timing
description: Why server-side payment verification must split confirmation from detail-fetch, and how submitPayment stays idempotent
---

# Solana on-chain payment verification (Velora Phase 3)

## Rule
Server-side verification of a wallet-sent SOL transfer must be TWO phases:
1. `getSignatureStatuses([sig], { searchTransactionHistory: true })` to confirm
   the tx reached the chain (err -> failed; confirmed/finalized -> proceed).
2. `getTransaction(sig, …)` (retried) to read pre/post balances for amount/payer
   binding.

**Why:** `getTransaction` lags well behind confirmation. The client's
`connection.confirmTransaction` succeeds quickly, but a server that immediately
polls only `getTransaction` (short ~9s budget) gets `null` and wrongly reports
PAYMENT_PENDING for an actually-confirmed tx. That was the exact bug: client and
server were both correctly on devnet.helius-rpc.com (no cluster mismatch) — the
tx was confirmed; the server just gave up before `getTransaction` could serve it.

**How to apply:** Keep generous retry budgets per phase (~10×1500ms). If status
says confirmed but details never load, return `pending` (retriable) rather than
settling an unverified amount.

## Server and client MUST share the same RPC endpoint
The server connection should use the SAME RPC the client signs/confirms against
(`NEXT_PUBLIC_SOLANA_RPC_URL`). Do NOT prefer a separate `HELIUS_API_KEY` secret
to build a server-only URL unless you have verified that key is valid for the
cluster.

**Why:** A real stuck-pending bug was caused by the server preferring
`HELIUS_API_KEY`, whose value did not match the (valid) key embedded in
`NEXT_PUBLIC_SOLANA_RPC_URL`. Every server RPC call returned
`401 Invalid API key`, the catch block swallowed it, and verification looped to
PAYMENT_PENDING forever — even though the tx was `finalized` on devnet. Same
provider/cluster but a different/invalid key = silent verification failure.

**How to apply:** Prefer `NEXT_PUBLIC_SOLANA_RPC_URL` server-side so confirm and
verify hit an identical endpoint. NEVER silently swallow RPC errors in the poll
loop — log them (a persistent 401/403 means misconfig, not a transient miss).

## Explorer URL: cluster query goes AFTER the path
`getExplorerTxUrl`/`getExplorerAddressUrl` must produce
`https://explorer.solana.com/tx/<sig>?cluster=devnet`. Putting `?cluster=devnet`
on the base URL before the path (`…?cluster=devnet/tx/<sig>`) makes Explorer see
path `/` and redirect to its homepage. Keep `EXPLORER_BASE_URL` path-only and
append the cluster query in the helpers.

## Idempotency
`submitPayment` keys on `tx_signature`. The signature lookup must run BEFORE the
link-status gates ("already paid"/active) so a retry of an already-settled
signature returns the existing receipt instead of hitting "already paid". Scope a
found signature to the same `payment_link_id` + `payer_wallet` before
reusing/mutating it. A `pending` row resumes verification on the SAME row (no new
funds); only a brand-new signature inserts a new pending row and runs the gates.

**Known gap:** no DB unique constraint on `payments.tx_signature` /
`transactions.solana_signature` (no schema change in this phase), so concurrent
double-submit can still race. The checkout button is disabled while busy, which
covers the normal path. Add unique constraints + unique-violation handling when a
migration is in scope.
