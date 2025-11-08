import { fetchDoc, FetchedDoc } from "./fetcher";

export type VerificationItem = { url: string };

export type VerificationInput = {
  items: VerificationItem[];
  summaryHint?: string;
};

export type VerificationDoc = {
  url: string;
  domain: string;
  sha256: string;
  status: number;
  excerpt: string;
};

export type VerificationResult = {
  ok: boolean;
  docs: VerificationDoc[];
  mergedText: string;
  domains: Set<string>;
};

export async function verifySources(
  input: VerificationInput,
): Promise<VerificationResult> {
  const docs: VerificationDoc[] = [];
  const domains = new Set<string>();
  let merged = input.summaryHint ? `${input.summaryHint}\n` : "";

  const tasks = input.items.map(async ({ url }) => {
    const doc = await fetchDoc(url);
    const domain = new URL(doc.url).hostname.toLowerCase();
    domains.add(domain);
    merged += `\n[${domain}] ${doc.text.slice(0, 2000)}`;
    docs.push({
      url: doc.url,
      domain,
      sha256: doc.sha256,
      status: doc.status,
      excerpt: doc.text.slice(0, 1000),
    });
  });

  await Promise.all(tasks);

  return {
    ok: domains.size >= 2,
    docs,
    mergedText: merged.trim(),
    domains,
  };
}

export function summarizeFromDocs(docs: FetchedDoc[]): string {
  return docs
    .map((doc) => `${doc.url}\n${doc.text.slice(0, 400)}…`)
    .join("\n\n");
}

