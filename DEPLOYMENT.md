# Deploying Velora to Vercel

Velora lives inside a pnpm workspace. The deployable app is the `velora/`
package — the rest of the workspace (`artifacts/`, `lib/`, `scripts/`) is
tooling that Vercel does not need to build.

## 1. Import the repository

In the Vercel dashboard: **Add New → Project → Import** `Mogie-IA/velora-starter-kit`.

## 2. Project settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `velora` |
| **Include source files outside of the Root Directory** | ✅ **enabled** (required) |
| Install Command | `pnpm install --frozen-lockfile` (from `velora/vercel.json`) |
| Build Command | `next build` (from `velora/vercel.json`) |

The "include source files outside the Root Directory" toggle is not optional.
`velora/package.json` resolves `framer-motion` and `zod` through pnpm's
`catalog:` protocol, which is defined in the workspace root's
`pnpm-workspace.yaml`. Without access to the repo root, install fails.

## 3. Environment variables

Add these under **Settings → Environment Variables**, for Production, Preview
and Development.

| Variable | Scope | Value |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase anon / publishable key |
| `SUPABASE_SECRET_KEY` | **secret** | Supabase service role key |
| `NEXT_PUBLIC_SOLANA_NETWORK` | public | `devnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | public | `https://api.devnet.solana.com` |
| `HELIUS_API_KEY` | **secret** | optional — enhanced RPC |
| `NEXT_PUBLIC_MERCHANT_WALLET` | public | optional — demo merchant wallet |

`NEXT_PUBLIC_*` values are compiled into the browser bundle and are safe to
expose. `SUPABASE_SECRET_KEY` bypasses row-level security and must never be
given a `NEXT_PUBLIC_` prefix.

**All three Supabase variables are required.** `src/middleware.ts` runs on
every route and constructs a Supabase client unconditionally, so a deployment
missing them returns HTTP 500 on every page, including the landing page.

## 4. Supabase setup

The database must exist before the app works:

1. Apply `velora/supabase/migrations/0001_phase2_payment_links.sql` and
   `0002_phase4_merchant_profiles.sql` in the Supabase SQL Editor, in order.
2. Create a **public** Storage bucket named `merchant-logos`
   (PNG / JPG / WEBP, 2 MB limit). Merchant logo uploads are served from it by
   public URL.

## 5. Server actions and deployment domains

`next.config.ts` reads `VERCEL_URL`, `VERCEL_BRANCH_URL` and
`VERCEL_PROJECT_PRODUCTION_URL` — injected automatically by Vercel — and adds
them to the server actions allow-list, so sign-in and payment actions work on
production and preview deployments alike. No manual domain configuration is
needed. If you add a custom domain, Vercel serves it as the production URL and
it is covered by the same variable.

## Notes

- The app runs on **Solana Devnet** only. No real funds are involved.
- `pnpm-workspace.yaml` sets `allowBuilds` for `esbuild`, `sharp`,
  `bufferutil` and `utf-8-validate`. pnpm 11 fails the install with
  `ERR_PNPM_IGNORED_BUILDS` if these are unapproved, which breaks the build
  before Next.js is ever invoked.
