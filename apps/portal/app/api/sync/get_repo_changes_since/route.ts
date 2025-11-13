// apps/portal/app/api/sync/get_repo_changes_since/route.ts
import { NextResponse } from "next/server";
import { reduceComparePayload } from "@/lib/repo-changes-reducer";

const GH = "https://api.github.com";
const OWNER = process.env.REPO_OWNER ?? "kaizencycle";
const REPO  = process.env.REPO_NAME  ?? "Kaizen-OS";
const HDRS: HeadersInit = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

/**
 * Validate GitHub SHA to prevent SSRF
 */
function validateGitHubSha(sha: string): string {
  // SHA should be 40 hex characters (full SHA) or 7-40 hex characters (short SHA)
  if (!/^[a-f0-9]{7,40}$/i.test(sha)) {
    throw new Error(`Invalid SHA format: ${sha}`);
  }
  return sha;
}

/**
 * Validate ISO date string to prevent SSRF
 */
function validateISODate(dateStr: string): string {
  // ISO 8601 date format: YYYY-MM-DDTHH:mm:ssZ or similar
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
  if (!isoDateRegex.test(dateStr)) {
    throw new Error(`Invalid ISO date format: ${dateStr}`);
  }
  // Verify it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return dateStr;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  
  if (!since) {
    return NextResponse.json({ error: "since parameter required" }, { status: 400 });
  }

  try {
    // Validate and sanitize 'since' parameter to prevent SSRF
    let validatedSince: string;
    if (since.includes('T')) {
      // ISO date - validate format
      validatedSince = validateISODate(since);
      // ISO date - use commits API
      const commits = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits?since=${encodeURIComponent(validatedSince)}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      return NextResponse.json({ changes: commits });
    } else {
      // SHA - validate format
      validatedSince = validateGitHubSha(since);
      // SHA - use compare API
      const repo = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      const head_sha = await fetch(`${GH}/repos/${OWNER}/${REPO}/commits/${repo.default_branch}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json()).then(h=>h.sha);
      // Validate head_sha as well
      const validatedHeadSha = validateGitHubSha(head_sha);
      const compare = await fetch(`${GH}/repos/${OWNER}/${REPO}/compare/${validatedSince}...${validatedHeadSha}`, { headers: HDRS, cache:"no-store" }).then(r=>r.json());
      const digest = reduceComparePayload(compare);
      return NextResponse.json({ changes: digest });
    }
  } catch (e: any) {
    return NextResponse.json({ error: "changes_failed", message: e.message }, { status: 500 });
  }
}
