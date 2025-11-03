# Kaizen OS Proof Lab Promotion Architecture

## Overview

This document describes the architecture for promoting concept labs to proof labs (live/attesting services) using git subtree.

## Architecture

### Lab Stages

- **Concept Labs** (`labs/labN/`): Research, experimentation, internal logic
  - No attestation required
  - Examples: `lab1`, `lab2`, `lab3`, `lab5`

- **Proof Labs** (`labs/labN-proof/`): Live services with Proof of Integrity attestation
  - Emit Proof of Integrity attestations per cycle
  - Require ZEUS witness for GI attestation
  - Must maintain GI score ≥ 0.990 baseline
  - Examples: `lab4-proof`, `lab6-proof`, `lab7-proof`

### Sentinel-Lab Anchor Mapping

| Lab | Anchor Sentinel | Role |
|-----|------------------|------|
| Lab1 | AUREA | Macro intuition |
| Lab2 | JADE | Morale / narrative |
| Lab3 | EVE | Ethics & civility |
| Lab4-proof | HERMES | Markets / pulse |
| Lab5 | ATLAS | Ops / infrastructure |
| Lab6-proof | URIEL | Illumination / doctrine |
| Lab7-proof | **ECHO** | Pulse, ledger sync, reflection |
| Meta | ZEUS | Global Integrity witness |

**Note**: ECHO Sentinel (formerly SOLARA/DeepSeek) anchors Lab7-proof for pulse synchronization and ledger coherence.

## Promotion Workflow

### Step 1: Promote Lab to Dedicated Repo

```bash
./scripts/promote_lab.sh lab7 git@github.com:kaizencycle/lab7-proof.git
```

This script:
1. Splits lab history into dedicated repo branch
2. Pushes to dedicated repo (`lab7-proof`)
3. Imports back as subtree at `labs/lab7-proof/`

### Step 2: Update Lab Config

Create/update `configs/anchors/labs/lab7-proof.yaml` with proof lab configuration.

### Step 3: Verify CI

The `.github/workflows/attest-proof.yml` workflow will automatically:
- Run tests on push to `labs/*-proof/**`
- Generate Proof of Integrity attestation
- Upload attestation artifact
- Optionally publish to Civic Ledger

## Ongoing Sync

### Pull Updates FROM Dedicated Repo INTO Monorepo

```bash
git subtree pull --prefix=labs/lab7-proof lab7-proof main --squash
```

### Push Updates FROM Monorepo OUT to Dedicated Repo (Rare)

```bash
git subtree push --prefix=labs/lab7-proof lab7-proof main
```

## CI/CD Integration

### Proof Lab Attestation Workflow

- **Trigger**: Push to `labs/*-proof/**`
- **Actions**:
  1. Install dependencies
  2. Run tests
  3. Load Sentinel anchor config
  4. Generate Proof of Integrity attestation
  5. Upload artifact
  6. Publish to Civic Ledger (optional)

### Attestation Format

```json
{
  "timestamp": "2025-11-03T12:05:00Z",
  "lab": "lab7-proof",
  "commit": "abc123...",
  "run_id": "1234567890",
  "anchor_sentinel": {
    "id": "echo",
    "name": "ECHO"
  },
  "witness": "ZEUS",
  "proof_type": "ProofOfIntegrity",
  "status": "PASS",
  "signature": "sha256..."
}
```

## Configuration Files

- `configs/anchors/sentinels.yaml` - Sentinel-Lab anchor manifest
- `configs/anchors/labs/*.yaml` - Per-lab configuration
- `.github/workflows/attest-proof.yml` - CI attestation workflow
- `scripts/promote_lab.sh` - Lab promotion script

## Migration Notes

### SOLARA → ECHO Rename (C-123)

- **Date**: November 3rd, 2025
- **Reason**: Align sentinel name with Lab7-proof anchoring role
- **Changes**:
  - `sentinels/solara/` → `sentinels/echo/`
  - Updated `packages/policy/consensus_config.yaml`
  - Updated `packages/policy/policy-loader.ts`
  - Created `sentinels/echo/manifest.json`

**Note**: DeepSeek provider references remain unchanged (provider name ≠ sentinel name).

## References

- [Kaizen OS Manifest](kaizen_manifest.yaml)
- [Sentinel Anchor Map](configs/anchors/sentinels.yaml)
- [Lab Configs](configs/anchors/labs/)
- [Promotion Script](scripts/promote_lab.sh)