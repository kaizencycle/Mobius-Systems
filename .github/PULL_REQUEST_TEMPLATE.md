## Summary
- [ ] Intent:
- [ ] Affected areas:

## Safety & Integrity
- [ ] No secrets committed
- [ ] CI green
- [ ] GI ≥ 0.95 (EVE attestation attached)

## Linked Attestation
`kind: code_change` • `source: Codex` • `cycle: C-###` • `gi: x.xxx`

---

## Claude Code Reviewer Checklist (if PR authored by Claude/other agents)
- [ ] **Explainability:** Agent included a brief rationale for major changes (what/why).
- [ ] **Scope control:** Changes are limited to the stated intent; no surprise refactors.
- [ ] **Security & privacy:** No secrets, tokens, or sensitive data; env handling is unchanged or improved.
- [ ] **Compat:** Frontend builds locally; server APIs unchanged or migration steps documented.
- [ ] **Tests:** Updated/added tests for new behavior, or justification given if not applicable.
- [ ] **GI attestation:** EVE signed GI note present; GI ≥ 0.95 gate expected to pass.
- [ ] **Roll-back plan:** Clear revert path or feature flag noted.
