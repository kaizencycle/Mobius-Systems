"use client";

// Sliding-window metrics for relay events.
// Window: last 5 minutes, bucket size: 5s (60 buckets)

import type { RelayEvt } from "../hooks/useEventStream";

const BUCKET_MS = 5_000;
const WINDOW_BUCKETS = 60;

type Series = { buckets: Map<number, number> }; // bucketKey -> count

const perAgent: Record<string, Series> = {};
const perPair: Record<string, Series> = {};

function bucketKey(ts: number | string) {
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts;
  return Math.floor(t / BUCKET_MS);
}
function ensure(series: Record<string, Series>, key: string) {
  if (!series[key]) series[key] = { buckets: new Map() };
  return series[key];
}
function prune(s: Series, nowKey: number) {
  const minKey = nowKey - WINDOW_BUCKETS + 1;
  for (const k of s.buckets.keys()) if (k < minKey) s.buckets.delete(k);
}

export function record(evt: RelayEvt) {
  const k = bucketKey(evt.ts);
  const now = k;

  // per-agent (from & to)
  const A = ensure(perAgent, evt.from);
  const B = ensure(perAgent, evt.to);
  A.buckets.set(k, (A.buckets.get(k) || 0) + 1);
  B.buckets.set(k, (B.buckets.get(k) || 0) + 1);
  prune(A, now);
  prune(B, now);

  // per-pair (directed)
  const key = `${evt.from}→${evt.to}`;
  const P = ensure(perPair, key);
  P.buckets.set(k, (P.buckets.get(k) || 0) + 1);
  prune(P, now);
}

function seriesToArray(s: Series): number[] {
  const nowKey = bucketKey(Date.now());
  const arr: number[] = new Array(WINDOW_BUCKETS).fill(0);
  for (let i = 0; i < WINDOW_BUCKETS; i++) {
    const bk = nowKey - (WINDOW_BUCKETS - 1 - i);
    arr[i] = s.buckets.get(bk) || 0;
  }
  return arr;
}

export function getAgentSeries(agent: string): number[] {
  const s = perAgent[agent]; if (!s) return new Array(WINDOW_BUCKETS).fill(0);
  return seriesToArray(s);
}
export function getPairSeries(pairKey: string): number[] {
  const s = perPair[pairKey]; if (!s) return new Array(WINDOW_BUCKETS).fill(0);
  return seriesToArray(s);
}

export function eventsPerMin(series: number[]): number {
  // 5s buckets -> per-minute rate (sum last 12 buckets)
  const take = 12;
  const slice = series.slice(-take);
  const total = slice.reduce((a,b)=>a+b,0);
  return total; // events per minute
}

export function topPairs(limit = 8): string[] {
  // rank by recent minute
  const scores = Object.keys(perPair).map(k => {
    return [k, eventsPerMin(getPairSeries(k))] as const;
  });
  scores.sort((a,b)=> b[1]-a[1]);
  return scores.slice(0, limit).map(([k])=>k);
}
