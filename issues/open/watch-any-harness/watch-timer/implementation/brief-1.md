# Worker brief 1 — watch-timer scripts (plan U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/watch-timer-u1 (created at commit 83961ae8).
Skill folder: `skills/watch-issues/` in that worktree. Bun is the runtime; scripts run as `bun <abs path> <args>`.

## 1. Goal

Build the harness-neutral watch: new scripts `timer.ts`, `start.ts`, `stop.ts`, `tick.ts` plus shared helpers `hc.ts`, `repo.ts`, `proc.ts` under `skills/watch-issues/scripts/`; `observe.ts` refactored to import `resolveRepoKey`/`run` from `repo.ts` with unchanged behavior. Plan decisions D1-D10, D17, D18; done-criteria 1-9 mechanically proven by `tests/watch-timer.test.ts` (already committed red — your code makes it green; do not edit tests).

## 2. Acceptance criteria

1. `start.ts` prints exactly one outcome line (stdout) and the stated exit code: `refused <reason>` (exit 1) when `HC_TERMINAL_ID` is unset/empty, when `hc get $HC_TERMINAL_ID` fails in the repo's resolved session, or when the watcher terminal's `foreground.pid` is not an ancestor of the start process (`/proc` ppid walk); `conflict <details>` (exit 2) on >1 live terminal labelled `akrogon.watch-timer=<repo>`, on a live `<prefix>-watch`-named terminal that is unlabelled or fails verification, or on `name_taken` where the holder fails verification; `running <address>` (exit 0) on one verified timer or `name_taken` with a verified holder; `started <address>` (exit 0) after `hc run` succeeds.
2. Verification of a labelled terminal: `name === "<prefix>-watch"` AND `hc get --json` top-level argv joined contains `skills/watch-issues/scripts/timer.ts`.
3. The timer (`timer.ts`) counts dues numbered 1,2,… every `WATCH_TICK_SECONDS` (default 1200 s); polls at most every min(1 s, interval/8); with pending dues and watcher `status.state` ∈ {idle,done} it sends exactly `watch-issues tick timer=<own HC_TERMINAL_ID> pid=<pin-pid> due=<oldest n> <root>` via `src/hc.ts` `send` (untagged), then waits for watcher `turn` to advance and idle/done within one interval; delivery = own label `akrogon.watch-due` reads `n`; otherwise resend once at next readiness, then drop. Dues accrue while the watcher works; none merge.
4. The timer exits with no send (pending dues discarded) on any poll when: `/proc/<pin-pid>` gone or its stat field-22 start ≠ `--pin-start`; `hc get` on watcher gives `not_found` or `state: finished`; watcher `foreground.pid` is neither `pin-pid` nor its `/proc` descendant; `transcriptFor({session,watcher})` returns a non-null path different from the effective one (null resolution never exits; while pinned is null the first non-null resolved path latches as effective).
5. `stop.ts <root>` resolves the repo's session itself (works from any terminal): 0 labelled → prints `stopped` (already stopped); >1 → `conflict`; 1 → verify then `hc kill` + `hc rm` and `stopped <address>`; unverified single → `conflict`; name squatter → `conflict`. Nothing touched on conflict.
6. `tick.ts` takes argv after `tick` (`timer=<a> pid=<p> due=<n> <root…>`; root = everything after `due=<n>`, spaces preserved): missing/unparseable fields, dead/unverified timer, or `parent !== HC_TERMINAL_ID` → `no-watch` exit 1; foreground-pid of own terminal ≠ `pid=` → `hc kill`+`rm` the timer, `stopped` exit 0; `due` ≤ the timer's `akrogon.watch-due` label (absent=0) → `no-watch` exit 1; else `hc label <timer> akrogon.watch-due=<n>` FIRST, then `accept` exit 0.
7. `hc` calls `run`/`get`/`ls`/`kill`/`rm`/`label`/`send` go through `scripts/hc.ts` (spawn `hc` with env preserving `HC_TERMINAL_ID`/`HC_TERMINAL_SOCKET`, pinning `HC_SESSION=<session>` per call). Exceptions: tick `send` to the watcher and the terminal.list label-counting reuse `src/hc.ts` `send`/`terminals` (its env strips terminal vars → untagged send). `hc run` MUST preserve `HC_TERMINAL_ID` (default parent = caller terminal).
8. Repo/session resolution: `scripts/repo.ts` holds `run` + `resolveRepoKey` factored out of `observe.ts` (`WATCH_AKROGON ?? 'akrogon'` binary, `akrogon config` at `<root>` → `repo` name AND `prefixes[repo]` for the prefix — `akrogon config` prints both), then `readRepo` + `repoSpace` from `src/` for the session. `observe.ts` imports from `repo.ts`, behavior unchanged (`bun test scripts` + `tsc -p tsconfig` stay green).
9. `timer.ts` uses `transcriptFor`/`send`/`label`/`terminal` from `src/`, and `proc.ts` for proc-start/ancestor/descendant reads (same field-22 parse as `src/transcript.ts` `procStart`; descendants = ppid closure over `/proc/*/stat`).

## 3. Read-first list

`plan.md` (leaf folder, D1-D10, criterion map), `skills/watch-issues/scripts/observe.ts`, `src/hc.ts` (hc/send/terminals/terminal/label/repoSpace/HcError), `src/transcript.ts` (transcriptFor, procStart), `src/config.ts` (readRepo/Repo), `tests/watch-timer.test.ts` + `tests/fixtures/watch-agent.sh` + `watch-hook.sh` (the contract you must satisfy), this skill folder's `ponytail.md` (at `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`).

## 4. Change list / interfaces

Owns: everything under `skills/watch-issues/scripts/` except `log-tail.ts`, `log-tail.test.ts`, `fixtures/`. New files: `timer.ts`, `start.ts`, `stop.ts`, `tick.ts`, `hc.ts`, `repo.ts`, `proc.ts`. Edit: `observe.ts` (import from `./repo.ts` only). Interfaces as in §2; `hc get --json` returns flat JSON with `argv`, `foreground.pid`, `parent`, `labels`, `name`, `state`, `status.state`, `turn` (see `tests/watch-timer.test.ts` `termSchema`); `hc run` errors come as `{"error":{"kind":"name_taken"}}` on stderr.

## 5. Do-not

- No edits to `src/`, `tests/`, docs, or SKILL.md (U2 owns those); no edits to `log-tail.*`.
- No new dependencies; zod is already there; keep one-purpose-per-script.
- A planned test that is red or wrong once your code is correct is a mismatch return to A, never a test edit.
- Never `git stash`; set work aside as a WIP commit, and before returning `git reset --soft <creation commit>` + one final commit so the cherry-pick carries everything.
- No process kill by pattern; `akrogon stop-run <id>` only.
- Restated: same-scope edits and interface changes return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. `proc.ts` (procStart via field 22, `isAncestor(pid, self)` ppid walk, `isDescendant(pid, root)` closure), `hc.ts` (spawn wrapper), `repo.ts` (factor resolveRepoKey+run; `observe.ts` import swap).
2. `start.ts` → `stop.ts` → `tick.ts` (verification shared via a small local export, e.g. in `hc.ts` or `repo.ts`-adjacent helper — keep it inside your owned files).
3. `timer.ts` (poll loop, dues, receipt wait, exit predicates).
4. `bun test scripts` + `bun run typecheck` in `skills/watch-issues`; then `bun test --timeout=30000 tests/watch-timer.test.ts` from the worktree root — iterate until green (serial, ~2-3 min).
5. Commit the unit as one commit.

Advisory size: ~8 files, under 60 turns.

## 7. Commands

- `cd skills/watch-issues && bun test scripts && bun run typecheck`
- `bun test --timeout=30000 tests/watch-timer.test.ts` (from worktree root; needs `hc` on PATH — it is)
Keep output via `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line.

## 8. Done-when / report

All §2 outcomes hold, the free suite is green, one commit on the detached HEAD. Report the four fill-ins:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
