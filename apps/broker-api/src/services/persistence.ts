import { db } from '../db/client';
import { deliberations, sentinelResponses, attestations } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function saveDeliberation(data: any) {
  await db.insert(deliberations).values({
    id: data.id,
    prompt: data.prompt,
    context: data.context ? JSON.stringify(data.context) : null,
    status: data.status,
    consensusAchieved: data.consensusAchieved ?? null,
    finalMII: data.finalMII ?? null,
    requester: data.requester ?? null,
    createdAt: new Date(data.createdAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : null
  }).onConflictDoUpdate({
    target: deliberations.id,
    set: {
      status: data.status,
      consensusAchieved: data.consensusAchieved ?? null,
      finalMII: data.finalMII ?? null,
      completedAt: data.completedAt ? new Date(data.completedAt) : null
    }
  });
}

export async function saveSentinelResponse(deliberationId: string, sentinel: string, round: number, data: any) {
  await db.insert(sentinelResponses).values({
    id: `${deliberationId}-${sentinel}-${round}`,
    deliberationId,
    sentinelName: sentinel,
    round,
    response: data.response,
    miiScore: data.miiScore ?? null,
    vote: data.vote ?? null,
    timestamp: new Date()
  });
}

export async function saveAttestation(deliberationId: string, att: any) {
  await db.insert(attestations).values({
    id: `att-${deliberationId}`,
    deliberationId,
    signature: att.signature,
    publicKey: att.publicKey,
    timestamp: new Date()
  });
}

export async function getDeliberation(id: string) {
  return await db.query.deliberations.findFirst({
    where: eq(deliberations.id, id)
  });
}

export async function getDeliberationResponses(id: string) {
  return await db.query.sentinelResponses.findMany({
    where: eq(sentinelResponses.deliberationId, id)
  });
}

export async function getDeliberationAttestation(id: string) {
  return await db.query.attestations.findFirst({
    where: eq(attestations.deliberationId, id)
  });
}
