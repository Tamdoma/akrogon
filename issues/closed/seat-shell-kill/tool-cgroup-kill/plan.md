# Plan: tool-cgroup-kill

Brief and design agree; no conflict found. `debate` does not apply (design is locked charting output). This synthesis answers both `Open for the plan:` questions as decisions D7 and D13, resolves the timing-kind question as D10, and derives the test constructions the proof lines demand.

## Decisions

- **D1** One new module `src/tool-cgroup.ts` holds all of the leaf's mechanism: the entry-script texts and their atomic refresh, the CLI relocation step, the kill sweep (enumerate, kill-or-defer, cleanup), and the helper's wait-and-kill. Repo style is dash-named modules (`run-check.ts`, `verify-pass.ts`), so not `toolkill.ts`/`toolKill.ts`.
- **D2** Env markers keep the design's literal names: `AKROGON_SEAT_CGROUP` (absolute seat scope root, set by `startSeat` in the seat argv env) and `AKROGON_TOOL_CGROUP` (absolute `t-` path, exported by the entry after placement).
- **D3** Entry files live at `<homePath()>/tool-entry/bash` (the executed wrapper) and `<homePath()>/tool-entry/bash-env` (the sourced `BASH_ENV` script). `homePath()` is `AKROGON_HOME` or `~/.akrogon`, never a release dir (design C). `startSeat` refreshes both on every seat start: write to a sibling temporary name in the same directory, then `rename` over the target. The wrapper is mode 0755, the sourced script 0644. Both render from one template constant in `src/tool-cgroup.ts`; the wrapper then `exec`s the resolved real bash (D7).
- **D4** Placement shell logic (shared by both forms, probe-proven in `issues/chart/seat-shell-kill/direct/probe-entry/place.sh`): act only when `/proc/self/cgroup`'s `0::` path resolved under `cgroupRoot()` equals `$AKROGON_SEAT_CGROUP` exactly; then `mkdir -p` `tools/` if absent, mint `tools/t-<pid>-<starttime>` (starttime is field 22 of `/proc/<pid>/stat`, taken after the `)` as field 20 of the remainder), write `$$` into its `cgroup.procs`, export `AKROGON_TOOL_CGROUP`. Every step's output and failure is discarded (`2>/dev/null`, `|| true` semantics); the sourced form always ends `return 0`-equivalent and the wrapper always execs bash. The script never writes anything outside the scope root it was handed.
- **D5** Wiring per harness kind in `startSeat`'s scope env: claude gets `CLAUDE_CODE_SHELL=<entry>/bash` and `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`; pi and codex get `BASH_ENV=<entry>/bash-env`; agy gets `PATH=<entry>:<inherited PATH>`; every other configured kind gets `BASH_ENV` (design D: fails safe when the kind's shell is not bash). All kinds get `AKROGON_SEAT_CGROUP=<sliceCgroup(slice)>/<unit>` and `-p Delegate=yes` in the `systemd-run` argv.
- **D6** Bootstrap: `scopeEntry` in `src/seat.ts` becomes a three-outcome probe — `entered` (cgroup ends with `/<slice>/<unit>`), `exited` (`/proc/<pid>` gone), `outside` (deadline passed still elsewhere). On `entered`, `startSeat` creates `<scope>/tools`, `<scope>/akrogon`, `<scope>/helpers` through `cgroupRoot()` before `firstTask`; a creation failure ends the terminal and throws exactly like the `outside` refusal. `cgroupOf` reads through `procRoot()` (answers the design's open question: yes, so tests can steer it; production behavior identical since `procRoot()` defaults to `/proc`).
- **D7** Real bash path resolved once per `startSeat` as `realpathSync(Bun.which('bash') ?? '/usr/bin/bash')` and rendered into the wrapper. `Bun.which` reads akrogon's own PATH, which is never the shadowed one (the shadowing PATH exists only inside the seat); defense in depth per the design's recursion-warning: entries inside the entry directory are filtered out of the PATH used for resolution. (Answers `Open for the plan` 2: resolve at `startSeat`, and the source text lives in a TS module constant — answers `Open for the plan` 1.)
- **D8** Relocation (`src/tool-cgroup.ts`, called from `src/akrogon.ts` after `parseArgs` and the `--help` exit, immediately before `migrateStateHome`, and at the top of `checkedRun` for direct library calls): read `/proc/self/cgroup` through `procRoot()`. If its innermost `tools/t-<pid>-<start>` segment exists, the `t-` name is that directory; else if the path is inside `<root>/akrogon/` and `AKROGON_TOOL_CGROUP` names a `t-`, use that. In both cases move self into `<seat scope>/akrogon/<t-name>/` (created recursively if absent) by writing `$$` to its `cgroup.procs`. The seat scope is derived textually from the cgroup path itself (strip the `/tools/...` or `/akrogon/...` suffix) — no env needed for the target. Anywhere else: no-op. A failed move throws loudly: the process is still inside a killable `t-` and must die before publishing anything rather than corrupt records mid-commit. The `tool-kill-helper` verb is exempt and runs before relocation can apply (it is also spawned without the marker and placed by its spawner, so this is belt-and-suspenders per design).
- **D9** Kill sweep in `commitMove`, inside the existing `finally` beside `logMove`/`visit_start` (design D): after `saveState` has committed the move, for the moved leaf enumerate `sliceCgroup(leafSlice(repo, slug, homePath()))` for child `*.scope` directories holding `tools/`; per `t-*` inside: if `<scope>/akrogon/<t-name>` reads `populated 1` in its `cgroup.events`, defer — unless `<scope>/helpers/<t-name>` already reads populated — by spawning one helper and writing its pid into `helpers/<t-name>/cgroup.procs` before returning; otherwise write `1` to `<t>/cgroup.kill` and `rmdir` the `t-` best effort. Also `rmdir` best effort every unpopulated `akrogon/<t-name>` and `helpers/<t-name>` whose `t-` is gone. A missing slice directory or a scope without `tools/` yields nothing and no warning. Every failure (kill write, rmdir, spawn, pid write) appends to the row's `errors` and warns as one structured JSON line on stderr with leaf, unit, `t-` and error, following `renameTab`'s warning shape. The sweep never throws: it is wrapped so even an unexpected failure warns and leaves the committed move untouched. Both the log/visit append and the sweep run inside the `finally` (each independently guarded) so neither suppresses the other.
- **D10** Timing rows: two new kinds in `src/timing.ts` per the design's names — `tool_kill` (one per enumerated seat scope per commitMove: `slug`, `unit`, `seen` count of `t-` dirs, `populated` the `t-` dirs that read populated before the write as a list, `deferred` the deferred `t-` dirs as a list, `errors` count) and `tool_kill_deferred` (one per helper exit: `slug`, `unit` the scope unit, `t` the `t-` name, `outcome` written/killed-already/error plus error text when present). Two kinds need no extra handling in `timing-report.ts` (it reads only visit_start/prompt/wait/check rows) and `readTimings` is a passthrough schema — same cost as one kind, cleaner shapes. An older akrogon reading a ledger line with an unknown kind already skips it in `wakeRow` and `readTimings` parse-fails soft with a warning; acceptable per existing row-kind precedent.
- **D11** Helper: internal verb `tool-kill-helper` in `src/akrogon.ts`, absent from `VERB_OPTIONS` like `verify-pass`, positioned before relocation and `migrateStateHome` (both skipped). Positional args: repo name, repo root, slug, unit, `t-` path. It polls `<procRoot>/<pid>/stat` where pid and starttime come from the `t-` basename: ended means stat absent, starttime changed, or state `Z`/`X`; poll interval 200 ms, no timeout. Then writes `cgroup.kill`, retries the `rmdir` briefly (the kernel reaps asynchronously — a single rmdir races zombie reparenting), appends one `tool_kill_deferred` row through a minimal `{name, root}` repo shape recording the outcome of the kill write, exits 0. Spawned by commitMove as `setsid <process.execPath> <toolRoot>/src/akrogon.ts tool-kill-helper ...` with `stdin/stdout/stderr` all `'ignore'` (stdio ends at `/dev/null`-equivalent), `AKROGON_TOOL_CGROUP` scrubbed from env, no fd or handle held (no `.exited` retention, `child.unref()`). `setsid` without `--fork` because Bun children are never process-group leaders, so no hidden second fork — the spawned pid is the final helper pid, which is what commitMove writes into `helpers/<t-name>/cgroup.procs` under the home lock before returning. `ESRCH` on that write means the helper already exited: not a warning, the helper's own row records how it ended.
- **D12** `checkedRun` reorder: kept-file write, `check_end` append and both capture unlinks happen before the stdout/stderr echoes; echoes and `runCheck`'s final `check <name>: <exit> <path>` summary ignore `EPIPE` specifically (only that errno is swallowed; the publish itself never depends on the pipe). No reorder in `runCheck`: it already runs after the publish.
- **D13** Recovered-shell predicate: exported pure function `recoveredShellSeat(t: Seen): boolean` in `src/next.ts` — `t.state === 'live' && t.status === null` and either parked (`t.pid === null && t.reason != null && t.reason !== 'spawn_pending'`) or spawned (`t.foreground?.name` in `{sh,bash,dash,zsh,fish,ash,ksh,nu}` and `t.argv.length > 0` and `t.argv[0]`'s basename is not `systemd-run`). `terminalSchema`/`Seen` in `src/hc.ts` gain `argv` (default `[]`), `reason` (default `null`) and `foreground.name` (default `''` when absent — an absent field reads as no match). The predicate is called only in `dispatchSlot`'s lost-seat branch: a live seat matching it takes exactly the existing lost path (seat_lost row with its evidence fields, `end`, `lost`+1, failed at 3, `startSeat`). It is not referenced from `liveSeat`, `allocate`, `activeCount` or `broadcastInProgress`.
- **D14** Test reach per standing design: real-boundary tests create throwaway scopes by spawning the absolute `systemd-run` path (resolved once with `Bun.which` in the test process, which never carries the fixture's fake-first PATH) with `sessionBusEnv()`-equivalent env (`XDG_RUNTIME_DIR`/`DBUS_SESSION_BUS_ADDRESS` re-pinned to `/run/user/<uid>`), because `akrogon run-check` cuts the bus and the fixture PATH puts the fake first. Scopes carry `-p Delegate=yes` to mirror production. All cgroup paths go through `sliceCgroup`/`cgroupRoot` logic; cleanup stops the fixture leaf slice (`systemctl --user stop <slice>`) in `finally` and verifies the scope cgroups are gone. When no user manager answers, tests fail and never skip.
- **D15** File layout of tests: three new test files — `tests/tool-kill.test.ts` (criteria 1, 2, 4), `tests/tool-entry.test.ts` (criterion 3), `tests/recovered-seat.test.ts` (criterion 5). No existing test file is modified, so no `Test-Change` trailer is needed; the new files are inside the branch diff when the implement move records `frozen`.

## Open limitation

None beyond the design's recorded residuals (F1 wake gap, entry-missed shells, pre-leaf seats unplaced, spawn-time kill window, print-mode-only entry evidence). They stay as recorded in the design and are not re-litigated here.

## Read-first

- `src/phase.ts` — `commitMove` finally structure, `MoveCommittedError`, `renameTab` warning shape, `withLock` usage.
- `src/scope.ts` — `leafSlice`, `sliceCgroup`, `cgroupRoot`, `procRoot`, `sessionBusEnv`, `unitPopulated` pattern.
- `src/seat.ts` — `startSeat` argv construction, `scopeEntry`, `cgroupOf`, harness kind flow, `launch` exclusion.
- `src/run-check.ts` — `checkedRun` publish/echo order, capture lifetime, `spawnLogged`.
- `src/akrogon.ts` — verb dispatch order, `parseArgs`, `migrateStateHome` position, `verify-pass` hidden-verb precedent.
- `src/hc.ts` — `terminalSchema`, `Seen`, `foreground` shape.
- `src/next.ts` — `dispatchSlot` lost-seat path, `observeBusy` interplay, `leafSeats` discovery.
- `src/timing.ts` — kind schemas, `appendTiming` repo use (name + root only).
- `src/admission.ts` — `callerScope` last-`.scope` segment logic (relocation must not disturb it).
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`, `unitBin` fake-first PATH meaning.
- `tests/hc-fixture.ts` — `hcCore`, `setSeat`, `standinBin` layout, `core.shimLog` recorded `hc run` argv.
- `tests/run-units.test.ts` — real-systemd spawning precedent, slice nesting math.
- `tests/durable-capture.test.ts` — `spawnCheck` custom spawn pattern for run-check.
- `issues/chart/seat-shell-kill/direct/probe-entry/place.sh` — the probe-proven placement shell text.
- `issues/chart/seat-shell-kill/forks/tool-cgroup.md` — kernel semantics F1–F8.
- `docs/reference/files.md`, `src/AREA.md` — the two docs the leaf must update.

## Interfaces

- `AKROGON_SEAT_CGROUP=<absolute seat scope cgroup path>` — set by `startSeat`, read by the entry only.
- `AKROGON_TOOL_CGROUP=<absolute t- path>` — exported by the entry, read by relocation, scrubbed from helper spawn.
- `t-` name: `t-<pid>-<starttime>` with starttime `/proc/<pid>/stat` field 22.
- Internal verb: `akrogon tool-kill-helper <repo> <root> <slug> <unit> <t-path>` — not in usage, no state-home migration, no relocation.
- `refreshToolEntry(home: string): void` exported from `src/tool-cgroup.ts` (writes both entry files atomically under `<home>/tool-entry/`); `startSeat` calls it with `homePath()` and tests call it with a scratch home.
- Timing kinds `tool_kill` and `tool_kill_deferred` in `timings.jsonl`.
- `recoveredShellSeat(t: Seen): boolean` exported from `src/next.ts` for tests.

## Waves

Units with disjoint paths sharing wave 1; U4 lands after the behavior it documents exists.

- **W1 — U1** Kill machinery: `src/tool-cgroup.ts` (relocation, sweep, helper), `src/phase.ts` (commitMove hookup), `src/akrogon.ts` (relocation call + helper verb), `src/run-check.ts` (relocation call + publish reorder), `src/timing.ts` (two row kinds). Makes `tests/tool-kill.test.ts` pass.
- **W1 — U2** Entry and wiring: `src/seat.ts` (argv env, Delegate, bootstrap, three-outcome scopeEntry, cgroupOf procRoot), `src/tool-cgroup.ts` (entry texts + refresh — shared file with U1 but disjoint functions; if a worker conflict arises the entry half can land in `src/tool-entry.ts` as an implementation detail without changing the plan). Makes `tests/tool-entry.test.ts` pass. No dependency on U1's behavior; disjoint test files.
- **W1 — U3** Recovered shell: `src/hc.ts` (schema fields), `src/next.ts` (predicate + lost-branch use). Makes `tests/recovered-seat.test.ts` pass. Disjoint paths from U1/U2.
- **W2 — U4** Docs: `src/AREA.md` (kill module, helper verb, changed startSeat/commitMove) and `docs/reference/files.md` (timing kinds line). Prerequisite: U1–U3 so the documented behavior is final.

Docs affected: `src/AREA.md` and `docs/reference/files.md` — one line each plus the module description; no other agent or human doc names these mechanisms (checked `docs/` for `cgroup`, `Delegate`, `timings.jsonl` kinds list — only `files.md` enumerates kinds). `tests/AREA.md` gains no line requirement but naming the three new test files there keeps the area index accurate; it is optional, not a criterion.

## Done-criteria -> proof

Each criterion's proof command is one `bun test` invocation (runner exists at base) run through `akrogon run-check`. Red outputs are recorded under `## Red evidence` from the plan-time runs. Size and rerun triggers per criterion.

### Criterion 1 — committed move ends every `t-` except in-flight akrogon deferrals

Test: `tests/tool-kill.test.ts` case "a committed phase move kills every tool cgroup of the leaf's seat scopes". Construction:

- Fixture leaf `tk` in `plan.synthesis` (no worktree needed — existing tests prove this move commits). Its slice `sliceCgroup(leafSlice(f.repo-ish, 'tk', f.home))` is realized by spawning three real scopes with the absolute `systemd-run` (`--user --scope --slice=<leafslice> -p Delegate=yes --unit=<scopeS1/S2/S3> -- sleep 600` backgrounded), and a fourth real scope `S4` under the same slice with no `tools/` for the no-warning case. The `sleep` payload of S1/S2 plays the harness-direct child at each scope root; S3's payload exits after spawning children so S3 plays the replaced seat's leftover scope.
- `t-caller` in S1 and `t-sibling` in S2: real bash shells, self-moved into their self-minted `t-` dirs (probe text), each running `akrogon phase tk implement --slot A` as a background child followed by `sleep 600` to stay alive. The race is deterministic by design: both akrogon calls target the same move, so exactly one wins the home lock and commits while the loser is guaranteed blocked on that lock — both are in flight during the winner's enumeration, so both `t-`s defer.
- Two shells in S3: a looping shell foregrounding `while true; do sleep 5 & sleep 0.3; done` in its own `t-` (keeps starting children), and a launcher shell in a second `t-` that disowns a `setsid` orphan into it and exits — the orphan sits in the `t-` with its tool shell dead.
- The test itself holds the fixture home `.lock` (via `withLock` from `src/state`) while both shells start, waits for both akrogon processes to exist and (bounded ~10 s, then proceeds) for their relocation into `<scope>/akrogon/t-*` to read populated — on base this wait always times out and the test fails downstream fast, on fixed code it is the gate that makes the deferral deterministic. Then the test releases the lock.
- Assertions after both akrogon processes exit: winner exits 0 with `moved implement` in stdout; loser exits non-zero with the illegal-move error — neither is 137/killed (proves akrogon processes are never killed and the phase call exits as today). `state.yaml` is `implement` (the move committed). The sweep-killed `t-`s' processes die — the loop's latest child and the disowned orphan — and their `cgroup.events` read `populated 0`; dir removal is asserted only for helper-killed `t-`s because a sweep `rmdir` races kernel reaping (see red evidence). S1/S2/S3 root `sleep` payloads are alive (harness-direct children never killed). `t-caller` and `t-sibling` still exist while their shells live (deferred, not killed during the commit); after the loser's akrogon has exited, `t-sibling` is still present — proves the helper waits for the tool shell, not the akrogon process. Then the test SIGKILLs both shells; within `WAIT_MS` both `t-` dirs are gone and the same-command background children dead (the deferred helper fired without any further commit). `timings.jsonl` holds exactly one `tool_kill` row per enumerated scope with `seen` counts, `deferred` naming both `t-`s, `errors` empty; `tool_kill_deferred` rows appear after the helper kills. No warning in stderr for S4 (no `tools/`) or for a second fixture leaf `tk-none` whose slice directory never existed (driven with a second `phase` move on that leaf).
- Base failure shape: no relocation, no kill — the relocation gate times out, the move commits but every `t-` survives and no `tool_kill` rows exist; red.

Condition coverage (decisions x conditions):

- Kill after `saveState`, not before (ordering): no test case can distinguish the order — both orders converge to the same observable end state, and the never-fail rule applies in both positions; the joint assertion (committed state ∧ dead `t-`s ∧ exit 0) is the criterion's observable contract. Traced, no case. The enumeration-key correctness (moved leaf's own slice) is observable and covered: a wrong key kills nothing, failing the `t-`-gone assertions.
- "Including a looping shell that keeps starting children": covered — the loop's most recent child must be dead (a kill missing forked-during-write children leaves the t- populated and the rmdir fails, surfacing as errors/dead-process assertions).
- "a `setsid` orphan whose tool shell already exited": covered by `t-orphan`.
- "the leftovers of a seat replaced through the lost path": covered by S3 being a separate scope the harness already exited — enumeration is by directory shape, no seat record involved.
- In-flight deferral decided by `akrogon/<t>` population, not caller identity: covered structurally — the winner's own `t-` and the loser's sibling `t-` defer identically, and the loser is a *concurrent sibling akrogon call*, which is exactly the population-rule case.
- Helper no-timeout wait: covered — the helper must still be waiting after the loser's akrogon exits (assert `t-sibling` present at that point) and fire only after the shell dies.
- One timing row per enumerated scope, no rows/no warnings for empty cases: covered by exact row assertions and the S4/`tk-none` negative cases.
- `AKROGON_TOOL_CGROUP` value traced from entry export to relocation inheritance: the relocation gate in the test observes the end state of exactly this path (akrogon moves out of the `t-` before touching the lock); a relocation that lands wrong leaves the process in the `t-`, which the winner's own commit would kill — the test's winner-exit-0 assertion fails. Covered.

Proof command: `akrogon run-check --name tool-kill -- bun test tests/tool-kill.test.ts --timeout=120000`. Size: minutes (several real scopes, two phase moves, waits). Rerun trigger: any change to `src/tool-cgroup.ts`, `src/phase.ts`, `src/akrogon.ts`; it is a leaf-criterion proof re-run at review and merge through the configured `checks` (the `test` check runs the whole suite, which includes this file — the brief names no whole run, the configured check already contains it).

### Criterion 2 — survivors and the run-check writer case

Same scenario as criterion 1 for the survival bullets (folded into its assertions as the brief requires: "Proof: own test in criterion 1's scenario, so it fails on the base through criterion 1's kills"):

- The tool shell that runs `akrogon phase`: exit-code assertions in criterion 1's test.
- Sibling akrogon waiting on the home lock: the loser construction, same test.
- Harness-direct scope-root processes and every akrogon process survive: same test.

The writer case is its own test in the same file: `akrogon run-check` (invoked through the `spawnCheck` pattern of `tests/durable-capture.test.ts`) runs a blocking command that prints a marker line, touches a ready file, waits for a release file, then exits 7. The test waits for the ready file, then closes the read end of the writer's stdout by cancelling the `Bun.spawn` pipe stream (probe-verified: cancel closes the read end; a late write then raises `EPIPE` in the writer and Bun exits 1). After release: the kept `check-writer-*.log` exists with the command's output, the `check_end` timing row is appended, both capture files are unlinked, and the process exits 7. Base failure shape: probe-verified, the `EPIPE` in Bun surfaces at exit-flush, so the writer completes its statements but exits 1 rather than the command's 7 — the test reds on the exit code, exactly the criterion's observable (recorded in red evidence).

Condition coverage:

- "publishes its kept file and `check_end` row, removes its capture pair, exits with the run's code" — each is a separate assertion; a partial reorder (kept file but not the unlink) fails.
- `EPIPE` ignored on both echoes and the final summary: the run writes enough output that both echo writes hit the closed pipe; the summary-line write is part of the same closed stdout. Traced: stderr is not closed in this test, so the stderr-echo EPIPE path is covered only by code symmetry — recorded as the traced reason (closing both ends would make the `check <name>:` stderr line unobservable; the stdout case exercises the same swallow helper).
- Writer relocation keeping `callerScope` intact: the run-check process relocates into `akrogon/<t>` only when it sits in a `t-`; in this test it does not (spawned by the test, not a tool shell). The relocation-does-not-break-`callerScope` property is instead covered inside criterion 1's test: both `akrogon phase` processes complete their admission/lock/record path normally after relocating — a broken scope resolution fails the move outright. Traced.

Proof command: same as criterion 1 (same file, one invocation). Size: seconds for this case. Rerun trigger: any change to `src/run-check.ts`.

### Criterion 3 — entry placement per kind, argv, bootstrap

Test file `tests/tool-entry.test.ts`, three test cases.

1. "entry placement at the real cgroup boundary": one real `systemd-run` scope (Delegate=yes) whose payload script runs the cases and writes results to files, per kind wiring:
   - `BASH_ENV=<refreshed bash-env> bash -c '<command>'` (the pi/codex shape) with `AKROGON_SEAT_CGROUP=<scope root>`: the command's own `/proc/$$/cgroup` read shows `tools/t-<pid>-<starttime>`; stdout/stderr/exit code byte-identical to the same command without `BASH_ENV`.
   - `<entry>/bash -c '<command>'` (the claude `CLAUDE_CODE_SHELL` shape): same placement result.
   - PATH-first wrapper (`PATH=<entry dir>:$PATH bash -c ...`, the agy shape): same.
   - Nested `bash -c 'bash -c ...'`: the inner shell reads the *same* `t-` as its parent (no second placement).
   - A bash run outside the scope root with the same env: output unchanged, no `t-` created.
   - Fail-open: `tools` pre-created as a plain file inside the scope so minting must fail — the command output and exit status are unchanged anyway.
   - `/bin/sh -c` with `BASH_ENV` set: unplaced, output unchanged (sh never sources it — the entry-miss residual, pinned here so a behavioral surprise surfaces).
   Entry files come from invoking the exported refresh function with `AKROGON_HOME` pointed at a scratch dir — direct library invocation, no seat needed. Base failure: refresh does not exist / files absent — red immediately.
2. "the seat launch argv carries Delegate=yes and the per-kind entry wiring" — real hc-core test per kind: start a seat per kind `claude`, `pi`, `codex`, `agy`, `fake` (setSeat into the fixture config; stand-in symlinks for `pi`/`codex` created beside the fixture's existing ones) and read the recorded `hc run` argv from `core.shimLog`: `-p Delegate=yes` present; env carries `AKROGON_SEAT_CGROUP` ending in the scope unit path; per-kind wiring exactly: claude → `CLAUDE_CODE_SHELL=<home>/tool-entry/bash` + `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` and no `BASH_ENV`; pi/codex/fake → `BASH_ENV=<home>/tool-entry/bash-env`; agy → `PATH` whose first entry is `<home>/tool-entry`. Bootstrap assertions on the real scope cgroup: `tools/`, `akrogon/`, `helpers/` exist after the start. Then the seat is killed and slices stopped in teardown (hc-fixture pattern). Base failure: no such argv/env/dirs — red.
3. "a bootstrap failure fails the start": same as 2 but `AKROGON_CGROUP_ROOT` points at an empty scratch dir, so the bootstrap mkdir fails; the CLI exits non-zero and the terminal is ended. Base failure: start proceeds (no bootstrap exists) — red. Traced: this case exercises the failure path through the `cgroupRoot()` indirection; the real-boundary success path is case 2.

Condition coverage:

- "acts only when exactly at the scope root": nested-bash case (already inside a `t-` → no re-placement) and outside-scope case. The exact-match condition is what keeps harness-direct children (harness itself, MCP servers) unplaced: traced — the harness never satisfies the exact match for its own shell because it is not bash-with-the-env; the negative outside case stands in.
- "never changes the command's output or exit status, including when placement fails": byte-comparison assertions per case plus the fail-open case. The violation (entry printing to stdout, or exiting non-zero) fails the byte comparison — the case fails on that violation by construction.
- "a failure there fails the start" (bootstrap): case 3.
- Atomic refresh never tears a live read: no runtime test case — the window is sub-microsecond and the mechanism is rename(2) atomicity; the test asserts both files exist complete and executable after a start. Traced reason recorded; review verifies the write-beside-then-rename shape.
- `Delegate=yes` keeps `argv[0]` as `systemd-run` (design C, feeds criterion 5): the argv assertion includes the launch argv's first word — covered in case 2.

Proof command: `akrogon run-check --name tool-entry -- bun test tests/tool-entry.test.ts --timeout=120000`. Size: minutes (hc core seats per kind). Rerun trigger: any change to `src/seat.ts`, `src/tool-cgroup.ts` entry half. The charting proofs P-entry-* (each harness honors its channel) are already recorded in `readiness.yaml` and need no re-run: the leaf changes no harness-facing channel, only which file the channel points at — the channels themselves are unchanged inputs.

### Criterion 4 — kill failure warns and the move stands

Test case in `tests/tool-kill.test.ts`: fixture leaf `tk-warn` with a fake cgroup tree under `AKROGON_CGROUP_ROOT` mirroring the leaf slice path (fake `cgroup.kill` as a *directory* so the write fails with `EISDIR`; `cgroup.events` files carrying `populated 0`; one `akrogon/t-x` reading populated to force the deferral path). Three sub-cases in one test: kill-write failure, rmdir failure (`t-` not empty in the fake tree), and helper spawn failure (a non-executable `setsid` shim first on PATH — real spawn failure with `EACCES`). Each: `akrogon phase` exits as without the kill, `state.yaml` committed, stderr carries one structured warning JSON line per failure with `leaf`, `unit`, `t-` and `error` fields, and the `tool_kill` rows carry non-empty `errors`. Care: helper pids in the fake tree parse as pid 1-ish values; the deferral spawn is the failing one so no real helper is leaked — for the populated-deferral case the failure injection is the spawn itself. Base failure: no warning lines and no rows exist at all — red on the criterion's observable (the warning).

Condition coverage: "the move stays committed", "`akrogon phase` exits as it does without the kill", "structured warning names leaf, unit, t- and error" — each asserted per sub-case. Kill, rmdir and spawn are the design's three failure kinds; all three injected.

Proof command: same invocation as criterion 1 (same file). Size: seconds. Rerun trigger: changes to the sweep's failure handling.

### Criterion 5 — recovered bare-shell seat takes the lost path

Test file `tests/recovered-seat.test.ts` on a real hc core:

1. Spawned shape, integration: `hc run --bg --keep` a plain `bash` with the leaf's seat labels; write `state.seat.A` to its address; SIGKILL the shell — hc replaces it with the machine shell (P2 shape: live, status null, `argv` rewritten to the shell, foreground a shell). Run `akrogon next <slug>`. Assert: one `seat_lost` timing row carrying the recovery evidence, the crafted terminal ended, `lost.A` is 1 in state, a replacement stand-in seat started (live, new address, systemd-run argv). Negative control in the same test: the replacement seat itself (status null possible, but launch argv `systemd-run`) is never replaced on a second `next` pass — its address stays the same and no second `seat_lost` row appears.
2. Parked shape: craft by killing the kept shell and, while the replacement is pending (or by stopping the core if construction allows), produce `pid: null, reason: signaled` — the P2-observed transient; if the transient proves too fast to catch reliably, the parked predicate is covered in the matrix below and the integration keeps the spawned shape only. Decision recorded: attempt the real transient once; the matrix is the proof of record for parked.
3. Predicate matrix (same file, synthetic `Seen` records shaped exactly on the P2 rows): positives — parked (`pid null`, `reason` `signaled`/`server_stop`/`stopped_by_restart`); spawned (`foreground.name` each of the shell set representative `bash` plus `sh`, `argv` rewritten to a shell line). Negatives — `reason: spawn_pending` (still starting), `argv[0]` `systemd-run` with a shell foreground (a normal seat mid-start), `foreground.name` `node`/`fake` (a live harness), non-null `status` (a working or idle seat), empty `argv`. Each positive true, each negative false. Base failure: the function does not exist / dispatch takes no lost path — the integration test reds on the missing `seat_lost` row and missing replacement; the matrix reds on the missing export.

Condition coverage:

- "live with null status" gate: the non-null-status negative.
- spawn_pending left alone: negative case.
- launch argv systemd-run left alone: negative case + integration negative control.
- Predicate confined to the lost branch (not liveSeat/allocate/activeCount/broadcastInProgress): no behavioral case exists — confinement is static; review verifies the single use site. Traced.
- Failed at 3 losses: the integration asserts `lost.A` increments to 1; the exact at-3 failure is the pre-existing lost-path behavior already covered by `tests/`-suite lost-seat cases (traced: this leaf changes only the branch's entry condition, not the counting).

Proof command: `akrogon run-check --name recovered-seat -- bun test tests/recovered-seat.test.ts --timeout=120000`. Size: minutes (real core, seat start). Rerun trigger: any change to `src/hc.ts` schema or `src/next.ts` dispatch.

## Serial order and restart boundaries

No wave exceeds 3 units and no shared test resource exists across units (each uses its own fixture homes; hc cores are per-test-file unique sessions). The leaf has no paid calls, no live runs and no model choices: no criterion reads as a model-choice under standing-design's line, and no fresh paid run is needed — the entry-channel evidence is recorded in `readiness.yaml` proofs and this leaf does not change the channels. If a pass is interrupted mid-test-writing, restart at the test file that has no committed red evidence yet; mid-implementation, each unit's tests independently show what remains.

## Red evidence

All three proof files were run on the base (`akrogon run-check --name <x>-red -- bun test <file>`); logs are kept in this folder's `implementation/`:

- `check-tool-kill-red4-1795601381896-3137165.log`: the criterion-1 test passes every construction step on base — both `akrogon phase` calls complete (winner commits, loser refuses), both shells self-place into `t-`s, the orphan disowns — and fails exactly on `tool_kill rows exist for the committed move` (0 rows, no relocation, nothing killed). The writer case fails exactly on criterion 2's observable: the run-check writer exits 1 (its `EPIPE` surfaces at exit-flush in Bun — probe-verified: statements after the failing write execute, so base publication is not the observable; the exit code is) rather than the command's 7. The criterion-4 test fails on zero structured warnings.
- `check-tool-entry-red3-1795601446291-3144750.log`: case 1 fails at the missing `src/tool-cgroup.ts` module; case 2 fails on the argv lacking `Delegate=yes` (the full base argv is captured in the log — `--expand-environment=no` is present and PATH comes from inheritance); case 3 fails on the start succeeding (exit 0) with no bootstrap existing.
- `check-recovered-red-1795601457931-3145864.log`: `Export named 'recoveredShellSeat' not found in module src/next.ts` — the predicate and its dispatch use do not exist.

Construction facts learned while writing the red tests, binding on implementation:

- `systemd-run --scope` supervises its payload for the unit's whole life; a test never awaits its exit and reads readiness from the scope cgroup appearing. Scope processes inherit the spawning environment (probe-verified) — no `--setenv` needed for caller env.
- A bash in a user-owned cgroup writes freely into child cgroup files and creates child cgroups without any `Delegate` (probe-verified). `cgroup.max.depth=1` on the scope root makes `mkdir tools/t-*` fail with EAGAIN deterministically — the entry test's fail-open injection.
- `cgroup.kill` is asynchronous: killed processes pin their cgroup as zombies until a parent or PID 1 reaps them, so an immediate `rmdir` of the `t-` is racy by kernel design. The sweep's `rmdir` is genuinely best-effort and `t-` removal converges over later commits; the helper's `rmdir` may retry briefly (it already waits unboundedly). Tests assert process death and `populated 0` for sweep-killed `t-`s, dir removal only for helper-killed ones.
- The concurrent-phase race passes on base exactly as designed: one call commits and prints `moved implement` with exit 0, the other exits non-zero with the illegal-move error. A post-commit hc session warning on stderr is pre-existing noise, not an exit-code factor.
- The fixture's hc shim log joins argv with tabs; `setSeat`-driven starts take ~200 ms in the fixture.
- In-scope `bash` children of a `bash script` payload keep the script shell as their parent, so a disowned orphan must go through `setsid` (probe N5's shape) to outlive its launcher.

## Implementation notes

- 2026-11-25 check.repair B: Criterion 1 in the brief requires proof that the sweep follows the state save, keeps a scope without tools/ quiet, and records the populated names. Add a failed-save case and observe those scope and timing outcomes on a real move through the existing tool-kill test command.

- 2026-11-25 implement: the agy PATH wiring prepends inside a shell (`sh -c 'export PATH=<quoted entry>:$PATH; exec "$0" "$@"'`) rather than through an env assignment — env assignments cannot self-reference and systemd-run expansion is client-side, so the assigned form dropped the terminal-inherited PATH (proven by the hc-delivery agy regressions). The D5 outcome — the wrapper first on agy's own PATH — is unchanged and criterion 3 asserts it.

### 2026-11-25 check.fix A — repair readings for the handed findings

- F1 reading: "a rmdir failure warns" reads as a warning when the removal cannot be a reaping race — the t- reads populated 0 at the failure. A populated-1 failure after a fresh kill is the kernel's asynchronous reaping (a recorded construction fact), the expected state of every best-effort removal, so warning there would make the error count meaningless noise and defeat the visibility the criterion wants; the removal converges on a later commit as designed. A persistent failure (nested cgroups, or any failure once nothing is reaping) warns on every commit until cleared. The mechanism — failure warns, move stands — is unchanged; the reading refines which failures are failures of the mechanism.
- F4 repair shape: rows route inside `appendTiming` by kind to a sibling ledger `timings-kill.jsonl`, because every older release's strict discriminated union fails the whole shared file on one unknown kind — no row shape inside `timings.jsonl` can survive rollback. The design pins row content, never the ledger file. `readTimings` additionally becomes per-line tolerant so a mixed ledger yields its valid rows (the same tolerance wakeRow already has).
- Wave grouping: F1+F5 are one unit (both own halves of `src/tool-cgroup.ts`); F2 owns `src/run-check.ts`; F4 owns `src/timing.ts` and `docs/reference/files.md`. One wave of three workers, no shared paths.

### 2026-11-25 implement A — corrections to planned tests (cited expectation corrections, not decision changes)

- `tests/tool-kill.test.ts`: the exactly-3-rows expectation contradicted design Q6 ("Every commitMove appends one timing row per enumerated seat scope") — s4 is enumerated because it holds `tools/`, so its seen-0 row is a fourth row for slug tk. Corrected to 4 in commit `1aa45c89` with the `Test-Change` trailer. This also answers the red-evidence-era open point: empty-`tools/` scopes do get rows.
- `tests/tool-entry.test.ts`: the placement regex embedded `/sys/fs/cgroup`, which `/proc/self/cgroup` output never carries — no placed shell could ever match. Corrected in `618bc97b`.
- `tests/tool-entry.test.ts`: case 1's invocation shape nested `eval "$CMD"` of a never-exported variable, so every case would record empty output and exit 0 — the byte-identical-output and exit-3 observables were unreachable as written. Corrected to a script-file invocation shape in `b9ebcf84`.

### 2026-11-25 implement A — wave regrouping under the worker protocol

The plan's W1 held U1 and U2 together while both own `src/tool-cgroup.ts` (a shared owned path). The worker protocol's shared-path rule regroups them: W1 = {U1, U3}, W2 = {U2}, W3 = {U4}. U2's wiring consumes U1's `tool-cgroup.ts` exports, so the serialization also satisfies the natural dependency. No plan decision changes.

Locked-means replacements: none.
