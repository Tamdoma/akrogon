# Fork notes, slot C: tool-cgroup

Date: 2026-11-25  
Fork: `/home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/tool-cgroup.md` (`## Question`, `### Carries`).

Evidence tiers used below:
- **Tier 1**: Local empirical probe on this host, inspected repo source file/function, or installed harness binary/docs.
- **Tier 2**: Primary upstream documentation or upstream repository source/issues read via web search.
- **Tier 3**: Model knowledge (marked explicitly where used).

---

## Q1 — Granularity and the caller

### Pick, reason, and cost
- **Pick: `a`** — One cgroup per tool shell (`<seat scope>/tools/t-<id>`). `src/phase.ts:commitMove` writes `'1'` to `cgroup.kill` on every populated `t-*` of every leaf seat scope except the caller's own `t-*` cgroup, captured once before Q2 moves the CLI process out. The phase tool call returns normally.
- **Reason**:
  - Eliminates F1 (fork-loop late children), F3/F8 (migration across scope boundary), F9 (frozen processes left behind on `SIGINT`/`PASS_DEADLINE_MS`), F10 (exit polling under home-wide `.lock`), and F11 (PGID lineage overkill) in one kernel-atomic operation per leftover tool cgroup.
  - Caller sparing becomes one exact string comparison against the caller's own `tools/t-*` path instead of a `/proc` ancestry walk.
  - The reporting seat receives exit `0` and `moved <phase>` cleanly, finishes its turn normally, and (for Claude) unmasks to `done` / advances `turn` as soon as the earlier background `t-*` cgroups die (P1b).
- **Cost**:
  - One `mkdir` + `cgroup.procs` write per top-level tool shell (< 1 ms, no D-Bus).
  - Best-effort `rmdir` of empty (`populated 0`) `tools/t-*` directories at sweep (and optionally on wrapper entry) so empty directories do not accumulate across long leaves.
  - A background child started inside the *same* tool command as `akrogon phase` (e.g. `sleep 600 & akrogon phase ...`) survives that advance (though any later advance kills it). That is narrower and far less likely than the incident's earlier-tool-call background loop.

### Rejected options
- **`b` (one `shells/` cgroup per seat + detached helper waiting for the caller's tool shell to exit)**:
  - Reintroduces out-of-band lifecycle and cross-phase races. Once `commitMove` returns, `phaseWake` (`src/next.ts:phaseWake`) or `listen` can dispatch the next phase; if the detached helper fires late, it can kill a *new* phase's tool shell inside `shells/`.
  - If the caller's tool shell itself spawned a background child keeping it open, the helper waits indefinitely or needs a timeout (bringing back F10/stuck-state failure modes).
  - If the detached helper crashes or is killed before writing `cgroup.kill`, the leftover shells silently survive with no timing row or warning at `commitMove`.
- **`c` (one `shells/` cgroup per seat, killed in `commitMove` including the caller's tool shell)**:
  - Kills `akrogon phase`'s parent tool shell mid-command even if `akrogon phase` itself moved out under Q2a. The harness sees the `akrogon phase` tool call terminated by `SIGKILL` (exit 137) instead of exit `0`, prompting retries or erroneous failure reports. If `akrogon phase` did not move out, it also kills `akrogon phase` before `logMove`, `appendTiming`, lock release, `mergeWake`, and `phaseWake` (`src/akrogon.ts`, `src/phase.ts:commitMove`).

### Evidence
- **Tier 1 (empirical probes, 2026-11-25, Linux `7.2.15-5-omarchy`, `cgroup2fs`, `systemd 262.2-1-arch`)**:
  - `map-C.md` Obs 1 & Obs 5: In a throwaway `Delegate=yes` scope, a fork-looping `bash` (`while true; do sleep 60 & sleep 0.05; done`) in `tools/t-1` went from 6–7 processes to `0` (`populated 0`, exit 137) on a single `echo 1 > tools/t-1/cgroup.kill`, while a sibling simulated caller in `tools/t-2` survived and exited `0`.
- **Tier 1 (inspected code, 2026-11-25)**: `src/phase.ts:commitMove` and `phaseCommand` (home-wide `.lock` held across `commitMove`), `src/akrogon.ts` (`case 'phase'` calls `mergeWake` and `phaseWake` after `phaseCommand`), `src/listen.ts:listenCommand` (`PASS_DEADLINE_MS` kills pass PGID with `SIGKILL`).
- **Tier 1 (charting proof, 2026-11-25)**: `issues/chart/seat-turn-idle/forks/shell-sweep.md` `## Charting proofs` P1b (Claude flips to `done` and advances `turn` after `SIGKILL` of background tool shell).
- **Tier 2 (primary docs, read 2026-11-25)**: Linux kernel cgroup v2 `docs.kernel.org` `admin-guide/cgroup-v2.rst` (`cgroup.kill` kills the cgroup and descendants via `SIGKILL` atomically against concurrent forks and migrations).

### Pitfalls and what removes each
- **Pitfall 1 — Caller-cgroup amnesia when combined with Q2a**: If Q2a moves `akrogon phase` out of `tools/t-caller` into `<seat>.scope/akrogon/` at startup, reading `procRoot()/self/cgroup` later inside `commitMove` returns `.../akrogon/`, so `commitMove` fails to spare `tools/t-caller` and kills its own parent tool shell!
  - *Removal*: Capture and cache the pre-migration `tools/t-*` path inside `leaveToolCgroup()` *before* writing `cgroup.procs`, and have `commitMove` spare that cached path (falling back to current `procRoot()/self/cgroup` when not migrated).
- **Pitfall 2 — Blocking on `rmdir` under `.lock`**: Immediately after `cgroup.kill`, the kernel may still be reaping processes (`EBUSY` on `rmdir`). Polling for empty under `.lock` would reintroduce F10.
  - *Removal*: Never poll after `cgroup.kill`. Only best-effort `rmdir` directories that already read `populated 0` in `cgroup.events` (ignoring `EBUSY`/`ENOENT`); dirs still draining get reaped on the next sweep, next wrapper entry, or leaf close.
- **Pitfall 3 — Empty `tools/t-*` accumulation over a long leaf**: Hundreds of tool calls without `rmdir` approach `cgroup.max.descendants` (observed present in cgroupfs in `map-C.md` Obs 5; limit semantics Tier 3 model knowledge).
  - *Removal*: Prune `populated 0` `t-*` dirs opportunistically on sweep and/or wrapper entry.
- **Pitfall 4 — Turning timing observability back into a kill filter**: Reading `cgroup.procs`/`comm` before `cgroup.kill` to populate a `shell_sweep` timing row could accidentally gate the kill if coded carelessly.
  - *Removal*: Gate `cgroup.kill` solely on `cgroup.events` containing `populated 1` (and `dir !== callerToolCgroup`). Treat any pre-kill PID/comm read as best-effort metadata only.

### Unasked question
- Should a `shell_sweep` timing row (`src/timing.ts`) record only killed tool-cgroup count / errors (simplest, matches atomic kill), or also a best-effort pre-kill snapshot of PIDs and program names (preserving diagnostic visibility into *what* was left running)?

---

## Q2 — akrogon's own processes

### Pick, reason, and cost
- **Pick: `a`** — Every `akrogon` CLI process that starts inside a `<seat>.scope/tools/t-*` cgroup moves itself out to `<seat>.scope/akrogon/` at startup (before locks, records, or captures), caching its original `tools/t-*` path in memory. Call the same idempotent helper at the start of `src/run-check.ts:checkedRun` as a safety net for direct library calls in tests.
- **Reason**:
  - Structurally eliminates both **F2** (a `run-check` writer killed mid-capture/publish leaving abandoned captures) and **F12** (acquiring home-wide `admission.lock` under `.lock`) with *zero* lock coordination between sweep and admission.
  - Also protects every other `akrogon` CLI command (`phase`, `next`, `pack`, `verify`, `sync`, `pull`, `close`) from being `SIGKILL`ed mid-lock, mid-git-operation, or mid-state-write if a cross-seat or operator `commitMove` sweeps a sibling tool shell.
  - Strictly scoped: the helper checks `/proc/self/cgroup` and only moves if the process is currently inside `<seat>.scope/tools/t-*`. Nested `akrogon` calls inside `run-check` payloads (in `akrogon-run-*.scope`) or outside leaf seats are untouched.
  - Preserves `src/admission.ts:callerScope()` unchanged: its regex `/\/([^/]+\.scope)/g` still extracts `<seat>.scope` from `.../<seat>.scope/akrogon`.
- **Cost**:
  - One ~15-line idempotent helper `leaveToolCgroup()` invoked at the top of `src/akrogon.ts` (before `migrateStateHome()` and command dispatch) and idempotently in `src/run-check.ts:checkedRun`.
  - Requires fixing `src/run-check.ts:checkedRun` publish-vs-echo ordering (see Pitfall 2).

### Rejected options
- **`b` (only the `run-check` writer moves out, at the start of `checkedRun`)**:
  - Leaves a race window between `akrogon run-check` startup and `checkedRun` entry (while `requireRepo`/`leafTarget` run git commands), and leaves every other `akrogon` subcommand (`phase`, `pack`, `sync`, `next`, `verify`) exposed to mid-lock or mid-write `SIGKILL` during an operator or cross-seat phase move.
  - Saves essentially zero complexity compared to `a` (the exact same `leaveToolCgroup()` function just moves up to `src/akrogon.ts`).

### Evidence
- **Tier 1 (empirical probe, 2026-11-25)**: `map-C.md` Obs 6: In a throwaway `Delegate=yes` scope, a child process inside `tools/t-1` wrote `$BASHPID` to sibling `runs/cgroup.procs` and survived `echo 1 > tools/t-1/cgroup.kill` cleanly while its parent shell in `tools/t-1` died with exit 137.
- **Tier 1 (inspected code, 2026-11-25)**:
  - `src/akrogon.ts` (single CLI entrypoint for all verbs).
  - `src/run-check.ts:checkedRun` (opens `captureOut` after `withAdmission`, echoes `process.stdout.write(result.stdout)` *before* writing `check-*.log` and unlinking `captureOut`/`captureErr`).
  - `src/admission.ts:callerScope` (extracts last `*.scope` segment from `procRoot()/self/cgroup`, so `<seat>.scope/akrogon` resolves to `<seat>.scope`).
  - `src/stop.ts:stopLeaf` and `src/reconcile.ts:stopSlice` (stopping `leafSlice` stops `<seat>.scope` and its `akrogon/` child together).

### Pitfalls and what removes each
- **Pitfall 1 — Erasing caller `tools/t-*` identity for Q1a**: See Q1 Pitfall 1.
  - *Removal*: Cache the pre-migration `tools/t-*` path in memory before moving to `akrogon/`.
- **Pitfall 2 — `EPIPE` in `checkedRun` after parent shell death recreates abandoned captures**: If `tools/t-rc` (the parent bash waiting on `akrogon run-check`) is killed by `cgroup.kill`, the `run-check` writer in `akrogon/` survives, finishes the payload, and hits `process.stdout.write(result.stdout)` in `src/run-check.ts:checkedRun`. If that throws `EPIPE` before `writeFileSync(kept, ...)` and `unlinkSync(captureOut)`, the capture pair is abandoned!
  - *Removal*: In `checkedRun`, write `kept`, append `check_end`, and unlink `captureOut`/`captureErr` *before* writing to `process.stdout`/`process.stderr`, and ignore `EPIPE` on stdout/stderr writes (also in `runCheck`'s final summary line on `process.stderr`).
- **Pitfall 3 — Direct library callers in tests**: Unit tests importing `checkedRun` or `commitMove` bypass `src/akrogon.ts`.
  - *Removal*: Call `leaveToolCgroup()` idempotently at both `src/akrogon.ts` startup and `checkedRun` entry.
- **Pitfall 4 — `akrogon/` directory missing on legacy seats or unit tests**:
  - *Removal*: If `AKROGON_AKROGON_CGROUP_DIR` (or sibling `akrogon/` beside `tools/`) does not exist or is unwritable, treat migration as a no-op / best-effort (never crash `akrogon` startup on legacy seats or read-only test fixtures).
- **Pitfall 5 — Child processes spawned by `akrogon` inherit `akrogon/`**: Short-lived `git`/`hc`/`flock` children of `akrogon` exit with `akrogon` (and `run-check` payloads already move to `akrogon-run-<uuid>.scope` via `systemd-run`). `reconcile`/`stop` still kill `akrogon/` when stopping `leafSlice`.

### Unasked question
- During an operator-forced move (e.g. `akrogon phase <slug> failed`), if a seat is running a *foreground* `akrogon run-check`, is killing its parent tool shell `tools/t-rc` (while the writer in `akrogon/` finishes publishing cleanly with zero abandoned captures) the desired behavior, or should `tools/t-rc` also be best-effort spared when a live `RunRecord` exists? (Killing `tools/t-rc` is simpler, race-free, and also unmasks a Claude seat that left `akrogon run-check &` in the background.)

---

## Q3 — Harness entry

### Pick, reason, and cost
- **Pick: `a`** — One akrogon-owned wrapper logic with the exact-seat-cgroup guard, wired per harness kind in `src/seat.ts:startSeat`:
  - `claude`: `CLAUDE_CODE_SHELL=<akrogon executable wrapper named bash>` + `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` (do *not* set `BASH_ENV` on `claude`).
  - `pi` and `codex`: `BASH_ENV=<akrogon sourced script>` (and for `codex`, verify whether `shell_environment_policy` ever strips `BASH_ENV`; optionally pin `-c shell_environment_policy.set.BASH_ENV=...` only if needed).
  - `agy`: `PATH=<akrogon-seat-bin>:$PATH` where `<akrogon-seat-bin>/bash` is the executable wrapper (which sources the same logic and `exec`s `/usr/bin/bash "$@"`); do *not* rely on `BASH_ENV` alone for `agy`.
- **Reason**:
  - Matches each installed harness's verified shell-resolution path on this host without triggering known traps in each harness:
    - `claude` 2.1.332 explicitly honors `CLAUDE_CODE_SHELL` (any `X_OK` path containing `"bash"` or `"zsh"`) *only* for the Bash tool — never wrapping MCP servers and avoiding Claude's `!j_("BASH_ENV")` Stop-hook check.
    - `pi` 1.6.0 hardcodes `/bin/bash -c` (ignoring `$SHELL` and `PATH`) inheriting `getShellEnv()`, so `BASH_ENV` intercepts all bash tool calls — including any user extension that replaces the built-in `bash` tool — with zero CLI flag collisions.
    - `codex` 0.172.0 calls `getpwuid` (`pw_shell`, `/usr/bin/bash` on this host), ignoring `$SHELL` and `PATH`, and invokes `<pw_shell> -lc` / `-c`; GNU bash executes `BASH_ENV` in both `-c` and `-lc` modes, and Codex shell snapshots explicitly replay/protect `BASH_ENV`.
    - `agy` 1.5.16 spawns bare `bash -c` via `LookPath` on `PATH`, while its binary lists `BASH_ENV` alongside `PERL5LIB` and `GEM_PATH` (security/env denylist risk), making a `PATH` `bash` wrapper the safe route for `agy`.
  - The exact-seat-cgroup guard (`current cgroup === $AKROGON_SEAT_CGROUP`, then `unset BASH_ENV`) guarantees nested bash scripts inside a tool shell stay inside the same `tools/t-<id>` and `run-check` payloads (which inherit `PATH` via `src/run-check.ts:constructedEnv`) are fast no-op passthroughs.
- **Cost**:
  - Two tiny companion files (one sourced cgroup-entry script for `BASH_ENV`, plus a 3-line executable `bash` wrapper that sources it and `exec /usr/bin/bash "$@"`) installed at a stable path, plus a 4-way switch in `src/seat.ts:startSeat`.
  - Ongoing maintenance when harnesses upgrade (mitigated by one cheap verification probe per harness upgrade).

### Rejected options
- **`b` (`BASH_ENV` only, for every harness)**:
  - High risk of silently failing on `agy` 1.5.16 (`BASH_ENV` appears next to `PERL5LIB` and `GEM_PATH` in the binary's denylist strings).
  - Unnecessarily triggers `claude` 2.1.332's `!j_("BASH_ENV")` Stop-hook check and causes any MCP server or hook invoking `bash -c` under `claude` to enter `tools/t-*`, when `claude` provides a clean Bash-tool-only `CLAUDE_CODE_SHELL` override.
- **`c` (per-harness native settings such as `CLAUDE_CODE_SHELL_PREFIX` and a `pi` extension, no shared wrapper)**:
  - **`CLAUDE_CODE_SHELL_PREFIX` is actively harmful**: inspected `claude` 2.1.332 binary proves `CLAUDE_CODE_SHELL_PREFIX` ALSO wraps stdio MCP servers (`o.type === "stdio"`), putting MCP servers inside `tools/t-*` and killing them on every phase advance! It also disables Claude's internal bash checks and fails if `BUN_OPTIONS` is disturbed.
  - **Cannot cover `codex` or `agy`**: neither `codex` 0.172.0 (upstream feature requests `openai/codex#16579`, `#48678`) nor `agy` 1.5.16 has a Linux shell-path or shell-prefix setting.

### Evidence
- **Tier 1 (inspected binaries/docs/host, 2026-11-25)**:
  - `/home/ivan/.local/share/mise/installs/claude/2.1.332/claude`: shell resolver `a()`/`S()` (`[CLAUDE_CODE_SHELL, SHELL]` filtered by `includes("bash") || includes("zsh")` + `accessSync(X_OK)`); MCP stdio spawn wraps with `CLAUDE_CODE_SHELL_PREFIX`; built-in `tengu_tool_memory_cgroup` opts out on `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`; Stop-hook check `!j_("BASH_ENV")`.
  - `/usr/lib/pi-coding-agent/pi` (`1.6.0`) & `/usr/lib/pi-coding-agent/docs/shell-aliases.md`: `getShellConfig()` hardcodes `/bin/bash -c` unless `shellPath` in `settings.json`; `createLocalShellOperations()` passes `getShellEnv()`.
  - `/home/ivan/.local/share/mise/installs/codex/0.172.0/bin/codex`: `__CODEX_SNAPSHOT_REPLAYED_BASH_ENV` in snapshot script; `getent passwd` on this host is `/usr/bin/bash`.
  - `/home/ivan/.local/share/mise/installs/antigravity-cli/1.5.16/antigravity` & live `ps` on own `agy` session: `agy` spawns bare `bash -c ...`; binary contains `BASH_ENV` adjacent to `PERL5LIB` and `GEM_PATH`.
  - `map-C.md` Obs 5: GNU bash executes `BASH_ENV` on `-c`, `-lc`, and `--norc --noprofile -c`, and skips it on `/bin/sh -c`.
  - `src/run-check.ts:constructedEnv`: copies `PATH` (does not copy `BASH_ENV`, `CLAUDE_CODE_SHELL`, or `AKROGON_*` tool markers).
- **Tier 2 (primary upstream sources, read 2026-11-25)**: `openai/codex` `codex-rs/shell-command/src/shell_detect.rs` (`default_user_shell()` -> `get_user_shell_path()` via `getpwuid`, ignoring `$SHELL`) and issues `#3916`, `#16579`, `#48678`; Claude Code `CLAUDE_CODE_SHELL` / `CLAUDE_CODE_SHELL_PREFIX` docs; Pi `pi.dev` `shellPath` / `shellCommandPrefix` docs; Antigravity CLI `settings.json` docs (no shell override key).

### Pitfalls and what removes each
- **Pitfall 1 — Sourced vs executed wrapper confusion**: `BASH_ENV` is *sourced* inside an existing `bash` process (cannot `exec` or `exit`), while `CLAUDE_CODE_SHELL` and `PATH`'s `bash` are *executed* (must `exec /usr/bin/bash "$@"`).
  - *Removal*: Put the cgroup-enter logic in one sourced helper (`enter-tool-cgroup.sh`), and make the executable `bash` wrapper source that helper and then `exec /usr/bin/bash "$@"` (using an explicit absolute path `/usr/bin/bash` — never `bash` on `PATH` — to prevent infinite `PATH` recursion!).
- **Pitfall 2 — `CLAUDE_CODE_TOOL_MEMORY_LIMIT` collision**: Claude 2.1.332's built-in `tengu_tool_memory_cgroup` can move tool shells out of `tools/t-*` or write `cgroup.subtree_control`.
  - *Removal*: Pass `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` in `startSeat` for `claude`.
- **Pitfall 3 — Release-path churn across `selfUpdate`**: If `CLAUDE_CODE_SHELL` / `BASH_ENV` / `PATH` points into a versioned `~/.akrogon/releases/<sha>/...` folder that later gets cleaned up, long-lived seats' future tool calls break.
  - *Removal*: Point through a stable path (e.g. `~/.akrogon/current/...` or a stable generated file under the leaf temp dir / `~/.akrogon/bin/`, respecting `AKROGON_HOME` in tests).
- **Pitfall 4 — `agy` `PATH` and `codex` `BASH_ENV` not yet live-probed with real harnesses**: Binary inspection shows the mechanisms, but live harness env-filtering could still surprise us.
  - *Removal*: Run one minimal budgeted probe each for `agy` and `codex` (via `akrogon run-check --holder ...`) before locking the implementation plan.
- **Pitfall 5 — `codex` on a non-bash host login shell (`zsh` or `fish`)**: `BASH_ENV` will not execute if `/etc/passwd` `pw_shell` is not `bash`.
  - *Removal*: Document `/bin/bash` as the supported login shell for `codex` seats (and optionally warn at `startSeat` or add `ZDOTDIR` if `zsh` is ever used).
- **Pitfall 6 — Wrapper stdout/stderr pollution or non-zero exit breaking commands**: Any error message printed by `BASH_ENV` or the wrapper would corrupt command stdout/stderr or `set -e` scripts.
  - *Removal*: Keep the wrapper strictly silent (`2>/dev/null || true` on best-effort cleanup/move) and avoid leaving extra shell variables or changing shell options (`set`).

### Unasked question
- What should `startSeat` do for an unrecognized custom harness key added to `config.yaml` `harnesses` (neither `claude`, `codex`, `pi`, nor `agy`): attach both `BASH_ENV` and `PATH` shim by default, or refuse? (Defaulting to `BASH_ENV` + `PATH` shim gives best-effort coverage without breaking custom harnesses.)

---

## Q4 — Delegation

### Pick, reason, and cost
- **Pick: Add `-p Delegate=yes`** to the seat scope in `src/seat.ts:startSeat`.
- **Reason**:
  - Although creating child cgroups inside a non-delegated `--user --scope` *happens* to succeed on permissions today (because `user@1000.service` owns its cgroupfs subtree as the user, Probe Q4), Linux cgroup v2 and systemd enforce a **single-writer principle**: without `Delegate=yes`, systemd owns the scope's subtree and treats foreign sub-cgroups as unsupported interference that it may migrate, reset, or fail on during `daemon-reload`, property updates, or systemd upgrades.
  - Passing `-p Delegate=yes` explicitly transfers subtree ownership to akrogon under systemd's documented contract.
  - Omitting `Delegate=yes` does *not* prevent Claude 2.1.332's `tengu_tool_memory_cgroup` from activating (since the non-delegated scope directory is already `drwxr-xr-x ivan:ivan`), so `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` is needed either way.
- **Cost**: Two argv tokens (`'-p', 'Delegate=yes'`) in `src/seat.ts:startSeat`; zero runtime overhead.

### Rejected options
- **Create child cgroups without `Delegate=yes`**: Relies on an incidental user-instance permission artifact while violating `systemd.io/CGROUP_DELEGATION`'s single-writer rule; invites silent regressions on `systemctl --user daemon-reload` or future systemd releases for zero meaningful savings.

### Evidence
- **Tier 1 (empirical probes, 2026-11-25, systemd `262.2-1-arch`, Linux `7.2.15-5-omarchy`)**:
  - **Obs Q4 (recorded below)**: `systemd-run --user --scope --unit=akrogon-q4-no-<pid>.scope` without `Delegate=yes` showed `Delegate=no` and `drwxr-xr-x ivan:ivan`; `mkdir`, `cgroup.procs`, and `cgroup.kill` succeeded only via user ownership.
  - `map-C.md` Obs 1–3, 5–6: With `-p Delegate=yes`, `mkdir`, `cgroup.procs`, `cgroup.kill`, writer self-migration to `runs/`, and `systemctl --user stop <slice>` teardown all succeeded cleanly; `DelegateSubgroup=` on `.scope` was silently ignored (Obs 6).
- **Tier 2 (primary docs, read 2026-11-25)**: `systemd.io/CGROUP_DELEGATION` and `systemd.resource-control(5)` (single-writer principle; `Delegate=yes` prevents systemd from recursing into or clobbering application-managed sub-cgroups).

### Pitfalls and what removes each
- **Pitfall 1 — Writing `cgroup.subtree_control` while the harness stays in `<seat>.scope`**: Cgroup v2 forbids enabling controllers in `subtree_control` on a cgroup that directly contains processes (`-EBUSY`), and `DelegateSubgroup=` is ignored on `.scope` units (Obs 6).
  - *Removal*: Leave `<seat>.scope/cgroup.subtree_control` empty (verified empty by default in `map-C.md` Obs 1), never enable controllers inside the seat scope, and pass `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` so Claude does not touch `subtree_control` either.
- **Pitfall 2 — Race between `startSeat` creating `tools/`/`akrogon/` and the harness's first tool call**:
  - *Removal*: Bootstrap `<seat>.scope/tools` and `<seat>.scope/akrogon` inside the `systemd-run --scope -- ...` launch command *before* `exec`ing the harness (preserving `argv[0] === 'systemd-run'`, `t.pid === harness pid` for `src/transcript.ts`, and `scopeEntry` matching `/<slice>/<unit>`).
- **Pitfall 3 — Slice teardown leaving delegated sub-cgroups behind**:
  - *Removal*: Already handled — `src/reconcile.ts:subtreeHasProcess` recurses subdirectories, and `systemctl --user stop <leafSlice>` kills processes inside delegated sub-cgroups and cleans them up (`map-C.md` Obs 3).

### Unasked question
- Does `akrogon` run on any host or test container where systemd user delegation is restricted or cgroup v2 is unavailable? (In tests, `AKROGON_CGROUP_ROOT` already provides a filesystem boundary, and real-scope tests can check `/sys/fs/cgroup` writability just like existing `tests/leaf-slices.test.ts`.)

---

## Q5 — Width

### Pick, reason, and cost
- **Pick: Everything descended from a tool shell ends at phase advance (no parent-PID test at spawn); harness-direct non-shell children (`node_repl`, `codex-code-mode-host`, MCP servers) survive by placement in `<seat>.scope`.**
- **Reason**:
  - Atomic `cgroup.kill` on `tools/t-*` is only race-free because membership is determined by cgroup inheritance, not post-hoc process classification (removing F1, F6, F11).
  - A parent-PID test at spawn (`PPID == harness_pid`) is brittle and invites silent non-isolation:
    - Under `claude`, `CLAUDE_CODE_SHELL` already applies *only* to Bash tool invocations, not MCP servers.
    - Under `codex`, the seat is launched via a `mise` command wrapper (`/home/ivan/.local/share/mise/command-wrappers/bin/codex`) and `codex` 0.172.0 exposes `codex-code-mode-host` (`await tools.exec_command(...)`), plus PTY helpers — so a real tool shell's `PPID` is not guaranteed to match the initial seat bootstrap PID! A parent test at spawn would silently leave real tool shells in `<seat>.scope` where sweep never sees them, silently recreating the #157 stall.
    - Under `BASH_ENV` (`codex`/`pi`), a non-shell helper (`node_repl`, MCP server) itself stays in `<seat>.scope` and survives. Only a `bash -c` subprocess it spawns directly from `<seat>.scope` would enter `tools/t-*` — which is harmless for normal short-lived helper commands and only ends a bash subprocess left running across a phase boundary.
- **Cost**:
  - Deliberate contract shift from old `shell-sweep` Q2: detached daemons started *inside a tool shell* (e.g., a phase-local `ssh-agent` or dev server started via `nohup`/`setsid`) sit in `tools/t-*` and end at phase advance. Only host-level daemons outside `leafSlice` and harness-direct helpers survive across phases.

### Rejected options
- **Parent test at spawn (only shells whose parent is the harness or another tool shell)**:
  - Fails silently whenever a harness spawns tool shells via an intermediate process (`mise` wrapper, `codex-code-mode-host`, PTY helper, or subagent worker), leaving real leftover shells unisolated in `<seat>.scope`.
  - Still cannot preserve a tool-started `ssh-agent` (since the tool shell itself is already inside `tools/t-*` before it starts `ssh-agent`), so it does not even satisfy the old F6 detached-agent scenario while reintroducing fragile lineage rules!

### Evidence
- **Tier 1 (inspected binaries/files, 2026-11-25)**:
  - `which claude` / `which codex`: resolve to `/home/ivan/.local/share/mise/command-wrappers/bin/{claude,codex}` (wrapper binaries in front of the real executables).
  - `/home/ivan/.local/share/mise/installs/codex/0.172.0/bin/codex`: prompt/runtime string `"All nested tools are available on the global tools object, for example await tools.exec_command(...)"` (confirming tool commands can be dispatched from `codex-code-mode-host`, not only the top-level `codex` PID).
  - `issues/chart/seat-turn-idle/forks/shell-sweep.md` `## Charting proofs` P3 (`codex` holds `node_repl` and `codex-code-mode-host` as direct children; `claude` and `pi` hold only tool shells).
  - `issues/open/seat-turn-idle/shell-sweep/review-B.md` F1, F6, F11 (showing why lineage/parent/PGID heuristics repeatedly break on real process trees).

### Pitfalls and what removes each
- **Pitfall 1 — Contract ambiguity against old review-B F6**: Reviewers familiar with the stopped leaf may expect a tool-spawned `ssh-agent` to survive.
  - *Removal*: State explicitly in the new brief, design, and `docs/reference/state-and-phases.md` that *all* processes descended from a tool shell end at phase advance, while harness-direct helpers (`node_repl`, `codex-code-mode-host`, MCP servers) survive by living in `<seat>.scope`.
- **Pitfall 2 — A helper under `codex`/`pi` spawning a persistent `bash` daemon via `BASH_ENV`**: If an MCP server or `node_repl` ever keeps a persistent `bash` child alive across phases, `BASH_ENV` puts that child in `tools/t-*` and phase advance kills it.
  - *Removal*: For `pi`, switching to a bundled `-e` extension (`createBashTool` `shellPath`) isolates strictly the LLM `bash` tool if this is ever observed; for `codex`, `node_repl` and `codex-code-mode-host` themselves are non-bash and stay in `<seat>.scope`.

### Unasked question
- Is there any known repo check, skill, or workflow where a seat intentionally starts a detached daemon inside a tool shell in phase N and requires it to stay alive in phase N+1?

---

## Q6 — Seat scope lookup at kill time

### Pick, reason, and cost
- **Pick: Scan the leaf slice directory (`sliceCgroup(leafSlice(repo, state.slug, homePath()))`) for seat `*.scope` directories containing a `tools/` subdir.**
- **Reason**:
  - **Zero `hc` IPC under home-wide `.lock`**: `src/phase.ts:phaseCommand` holds `.lock` across `commitMove`. Scanning `sliceCgroup(leafSlice)` is pure local `readdirSync` (< 1 ms), never stalls other repos on a slow/wedged `hc` core (`HC_DEADLINE_MS` = 60 s), and still sweeps if `hc` is unreachable or the harness crashed (`pid: null`).
  - **Zero `state.yaml` schema change (Signposts 3a & 6a)**: `seatRefSchema` in `src/state.ts` is a `z.strictObject`. Adding a new `unit` field would break older akrogon binaries reading `state.yaml` until upgraded; scanning the leaf slice adds zero schema fields.
  - **Sweeps replaced/crashed seats too**: When `dispatchSlot` replaces a lost seat, `startSeat` overwrites `state.seat[slot]`, leaving the old seat's scope unreferenced in `state.yaml` and gone from `hc`. Scanning `leafSlice` catches leftover `tools/t-*` in *every* seat scope of the leaf, closing the old design's replaced-seat residual for free.
  - **Clean test boundary**: `src/scope.ts:sliceCgroup` already routes through `cgroupRoot()` (`AKROGON_CGROUP_ROOT`), so sweep tests need no mock `hc` server just to locate seat scopes.
- **Cost**:
  - Needs one shared seat-scope unit naming/parsing helper in `src/scope.ts` (so `startSeat` and the sweep agree on how to match seat scopes and extract slot `A`/`B` for `shell_sweep` timing rows without inspecting `akrogon-run-*.scope`).

### Rejected options
- **Resolve each time from `hc`'s harness PID**:
  - Runs blocking `hc` subprocesses (`repoSpace` + `leafSeats`) while holding home-wide `.lock` (`src/phase.ts:phaseCommand`).
  - Fails when `hc` is down/refused, when the harness exited/crashed (`pid: null`), or when `hc` replaced the harness with a kept bare shell (whose PID is not in `<seat>.scope`), and misses replaced seats' old scopes.
  - Forces sweep tests to spin up or stub `hc` just for scope discovery.
- **Record the seat's scope unit (or cgroup path) in `state.yaml` at `startSeat`**:
  - Avoids `hc` IPC, so it is strictly better than `hc` PID lookup, **but** mutates strict `seatRefSchema` (`src/state.ts`, working against Signposts 3a & 6a) and still misses leftover tool shells in a replaced seat's previous scope once `seat[slot]` is overwritten.

### Evidence
- **Tier 1 (inspected code, 2026-11-25)**:
  - `src/scope.ts:leafSlice`, `sliceCgroup`, `cgroupRoot`, `runUnitBase` (every leaf has a unique `akrogon-l<hash>.slice`; only seat scopes, `akrogon-run-<uuid>.scope`, `akrogon-run-<uuid>-guard.service`, and `akrogon-land-*.service` live inside it).
  - `src/seat.ts:startSeat` & `src/hc.ts:seatName` (seat scope unit is `${sliceBase}-${seatName}-${hex}.scope` where `seatName` always ends in `-a` or `-b`).
  - `src/state.ts:seatRefSchema` (`z.strictObject({ session, address })`).
  - `src/phase.ts:phaseCommand` (holds home-wide `.lock` across `commitMove`).
  - `src/hc.ts:HC_DEADLINE_MS` (60 s per finite `hc` call).
  - `issues/open/seat-turn-idle/shell-sweep/review-B.md` F4 (seat-read failures through `hc` during sweep).

### Pitfalls and what removes each
- **Pitfall 1 — Matching a non-seat scope in `leafSlice`**: `akrogon-run-<uuid>.scope` also lives in `leafSlice`.
  - *Removal*: Centralize seat-scope unit formatting and parsing in `src/scope.ts` (matching the leaf's seat-scope pattern and rejecting `akrogon-run-*`) and also require a `tools/` subdir.
- **Pitfall 2 — `ENOENT` when the leaf has no loaded slice yet (e.g. operator move before any seat starts)**:
  - *Removal*: Treat `ENOENT` on `sliceCgroup(leafSlice)` as an empty set (no error, no warning). Treat an existing seat scope *without* `tools/` (legacy pre-rollout seat) as a structured warning + skip (no failure of the committed move).
- **Pitfall 3 — Duplicate slot rows if a replaced seat's old scope and the new seat's scope both have leftover `t-*`**:
  - *Removal*: Aggregate killed cgroups per slot (or emit one `shell_sweep` row per swept seat scope that killed anything or errored, carrying `slot` and optionally `unit`).

### Unasked question
- When a `seat_lost` replacement runs in `src/next.ts:dispatchSlot`, does `dispatchSlot` itself need to sweep the old seat's scope, or is letting `commitMove` (at phase advance) and `reconcile` (at leaf close) handle it enough? (Leaving it to `commitMove` + `reconcile` is enough because the old harness is dead and cannot mask `hc`, and Q6's slice scan cleans it on the next phase advance.)

---

## Recorded free observation (new in this round)

- **Obs Q4 — Non-delegated `--user --scope` sub-cgroup behavior** (free, 2026-11-25):
  - Identity: Linux `7.2.15-5-omarchy`, `cgroup2fs`, `systemd 262 (262.2-1-arch)`.
  - Command: `systemd-run --user --scope --quiet --unit=akrogon-q4-no-<pid>.scope -p CollectMode=inactive-or-failed -- bash -c '...'` (omitting `-p Delegate=yes`), inspecting `systemctl --user show -p Delegate`, cgroup dir permissions, `mkdir -p "$CG/tools/t1"`, moving `$BASHPID` (`sleep 30`), and writing `1` to `t1/cgroup.kill`.
  - Result: `Delegate` reported `no`, dir perms were `drwxr-xr-x ivan:ivan`; `mkdir`, `cgroup.procs` move, and `cgroup.kill` (exit 137) all succeeded due to user-manager filesystem ownership, despite lacking systemd delegation protection.
  - Cleanup: Removed `tools/t1` and `tools`; scope exited `0`; `systemctl --user list-units --all 'akrogon-q4-*'` returned empty.
  - Limits: Did not run `systemctl --user daemon-reload` on the live user manager to test systemd interference; systemd's single-writer rule is cited from primary `systemd.io/CGROUP_DELEGATION` docs.
