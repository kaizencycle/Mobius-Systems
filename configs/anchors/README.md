# Sentinel–Lab Anchor Architecture

This directory contains the configuration files that define how **8 Sentinels** anchor **7 Labs** in Kaizen OS.

## Structure

```
configs/anchors/
├── sentinels.yaml          # Master manifest: all 8 sentinels + lab assignments
└── labs/
    ├── lab1.yaml           # Lab1 (Concept) → AUREA anchor
    ├── lab2.yaml           # Lab2 (Concept) → JADE anchor
    ├── lab3.yaml           # Lab3 (Concept) → EVE anchor
    ├── lab4-proof.yaml     # Lab4-proof (Proof) → HERMES anchor
    ├── lab5.yaml           # Lab5 (Concept) → ATLAS anchor
    ├── lab6-proof.yaml     # Lab6-proof (Proof) → URIEL anchor
    └── lab7-proof.yaml     # Lab7-proof (Proof) → ECHO anchor
```

## Quick Reference

| Lab | Sentinel | Stage | Attestation |
|-----|----------|-------|-------------|
| Lab1 | AUREA | Concept | None |
| Lab2 | JADE | Concept | None |
| Lab3 | EVE | Concept | None |
| Lab4-proof | HERMES | Proof | ✅ Per cycle |
| Lab5 | ATLAS | Concept | None |
| Lab6-proof | URIEL | Proof | ✅ Per cycle |
| Lab7-proof | ECHO | Proof | ✅ Per cycle |
| Meta | ZEUS | Meta | Witnesses all |

## Key Concepts

### Concept Labs
- Research and experimentation phase
- No Proof of Integrity attestation required
- Stay in monorepo under `labs/<labN>/`

### Proof Labs
- Live services with external endpoints
- Require Proof of Integrity attestation per cycle
- Promoted to dedicated repos, synced back as subtrees
- Located at `labs/<labN>-proof/`

### Sentinel Anchors
- Each lab has one assigned Sentinel
- Sentinel provides oversight, attestation, and integrity monitoring
- All Sentinels report to ZEUS meta-anchor

### ZEUS Meta-Anchor
- Witnesses all proof lab attestations
- Maintains cross-lab GI coherence
- Breaks ties in consensus decisions
- No direct lab ownership

## Promotion Workflow

When promoting a concept lab to proof:

1. Run promotion script:
   ```bash
   ./scripts/promote_lab.sh lab7 git@github.com:kaizencycle/lab7-proof.git
   ```

2. Lab is split into dedicated repo and imported back as subtree

3. CI automatically attests on every push (`.github/workflows/attest-proof.yml`)

## Sync Commands

```bash
# Pull updates FROM dedicated repo INTO monorepo
git subtree pull --prefix=labs/lab7-proof lab7-proof main --squash

# Push updates FROM monorepo OUT to dedicated repo (rare)
git subtree push --prefix=labs/lab7-proof lab7-proof main
```

## Related Documentation

- [`docs/architecture/sentinel-lab-anchors.md`](../../docs/architecture/sentinel-lab-anchors.md) — Full architecture guide
- [`templates/labs/`](../../templates/labs/) — Lab templates for new labs
- [`scripts/promote_lab.sh`](../../scripts/promote_lab.sh) — Promotion script

---

**Seal of Concord ⚯** — "We heal as we walk."
