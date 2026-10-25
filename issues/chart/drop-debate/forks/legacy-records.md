# Legacy records

## Question

Q1. How do the old `debate:` key in 1,058 `state.yaml` records and the `rebuttal:` key in all 11 repo `issues/config.yaml` files stay readable once both fields leave strict schemas (`src/state.ts` `stateSchema`, `src/config.ts` `repoSchema`)?

Q2. What happens to a leaf record that sits at `plan.positions` or `plan.rebuttal` when the new release installs (measured zero open, parked or failed-from in all 11 repos on 2026-10-25)?

### Carries

- Operator 2026-10-25: remove the planning debate and the door's debate question; keep akrogon lean.
- Agreed in map-merged.md: one leaf, one release; historical phase enum for `logSchema`, `timingEventSchema` and `failure.phase` only; logs are not rewritten; `plan.synthesis` keeps its name; generic two-slot tests port to `check.review`; sweep by token inside `src/`, `skills/`, `docs/`, `tests/` only.

## Findings

- Strict schemas reject unknown keys; `repoInventory` parses open and closed, an unreadable record blocks `ownerScope` completion, `flowReport` and `statusCommand` (C, map-C K1).
- Strip at read in `readState`/`readRepo`, permanent; types never hold the field; no cross-repo edits; open leaves self-clean on next `saveState` (D). `.optional()` ignored field matches `batchSchema` `owner` precedent and keeps the field in the documented contract; configs cleaned in a follow-up (C). Strict schemas plus coordinated migration of all 11 repos with rollback data (B). Tolerate, strip on main, then remove tolerance (A, withdrawn for D's).
- Rollback to the previous release cannot read records written without `debate`; B's migration also needs backfill to stay reversible (B, D).
- Retired-phase record: map on read to `plan.synthesis` with `done` cleared (D); no mapping, recheck zero at cutover, stray record fails as unreadable (B, C). B: clearing `done` leaves attempts and prompted seats stale. D: an unmapped record is loud but not actionable.
- Rebuttals: map-rebuttal-B.md, map-rebuttal-C.md, map-rebuttal-D.md.

## Taken
Operator 2026-10-25: `1a | 2a`

- Q1 1a: `readState` and `readRepo` drop the `debate` and `rebuttal` keys from the raw YAML before the strict parse, permanently; neither key exists in `stateSchema`, `repoSchema` or their types; no edits to other repos' records or configs; open leaves lose the key on their next save. Reason: least code, no cross-repo work, no behavior gained by rewriting records. Foreclosed: 1b optional ignored field (field stays in the type and contract, invites reuse, needs a config follow-up); 1c strict schemas with coordinated migration of 11 repos (11 record commits, cutover timing, undo data).
- Known limit, recorded in the leaf design: the previous release cannot read records written without `debate`.
- Q2 2a: no read-time mapping for records at `plan.positions`/`plan.rebuttal`; the door rechecks zero such records (open, parked, `failure.phase`) in all registered repos right before handoff; a stray record fails as unreadable and is fixed by hand. Foreclosed: 2b map to `plan.synthesis` (permanent code for a measured-zero case, stale per-phase bookkeeping).
