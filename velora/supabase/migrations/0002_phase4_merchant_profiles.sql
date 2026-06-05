-- ============================================================
-- Velora — Phase 4: Merchant Identity (merchant_profiles)
-- ============================================================
-- Apply this in the Supabase SQL Editor (Dashboard → SQL Editor → New query),
-- or via psql against the project's Postgres connection.
--
-- Idempotent: safe to run multiple times.
--
-- Design notes:
--  * Wallet-native and DECOUPLED from base tables — identity is the merchant's
--    wallet address (text, unique), not a FK to users/merchants. This matches
--    the Phase 2 payment tables so a merchant's profile, links, and payments all
--    key off the same connected wallet address.
--  * All app access is server-side via the Supabase service key, which bypasses
--    RLS. We still ENABLE RLS with no policies so the public/anon key has zero
--    access to this table (defense in depth).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── merchant_profiles ───────────────────────────────────────────
create table if not exists public.merchant_profiles (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  wallet_address text not null unique,                      -- merchant identity (devnet)
  business_name  text not null,
  display_name   text,
  logo_url       text,
  website        text,
  description    text,
  support_email  text,
  metadata       jsonb
);

create index if not exists merchant_profiles_wallet_address_idx
  on public.merchant_profiles (wallet_address);

-- ── Row Level Security (deny anon; service role bypasses) ───────
alter table public.merchant_profiles enable row level security;

-- ── Grants ──────────────────────────────────────────────────────
-- The app accesses this table exclusively via the Supabase service key
-- (service_role), which bypasses RLS but still needs table-level privileges.
-- Supabase's default grants do not always apply to tables created in the SQL
-- editor, so we grant explicitly. anon/authenticated get nothing (RLS + no
-- grants) — they have zero access to this table.
grant usage on schema public to service_role;
grant all privileges on public.merchant_profiles to service_role;
