# Threat Model (STRIDE) v0.1

Assets: Attestations, MII signatures, Ledger state, JWKS keys, Deliberation Proofs.

## Spoofing

- Enforce mutual TLS across services.
- Validate `kid` against JWKS and verify signature before accepting writes.

## Tampering

- All writes are signed and batched; batches are Merkle-root anchored.
- Append-only ledger with hash chain on `prev_attestation_hash`.

## Repudiation

- Immutable ledger entries and attestation chain prevent denial.
- Compromise response: publish revocation in CRL and ledger correction entry.

## Information Disclosure

- Attestations avoid PII by design; expose metrics only.
- Encrypt sensitive configuration at rest; restrict JWKS access.

## Denial of Service

- Rate limit per service/instance; apply circuit breakers and back-pressure.
- Trigger safe-stop if sustained overload or signature backlog detected.

## Elevation of Privilege

- RBAC on write paths; multi-party human override required for policy changes.
- Sentinel monitors ensure MII ≥ 0.95; quarantine actors breaching thresholds.
