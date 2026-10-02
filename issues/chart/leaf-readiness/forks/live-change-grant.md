# Live change grant

## Question
Q1. Should the door record approval for live changes (named accounts, targets and operations, cleanup included) as a binding decision that seats treat as granted, with new targets or different mutations needing new approval?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a; granted live changes are part of the contract.
- Intake I6: about 8 h waiting for approval of a live run in emdash-launch.

## Findings
- Round files: slots/live-change-grant-A.md, slots/live-change-grant-B.md, slots/live-change-grant-merged.md, slots/live-change-grant-rebuttal-B.md.
- (A) emdash-launch design required the live launch (design.md:143,148), yet seats treated mutation as unauthorized and waited (review-B.md:254-258); the eventual grant named target, operations, cleanup and stop line (review-B.md:256).
- (A,B) Recommend 1a: one scoped grant per leaf in the contract, recorded during charting before mutating proofs, naming provenance, verified principal and account, targets or owned-fixture class with ownership marker, operations incl. transitive and cleanup, repeat bounds, stop line, lifetime. Reused across seats, phases, repairs; phase ownership unchanged (check-issue:69). New approval on new identity, target, mutation, larger effects, expiry.
- B rebuttal R1-R3 applied: verified principal not just credential name; ownership evidence before deletion; phase routing kept.
- Research: Dinah McNutt, Release Engineering (sre.google, 2016); DORA, Streamlining change approval (dora.dev, 2025-10-30); src/state.ts:35-58 has no grant field.

## Taken
2026-10-02, operator: `1a then` (after asking "what does planning time mean? Charting?"; answered: yes, during charting before the first mutating proof, confirmed at handoff review).

Each leaf's readiness contract carries one scoped live-change grant, recorded by the door during charting before the first mutating proof and confirmed at handoff review. It names approval provenance; the verified principal and account from the door's proof plus credential name and holding repo, never the value; targets by name or ID, and leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs linked to the leaf before any change or deletion; operations including transitive helpers, checks and cleanup, with destructive, public, billing, DNS and retention effects explicit; repeat and recovery bounds; the stop line for what stays human; lifetime (the leaf's unless shorter). Seats reuse it for probes, implementation, repairs, reruns, merge checks and cleanup without asking again, never widen it, and record the grant reference, results and created IDs in their pass artifact. Phase ownership is unchanged (check.fix B hands required live runs to A). New approval is needed for a different identity or account, a target outside the set, a new or different mutation, larger effects, or expiry. The grant needs a schema-backed place in leaf state.

Reason: a design requiring a live run was not read as permission and emdash-launch waited about 8 h (I6); per-run approval repeats that wait (DORA); an open grant leaves accounts, targets and deletes unbounded.

Foreclosed: 1b approval per live run; 1c handoff as permission for anything.
