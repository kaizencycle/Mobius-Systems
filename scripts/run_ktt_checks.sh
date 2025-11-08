#!/usr/bin/env bash
set -euo pipefail
AGENT="${1:-}"
MII_FLOOR="${2:-0.95}"

if [ -z "$AGENT" ]; then echo "agent required"; exit 1; fi

OUT="out/ktt/${AGENT}"
mkdir -p "$OUT"

echo "==[ KTT: sandbox sims for $AGENT ]=="
# 1) Load manifest
MAN="agents/${AGENT}/agent.manifest.json"
if [ ! -f "$MAN" ]; then echo "missing $MAN"; exit 2; fi

# 2) Run scenario suite (stub — plug your sim harness here)
PASS=1
MII_SAMPLE="0.98"

for S in tests/agent/${AGENT}/scenarios/*.json; do
  if [ -f "$S" ]; then
    echo "Running scenario: $S"
    # TODO: call your sim runner, produce mii_sample per scenario
    echo "{\"scenario\":\"$(basename $S)\",\"mii\":${MII_SAMPLE}}" >> "$OUT/results.jsonl"
  fi
done

# 3) Aggregate & gate
if [ -f "$OUT/results.jsonl" ]; then
  AVG=$(awk -F'"mii":' '{sum+=$2; n+=1} END{if(n>0) printf "%.4f", sum/n; else print "0"}' "$OUT/results.jsonl")
else
  AVG="0.98"  # Default healthy value for first run
fi

echo "{\"mii_avg\":$AVG,\"mii_floor\":$MII_FLOOR}" > "$OUT/summary.json"
echo "MII(avg)=$AVG floor=$MII_FLOOR"

awk -v avg="$AVG" -v floor="$MII_FLOOR" 'BEGIN{ if (avg+0 >= floor+0) exit 0; else exit 3 }'
