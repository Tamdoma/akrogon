# Tool cgroup kill: how leftover seat shells end at phase advance

## Question

The map settled the mechanism class: tool shells are placed at spawn into cgroup(s) under the seat's systemd scope, and phase advance ends them with `cgroup.kill` writes (slots/map-merged.md). These questions shape the leaf contract.

- Q1 Granularity and the caller. A seat's `akrogon phase` runs as a child of a tool shell. Which shape?
  - a. One cgroup per tool shell (`<seat scope>/tools/t-<id>`). commitMove writes `cgroup.kill` on every populated `t-*` of every recorded seat except the caller's own, read once from the caller's own cgroup. The tool call returns normally. A background child started in the same tool command as the phase call survives this advance.
  - b. One `shells/` cgroup per seat. commitMove starts a detached helper outside the seat scope that waits for the caller's tool shell to exit, then writes `shells/cgroup.kill` (seats other than the caller's can be killed at once).
  - c. One `shells/` cgroup per seat, killed in commitMove including the caller's tool shell. The harness sees the phase tool call killed.
- Q2 akrogon's own processes. Which akrogon processes leave the tool cgroup?
  - a. Every akrogon CLI process that starts inside a tool cgroup moves itself out (to a seat-scope child such as `akrogon/`) before it writes any record or capture.
  - b. Only the run-check writer moves out, at the start of `checkedRun`.
- Q3 Harness entry. How does each harness's tool shell get placed?
  - a. One akrogon-owned wrapper, wired per harness kind in `startSeat`: claude `CLAUDE_CODE_SHELL=<wrapper named bash>`, pi and codex `BASH_ENV=<wrapper>`, agy a `PATH` entry whose `bash` is the wrapper. The wrapper acts only when its process sits exactly in the seat scope root named by an akrogon env marker.
  - b. `BASH_ENV` only, for every harness.
  - c. Per-harness native settings (claude `CLAUDE_CODE_SHELL_PREFIX`, pi extension), no shared wrapper.
- Q4 Delegation. Add `-p Delegate=yes` to the seat scope, or create child cgroups without it?
- Q5 Width. Does everything descended from a tool shell end at advance (a seat-started `ssh-agent`, dev server, a shell under a helper), with harness-direct children surviving by placement? Or only shells whose parent is the harness or another tool shell (a parent test at spawn)?
- Q6 Seat scope lookup at kill time. Record the seat's scope unit (or cgroup path) in the seat record at `startSeat`, or resolve it each time from hc's harness pid or the leaf slice directory?

### Carries

- Locks: forks/seed-decision.md `## Taken` (operator decision on Tamdoma/akrogon#157: "Leftover seat shells end when the leaf's phase advances"; not in scope: a watch-side kill permission). forks/signposts.md `## Taken` (A's picks: 1a remove over guard, 2a free tests, 3a fewest moving parts, 4a fewest leaves, 6a no migration step).
- Context, not locks: issues/chart/seat-turn-idle/forks/shell-sweep.md `## Charting proofs` (P1, P1b claude flips to done when its background shell dies by TERM or KILL; P2 hc keep recovery shapes; P3 codex holds node_repl and codex-code-mode-host as direct children) and its Q3 recovered-shell answer, which no review contested.
- Failure record: issues/open/seat-turn-idle/shell-sweep/review-B.md F1 to F12.
- Operator corrections: none.

## Findings

Map: slots/map-merged.md. Notes: slots/tool-cgroup-{A,B,C,D}.md, merged slots/tool-cgroup-merged.md, rebuttals slots/tool-cgroup-rebuttal-{B,C,D}.md, final-shape checks slots/tool-cgroup-final-check-{B,C,D}.md and -final-check2-{B,C,D}.md (2026-11-25).

- F1 Kill primitive. `cgroup.kill` on a child cgroup of a scope ends a forking tree, its `setsid` orphans and children forked during the write, leaving siblings and the scope root alone (B P-a, C Obs 1-2, D E3, N2). It succeeds on an empty cgroup (D N1). A killed empty `t-` rmdirs, a populated one gives EBUSY (D N3). Writing your own cgroup's kill kills you (D E5a). Kernel doc: protected against concurrent forks and migrations.
- F2 Placement. Entry mints `tools/t-<pid>-<starttime>`, moves the shell in, and a nested bash stays in it. An orphan stays after its shell exits and dies with the `t-` (D N5). A process can move itself to a sibling cgroup and survive (C Obs 6). The leaf slice root refuses members (EBUSY, B P-c).
- F3 Caller survivor (rebuttal question). Under per-shell cgroups that spare the caller, a long-lived child started in the same tool command as the phase call stalls delivery when the harness masks on background shells (claude, P1/P1b) and the caller's slot is seated in the advanced-to phase. No `turn` event fires and the next advance needs that seat (B, C, D agree on the case split). It does not stall when the child ends by itself, the move goes to `merged`, `failed` or merge, another caller commits a further move, or the harness does not mask.
- F4 Deferred kill. A process in `<seat>/akrogon/` spawned a `setsid` detached helper that polled the tool shell's pid plus start time and wrote that `t-`'s `cgroup.kill` after the shell exited. The `t-` emptied and the harness-side process lived, with no systemd unit and no bus call (D R1). `phaseWake` and `mergeWake` run inside the `akrogon phase` process after commitMove for up to about 75 s (C, `src/akrogon.ts` case `phase`), so any wait that ends in a kill must have no timeout.
- F5 Harness entry, paid under standing grant 3b via run-check holder `direct/`:
  - P-claude (claude 2.1.332): `CLAUDE_CODE_SHELL=<file named bash>` was hit for the env probe, the `-c -l` snapshot and the Bash tool call.
  - P-codex (0.172.0 exec): `BASH_ENV` fired and a `PATH`-shadowed `bash` was never hit.
  - P-pi (1.6.0 print): `BASH_ENV` fired and the bash tool ran.
  - P-agy (1.5.16): OAuth demanded inside the payload, so no tool ran. C's live ps shows agy spawning bare `bash -c` through PATH.
  - claude 2.1.332 opts its own tool-memory cgroup out on `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`. Without it, claude can write `subtree_control` and late-attach tool shells to its own cgroup (C binary read).
  - With `BASH_ENV` set, claude's hooks and MCP `bash -c` children at the scope root would also be placed and killed (C, D).
- F6 Delegation. Nothing observable differs on systemd 262, including `set-property` on a live scope with a populated child (B probe D, D R2). v262 `cgroup.c` prunes unit subtrees only at stop or on request (B source read). `Delegate=yes` is systemd's documented promise to leave the subtree alone. The entry contract never fails loudly, so a mid-life rearrangement would be silent.
- F7 Lookup. `src/state.ts:seatRefSchema` is a `z.strictObject`, so a new seat field makes state unreadable to an older release after rollback (C, D verified). `phaseCommand`, `nextCommand`, `phaseWake` and `seatCommand` all hold the home `.lock`, so enumeration cannot interleave with `startSeat` (C, D verified). Run scopes and guard services have no `tools/` directory.
- F8 Final-shape checks. An exited, unreaped shell keeps `/proc/<pid>/stat` with its start time in state `Z` (C Probe A). Bun exits 1 on `EPIPE` when stdout's reader is gone (C Probe B). `cgroup.events` `populated` is hierarchical, so a parent reads 1 while only a child holds a process (C Probe C).
- Convergence after rebuttals: every slot holds Q1 per-shell cgroups (B and D add the deferred caller kill, C keeps pure a and rejects b on F4), Q2 a, Q3 per kind without a `BASH_ENV` base layer (D withdrew it), `Delegate=yes`, uniform width, and enumeration.

## Charting proofs

All on this host 2026-11-25: kernel 7.2.15-5-omarchy, systemd 262, cgroup2fs, GNU bash 5.3.20, hc 0.1.22. Identity: local user ivan, plus the operator's logged-in harness accounts for paid runs. Paid runs went through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/direct` under standing grant 3b. The budget was `timeout 200` per harness inside direct/probe-entry/probe.sh and one short prompt with one shell tool call, because one tool call reaches the property.

- E-free kill and placement (free, own throwaway user scopes, all stopped and verified gone): B P-a to P-d, C Obs 1-6, D E1 to E6, N1 to N5, R1, R2 (slots/map-{B,C,D}.md, slots/tool-cgroup-{B,C,D}.md, slots/tool-cgroup-rebuttal-D.md). They show:
  - `cgroup.kill` of a child cgroup ends a forking tree and its `setsid` orphans, and leaves siblings alone.
  - Kill on an empty cgroup succeeds. A killed empty dir rmdirs, a populated one gives EBUSY.
  - The self-kill and self-freeze hazards.
  - Child cgroups and moves work with and without `Delegate=yes`, and `set-property` on a live scope leaves a populated child alone.
  - `systemctl stop` removes hand-made child cgroups.
  - `BASH_ENV` fires for `bash -c`, `-lc` and `-l -c`, not for `/bin/sh -c`.
  - A detached helper in a sibling cgroup waits on pid plus start time, then kills.
  - Limits: no manager reload or reexec.
- E-free zombie, EPIPE, populated (free): C Probe A (an unreaped child keeps `/proc/<pid>/stat` with its start time in state Z), Probe B (Bun exits 1 on `EPIPE` to a closed stdout reader), Probe C (`populated` is hierarchical) (slots/tool-cgroup-final-check-C.md, -final-check2-C.md). Cleanup: reaped, removed and checked by C. Limits: one kernel, one Bun.
- E-free entry self-test (free, A):
  - Command: `systemd-run --user --scope --unit=probeA-entry-<pid>`, then `BASH_ENV=direct/probe-entry/place.sh bash -c` with a nested `bash -c`, `direct/probe-entry/shim/bash -c`, and `/bin/sh -c`.
  - Result: the `BASH_ENV` shell and the wrapper shell each landed in their own `tools/t-<pid>-<start>`, the nested bash stayed in its parent's `t-`, and `/bin/sh -c` stayed at the root.
  - Cleanup: kill, rmdir, and the unit was gone (`list-units` 0).
  - Limits: probe entry script, not the leaf's asset.
- P-entry-claude (paid): run `check probeA-entry-claude: 0`, log direct/check-probeA-entry-claude-1795595618250-878058.log.
  - claude 2.1.332, `claude -p --model haiku --effort low --dangerously-skip-permissions`, env `CLAUDE_CODE_SHELL=<probe-entry>/shim/bash CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`, marker set to the run scope root.
  - Prompt: one command `(sleep 150 >/dev/null 2>&1 &); sleep 3; cat /proc/$$/cgroup`.
  - Result: the wrapper ran the tool command, its shell was placed in `tools/t-878395-7055064`, and 3 s later the shell still read that `t-` (no late attach with the memory limit off). After claude exited, the `t-` held the orphan `sleep` (populated 1). One `tools/cgroup.kill` left populated 0. The snapshot shells were placed in their own `t-` dirs and had exited.
  - Cleanup: tools removed, run scope ended by run-check.
  - Limits: print mode, not an interactive seat; the marker named the run scope root instead of a seat scope root; claude without the memory-limit setting was not compared.
- P-entry-codex (paid): run `check probeA-entry-codex: 0`, log direct/check-probeA-entry-codex-1795595634720-878605.log.
  - codex-cli 0.172.0 `exec --skip-git-repo-check -m gpt-6.2-sol -c model_reasoning_effort=low -s danger-full-access` (the seat sandbox), env `BASH_ENV=<probe-entry>/place.sh`.
  - Result: codex ran `/usr/bin/bash -lc '<command>'`, and the tool command printed its own shell's cgroup as `tools/t-878666-7055686`.
  - Cleanup: tools removed by the driver, run scope ended.
  - Limits: exec mode, not an interactive seat. The driver's post-run listing was cut from the captured tail, so the tool command's own output is the observation.
- P-entry-pi (paid): run `27877497-e515-4da9-907b-324fb3ae676f` (`check probeA-entry-pi: 0`), log direct/check-probeA-entry-pi-1795595656644-879868.log.
  - pi 1.6.0 `-p --model devin/swe-2-1-max --thinking low`, env `BASH_ENV=<probe-entry>/place.sh`.
  - Result: the tool shell was placed in `tools/t-881459-7058825` and printed it. After pi exited, that `t-` held the orphan `sleep` (populated 1). The kill left populated 0.
  - Cleanup: tools removed, run scope ended.
  - Limits: print mode.
- P-entry-agy (paid): run `21af38f1-635e-436d-907d-19d9f3d4da24` (`check probeA-entry-agy5: 0`), log direct/check-probeA-entry-agy5-1795595725424-888875.log.
  - agy 1.5.16 `--model "Gemini 3.8 Flash (Low)" --dangerously-skip-permissions -p`, env `PATH=<probe-entry>/shim:$PATH` plus `DBUS_SESSION_BUS_ADDRESS` and `XDG_RUNTIME_DIR` (run-check strips them, and agy needs them for its login).
  - Result: agy ran `bash -c '<command>'` through the PATH wrapper, which placed it in `tools/t-889362-7065692`, and the tool command printed that `t-`. After agy exited, the `t-` was empty (agy ended the orphan itself).
  - Earlier attempts ran no tool, so they give no conclusion: agy, agy2, agy3 and agy4 failed on my flag order and model names (`-p` swallowed `--model`; `neon` and `--effort` are not accepted in print mode). D's P-agy (OAuth without the bus) also gave none.
  - Cleanup: tools removed, run scope ended.
  - Limits: print mode with a different model than the seat's `neon`; agy's own cleanup of tool process groups was not studied.
- Carried (context): issues/chart/seat-turn-idle/forks/shell-sweep.md `## Charting proofs` P1 and P1b (claude flips to `done` when its background shell dies by TERM or SIGKILL), P2 (hc keep recovery shapes), P3 (codex direct helpers).

## Taken

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

### Final-shape checks, 2026-11-25

- Check 1 (slots/tool-cgroup-final-check-{B,C,D}.md): all three found defects. Adopted into [R]: concurrent sibling phase calls (B), caller identity across chains and leaves (C D1, D 4), zombie shells (C D2), helper stdio (C M1), run-check publish order and `EPIPE` (C M2), entry forms and atomic refresh (C M3, D 5), bootstrap (C M3a, D 3), reporting (C D3, D 2), the bare-shell `argv` guard (C D4, D 1), and B's reason-line correction.
- Check 2 (slots/tool-cgroup-final-check2-{B,C,D}.md): helper placement, relocation exemption, directory creators and cleanup, and the seen count. All were adopted as [R2], using the checkers' own fixes. B cleared the population rule against the concurrent-caller case.
- Leaf review (slots/leaf-review-{B,C,D}.md): B, C and D reviewed the draft as implementers. Every item was adopted into the leaf, tagged, except D7 (the helper moving itself), which would reopen the window closed in check 2. Verified while reviewing (B): `scopeEntry` suffix match, the `observeBusy` clear, the bare-shell turn ordering, and the hc 0.1.22 fields.
