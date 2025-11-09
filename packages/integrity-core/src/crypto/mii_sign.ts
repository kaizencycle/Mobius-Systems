import { createHash, randomBytes } from 'crypto';
import nacl from 'tweetnacl';

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

function canonicalize(value: unknown): JSONValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as JSONValue;
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) => canonicalize(item)) as JSONArray;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => [key, canonicalize(v)] as [string, JSONValue])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

    return entries.reduce<JSONObject>((acc, [key, v]) => {
      acc[key] = v;
      return acc;
    }, {});
  }

  throw new TypeError('Unsupported value for canonical JSON serialization');
}

export function sha256(input: string | Buffer) {
  return createHash('sha256').update(input).digest('hex');
}

export function canonicalJSONString(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

export function signMII(payload: unknown, secretKey: Uint8Array) {
  const canonical = canonicalJSONString(payload);
  const digest = Buffer.from(sha256(canonical), 'hex');
  const signature = nacl.sign.detached(digest, secretKey);
  return Buffer.from(signature).toString('base64');
}

export function generateNonce(bytes = 16) {
  return randomBytes(bytes).toString('base64');
}
