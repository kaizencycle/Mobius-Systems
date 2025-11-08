const BASE_HOSTS = [
  "reuters.com",
  "apnews.com",
  "bloomberg.com",
  "who.int",
  "nasa.gov",
  "ecb.europa.eu",
  "bis.org",
  "fema.gov",
  "civil-protection-humanitarian-aid.ec.europa.eu",
  "ec.europa.eu",
  "bsi.bund.de",
];

export const ALLOWLIST = new Set(BASE_HOSTS);

export function isAllowed(urlStr: string): boolean {
  if (!urlStr) {
    return false;
  }
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    for (const allowed of ALLOWLIST) {
      if (host === allowed) {
        return true;
      }
      if (host.endsWith(`.${allowed}`)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function ensureAllowed(urlStr: string): string {
  if (!isAllowed(urlStr)) {
    throw new Error(`Domain not in allowlist: ${urlStr}`);
  }
  return urlStr;
}

