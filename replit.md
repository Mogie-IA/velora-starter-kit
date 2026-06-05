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
- **Merchant Dashboard** — accept payments, manage products and subscriptions
- **Consumer Portal** — view receipts, manage subscriptions, connected apps
- **Checkout** — wallet-native one-time and recurring payment flows
- **Docs** — integration guides and API references

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
- Run `cd velora && pnpm typecheck` not `pnpm --filter @workspace/velora run typecheck` (both work but former is clearer)
- Wallet sign-in (challenge/signature) is Phase 1 — Phase 0 has the hook interface only
- `@solana/wallet-adapter-backpack` is listed as a dependency but not yet added to WalletProvider — add it in Phase 1 when Backpack wallet import is stable
- Supabase `users` table uses `primary_wallet_address` as the wallet identity column (not `wallet_address`)

## Pointers

- See `velora/README.md` for full setup, environment variables, and DB schema docs
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Phase roadmap: 0=Foundation ✅, 1=Wallet sign-in + payments, 2=Subscriptions + consumer portal, 3=Helius webhooks + analytics
