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
