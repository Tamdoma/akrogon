# Design: tool-cgroup-kill

## Binding decisions, verbatim

### Seed decision (Tamdoma/akrogon#157), from forks/seed-decision.md


#### Operator decision (Ivan Juras, 2026-11-24)

- Fix this in akrogon/hc, not with a watch-side kill permission: a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running.
- Leftover seat shells end when the leaf's phase advances.
- Not in scope: granting the watch permission to kill seat shells as the workaround.

seed decision from Tamdoma/akrogon#157, taken at import on 2026-11-24, not asked, decided by ivanjuras

Reason: not stated. Alternatives: not stated.

### Signposts, from forks/signposts.md


A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Tool cgroup kill, from forks/tool-cgroup.md


A's autopilot pick, 2026-11-25. Not operator words. Revised after the final-shape check (slots/tool-cgroup-final-check-{B,C,D}.md), marked [R], and again after the second check (slots/tool-cgroup-final-check2-{B,C,D}.md), marked [R2]. The [R2] lines adopt the checkers' own fixes for placement and cleanup and add no mechanism, so no third check runs.

- Q1 a, with deferred kills for tool shells that have an akrogon call in flight.
  - Each top-level tool shell gets its own `<seat scope>/tools/t-<pid>-<starttime>`.
  - [R] Every akrogon process except the helper relocates (Q2) into `<seat scope>/akrogon/<t-name>/`, creating it if absent. The name is the `t-` it started in, or the inherited `t-` env marker when it starts in an `akrogon/` dir (an akrogon started by akrogon).
  - [R] commitMove, after the move is saved, enumerates the moved leaf's seat scopes (Q6). For each `t-`:
    - if `akrogon/<t-name>` is unpopulated, it writes `t-/cgroup.kill` now.
    - if it is populated (an akrogon call from that tool shell is in flight, the caller's or a concurrent sibling seat's), it spawns one detached helper, unless [R2] `<seat scope>/helpers/<t-name>/` is already populated, that waits, with no timeout, for the tool shell (pid plus start time from the `t-` name) to end, then writes `t-/cgroup.kill` and removes the `t-` best effort.
    - [R2] The helper lives in the sibling `helpers/<t-name>/`, never under `akrogon/<t-name>/`, because `populated` counts descendants (F8). commitMove creates that directory and writes the helper's pid into it before it returns, under the home lock, so the next commit's test is exact (C, D second checks).
    - "Ended" means `/proc/<pid>/stat` absent, start time changed, or state `Z` or `X` (C D2: a harness reading stdout to EOF before reaping leaves the shell a zombie).
  - [R] The helper is an akrogon subcommand with stdin, stdout and stderr on `/dev/null`, its own session and no handle held by its parent (C M1: an inherited pipe deadlocks the tool call). It reads `/proc` through the existing proc-root boundary and appends its own timing row (Reporting). At most one helper waits per `t-`.
  - [R2] The helper is exempt from Q2 relocation and is spawned without the `t-` env marker. It takes the repo, leaf and `t-` path as arguments and skips the state-home migration step (B, C second checks).
  - A move from outside any seat (operator, merge) finds no populated `akrogon/<t-name>` of its own, so it behaves the same way: it kills now or defers per `t-`.
  - Killed empty `t-` dirs are removed best effort. [R2] commitMove also removes, best effort, every unpopulated `akrogon/<t-name>/` and `helpers/<t-name>/` whose `t-` is gone (B, C, D second checks). A kill, rmdir or spawn failure warns with structured fields and never fails the committed move.
  - Reason:
    - The operator sentence is "Leftover seat shells end when the leaf's phase advances" (seed decision). Pure a leaves the caller's same-command child alive, and F3 shows that child stalls delivery exactly like the incident when the same seat owes the next phase.
    - [R] Deciding by `akrogon/<t-name>` population removes the caller-identity question as a class. Concurrent sibling phase calls at check.review (B check), akrogon-from-akrogon chains (D check 4a) and cross-leaf callers (C D1, D check 4b) all fall out. A cross-leaf caller's `t-` is never in the moved leaf's scopes. The read is the kernel's `populated` flag on a directory akrogon minted, not a process census.
    - The helper waits on one known identity and never selects a process. It has no timeout (F4: phaseWake can run about 75 s).
    - [R] If a helper dies before its write, that `t-` survives until another seat's move or leaf close. When the masked seat owes the next phase and no other seat moves, only leaf close ends it, which is the pure-a stall. The helper narrows that case to a helper crash (B check).
    - Per-shell cgroups end earlier leftovers inside commitMove, and new-phase shells get new `t-` dirs, so a kill never reaches a shell of the next phase. That answers C's cross-phase race on one shared `shells/`.
  - Rejected:
    - b (one `shells/` with a helper): the seat's earlier leftovers wait on the caller, and a slow helper can kill a new-phase shell in the shared cgroup (C).
    - c: the phase call dies on its own result (D E5a).
    - Pure a: F3.
  - Standing dissent: C holds pure a and accepts the F3 case as a recorded residual.
- Q2 a. Every akrogon CLI process whose `/proc/self/cgroup` is a `tools/t-*` relocates into `<seat scope>/akrogon/<t-name>/` at startup, before any lock, record or capture ([R] per-`t-` directory, Q1). `checkedRun` calls the same idempotent step for direct library calls (C).
  - [R] `checkedRun` publishes its result (kept file, `check_end` timing, capture unlink) before it echoes stdout and stderr, and it ignores `EPIPE` on both, including the final summary write. Otherwise the killed `t-` closes the echo pipe and Bun exits on `EPIPE` before unlinking the captures, recreating old review F2 (C M2, C Probe B).
  - Reason: one rule covers run-check writers, phase, verify and later commands, and the process leaves before it publishes anything (signpost 3a). A kill landing between spawn and relocation loses only a command that has published nothing.
  - Rejected b: verify and later long commands would rediscover F2 of the old review.
- Q3 a, per kind with no shared base layer. akrogon owns the entry at a stable akrogon home path (outside release dirs). [R] It has two forms:
  - a sourced script for `BASH_ENV`, which always returns 0 and never execs or exits;
  - an executed `bash` wrapper that runs the same placement and then execs the absolute real bash (never a PATH lookup, C M3b).
  - [R] `startSeat` refreshes both by writing beside the target and renaming over it, so a live seat never reads a torn file (C M3c, D check 5).
  - Wiring per kind:
    - claude: `CLAUDE_CODE_SHELL=<entry dir>/bash` plus `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`.
    - pi and codex: `BASH_ENV=<sourced script>`.
    - agy: `PATH=<entry dir>:$PATH`.
  - Placement acts only when the current cgroup is exactly the seat scope root named by an akrogon env marker set by `startSeat`. It then mints the `t-`, moves in and exports the `t-` path. Anywhere else it does nothing. It discards its own output and never fails the shell.
  - Reason: these are the observed entry channels (F5). `BASH_ENV` on claude would place hooks and MCP children (F5). claude's own tool cgroup must be off or it can pull shells out of `tools/` (F5).
  - Rejected b (`BASH_ENV` only): it does not reach agy's PATH spawn and widens claude's kill set. Rejected c (`CLAUDE_CODE_SHELL_PREFIX`): it wraps stdio MCP launches.
- [R] Seat bootstrap. `startSeat` creates `<seat scope>/tools/`, `akrogon/` and [R2] `helpers/` once the scope-entry proof sees the harness inside the scope, and a failure fails the start (C M3a, D check 3). Q6 then sees every seat scope even when entry never fires. [R2] The entry also creates `tools/` if absent before minting, so a first tool shell that beats bootstrap is still placed (D second check).
- Q4 `-p Delegate=yes` on the seat scope.
  - Reason: F6. The only failure it guards against is silent, and the flag costs nothing observed.
  - Rejected none: B's loud-failure premise does not hold under a never-fail entry (B and D rebuttals).
- Q5 uniform. Everything descended from a tool shell ends at advance, including a seat-started `ssh-agent` or dev server. Harness-direct children (codex `node_repl` and `codex-code-mode-host`, MCP servers) survive by placement. The brief states this.
  - Reason: no process is read to decide (signpost 1a). Each phase is self-contained.
  - Rejected narrow entry: a parent test at spawn is a selection rule again.
- Q6 enumerate. At kill time, list the moved leaf's slice cgroup (`sliceCgroup(leafSlice(...))`) and act on every child scope that holds a `tools/` directory, including scopes of seats replaced by the lost path.
  - Reason: no state schema change, which keeps rollback safe (F7). No hc call or harness liveness is needed. It cannot race seat creation under the home lock (F7). The `tools/` filter needs no unit-name pattern. Slot attribution for reporting may parse the unit name, never for selection.
  - Rejected: a recorded unit field (F7 rollback hazard), and hc harness-pid resolution (fails when the harness is dead).
- Reporting [R]:
  - Every commitMove appends one timing row per enumerated seat scope: leaf, unit, [R2] the count of `t-` dirs seen, the `t-` dirs that read populated before the write (report only, never acted on), the deferred `t-` dirs and errors. A scope that keeps showing zero `t-` dirs seen while its seat works is the visible sign that entry stopped firing (C D3, D check 2).
  - Each helper appends one row when it writes or fails.
- Recovered bare-shell seat (issues/chart/seat-turn-idle/forks/shell-sweep.md Taken Q3 a with its final-shape correction, uncontested by review-B):
  - A seat terminal is lost when it is `live` with `status` null and either shape holds.
    - Parked: `pid` null and `reason` set and not `spawn_pending`.
    - Spawned: `foreground.name` in {sh, bash, dash, zsh, fish, ash, ksh, nu} and [R] a non-empty launch `argv` whose first word is not `systemd-run` (C D4, D check 1).
  - Dispatch takes the existing lost-seat path in `src/next.ts:dispatchSlot`. `src/hc.ts:terminalSchema` gains `argv`, `reason` and `foreground.name`, and the predicate is used only in that lost branch. `Delegate=yes` keeps `argv[0]` as `systemd-run` (C).
- Residuals, recorded and not fixed here:
  - Seed-decision F1: a shell started after the seat's own phase call, and a masked silent end with no advance, still have no wake.
  - Shells the entry misses (`/bin/sh -c`, a non-bash login shell for codex, a harness update that changes its spawn) escape until leaf close. The timing row shows it.
  - Seats started before the leaf lands have no env marker and stay unplaced until replaced (B check).
  - [R] An akrogon process caught by a kill before it relocates (it spawned during another commit's write) dies with its tool shell. It has published nothing, and the harness reports a killed call.
  - Entry is observed in print mode for all four harnesses (Charting proofs P-entry-*), not in interactive seats. The gate fails safe, so a miss in a live seat keeps pre-leaf behaviour and shows in the timing row.

#### Final-shape checks, 2026-11-25

- Check 1 (slots/tool-cgroup-final-check-{B,C,D}.md): all three found defects. Adopted into [R]: concurrent sibling phase calls (B), caller identity across chains and leaves (C D1, D 4), zombie shells (C D2), helper stdio (C M1), run-check publish order and `EPIPE` (C M2), entry forms and atomic refresh (C M3, D 5), bootstrap (C M3a, D 3), reporting (C D3, D 2), the bare-shell `argv` guard (C D4, D 1), and B's reason-line correction.
- Check 2 (slots/tool-cgroup-final-check2-{B,C,D}.md): helper placement, relocation exemption, directory creators and cleanup, and the seen count. All were adopted as [R2], using the checkers' own fixes. B cleared the population rule against the concurrent-caller case.

- Leaf review (slots/leaf-review-{B,C,D}.md): B, C and D reviewed the draft as implementers. Every item was adopted into the leaf, tagged, except D7 (the helper moving itself), which would reopen the window closed in check 2. Verified while reviewing (B): `scopeEntry` suffix match, the `observeBusy` clear, the bare-shell turn ordering, and the hc 0.1.22 fields.

### Exclusions

- Out of this leaf, per the decision's `Not in scope:`: no watch-side permission to kill seat shells.
- Out of this leaf, per seed-decision Findings F1 and CHART.md Off route: no periodic listener wake and no delivery-time kill.
- Out of this leaf, per the tool-cgroup Taken: consultant and direct-reviewer terminals (`src/seat.ts:launch`) get no entry wiring and no tool cgroups. They are not leaf seats.

### Standing design

Installed path: /home/ivan/.akrogon/releases/a118b2ff346f42d4ab826eab359743a9eecc00f9/skills/chart-issues/assets/standing-design.md. How it applies here:
- Each done-criterion is proven by an own test at the real boundary. Throwaway user scopes are free and writable as the user (`systemd-run --user --scope`; map evidence B P-b, D E1 to E3), so the kill, placement, deferral and relocation tests run real processes in real cgroups. Path logic that needs a fake tree uses `AKROGON_CGROUP_ROOT` and `AKROGON_PROC_ROOT` (`src/scope.ts:cgroupRoot` and `procRoot`).
- There is no paid call, live run or end-to-end run in the leaf. The key parts resting on outside tools are reached by charting proofs: P-entry-claude, -codex, -pi and -agy (each harness honours its channel and its tool shell lands in a `t-`), and the carried P1 and P1b (claude flips to `done` when its shell dies by SIGKILL). P2 shaped the hc recovery records.
- The bug-fix rule applies: criteria 1, 4 and 5 fail on the current base and pass after. Criteria 2 and 3 are asserted in criterion 1's scenario or beside it, so they fail on the base through the missing kill or the missing placement.
- No new machinery for tests: they reuse the repo's fixture helpers. Throwaway scopes are stopped and checked gone in each test's cleanup.

## Held disagreements

- Not a decision, the decision stands. It is against the decision's first sentence ("a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running").
  - Fact: hc cannot tell an ended turn with a shell from a working turn with one (P1), and the listener has no timer (`src/listen.ts:listenCommand`).
  - Consequence: a shell started after the seat's own phase call, or a turn that ends without a phase call while a shell runs, still masks the seat with no wake. The 1 h busy notice does not post either.
  - Raised by A (forks/seed-decision.md `## Findings` F1). State: unanswered, recorded under autopilot.
- Not a decision, the decision stands. It is against the kill reaching every masking process.
  - Fact: codex keeps `node_repl` and `codex-code-mode-host` as direct children at the scope root (P3), and codex masking is unobserved.
  - Consequence: if codex masks through those helpers, the kill never unblocks a codex seat.
  - Raised by D in the earlier chart. State: unanswered.

## Leaf architecture

Changed lines after the leaf review (slots/leaf-review-{B,C,D}.md) carry slot tags.

- Owned surfaces:
  - `src/seat.ts:startSeat`:
    - `-p Delegate=yes` in the scope argv.
    - The seat marker env: the seat scope's absolute cgroup path, from `src/scope.ts:sliceCgroup` and the unit.
    - The entry env per harness kind (claude, pi, codex, agy as in Taken Q3). Every other configured kind gets `BASH_ENV` with the sourced script, which fails safe when the kind's shell is not bash (D).
    - Atomic refresh of the entry files: write beside the target, then rename over it.
    - Bootstrap of `tools/`, `akrogon/` and `helpers/`. `src/seat.ts:scopeEntry` changes to tell three outcomes apart: entered, exited, and outside. Bootstrap runs only on entered. A harness that already exited still falls through to `firstTask` and its failed outcome, as `tests/hc-start.test.ts` "a seat that exits fails the start with its address" expects. A bootstrap failure on an entered scope ends the terminal and throws, like the outside refusal (C).
  - The entry files under `src/config.ts:homePath` (always `AKROGON_HOME` or `~/.akrogon`), not `globalHome`, which can resolve to a release dir (C):
    - a sourced script for `BASH_ENV` that always returns 0;
    - a `bash` wrapper that runs the same placement and execs `/usr/bin/bash`.
    - Open for the plan: where the source text lives in the repo (a TS module holding the text, or files under `src/`), and whether the real bash path is resolved at `startSeat` instead of fixed.
  - CLI startup in `src/akrogon.ts`: the relocation step runs after `parseArgs` and the `--help` exit, immediately before `migrateStateHome`, so help stays side-effect free (`tests/cli-help.test.ts`) (C).
    - It reads self's cgroup through `procRoot()`, as `src/admission.ts:callerScope` does (D).
    - A process whose cgroup is a `tools/t-*`, or an `akrogon/` dir with a `t-` marker in env, moves itself into `<seat scope>/akrogon/<t-name>/` (created if absent) and keeps its starting `t-` path.
    - The helper verb is exempt. `src/run-check.ts:checkedRun` calls the same idempotent step.
  - `src/phase.ts:commitMove`: the kill is attempted once the move is saved, independently of follow-up and log failures. It sits inside the existing `finally` beside `logMove` and the `visit_start` row, not after a step that can throw `MoveCommittedError` (D, B). The kill never throws and warns with structured fields, following `renameTab`'s warning.
  - A kill module beside `src/scope.ts`. All reads go through `cgroupRoot()` and `procRoot()`. It has these functions:
    - Enumerate the seat scopes under `sliceCgroup(leafSlice(repo, slug, homePath()))` that hold `tools/`. A missing slice directory and a scope without `tools/` give an empty result, not a warning (D).
    - Per `t-`, kill now or spawn a helper.
    - Remove empty `t-`, `akrogon/<t-name>/` and `helpers/<t-name>/` dirs best effort.
    - Return per-scope results for the timing rows.
  - The helper is an internal verb in `src/akrogon.ts`, left out of `src/usage.ts:VERB_OPTIONS` like `verify-pass` (C).
    - It takes positional args: repo name, repo root, slug, unit and the `t-` path. It calls neither `readGlobal` nor `readRepo`, and it skips `migrateStateHome` (C).
    - commitMove spawns it with `process.execPath` and the running `akrogon.ts` path, as `src/verify.ts` and `src/land.ts` do. Spawn settings: stdio on `/dev/null`, its own session, no handle held by the spawner, and no `t-` marker in env (C).
    - commitMove creates `helpers/<t-name>/` and writes the helper's pid into its `cgroup.procs` before it returns, under the home lock, so the next commit's populated test is exact (Taken [R2]). `ESRCH` on that write means the helper already exited, and its own timing row records how. It is not a warning.
      - D's leaf review asked for the helper to move itself instead. That is not taken: it reopens the spawn-to-move window that check 2 closed (C, D second checks).
    - The helper polls `<procRoot>/<pid>/stat` for the shell named by the `t-`: gone, start time changed, or state Z or X. Then it writes `cgroup.kill`, removes the `t-` best effort, appends its timing row and exits.
  - `src/run-check.ts:checkedRun`: publish the kept file, the `check_end` timing and the capture unlink before writing stdout and stderr, and ignore `EPIPE` on those echo writes. `src/run-check.ts:runCheck` only ignores `EPIPE` on its summary line and needs no reorder, because it runs after the publish (B).
  - `src/timing.ts`: a `tool_kill` row kind with leaf, unit, seen count, populated, deferred and errors, and a `tool_kill_deferred` row kind for the helper's result. Open for the plan: one kind with a field instead of two, whichever `readTimings` and `src/timing-report.ts` handle with less change.
  - `src/hc.ts:terminalSchema` and `Seen` gain `argv`, `reason` and `foreground.name`. hc 0.1.22 exposes all three (`hc schema`, B). An absent field reads as no match, so on an older hc only the parked shape can fire (B).
  - `src/next.ts:dispatchSlot` gets the lost-branch predicate.
  - `docs/reference/files.md`, which lists every `timings.jsonl` kind, and `src/AREA.md`, which documents the kill module, the helper verb and the changed `startSeat` and `commitMove` behaviour (D).
- Literal interfaces:
  - Seat marker env `AKROGON_SEAT_CGROUP=<absolute seat scope cgroup path>`. Tool marker env `AKROGON_TOOL_CGROUP=<absolute t- path>`, exported by the entry. The names may change in the plan if kept consistent across entry, relocation and helper.
  - `t-` name: `t-<pid>-<starttime>`, where starttime is `/proc/<pid>/stat` field 22.
- Test reach: real-boundary tests create throwaway scopes by spawning the absolute `systemd-run` path with `src/scope.ts:sessionBusEnv`, because the fixture PATH puts fake `systemd-run` scripts first. They run inside the fixture home's unique leaf slice. When no user manager answers, they fail and never skip (D). The repo's `test` script already runs inside a real user scope (`package.json`, B).
- Consumers of changed state:
  - `src/seat.ts:scopeEntry` matches by full-path suffix (`cgroup.endsWith(scope)`), and the harness stays at the scope root, so `tools/` children do not disturb it (B). Open for the plan: whether `src/seat.ts:cgroupOf` should read through `procRoot()` for tests (C).
  - `src/admission.ts:callerScope` takes the last `.scope` segment of self's cgroup for run records and verify rows. Relocation into `akrogon/<t-name>/` keeps that segment, so it is unchanged. The relocation test asserts it (D).
  - `src/reconcile.ts` stops the leaf slice at close, which removes the hand-made dirs (map evidence B P-d, C Obs 3). Unchanged.
  - `src/next.ts:dispatchSlot` relies on the seat's hc status. After the kill, claude reports `done` and advances `turn` (P1b), and the existing listener `turn` wake runs the pass. A deferred kill fires when the tool shell ends, and claude's flip follows it. `src/next.ts:observeBusy` clears `busy_since` on the first non-working observe, so no false busy notice posts (B).
  - `src/run-check.ts` captures and `abandonedCaptures`: the reordered publish keeps the capture pair's lifetime inside the writer, which now survives its tool shell.
- Recovered-shell predicate: one function over `Seen`, used only in `dispatchSlot`'s lost branch. It must not go into `liveSeat`, `allocate`, `activeCount` or `src/reconcile.ts:broadcastInProgress` (tool-cgroup Taken, carried from the earlier Q3).
  - The silent-end branch reads `prompted.turn < seat.turn`. A recovered terminal resets `turn` to 0, so it falls through to the lost branch (verified, B).
- Exclusions:
  - hc itself.
  - herdr-app's keep setting.
  - Consultant and direct terminals (`src/seat.ts:launch`).
  - Seats started before this leaf lands: they have no marker and stay unplaced until replaced (residual in Taken).
