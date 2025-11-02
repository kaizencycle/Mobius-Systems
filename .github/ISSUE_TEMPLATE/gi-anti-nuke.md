---
name: "GI Guard: Delete/Rewrite Risk"
about: "Stop accidental destructive changes (monorepo deletions, forced rewrites)."
labels: ["codex", "needs-review", "gi-guard"]
---

## Summary
Describe the change that may remove or rewrite large portions of the repo.

## Checklist (must be ALL ✅)
- [ ] Change is **explicitly requested by Michael** in this issue or linked PR.
- [ ] **Diff surface < 1,000 files** or justification provided.
- [ ] **No path outside target scope** (apps/, packages/, infra/, docs/).
- [ ] Backup/roll-forward plan documented.
- [ ] EVE attestation: GI ≥ 0.95.

## Scope Limits
- Never delete at repo root without explicit approval.
- No force-push to `main`.
- No subtree removals without migration plan.

## Rollback Plan
Explain exact steps to revert safely if needed.
