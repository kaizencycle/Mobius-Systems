import fetch from "node-fetch";
import { CFG } from "../config";
import { publicKey, signPayload } from "../crypto/ed25519";

export type AttestableAlert = Record<string, unknown>;

export async function postAttestation(alert: AttestableAlert) {
  if (!CFG.LEDGER_BASE) {
    throw new Error("LEDGER_BASE is not configured");
  }

  const envelope = {
    issuer: CFG.OAA_ISSUER,
    version: CFG.OAA_SIGNING_VERSION,
    created: CFG.OAA_SIGNING_CREATED,
    public_key_b64u: publicKey(),
    payload: alert,
  };

  const signature_b64u = signPayload(envelope);

  const res = await fetch(`${CFG.LEDGER_BASE}/ledger/attest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ envelope, signature_b64u }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Ledger attestation failed: ${res.status} ${res.statusText} ${detail}`,
    );
  }

  return res.json();
}

