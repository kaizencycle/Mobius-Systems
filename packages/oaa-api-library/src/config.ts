import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const CFG = {
  PORT: process.env.PORT || "8080",
  LEDGER_BASE: process.env.LEDGER_BASE || "",
  LAB4_BASE: process.env.LAB4_BASE || "",
  LAB6_BASE: process.env.LAB6_BASE || "",
  LAB7_BASE: process.env.LAB7_BASE || "",

  OAA_ISSUER: process.env.OAA_ISSUER || "oaa_lab7",
  OAA_SIGNING_VERSION: process.env.OAA_SIGNING_VERSION || "oaa.ed25519.v1",
  OAA_SIGNING_CREATED:
    process.env.OAA_SIGNING_CREATED || new Date().toISOString(),
  OAA_ED25519_PUBLIC_B64: process.env.OAA_ED25519_PUBLIC_B64 || "",
  OAA_ED25519_PRIVATE_B64: process.env.OAA_ED25519_PRIVATE_B64 || "",

  OAA_VERIFY_TS_WINDOW_MIN: optionalNumber(
    "OAA_VERIFY_TS_WINDOW_MIN",
    10,
  ),
  OAA_VERIFY_REQUIRE_NONCE:
    (process.env.OAA_VERIFY_REQUIRE_NONCE || "false").toLowerCase() === "true",

  FETCH_TIMEOUT_MS: optionalNumber("FETCH_TIMEOUT_MS", 12_000),
  FETCH_CONCURRENCY: optionalNumber("FETCH_CONCURRENCY", 4),
};

export function ensureSigningKeys() {
  requireEnv("OAA_ED25519_PUBLIC_B64");
  requireEnv("OAA_ED25519_PRIVATE_B64");
}

