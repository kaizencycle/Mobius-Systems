export const AGENT_COLORS: Record<string, string> = {
  AUREA:"#FFD166", HERMES:"#06D6A0", ZEUS:"#EF476F", EVE:"#118AB2",
  JADE:"#B86BFF", ATLAS:"#73DCFF", ECHO:"#FF9F1C"
};
export const KNOWN_AGENTS = Object.keys(AGENT_COLORS);
export const PROJECTORS = ["kv-projector:v1","kv-fuse:v1","kv-fuse:v2"];
export function colorFor(agent:string){ return AGENT_COLORS[agent] ?? "#ccc"; }
