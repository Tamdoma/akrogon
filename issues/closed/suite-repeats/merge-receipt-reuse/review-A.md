# Review A: merge-receipt-reuse

Base `f7ddb693`, reviewed head `1608709` (tree identical to verified `9cffb8f`).

## Evidence

- `akrogon verify` green on `9cffb8f` — format/test/typecheck all 0; 1264 tests (`check-test-1793539396453-4022739.log`).
- Criterion tests green on `9cffb8f` (`check-criterion-final-1793539323102-4020470.log`): all 5 brief criteria proven.
- Affected files suite green on `d20820f` (`check-receipt-files2-…-3689971.log`): 68 pass.
- AREA path check: every path named in the changed `src/AREA.md` and `tests/AREA.md` lines exists from repo root.

## Findings

No Fixes.

Nits (informational, non-blocking):

- N1: `greenRun` uses `.find` (oldest eligible row) for the `reuse receipt` print while `redRun`/`reuseSource` use `newest`; the printed run id may name an older receipt than the newest. Cosmetic; fast path and gate agree on the predicate regardless of which row prints. Promotion: an operator-visible case where the printed id confuses log archaeology.
- N2: `implementation/report.md` lists head `9cffb8f`; a trailer-only commit `1608709` (same tree) landed after for the `tests/AREA.md` citation, and `akrogon verify` covers it because receipts match by tree — the leaf's own new rule. No consequence; record only.

## Verified against plan/criteria

- C1: merge verify exits 0 via `reuse receipt`, no row written, gate accepts — proven in `merge verification accepts same-tree receipts…`.
- C2: merge-only member runs, leaf `unit` reused cross-scope, gate refuses until the merge row exists — proven.
- C3: two split rows satisfy neither fast path nor gate; gate accepts only after a third whole-green row — proven.
- C4: leaf red head + linked merge-scope base satisfies gate; `--known-red` writes no new head row (`compares` on leaf run) — proven.
- C5: leaf-scope green on main resolves merge-scope red unit; recurrence re-notifies — proven.
- D4/D5 held: `state-and-phases.md` correctly left untouched (no scope rule stated); `commands.md`/`words.md`/`files.md` needed no edits.
- The blocked-member expectation correction is grounded in the locked design ("blocked entry never ran on the head"), not convenience: the member's `(fail) alpha` head `cheap` is covered by the base run.
- Scope retention confirmed live: member split (`member_count`), `slowChecked`/`slowEligible`, PassKey/`samePass`, `land.ts` redRun, `verifyRunSchema.scope` all still read scope; no receipt or notice lookup does.

Verdict: ready.
