# Plan: leaf-stop

Debate: no. Synthesized directly from brief.md and design.md by slot A on 2026-10-13. AKROGON_BASE e5776ade920e619e923a7825140f823c2e89123e.

## Read first
- `src/pause.ts` (whole file): the record, schema, error and lock pattern stop.ts copies.
- `src/scope.ts:13-15` `leafSlice(repo, slug)`, the slice name from seat-containment.
- `src/next.ts:733-760` `dispatchLeaf` and its paused gate (:754); `src/next.ts:128-135` `report`; `src/next.ts:844-880` `sweepAll`/`sweep` (`picked` is true for `--resume` too, so the gate keys on `picked && !isAutomatic`); `src/next.ts:1527-1580` `nextCommand`; `src/next.ts:1330-1347` `dispatchMergeLeaf`.
- `src/turn.ts:81-104` `mergeQueue`, used by next.ts (:821, :1097, :1140, :1144, :1358), phase.ts:1075 and status.ts:86.
- `src/status.ts:146-189` `cells`/`rows`, `src/status.ts:349-412` `statusCommand` with the paused marks.
- `src/akrogon.ts:14-45` per-verb options, `:53-188` the verb switch and usage string.
- `src/state.ts:155` `allLeaves`, `:199` `findLeaf`, `:205-226` `withLock`; `src/shell.ts:8-16,108-112` `CommandError`, `command`.
- README.md:129-149 verb table; docs/guide/next.md:104-117 pause section; src/AREA.md:19; tests/AREA.md.
- tests/leaf-stop.test.ts (new, planned reds), tests/command-reference.test.ts (contracts and guide case).
- Gaps: none. LESSONS.md line 21 (prose assertions couple tests to wording) shaped the tests: they assert exit codes, records, systemctl argv, prompts and batch records, plus only the command names `akrogon start <slug>` and the mark word `stopped`.

## Decisions
- D1 Record. New `src/stop.ts` copies pause.ts: `stopFile()` = `resolve(globalHome(), 'stopped.yaml')`, schema `z.record(z.string().min(1), z.literal(true))` keyed `<repo>/<slug>`, `StopStateError` for an unreadable or invalid file, `readStopped(): Set<string>`, `isStopped(repoName, slug): boolean`. Writes run under `withLock(resolve(globalHome(), '.lock'))`. `.gitignore` gains `stopped.yaml` beside `paused.yaml`.
- D2 Stop one. `stop <slug>`: `requireRepo(readGlobal(), cwd)`, `findLeaf(repo, slug)` (an unknown slug errors), add the key under the lock, release the lock, then `command(['systemctl', '--user', 'stop', leafSlice(repo, slug)])`. A non-zero exit throws `CommandError` (argv with the slice name, code, stderr), the entry stays, and the process exits non-zero. A rerun re-adds the same key (idempotent) and stops again. Exit 0 on systemd's unloaded-slice rc=0 needs no special case. Prints `stopped: <repo>/<slug>` on success.
- D3 Stop all. `stop --all`: allocated leaves of the current repo, meaning leaves under `issues/open` (`leavesUnder`) with `state.tab !== undefined` and `phase !== 'merged'`. Closed and merged leaves keep `tab:` after merge and are not allocated (corrected 2026-10-13, check.fix C2). All keys are written in one lock before any systemctl call. Then each slice is stopped in turn, each failure caught as `CommandError` only, and one line per leaf printed: `stopped: <repo>/<slug>` on stdout or `failed: <repo>/<slug> <error message>` on stderr. `process.exitCode = 1` when any failed. A positional plus `--all`, or neither, is a usage error. No leaf allocated prints nothing and exits 0.
- D4 Start. `start <slug>`: under the lock, refuse with `Leaf is not stopped: <repo>/<slug>` when the key is absent, else delete it. After the lock is released, call `nextCommand(slug)` from next.ts (it takes the lock itself), so its exit code and errors are the targeted pass's.
- D5 Dispatch gate. In `dispatchLeaf`, right after the paused gate at next.ts:754: when `isStopped(repo.name, slug)`, a `picked && !isAutomatic` call reports `Leaf is stopped: <slug>; run akrogon start <slug>` through `report(...)` and returns `'skipped'` (exit 1 through the existing `skipped.size` rule at :1685), every other call returns `end('none')`. Bare `next` and `next --all` are picked passes, so they report it the same way, matching the design's "a picked manual next errors". Merge-seat dispatch (`picked` false) ends quietly.
- D6 Merge gate. `mergeQueue` in src/turn.ts drops stopped leaves that hold no `batch` from `eligible` (`leaf.state.batch !== undefined || !isStopped(leaf.state.repo, leaf.state.slug)`), so a stopped leaf never becomes a new holder or carried member. A stopped leaf that holds a batch keeps its place at the head of the queue, so the repo's one merge turn waits for `start` and no other leaf builds a second stack over the same members. `mergeTurn` in src/next.ts returns before dispatch, restore or build when its holder is stopped, so no stack is built and no merge seat is prompted while it is stopped (corrected 2026-10-13, check.fix C1: the earlier "drop every stopped leaf" let the next leaf build a second batch claiming the stopped holder's carried member).
- D7 Status. The board's NOTE cell for a stopped leaf starts with `stopped` (joined with the existing note by `; ` when that note is non-empty). `status <slug>` prints `stopped: <repo>/<slug>` beside the `paused:` line. `readStopped()` is read once per command like `readPaused()`.
- D8 CLI. `src/akrogon.ts` adds `stop` and `start` cases (lazy import like pause), `{ all: { type: 'boolean' } }` options for `stop`, and both verbs in the usage string. `stop` takes `<slug> | --all`, `start` takes exactly `<slug>`.
- D9 Docs. README verb table rows `akrogon stop <slug> \| --all` and `akrogon start <slug>`. docs/guide/next.md gets a "Stopping a leaf" section after the pause section, naming `akrogon stop <slug>`, `akrogon stop --all`, `akrogon start <slug>`, what is kept (worktree, saved sessions), the gate behavior (D5, D6), the retry on failure, and that hand-split panes survive. src/AREA.md gets one `src/stop.ts` line, tests/AREA.md one `tests/leaf-stop.test.ts` line.

Design note: brief criterion 2 says nothing about bare `next`. The design's "a picked manual next errors" plus the guide's definition of picked (target, bare, `--all`) decide it: D5.

Open limitation (accepted residual, fog-defaults 1a): panes split by hand in a leaf tab are outside the box and survive a stop. Standalone `run-check --holder` processes outside leaf panes are not stopped.

## Waves
Wave 1
- U1 Stop core. Owns `src/stop.ts` (new), `src/akrogon.ts`, `.gitignore`. D1-D4, D8. Prerequisites: none.
- U4 Docs. Owns `README.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md`. D9. Prerequisites: none.

Wave 2
- U2 Gates. Owns `src/next.ts`, `src/turn.ts`. D5, D6. Prerequisite: U1 (`isStopped`).
- U3 Status. Owns `src/status.ts`. D7. Prerequisite: U1 (`readStopped`).

Shared test resource: none. Every test builds its own temporary AKROGON_HOME, repo, fake herdr, busctl and a test-local fake `systemctl`.

Docs affected: README.md verb table, docs/guide/next.md, src/AREA.md, tests/AREA.md. No skill text changes.

## Criteria, tests and proof
Proof commands (run from the worktree):
- P1 `bun test tests/leaf-stop.test.ts --timeout=30000` (seconds, about 6 s).
- P2 `bun test tests/command-reference.test.ts --timeout=30000` (seconds).
- P3 the `checks` commands `format`, `typecheck`, `test` from `akrogon config` (minutes, about 2 min for the full test). `test_changed` with `AKROGON_BASE` covers the changed tests.
- P4 live run for criterion 1 (minutes), below.

Rerun triggers: P1 after any change to src/stop.ts, src/next.ts, src/turn.ts, src/status.ts, src/akrogon.ts or the test file. P2 after README.md, docs/guide/next.md or src/akrogon.ts changes. P3 before the phase move. P4 after the final change to src/stop.ts or src/akrogon.ts's stop path.

| Criterion | Test | Command | Failure it catches | Size |
| --- | --- | --- | --- | --- |
| 1 record, slice stop, worktree kept | `stop records the leaf, then stops its leaf slice and keeps the worktree` (record key, exact `--user stop <leafSlice>` argv, worktree exists, phase unchanged) plus P4 live | P1, P4 | wrong order or slice name, worktree removed, nothing stopped | seconds + minutes |
| 2 automatic, targeted, bare, merge | `a stopped leaf is not dispatched by an automatic pass, and a picked manual pass names start`; `the merge path builds no stack and starts no merge seat for a stopped leaf` | P1 | a hook or sweep prompts a stopped leaf, `next <leaf>` succeeds or omits `akrogon start`, a stopped merge leaf becomes holder or member or gets a merge prompt | seconds |
| 3 failed stop keeps record, retry; not loaded exits 0 | `a failed slice stop keeps the record, prints the error, exits non-zero and is retryable`; the exit-0 case is the first test (fake systemctl returns 0 as systemd 262 does for an unloaded slice) | P1 | record dropped on failure, error swallowed, exit 0 on failure, retry refused | seconds |
| 4 `--all` per leaf, partial failure | `stop --all stops every allocated leaf, reports each, and one failure does not block the others` (unallocated `cc` gets no call) | P1 | first failure aborts the rest, unallocated leaf touched, exit 0 on partial failure | seconds |
| 5 start removes record, runs targeted pass, refuses not stopped | `start removes the stopped record and runs the targeted pass, and refuses a leaf that is not stopped` | P1 | record kept, no pass run, start on a live leaf succeeds | seconds |
| 6 status marks | `status marks a stopped leaf on the board and in its leaf view` | P1 | no mark, or every leaf marked | seconds |
| 7 README and guide | `README covers every dispatched command and its argument contract` and `escaped alternatives and reordered rows preserve argument semantics` (contracts now carry `stop: '<slug> \| --all'`, `start: '<slug>'`); new `the next guide describes stop and start` | P2 | verb missing from README or with wrong arguments, guide silent on stop/start | seconds |

### Recorded reds (2026-10-13, base e5776ad, `bun test --timeout=30000`: 877 pass, 9 fail, all planned)
- Criterion 1: `stop records the leaf...` at `expect(stopped.code).toBe(0)`: Expected 0, Received 1 (unknown verb `stop` hits the usage error).
- Criterion 2: `a stopped leaf is not dispatched...` at `expect((await run(f, ['stop', 'build'])).code).toBe(0)`: Expected 0, Received 1. `the merge path builds no stack...` at `expect((await run(f, ['stop', 'aa'])).code).toBe(0)`: Expected 0, Received 1. Control run with the stop line removed: `aa` got an applied batch with `bb` as member, so the test's setup reaches a real merge turn.
- Criterion 3: `a failed slice stop...` at `expect(failed.stderr).toContain(slice(path))`: Expected to contain `akrogon-lc99b2410bc2c.slice`, Received the usage-error stack.
- Criterion 4: `stop --all...` at `toContain('aa')`: Received the parseArgs stack (`--all` unknown for `stop`).
- Criterion 5: `start removes the stopped record...` at the `stop build` step: Expected 0, Received 1.
- Criterion 6: `status marks a stopped leaf...` at the `stop build` step: Expected 0, Received 1 (the "before" assertion, no `stopped` on the board, passed).
- Criterion 7: `the next guide describes stop and start`: Expected to contain `akrogon stop <slug>`. `escaped alternatives and reordered rows preserve argument semantics`: dispatcher verbs vs contract rows, `+ Received + 2` (stop, start). `README covers every dispatched command...` passes now and goes red once U1 adds the verbs without U4's rows, so wave 1 lands both.

### P4 live run for criterion 1 (implementer, recorded in report.md)
Isolation per design T3: `XDG_CONFIG_HOME=$(mktemp -d /tmp/akls.XXXX)` (short path), plugin linked there only, a temp `akrogon` shim first on the server PATH running the worktree's `src/akrogon.ts`, `AKROGON_HOME` a temp home registering only a temp repo with one leaf, server started with `systemd-run --user --unit=akls-herdr herdr server`, `HERDR_*` pane variables unset on client calls. The operator's herdr, repos and akrogon home are not touched.
Steps: `akrogon next <leaf>` allocates and boxes the panes. In seat A's pane start a headless Chrome (`/opt/google/chrome/chrome --headless=new --user-data-dir=$(mktemp -d) about:blank &`) and a `sleep 9999 &` worker. Record `systemctl --user status <leafSlice>` and `ps -o pid,cgroup` for those PIDs. Run `akrogon stop <leaf>`. Pass when: exit 0, `stopped.yaml` has the key, `systemctl --user is-active <slice>` is inactive, the Chrome and sleep PIDs are gone (`ps -p`), the herdr tab and panes are gone (`herdr pane list`), the worktree and the seat session files still exist. Restart boundary: each step is independent, a failed step restarts from `akrogon next <leaf>` on a fresh temp home. Cleanup: `systemctl --user stop akls-herdr`, remove the temp dirs, confirm no probe Chrome left.

## check.fix corrections (2026-10-13)
- C1 (review A F1, plan correction to D6). Rule: a merge turn held by a stopped leaf waits; it is never handed to another leaf. Executable check: reproduction test `stopping the holder of an applied batch builds no second batch and prompts no merge seat` in tests/leaf-stop.test.ts (aa holds an applied batch with member bb, `stop aa`, `next`: bb has no batch, aa's batch is unchanged, no merge prompt). Proof: P1.
- C2 (review A F2, plan correction to D3). Rule: `--all` selects open, unmerged leaves with a tab. Executable check: reproduction test `stop --all skips merged and closed leaves that keep their tab` in tests/leaf-stop.test.ts (no record and no systemctl call for them). Proof: P1.
- C3 (review B F1, required live run). P4 is rerun with a seat that starts a real harness session, recording the saved session file before and after stop. Proof: P4, recorded in report.md.
- Repair wave: R1 owns `src/turn.ts`, `src/next.ts` (C1). R2 owns `src/stop.ts` (C2). Disjoint paths, no shared test resource, one wave. P4 runs after both land.

## Credentials
The design names no credential variables. `akrogon status leaf-stop` shows no `Missing:` lines.
