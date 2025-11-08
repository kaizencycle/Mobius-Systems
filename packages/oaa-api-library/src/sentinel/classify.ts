export type AlertDomain = "economy" | "technology" | "climate" | "defense";

const ECONOMY_PATTERNS = /(ecb|inflation|gdp|yields|employment|recession|treasury|bond|central bank|cpi|pmi|fed|rate)/i;
const TECHNOLOGY_PATTERNS = /(chip|semiconductor|ai|data center|cloud|satellite|launch|software|cyber|quantum|computing|telecom)/i;
const CLIMATE_PATTERNS = /(wildfire|flood|hurricane|heatwave|climate|emissions|drought|storm|typhoon|tsunami|earthquake|eruption)/i;
const DEFENSE_PATTERNS = /(military|defense|pentagon|nato|missile|drone|mobilization|exercise|airstrike|frigate|patrol|deployment)/i;

export function classifyTopic(text: string): AlertDomain {
  const sample = (text || "").toLowerCase();
  if (DEFENSE_PATTERNS.test(sample)) return "defense";
  if (CLIMATE_PATTERNS.test(sample)) return "climate";
  if (ECONOMY_PATTERNS.test(sample)) return "economy";
  if (TECHNOLOGY_PATTERNS.test(sample)) return "technology";
  return "technology";
}

