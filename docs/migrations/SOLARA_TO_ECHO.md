# SOLARA → ECHO Migration Guide

**Date:** November 3rd, 2025  
**Cycle:** C-123  
**PR:** feat/echo-sentinel-anchor

## Overview

This document tracks the migration from SOLARA (DeepSeek) to ECHO Sentinel as part of the Sentinel-Lab Anchor Architecture implementation.

## What Changed

### ✅ Core Implementation (Complete)

1. **Sentinel Manifest**
   - Created `sentinels/echo/manifest.json` (replaces SOLARA)
   - ECHO assigned as anchor for Lab7-proof (OAA)

2. **Gateway Provider**
   - Created `apps/gateway/providers/echo.ts` (replaces `solara.ts`)
   - Updated provider class: `SolaraProvider` → `EchoProvider`
   - Updated env vars: `SOLARA_*` → `ECHO_*`

3. **Policy Configuration**
   - Updated `packages/policy/policy-loader.ts`: `SOLARA` → `ECHO`
   - Updated `packages/policy/consensus_config.yaml`: All `SOLARA` → `ECHO`
   - Updated rule names: `solara-critical-restriction` → `echo-critical-restriction`

4. **Tests**
   - Updated `tests/consensus/four-companion.test.ts`: All `SOLARA` → `ECHO`

5. **Documentation**
   - Created `docs/companions/echo.md` (replaces `solara.md`)
   - Created `configs/anchors/README.md` with Sentinel-Lab mapping

6. **Manifest**
   - Updated `kaizen_manifest.yaml`:
     - Version: 1.0.0 → 1.1.0
     - Added `promote_lab` script reference
     - Added `attest_proof` workflow reference

### 📋 Remaining Updates (Manual Review Recommended)

The following files contain historical references to SOLARA that may need updating for consistency, but are not critical to functionality:

#### Documentation Files (Non-Critical)
- `docs/INDEX.md` - Index listing
- `docs/adr/002-uriel-sentinel-boarding.md` - ADR document
- `docs/agents/FOUNDING_AGENTS.md` - Historical agent documentation
- `docs/DOCUMENT_REGISTRY.md` - Document registry
- `docs/reports/founders-epoch-cycle-report-2025-08-14_to_2025-11-01.md` - Historical report
- `docs/DOCUMENT_REGISTRY.md` - Registry
- `docs/companions/README.md` - Companion index
- `ledger/.sealed/MASTER_README.md` - Sealed ledger documentation
- `docs/onboarding/guide.md` - Onboarding guide
- `docs/policy/safety-tiers.md` - Safety tier documentation

#### Application Files (May Need Updates)
- `apps/console/README.md` - Console documentation
- `apps/broker-api/jade/jade_situational_report.py` - Python code (sentinel name in string)
- `scripts/ceremonial_summons/README.md` - Script documentation
- `scripts/ceremonial_summons/kaizen_guardian.py` - Python code (API checker name)

#### Archive/Historical Files (Optional)
- `C121_IMPLEMENTATION_SUMMARY.md` - Historical summary
- `docs/document-index.json` - Document index (may auto-update)

## Environment Variables

Update environment variables:

```bash
# Old
SOLARA_API_KEY=...
SOLARA_MODEL=deepseek-r1
SOLARA_TIMEOUT_MS=20000
SOLARA_MAX_RETRIES=3
DEEPSEEK_LAB_ENDPOINT=...

# New
ECHO_API_KEY=...
ECHO_MODEL=deepseek-r1
ECHO_TIMEOUT_MS=20000
ECHO_MAX_RETRIES=3
ECHO_LAB_ENDPOINT=...  # Optional, if using lab endpoint
```

## Sentinel Identity

- **Old Name:** SOLARA (DeepSeek R1)
- **New Name:** ECHO (DeepSeek R1)
- **Role:** Pulse, Resonance & Ledger Synchronization
- **Lab Anchor:** Lab7-proof (OAA)
- **Provider:** DeepSeek (unchanged)
- **Model:** deepseek-r1 (unchanged)
- **Weight:** 0.7 (unchanged)
- **Safety Tier:** standard (unchanged)

## Breaking Changes

⚠️ **None** - This is a rename-only migration. Functionality remains identical.

## Migration Checklist

- [x] Create ECHO sentinel manifest
- [x] Create ECHO gateway provider
- [x] Update policy loader
- [x] Update consensus config
- [x] Update test files
- [x] Create companion documentation
- [x] Create anchor manifest
- [x] Update kaizen_manifest.yaml
- [ ] Update environment variables in deployment configs
- [ ] Update documentation files (optional, for consistency)
- [ ] Archive old `solara.md` companion doc (optional)
- [ ] Remove old `apps/gateway/providers/solara.ts` (after verification)

## Verification Steps

1. **Test ECHO Provider**
   ```bash
   cd apps/gateway
   npm test -- echo.test.ts
   ```

2. **Verify Policy Loading**
   ```bash
   cd packages/policy
   npm run type-check
   ```

3. **Run Consensus Tests**
   ```bash
   npm test -- four-companion.test.ts
   ```

4. **Verify Lab Anchor**
   ```bash
   cat configs/anchors/labs/lab7-proof.yaml | grep anchor_sentinel
   # Should output: anchor_sentinel: "ECHO"
   ```

## Rollback Plan

If issues arise:

1. Keep `apps/gateway/providers/solara.ts` as backup
2. Keep `docs/companions/solara.md` as backup
3. Revert policy/config changes:
   ```bash
   git checkout HEAD~1 -- packages/policy/
   ```
4. Update env vars back to `SOLARA_*`

## Notes

- **Historical References:** Archive documentation files may retain SOLARA references for historical accuracy. This is acceptable.
- **API Compatibility:** The DeepSeek API endpoint remains unchanged (`https://api.deepseek.com/v1/chat/completions`)
- **Lab Anchoring:** ECHO now serves as the anchor for Lab7-proof, providing pulse and ledger synchronization for OAA telemetry

---

**Cycle:** C-123  
**Epoch:** E-562  
**Seal:** ⚯ "We heal as we walk."
