# Review A: pause-dispatch

- Base: `bab3a63e4c88d08a0fdd0acb66e5fe164215fae9`
- Reviewed head: `5b4c69ba9835cf1bac7418d1df148441dd37e9f1`
- Lane clean at review. No `AREA.md` in the diff. Peer review not read (blind).

## Verification evidence

- Reran on the reviewed head: `bun test tests/pause.test.ts tests/pause-next.test.ts tests/pause-status.test.ts tests/command-reference.test.ts` → 29 pass, 0 fail.
- Reran `bun test tests/batch-merge.test.ts tests/init.test.ts` (only suites referencing `learnings/` paths) → 47 pass, 0 fail. The lesson commit is docs-only and safe.
- Report's full suite (564 pass, 0 fail) ran on `83eb682`; the only later commit is the learnings change, covered by the rerun above.
- Read the full `bab3a63...HEAD` diff: `src/pause.ts`, `src/akrogon.ts`, `src/next.ts`, `src/status.ts`, tests, README, `.gitignore`, the four guide files, lesson files.
- Traced every automatic side-effect path (sweep, dispatch, dependents, merge turn/pass/wake, cleanup, tab-closed temp removal, hook-pane merged close) to a pause gate, and every manual path (target, path, `--all`, bare) to an ungated flag. Confirmed no nested `withLock` on the new merge-dispatch wrapper and that `commitMove`/`completeOwner` take no locks.
- `Test-Change` trailer present on the U1 commit for `tests/command-reference.test.ts`; no other old test file changed. `git check-ignore paused.yaml` matches.

## Findings

### Fix

**F1: AC4 manual merge pass and dependent cascade in a paused repo have no test.**
Missing test. The three manual tests in `tests/pause-next.test.ts` each dispatch one fresh leaf and assert a prompt plus retained pause. Nothing asserts the rest of the AC4 sentence: a manual pass in a paused repo that completes a leaf starts its dependents, or that the merge pass after a manual pass prompts a waiting holder. Flipping the manual `isAutomatic: false` flags on the dependent or touched-merge call sites stays green today.
Consequence today: an AC4 regression in manual merge or cascade gating ships undetected.
Criterion: AC4 (brief done-criterion 4), which names "including dependent starts and the merge pass" — cited directly as a criterion-named scenario.
Repair: add two CLI-boundary tests to `tests/pause-next.test.ts` reusing the existing fixture plus fake-herdr pattern: paused repo, manual `next <target>` completing a merged leaf starts its blocked dependent; manual `next <target>` prompts a waiting merge holder. No behavior change expected.

### Nits

**N1: merge-turn docs lack the pause exception.**
`docs/guide/merge.md:5` ("the next holder is prompted without a manual `akrogon next`") and `docs/guide/next.md:110` ("Every committed `phase` move and the end of each pass re-sweep `merge` leaves") read as unconditional, while paused repos skip the wake and pass. The pause section in `next.md` documents the exception, and both claims hold unpaused, so this is deferred as plan scope with no behavioral consequence.
Promote to Fix if an operator report shows confusion or a doc-coverage check requires the qualifier.

## Verdict

`fix` — one missing-test Fix (F1), one Nit (N1). All behavior reviewed matches the plan, brief and design; the diff is minimal and the layered gates are each reachable and correct.
