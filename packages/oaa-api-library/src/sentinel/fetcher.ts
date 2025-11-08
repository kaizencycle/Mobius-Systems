import crypto from "crypto";
import fetch, { Headers } from "node-fetch";
import { CFG } from "../config";
import { ensureAllowed } from "./allowlist";

export type FetchedDoc = {
  url: string;
  status: number;
  contentType?: string;
  text: string;
  sha256: string;
  fetchedAt: string;
};

export async function fetchDoc(url: string): Promise<FetchedDoc> {
  const target = ensureAllowed(url);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    CFG.FETCH_TIMEOUT_MS ?? 12000,
  );

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: new Headers({
        "User-Agent": "OAA-Sentinel/1.0 (+Mobius Systems)",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      }),
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await res.text();
    const sha256 = crypto.createHash("sha256").update(text).digest("hex");

    return {
      url: target,
      status: res.status,
      contentType: res.headers.get("content-type") ?? undefined,
      text,
      sha256,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

