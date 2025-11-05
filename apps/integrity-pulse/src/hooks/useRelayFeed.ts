"use client";

import { useEffect } from "react";
import { useEventStream } from "./useEventStream";
import { append, matches } from "../state/relayLog";
import { record } from "../state/metrics";

export function useRelayFeed(url?: string){
  const { last } = useEventStream(url);
  useEffect(()=>{
    if (!last) return;
    if (matches(last)) {
      append(last);
      record(last);   // ← feed metrics
    }
  },[last]);
}
