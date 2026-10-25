# Slot B rebuttal

## Agreed

No disagreement with the removal scope, retained phase name, historical artifacts/readers, test preservation, coherent release, or unchanged handoff shape.

**F1 — Fix counts do not establish planning quality.** Replace “Fixes in both groups are implementation and proof defects” with a narrower conclusion: both modes had defects, and the counts do not classify their causes. A concrete direct-synthesis planning error exists: `issues/closed/verify-waste/member-receipts/plan.md` D2 copies blocker logs into unexecuted members, while D8 incorrectly concludes those logs cannot provide known-red cover. `review-B.md` F1 demonstrates that consequence. The existing consumer/precondition requirement still suffices, but this example cannot be classified solely as implementation failure. Evidence: better-than-training, those artifact sections, read 2026-10-25.

**F2 — “Every log line” overstates the rename cost.** Historical names can remain readable under the proposed historical enum. Retaining `plan.synthesis` avoids live-state, dispatch and documentation churn without requiring that historical logs would otherwise be rewritten. Evidence: better-than-training, `src/log.ts` (`logSchema`, `readLog`), `src/routing.ts` (`phaseSchema`, `routing`), read 2026-10-25.

## Differ

1. Pick explicit coordinated migration with strict schemas: remove obsolete persisted keys without permanent compatibility code, but make stopped writers, all registered roots, release activation and data rollback part of the cutover contract. Evidence: better-than-training, `src/state.ts` (`stateSchema`, `readState`), `src/config.ts` (`repoSchema`, `readRepo`), read 2026-10-25.
2. Pick no mapping: recheck zero at cutover and refuse a stray retired current phase visibly, because clearing `done` alone does not clear attempts, prompted seats or other phase-local state. Preserve retired `failure.phase` as history. Evidence: better-than-training, `src/state.ts` (`stateSchema`, `failureSchema`), `src/phase.ts` (`commitMove`), read 2026-10-25.

Item 3: no disagreement with leaving synthesis unchanged.

**R1 — Item 4 needs a decision, not just disclosure.** Require reversible data migration/backfill before claiming executable rollback works. The previous schema requires `debate`, including for newly created records. Evidence: better-than-training, `src/state.ts` (`stateSchema`), `docs/reference/releases-and-updates.md` (Rollback), read 2026-10-25.

## Open questions

No disagreement with leaving peer recommendations and lifecycle/direct route selection to the door. Neither requires broadening this removal.
