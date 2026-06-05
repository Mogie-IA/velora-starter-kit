#!/usr/bin/env tsx
/**
 * github-push.ts
 *
 * Pushes the current git-tracked working tree to Mogie-IA/velora-starter-kit
 * on GitHub using the Replit GitHub connector (no git push required).
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run github-push -- "feat: your milestone message"
 *
 * How it works:
 *   1. Reads ALL files tracked by git (via `git ls-files`) — same set that
 *      would be committed locally. Only untracked/gitignored files are skipped.
 *   2. Creates GitHub blob objects for each file via the Git Data API
 *   3. Creates a Git tree from those blobs
 *   4. Creates a commit whose parent is the current remote HEAD
 *   5. Fast-forward updates the remote `main` branch ref (fails loudly on drift)
 *
 * Authentication:
 *   Uses the Replit GitHub connector (connection id: conn_github_01KT83F2N5YQQ39P5KCJ2TACR6).
 *   The connector handles OAuth token refresh automatically.
 *   No personal access token or .env variable required.
 *
 * Safety:
 *   - Only files reported by `git ls-files` are pushed (honours .gitignore).
 *     This means secrets already excluded by .gitignore are never sent.
 *   - The branch ref is updated only when the remote HEAD is the parent of our
 *     new commit (fast-forward equivalent). If the remote has moved ahead, the
 *     script fails with a clear error — no silent overwrites.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import { execSync } from "child_process";
import * as fs from "fs";

const OWNER = "Mogie-IA";
const REPO = "velora-starter-kit";
const BRANCH = "main";

async function ghApi(
  connectors: ReplitConnectors,
  path: string,
  method: string,
  body?: Record<string, unknown>
): Promise<Response> {
  return connectors.proxy("github", path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function main() {
  const commitMessage = process.argv[2];
  if (!commitMessage) {
    console.error(
      'Usage: pnpm --filter @workspace/scripts run github-push -- "your commit message"'
    );
    process.exit(1);
  }

  const connectors = new ReplitConnectors();

  // 1. Get remote HEAD SHA (will be the parent of our new commit)
  console.log(`Fetching remote HEAD for ${OWNER}/${REPO} @ ${BRANCH}...`);
  const refResp = await ghApi(
    connectors,
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    "GET"
  );
  if (!refResp.ok) {
    throw new Error(`Failed to get remote ref: ${await refResp.text()}`);
  }
  const refData = (await refResp.json()) as { object: { sha: string } };
  const parentSha = refData.object.sha;
  console.log(`Remote HEAD: ${parentSha}`);

  // 2. Collect ALL git-tracked files (git ls-files honours .gitignore automatically)
  const allTrackedFiles = execSync("git ls-files 2>/dev/null", {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  console.log(
    `Uploading ${allTrackedFiles.length} git-tracked files to GitHub...`
  );

  // 3. Create blobs for every tracked file. Uploads run with bounded
  //    concurrency and retries so the whole push fits within tight shell time
  //    limits and survives transient GitHub 5xx responses.
  const treeItems: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string;
  }> = new Array(allTrackedFiles.length);

  const CONCURRENCY = 6;
  const MAX_RETRIES = 7;
  let completed = 0;
  let cursor = 0;

  async function createBlob(filePath: string): Promise<string> {
    const content = fs.readFileSync(filePath);
    const base64Content = content.toString("base64");
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const resp = await ghApi(
        connectors,
        `/repos/${OWNER}/${REPO}/git/blobs`,
        "POST",
        { content: base64Content, encoding: "base64" }
      );
      if (resp.status === 201) {
        const blob = (await resp.json()) as { sha: string };
        return blob.sha;
      }
      // Retry transient server errors / rate limits; fail loudly otherwise.
      if (resp.status >= 500 || resp.status === 429) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw new Error(
        `Blob creation failed for ${filePath}: ${resp.status} ${await resp.text()}`
      );
    }
    throw new Error(
      `Blob creation failed for ${filePath} after ${MAX_RETRIES} attempts (transient errors)`
    );
  }

  async function worker() {
    while (cursor < allTrackedFiles.length) {
      const i = cursor++;
      const filePath = allTrackedFiles[i];
      const modeRaw = execSync(
        `git ls-files --format='%(objectmode)' -- "${filePath}" 2>/dev/null`,
        { encoding: "utf-8" }
      ).trim();
      const mode = modeRaw === "100755" ? "100755" : "100644";
      const sha = await createBlob(filePath);
      treeItems[i] = { path: filePath, mode, type: "blob", sha };
      completed++;
      if (completed % 20 === 0 || completed === allTrackedFiles.length) {
        process.stdout.write(
          `  [${completed}/${allTrackedFiles.length}] blobs created\r`
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, allTrackedFiles.length) }, worker)
  );
  console.log();

  // 4. Create tree
  console.log("Creating tree...");
  const treeResp = await ghApi(
    connectors,
    `/repos/${OWNER}/${REPO}/git/trees`,
    "POST",
    { tree: treeItems }
  );
  if (treeResp.status !== 201) {
    throw new Error(`Tree creation failed: ${await treeResp.text()}`);
  }
  const tree = (await treeResp.json()) as { sha: string };
  console.log(`Tree SHA: ${tree.sha}`);

  // 5. Create commit (parented on remote HEAD captured in step 1)
  console.log(`Creating commit: "${commitMessage}"`);
  const commitResp = await ghApi(
    connectors,
    `/repos/${OWNER}/${REPO}/git/commits`,
    "POST",
    {
      message: commitMessage,
      tree: tree.sha,
      parents: [parentSha],
      author: {
        name: OWNER,
        email: "eumoru127@gmail.com",
        date: new Date().toISOString(),
      },
    }
  );
  if (commitResp.status !== 201) {
    throw new Error(`Commit creation failed: ${await commitResp.text()}`);
  }
  const commit = (await commitResp.json()) as { sha: string };
  console.log(`Commit SHA: ${commit.sha}`);

  // 6. Fast-forward update: verify remote HEAD has not moved since step 1,
  //    then update without force. If the remote has new commits, fail loudly.
  console.log(`Verifying remote HEAD has not moved...`);
  const verifyResp = await ghApi(
    connectors,
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    "GET"
  );
  if (!verifyResp.ok) {
    throw new Error(`Ref re-fetch failed: ${await verifyResp.text()}`);
  }
  const verifyData = (await verifyResp.json()) as { object: { sha: string } };
  if (verifyData.object.sha !== parentSha) {
    throw new Error(
      `Remote ${BRANCH} moved while we were uploading!\n` +
        `  Expected: ${parentSha}\n` +
        `  Actual:   ${verifyData.object.sha}\n` +
        `Re-run the script to retry on top of the current remote HEAD.`
    );
  }

  // Safe to update — remote is still at our parent
  const updateResp = await ghApi(
    connectors,
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    "PATCH",
    { sha: commit.sha, force: false }
  );
  if (!updateResp.ok) {
    throw new Error(`Ref update failed: ${await updateResp.text()}`);
  }

  console.log(
    `\n✓ Successfully pushed ${allTrackedFiles.length} files to https://github.com/${OWNER}/${REPO}`
  );
  console.log(`  Branch:  ${BRANCH}`);
  console.log(`  Commit:  ${commit.sha}`);
  console.log(`  Message: ${commitMessage}`);
}

main().catch((err) => {
  console.error("\nPush failed:", err.message);
  process.exit(1);
});
