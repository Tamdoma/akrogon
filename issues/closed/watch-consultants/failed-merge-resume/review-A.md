# Review A: failed-merge-resume

Base `1502fbdf362e2b6dc3c721722532d6fce8a9b622`, reviewed head `e9836c91790f9c1e70c915d99b0b1f1502878eae` (commits `f0cd0f50` test, `e9836c91` fix + doc clause).

## Diff judgment

- `src/phase.ts` `commitMove`: `resumedBatch` drops a `candidate === undefined` batch exactly on `leavingFailed` and keeps the candidate-holding record byte-identical (`{...batch, notified: undefined}`). Plan D1/D2 implemented as decided; placement reasoning verified — `reconcileBatch` would append a `red` ledger row naming the stale attempt, which criterion 1's "no prompt or attempt names the stale attempt or top" forbids under the strict reading.
- Reader sweep (each checked against a cleared batch): `mergeTurn`/`mergeQueue` treat the leaf as an ordinary merge leaf and rebuild on `localBase` after fetch; `reconcileBatch` early-returns on `batch === undefined`; `batchPush`/`restack`/`finishPush`/`batchCheck`/`landClaim`/`landGates`/`recordTested` all read `state.batch` under the global lock and are unreachable or refuse cleanly once the record is gone (`merged` refuses "holds no batch record"); `run-check` attempt stamp, `verify --attempt` resolution, `status` land display, `stop` slice keep and `reconcile` worktree keep all degrade to the no-batch path; the worktree itself stays kept by `state.worktree`.
- Race check: every `batch` writer (`mergeTurn`, `reconcileBatch`, `batchPush`, `restack`, `finishPush`, `handOff`, `recordTested`) runs under the same `globalHome()/.lock` as `commitMove` and re-checks `batch.attempt` before writing, so a dropped record cannot be resurrected. A `finishPush` crossing the failure writes `candidate` under its lock first or throws "Batch record changed while verifying the push"; a written candidate means the record is kept, not dropped — the two paths partition at `candidate`.
- `notified: 'pending'` cannot occur on a candidate-less batch (it is set only by `mergeNotice` inside `reconcileBatch`'s landed-candidate `failed` branch), so the clear never orphans a pending notice file. The `stale` notice sweep still reads `recorded.batch` before the drop. `failed -> merged` is not in `routing`, so the cleared `after.batch` never reaches `refuseEnclosingCompletion`.
- An abandoned `owner: 'command'` batch (land run mid-flight when the leaf failed) is dropped on resume; the old `akrogon-land-<old-attempt>` unit's next `landClaim` under lock throws `StaleLandError` (`attempt` mismatch) and exits without touching the fresh attempt. Acceptable.
- `docs/reference/state-and-phases.md`: the added clause matches observed behavior (criterion test asserts the rebuild). `leftovers.ts`'s comment remains accurate (it describes the kept state while in `failed`). `src/AREA.md` names no batch-lifecycle claim needing an update; `docs/use/merge-and-announce.md` and `docs/reference/commands.md` make no failed-resume batch claim — no stale doc left.

## Criteria and tests

- Criterion 1: new test `a failed holder with no candidate is rebuilt on the new base, never dispatched on its stale attempt` (tests/batch-dispatch.test.ts). Red-first evidence: `check plan-test-c1-red: 1` (`Expected: not "560cbb7e-…"` on `state.batch.attempt`); green on the head: `check impl-c1: 0` and the whole-suite green verify `check-test-1795286777608-2631781.log`. The test observes the criterion's real boundary (prompt log, `state.yaml`, `git merge-base --is-ancestor`, `issues/merge-attempts.jsonl`) across both `akrogon phase` and `akrogon next`, ending with a dispatched fresh-attempt prompt — no condition of the criterion is left unasserted.
- Criterion 2: existing landed-candidate test unchanged and green in both runs.
- `Test-Change:` trailer on `f0cd0f50` names the file, the criterion source and "no existing expectation changed" — correct per the trailer rule.

## Red-check disposition

- `check impl-batch-files: 1` (one selfUpdateCli flake) retried to `check impl-batch-files-retry: 0` — recorded `inconsistent` in `implementation/report.md`.
- `akrogon verify` on `e9836c91`: two red runs with disjoint flake sets (5×15 s timeouts; 1 selfUpdateCli; 2 transcript/tab flakes — none repeating, none reachable from a two-line `commitMove` change), `verify --known-red` ran the base green (verdict `fail`, no cover), third verify `verify leaf e9836c91…: green` (all checks 0; receipt written for the `merge` gate). The leaf's own criterion proofs never relied on a covered result.

## Findings

None. No Fixes, no Nits.

## Verdict

`ready` — request `merge`.
