# Second final-shape check, slot C: tool-cgroup (round: autopilot pick 2026-11-25, revision after check 1)

Date: 2026-11-25  
Checked: `[R]` lines of `forks/tool-cgroup.md` (`## Taken`).

## Defects

### D1. Nesting `helper/` under `akrogon/<t-name>/` triggers Linux cgroup v2's hierarchical `populated 1` feedback loop
- **Lines (`## Taken`, Q1 `[R]`)**: *"if `akrogon/<t-name>` is unpopulated, it writes `t-/cgroup.kill` now. if it is populated ..., it spawns one detached helper inside `akrogon/<t-name>/helper/`, unless that directory is already populated, that waits, with no timeout, for the tool shell ... to end, then writes `t-/cgroup.kill`..."*
- **Concrete failure**: In Linux cgroup v2, `cgroup.events` `populated` is **hierarchical** — a parent directory reads `populated 1` whenever *any* descendant directory has a live process, even when the parent's own `cgroup.procs` is empty (empirically verified on this host in Probe C below: `akrogon/t-1 procs: []`, `akrogon/t-1 events: populated 1`).
  - If `commitMove` #1 lands while a short-lived `akrogon` call (e.g. `akrogon status` inside an infinite poll loop `until ...; do akrogon status; sleep 30; done`, or `akrogon phase ...; sleep 600`) is in `akrogon/t-1/`, it spawns the no-timeout helper in `akrogon/t-1/helper/`.
  - 50 ms later `akrogon status` exits (`akrogon/t-1/cgroup.procs` is empty), while the infinite loop shell never exits.
  - On *every* later `commitMove` (including an operator move), `akrogon/t-1/cgroup.events` **still** reads `populated 1` because of its child `akrogon/t-1/helper/`, and `akrogon/t-1/helper/` reads `populated 1`, so **no future `commitMove` can ever kill `t-1`** — the helper permanently shields `t-1` until leaf close!
- **Fix**: Place helpers in a **sibling** directory `<seat scope>/helpers/<t-name>/` (bootstrapped beside `tools/` and `akrogon/` in `startSeat`), never as a child of `akrogon/<t-name>/`. Then `akrogon/<t-name>/cgroup.events` reflects only live `akrogon` commands; if a later `commitMove` sees `akrogon/<t-name>` unpopulated (`populated 0`), it kills `t-name` immediately (and the waiting helper in `helpers/<t-name>/` then observes the tool shell ended, writes idempotent `cgroup.kill`, and exits).

### D2. Q2 startup relocation moves the helper subcommand out of `helper/` and back into `akrogon/<t-caller>/`
- **Lines (`## Taken`, Q1 `[R]` & Q2 `[R]`)**: *"Every akrogon process relocates (Q2) into `<seat scope>/akrogon/<t-name>/`, named after the `t-` it started in, or after the inherited `t-` env marker when it starts in an `akrogon/` dir (an akrogon started by akrogon)."* + *"The helper is an akrogon subcommand..."*
- **Concrete failure**: `commitMove` runs inside `akrogon/<t-caller>/` with the inherited `t-` env marker pointing to `<t-caller>`. When it spawns the helper subcommand (for `<t-caller>` or for a sibling seat's `<t-other>`), the helper is an `akrogon` CLI process starting inside `akrogon/` (or inside `helper/` with the inherited `t-` env marker). Following Q2 unconditionally moves the helper *out* of `helper/` and into `akrogon/<t-caller>/`, leaving `helper/` unpopulated (breaking the "at most one helper per `t-`" check so subsequent moves spawn duplicate helpers) and keeping `akrogon/<t-caller>/` populated for the helper's lifetime!
- **Fix**:
  1. Explicitly exempt the helper subcommand from Q2 startup relocation (check the verb before `leaveToolCgroup()`, and clear the inherited `t-` env marker in the helper's spawn env).
  2. Have `commitMove` place the spawned helper into `<seat scope>/helpers/<t-name>/cgroup.procs` synchronously before returning (so the "already populated" guard is visible immediately with no spawn-vs-relocation race).

### D3. `Reporting [R]` cannot distinguish entry decay from a healthy idle seat
- **Line (`## Taken`, `Reporting [R]`)**: *"Every commitMove appends one timing row per enumerated seat scope: leaf, unit, the `t-` dirs that read populated before the write (report only, never acted on), the deferred `t-` dirs and errors. A scope that keeps showing zero `t-` dirs while its seat works is the visible sign that entry stopped firing."*
- **Concrete failure**: On a healthy seat whose prior foreground tool calls already finished before `commitMove`, `tools/` contains only *empty* (`populated 0`) `t-` dirs. With the stated fields (`populated`, `deferred`, `errors`), a healthy idle seat reports `populated: []` and `deferred: []` — **identical** to a broken seat where entry never fired (`tools/` has zero `t-` dirs at all).
- **Fix**: Include the total count of `t-*` dirs seen in `tools/` before `rmdir` (counting both `populated 0` and `populated 1` dirs) in the timing row so `seen: 0` cleanly distinguishes entry decay from a healthy idle seat.

---

## Missing obligations

### M1. Best-effort `rmdir` cleanup of empty `akrogon/<t-name>/` and `helpers/<t-name>/` directories
- Taken requires best-effort `rmdir` for killed empty `tools/t-*` dirs, but leaves `akrogon/<t-name>/` and `helpers/<t-name>/` uncleaned for the seat's entire life. Every tool shell that runs an `akrogon` command creates `akrogon/<t-name>/`, and every deferred kill creates `helpers/<t-name>/`; over long leaves these empty dirs accumulate toward `cgroup.max.descendants`. Require best-effort `rmdir` of unpopulated (`populated 0`) `akrogon/<t-name>/` and `helpers/<t-name>/` dirs during `commitMove` (and after the helper finishes its kill), ignoring `EBUSY`/`ENOENT`.

### M2. Helper subcommand inputs and startup isolation
- Because the detached helper subcommand runs asynchronously after `commitMove` returns (potentially after a worktree is removed or cwd changes) and appends its own timing row (`Reporting [R]`), `commitMove` must pass the repo root (or timing target) and `cgroupRoot()`/`procRoot()` explicitly to the helper, and the helper subcommand should skip `migrateStateHome()` in `src/akrogon.ts` (matching `case 'timing'`).

---

## Editorial note (file integrity)
- `forks/tool-cgroup.md` was truncated during the revision edit: the end of `### Carries`, all of `## Findings`, and the `## Taken` heading line are missing (line 23 currently reads `- Locks: forks/seed-decision.md \`## Taken` followed directly by `A's autopilot pick, 2026-11-25...`). Restore `### Carries`, `## Findings`, and `## Taken` before handoff.

---

## Recorded free observation (2026-11-25)

- **Probe C — Hierarchical `populated 1` in Linux cgroup v2 `cgroup.events`** (free, 2026-11-25, Linux `7.2.15-5-omarchy`, `cgroup2fs`, `systemd 262.2-1-arch`):
  - Command: Throwaway `Delegate=yes` scope (`akrogon-fc2-<pid>.scope`) creating `akrogon/t-1/helper`, placing a `sleep 10` process only in `akrogon/t-1/helper/cgroup.procs`, then reading `akrogon/t-1/cgroup.procs` and `akrogon/t-1/cgroup.events`.
  - Result: `akrogon/t-1/cgroup.procs` was empty (`[]`), while `akrogon/t-1/cgroup.events` reported `populated 1 frozen 0`.
  - Cleanup: Killed `akrogon/t-1/helper/cgroup.kill`, `rmdir`'d `helper`, `t-1`, and `akrogon`; `systemctl --user list-units --all 'akrogon-fc2-*'` returned empty.
