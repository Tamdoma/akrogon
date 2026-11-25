# Brief 1 — U1: kill machinery (relocation, commitMove sweep, helper, run-check publish order, timing kinds)

## 1. Goal

Implement plan decisions D1, D8, D9, D10, D11, D12 of `plan.md` (in the leaf folder) so that `tests/tool-kill.test.ts` passes in full. The test file is the behavior spec; read it completely first. You implement in a detached worker worktree; the leaf branch already holds the tests.

## 2. Numbered acceptance criteria

1. `tests/tool-kill.test.ts` case "a committed phase move kills every tool cgroup of the leaf scopes, defers in-flight akrogon shells, and the rest survives" passes: the winner commits and prints `moved implement` with exit 0, the loser exits non-zero, both shells' `t-`s defer (populated `akrogon/<t>`), the loop shell's children and the setsid orphan die at commit, root sleeps live, and after the test SIGKILLs both shells each detached helper removes exactly its own `t-`. Timing rows: one `tool_kill` row per enumerated scope carrying `tools/` (4 scopes → 4 rows: s1 seen 1 deferred [t1], s2 seen 1 deferred [t2], s3 seen 2, s4 seen 0, errors 0), none for `tk-none`, two `tool_kill_deferred` rows with fields `t` (the t-name), `unit` (scope unit), `outcome` `written`.
2. Case "a run-check writer with a closed stdout pipe publishes its evidence and exits with the run code" passes: kept `check-writer-*.log` exists with the marker line, both capture files are unlinked, a `check_end` row with `name: writer, exit: 7` exists, and the writer process exits 7 even though its stdout pipe reader was cancelled mid-run (Bun raises EPIPE at exit-flush on buffered writes — the echoes must use a write form whose EPIPE can be caught synchronously, e.g. `writeSync` in a retry loop for partial writes, swallowing only errno EPIPE).
3. Case "a failed kill or deferral spawn warns and the committed move stands" passes: with `AKROGON_CGROUP_ROOT` pointed at a fake tree, `akrogon phase` exits 0 with `moved implement` and stderr carries at least one JSON line per failure parseable as an object with fields `leaf`, `unit`, `t`, `error` — the line must contain the literal substring `"tool_kill"` somewhere (the test filters on it, e.g. a `warning` field value or the row kind) — and the `tool_kill` rows carry non-empty `errors` counts (a number, per the test's `errors` assertions: case 1 uses `toBe(0)` numeric, so `errors` is a count). The deferral-spawn-failure case still records `deferred: ['t-12-1']`.
4. `tests/run-units.test.ts` and `tests/durable-capture.test.ts` still pass unchanged (the relocation and publish reorder must not disturb them), and `tests/cli-help.test.ts` passes (relocation runs after the `--help` exit, keeping help side-effect free).

## 3. Read-first list

- `tests/tool-kill.test.ts` — the spec, read fully including the shell-script construction.
- `src/phase.ts` `commitMove` (finally structure, `renameTab`'s warning shape), `src/akrogon.ts` (verb dispatch, `parseArgs`, `migrateStateHome` position, `verify-pass` hidden verb), `src/run-check.ts` (`checkedRun` publish/echo order), `src/timing.ts` (row schemas, `appendTiming`), `src/scope.ts` (`leafSlice`, `sliceCgroup`, `cgroupRoot`, `procRoot`), `src/state.ts` `withLock`, `src/admission.ts` `callerScope`.
- `plan.md` decisions D8–D12 and its red-evidence section in `/home/ivan/Work/infra/akrogon/issues/open/seat-shell-kill/tool-cgroup-kill/plan.md`.
- `issues/chart/seat-shell-kill/direct/probe-entry/place.sh` in the main checkout for the probe-proven shell facts.
- this skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/tool-cgroup.ts` (new — but create it complete, including the entry half: `refreshToolEntry(home)` and the entry template texts, because U2 lands after you and only wires them), `src/phase.ts`, `src/akrogon.ts`, `src/run-check.ts`, `src/timing.ts`. Nothing else. Worker worktree created at commit `b9ebcf84e36565c17d2ca0a52ae8f9a32f3e7683` (filled at wave start).

Binding mechanism facts:

- **Relocation** (`relocateFromToolCgroup()`, exported, called in `src/akrogon.ts` after parseArgs/`--help` and before `migrateStateHome`, and at the top of `checkedRun`): read `/proc/self/cgroup` via `procRoot()`. If its innermost `tools/t-<pid>-<start>` segment exists, or the path sits inside `<root>/akrogon/` and env `AKROGON_TOOL_CGROUP` names a `t-` basename, write own pid into `<seat scope>/akrogon/<t-name>/cgroup.procs` (create the dir recursively first). The seat scope is derived textually by stripping the `/tools/...` or `/akrogon/...` suffix. Anywhere else: no-op. A failed move throws loudly. The `tool-kill-helper` verb is exempt (it is also spawned markerless).
- **Sweep** in `commitMove`'s existing `finally`, after `saveState` committed the move, never throwing (its own guarded try inside the finally so the log/visit appends are unaffected either way): enumerate `<sliceCgroup(leafSlice(repo, slug, homePath()))>` child `*.scope` dirs that hold `tools/`; per `t-*`: if `<scope>/akrogon/<t>/cgroup.events` reads `populated 1` (unreadable/absent counts unpopulated) defer unless `<scope>/helpers/<t>` is already populated — spawn the helper and write its pid into `helpers/<t>/cgroup.procs` before returning; else write `1` to `<t>/cgroup.kill` then rmdir the `t-` once, best effort. Also rmdir best effort every unpopulated `akrogon/<t-name>` and `helpers/<t-name>` whose `t-` is gone. Missing slice dir or scope without `tools/`: nothing, no warning. Every failure appends to the scope row's `errors` and prints one warning JSON line on stderr with `leaf`, `unit`, `t` (the t-name), `error` fields and the literal `"tool_kill"` text inside the line. `cgroup.kill` is asynchronous and zombie-reaping pins the dir — do not retry the sweep rmdir.
- **Helper**: internal verb `tool-kill-helper` in `src/akrogon.ts`, absent from `VERB_OPTIONS`, positioned before relocation and `migrateStateHome` (both skipped); positional args repo-name, repo-root, slug, unit, t-path. Polls `<procRoot>/<pid>/stat` every 200 ms with no timeout; ended means stat absent, field-22 starttime changed, or state `Z`/`X`. Then writes `cgroup.kill`, retries the `rmdir` briefly (kernel reaping is async — bounded retry, e.g. up to ~2 s), appends one `tool_kill_deferred` row via `appendTiming({name, root} as minimal repo shape, row)` with `outcome` `written`/`killed-already`/`error`, exits 0. Spawned by the sweep as `setsid` + `process.execPath` + the running akrogon.ts path (copy the spawn pattern from `src/verify.ts`/`src/land.ts`), stdio all ignore, `AKROGON_TOOL_CGROUP` scrubbed, `child.unref()`, no `.exited` retention. `setsid` without `--fork`: Bun children are never process-group leaders, so the spawned pid IS the final helper pid — write exactly that pid into `helpers/<t>/cgroup.procs`; ESRCH there means it already exited, not a warning.
- **checkedRun reorder**: kept-file write, `check_end` append and both capture unlinks before the stdout/stderr echoes; echoes and `runCheck`'s final summary swallow EPIPE only, using synchronous writes so the errno is catchable (Bun's buffered pipe writes surface EPIPE only at exit-flush, which would exit 1). Verify against the test: exit must be exactly the command's 7.
- **Timing kinds** in `src/timing.ts`: `tool_kill` — `slug`, `unit` (scope unit name), `seen` (count of t- dirs), `populated` (list of t- dirs whose own cgroup.events read populated 1 before the write — report only), `deferred` (list), `errors` (count); `tool_kill_deferred` — `slug`, `unit`, `t`, `outcome`, optional `error`. Check how `readTimings`/`wakeRow`/`timing-report.ts` treat unknown kinds before choosing field types — a strictSchema parse failure in a consumer must not break other rows.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file. A red or wrong planned test is a mismatch returned with evidence. Reason: A owns tests; exception: a revised brief from A.
- Do not touch `src/seat.ts`, `src/hc.ts`, `src/next.ts` or docs — those are other units' paths. Exception: none.
- Do not reorder anything in `runCheck` beyond the summary-write EPIPE swallow. Reason: design says the reorder is checkedRun's only. Exception: none.
- Never run any `git stash` subcommand — worktrees share one stash. To set work aside: commit as WIP and before returning `git reset --soft b9ebcf84e36565c17d2ca0a52ae8f9a32f3e7683`, then make the unit's single returned commit.
- Do not stop processes by command-line pattern; use `akrogon stop-run <id>`. No exceptions.
- Restated: return a mismatch with evidence instead of changing scope, tests or interfaces; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the spec test and read-first list. Install dependencies per section 7. Run the red test once to see base failure: `akrogon run-check --name u1-red -- bun test tests/tool-kill.test.ts --timeout=120000` from your worktree.
2. Write `src/tool-cgroup.ts` complete: relocation, sweep, helper logic, plus the entry half (`refreshToolEntry(home: string): void` writing `<home>/tool-entry/bash` mode 0755 and `<home>/tool-entry/bash-env` mode 0644 atomically — write beside then rename — rendered from one template constant; the wrapper execs the real bash resolved as `realpathSync` of `which('bash')` with any PATH entries inside the entry directory filtered out, falling back to `/usr/bin/bash`; placement shell logic per probe `place.sh`: act only when `/proc/self/cgroup`'s `0::` path resolved under the cgroup root equals `$AKROGON_SEAT_CGROUP` exactly, `mkdir -p tools/` if absent, mint `tools/t-<pid>-<starttime>` (starttime = field 22 of `/proc/<pid>/stat`, taken after the `)` as field 20 of the remainder), write `$$` to its cgroup.procs, export `AKROGON_TOOL_CGROUP`; every step output discarded, sourced form always ends success, wrapper always execs bash). U2 wires it; you only need it compiling and exported.
3. Wire relocation into `src/akrogon.ts` and `checkedRun`; implement the helper verb.
4. Implement the sweep in `commitMove`'s finally.
5. Reorder `checkedRun`'s publish before echoes with synchronous EPIPE-swallowing writes.
6. Add the two timing kinds.
7. Run the targeted test until green.

Advisory size: 5 files, under 60 turns.

## 7. Commands

Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

Targeted tests, from your worktree:
- `bun test tests/tool-kill.test.ts --timeout=120000`
- `bun test tests/run-units.test.ts tests/durable-capture.test.ts tests/cli-help.test.ts --timeout=120000`

Keep output through `akrogon run-check --name <label> -- <cmd>` citing the `check <label>: <exit> <path>` line. Note: run-check inside your detached worktree may fail to resolve a leaf; if it does, run the bare command and paste its output directly instead, naming that deviation in your report.

The test spawns REAL systemd user scopes — do not be surprised by `systemctl --user` units; they are stopped by the test's teardown. Never `pkill`/pattern-kill anything.

## 8. Done-when, evidence and report

`bun test tests/tool-kill.test.ts` green end-to-end in your worktree, the regression trio green, one commit on top of the creation commit with all the work. You change no test file, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
