import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { gradeResponse } from '../mii/grader';
import { healthMonitor } from '../monitoring/health';
import { signDeliberation } from '../crypto/attestation';
import { saveDeliberation, saveSentinelResponse, saveAttestation, getDeliberation } from '../services/persistence';
import { notifyWebhook } from '../services/webhook';

const router = Router();

router.post('/', async (req, res) => {
  const { prompt, context, requiredSentinels, consensusThreshold = 0.75, webhookUrl } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!requiredSentinels || !Array.isArray(requiredSentinels) || requiredSentinels.length === 0) {
    return res.status(400).json({ error: 'requiredSentinels array is required' });
  }

  const id = uuid();

  if (webhookUrl) {
    res.json({ id, status: 'pending', message: 'Deliberation started, will notify webhook on completion' });
    processAsync(id, prompt, context, requiredSentinels, consensusThreshold, webhookUrl);
    return;
  }

  try {
    const result = await processDeliberation(id, prompt, context, requiredSentinels, consensusThreshold);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const deliberation = await getDeliberation(req.params.id);
    if (!deliberation) {
      return res.status(404).json({ error: 'Deliberation not found' });
    }
    res.json(deliberation);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

async function processDeliberation(
  id: string,
  prompt: string,
  context: any,
  sentinels: string[],
  threshold: number
) {
  const start = Date.now();

  await saveDeliberation({
    id,
    prompt,
    context,
    status: 'processing',
    createdAt: start,
    requester: 'api'
  });

  const responses = await Promise.all(
    sentinels.map(async (s) => {
      const t = Date.now();
      try {
        const resp = await callSentinel(s, prompt, context);
        const mii = gradeResponse(resp);
        healthMonitor.record(s, true, Date.now() - t);
        await saveSentinelResponse(id, s, 1, { response: resp, miiScore: mii });
        return { sentinel: s, response: resp, miiScore: mii };
      } catch (error) {
        healthMonitor.record(s, false, Date.now() - t);
        throw error;
      }
    })
  );

  const avgMII = responses.reduce((s, r) => s + r.miiScore, 0) / responses.length;
  const consensus = avgMII >= threshold;

  const attestation = await signDeliberation(id, { consensus, mii: avgMII });
  await saveAttestation(id, attestation);

  await saveDeliberation({
    id,
    prompt,
    context,
    status: 'complete',
    consensusAchieved: consensus,
    finalMII: avgMII,
    createdAt: start,
    completedAt: Date.now(),
    requester: 'api'
  });

  return {
    id,
    consensus: { achieved: consensus, confidence: avgMII },
    miiScore: avgMII,
    responses: responses.map(r => ({ sentinel: r.sentinel, miiScore: r.miiScore })),
    attestation: {
      signature: attestation.signature,
      publicKey: attestation.publicKey
    },
    duration: Date.now() - start
  };
}

async function processAsync(
  id: string,
  prompt: string,
  context: any,
  sentinels: string[],
  threshold: number,
  webhook: string
) {
  try {
    const result = await processDeliberation(id, prompt, context, sentinels, threshold);
    await notifyWebhook(webhook, { ...result, status: 'complete' });
  } catch (error) {
    await saveDeliberation({
      id,
      prompt,
      context,
      status: 'failed',
      createdAt: Date.now(),
      requester: 'api'
    });
    await notifyWebhook(webhook, { id, status: 'failed', error: String(error) });
  }
}

async function callSentinel(name: string, prompt: string, context: any): Promise<string> {
  // Mock implementation for now - will be replaced with actual Sentinel calls
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  return `${name} analyzed: "${prompt}". ${context ? `Context considered: ${JSON.stringify(context)}. ` : ''}Recommendation based on integrity principles.`;
}

export default router;
