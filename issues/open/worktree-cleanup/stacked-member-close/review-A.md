# Review A: stacked-member-close

Base `f3557d8`, reviewed head `24dd2b5`. Diff: `src/next.ts` (+11/-2), `src/phase.ts` (+2/-2), `docs/guide/merge.md` (+1/-1), `tests/batch-dispatch.test.ts` (+118).

## Verification evidence

- `akrogon run-check --name 'review batch-dispatch' -- bun test tests/batch-dispatch.test.ts` on head `24dd2b5`: 30 pass, 0 fail, 344 expects (~8s).
- `akrogon verify` receipt exists for `24dd2b5`: green per report.md (`verify leaf 24dd2b5: green`), matching the move gate.
- AREA.md path check: all named repo paths exist; the listed absences are command lines (`bun test …`) and runtime artifacts (`issues/*.jsonl`, `stopped.yaml`), and neither AREA.md is touched by the diff. Not findings.
- `Test-Change` trailers on `c414386` (new cases, no source required) and `24dd2b5` (cites real output `w1:t14`/`w1:t18` dependent tabs) — both valid against the cited sources.

## Findings

No Fixes. Walked the diff against the four done-criteria and the old `6640ab5~1` implementation:

- `reconcileBatch` collects `batch.members` at `merged` not in `moved` inside the lock, after every landed branch (`merge`, `failed`, already-`merged`). `allLeaves` covers `issues/closed`, so members whose issue folder already moved are still collected. Close + `dispatchDependents` then run for `moved` + `closable` after the lock — the old code closed only `moved` members' tabs via the identical post-lock path and dispatched `moved` dependents; the brief explicitly adds dependent dispatch for already-merged members. `dispatchSlot`/`done`/busy guards make the extra dispatch a no-op when the dependent already started (criterion 4 test asserts the prompt count stays 2 after a second pass).
- The holder is never collected: `closable` reads `batch.members` only. Holder tab assertion `toContain(aaTab)` in both tests proves criterion 3.
- `finishPush` `candidate` record (a4662f2): traced the recovery route end to end — `batchPush` clears `candidate` on a failed push, `finishPush` proves landing by ancestry but saved only `top`, so `reconcileBatch`'s `landed` check (`batch.candidate !== undefined && isAncestor`) read a landed stack as red and cleared the record without ever reaching the member-move/close path. Recording `candidate` is the minimal root-cause fix; `top: pending.candidate` is preserved because `mergeContext`/prompt paths read `top`.
- Drifted members still in `merge` are correctly excluded from `closable`; a `commitMove` throw aborts the pass with the record preserved for the next one — identical semantics to `6640ab5~1`.
- Failed-holder branch: closable collection now also runs there, closing moved members earlier than the old deferred behavior. This only closes tabs sooner for members already merged; no criterion or invariant depends on the deferral. Not a defect.
- `docs/guide/merge.md` clause matches the implemented behavior (reconcile closes merged member tabs and dispatches dependents); limits.md/problems.md hook-close statements remain true.
- Tests are real-boundary: `cli phase … merged` (which runs `mergeWake`, per design note D), fake-herdr `tab close`/`pane list`, and a `git` shim that makes `push` exit 1 after the real push landed — exactly criterion 2's "reported failed, later fetch confirms". No mocked unit under test.

## Verdict

`ready`
