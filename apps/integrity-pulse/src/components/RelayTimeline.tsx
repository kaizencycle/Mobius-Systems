"use client";

import { useEffect, useState } from "react";
import { getLog, clear, subscribe } from "../state/relayLog";
import type { RelayEvt } from "../hooks/useEventStream";
import { colorFor } from "../lib/agents";

export default function RelayTimeline(){
  const [items,setItems]=useState<RelayEvt[]>(()=>getLog());
  useEffect(()=> subscribe(()=> setItems([...getLog()])), []);
  return (
    <section style={{marginTop:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{margin:"10px 0"}}>Relay Timeline</h3>
        <div>
          <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(items.slice(0,100),null,2))}
                  style={{marginRight:8,padding:"6px 10px",borderRadius:6, cursor: "pointer"}}>Copy JSON</button>
          <button onClick={clear} style={{padding:"6px 10px",borderRadius:6, cursor: "pointer"}}>Clear</button>
        </div>
      </div>
      <div style={{
        height: 260, overflow:"auto", border:"1px solid rgba(255,255,255,.12)",
        borderRadius:10, padding:8, background:"rgba(255,255,255,.03)"
      }}>
        {items.length===0 && <div style={{opacity:.7}}>No relays yet…</div>}
        {items.map((e)=>(
          <Row key={e.id+e.ts} e={e}/>
        ))}
      </div>
    </section>
  );
}

function Row({e}:{e:RelayEvt}){
  return (
    <div style={{display:"grid", gridTemplateColumns:"120px 18px 120px 1fr", gap:10, alignItems:"center", padding:"6px 0",
      borderBottom:"1px dashed rgba(255,255,255,.08)"}}>
      <Badge label={e.from} color={colorFor(e.from)}/>
      <span style={{opacity:.6}}>➟</span>
      <Badge label={e.to} color={colorFor(e.to)}/>
      <div style={{fontFamily:"ui-monospace", fontSize:12, opacity:.95}}>
        {new Date(e.ts).toLocaleTimeString()} · {e.projector} · {pretty(e.size_bytes)}
      </div>
    </div>
  );
}
function Badge({label,color}:{label:string;color:string}){
  return <span style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    height:22, borderRadius:6, padding:"0 8px",
    border:`1px solid ${color}`, background:`${color}20`, color:"#fff", fontSize:12
  }}>{label}</span>;
}
function pretty(n:number){ if(n>1e6) return (n/1e6).toFixed(2)+" MB";
  if(n>1e3) return (n/1e3).toFixed(1)+" kB"; return n+" B"; }
