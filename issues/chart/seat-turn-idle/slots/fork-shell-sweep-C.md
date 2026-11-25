# Fork notes: shell-sweep (slot C)

Fork: `issues/chart/seat-turn-idle/forks/shell-sweep.md` (`Tamdoma/akrogon#157`).

---

## Q1: When and where do a seat's leftover shells end, so the existing idle gate in `src/next.ts:dispatchSlot` delivers the next phase prompt?

### 1. Pick, reason, and cost
- **Pick:** **a** — inside the phase advance (`src/phase.ts:commitMove`), for every recorded seat of the leaf, sparing the calling process's own ancestry.
- **Reason:**
  - Directly implements the operator lock (`seed-decision.md` `## Taken`: *"Leftover seat shells end when the leaf's phase advances"*) at the exact causal event.
  - Because Claude masks `done` as `working` and emits no `turn` event while a background shell lives (`map-merged.md` `## Shared facts`), killing leftover shells inside `commitMove` clears the mask *before* the reporting seat's turn ends, so Claude flips to `done` and emits `turn` immediately, waking `src/listen.ts:listenCommand` with zero polling and zero quiet-period delay.
  - Covers every phase transition uniformly — seat-driven (`implement -> check.review`, second seat completing `check.review`), command-driven (`src/land.ts:repairExit`, `src/next.ts:mergeTurnExit`, `src/phase.ts:commandMerged`), terminal moves (`merge`, `merged`, `failed`, where `dispatchSlot` never runs for A/B again), and operator recovery.
- **Cost:**
  - Does not automatically sweep a shell started *after* `akrogon phase` returns in the same turn, or a shell left behind when a seat ends a turn silently *without* advancing the phase. (In both rare cases, the existing 1h `Busy leaf` notice in `src/next.ts:observeBusy` still fires.)
  - Adds a best-effort `/proc`/cgroup sweep to `commitMove` (must warn and continue on sweep errors, like `renameTab` in `src/phase.ts:100`, so a sweep error never breaks a committed move).

### 2. Rejected options
- **b (In dispatch `next`, outside the seat scope, for a seat that is `working` with no outstanding prompt):**
  - *Race with a live turn:* Immediately after `commitMove`, `state.prompted` is cleared to `{}` (`src/phase.ts:239`) while the reporting seat is still finishing its turn (`akrogon phase` → `phaseWake` runs synchronously from inside the seat's tool shell at `src/akrogon.ts:107`). Because a working turn with a shell looks identical in `hc` to an ended turn with a shell (`map-merged.md` `## Shared facts`), `next` cannot tell them apart without risking killing active work.
  - *No wakeup trigger:* `src/listen.ts:listenCommand` (`src/listen.ts:95`) is strictly event-driven (`turn`, `blocked`, `finished`, `lost`, no polling). If `phaseWake` skips the seat because it is still finishing its turn, and Claude then ends its turn masked as `working`, nothing ever triggers another `next` pass.
  - *Misses seatless transitions:* Phases like `merge`, `merged`, and `failed` never invoke `dispatchSlot`, violating the operator lock that leftover shells end when the phase advances.
- **c (Both: at the advance, and again at delivery after a quiet period):**
  - *Unreachable in unattended runs without polling:* If a shell survived `commitMove` and kept Claude masked as `working`, `src/listen.ts:95` emits no further wake events after the quiet period elapses, so the second sweep only runs if an unrelated event happens to trigger `next --resume`.
  - *False-kill heuristic & extra state:* Because `hc` cannot distinguish a genuinely working turn with a shell from an ended turn with one, any quiet-period kill risks killing legitimate work (e.g. after an operator phase recovery) and adds a new timer/threshold parameter for negligible gain over (a).

### 3. Evidence
- **Operator** (`issues/chart/seat-turn-idle/forks/seed-decision.md` `## Taken`, 2026-11-24): Locks that leftover seat shells end when the leaf's phase advances and rules out watch-side kill workarounds.
- **Better-than-training** (`issues/chart/seat-turn-idle/slots/map-merged.md` `## Shared facts`, 2026-11-25): Probed `hc` + Claude behavior — root stays `working` with no `turn` event while a background shell lives, indistinguishable from active work; killing the shell externally flips root to `done` and advances `turn`.
- **Practitioner** (`src/phase.ts:commitMove`, `src/akrogon.ts:85-110`, `src/next.ts:dispatchSlot`, `src/listen.ts:listenCommand`, 2026-11-25): Inspected code confirms `commitMove` wipes `prompted: {}` before `phaseWake` runs inside the `akrogon phase` process, `dispatchSlot` gates on `status === 'idle' || status === 'done'`, and `listenCommand` wakes only on `turn`, `blocked`, `finished`, or `lost` (explicitly no polling).
- **Practitioner** (live cgroup census of `akrogon-l40ca58c258f0-fw-seo-targets-ia-keyword-a-e6d72639.scope`, 2026-11-25): Confirmed Claude runs CLI commands under `claude -> bash -> bash -> bun akrogon ...` inside the seat `.scope`, so `akrogon phase` executes inside the reporting seat's scope.

### 4. Pitfalls and removals
- **Killing the calling `akrogon phase` process or its parent bash tool shell:** Because `akrogon phase` runs inside the reporting seat's scope, signalling the caller's shell aborts the tool call before exit/footer. *Removal:* Walk `/proc/<pid>/stat` PPIDs from `process.pid` upward to root and exclude every PID in that ancestor chain (and never `kill(-pgid)` on any PGID shared by that chain).
- **Failing a committed phase move if `hc` is unreachable or a PID vanishes:** `commitMove` already saved `state.yaml`. *Removal:* Run the sweep after `saveState` (before or alongside follow-up work in `commitMove`), ignore `ESRCH`/`ENOENT`, and catch `HcError`/session refusals with a structured warning like `renameTab` (`src/phase.ts:100-113`).
- **Sweeping a seat that is not in an akrogon seat scope (e.g. a non-scoped or direct-route terminal):** *Removal:* Resolve the seat's cgroup from `/proc/<seat.pid>/cgroup` and require that its path sits under `leafSlice(repo, state.slug, homePath())` (`src/scope.ts:leafSlice`) and ends in `.scope` before touching any PID.
- **Skipping the sweep when `phase` moves to `merged`:** `completeOwner` runs after `saveState`; seats are closed later in `landedWake`/`reconcile`. Sweeping in `commitMove` ends leftover shells immediately even before `reconcile` runs.

### 5. Questions the fork does not ask
1. **Partial `check.review` completion (`src/phase.ts:transition`, lines 522–534):** When slot A finishes `check.review` first and calls `akrogon phase` (recording `done: [A]` without advancing the phase yet because B is still reviewing), should that call also sweep *only slot A's* leftover shells so A doesn't sit masked as `working` and trip a false 1h `Busy leaf` notice while waiting on B? (Sweeping `slot`'s shells on partial `done` is safe because only the reporting seat finished; B's scope is untouched.)
2. **Stale `busy_since` across phase advances (`src/phase.ts:245`):** `commitMove` preserves `recorded.busy_since` on non-terminal moves. Once leftover shells die and the seat goes `done`, `observeBusy` clears `busy_since` on the next pass; verify `phaseWake` / `next --wake` clears it before a 1h notice can fire on a seat that was legitimately busy for 55m in the prior phase.

---

## Q2: Which processes count as a seat's leftover shells?

### 1. Pick, reason, and cost
- **Pick:** **a** — shell-program children of the harness process (within the seat's systemd `.scope` cgroup, plus reparented orphan shell roots in that same `.scope`), with their in-scope process trees, sparing the caller's ancestor chain. Other children (MCP servers, harness helpers) are left alone.
- **Reason:**
  - Live `/proc` and cgroup census on this host proves that harnesses run persistent non-shell helper processes inside the seat's `.scope` — and spawn them lazily *during* work, not only at boot. Specifically, live Codex seat `akrogon-lb0afbf62a3b3-fw-close-lost-stop-b-2edcd1a6.scope` runs three direct non-shell children of `codex` (PID `3477881`): two `node_repl` processes (`/usr/lib/chatgpt/resources/cua_node/bin/node_repl`, PIDs `3479987`, `3479995`) and `codex-code-mode-host` (`PID 3486741`, spawned ~9,000 PIDs after `codex` started).
  - Matching shell-program roots (`sh`, `bash`, `dash`, `zsh`, `fish`, `ash` via `/proc/<pid>/comm` / basename of argv0) inside the seat `.scope` and signalling their entire in-scope descendant tree kills the background shell *and* its non-shell children (`sleep`, `git`, `bun`, `node`, etc.) while leaving `node_repl`, `codex-code-mode-host`, MCP servers, and future harness helpers completely intact with zero per-harness allowlist maintenance.
- **Cost:**
  - A background job that double-forked a bare non-shell binary (e.g. `setsid sleep 300 &`) whose wrapper shell already exited would not match a shell root unless orphan non-shell processes (whose PPID is outside the seat `.scope`, unlike harness helpers whose PPID is `harnessPid`) are also handled. Note: in Claude Code, a background shell tracked in `records` (`1 shell still running`) keeps its wrapper `bash` alive, so the `#157` failure mode is always rooted at a shell child of the harness.

### 2. Rejected options
- **b (Every process in the seat's systemd scope except the harness pid):**
  - **Refuted by live host evidence:** Directly kills Codex's live `node_repl` and `codex-code-mode-host` processes inside `akrogon-lb0afbf62a3b3-fw-close-lost-stop-b-2edcd1a6.scope`, and would kill any Claude/pi/agy MCP servers or LSP helpers on every phase advance, breaking seat reuse.
- **c (Every process in the scope except the harness pid, the caller chain and helper pids recorded by an observation):**
  - *Broken by lazy/restarted helpers:* Live Codex seat `3477881` spawned `codex-code-mode-host` (`3486741`) well after startup. Any helper spawned lazily mid-turn or restarted with a new PID is absent from a startup PID snapshot and gets killed. Maintaining a static name/PID allowlist also couples akrogon to every harness release's internal process names.

### 3. Evidence
- **Better-than-training** (live cgroupfs + `ps` census on this host, 2026-11-25):
  - `akrogon-lb0afbf62a3b3-fw-close-lost-stop-b-2edcd1a6.scope`: `codex` (`3477881`) has direct non-shell children `node_repl` (`3479987`, `3479995`) and `codex-code-mode-host` (`3486741`).
  - `akrogon-l40ca58c258f0-fw-seo-targets-ia-keyword-a-e6d72639.scope`: `claude` (`2159262`) runs shell commands via direct child `bash` (`854594`, `/usr/bin/bash -c source ~/.claude/shell-snapshots/...`) → child `bash` (`854596`) → payload/wrapper (`bun akrogon run-check`, `tail`, `flock`).
  - Live `agy` (`584498`) runs shell commands via direct child `bash` (`1251747`); resting `claude` (`3539184`, `1527317`) and `pi` (`582208`, `585376`) hold 0 extra children in our snapshot (low confidence on whether `claude`/`pi`/`agy` spawn MCP helpers when MCP servers are configured — Option (a) stays safe either way).
  - Live `hc-hold-7db5510a.service` cgroup showed an orphaned loop (`PID 1087782`, `PPID 2317` = `systemd --user`, `bash -c while true; do sleep 5; done` → `sleep 5`), proving background shells can be reparented to the user subreaper while staying in their original cgroup.
- **Practitioner** (`src/seat.ts:startSeat`, `src/scope.ts:leafSlice`, `src/run-check.ts:checkedRun`, 2026-11-25): Confirmed each seat runs in its own `akrogon-l<hash>-<seatName>-<hex>.scope` under the leaf slice, while `run-check` payloads run in sibling `akrogon-run-<id>.scope` units and the `run-check` wrapper itself stays in the seat scope.
- **Practitioner** (`learnings/history/2026-10-13-pattern-kill-crosses-leaves.md`, 2026-10-13): Pattern kills (`pkill -f`) cross leaves; kills must be strictly bounded to owned PIDs/cgroups.

### 4. Pitfalls and removals
- **Orphaned/reparented shells inside the seat `.scope`:** If a background job double-forks or its outer shell exits, its PPID becomes `systemd --user` or `1` (not `harnessPid`), while it remains in the seat's `.scope` cgroup. *Removal:* Within the seat's `.scope` `cgroup.procs`, select shell-program roots whose PPID is `harnessPid` **or** whose PPID is not in the `.scope` (excluding `harnessPid` itself), then collect all their descendants inside the `.scope`.
- **Signalling only the shell PID leaves grandchild commands alive:** Killing `bash` with `SIGTERM` often leaves `sleep 30` or `git` running as an orphan. *Removal:* Walk the full descendant tree inside the seat `.scope` from each matched shell root, send `SIGTERM` to the whole set (leaves/children included), wait briefly (e.g. 200–500ms) for exits, then `SIGKILL` survivors. Never `kill(-pgid)` if `pgid` equals `harnessPid` or any caller-ancestry PGID.
- **Killing a live `run-check` wrapper mid-publish in the seat scope:** Observed in `akrogon-l40ca58c258f0-fw-seo-targets-ia-keyword-a-e6d72639.scope` (`bun akrogon run-check` + `flock` + `tail` sit inside the seat `.scope` under `bash`). If a sibling seat or delayed wrapper is still publishing, killing its shell tree aborts publication. *Removal:* Before signalling a shell subtree, skip any subtree containing a PID owned by a live `run-check` record (`src/admission.ts:liveRuns`) or an ancestor of `process.pid`.
- **PID reuse race between `/proc` scan and `process.kill`:** *Removal:* Record each target's start time (field 22 of `/proc/<pid>/stat`, reusing `src/admission.ts:liveStartTime`) and re-verify start time and `.scope` membership before `SIGKILL` (or before every signal).
- **Non-bash shells (`sh`, `dash`, `zsh`, `fish`):** Harnesses or scripts may invoke `/bin/sh` or the user's `$SHELL`. *Removal:* Match a small fixed set of POSIX/login shell basenames (`sh`, `bash`, `dash`, `zsh`, `fish`, `ash`, `ksh`) against `/proc/<pid>/comm` (and fallback to basename of `cmdline[0]` stripped of leading `-`).

### 5. Questions the fork does not ask
1. **What if a seat's leftover background job is a reparented non-shell binary (e.g. `setsid node server.js &`) inside the seat `.scope`?** Its PPID is outside the `.scope` (`systemd --user` or `1`), whereas every harness helper we observed (`node_repl`, `codex-code-mode-host`) is a direct child of `harnessPid`. Should the sweep also end reparented non-shell orphans inside the seat `.scope` (PPID outside `.scope` and PID !== `harnessPid`), or strictly shell-rooted trees? (Low confidence whether any harness helper double-forks; verify before widening past shell roots.)
2. **Test seam for `procRoot` / `cgroupRoot`:** `src/scope.ts:procRoot` and `cgroupRoot` already exist for free tests — ensure the shell-sweep helper uses them (and a kill seam or real local subprocesses in a temp/fake cgroup) so tests prove tree targeting, caller exclusion, and helper preservation at the real boundary without launching paid agents.

---

## Q3: A seat terminal that hc recovered as a bare shell after a reboot (`live`, `status: null`, foreground is a shell, not the harness): what does dispatch do?

### 1. Pick, reason, and cost
- **Pick:** **a** — treat it as a lost seat on positive evidence and take the existing lost-seat path (`seat_lost` evidence row, `end`, increment `lost`, fail leaf at 3, `startSeat`), charging `lost` like any lost seat.
- **Reason:**
  - **Critical safety reason from `hc --help`:** `hc keep` recovers **signal deaths (OOM / SIGKILL / SIGSEGV)** into a bare shell too (*"replace lost programs with a shell ... signal death recovers too"*), not only host reboots! A bare shell on a `keep: true` seat terminal is therefore indistinguishable in `hc` from a harness repeatedly crashing via OOM or signal.
  - Taking the existing lost-seat path with `lost` charged guarantees the 3-loss circuit breaker (`src/next.ts:598-605`) still stops an infinite paid-relaunch loop if a harness keeps getting killed by OOM/signal.
  - On a real host reboot, `lost` goes `0 → 1` (out of 3), the seat relaunches immediately, and `commitMove` resets `lost` back to `0` (`src/phase.ts:243`) on the next phase advance. It would take 3 reboots inside a single phase with no phase advance to fail the leaf — and halting for operator eyes after 3 mid-phase reboots is sensible.
  - Simplest implementation: zero new state fields (`boot_id` not needed in `state.yaml`), reuses `seat_lost` timing evidence and `end` + `startSeat` cleanly.
- **Cost:**
  - A leaf that survives 3 host reboots during one single phase without advancing hits `failed` (`seat <slot> was lost 3 times before ending a turn`) and requires one `akrogon phase <slug> <phase>` recovery.

### 2. Rejected options
- **b (Same, without charging `lost`):**
  - *Infinite paid-relaunch loop on signal death:* Because `hc keep` replaces signal-killed processes (`SIGKILL`/OOM/`SIGSEGV`) with a bare shell in the exact same way as a reboot (`hc --help`), skipping `lost` disables the only circuit breaker (`src/next.ts:598`) against a crash-looping harness, burning unbounded paid launches.
  - Adding a `boot_id` check to distinguish reboot from signal death adds new state to `state.yaml` and still fails to distinguish a signal death that happened across a reboot.
- **c (Leave it out of scope / record only):**
  - Leaves every seated leaf permanently stalled after every host reboot (confirmed in `INTAKE.md` `## Observation`: *"happened to every seated leaf after one reboot"*), contradicting `INTAKE.md` `## Expected behavior` (*"A seat pane whose agent process is gone is treated as lost or finished, so `next --resume` relaunches it"*) and Signpost 1a (fix the mechanism).

### 3. Evidence
- **Better-than-training** (throwaway `hc 0.1.22` keep-recovery probe, 2026-11-25): Started `hc run --bg --keep -- sleep 300`, ran `hc server stop && hc server start`; `hc get --json t1` changed from `argv: ["sleep", "300"], status: null, reported: false` to `state: "live", argv: ["/usr/bin/bash"], foreground: { argv: ["/usr/bin/bash"], name: "bash", pid: ... }, status: null, reported: false, turn: 0, keep: true`.
- **Better-than-training** (`hc --help` for `hc 0.1.22`, 2026-11-25): Explicitly documents `keep <t> [--off] replace lost programs with a shell (also run --keep); signal death recovers too`.
- **Practitioner** (`src/hc.ts:terminalSchema`, `src/seat.ts:startSeat`, `src/next.ts:dispatchSlot`, `src/phase.ts:commitMove`, 2026-11-25):
  - `startSeat` always launches leaf seats with `argv[0] === 'systemd-run'` (`src/seat.ts:320`), never a bare shell.
  - `src/hc.ts:terminalSchema` (`src/hc.ts:21-35`) currently strips `argv`, `reported`, and `foreground.name`; adding them exposes exact positive evidence.
  - `src/next.ts:dispatchSlot:535-615` already implements `seat_lost` timing row → `end` → `lost + 1` → fail at `>= 3` → `startSeat`; `src/phase.ts:commitMove:243` resets `lost: { A: 0, B: 0 }` on every phase advance.
- **Practitioner** (`issues/chart/seat-turn-idle/INTAKE.md` `## Observation` & `## Expected behavior`, 2026-11-24): Reboot turned `t3dg`, `t3db` into live bash shells with null status; `next --resume` relaunched nothing.

### 4. Pitfalls and removals
- **False positive on a newly booting seat:** A freshly launched seat briefly has `state: 'live'`, `status: null`, `reported: false` before the harness emits its first OSC 7501 status. *Removal:* Require positive recovery-shell evidence — `seat.state === 'live' && seat.status === null && !seat.reported`, `seat.argv[0]` is a shell (and not `'systemd-run'`), AND `seat.foreground !== null` with a shell `name` (`bash`, `sh`, `zsh`, `fish`, `dash`). A booting seat has `argv[0] === 'systemd-run'` and never matches.
- **False positive if a user manually opened a shell or attached:** Leaf seat terminals are only matched by `leafSeats` (`src/reconcile.ts:402`) when `state.seat[slot].address` AND `akrogon.leaf`/`akrogon.seat` labels match; requiring `argv[0]` to be a shell (not `systemd-run`) still matches only a `keep`-recovered seat terminal, never an unrelated user shell.
- **Recovered bare shells holding `max_active` capacity slots:** `src/next.ts:activeCount` (`src/next.ts:403-411`) counts every `akrogon=1` terminal in `terminals(...)` regardless of whether its agent died and recovered as bash, and `src/next.ts:liveSeat` (`src/next.ts:114`) checks only `t.state === 'live'`. *Removal:* Share one helper (e.g. `deadSeat(t)` / `recoveredShell(t)`) so `dispatchSlot` routes recovered shells to the lost-seat path AND `activeCount` / `liveSeat` do not treat a recovered shell as a healthy running seat (note: if `allocate:465` sees `!live` on a rebooted leaf, `capRefusal` applies cleanly and `activeCount` won't double-count the dead shell!).
- **Missing `seat_lost` diagnostic fields when `seat` is a recovered shell:** `src/next.ts:581-592` logs `exit_code: null, signal: null, status: null`. *Removal:* Include `foreground` / `argv` (or keep existing `screen` + `status: null` — `screen` already shows the bash prompt, and `seat_lost` schema in `src/timing.ts:59-71` is `z.strictObject`, so keeping existing fields avoids schema churn unless an optional field is desired).
- **Silent-end branch (`src/next.ts:537-542`) accidentally triggering on a recovered shell:** After recovery, `seat.turn` resets to `0`, so `recordedPrompt.turn < seat.turn` is false (`0 < 0` is false) and it cleanly enters the `ref !== undefined` lost-seat branch at `src/next.ts:574`. Still verify with a unit test where `recordedPrompt.turn === 0`.

### 5. Questions the fork does not ask
1. **Should `src/reconcile.ts:broadcastInProgress` (`src/reconcile.ts:197`) and `src/reconcile.ts:tabLive` (`src/reconcile.ts:270`) also recognize a recovered bare shell?** If a merged leaf's broadcast B seat died on reboot and became a bash shell (`status: null`), `broadcastInProgress` treats `status !== 'idle' && status !== 'done'` as "still broadcasting" forever, keeping the merged leaf's tab and worktree from ever cleaning up! Treating a recovered bare shell as not-live in `broadcastInProgress` (or letting `broadcastPass` replace it via `dispatchSlot`) prevents post-reboot zombies on merged leaves too.
2. **Why do leaf seats have `keep: true` when `src/seat.ts:startSeat` does not pass `--keep`?** Worth a 1-minute check (`hc` default vs `herdr-app` setting `keep` on adoption) so we know whether `keep: true` is permanent on all leaf seats or session-dependent — either way, Q3(a) handles it reliably.
