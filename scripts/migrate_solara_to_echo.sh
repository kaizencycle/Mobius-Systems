#!/usr/bin/env bash
# Migration script: SOLARA → ECHO (C-123)
# Updates remaining references in consensus_config.yaml

set -euo pipefail

CONFIG_FILE="packages/policy/consensus_config.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Error: $CONFIG_FILE not found"
  exit 1
fi

echo "🔄 Migrating SOLARA → ECHO in $CONFIG_FILE"

# Backup original
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"

# Replace SOLARA companion definition with ECHO
sed -i.bak 's/^  SOLARA:/  ECHO:/' "$CONFIG_FILE"
sed -i.bak 's/capabilities: \[research, ideation, content, analysis\]/capabilities: [research, ideation, content, analysis, pulse_sync, ledger_resonance]/' "$CONFIG_FILE"
sed -i.bak '/^  ECHO:/a\    anchor_for_lab: lab7-proof\n    previous_names: ["SOLARA"]\n    note: "Renamed from SOLARA (DeepSeek) on C-123 to align with Lab7-proof anchoring role"' "$CONFIG_FILE"

# Replace eligibility rule
sed -i.bak 's/name: "solara-critical-restriction"/name: "echo-critical-restriction"/' "$CONFIG_FILE"
sed -i.bak 's/companion: SOLARA/companion: ECHO/' "$CONFIG_FILE"
sed -i.bak '/echo-critical-restriction/a\      note: "Formerly solara-critical-restriction, renamed C-123"' "$CONFIG_FILE"

# Clean up backup files
rm -f "${CONFIG_FILE}.bak"

echo "✅ Migration complete"
echo "📝 Backup saved to ${CONFIG_FILE}.backup"
echo ""
echo "⚠️  Note: Please review the changes and test before committing"