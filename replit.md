# Velora

Velora is a wallet-native commerce platform for Solana — enabling merchants to accept payments, manage subscriptions, and build on-chain commerce flows without intermediaries.

## Run & Operate

- `cd velora && pnpm dev` — run the Next.js app (port 3000) — or use the "Velora: Next.js Dev Server" workflow
- `cd velora && pnpm typecheck` — typecheck the Velora app
- `cd velora && pnpm build` — production build
- `pnpm --filter @workspace/api-server run dev` — run the Express API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: see `velora/.env.local.example` for all required variables

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript strict)
- **Styling**: TailwindCSS 3 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana Wallet Adapter (Phantom, Solflare — Devnet)
- **State**: TanStack React Query
- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `velora/src/app/` — Next.js App Router pages and layouts
- `velora/src/features/` — Feature modules (auth, wallet, merchant, consumer)
- `velora/src/lib/supabase/` — Supabase client, server, admin, middleware
- `velora/src/lib/solana/` — Solana config, connection, formatters
- `velora/src/lib/utils/` — `cn()`, date/SOL formatters
- `velora/src/components/` — UI components, layout, providers
- `velora/src/types/` — TypeScript types mirroring DB schema
- `velora/README.md` — full setup guide and architecture docs

## Architecture decisions

- **Wallet-native identity**: wallet address is the primary user identity; no email/password in Phase 0. Auth-ready structure for Phase 1 challenge/signature flow.
- **Feature-based folder structure**: each domain (auth, wallet, merchant, consumer) is a self-contained feature module under `src/features/`
- **Layered architecture**: UI (app/) → business logic (features/) → infrastructure (lib/) → types
- **Supabase SSR**: uses `@supabase/ssr` with separate client/server/admin/middleware clients for proper Next.js App Router integration
- **Devnet only**: Phase 0–1 are Devnet-only; no real funds required; architecture flexible for mainnet switch

## Product

Velora is a wallet-native commerce platform for Solana with:
- **Landing page** — marketing site with role selection (`/get-started`), demo guide (`/demo`), and grant narrative
- **Merchant Dashboard** — accept payments, manage payment links, view revenue/history
- **Merchant Branding** — business name + logo upload (Supabase Storage `merchant-logos` bucket), shown on dashboard/settings/checkout/receipts
- **Consumer Portal** — view receipts and payment history
- **Checkout** — wallet-native one-time payment flow with on-chain verification
- **Docs** — overview, setup, Devnet testing, env vars, limitations, roadmap, grant narrative

## User preferences

- Build in phases — do not build future phases without explicit instruction
- Production-grade architecture from day one
- TypeScript strict mode throughout
- Feature-based folder structure
- Dark mode first, premium fintech aesthetic
- Solana Devnet only for Phase 0 and Phase 1
- No real funds required at any point in development
- Commit changes in logical milestones with clear documentation

## Gotchas

- Next.js app lives in `velora/` (not in `artifacts/`) — it is a standalone workspace package
- Replit preview for Velora is a **routing-only pointer artifact** at `artifacts/velora/.replit-artifact/artifact.toml` (no `package.json`, so pnpm ignores it). It reuses artifact id `Ti9OJlxlcf65D6qijweAZ` and runs the real app via `pnpm --filter @workspace/velora run dev`. The router only discovers artifacts under `artifacts/*`, so this pointer is what makes `/` route to Velora. Do not reintroduce `velora/.replit-artifact`.
- Run `cd velora && pnpm typecheck` not `pnpm --filter @workspace/velora run typecheck` (both work but former is clearer)
- Wallet sign-in (challenge/signature) is Phase 1 — Phase 0 has the hook interface only
- `@solana/wallet-adapter-backpack` is listed as a dependency but not yet added to WalletProvider — add it in Phase 1 when Backpack wallet import is stable
- Supabase `users` table uses `primary_wallet_address` as the wallet identity column (not `wallet_address`)
- Phase 2 payment tables (`payment_links`, `payments`, `transactions`) are wallet-native and DECOUPLED — no FKs to base `users`/`merchants` tables. Apply `velora/supabase/migrations/0001_phase2_payment_links.sql` via the Supabase SQL Editor (Replit can't reach Supabase direct/pooler Postgres for DDL). The migration includes explicit `grant ... to service_role` — Supabase's default grants don't always apply to SQL-editor-created tables, so without them the service key gets `42501 permission denied`.
- Phase 2 checkout payments are SIMULATED on Devnet (`metadata.simulated = true`, no real funds, no real tx signature). Real wallet-signed transfers come in a later phase.
- Phase 2 server actions in `velora/src/app/actions/payments.ts` take `merchantWallet`/`merchantUserId` as client-supplied args with no server-side auth binding (service role bypasses RLS). This is a known Phase-1 hardening item: there is no server session yet (wallet sign-in challenge/signature is Phase 1). When Phase 1 lands, derive caller identity server-side and enforce ownership on list/create/status-update — do NOT trust client-provided identifiers.
- Phase 5 merchant logo upload: a PUBLIC Supabase Storage bucket `merchant-logos` (file_size_limit 2MB, allowed PNG/JPG/WEBP) was created via the Storage REST API (Storage API is reachable over HTTPS even though direct/pooler Postgres for DDL is not). `uploadMerchantLogo(formData)` in `velora/src/app/actions/merchant.ts` validates type+size and returns the public URL; `LogoUploader.tsx` replaces the old Logo URL text input. Logo persists on profile Save (no orphan-deletion of old files — acceptable MVP). NOTE: like `upsertMerchantProfile` and the payment actions, `uploadMerchantLogo` trusts a client-supplied `walletAddress` and writes with the service role (no server session yet) — it shares the SAME known Phase-1 hardening gap documented above. Fixing it requires the Phase 1 wallet sign-in (challenge/signature) server session; out of scope for Phase 5.

## Pointers

- See `velora/README.md` for full setup, environment variables, and DB schema docs
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Phase roadmap: 0=Foundation ✅, 1=Wallet sign-in + real on-chain payments ✅, 2=Payment links + checkout foundation ✅, 3=Merchant operations & receipts ✅, 4=Merchant identity & branding ✅, 5=Launch readiness (landing V2, logo upload, /demo, docs) ✅. Next: subscriptions, embedded wallets, mainnet, public APIs/SDKs
