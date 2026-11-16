# What run-check refuses for a failed leaf

## Question

Q1. Which runs does run-check refuse while the leaf is `failed`: every leaf- and worker-scoped run, only paid ones, or more phases than `failed`?

Q2. Where and when is the phase read: once in `leafTarget` (src/run-check.ts), or also again right before the child starts, after any admission wait (src/admission.ts `withAdmission`)?

Q3. What happens to a run already started when the leaf moves to `failed`?

Q4. `akrogon verify` also runs through `checkedRun` with a leaf caller (src/verify.ts). Does any flow verify a leaf while it is `failed`, and does the refusal need a carve-out?

### Carries

- Signposts 5a (refuse the affected action loudly where the actor reads it; operator recovery path continues), 1a, 3a. Hard limit: every run-check refusal leaves a durable record (C L3).
- Report #136 (INTAKE.md) and lesson learnings/history/2026-11-15-background-wait-fails-leaf.md, whose stated guard is "run-check refuses a leaf-scoped launch when the leaf phase is failed".
- Related forks: forks/turn-count.md.

## Findings

Blind notes: slots/failed-refusal-A.md, -B.md, -C.md; merged: slots/failed-refusal-merged.md; rebuttals: slots/failed-refusal-rebuttal-B.md, -C.md.

- Research (better-than-training, src/run-check.ts leafTarget/leafFields/checkedRun/refusePublish, src/admission.ts withAdmission, src/verify.ts, src/phase.ts transition, read 2026-11-16): phase is copied but never gated. `transition` already says "Leaf is failed. A seat cannot resume it." (B R1). No skill flow verifies a failed leaf (C read the implement, check and merge skills).
- refusal.json's only reader is scratch cleanup in src/reconcile.ts (C R1). appendTiming warns and continues on an append error (B R2).

## Taken

A's picks under full autopilot (2026-11-16, door t126), not operator words.

1. Q1: refuse every new leaf- and worker-scoped run (the caller carries a phase) while the leaf phase is `failed`. Holder and checkout runs are untouched. No other phase. Reason: the observed state, no cost signal in code (signpost 5a).
2. Q2: read the phase before admission and again with a fresh `readState` right before spawn, beside the fenced `ownerRefusal`. That last read is the acceptance point, and a failure committed after it does not cancel the run (B R3, stated in the contract). Each refusal appends one timing row `check_refused` (slug, run, name, scope, phase, optional unit and attempt) and throws `PublishRefusedError` with: "Refusing run-check <name> for leaf <repo>/<slug>: the leaf is failed (<failure reason>). Stop work on this leaf; the operator recovers it with akrogon phase <slug> <failure.phase>." Reason: the seat reads stderr at the point of use, and the timing row is the record reports read (C R1). The "run the plain command" clause is dropped per B R1, since recovery is operator-only. B's dissent on the record form stands.
3. Q3: runs accepted before the move finish and publish. A nested run-check after the move is refused as a fresh launch (A,B,C).
4. Q4: no carve-out. Every verify stage is a fresh launch and is refused the same way, and a refusal never writes a complete receipt (A,B,C).

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it is a restatement for a valid state and adds no mechanism:

- Q2 corrected (B F1): `failure` is optional when phase is `failed` (src/state.ts). Then the refusal still fires, the text says "(failure record unavailable)" in place of the reason, and the recovery clause names no phase: "the operator recovers it with akrogon phase <slug> <phase>" only when `failure.phase` exists, else "the operator recovers it with akrogon phase".

Leaf review (slots/leaf-review-B.md, slots/leaf-review-C.md), 2026-11-16: A adopted every defect into the leaf contracts except moving #137 out of refuse-failed-runs (C S1), which the one-completion-owner rule forbids; the listener PATH crash stays Off route by the reporter's own words.
