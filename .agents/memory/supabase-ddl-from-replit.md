---
name: Applying Supabase DDL from Replit
description: How to create tables in a Supabase project from the Replit env, and the service_role grant pitfall
---

# Applying Supabase DDL from Replit

Replit **cannot reach Supabase's Postgres directly** for DDL: the direct host
(`db.<ref>.supabase.co`) is IPv6-only and times out, and users frequently paste a
truncated/incomplete connection string (e.g. just `postgresql://<ref>.supabase.co`
with no port/credentials). The session/transaction pooler (`*.pooler.supabase.com`)
is IPv4 but still depends on the user copying the full URI correctly.

**Most reliable path:** have the user paste the migration SQL into the Supabase
**SQL Editor** (Dashboard → SQL Editor → New query → Run). It executes server-side
as `postgres`, needs no connection string, and avoids all networking issues.

**The service_role grant pitfall:** tables created via the SQL Editor do **not**
always inherit Supabase's default privileges. The app's service key maps to
`service_role`, which bypasses RLS but still needs table-level GRANTs. Without them,
PostgREST returns `42501 permission denied for table`. Always include in any
Supabase migration:
```sql
grant usage on schema public to service_role;
grant all privileges on public.<table> to service_role;
```
**Why:** RLS-bypass ≠ grant. service_role must be explicitly granted table privileges.
**How to apply:** add the grants to every new-table migration; verify afterward by
hitting `<SUPABASE_URL>/rest/v1/<table>?select=id&limit=1` with the service key
(`SUPABASE_SECRET_KEY`) — full row CRUD works once tables + grants exist, so no
Postgres connection is needed for testing, only for DDL.

The `pg` package isn't a velora dep but exists in the pnpm store
(`node_modules/.pnpm/pg@<ver>/node_modules/pg`) and can be required by full path for
one-off scripts — though the SQL Editor route is preferred over fighting connectivity.
