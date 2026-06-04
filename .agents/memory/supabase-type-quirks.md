---
name: Supabase type quirks
description: Type requirements for @supabase/supabase-js v2.107+ in Velora and the correct client to use in server actions
---

## Rule
Every table in `types/database.ts` must include `Relationships: [...]` (even if empty). The root `Database` type must also include:
```ts
CompositeTypes: { [_ in never]: never }
```
on both `public.Views` and `public.Functions`.

**Why:** @supabase/supabase-js v2.107+ added generic constraints that require these fields to be present. Omitting them causes TypeScript to infer `never` types for all query results.

## Server action client choice
In `app/actions/auth.ts` (and any server action doing privileged writes), use `createServiceClient()` from `lib/supabase/service.ts`, NOT `createAdminClient()` from `lib/supabase/server.ts`.

**Why:** `createAdminClient()` is the `@supabase/ssr` cookie-based client. Inside a server action it produces broken type inference (`never`) for `.from()` calls. `createServiceClient()` is a plain `createClient(url, serviceKey)` call with no SSR wrapper — types resolve correctly.

**How to apply:** Any time you add a new server action that writes to Supabase, import from `lib/supabase/service.ts`.
