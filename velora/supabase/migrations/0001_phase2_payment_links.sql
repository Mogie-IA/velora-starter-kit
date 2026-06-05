-- ============================================================
-- Velora — Phase 2: Payment Links + Checkout Foundation
-- ============================================================
-- Apply this in the Supabase SQL Editor (Dashboard → SQL Editor → New query),
-- or via psql against the project's Postgres connection.
--
-- Idempotent: safe to run multiple times.
--
-- Design notes:
--  * Phase 2 tables are wallet-native and DECOUPLED from base tables — identity
--    is the merchant/payer wallet address (text), not a FK to users/merchants.
--  * All app access is server-side via the Supabase service key, which bypasses
--    RLS. We still ENABLE RLS with no policies so the public/anon key has zero
--    access to these tables (defense in depth).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── payment_links ───────────────────────────────────────────────
create table if not exists public.payment_links (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  merchant_user_id text,                                    -- users.id or local_ fallback
  merchant_wallet  text not null,                           -- receiving wallet (devnet)
  merchant_name    text not null,
  title            text not null,
  description      text,
  amount           numeric(20, 9) not null check (amount > 0),
  currency         text not null default 'SOL' check (currency in ('SOL', 'USDC')),
  customer_contact text,                                    -- optional email or wallet
  status           text not null default 'active'
                     check (status in ('draft', 'active', 'paid', 'expired')),
  expires_at       timestamptz,
  network          text not null default 'devnet',
  metadata         jsonb
);

create index if not exists payment_links_merchant_wallet_idx on public.payment_links (merchant_wallet);
create index if not exists payment_links_status_idx          on public.payment_links (status);

-- ── payments ────────────────────────────────────────────────────
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  payment_link_id uuid not null references public.payment_links(id) on delete cascade,
  payer_wallet    text not null,
  amount          numeric(20, 9) not null,
  currency        text not null,
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'failed')),
  network         text not null default 'devnet',
  tx_signature    text,
  confirmed_at    timestamptz,
  metadata        jsonb
);

create index if not exists payments_payment_link_id_idx on public.payments (payment_link_id);
create index if not exists payments_payer_wallet_idx     on public.payments (payer_wallet);

-- ── transactions (Phase 2 on-chain placeholder records) ─────────
-- merchant_id kept nullable (no FK) for forward-compat with the documented
-- base schema while remaining wallet-native for Phase 2.
create table if not exists public.transactions (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  payment_id              uuid references public.payments(id) on delete cascade,
  payment_link_id         uuid references public.payment_links(id) on delete set null,
  merchant_id             uuid,
  merchant_wallet         text,
  consumer_wallet_address text,
  amount_lamports         bigint,
  currency                text not null default 'SOL',
  status                  text not null default 'pending'
                            check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  transaction_type        text not null default 'payment'
                            check (transaction_type in ('payment', 'subscription', 'refund')),
  solana_signature        text,
  block_time              timestamptz,
  slot                    bigint,
  network                 text not null default 'devnet',
  metadata                jsonb
);

create index if not exists transactions_payment_id_idx      on public.transactions (payment_id);
create index if not exists transactions_payment_link_id_idx on public.transactions (payment_link_id);

-- ── Row Level Security (deny anon; service role bypasses) ───────
alter table public.payment_links enable row level security;
alter table public.payments      enable row level security;
alter table public.transactions  enable row level security;

-- ── Grants ──────────────────────────────────────────────────────
-- The app accesses these tables exclusively via the Supabase service key
-- (service_role), which bypasses RLS but still needs table-level privileges.
-- Supabase's default grants do not always apply to tables created in the SQL
-- editor, so we grant explicitly. anon/authenticated get nothing (RLS + no
-- grants) — they have zero access to these tables.
grant usage on schema public to service_role;
grant all privileges on public.payment_links to service_role;
grant all privileges on public.payments      to service_role;
grant all privileges on public.transactions  to service_role;
