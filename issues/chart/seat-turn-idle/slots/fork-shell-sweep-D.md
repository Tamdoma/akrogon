# Fork notes: shell sweep, slot D

Blind notes on forks/shell-sweep.md section "Question". New probes run free on 2026-11-25: census of live seats via `hc get` plus `/proc` children and scope `cgroup.procs`; a throwaway hc core (own session and runtime dir) where I SIGKILLed a kept terminal's program and later stopped the core, then killed, removed, and deleted all of it. No paid harness launched.

Facts added by the census (used in Q2): a resting codex seat (`fw-close-lost-stop-b`, status `done`) holds three persistent non-shell helpers in its scope: two `node_repl` processes and `codex-code-mode-host`, all children of the codex pid. A working claude seat holds one direct child, a snapshot bash (`/usr/bin/bash -c source ~/.claude/shell-snapshots/...`), with its own subtree under it. Working pi seats held no children at census time; one pi seat earlier showed `pi -> bash -> bun` mid tool call. Agy seats showed no children (mid-shell shape unobserved).

## Q1. When and where leftover shells end

### 1. Pick: c, both. Advance sweep in commitMove, delivery sweep in dispatch after a quiet period.

Reason: the advance sweep fixes the seed case at the moment it forms and runs with guaranteed ordering against the move's own writes, if placed after the move log append at the end of `commitMove`, warn-only on any hc failure. It cannot kill the caller's `akrogon phase` process mid-follow-up because that process is the sweeper, and ancestry sparing keeps its tool shell alive until it exits on its own seconds later. The delivery sweep closes what the advance sweep cannot see: a shell started after the advance in the same finishing turn, a first seat that recorded done and kept working while the second seat advanced the leaf, and any advance where the sweep was skipped (session refused) or raced a just-started shell. Its condition: seat `working`, no outstanding prompt for the slot, leaf has no live run record, and the quiet period measured from this phase's entry (the move log record for the current phase, the read `phaseEntry` in src/status.ts makes), not from `busy_since`. Measured from `busy_since` the period would usually already be spent at advance, since the masked turn has been `working` since before its phase call, and the race against the still-finishing phase process returns. Quiet value: a few minutes (in-code constant, no config), far below the 1h busy notice.

Cost: two call sites for one sweep function, and commitMove gains hc terminal reads for recorded seats on every move (bounded by the normal hc deadline; moves are rare next to dispatch passes). Both sweeps are idempotent, so overlap is harmless.

### 2. Rejected

- a alone: leaves the post-advance tail shell. Same stall class, thinner: the leaf stalls until the busy notice and a human kill, exactly the seed's failure shape with a rarer trigger. Also never runs for a leaf whose advance was committed just before this code existed (one-time, minor).
- b alone, as written (no quiet period): the first dispatch pass after the move is saved can land while the seat's `akrogon phase` process is still running the move's follow-ups inside the seat scope. Killing it there loses follow-up writes and makes the agent's phase tool call report failure after the move committed, inviting a retry against now-illegal moves. The condition "no outstanding prompt" is already true in that window, because commitMove cleared `prompted` in the state it saved. Sparing the phase process from dispatch needs the sweeper to identify another process's ancestry by argv sniffing, with no sequencing guarantee; commitMove has both for free. This risk is small-window but real, and c removes it without new machinery.

### 3. Evidence

- Operator, 2026-11-24, seed-decision section "Taken" (via INTAKE.md section "Operator decision"): turn-ended counts idle despite a running background shell; leftover seat shells end when the phase advances.
- Practitioner (B, probed; merged map section "Shared facts"), 2026-11-24: claude keeps root `working` with msg "1 shell still running" and one `records` entry per background shell; when the shell is killed from outside, root flips to `done`, `turn` advances, `records` clears. An ended turn with a shell is indistinguishable through hc from a working turn with a shell, so no signal can gate delivery; the shell must die first.
- Practitioner (code), 2026-11-24: `src/next.ts:dispatchSlot` delivers only on `idle`/`done` and keys silent-end accounting to `prompted.turn` versus `seat.turn`; `src/phase.ts:commitMove` clears `prompted` in the saved state, then runs follow-ups and appends the move log in a finally block; `src/phase.ts:phaseCommand` runs seat moves under the global lock, and the seat's phase process is a descendant of the seat harness (observed process shape `harness -> bash -> tool`).
- Better-than-training, 2026-11-25, `hc schema` Terminal section: `turn` "goes up each time the status leaves `working`", so the existing accounting settles by itself once the flip happens; no delivery-into-`working` is needed.

### 4. Pitfalls, and what removes each

- Sweep inside commitMove throws (session refused, hc deadline) and makes a committed move look failed. Removed by: sweep last, after the log append, warn-only, never `MoveCommittedError`; the dispatch sweep retries later.
- The second required seat's advance kills the first seat's still-running foreground tool shell from before its own phase call. Its tool call fails; the turn then ends and delivery proceeds. This is the operator rule applied literally; nothing removes it without distinguishing shells by start time against each seat's own phase call, which no record holds.
- A seat's `akrogon run-check` wrapper sits in the seat scope while its payload runs in a run scope; sweeping during publish orphans captures and later refuses phase moves on abandoned pairs. Removed by: both sweeps skip while the leaf has a live run record, the `liveRuns()` guard dispatchSlot already applies before counting a silent end.
- Pid reuse between read and kill. Removed by: derive the seat scope from `/proc/<harnessPid>/cgroup` at sweep time (the read `src/seat.ts:cgroupOf` already makes; the scope unit name carries a random suffix and is not recorded), and re-check the harness pid still heads that scope before signalling.
- Sweeping a seat of a different leaf (lesson 2026-10-13, named in the merged map section "seat-turn-idle (#157)"). Removed by: targets come only from this leaf's recorded `state.seat` addresses, resolved in this repo's hc session, same as dispatchSlot's seat read.
- Moves to `failed` and `merged` also pass through commitMove. Sweeping there is harmless (failed: the seat gave up or was failed; merged: reconcile ends the seats anyway), so no phase filter is needed.

### 5. Unasked questions

- The masked silent end with no advance: a seat ends its turn without calling `phase` and leaves a shell. No advance happens, `prompted` is still set, so neither sweep in option c ever fires, and because `turn` never moves, even the silent-end attempt counter cannot run. Today only the 1h busy notice covers it. The fork should decide explicitly that this case stays notice-only, because the alternative (sweep a long-`working` seat with an outstanding prompt) kills shells of genuinely long turns and cannot be told apart (Shared facts, same source as above).
- A refused move (guards fail, e.g. dirty tree): the seat believes it called phase, ends its turn, shell remains, no advance. Same hole as above, worth one line in the leaf's accepted residue.
- Should the sweep log to timings (one row per sweep with killed pids)? Without it, the first field failure of the sweep itself has no record. The communications rules say extend existing records only; a `shell_sweep` timing kind fits that.

## Q2. Which processes count as leftover shells

### 1. Pick: a. Shell-program children of the harness pid, with their whole process trees.

"Shell-program" read from `/proc/<pid>/comm` (or argv[0] basename) against a shell set (sh, bash, zsh, dash, fish, nu). Signal every collected descendant, TERM first; survivors in the same trees get KILL at the next sweep (delivery passes provide the second look).

Reason: it hits exactly the proven masking class (claude's leftover is a direct bash child; pi's tool shells are bash children) and provably spares resting harness helpers. The census shows codex resting with two `node_repl` and one `codex-code-mode-host` children; option b kills all three at every phase advance of every codex-seated leaf, forever, for a masking case not yet observed in codex at all.

Cost: an escaped leftover survives (see pitfalls), and the shell set is one more small list in code.

### 2. Rejected

- b, every scope process except the harness pid: rejected on the census, not on taste. It converts an unproven benefit (catching non-shell leftovers) into certain repeated harm (codex helpers die per advance; whether codex respawns them cleanly, and what REPL state is lost, is unobserved, low confidence either way). It also kills any future harness helper on first contact after an upgrade, loudly and repeatedly.
- c, scope minus harness, caller chain, and recorded helpers: the right shape if a non-shell masking case is ever proven, wrong now. "Recorded by an observation" becomes a program-name allowlist coupled to harness versions (`node_repl`, `codex-code-mode-host` today), which is option a inverted: under a, an unknown new helper survives and an unknown new leftover may stall (busy notice still fires); under c, an unknown new helper dies at every advance. For a class proven only in claude's bash children, surviving is the safer error.

### 3. Evidence

- Practitioner (own census), 2026-11-25, `hc get --json` + `/proc/<pid>/task/<pid>/children` + scope `cgroup.procs` on live seats: codex seat at rest holds `node_repl` x2 and `codex-code-mode-host` as harness children; claude seat holds a single snapshot-bash child with a subtree; pi seats hold no resting children.
- Practitioner (B, probed; merged map section "Shared facts"), 2026-11-24: claude's background shells hold root `working` and appear as `records` entries; pi does not mask; codex and agy masking unobserved.
- Practitioner (code), 2026-11-24: seats run in their own systemd scope (`src/seat.ts:startSeat`); run-check payloads run in sibling run scopes (`src/scope.ts:runUnitArgv` under the leaf slice), so a harness-child tree walk never reaches check payloads or other seats.
- Practitioner (own probe), 2026-11-25: a `setsid` child remained in its parent cgroup while leaving the session; once an intermediate parent exits, such a process also leaves the harness's process tree but stays in the scope cgroup. This is option a's known leak, stated not hidden.

### 4. Pitfalls, and what removes each

- A shell child that `exec`s its payload (`bash -c 'exec sleep 999'`, or bash's last-command exec) stops being a shell by comm before any sweep sees it. Mostly removed by: claude and pi tool shells run compound commands (snapshot wrapper, loops), so the bash survives as parent; the seed loop held its bash parent. Residue accepted; a proven case reopens option c.
- A daemonized leftover (double-fork, dev server) escapes the tree once its shell parent exits, but stays in scope. Removed only by option b/c; under a it is bounded by the seat's own end (reconcile ends finished seats' scopes) and the busy notice. Accepted residue, named.
- Killing only tree roots orphans grandchildren (the seed loop's `sleep 30`). Removed by: signal the full descendant collection gathered at sweep time, and re-walk at the kill pass; orphaned sleeps exit on their own and cannot restart a dead parent loop.
- A descendant forks between the walk and the signal. Removed by: TERM pass then re-walk KILL pass bounds it; a process racing to fork forever is indistinguishable from hostile and out of scope.
- Mistaking a harness's shell-named helper for a leftover: none observed; the harness binaries are `claude`, `pi`, `codex`, `agy` by the launch rule in `src/seat.ts:harnessArgv` (argv[0] must be the harness name), and their observed children are shells or named helpers.

### 5. Unasked questions

- Does codex mask like claude, and if so, through which process? If codex can hold `working` for work inside `node_repl` or the code-mode host, option a will never unblock a codex seat and this fork's answer flips to c for codex. This needs one live codex probe with a long background task (paid; not run here). Same, weaker, for agy.
- Should the sweep gate on claude's `records` (one entry per live background shell) as existence proof before walking processes, at least for a timing row? `src/hc.ts:terminalSchema` drops `records` today; using it only as a log fact, never as a gate, gives the first field evidence for whether sweeps fire when shells exist.
- TERM grace: how long before KILL, and who owns the second look when the advance sweep did the TERM (no later dispatch sweep runs if the flip never comes, since delivery waits on `idle`/`done`)? The delivery sweep's re-walk is the natural owner, but only while its conditions hold; worth stating in the leaf.

## Q3. A seat terminal recovered as a bare shell

### 1. Pick: a. Treat as lost on positive evidence, take the existing lost-seat path, charge `lost`.

Positive evidence, widened by my probe to the two recovery shapes that actually occur: `status` null AND (`foreground.name` is a shell program OR (`pid` null AND `reason` in {server_stop, stopped_by_restart, holder_lost})) AND NOT `reason` spawn_pending. This needs `foreground.name`, `reported`, and `reason` added to `src/hc.ts:terminalSchema` (all currently dropped). Safety of the trigger: during a normal launch the transient foreground is `systemd-run` then `env` then the harness binary, never an interactive shell, because `src/seat.ts:harnessArgv` requires the launch argv to start with the harness name and startSeat wraps it in systemd-run and env, no shell. While the harness's bash tool runs, foreground stays the harness (observed on a working pi seat mid tool call, 2026-11-24).

Reason for charging: `lost` counts "recorded seat replaced before ending a turn" and resets at every phase advance (commitMove) and on any counted silent turn end, so a charge only accumulates within one phase visit with zero completed turns. Three such replacements in one visit is a broken seat whatever the weather, and the bound is what stops an infinite replace-and-relaunch loop (each relaunch is a paid session) if the harness comes back broken after the reboot. One code path for all lost shapes keeps the semantics readable in a year.

Cost: a host rebooting three times during one phase visit, with the seat never completing a turn between, fails its leaves. That host has bigger problems than these leaves, and failure is operator-visible.

### 2. Rejected

- b, same without the charge: creates the only unbounded seat-replacement loop in dispatch. If the recovered shell condition misfires on some future harness (say one that legitimately shows a shell foreground during a long operation), option a fails the leaf after three and stops; option b replaces the seat forever, each time paying a launch and discarding an agent's work. Forgiving reboots by count also forgives every other cause that presents the same fields, since the fields cannot say "reboot" (my signal-loss probe produced the same shape with no reboot).
- c, record only: contradicts the expected behavior in INTAKE.md section "Expected behavior" (recovered in the intake; the seat relaunches under `next --resume`). It keeps the exact manual recovery the seed reports.

### 3. Evidence

- Practitioner (own throwaway-core probe), 2026-11-25, hc 0.1.22: a `--keep` terminal running `bash -c 'sleep 300'`; after SIGKILL of its program pid, `hc get --json` showed `state: live`, `status: null`, `reported: false`, `reason: null`, a new pid, `foreground: {name: "bash", argv: ["/usr/bin/bash"]}`, and the launch `argv` rewritten to `["/usr/bin/bash"]` (so comparing foreground to the recorded launch argv is unusable). After `hc server stop` and a fresh get, the same terminal showed `state: live`, `pid: null`, `foreground: null`, `status: null`, `reason: "server_stop"`; the recovery shell spawns lazily, not at core start (low: attach may be the spawner, untested).
- Operator (seed observation), 2026-11-24, INTAKE.md section "Observation": after a host reboot, leaf seats returned as live bash shells with no hc status, `next --resume` relaunched nothing, manual relaunch needed per pane.
- Practitioner (code), 2026-11-24: lost-seat path in `src/next.ts:dispatchSlot` runs only on missing or `finished` terminals; `lost` resets in `src/phase.ts:commitMove` and on counted silent ends in dispatchSlot; seat terminals are `keep: true` in live `hc get` reads.
- Better-than-training, 2026-11-25, `hc schema` Terminal section: `keep` means "Replace a lost program with this machine's shell, in place"; `reason` enumerates exited, killed, server_stop, signaled, holder_lost, stopped_by_restart, and spawn_pending ("its initial spawn timed out, but the holder may still be starting it"), which is why spawn_pending must be excluded from the trigger.

### 4. Pitfalls, and what removes each

- False positive on a harness that never reports OSC status (status null for its whole life): its foreground is the harness binary, not a shell, and its pid is never null, so the trigger cannot fire. Agy's foreground name and status behavior as a seat are still unobserved; the leaf's own first live agy seat read should confirm before this ships enabled for agy seats, or the trigger keys on harnesses observed to report (claude, pi, codex all observed reporting).
- False positive in the boot window: covered by the no-shell-in-launch-chain fact above plus the spawn_pending exclusion; a freshly started seat also passes through startSeat's own start proof before dispatch reads it as steady state.
- Reboot takes every seat at once: dispatch will charge and relaunch many seats in the following passes. Capacity counting in allocate treats seats with no live terminal correctly, and startSeat failures throw rather than loop silently; the storm cost is real launches the operator already pays for manually today, just sooner.
- `turn` resets on the recovered terminal (probe showed turn 0) while leaf state may hold `prompted.turn` from before. The lost path replaces the seat and records fresh prompting, so no stale comparison survives; but the regression (recorded prompted turn greater than terminal turn) is corroborating evidence the leaf may log, never a required condition, since commitMove may have cleared `prompted` before the reboot.
- The recovery shell name is the machine's configured shell (hc setting `shell = ["nu"]` overrides), so hardcoding `bash` alone misses a `nu` recovery. Removed by matching the shell set from Q2 plus requiring the name to differ from the seat's configured harness program.

### 5. Unasked questions

- The fork assumes the recovery shape `foreground is a shell`. The core-restart shape has no shell yet (`pid: null`, `foreground: null`). If the leaf implements only the fork's stated shape, the exact reboot case may sit in the null shape until a human attaches. Does anything in akrogon's normal reading (a `terminal()` read, a send) cause hc to spawn the lazy shell? My probe's plain get did not.
- Should `keep` be turned off for leaf seats instead, so a lost agent leaves a `finished` terminal and today's lost path handles everything, deleting this whole fork question? Seats are `keep: true` in live reads but `src/hc.ts:run` passes no `--keep`; something else sets it (hc default, config, or herdr-app; unobserved). If akrogon owns that choice, asking hc not to resurrect seats as shells removes the problem class at the source, at the price of losing the pane's scrollback shell a human might use to inspect a dead seat. Whoever answers this names who sets keep first.
