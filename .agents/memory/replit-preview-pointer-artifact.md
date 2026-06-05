---
name: Replit preview pointer artifact
description: How to expose a Replit artifact preview for an app that lives outside the artifacts/ directory, without moving its code.
---

# Pointer artifact for apps outside `artifacts/`

Replit's artifact-router discovers previewable apps by globbing `artifacts/*/.replit-artifact/artifact.toml`. An app whose code lives outside `artifacts/` (e.g. a standalone workspace package) gets **no route** — the preview iframe shows "artifact encountered an error" and `/` falls through to whatever owns the catch-all (e.g. the api-server's Express 404).

**Fix without moving the app code:** create a routing-only "pointer" artifact directory under `artifacts/<slug>/.replit-artifact/artifact.toml`. It contains ONLY the toml — no `package.json` — so pnpm's `artifacts/*` workspace glob ignores it (no duplicate package). The toml's dev command targets the real package via `pnpm --filter @workspace/<pkg> run dev`.

**Why:** keeps the real app in place (no impact to git history layout, Vercel root dir, env-var-based integrations, or the app's internal routing) while giving the router a discoverable `/` route.

**How to apply:**
- Reuse the existing artifact `id` in the new toml so the canvas iframe (`artifact:v3:<id>`) keeps working.
- Remove the old undiscoverable `.replit-artifact` dir to avoid duplicate registration / `DUPLICATE_PREVIEW_PATH`.
- The platform auto-registers from the filesystem the moment the toml appears under `artifacts/` and re-derives the workflow — **no Repl restart needed** (workflow restart / presentArtifact / registering a toml OUTSIDE artifacts/ do NOT make the live router pick it up).
- Watch for an orphaned dev process from the previously-derived workflow still holding the port (EADDRINUSE on the new workflow). Kill the stray `next dev`/`next-server` process tree (`lsof`/`fuser` may be absent — use `ps -eo pid,ppid,cmd | grep next`), then restart the managed `artifacts/<slug>: ...` workflow so it owns the port.
