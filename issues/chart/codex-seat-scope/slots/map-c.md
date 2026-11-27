# Territory map, slot C: codex-seat-scope

Date: 2026-11-25  
Repo: `/home/ivan/Work/infra/akrogon` (main `9a7cf416`)  
Closed lock honored: `issues/closed/seat-shell-kill/tool-cgroup-kill/design.md` (`### Seed decision`, `### Tool cgroup kill`, `## Leaf architecture`) and `plan.md` (`## Decisions` D1–D15).

---

## 1. Cause confirmation (independent evidence)

The intake's root cause is **confirmed** and has a second, worse consequence whenever `scopeEntry` wins the startup race.

### Chain confirmed by code inspection and free probes
1. `src/seat.ts` `startSeat` sets `AKROGON_SEAT_CGROUP=<scopeCgroup>` and, for every harness kind other than `claude` and `agy` (including `codex` and `pi`), `BASH_ENV=<home>/tool-entry/bash-env`.
2. On this host, `codex` resolves to `~/.local/share/mise/command-wrappers/bin/codex` (symlink to `/usr/bin/mise`), which execs `/bin/bash /usr/share/omarchy/bin/omarchy-agent-account-exec codex ...` **in the exact same PID** as the terminal root (`launched.pid`). `/usr/share/omarchy/bin/omarchy-agent-account-exec` ends with `exec "$agent_binary" "$@"` (line 56), again keeping the same PID.
   - `claude` uses the exact same `mise` -> `omarchy-agent-account-exec` wrapper, and survived only because `startSeat` does not set `BASH_ENV` for `claude` (it uses `CLAUDE_CODE_SHELL=<entry>/bash`).
   - `/usr/bin/pi` is a `#!/bin/sh` script (`exec /usr/lib/pi-coding-agent/pi "$@"`); POSIX `sh` does not source `BASH_ENV`.
   - `tests/stand-in.sh` also starts with `#!/bin/sh`, which is why `tests/tool-entry.test.ts` passed for `codex` without hitting the bug.
3. Because `omarchy-agent-account-exec` starts with `#!/bin/bash`, Bash sources `~/.akrogon/tool-entry/bash-env` (`src/tool-cgroup.ts` `placementShell`) inside the seat root PID. `placementShell` sees `/sys/fs/cgroup$cur = $AKROGON_SEAT_CGROUP`, mints `<scope>/tools/t-<seatPid>-<start>`, writes `$$` into `cgroup.procs`, and exports `AKROGON_TOOL_CGROUP`.
4. **Two failure modes:**
   - *Immediate start failure (seen on the two framework leaves):* `src/seat.ts` `scopeEntry` checks `cgroup.endsWith('/<slice>/<unit>')`. Once the wrapper moves `launched.pid` into `<scope>/tools/t-...`, `scopeEntry` times out after `PANE_WAIT_MS` as `outside`, kills the terminal, and throws `seat outside its leaf scope`. Three losses fail the leaf.
   - *Delayed self-kill when `scopeEntry` wins the race:* If `scopeEntry` reads `<scope>` before `omarchy-agent-account-exec` sources `bash-env`, the start succeeds, **but `codex` still moves into `tools/t-<seatPid>-<start>` milliseconds later**. Every tool shell `codex` spawns then inherits `tools/t-<seatPid>-<start>` (never minting its own `t-`), and on the next phase move `src/tool-cgroup.ts` `sweepScope` writes `1` to `tools/t-<seatPid>-<start>/cgroup.kill` — killing the live `codex` seat itself (or deferring a `tool-kill-helper` waiting on the `codex` PID).

### Free probes (2026-11-25, throwaway dirs/slices cleaned up after)
- **Probe 1 (exec chain & `BASH_ENV` sourcing):** `sh -c 'echo "launcher_pid=$$"; exec env BASH_ENV=<probe> <harness> --version'` for `codex`, `pi`, `claude`.
  - `codex --version` (`launcher_pid=3597870`, exit 0): sourced twice — first in PID `3597870` (`ppid=3597869`, `/bin/bash /usr/share/omarchy/bin/omarchy-agent-account-exec codex --version`) and second in child PID `3597895` (`ppid=3597870`, `/bin/bash /usr/share/omarchy/bin/omarchy-agent-account-home codex`).
  - `claude --version` (`launcher_pid=3597991`, exit 0): identical two-step `omarchy-agent-account-exec` (same PID) + `omarchy-agent-account-home` (child PID).
  - `pi --version` (`launcher_pid=3597954`, exit 0): `<not sourced>`.
- **Probe 2 (real delegated scope reproduction & fix check):** `systemd-run --user --scope --quiet --expand-environment=no --slice=akrogon-probecodex-p<pid>.slice -p Delegate=yes` (cleaned up via `systemctl --user stop`):
  - Current `~/.akrogon/tool-entry/bash-env` on a `#!/bin/bash` wrapper execed in-PID: moved the wrapper PID `3606592` into `.../probe-codex.scope/tools/t-3606592-9709008` and exported `AKROGON_TOOL_CGROUP`.
  - Patched `bash-env` adding `[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0` launched via `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'`:
    - `--expand-environment=no` passed `$$` untouched (`sh_pid=3607784 seat_pid=3607784`).
    - Bash-wrapped seat PID `3607785` stayed at `.../probe-seat.scope` with `AKROGON_TOOL_CGROUP=unset`.
    - Forked child `bash -c ...` (PID `3607787`) landed in `.../probe-seat.scope/tools/t-3607787-9711716` with `AKROGON_TOOL_CGROUP` set.
    - Real `codex --version` exited `0`; child `omarchy-agent-account-home` created one empty `tools/t-3606620-9709010` dir and exited while the `codex` root PID stayed at the scope root.

---

## 2. Material forks

### Fork 1: How the seat's own process is told apart from a tool shell

- **Option 1A — Seat root PID marker (`AKROGON_SEAT_PID=$$` exported by a POSIX `sh -c` `exec` trampoline in `src/seat.ts` `startSeat`, skipped in `src/tool-cgroup.ts` `placementShell` when `$$ = AKROGON_SEAT_PID`) (Recommended):**
  - `startSeat` wraps the harness launch inside the scope after `env ...` with `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` (or unified with `agyWrap`: `export AKROGON_SEAT_PID=$$ PATH=...:$PATH; exec "$0" "$@"`). Because `sh` does not source `BASH_ENV` (confirmed on Arch `/bin/sh -> /usr/bin/bash`, POSIX mode, and `tests/tool-entry.test.ts:60`), `sh` records `launched.pid` in `AKROGON_SEAT_PID` and `exec`s the harness in the same PID.
  - `placementShell` (`src/tool-cgroup.ts`) adds one line right after the `AKROGON_SEAT_CGROUP` presence check: `[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0`.
  - `spawnHelper` (`src/tool-cgroup.ts`) scrubs `AKROGON_SEAT_PID` beside `AKROGON_SEAT_CGROUP` and `AKROGON_TOOL_CGROUP`.
  - *Honors every `seat-shell-kill` lock:* per-shell `tools/t-` cgroups, `Delegate=yes`, bootstrap `tools/`/`akrogon/`/`helpers/`, `scopeEntry` exact scope suffix match, `sweepScope` untouched, `argv[0]` of `hc run` stays `systemd-run` (D13 `recoveredShellSeat`).
  - *What this could break or invite later:*
    - Startup helper subshells spawned by a wrapper (`omarchy-agent-account-home` at `omarchy-agent-account-exec:27`, or `mise install` on first run) have `pid != AKROGON_SEAT_PID`, so they mint one short-lived `tools/t-<child>-<start>` dir that empties immediately on exit. `sweepScope` removes it on the next `commitMove`. Minor side effect: the first `tool_kill` timing row reports `seen >= 1` even if `codex` ran zero tools (slightly noisier entry-health signal on the first phase move only; `populated` stays `[]`).
    - A hypothetical future wrapper that **forks** a second `#!/bin/bash` script without `exec` which then `exec`s the real agent (`bash w1 [P]` -> fork `bash w2 [Q]` -> `exec agent [Q]`) would place `Q` into `tools/t-Q-...` (standard wrappers — `mise`, `omarchy-agent-account-exec`, `/usr/bin/pi`, `env` — all use `exec`).
    - Any existing test asserting rigid argv indices between `env` and `harness.argv[0]` would need adjustment (checked `tests/next.test.ts`, `tests/tool-entry.test.ts`, `tests/hc-start.test.ts`: none do; all match by `--model`, `TMPDIR=`, `--unit=`, `cmd.at(-2)`, or `systemd-run` after `--`).

- **Option 1B — Skip by wrapper path/name allowlist in `placementShell` (e.g. skip `$0 = /usr/share/omarchy/bin/omarchy-agent-account-*`):**
  - *What it breaks or invites later:* Hardcodes Omarchy paths into akrogon; fails on any renamed or non-Omarchy `#!/bin/bash` wrapper (`mise`, `asdf`, `nix`, custom wrapper) for `codex`, `pi`, or future harnesses; violates `seat-shell-kill` Q5 (no process-name selection rules).

- **Option 1C — Switch `codex` from `BASH_ENV` to `PATH` wrapper (`tool-entry/bash`, like `agy`) or resolve the real `codex` binary directly bypassing `mise`/`omarchy-agent-account-exec`:**
  - *What it breaks or invites later:*
    - `PATH` shadowing misses `/bin/bash` / `$SHELL` absolute-path tool spawns by `codex` (violating `seat-shell-kill` Q3/F5) and still self-places any future `#!/usr/bin/env bash` wrapper.
    - Bypassing `omarchy-agent-account-exec` breaks Omarchy multi-account `CODEX_HOME` selection (`omarchy-agent-account-exec:26-32`) and mise shim `PATH` restoration (`lines 50-55`).

- **Option 1D — Relax `scopeEntry` to accept `<scope>/tools/...`, or gate `placementShell` on `[ -d "$AKROGON_SEAT_CGROUP/tools" ]`:**
  - *What it breaks or invites later:*
    - Relaxing `scopeEntry` is **broken**: `codex` lives inside `tools/t-<seatPid>-<start>`, no tool shell gets its own `t-`, and the next `commitMove` (`sweepScope`) kills `codex` itself via `cgroup.kill`.
    - Gating on `[ -d "$AKROGON_SEAT_CGROUP/tools" ]` is **racy** (if `startSeat`'s bootstrap creates `tools/` before `omarchy-agent-account-exec` finishes `mise` dispatch, `codex` still moves into `tools/` and dies on phase advance) and violates `seat-shell-kill` `[R2]`.

- **Option 1E — Dedicated `<scope>/seat/` sub-cgroup:**
  - *What it breaks or invites later:* Moving the seat into `<scope>/seat/` without a PID check either keeps `AKROGON_SEAT_CGROUP=<scope>/seat` (same self-placement bug) or keeps `AKROGON_SEAT_CGROUP=<scope>` (no child tool shell ever matches `<scope>`, breaking `seat-shell-kill` completely).

### Fork 2: Which harness kinds get the `sh -c` `AKROGON_SEAT_PID=$$` trampoline?

- **Option 2A — Uniform for every leaf seat in `src/seat.ts` `startSeat` (Recommended):**
  - Replace `agyWrap` with one `seatWrap`:
    - `agy`: `['sh', '-c', \`export AKROGON_SEAT_PID=$$ PATH=${quote(entryDir)}:$PATH; exec "$0" "$@"\`]`
    - all other kinds: `['sh', '-c', 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"']`
  - *Why:* Single launch shape; protects `codex`, `pi`, every future `BASH_ENV` harness, AND protects `agy`/`claude` against any future `#!/usr/bin/env bash` wrapper (since `placementShell` is shared by both `bash-env` and `tool-entry/bash`).
  - *What it could break:* Adds `sh -c` `exec` hop to `claude` and `pi` starts (negligible ~1 ms cost; `exec` replaces `sh`, preserving `launched.pid` and `argv[0] = systemd-run`).
- **Option 2B — Only `BASH_ENV` kinds (not `claude` or `agy`):**
  - Leaves `claude` and `agy` argv untouched, but splits the trampoline logic into two branches (`agyWrap` + `bashEnvWrap`) and leaves `agy` exposed if wrapped by `#!/usr/bin/env bash`.

### Fork 3: PID alone (`AKROGON_SEAT_PID=$$`) vs PID + start time

- **Option 3A — PID alone (`[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0`) (Recommended):**
  - While the seat root PID `P` is alive, Linux cannot reuse PID `P` for any child shell. Zero `/proc/$$/stat` read on the skipped seat-root path.
- **Option 3B — PID + start time (`$$-<field22>`):**
  - Adds `/proc/$$/stat` parsing inside the `sh -c` trampoline before `exec` and before the skip guard in `placementShell` for an unreachable case (PID wraparound only possible after PID `P` has already exited, when the seat is dead).

---

## 3. Lifetime pitfalls and what removes each

1. **Breaking already-running seats when `refreshToolEntry` overwrites `~/.akrogon/tool-entry/{bash,bash-env}`:**
   - *Pitfall:* Live seats started under release `e3ec4b02` have `AKROGON_SEAT_CGROUP` set and `AKROGON_SEAT_PID` **unset**. If `placementShell` wrote `[ -n "${AKROGON_SEAT_PID:-}" ] || return 0`, the refreshed entry file would silently disable tool placement for every already-running `pi`/`claude`/`agy` seat!
   - *Removal:* Write `[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0`. When `AKROGON_SEAT_PID` is unset, `$$` (`"12345"`) `!= ""` is true, so already-running seats keep placing tool shells unchanged.
2. **GNU Bash last-command `exec` optimization in tests (`/bin/sh -> /usr/bin/bash`):**
   - *Pitfall:* In Probe 2D, `sh -c 'export AKROGON_SEAT_PID=$$; bash -c ...'` implicitly `exec`d the final `bash -c` inside the same PID `$$`, causing the supposed "child tool shell" to inherit `$$ == AKROGON_SEAT_PID` and skip placement!
   - *Removal:* Any test simulating a seat spawning a child tool shell must prevent the last-command `exec` optimization (e.g., append `; true` or `rc=$?; exit $rc`, or have a script/process fork the child shell).
3. **`tests/stand-in.sh` uses `#!/bin/sh` and never reproduced the bug:**
   - *Pitfall:* `tests/tool-entry.test.ts` launches `stand-in.sh` (`#!/bin/sh`) under the name `codex`, which never sources `BASH_ENV`.
   - *Removal:* Add a real-boundary test in `tests/tool-entry.test.ts` that (a) tests `placementShell` with `AKROGON_SEAT_PID=$$` on a `#!/bin/bash` seat wrapper that stays at the scope root and forks a child bash that *does* land in `tools/t-`, and (b) starts a seat via `startSeat` (`akrogon seat`) whose `codex` binary on `standinBin` is a `#!/bin/bash` wrapper ending in `exec stand-in.sh "$@"` (mirroring `omarchy-agent-account-exec`), proving `startSeat` succeeds, the seat PID stays at `<scope>`, and a child bash spawned by it lands in `<scope>/tools/t-` (red on base, green after).
4. **POSIX `sh -c` argument ordering (`exec "$0" "$@"` without `--`):**
   - *Pitfall:* Passing `['sh', '-c', '...', '--', ...harness.argv]` sets `$0` to `--` and fails; passing `['sh', '-c', 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"', ...harness.argv, ...]` matches `agyWrap` (`src/seat.ts:327`) and passes every token of `harness.argv` and `task` verbatim without shell expansion.
5. **`systemd-run --scope --expand-environment=no` and `$$`:**
   - *Verified by Probe 2 (2026-11-25):* `src/seat.ts:348` already passes `--expand-environment=no`, and `$$` reaches `sh -c` untouched (contrast `tests/leaf-slices.test.ts:330` which ran without `--expand-environment=no`).
6. **`tools/` bootstrap ordering with startup subshells (`omarchy-agent-account-home`):**
   - *Verified:* `placementShell` already runs `mkdir -p "$AKROGON_SEAT_CGROUP/tools"` (`src/tool-cgroup.ts:36`) and `startSeat` runs `mkdirSync(..., { recursive: true })` (`src/seat.ts:397`), so a startup child creating `tools/` before `startSeat`'s bootstrap succeeds cleanly.
7. **Deployment & recovery of the two failed framework leaves:**
   - *Note:* `origin/main` is `9a7cf416`, installed `~/.akrogon/current` is `e3ec4b02`. Once this fix lands on `main` and deploys via `self-update`, the next `akrogon seat` / `akrogon next` refreshes `~/.akrogon/tool-entry/{bash,bash-env}` atomically and launches codex seats with `AKROGON_SEAT_PID`. Recovering the two failed framework leaves (`h1-from-seo-plan`, `canonical-list-binding`) is operational follow-up outside the code change.

---

## 4. Surfaces to touch

### Code
- `src/seat.ts` (`startSeat`):
  - Replace `agyWrap` (`lines 326-327`) with `seatWrap` exporting `AKROGON_SEAT_PID=$$` (and `PATH=${quote(entryDir)}:$PATH` for `agy`) before `exec "$0" "$@"`.
- `src/tool-cgroup.ts`:
  - `placementShell` (`lines 27-50`): add `[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0` right after the `AKROGON_SEAT_CGROUP` check.
  - `spawnHelper` (`line 235`): add `key === 'AKROGON_SEAT_PID'` to the scrubbed-env list beside `AKROGON_TOOL_CGROUP` and `AKROGON_SEAT_CGROUP`.

### Tests
- `tests/tool-entry.test.ts`:
  - Update the `startSeat` argv test (`lines 226-288`) if needed to assert `AKROGON_SEAT_PID=$$` in the launch trampoline while preserving `argv[0] = systemd-run` and `agy`'s `PATH` check.
  - Add real-scope proof in `scopeScript()` / `the entry places a bash tool shell...` covering: (1) `AKROGON_SEAT_PID=$$` keeps a `#!/bin/bash` seat wrapper at `<scope>` with `AKROGON_TOOL_CGROUP` unset; (2) a forked child `bash` from that seat PID lands in `<scope>/tools/t-<child>-<start>`; (3) unset `AKROGON_SEAT_PID` (already-running pre-deploy seat) still places child shells normally.
  - Add real-core `startSeat` proof (red on base, green after): a `#!/bin/bash` `codex` wrapper script that `exec`s `stand-in.sh "$@"` starts cleanly via `akrogon seat`, stays at `<scope>` (not `<scope>/tools/...`), and its child tool bash (via stand-in hook or script) lands in `<scope>/tools/t-`.
- `tests/tool-entry-tracing.test.ts`:
  - Verify unchanged pass (traced shell with `AKROGON_SEAT_PID` unset and set).
- `tests/tool-kill.test.ts` / `tests/hc-start.test.ts` / `tests/next.test.ts`:
  - Run to confirm no regression from `seatWrap` (`sh -c`).

### Docs
- `src/AREA.md`:
  - `src/seat.ts` bullet (`line 18`) and `src/tool-cgroup.ts` bullet (`line 21`): note `AKROGON_SEAT_PID` exported via the `sh -c` `exec` trampoline and skipped by `placementShell` so bash-wrapped harnesses stay at the seat scope root.

---

## 5. Practitioner questions

1. **Uniform trampoline (Option 2A) vs `BASH_ENV`-only (Option 2B):** Should `claude` also run through `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` for one uniform launch shape (and future `#!/usr/bin/env bash` wrapper safety), or only `agy` + `BASH_ENV` kinds?
2. **`seen` count from `omarchy-agent-account-home` on first move:** Is one harmless empty `tools/t-<helperPid>-<start>` dir from `omarchy-agent-account-exec`'s startup subshell acceptable (swept cleanly on the first `commitMove`, zero impact on `codex` or `populated`), or is there any reason to care that `seen >= 1` on a codex seat's first phase move even when it ran no bash tools?
3. **Manual/direct route verification:** Free tests (`tests/tool-entry.test.ts`, `tests/tool-entry-tracing.test.ts`, `tests/tool-kill.test.ts`, `tests/hc-start.test.ts`, plus the repo `test` check) plus a free real-scope probe of `codex --version` prove the fix with zero paid runs; confirm no paid codex seat launch is required before landing.
