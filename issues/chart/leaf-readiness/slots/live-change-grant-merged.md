# Live change grant: merged A + B

## Evidence (A)
emdash-launch's design required the live launch (framework issues/open/emdash-cms/emdash-build/emdash-launch/design.md:143,148), yet seats treated Cloudflare, R2, GitHub and domain mutation as unauthorized (review-B.md:254-258, review-A.md:114) and waited about 8 h (I6). A design that requires a live run was not read as permission. The grant the operator finally gave named a target, operations, cleanup and a stop line (review-B.md:256, implementation/report.md:226), which is the shape needed.

## Recommendation (A,B): 1a one scoped grant per leaf in the contract
- Recorded by the door during charting, before the first mutating proof (B; key-sheet already requires approvals before affected proofs), confirmed at handoff review. A seat can propose a change but never widen its own grant (B).
- Names: approval provenance (operator, date, verbatim answer) (B); executing principal and account as verified by the door's proof, plus the credential name and holding repo, never the value; a new value under the same name needs fresh identity proof (A,B, B R1); targets by name or ID, and leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs recorded and linked to this leaf before any change or deletion; a name match alone is not ownership (A,B, B R2); operations including transitive helpers, configured checks and cleanup, with destructive, public, billing, DNS and retention effects explicit (B); repeat and recovery bounds (B); stop line for what stays human (A); lifetime: the leaf's lifecycle unless shorter (A,B).
- Seats reuse it for probes, implementation, repairs, reruns, merge checks and cleanup without asking again. A new seat, phase, repair or retry inside the bounds needs no new approval (B). Phase ownership is unchanged: check.fix B still hands required live runs to A (check-issue:69) (B R3).
- New approval when: a different identity or account, a target outside the named set, a new or different mutation, larger effects or limits, or expiry/revocation (A,B). A provider 403 is not permission to switch identity; cleanup needing an unapproved delete or a retention change is a blocker (B).
- A seat checks fit by reading the contract, comparing the actual operation, target and identity against it, linking the door's proof record, and writing the grant reference plus results and created IDs in its pass artifact; on doubt it does not mutate (B).
- Schema: `src/state.ts:35-58` has no grant field; the contract needs a schema-backed place, not `hand_built`, `failure` or loose YAML (B).

## Options
- 1a (A,B) as above.
- 1b approval per live run. Cost: the 8 h wait repeats on every repair and cleanup run.
- 1c handoff counts as permission for anything. Cost: accounts, targets and cleanup reach undefined; conflicts with the taken contract.

## Pitfalls
- A grant is consent only; it gives no token scope (key-sheet) and cannot override a tool deny rule (B).
- Production targets are named singly, never by pattern (A).
- A failed create reply can hide a success: find owned resources before retrying (B).
- Fixture choice stays in proof-fixtures; producer env writes stay in blocker-record (B).

## Research
- operator · INTAKE I6; taken readiness-contract, key-creation, key-sheet, env-source.
- practitioner · Dinah McNutt, "Release Engineering", Google SRE book (sre.google, 2016): self-service release with operation-specific access control and archived change records.
- practitioner · DORA, "Streamlining change approval" (dora.dev, updated 2025-10-30): heavier external approval shows no lower failure rate; prefer review plus automated checks.
- better-than-training · framework emdash-launch review-A/B, report.md; skills check-issue:29,69, implement-issue:33,40; src/state.ts:35-58; code.claude.com/docs/en/permissions.
