# Brief 6 (repair): clear the batch record and close member tabs when the holder finishes

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u6

## 1. Goal

`reconcileBatch` in `src/next.ts` never clears `batch` on a holder that left `merge` via the normal push path (`phase === 'merged'`): the member-move loop only commits members still `in merge`, the `merged`-holder case falls through, and the record persists forever. Two consequences violate the leaf design (brief §10, done-criteria 8): carried members' tabs stay open permanently (the `batchMemberSlugs` skip keeps firing) and every `mergePass`/`next` re-runs `git fetch` for that historical record forever. Fix the landed-reconcile path so the record clears once every member finished and member tabs close when the holder finishes.

## 2. Acceptance criteria

1. After a normal green batch (`phase <holder> merged --attempt` pushes, `commitMove` moves members then holder), the next `mergePass` (run inside the same `akrogon phase` call's `mergeWake`) sees the landed candidate and: leaves already-moved members alone, clears `batch` on the merged holder, and closes every carried member's tab (`herdr tab close`) — members moved by the phase call are not in the `moved` list, so tab closing must cover all record members in `merged` phase, not only `moved`.
2. A holder `merged` with members still in `merge` (interrupted moves — simulate by writing a member leaf back to `merge` or pre-seeding the record on a holder you move yourself) keeps `batch`, and a following pass finishes the member moves by ancestry, then clears and closes.
3. A holder `failed` post-push keeps its record (with only the still-in-merge members), gets the `mergeNotice`, and `akrogon phase <holder> merge` followed by the ancestry finish ends `merged` with no check run — after which the record clears and member tabs close.
4. Once `batch` clears, `mergePass` no longer calls `git fetch` for that leaf (assert no fetch by removing/renaming the remote afterward and seeing a clean pass, or counting calls through a git wrapper on PATH — pick the simpler).
5. The earlier reconcile behaviors stay: `candidate` not ancestor → restore + clear + no solo marks; failed fetch → restore nothing, keep record, report error.
6. `tests/batch-dispatch.test.ts` 'a landed batch moves member and holder once, keeps tabs while the record lives, and wakes dependents' — the "keeps tabs while the record lives" clause was written against the broken behavior. Update it: tabs (holder's own excluded — the merge seat's tab close is the existing pane-idle path, unchanged) — carried member tabs must be CLOSED after the holder's `merged` move + reconcile, before any later pass. If the test's structure makes the mid-state observable, keep the assertion that a member tab is not closed while the record is still in-flight (criterion 8's "no member's tab or worktree is removed before the holder finishes").
7. `docs/guide/merge.md` member-tab wording (written against the broken behavior) matches the fixed behavior; `skills/merge-issue/SKILL.md` footer text about tab closing stays accurate.

## 3. Read-first list

- `src/next.ts` `reconcileBatch` (~lines 791-870), `mergePass`, `closeMergedTab`, `dispatchDependents`, `batchMemberSlugs` (in `src/batch.ts`), `commitMove` (in `src/phase.ts`).
- `tests/batch-dispatch.test.ts` landed-batch test and its helpers (`mergeText`, `idleAll`, `head`, `database`, `calls`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned: `src/next.ts`, `tests/batch-dispatch.test.ts`, `docs/guide/merge.md` (only the member-tab clause). Not owned: everything else — mismatch if needed.

Inside `reconcileBatch`'s `landed` branch, after the member-move loop, where the code currently handles only `holderNow.phase === 'merge'` vs `'failed'`:

- `holderNow.state.phase === 'merge'`: existing member loop + `commitMove` holder stays; then re-check remaining members still in `merge`; if none → close member tabs (collect the record's member leaves now in `merged` with `state.tab` set), `saveState(..., batch: undefined)`.
- `holderNow.state.phase === 'merged'` (or any non-merge, non-failed terminal): if no record member remains in `merge` → close member tabs (same rule), `saveState(..., batch: undefined)`; else keep the record (moves resume next pass).
- `holderNow.state.phase === 'failed'`: keep existing notice + survivor filtering; when zero members remain in `merge` still keep the record (the operator's `phase <slug> merge` move-back reconciles the holder by ancestry — criterion 14 needs the record).
- Tab closing happens OUTSIDE the lock: collect the leaf list under the lock into `moved`-adjacent state, run `closeMergedTab(repo, leaf)` in the same post-lock loop that already handles `moved` (or a second loop) — `closeMergedTab` already guards batch members by `batchMemberSlugs`; once `batch` is cleared the members are no longer skipped. Verify ordering: save the cleared record first, then close tabs.
- `dispatchDependents` for members moved by the phase call is already covered by sweep 'completed' outcomes; do not add extra calls beyond what the current `moved` loop does.

## 5. Do-not

- No new schema fields, no signature changes, no `phase.ts` edits, no changes to `dispatchSlot`, `mergeNotice`, `buildStack`/`applyStack`.
- Do not close the holder's own tab here — existing pane-idle/sweep path owns that.
- Do not run `git fetch` when `record === undefined` (that's the point of this fix; keep the early `record === undefined` return).
- `Test-Change: tests/batch-dispatch.test.ts <source and reason>` trailer on the test commit, citing done-criterion 8.
- Return a mismatch with evidence instead of weakening criteria or changing the record-clearing rule.

## 6. Ordered steps

Advisory: 3 files, under 25 turns.

1. Write a failing test reproducing criterion 1 (green batch via the existing helpers → after `merged` + `mergeWake`, assert `herdr tab close` calls for member tabs and `state.batch` absent; assert fetch not repeated on a subsequent pass).
2. Fix `reconcileBatch` per section 4; run `tests/batch-dispatch.test.ts` — update the one stale clause per criterion 6.
3. `bun test tests/batch-dispatch.test.ts tests/next.test.ts --timeout=30000`, then the changed-tests command; `bun x tsc --noEmit`.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Criteria 1-7 green; pasted outputs. Commit(s) on worker HEAD, return commit id(s).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
