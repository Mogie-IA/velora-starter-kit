# Velora — Wallet-Native Commerce on Solana

Velora is a wallet-native commerce platform built on Solana. Merchants accept payments, create payment links, and verify transactions on-chain — without a payment processor. The wallet is the account: there is no email or password. Velora currently runs on **Solana Devnet** with test funds only.

## What works today

- **Wallet authentication** — Phantom / Solflare; the wallet address is the merchant identity
- **Merchant profiles & branding** — business name and logo upload (stored in Supabase Storage)
- **Payment links** — shareable, branded checkout pages
- **Real Devnet payments** — verified on-chain
- **On-chain receipts** — with Solana Explorer links
- **Merchant dashboard** — revenue, payment counts, and history

## Stack

- **Next.js 15** (App Router, TypeScript strict)
- **TailwindCSS + shadcn/ui** (premium fintech design system — light lavender/violet)
- **Supabase** (Postgres + Storage)
- **Solana Wallet Adapter** (Phantom, Solflare — Devnet)
- **TanStack React Query**

## Project Structure

```
velora/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (merchant)/         # Merchant route group (dashboard, payments, settings)
│   │   ├── (consumer)/         # Consumer route group (dashboard, receipts)
│   │   ├── actions/            # Server actions (merchant, payments)
│   │   ├── checkout/           # Wallet-native checkout
│   │   ├── get-started/        # Role selection (Merchant / Consumer / Developer)
│   │   ├── demo/               # End-to-end demo guide
│   │   ├── docs/               # Documentation
│   │   └── page.tsx            # Landing page
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Wallet auth
│   │   ├── wallet/             # Wallet balance + utils
│   │   ├── merchant/           # Merchant profile, branding, dashboard
│   │   ├── payments/           # Payment links, checkout, receipts
│   │   └── marketing/          # Landing nav, footer
│   ├── lib/                    # Supabase clients, Solana config, utils
│   ├── components/             # UI, layout, providers
│   └── types/                  # Types matching DB schema
├── supabase/migrations/        # SQL migrations (apply via Supabase SQL Editor)
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values. Public values are prefixed `NEXT_PUBLIC_`; server-only secrets must never be exposed to the browser or committed.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key (public) |
| `SUPABASE_SECRET_KEY` | Supabase service role key (**server only**) |
| `SUPABASE_DB_URL` | Postgres connection string (**server only**) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint (Helius recommended) |
| `HELIUS_API_KEY` | Helius API key for enhanced RPC (optional) |
| `NEXT_PUBLIC_MERCHANT_WALLET` | Default merchant wallet for demos (optional) |
| `SESSION_SECRET` | Server session secret (**server only**) |

## Setup

```bash
cd velora
pnpm install
pnpm dev
```

### Supabase & Storage

1. Apply the SQL migrations in `supabase/migrations/` via the Supabase SQL Editor.
2. Create a **public** Storage bucket named `merchant-logos` (allowed types: PNG, JPG, WEBP; size limit 2 MB). Merchant logo uploads are stored here and served by public URL.
3. Set the Supabase URL and keys in your environment (see above).

## Demo flow (Devnet)

Everything runs on Solana Devnet — no real funds. See the in-app guide at `/demo`.

1. Switch your wallet to **Devnet** and get free test SOL from [faucet.solana.com](https://faucet.solana.com).
2. Create an account as a **Merchant** and complete your profile (name + logo).
3. Create a payment link with an amount in SOL.
4. Open the checkout, connect a customer wallet, and pay with Devnet SOL.
5. View the on-chain receipt and the payment in your merchant dashboard.

## Security notes

- **Devnet only** — no mainnet, no real funds.
- Public vs. secret keys are strictly separated; secrets are server-only and never committed.
- No server-side wallet session yet — merchant identity is the connected wallet. Server actions use the service role and trust client-supplied wallet identifiers; deriving caller identity server-side and enforcing ownership is a planned hardening item once wallet sign-in challenge/signature lands.

## Roadmap

| Phase | Feature |
|-------|---------|
| **0** | Foundation — architecture, design system, types, providers ✅ |
| **1** | Wallet sign-in + real on-chain payments ✅ |
| **2** | Payment links + checkout foundation ✅ |
| **3** | Merchant operations & receipts ✅ |
| **4** | Merchant identity & branding ✅ |
| **5** | Launch readiness — landing, branding upload, demo, docs ✅ |
| **Next** | Subscriptions, embedded wallets, mainnet, public APIs/SDKs |

## Network

Velora uses **Solana Devnet** only. No real funds required. Test with Phantom/Solflare devnet wallets and airdrop SOL at [faucet.solana.com](https://faucet.solana.com).
