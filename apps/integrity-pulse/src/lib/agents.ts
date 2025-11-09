export const AGENT_COLORS: Record<string, string> = {
  AUREA:"#FFA94D", HERMES:"#8CFF6A", ZEUS:"#6AE6FF", EVE:"#FF6AD5",
  JADE:"#B48CFF", ATLAS:"#FFFF6A", ECHO:"#6AFFB7", URIEL:"#FFB84D"
};
export const KNOWN_AGENTS = Object.keys(AGENT_COLORS);
export const PROJECTORS = ["kv-projector:v1","kv-fuse:v1","kv-fuse:v2"];
export function colorFor(agent:string){ return AGENT_COLORS[agent] ?? "#ccc"; }
