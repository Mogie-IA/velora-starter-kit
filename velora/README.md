# Velora — Wallet-Native Commerce on Solana

Velora is a wallet-native commerce platform built on Solana. It enables merchants to accept payments, manage subscriptions, and build on-chain commerce flows without intermediaries.

## Phase 0 — Foundation

This phase establishes the production-grade architecture:

- **Next.js 15** (App Router, TypeScript strict)
- **TailwindCSS + shadcn/ui** (dark mode first, premium fintech design)
- **Supabase** (Postgres, schema foundations)
- **Solana Wallet Adapter** (Phantom, Solflare, Backpack — Devnet)

## Project Structure

```
velora/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (merchant)/         # Merchant route group
│   │   │   ├── merchant/dashboard/
│   │   │   ├── merchant/payments/
│   │   │   └── merchant/subscriptions/
│   │   ├── (consumer)/         # Consumer route group
│   │   │   ├── consumer/dashboard/
│   │   │   ├── consumer/receipts/
│   │   │   ├── consumer/subscriptions/
│   │   │   └── consumer/connected-apps/
│   │   ├── checkout/
│   │   ├── docs/
│   │   └── api/health/
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Wallet auth hooks
│   │   └── wallet/             # Wallet balance + utils
│   ├── lib/                    # Shared libraries
│   │   ├── supabase/           # Client, server, middleware, admin
│   │   ├── solana/             # Config, connection, formatters
│   │   └── utils/              # cn(), formatters
│   ├── components/
│   │   ├── ui/                 # Button, Card, Badge, Separator
│   │   ├── layout/             # Navbar
│   │   └── providers/          # WalletProvider, QueryProvider
│   └── types/                  # Database, auth, merchant, transaction types
```

## Architecture Layers

| Layer | Responsibility |
|-------|---------------|
| `app/` | Routing, pages, metadata, layouts |
| `features/` | Business logic, hooks, services per domain |
| `lib/` | Infrastructure: Supabase clients, Solana config |
| `components/` | Reusable UI, layout, providers |
| `types/` | TypeScript types matching DB schema |

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` or `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint (Helius recommended) |
| `HELIUS_API_KEY` | Helius API key for enhanced RPC + webhooks |
| `NEXT_PUBLIC_MERCHANT_WALLET` | Default merchant wallet address |

## Setup

```bash
cd velora
pnpm install
pnpm dev
```

## Database Schema

Supabase tables (Phase 0 foundations):

- **users** — primary user record, wallet-native identity
- **wallets** — wallet addresses linked to users
- **merchants** — merchant profiles and settings
- **products** — merchant product catalog (one-time + subscriptions)
- **transactions** — on-chain payment records
- **subscriptions** — recurring billing records

## Roadmap

| Phase | Feature |
|-------|---------|
| **0** | Foundation — architecture, design system, types, providers ✅ |
| **1** | Wallet sign-in, payments, checkout, Supabase auth |
| **2** | Subscriptions, consumer portal, connected apps |
| **3** | Helius webhooks, real-time updates, analytics |

## Network

Phase 0–1 use **Solana Devnet** only. No real funds required. Test with Phantom devnet wallets and airdrop SOL at [faucet.solana.com](https://faucet.solana.com).
