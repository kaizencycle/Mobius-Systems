import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

let privateKey: Uint8Array;

export async function initCrypto() {
  const keyPath = './data/broker.key';
  try {
    if (existsSync(keyPath)) {
      privateKey = readFileSync(keyPath);
    } else {
      privateKey = randomBytes(32);
      writeFileSync(keyPath, privateKey);
    }
  } catch (error) {
    console.error('Failed to initialize crypto:', error);
    throw error;
  }
}

export async function signDeliberation(deliberationId: string, data: any) {
  const message = JSON.stringify({ id: deliberationId, ...data, ts: Date.now() });
  const hash = sha512(Buffer.from(message));
  const signature = await ed.signAsync(hash, privateKey);
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return {
    signature: Buffer.from(signature).toString('hex'),
    publicKey: Buffer.from(publicKey).toString('hex'),
    message
  };
}

export async function verifyAttestation(sig: string, pub: string, msg: string) {
  const hash = sha512(Buffer.from(msg));
  return await ed.verifyAsync(
    Buffer.from(sig, 'hex'),
    hash,
    Buffer.from(pub, 'hex')
  );
}
