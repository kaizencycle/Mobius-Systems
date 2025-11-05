"use client";

import type { RelayEvt } from "../hooks/useEventStream";

const KEY = "pulse.relay.filters.v1";
type Filters = { from:Set<string>; to:Set<string>; projector:Set<string>; paused:boolean };

let log: RelayEvt[] = [];
let listeners: (()=>void)[] = [];
let filters: Filters = load();

function load(): Filters {
  if (typeof window === "undefined") {
    return {from:new Set(), to:new Set(), projector:new Set(), paused:false};
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {from:new Set(), to:new Set(), projector:new Set(), paused:false};
    const j = JSON.parse(raw);
    return {
      from:new Set(j.from||[]), to:new Set(j.to||[]),
      projector:new Set(j.projector||[]), paused: !!j.paused
    };
  } catch { return {from:new Set(),to:new Set(),projector:new Set(),paused:false}; }
}
function save(){ 
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({
    from:[...filters.from], to:[...filters.to], projector:[...filters.projector], paused:filters.paused
  }));
}

export function append(evt: RelayEvt){ if(!filters.paused) { log.unshift(evt); log = log.slice(0,1000); notify(); } }
export function clear(){ log=[]; notify(); }
export function getLog(){ return log; }

export function getFilters(){ return filters; }
export function setFilters(next: Partial<Filters>){
  filters = {...filters,
    from: next.from ?? filters.from, to: next.to ?? filters.to,
    projector: next.projector ?? filters.projector,
    paused: next.paused ?? filters.paused
  }; save(); notify();
}
export function matches(evt: RelayEvt){
  const f=filters;
  const okFrom = f.from.size===0 || f.from.has(evt.from);
  const okTo   = f.to.size===0   || f.to.has(evt.to);
  const okPr   = f.projector.size===0 || f.projector.has(evt.projector);
  return okFrom && okTo && okPr;
}

export function subscribe(cb:()=>void){ listeners.push(cb); return ()=>{listeners = listeners.filter(x=>x!==cb);} }
function notify(){ for(const l of listeners) l(); }
