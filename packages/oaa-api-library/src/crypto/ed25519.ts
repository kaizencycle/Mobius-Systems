import { CFG } from "../config";
import nacl from "tweetnacl";

function decodeB64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
  return new Uint8Array(Buffer.from(padded, "base64"));
}

export function signPayload(payload: unknown): string {
  const keyB64 = CFG.OAA_ED25519_PRIVATE_B64;
  if (!keyB64) {
    throw new Error("OAA_ED25519_PRIVATE_B64 is not configured");
  }
  const raw = JSON.stringify(payload);
  const message = new TextEncoder().encode(raw);
  const privateKey = decodeB64Url(keyB64);
  if (privateKey.byteLength !== 64) {
    throw new Error("Expected 64-byte Ed25519 private key");
  }
  const signature = nacl.sign.detached(message, privateKey);
  return Buffer.from(signature).toString("base64url");
}

export function publicKey(): string {
  const key = CFG.OAA_ED25519_PUBLIC_B64;
  if (!key) {
    throw new Error("OAA_ED25519_PUBLIC_B64 is not configured");
  }
  return key;
}

