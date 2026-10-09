# Brief-2: dispatch gate, merge wake, unpause pass, races (U2, wave 2)

## 1. Goal

Gate automatic dispatch on pause, keep manual dispatch full, add the unpause resume pass, and prove the lock races. Plan D3, D4, D5, D6, D7, D9 for `next` and wake, D11.

## 2. Numbered acceptance criteria

1. With repo X paused, each of the four plugin events for an X leaf plus `next --resume` make zero herdr calls that create, start, prompt, close or remove, complete no owner, and exit 0. The same `--resume` run still dispatches unpaused repo Y.
2. A phase move in a paused repo commits, and its merge wake prompts no seat.
3. In a paused repo, `next <target>`, `next --all` even with inherited `HERDR_PLUGIN_EVENT_JSON`, and bare `next` with no event even with `HERDR_PANE_ID` dispatch fully including dependents and merge, and the repo stays paused.
4. Race A: hold an automatic pass at a barrier before its final locked launch section, let real `akrogon pause` finish, release the pass, show no allocation, agent start or prompt follows.
5. Race B: hold an automatic launch while it owns the lock, start real `akrogon pause` concurrently, show pause waits for the lock, then later automatic work is suppressed.
6. `unpause` clears, prints, then runs one repo-scoped resume pass: closed seats relaunch with current seat config, deferred merged cleanup runs, tab-less leaves start only via cascade. A pass failure exits non-zero with pause still cleared.
7. An invalid `paused.yaml` makes automatic `next` fail naming the file, never treated as unpaused. Missing file means none paused.
8. One deliberate break per behavior turns its test red, for example removing one gate check.

Smallest CLI-boundary set proving 1-8. Use isolated repos plus fake herdr, assert herdr calls or absence, state files and exit codes, never prose wording. The fake may provide barriers but never writes pause state. New tests need no cited source.

## 3. Read-first list

- `src/next.ts` for `nextCommand`, `sweep`, `dispatchLeaf`, `dispatchDependents`, `mergePass`, `mergeTurn`, `reconcileBatch`, `mergeWake` and the existing `rawEvent` guard to copy.
- `src/pause.ts` from U1 for `readPaused`, `isPaused` and `setPaused`, `src/akrogon.ts` unpause case from U1 to extend, `src/state.ts` for `withLock`.
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts` for event plus resume plus merge patterns.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Wave 2, must land first: U1. Paths owned: `src/next.ts`, `tests/pause-next.test.ts`, plus the `unpause` case extension in `src/akrogon.ts` to call the new pass. Shared test resource: none, isolated fixtures plus per-test barrier wrapper around fake `herdr`. Consumed output: U1 `src/pause.ts` helpers and the U1 `unpause` clear wiring.

Changes:

- Add `classifyNext(input, event)` returning true only for `--resume` or undefined input with an event. Never use `HERDR_PANE_ID` or leaf count.
- Thread `isAutomatic` through `sweep`, `dispatchLeaf`, `dispatchDependents`, `mergePass`, `mergeTurn` and cleanup call sites. Manual passes bypass pause fully. Automatic passes call `isPaused` inside the held lock before any side effect and skip sweep, cleanup and merge for paused repos with exit 0.
- Gate `mergeWake` at entry under the lock per D5. Re-check inside inner merge locks per D6. No nested `withLock`: main sweep checks once inside the outer lock, merge-path dispatches outside it get their own `withLock` plus check.
- Export `unpausePass(repo)` from `src/next.ts`: sweep leaves where phase is `merged` or `tab` or `worktree` is set, then `cleanupRepos([repo])`, then manual merge pass, with existing cascades. Extend the U1 `unpause` case to clear under the lock, print, then call it with `isAutomatic=false` and separate error reporting.
- Add `tests/pause-next.test.ts` for criteria 1-8, including two-process race tests with a wrapper script that waits on barrier files before delegating to the fake `herdr`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/status.ts`, guide docs or `README.md`. Other units own them.
- Do not change `park`, dependency eligibility, merge-queue order or capacity. The design excludes them.
- Do not widen the `unpause` case beyond clear, print and the one pass call.
- Do not write pause state from tests or the fake. Only the real command writes it.
- Do not add nested `withLock`. It deadlocks.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons stay attached: wave safety, locked exclusions, lock safety and proof validity. The only exception is a revised brief from A.

## 6. Ordered steps

1. Write `tests/pause-next.test.ts` for criteria 1-3, 6 and 7 first. Cover four events, mixed `--resume`, phase wake, three manual forms, unpause relaunch plus cleanup plus cascade-only plus failure, invalid file. Run red.
2. Add `classifyNext` plus `isAutomatic` threading in `src/next.ts` for criteria 1 and 3. Run those tests green.
3. Gate `mergeWake` plus inner merge locks in `src/next.ts` for criterion 2. Run that test green.
4. Add `unpausePass` in `src/next.ts` plus the `src/akrogon.ts` unpause extension for criterion 6. Run that test green.
5. Add race A and B tests plus barrier wrapper for criteria 4 and 5. Run green.
6. Show criterion 8 breaks, one per behavior, then restore green.
7. Run the brief changed-test command. Commit only owned paths.

Advisory size: about 3 files and under 24 turns.

## 7. Commands

Run only this changed-test command, with the supplied base:

`AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed=3e034dee43f0853446c2ba8f97bb72668ab213dc --timeout=30000`

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-8 pass with pasted results, and the commit contains only owned paths. Link each criterion to its test. Name limits and unverified criteria or say none.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file. A commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source. This unit adds only a new test file, so no trailer is expected unless it touches an old test file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
