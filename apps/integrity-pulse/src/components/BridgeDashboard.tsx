"use client";

import { useRelayFeed } from "../hooks/useRelayFeed";
import RelayFilters from "../components/RelayFilters";
import RelayTimeline from "../components/RelayTimeline";
import RateCounters from "../components/RateCounters";
import PairSparklines from "../components/PairSparklines";

export default function BridgeDashboard() {
  const url = process.env.NEXT_PUBLIC_BRIDGE_SSE;
  useRelayFeed(url); // start the SSE → filtered log pipeline

  return (
    <div style={{
      position: "fixed",
      top: 60,
      right: 20,
      width: "600px",
      maxHeight: "calc(100vh - 80px)",
      overflowY: "auto",
      padding: "16px",
      background: "rgba(0,0,0,0.7)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 12,
      backdropFilter: "blur(6px)",
      zIndex: 10
    }}>
      {/* Quick activity snapshot */}
      <div style={{marginBottom:16}}>
        <h2 style={{marginBottom:8, fontSize:18}}>Bridge Activity</h2>
        <RateCounters />
      </div>

      <RelayFilters />
      <RelayTimeline />

      {/* Top link flows */}
      <PairSparklines />
    </div>
  );
}
