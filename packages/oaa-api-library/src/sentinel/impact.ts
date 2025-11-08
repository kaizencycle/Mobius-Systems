export type ImpactLevel = "low" | "medium" | "high";

const HIGH_WEIGHT_DOMAINS = new Set([
  "reuters.com",
  "apnews.com",
  "bloomberg.com",
  "ecb.europa.eu",
  "bis.org",
  "fema.gov",
  "civil-protection-humanitarian-aid.ec.europa.eu",
  "nasa.gov",
  "who.int",
]);

const HIGH_TRIGGERS = [
  "attack",
  "war",
  "default",
  "emergency",
  "outage",
  "earthquake",
  "pandemic",
  "rate hike",
  "rate cut",
  "inflation",
  "recession",
  "sanction",
  "ban",
  "strike",
  "recall",
  "evacuation",
  "mobilization",
  "critical infrastructure",
];

export function scoreImpact(input: { domains: Set<string>; text: string }): ImpactLevel {
  const unique = new Set(Array.from(input.domains).map((d) => d.toLowerCase()));
  let weight = 0;
  for (const domain of unique) {
    if (HIGH_WEIGHT_DOMAINS.has(domain)) {
      weight += 2;
    } else if (domain.includes(".")) {
      weight += 1;
    }
  }

  const lower = (input.text || "").toLowerCase();
  const triggerHit = HIGH_TRIGGERS.some((token) => lower.includes(token));
  if (weight >= 5 && triggerHit) return "high";
  if (weight >= 3) return "medium";
  if (weight >= 2 && triggerHit) return "medium";
  return "low";
}

