# Slot A review: observe-paused

2026-11-25. Base `8ea0ff7320227e1e45785410787481e71989851e`, head
`b161af407a8612fe953a26d59f0f441465dd2461`. Verdict: **nits**. No blocking findings.

## Criteria

- **C1–C3:** `observe.ts` resolves the session, reads `isPaused(repoKey)` before stdout,
  and returns after the paused headers, before `repoInventory` or its downstream seat
  and transcript reads. The existing exception boundary reports the malformed file on
  stderr and exits 1. The row formatter is unchanged. The real-core tests compare paused
  discovery calls against an empty board, with a working seat and an unreadable entry
  present, and exercise unpause. Source ordering establishes the filesystem part the
  call log cannot show. An older skill can still read line 1 and the original row types.
- **C4–C5:** Start and accepted ticks enter Observe. The merged-leaf, command-error and
  Consult Resume re-reads all use its gate. Only exit 0 with exact line 2 `paused=false`
  authorizes acting on fresh rows. The command-error path still disallows later
  mutations. The stand-in hook checks exit and line 2 before a slug can trigger next.
  The timer tests separate tick config from observe, prove receipt order and cover
  empty → newly staged → paused → failed. Manual status and next are unchanged.
- **C6:** Read the retained Pi transcript, turn mapping, timer screen and call log in
  `implementation/e2e-pi-shell-resumed/`. The start and dues 1, 2, 4, 5 and 6 each made
  one observe call, with no status calls. Due 2's deliberate hold timed out and Pi
  reported no action. Due 4 saw no leaves. Due 5, watcher turn 4, saw the newly staged
  leaf and ran `next watch-staged-leaf`. The test verified a recorded seat, not that the
  started seat accepted its task. Due 6, turn 5, had a fresh unseated, unblocked leaf.
  Transcript lines 39–44 show receipt, successful observe with `paused=true` and a
  substantive report that the repo was paused and the watcher did not act. No next
  appears in that turn and the test verified the paused leaf stayed unchanged.
  The driver checks the transcript exists, not the model's wording. This proves the
  recorded Pi sequence, not other harnesses or every possible prompt.
- **C7:** The guide, image alt text, SVG and AREA line describe one observe read for
  pause and inventory. Listed `skills/AREA.md` paths from the repo root, resolving
  relative entries under their owning skills. All named repo paths exist. The skills
  reference and tests index do not prescribe the old status step.

## Verification

Read the kept logs via `akrogon log`. Current-head receipts under `implementation/`:
`check-hc-observe-1795644135455-1720755.log` (5 pass),
`check-watch-timer-1795644160599-1723293.log` (22 pass),
`check-watch-live-standin-shell-1795644250327-1741821.log` and
`check-watch-live-standin-root-1795644322844-1780929.log` (1 pass each),
`check-watch-live-pi-shell-1795645101286-2974222.log` (1 pass).
The planning receipts show the former output and deliberate breaks failing for the
paused short-circuit, partial stdout on invalid state, fresh due and paused/failed
dispatch gate. The frozen files are the planned test tree.

Configured verify `149ba4de-448e-4153-9d98-b22b6bda673c` is green on this head. The
old pin-death case saw the finished watcher before the missing pin process in
`check-test-1795644523592-1862899.log`. Its direct shell/timer setup does not call
observe or the changed stand-in hook. The same configured command passed
(1,544 tests and 135 repeats) in `check-test-1795644836278-2455918.log`. Inconsistent,
not an outstanding red. No rerun was needed in review.

Paid evidence accounts for one watcher per launch against the same throwaway session
and Pi/Devin identity under `grants[0]`. Each used the stated 2-session/10-minute
budget. The initial run and model-switch diagnostic failed before the first model
tool call and both logged empty absence results. The resumed run after operator
recovery used the default model, Pi session `654e89a0-fbd0-41d5-a20f-1cd3f4823481`,
with an empty absence result and no replacement. No paid operation or merge check
ran in this review.

## Nits

- **F1:** The docs test at `tests/watch-timer.test.ts:1405–1407` combines a literal
  obsolete-command guard with wording checks. For example, the SVG could accurately
  say “stop on a suspended repository” while keeping the observe step and still
  fail the pause-word regex. Deferred: the current docs and command contract are
  correct. A valid documentation change refused by that check would make the
  maintenance cost concrete.
- **F2:** The shell lane's new paused assertion in
  `tests/e2e/watch-live.e2e.ts:714–715,740–744` only matches a next call with a
  known turn. The prior shell test also rejected `t=?`. If the wrapper cannot
  obtain the turn and the next call does not change the staged leaf, the new
  mechanical checks could miss it. Deferred: the retained run has no unattributed
  calls and its transcript independently shows no next. A real ambiguous call or
  a passing paused proof with an observed next would make this blocking.
