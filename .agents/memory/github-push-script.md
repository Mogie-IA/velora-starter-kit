---
name: GitHub push script hazard
description: How pushing to Mogie-IA/velora-starter-kit works and the cwd/API pitfalls that can truncate the whole repo
---

# Pushing to GitHub (velora-starter-kit)

There is no GitHub git remote in this repl (only Replit's internal `gitsafe-backup`). Pushes to `Mogie-IA/velora-starter-kit` go through the **GitHub Git Data API** via the Replit GitHub connector (blobs → tree → commit → update ref). The repeatable helper is `scripts/src/github-push.ts` (`pnpm --filter @workspace/scripts run github-push`).

## Hazard: a push can wipe the whole repo to a handful of files
**Why:** The script builds the new tree from `git ls-files` with **no `base_tree`**, and `git ls-files` is scoped to the current working directory. Running it via `pnpm --filter @workspace/scripts run ...` sets cwd to `scripts/`, so it only lists the ~5 files under `scripts/` and pushes a tree containing *only those* — the GitHub create-tree API then replaces main's entire tree, deleting everything else. This actually happened once (main dropped from 213 files to 5).

**Also:** `pnpm run <script> -- "msg"` passes the literal `--` through as `process.argv[2]`, so the commit message becomes `--` unless you account for it.

## How to apply (safe push)
- Always run the push so `git ls-files` executes from the **repo root** (`/home/runner/workspace`), e.g. `git -C <root> ls-files`, not from a package dir.
- Verify the uploaded file count matches `git ls-files | wc -l` at root (expect ~200+, not single digits) before/after.
- Background `&` jobs do NOT survive across separate shell tool calls (killed when the call returns). Run long pushes in the **foreground** within one shell call; parallelize blob uploads (concurrency ~12) and add retries for transient GitHub 502s to fit the ~120s shell limit.
- The ref update is the last step, so a mid-upload timeout/failure leaves the remote untouched — safe to retry. To remove a bad commit, recreate the commit parented on the last-good SHA and force-update the ref (`force:true`).
- After pushing, verify remote via the API: GET ref → GET commit (check message + parent) → GET tree `?recursive=1` (check blob count).
- Blob-upload concurrency tuning: the connector proxy rate-limits aggressively. Concurrency ~12 trips transient 5xx/429 and exhausts retries mid-push (~200 files); concurrency ~6 with ~7 retries and incremental backoff completes the full tree reliably within the shell time limit.
