---
name: Velora project structure
description: Key architecture decisions and conventions for the Velora wallet-native commerce platform on Solana
---

## Location

Next.js app lives at `velora/` in the monorepo root — NOT under `artifacts/`. It is registered as `@workspace/velora` in `pnpm-workspace.yaml`. The workflow is named "Velora: Next.js Dev Server". It cannot be screenshotted via the artifact screenshot tool (not an artifact); verify by checking workflow logs for 200 responses.

## Phase convention

Build in explicit phases only. Never implement Phase N+1 features while working on Phase N.
- Phase 0: Foundation (complete) — Next.js, Tailwind, Supabase clients, Wallet Adapter, types, route groups, design system
- Phase 1: Wallet sign-in (challenge/signature), payments, checkout, Supabase user records
- Phase 2: Subscriptions, consumer portal, connected apps
- Phase 3: Helius webhooks, real-time updates, analytics

## Design system (source of truth: attached DESIGN.md)

**Light mode only** — not dark mode. Background is `#faf8ff` (soft lavender-tinted white).
- Primary: `#5427e6` / gradient `#6d4aff → #4f46e5`
- Surface cards: white, 24px radius (`rounded-[24px]`), border `#e8e7ef`, shadow `0 4px 20px rgba(11,16,38,0.04)`
- Buttons: 16px radius, 48px height (primary), 56px (lg CTA). Gradient fill for primary, white+border for secondary.
- Badges/chips: pill-shaped (9999px), low-saturation bg + high-saturation text
- Typography: Inter only. Tabular-nums for financial data. `text-display`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-md`, `text-label-sm` utility classes.
- Inputs: 48px height, 14px radius, focus = 2px primary stroke + 4px glow
- Transaction rows: 72px height, 40px leading icon container (10% primary tint, `tx-icon` class)
- Glassmorphism: `velora-card-glass` = 80% white + 20px backdrop-blur (nav, modals, sidebars)
- 8px grid — all spacing multiples of 8

**Why:** User provided a formal design spec replacing the original dark-mode-first approach. All future phases must strictly follow this visual language.

## Key conventions

- Wallet address is the primary identity (`primary_wallet_address` column in `users` table)
- Supabase SSR: `lib/supabase/client.ts` (browser), `server.ts` (RSC), `middleware.ts`, admin via `SUPABASE_SECRET_KEY`
- Feature modules live in `src/features/<domain>/` with hooks, services, and an `index.ts` barrel
- Solana network is Devnet for Phase 0–1; config in `lib/solana/config.ts`
- `useWalletAuth` hook in `features/auth` is auth-ready but sign-in flow is Phase 1
- CSS utility classes: `velora-card`, `velora-card-glass`, `btn-primary`, `btn-secondary`, `btn-ghost`, `velora-input`, `chip`, `chip-*`, `tx-row`, `tx-icon`, `stat-card`, `stat-label`, `stat-value`, `page-container`

**Why:** Production-grade, consistent conventions prevent drift as phases accumulate.
