# Implementation report: pause-dispatch

## Execution mode

Config says `implement: subagents`, but both wave-1 worker spawns returned without acting: zero tool calls, claiming no checkout access. Transcripts:

- `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-pause-dispatch-u1--/2026-10-08T21-20-25-715Z_01a11d63-8c73-7489-a42b-40b2ec4ace2d.jsonl`
- `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-pause-dispatch-u1--/2026-10-08T21-22-37-518Z_01a11d65-8f4e-7489-a42b-40b4edc0559a.jsonl`

The delegation harness is broken for this session, so A implemented inline in plan wave order (U1, U2, U3, U4). Sub-briefs remain at `implementation/brief-1.md` through `brief-4.md` as the unit record. The worker worktree was removed.

## Base and head

- Starting base: `3e034dee43f0853446c2ba8f97bb72668ab213dc`.
- The full suite at that base failed 3 `harness-template` tests identically with and without this diff (committed `config.yaml` carried a literal `claude-sonnet-5-5` where the test expects the `{model}` placeholder). Main already fixed this in `4534a56`, so the lane was rebased onto main `bab3a63` with zero conflicts. `akrogon config` now reports `AKROGON_BASE: bab3a63e4c88d08a0fdd0acb66e5fe164215fae9` (dynamic merge-base, self-consistent).
- Committed head: `5b4c69ba9835cf1bac7418d1df148441dd37e9f1` (5 commits, lane clean).

## Changed files and reasons

- `src/pause.ts` (new, U1): pause file helpers per D1. Top-level zod record, missing file as empty set, invalid file as `PauseStateError` naming the path, `writeYaml` under the global lock.
- `src/akrogon.ts` (U1+U2): `pause` and `unpause` cases with no positionals, usage string, plus the U2 `unpause` extension that clears, prints, then runs `unpausePass` for the resolved repo.
- `.gitignore` (U1): `paused.yaml` entry.
- `README.md` (U1): `pause` and `unpause` command rows.
- `tests/command-reference.test.ts` (U1): matching empty-arg contracts. Commit carries `Test-Change: tests/command-reference.test.ts added pause and unpause contracts, no existing expectation changed`.
- `tests/pause.test.ts` (new, U1): AC1 plus pause/unpause half of AC8.
- `src/next.ts` (U2): `isAutomatic` threading through sweep, dispatch, dependents, merge and cleanup; per-repo `--resume` filter; event-branch gates; `mergeWake` entry gate; re-checks inside every merge `withLock`; `dispatchMergeLeaf` wrapper lock for merge-path dispatches outside the main lock; `unpausePass` export; `readPaused()` validation at `nextCommand` entry.
- `tests/pause-next.test.ts` (new, U2): AC2, AC3, AC4, AC5, AC6 plus automatic-`next` half of AC8.
- `src/status.ts` (U3): pause read once per run, `(paused)` repo-heading marker, `paused: <repo>` targeted line.
- `tests/pause-status.test.ts` (new, U3): AC7 plus status half of AC8.
- `docs/guide/next.md`, `cheat.md`, `state.md`, `problems.md` (U4): AC9 docs.
- `learnings/LESSONS.md`, `learnings/history/2026-10-08-pause-dispatch.md`: prettier-drift lesson (own commit).

## Refinements

- No `classifyNext` function was added. Automaticity is fully static per branch (`--resume` and event branches true, selection and `--all` false), and the existing `rawEvent` guard plus selection shape already encode D3. A classifier would be dead code.
- The phaseColor prettier rewrap in `src/status.ts` is pre-existing drift; it was reverted three times and never committed.

## Commands and results

All run in `/home/ivan/Work/infra/akrogon/issues/worktrees/pause-dispatch`. All sizes seconds; no minutes/hours/unknown commands, so no wall-time table and no restart boundaries. Not a slow-run leaf.

- `bun test --timeout=30000` (full suite, rebased lane): 564 pass, 0 fail, 5987 expects, 29 files, 39.7s wall.
- `bun run typecheck`: clean.
- `bun run format`: clean run; unrelated `src/status.ts` drift reverted after.
- `bun test --changed=bab3a63 --timeout=30000`: 29 pass, 0 fail, 4 files.
- `bun test tests/pause.test.ts`: 4 pass (AC1, AC8 part).
- `bun test tests/pause-next.test.ts -t "automatic"`: 6 pass (AC2); `-t "phase move"`: 1 pass (AC3); `-t "manual"`: 4 pass (AC4); `-t "race"`: 2 pass (AC5); `-t "unpause"`: 5 pass (AC6); `-t "invalid"`: 1 pass (AC8 part).
- `bun test tests/pause-status.test.ts`: 5 pass (AC7, AC8 part).
- `bun test tests/docs-links.test.ts`: 3 pass, plus `grep "akrogon pause"` hits in `next.md` and `cheat.md` (AC9).
- Base comparison for the stale-base red (before rebase): leaf `bun test` 561 pass 3 fail; base `3e034de` worktree `bun test` 536 pass 3 fail; same 3 `harness-template` names both runs. Base worktree removed after. Fixed upstream by `4534a56`; rebase resolved it.

## Deliberate-break red proofs

- U1: `readPaused` swallowing invalid YAML as empty made the invalid-file test fail; restored green.
- U2 sensor: `isPaused` forced false made the event and race-A tests fail; restored green.
- U2 wake path: all five wake gates removed made the phase test fail; restored green. Single-gate removals stay green by design (layered gates).
- U2 manual: selection-single flag flipped to automatic made the manual-target test fail; restored green.
- U2 unpause: resume filter removed (select all) made the cascade test fail; restored green.
- U3: heading marker forced off made the board-marker test fail; restored green.

## Done-criteria to evidence

- AC1: `tests/pause.test.ts` root/subfolder/worktree/idempotent/outside tests.
- AC2: `tests/pause-next.test.ts` four event tests plus mixed `--resume` test, each with an unpaused control run proving the setup would dispatch.
- AC3: `phase move` test, paused and unpaused fixtures.
- AC4: three manual tests (target, `--all`, bare with pane ID), each asserting dispatch plus retained pause.
- AC5: race A (git-fetch barrier, pause wins, no launch) and race B (prompt barrier holding the lock, pause waits, later work suppressed).
- AC6: four unpause tests (relaunch with fresh model, merged cleanup, cascade-only, failure leaves cleared with non-zero exit).
- AC7: `tests/pause-status.test.ts` board/empty/charts/targeted/unpaused tests.
- AC8: invalid-file tests in all three pause test files; missing file covered by fixture default plus explicit unpause-first case.
- AC9: `tests/docs-links.test.ts` plus grep hits; prose in the four owned guide files.

## Known limitations

- Pause does not stop an already-working agent; the next automatic pass is gated (plan open limitation, preserved).
- Pause keys are registered repo names; renaming a key while paused orphans the entry until cleared (plan open limitation, preserved).
- `classifyNext` was folded into branch structure (see Refinements).

## Unverified criteria

None. Every done-criterion has passing proof above on head `5b4c69b`.
