-- Velora construction marketplace
--
-- Three-sided marketplace: clients post build jobs, contractors bid, and an
-- independent inspector verifies each milestone before the on-chain escrow
-- releases payment.
--
-- Additive only. The Phase 2-4 payment-link tables are left untouched.
--
-- NOTE: tables created through the Supabase SQL editor do not reliably inherit
-- default privileges, so every table below grants service_role explicitly.
-- Without those grants PostgREST returns 42501 permission denied.

-- ---------------------------------------------------------------------------
-- Profiles: one row per wallet, per role. A person may hold more than one.
-- ---------------------------------------------------------------------------
create table if not exists public.marketplace_profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  role text not null check (role in ('client', 'contractor', 'inspector')),
  display_name text not null,
  email text,
  phone text,
  country text not null default 'NG',
  city text,
  avatar_url text,
  bio text,
  -- Contractor fields
  company_name text,
  years_experience int,
  specialties text[],
  -- Inspector fields: the real-world credential that makes them credible
  qualification text,            -- e.g. 'Quantity Surveyor', 'Structural Engineer'
  license_number text,
  service_areas text[],
  -- Platform trust signals
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  jobs_completed int not null default 0,
  disputes_raised int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wallet_address, role)
);

create index if not exists marketplace_profiles_wallet_idx
  on public.marketplace_profiles (wallet_address);
create index if not exists marketplace_profiles_role_idx
  on public.marketplace_profiles (role, verification_status);

-- ---------------------------------------------------------------------------
-- Jobs: what a client wants built, before a contractor is chosen.
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_wallet text not null,
  title text not null,
  description text not null,
  location_city text not null,
  location_state text,
  country text not null default 'NG',
  budget_min_usd numeric(14, 2),
  budget_max_usd numeric(14, 2),
  expected_milestones int not null default 4,
  status text not null default 'open'
    check (status in ('open', 'awarded', 'cancelled')),
  bids_close_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_status_idx on public.jobs (status, created_at desc);
create index if not exists jobs_client_idx on public.jobs (client_wallet);

-- ---------------------------------------------------------------------------
-- Bids: a contractor's offer on a job. One live bid per contractor per job.
-- ---------------------------------------------------------------------------
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  contractor_wallet text not null,
  amount_usd numeric(14, 2) not null check (amount_usd > 0),
  timeline_days int not null check (timeline_days > 0),
  proposal text not null,
  -- The contractor's own proposed breakdown, shown to the client before award.
  proposed_milestones jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, contractor_wallet)
);

create index if not exists bids_job_idx on public.bids (job_id, status);
create index if not exists bids_contractor_idx on public.bids (contractor_wallet);

-- ---------------------------------------------------------------------------
-- Projects: created when a bid is accepted. Mirrors the on-chain project PDA.
-- ---------------------------------------------------------------------------
create table if not exists public.construction_projects (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete set null,
  bid_id uuid references public.bids (id) on delete set null,
  client_wallet text not null,
  contractor_wallet text not null,
  inspector_wallet text,
  title text not null,
  location_city text not null,
  country text not null default 'NG',
  -- On-chain linkage
  onchain_project_id numeric(20, 0),    -- the u64 nonce used in the PDA seed
  onchain_project_pda text,
  onchain_vault_ata text,
  mint text,
  total_amount_usd numeric(14, 2) not null,
  inspection_fee_usd numeric(14, 2) not null default 0,
  status text not null default 'awaiting_inspector'
    check (status in ('awaiting_inspector', 'awaiting_funding', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists construction_projects_client_idx
  on public.construction_projects (client_wallet);
create index if not exists construction_projects_contractor_idx
  on public.construction_projects (contractor_wallet);
create index if not exists construction_projects_inspector_idx
  on public.construction_projects (inspector_wallet);

-- ---------------------------------------------------------------------------
-- Milestones: mirrors the on-chain milestone account, plus the human detail
-- (title, description) that does not need to live on-chain.
-- ---------------------------------------------------------------------------
create table if not exists public.construction_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.construction_projects (id) on delete cascade,
  index int not null check (index >= 0),
  title text not null,
  description text,
  amount_usd numeric(14, 2) not null check (amount_usd > 0),
  inspection_fee_usd numeric(14, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'funded', 'submitted', 'released', 'refunded')),
  inspector_approved boolean not null default false,
  client_approved boolean not null default false,
  evidence_uri text,
  -- Transaction signatures, so the UI can link every state change to Explorer
  funded_tx text,
  submitted_tx text,
  inspector_approved_tx text,
  released_tx text,
  refunded_tx text,
  funded_at timestamptz,
  submitted_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, index)
);

create index if not exists construction_milestones_project_idx
  on public.construction_milestones (project_id, index);

-- ---------------------------------------------------------------------------
-- Evidence: the photos and video a contractor attaches, and what the inspector
-- captured on site. Kept separate so a milestone can carry many files.
-- ---------------------------------------------------------------------------
create table if not exists public.milestone_evidence (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.construction_milestones (id) on delete cascade,
  uploaded_by_wallet text not null,
  uploader_role text not null check (uploader_role in ('contractor', 'inspector')),
  file_url text not null,
  file_type text not null default 'image' check (file_type in ('image', 'video', 'document')),
  caption text,
  -- Captured client-side at upload; helps show evidence is from the visit,
  -- not a stock photo. Not a security guarantee on its own.
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists milestone_evidence_milestone_idx
  on public.milestone_evidence (milestone_id, created_at);

-- ---------------------------------------------------------------------------
-- Inspector assignment requests: a client invites an inspector to a project.
-- ---------------------------------------------------------------------------
create table if not exists public.inspector_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.construction_projects (id) on delete cascade,
  inspector_wallet text not null,
  fee_usd numeric(14, 2) not null default 0,
  status text not null default 'invited'
    check (status in ('invited', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, inspector_wallet)
);

create index if not exists inspector_assignments_inspector_idx
  on public.inspector_assignments (inspector_wallet, status);

-- ---------------------------------------------------------------------------
-- Keep updated_at honest.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'marketplace_profiles', 'jobs', 'bids', 'construction_projects',
    'construction_milestones', 'inspector_assignments'
  ] loop
    execute format(
      'drop trigger if exists touch_%1$s on public.%1$s;
       create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at();', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Grants. Required explicitly — see note at top of file.
-- ---------------------------------------------------------------------------
grant usage on schema public to service_role;
grant all privileges on public.marketplace_profiles to service_role;
grant all privileges on public.jobs to service_role;
grant all privileges on public.bids to service_role;
grant all privileges on public.construction_projects to service_role;
grant all privileges on public.construction_milestones to service_role;
grant all privileges on public.milestone_evidence to service_role;
grant all privileges on public.inspector_assignments to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security: on, with no policies.
--
-- The publishable key ships to the browser, so without RLS anyone could read
-- or rewrite these tables directly through PostgREST — skipping the wallet
-- signature checks in the server actions entirely. With RLS on and no
-- policies, the anon and authenticated roles get nothing. The app is
-- unaffected: every marketplace query runs server-side as service_role, which
-- bypasses RLS by design.
-- ---------------------------------------------------------------------------
alter table public.marketplace_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.bids enable row level security;
alter table public.construction_projects enable row level security;
alter table public.construction_milestones enable row level security;
alter table public.milestone_evidence enable row level security;
alter table public.inspector_assignments enable row level security;
