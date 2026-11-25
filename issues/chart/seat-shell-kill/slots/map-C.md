# Territory map, slot C: seat-shell-kill

Date: 2026-11-25  
Subject: Re-chart of stopped leaf `seat-turn-idle/shell-sweep` (`Tamdoma/akrogon#157`).

## Executive diagnosis: why `shell-sweep` looped for 5 rounds

Every product defect in `issues/open/seat-turn-idle/shell-sweep/review-B.md` (F1–F3, F6, F8–F12) came from one root architectural choice: the stopped leaf let tool shells, harness helpers, the `akrogon phase` caller, and `run-check` writers share one flat `<seat>.scope` cgroup, then tried to reconstruct "which PIDs are leftover shells" from userland `/proc` and `cgroup.procs` snapshots while the kernel mutated parentage, process groups, cgroup membership, and run admission concurrently.

Grouping F1–F12 by failure class:

- **Tree/lineage selection races (F1, F6, F11)**: A looping shell forks a non-shell child (`git`/`sleep`) that gets reparented before the second scan (F1). Broadening the rule to all out-of-scope-parent orphans kills unrelated detached processes (F6). Using PGID lineage to recover reparented children kills non-shell direct children of the harness sharing a job-control PGID (F11).
- **Per-PID signal-time TOCTOU / boundary crossing (F3, F8)**: A selected PID (such as `systemd-run --user --scope` launching a `run-check` payload) migrates out of `<seat>.scope` before `SIGKILL` (F3) or `SIGSTOP` (F8).
- **Freeze/wait/lock regressions from patching the races (F9, F10, F12)**: Userland `SIGSTOP` leaves processes frozen in state `T` if `akrogon phase` is interrupted or killed by `listenCommand`'s `PASS_DEADLINE_MS` (`src/listen.ts:listenCommand`) (F9); polling for exit under home-wide `.lock` blocks all repos (F10); taking home-wide `admission.lock` exclusively inside `phase.ts` while holding home-wide `.lock` stalls every phase move across repos behind any unrelated repo's `lineLock` wait (`src/admission.ts:awaitTurn`) (F12).
- **Run-check writer exposure (F2)**: A `run-check` Bun writer sits inside a seat tool shell while its payload sits in a sibling run scope (`akrogon-run-<uuid>.scope`). Killing the writer after capture creation (`src/run-check.ts:checkedRun`) leaves an abandoned capture pair that blocks all later non-failed moves (`src/run-check.ts:abandonedCaptures`, `src/phase.ts:refuseAbandonedCaptures`).
- **Test/process hygiene (F4, F5, F7)**: Incomplete assertions, missing `Test-Change` trailer, and leaked `AKROGON_HOME` under `--no-isolate`. Not caused by the selection rule, though F4 was worsened by complex fake `/proc` state machines.

**Core shift**: Replace *post-hoc process classification* with *birth-time cgroup isolation*. Put each tool shell in its own cgroup when spawned, move `run-check` writers out of tool cgroups before capture creation, and end leftover tool cgroups with a single kernel-atomic write to `cgroup.kill`.

---

## 1. Mechanism comparison and actor placement

### Where each actor sits under each mechanism

| Mechanism | Harness + non-shell helpers (`node_repl`, `codex-code-mode-host`, MCP) | Leftover tool shell + descendants | Calling `akrogon phase` + its parent tool shell | `run-check` writer (Bun process) | `run-check` payload & guard |
| --- | --- | --- | --- | --- | --- |
| **M1a. Delegated per-tool-shell sub-cgroups (`Delegate=yes`, `<seat>.scope/tools/t-<id>`) + `cgroup.kill`** | `<seat>.scope` (never under `tools/`) | `<seat>.scope/tools/t-old` (killed atomically via `cgroup.kill`) | `<seat>.scope/tools/t-caller` (identified via `/proc/self/cgroup`, skipped) | Self-migrates from `tools/t-rc` into `<seat>.scope/runs` before opening captures (or spared per Fork 3) | Sibling units in `leafSlice`: `akrogon-run-<id>.scope` and `akrogon-run-<id>-guard.service` (`src/scope.ts:runUnitArgv`, `startRunGuard`) |
| **M1b. Sibling systemd tool scopes (`systemd-run --user --scope` per tool shell) + `cgroup.kill`** | `<seat>.scope` | `<leafSlice>/<seat>-tool-old.scope` (killed atomically via `cgroup.kill`) | `<leafSlice>/<seat>-tool-caller.scope` (skipped via `/proc/self/cgroup`) | Self-migrates to `<seat>.scope` or own writer scope, OR stays in `<seat>-tool-rc.scope` (F2 returns unless fenced) | Sibling units in `leafSlice` (unchanged) |
| **M1c. Single shared `<seat>.scope/tools` cgroup + `cgroup.kill`** | `<seat>.scope` | `<seat>.scope/tools` | **TRAP**: also in `<seat>.scope/tools` — `cgroup.kill` kills `akrogon phase` and its parent shell mid-command | **TRAP**: also in `<seat>.scope/tools` unless self-migrated | Sibling units in `leafSlice` |
| **M2. End whole `<seat>.scope` and relaunch or resume harness** | `<seat>.scope` (**killed on every phase move**) | `<seat>.scope` (killed with harness) | **TRAP**: calling seat is mid-tool-call inside `<seat>.scope`; synchronous kill kills caller before `logMove`/`phaseWake`, async kill cuts harness mid-turn | **TRAP**: inside `<seat>.scope` — killed during operator/cross-seat move unless moved to a sibling scope | Sibling units in `leafSlice` |
| **M3. `cgroup.freeze` on `<seat>.scope` + inspect/kill + thaw** | `<seat>.scope` (frozen during sweep) | `<seat>.scope` (still requires `/proc` selection rule) | **DEADLOCK TRAP**: `akrogon phase` runs inside `<seat>.scope` — freezing `<seat>.scope` freezes `akrogon phase` itself while holding `.lock` | `<seat>.scope` (frozen mid-capture/publish; still exposed to F2 unless locked) | Sibling units in `leafSlice` (outside freeze boundary) |
| **M4. Unmask `hc` / idle gate without killing shells** | Unchanged | Stays alive forever | Unchanged | Unchanged | Unchanged |

### Detailed evaluation of each mechanism

#### M1a. Delegated per-tool-shell sub-cgroups (`Delegate=yes`) + `cgroup.kill` (Recommended)
- **How it works**: `src/seat.ts:startSeat` adds `-p Delegate=yes` (and creates `<seat>.scope/tools` and `<seat>.scope/runs`, or the seat wrapper creates them lazily once inside the scope). Each top-level tool shell spawned by the harness enters a fresh child cgroup `<seat>.scope/tools/t-<pid>-<rand>` before executing the command. At `src/phase.ts:commitMove`, for each recorded seat of the leaf, akrogon resolves the seat's scope path, reads its own cgroup once from `procRoot()/self/cgroup`, and for every `tools/t-*` child dir that is not the caller's own cgroup (and is `populated 1` in `cgroup.events`), writes `'1'` to `cgroup.kill`. Empty `tools/t-*` dirs are best-effort `rmdir`'d with no wait.
- **Why per-tool-shell instead of one shared `tools/` cgroup (M1c)**: Because `akrogon phase` runs *inside* a tool shell. A shared `tools` cgroup cannot be `cgroup.kill`'d without killing `akrogon phase` and its parent bash shell before returning exit 0 to the harness (causing the agent to see exit 137 / failed phase call). Migrating the caller's parent bash out of a shared cgroup would reintroduce `/proc` ancestry walks and sibling races. Per-tool-shell `tools/t-<id>` reduces caller-sparing to one exact path string comparison against `/proc/self/cgroup`.
- **F1–F12 coverage**:
  - **Removes F1**: Kernel `cgroup.kill` terminates the entire cgroup subtree atomically against concurrent forks and reparenting (Linux kernel cgroup v2 docs, read 2026-11-25, `admin-guide/cgroup-v2.rst`; verified locally in Probe 2 and Probe 7).
  - **Removes F3 & F8**: `cgroup.kill` acts only on processes currently resident in `tools/t-*`; a process that already migrated to `akrogon-run-<id>.scope` is untouched, and there is no `SIGSTOP`.
  - **Removes F9 & F10**: No freeze/stop state to leak on `SIGINT`/`PASS_DEADLINE_MS`; single `writeFileSync(..., '1')` with no polling wait under `.lock`.
  - **Removes F11**: Harness direct children and non-shell helpers live in `<seat>.scope`, never in `tools/t-*`; no PGID heuristic exists.
  - **Removes F2 & F12** (when paired with Fork 3a writer self-migration to `<seat>.scope/runs`): `run-check` leaves `tools/t-*` before creating capture files, so sweep never touches `admission.lock` and never kills a live writer.
  - **Changes F6 (deliberate contract shift)**: Harness-owned non-shell helpers (`node_repl`, `codex-code-mode-host`, MCP servers) stay in `<seat>.scope` and survive. Detached daemons started *inside a tool shell* (like `ssh-agent -a <sock> -s` from review-B F6) stay in `tools/t-*` and *are* ended at phase advance.
- **What it could break or invite later**:
  - **Claude Code 2.1.332 built-in tool cgroup collision (verified in binary!)**: `claude` 2.1.332 contains `tengu_tool_memory_cgroup` (`CLAUDE_CODE_TOOL_MEMORY_LIMIT`), which inspects `/proc/self/cgroup`, enables memory controllers, and late-attaches tool shells into its *own* cgroup. In a `Delegate=yes` scope, Claude could fight over `subtree_control` (triggering cgroup v2 `-EBUSY` no-internal-processes errors) or move tool shells *out* of akrogon's `tools/t-*`! **Mitigation**: `startSeat` MUST pass `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` in the seat env (verified in binary: `if(r&&(pi(r)||r==="none")){e.dir=null;return}`).
  - **Harness shell-hook drift**: Relies on each harness's tool shell executing the cgroup-entry hook (see Fork 2). A harness update that bypasses the hook silently leaves tool shells in `<seat>.scope`, where sweeping `tools/*` will not find them.
  - **Empty cgroup dir accumulation**: Hundreds of sequential tool calls in a long leaf create hundreds of empty `tools/t-*` directories unless pruned opportunistically (e.g. best-effort `rmdir` of `populated 0` dirs at sweep and/or wrapper entry, plus systemd cleans the whole scope at leaf close).

#### M1b. Sibling systemd tool scopes (`systemd-run --user --scope` per tool shell) + `cgroup.kill`
- **How it works**: Instead of `Delegate=yes` on `<seat>.scope`, the tool-shell wrapper launches each tool shell via `systemd-run --user --scope --unit=<seat>-tool-<id>.scope --slice=<leafSlice> -p CollectMode=inactive-or-failed -- ...`. Sweep writes `'1'` to `cgroup.kill` on matching `<seat>-tool-*.scope` units under `sliceCgroup(leafSlice)`.
- **What it gains over M1a**: No `Delegate=yes`, no conflict with Claude's `tengu_tool_memory_cgroup`, automatic kernel/systemd GC of empty scopes via `CollectMode=inactive-or-failed` (verified in Probe 5).
- **What it breaks or invites later**:
  - **Per-command D-Bus + systemd unit overhead** on every single bash tool call (hundreds per leaf).
  - **Breaks `callerScope()` (`src/admission.ts:callerScope`) and `akrogon stop-run` (`src/stop-run.ts:stopRunCommand`)**: `callerScope()` extracts the last `*.scope` segment from `/proc/self/cgroup`, which becomes the ephemeral `<seat>-tool-<id>.scope` instead of `<seat>.scope`, so a later tool call running `akrogon stop-run` cannot find runs started by an earlier tool call — unless `startSeat` pins `AKROGON_SCOPE=<seat>.scope` (which interacts with `verify-pass` setting `AKROGON_SCOPE` and must be audited everywhere `callerScope()` is used).
  - **D-Bus failure mode**: If the user manager bus is transiently busy or cut, every tool call in the seat fails to start.
- **F1–F12**: Same removal profile as M1a, at higher latency and tighter coupling to `callerScope()` and D-Bus.

#### M2. End the whole seat scope and relaunch (or resume) the harness
- **How it works**: On phase advance, stop the seat's entire `<seat>.scope` (and `hc kill`/`rm`), then `startSeat` launches a fresh harness process (either fresh conversation or resuming the prior conversation ID via `src/transcript.ts`).
- **What it gains**: 100% harness-agnostic and shell-agnostic; kills everything including `zsh`/`fish`/direct-exec children and even masking non-shell helpers (`codex`'s `node_repl` if it ever masked). Removes F1, F3, F6, F8–F11 with zero shell wrappers or `Delegate=yes`.
- **What it breaks or invites later**:
  - **Calling-seat mid-tool-call paradox**: `akrogon phase` runs inside a tool call of the calling seat's active turn. Killing the calling seat synchronously kills `akrogon phase` itself before `logMove`, `appendTiming`, lock release, `mergeWake`, and `phaseWake` (`src/akrogon.ts` `case 'phase'`). Deferring the kill until the harness's turn ends reproduces the exact 4h50m stall (Claude stays `working` until the background shell dies, P1). Deferring the kill only until `akrogon phase` exits still SIGKILLs the harness mid-turn before it writes its `tool_result`/closing message or flushes its transcript — leaving dangling `tool_use` blocks that break API `--resume`.
  - **Context/cache destruction or brittle per-harness resume**: Fresh relaunch wipes prompt caches and multi-round context on every phase move (`plan -> implement -> check.review -> check.fix -> check.review`), raising token cost and latency, plus cold-starting MCP servers and `agy`'s trust dialog (`src/seat.ts:agyTask`) on every transition. Resuming trades per-harness *shell* coupling for heavier per-harness *resume* coupling (`claude --resume <id>`, `codex resume <id>` subcommand syntax that breaks `harnessArgv`'s `argv[0] === config.harness` and trailing-prompt layout, `pi --session-id <id>`, `agy --conversation <id>`).
  - **Still hits F2**: Killing `<seat>.scope` during an operator move still kills any `run-check` writer inside `<seat>.scope` unless writers also move to their own sibling scope.
  - **UX churn**: Kills and recreates `herdr-app` panes on every phase advance, losing scrollback.
- **Role**: Too costly and fragile as the primary phase-advance mechanism; viable only as an explicit future escape hatch / recovery path if a seat is wedged.

#### M3. `cgroup.freeze` on `<seat>.scope`
- **How it works**: Write `'1'` to `<seat>.scope/cgroup.freeze`, wait for `frozen 1` in `cgroup.events`, inspect/kill selected processes, write `'0'` to thaw.
- **What it removes**: Fixes F8 (kernel boundary prevents freezing a PID that migrated to `akrogon-run-*.scope`) and freezes forks/migrations during the scan (F1/F3 while frozen).
- **Why it is a dead end**:
  - **Instant self-deadlock**: `akrogon phase` runs inside `<seat>.scope` while holding home-wide `.lock` (`src/phase.ts:phaseCommand`). Writing `'1'` to its own scope's `cgroup.freeze` immediately freezes `akrogon phase` itself permanently, holding `.lock` until `listen.ts` kills the pass at `PASS_DEADLINE_MS` (20 min).
  - **Keeps F9**: `cgroup.freeze` is persistent kernel state, not fd-scoped. Even from an external process, `SIGINT`/`SIGKILL` before thaw leaves the entire seat (including the harness) frozen forever.
  - **Keeps F10**: Reaching `frozen 1` is asynchronous and can stall on uninterruptible (`D`) tasks while holding `.lock`.
  - **Keeps F6, F11, F2**: Freezing still does not classify processes; you still need a userland `/proc` selection rule and writer protection.

#### M4. Unmask `hc` / idle detection without ending shells
- **Blocked by lock**: `forks/seed-decision.md` `## Taken` locks *"Leftover seat shells end when the leaf's phase advances."*
- **Grounded fact from `hc schema` (hc 0.1.22, read 2026-11-25)**: `Terminal.status` is documented as *"The program's own word for what it's doing (OSC 7501 root record); null if it never said, or after it exited."* `hc` is relaying Claude Code's own OSC 7501 status (`working`, `"1 shell still running"`), not inventing it. Even if `hc` ignored it, leftover shells would keep holding worktree handles open (`src/reconcile.ts:pidsInside`).

---

## 2. Material forks

### Fork 1: How leftover seat tool shells end at phase advance
- **1a (Recommended)**: `Delegate=yes` on `<seat>.scope` + per-tool-shell sub-cgroups `<seat>.scope/tools/t-<id>` + kernel `cgroup.kill` on every populated `t-*` except the caller's own cgroup (`M1a`).
  - *Removes*: F1, F3, F8, F9, F10, F11 (and F2/F12 with Fork 3a).
  - *Invites later*: Must keep `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`, prune empty `tools/t-*` dirs, and track harness shell-hook compatibility across upgrades (Fork 2).
- **1b**: Sibling `systemd-run --user --scope` per tool shell + `cgroup.kill` (`M1b`).
  - *Removes*: Same F-classes as 1a plus avoids `Delegate=yes` / Claude cgroup interaction.
  - *Invites later*: Per-command D-Bus latency, `callerScope()` / `AKROGON_SCOPE` coupling with `stop-run` and `verify-pass`, failure if D-Bus hiccups.
- **1c**: Stop whole `<seat>.scope` and relaunch/resume harness (`M2`).
  - *Removes*: F1, F3, F6, F8–F11 without shell hooks.
  - *Breaks/invites*: Calling-seat mid-tool-call kill & dangling `tool_use` on resume, prompt-cache loss or per-harness resume fragility, F2 unless writers also leave `<seat>.scope`.

### Fork 2: How each harness places tool shells into `tools/t-<id>` (under 1a/1b)

Grounded empirical findings on the four installed harnesses (inspected 2026-11-25 on this host; user `/etc/passwd` shell is `/usr/bin/bash`):

| Harness & version | How it resolves & spawns its tool shell (verified) | Best hook(s) | Traps discovered |
| --- | --- | --- | --- |
| **`claude` 2.1.332** | Binary `a()`/`S()` checks `[CLAUDE_CODE_SHELL, SHELL]` filtered by `includes("bash") \|\| includes("zsh")` and `accessSync(X_OK)`. Spawns `<shell> -c ...`. | **`CLAUDE_CODE_SHELL=<wrapper-ending-in-bash>`** in `startSeat` env + **`CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`**. | **`CLAUDE_CODE_SHELL_PREFIX` is a trap**: binary `@385011262` proves it ALSO wraps stdio MCP servers (`type === "stdio"`), so sweeping `tools/*` would kill MCP servers; it also disables internal bash checks and fails if `BUN_OPTIONS` is altered. `BASH_ENV` also triggers a Claude Stop-hook guard (`!j_("BASH_ENV")`). |
| **`pi` 1.6.0** | `/usr/lib/pi-coding-agent/pi` `getShellConfig()` uses `settings.json` `shellPath`, else **hardcodes `/bin/bash -c`**, ignoring `$SHELL` and `PATH`. | **Option i**: Akrogon-bundled `--extension <path>` (`-e`, injected in `src/seat.ts:harnessArgv` beside `--session-id`; works even with `--no-extensions`) registering `createBashTool(cwd, { operations: createLocalBashOperations({ shellPath }) })`.<br>**Option ii**: `BASH_ENV` (works because `pi` spawns `/bin/bash -c` inheriting `getShellEnv()`). | A user extension replacing `bash` bypasses `shellPath`/`shellCommandPrefix` (`/usr/lib/pi-coding-agent/docs/shell-aliases.md`), whereas `BASH_ENV` catches any `/bin/bash -c` unless stripped. |
| **`codex` 0.172.0** | `codex-rs/shell-command/src/shell_detect.rs` `default_user_shell()` calls `getpwuid` (`pw_shell`), **ignoring `$SHELL`** (primary repo search + binary strings; upstream issues `openai/codex#16579`, `#48678`). Runs `<pw_shell> -lc` (or `-c` if `allow_login_shell=false`). | **`BASH_ENV=<enter-tool-cg.sh>`** in `startSeat` env (and/or `-c shell_environment_policy.set.BASH_ENV=...`). Empirically verified on this host: GNU `bash` sources `BASH_ENV` for `-c`, `-lc`, and `--norc --noprofile -c`. Codex shell snapshots explicitly preserve/replay `BASH_ENV` (`__CODEX_SNAPSHOT_REPLAYED_BASH_ENV`). | **Host login-shell gap**: if `/etc/passwd` `pw_shell` is `zsh` (needs `ZDOTDIR`) or `fish` (unsupported), `BASH_ENV` will not fire for `codex`. Also, `node_repl` / `codex-code-mode-host` stay in `<seat>.scope`, though if `node_repl` ever spawns `bash -c` it inherits `BASH_ENV` and that child bash enters `tools/t-*`. |
| **`agy` 1.5.16** | Live process tree on this host (`ps` on own `agy` 1.5.16 parent) shows `agy -> bash -c ...` (argv[0] is bare `bash`, resolved via `os/exec.LookPath` on `PATH`). No documented Linux CLI/settings shell-override key (web search + binary inspection). | **`PATH=<akrogon-seat-bin>:$PATH`** where `<akrogon-seat-bin>/bash` is the cgroup-entry wrapper (exec'ing `/usr/bin/bash`). | **Major `BASH_ENV` warning**: `BASH_ENV` appears inside `agy` 1.5.16 binary next to `PERL5LIB`/`GEM_PATH` (env/security denylist), so `agy` may strip or flag `BASH_ENV`! Verify `agy`'s `PATH` vs `BASH_ENV` behavior with one cheap probe before locking. Because `run-check` copies `PATH` (`src/run-check.ts:constructedEnv`), the `PATH` `bash` shim MUST be a strict no-op whenever `/proc/self/cgroup` is not *directly* `$AKROGON_SEAT_CGROUP`! |

**Universal wrapper invariant (shared by all hooks)**:
The cgroup-entry wrapper (whether invoked as `CLAUDE_CODE_SHELL`, `pi` extension `shellPath`, `PATH` `bash` shim, or `BASH_ENV`) checks `/proc/self/cgroup` and moves `$$` into `$AKROGON_TOOL_CGROUP_DIR/t-$$-<rand>` **if and only if** the process is currently directly in `$AKROGON_SEAT_CGROUP` (not already in `*/tools/*`, not in `*/runs`, not in `akrogon-run-*.scope`, not in another slice). It then unsets `BASH_ENV` (if set) before `exec /usr/bin/bash "$@"` (or returning in `BASH_ENV`). This guarantees:
1. Nested `bash` calls inside a tool shell stay inside their parent's `t-<id>` (zero fracturing, zero extra cgroups).
2. `run-check` payloads (which inherit `PATH` via `src/run-check.ts:constructedEnv`) are in `akrogon-run-*.scope` != `$AKROGON_SEAT_CGROUP`, so the wrapper is a zero-side-effect passthrough.

**Options for Fork 2**:
- **2a (Recommended — hybrid minimal set)**: Use the cleanest native hook where available (`CLAUDE_CODE_SHELL` for `claude`, `-e` or `BASH_ENV` for `pi`), `BASH_ENV` for `codex`, and `PATH` `bash` wrapper for `agy` — all pointing to the same tiny akrogon seat-shell wrapper/script with the exact-seat-cgroup guard.
  - *Invites later*: Four harness-specific touchpoints to keep under regression test (free tests can verify the wrapper + env/argv generation; one smoke probe per harness upgrade verifies real tool-shell cgroup placement).
- **2b (Universal `BASH_ENV` only)**: Single env var in `startSeat`, zero harness branching.
  - *Breaks*: Likely stripped/flagged by `agy` (binary denylist evidence), triggers Claude's `!j_("BASH_ENV")` check, fails POSIX `/bin/sh` and non-bash `pw_shell`, and fires if a non-shell helper (`node_repl`/MCP) runs `bash -c`.
- **2c (Universal `PATH` `bash` shim only)**: Fails `pi` (hardcodes `/bin/bash`) and fails `codex` (uses `getpwuid` absolute path `/usr/bin/bash`).

### Fork 3: Where `run-check` writers sit and how capture integrity is protected (F2 & F12)
- **3a (Recommended — writer self-migrates to `<seat>.scope/runs`)**: At the start of `src/run-check.ts:checkedRun` (before `withAdmission` and before creating `capture-*-out.log`), if the writer's own `/proc/self/cgroup` is under `<seat>.scope/tools/*`, the writer moves `process.pid` into `<seat>.scope/runs` (proven in Probe 9; `callerScope()` still returns `<seat>.scope`). Also write `kept` and unlink `captureOut`/`captureErr` *before* echoing `result.stdout`/`stderr` (or ignore `EPIPE` on stdout/stderr) so a killed parent shell cannot abort publishing.
  - *Removes*: **F2 and F12 completely** — zero lock between sweep and admission! Even if `tools/t-rc` dies at any microsecond: before migration, no captures exist yet; after migration, the writer is outside `tools/` and finishes publishing cleanly.
  - *Sub-choice 3a-i (kill `tools/t-rc` anyway)*: Unmasks a Claude seat even if it left a background `akrogon run-check &` running, while the writer finishes publishing cleanly in `runs/`. (Note: on an operator-forced move to `failed`, a foreground `run-check`'s parent bash shell gets SIGKILLed while the writer finishes publishing in the background.)
  - *Sub-choice 3a-ii (also best-effort spare `tools/t-rc` if a live writer already recorded its parent tool cgroup)*: Preserves foreground `run-check` output on operator moves, while `<seat>.scope/runs` eliminates the F2 race window with zero lock. (Trade-off: a background `run-check &` would keep Claude masked until it finishes.)
- **3b (Writer stays in `tools/t-rc`, fenced by a per-leaf lock instead of `admission.lock`)**: Keeps `run-check.ts` mostly untouched and preserves foreground shell subtrees, removing F12's cross-repo stall, **but** still needs a new lock protocol shared by `run-check` and `phase` sweep, and keeps F2's conceptual complexity (and leaves background `run-check` masking the seat).
- **3c (Launch `run-check` writer in its own sibling systemd unit)**: Clean isolation without `Delegate=yes` for runs, **but** adds a 3rd systemd unit per check (writer + guard + payload) and requires wrapping `akrogon run-check` startup.

### Fork 4: Detached non-shell daemons started inside a tool shell (F6) & rollout on legacy seats (Signpost 6a)
- **4a (Recommended — clean phase-isolation contract, no `/proc` fallback)**:
  - Every process descended from a tool shell (including `nohup`/`setsid` daemons or a tool-started `ssh-agent`) lives in `tools/t-*` and ends at phase advance. Only processes started directly by the harness (harness itself, `node_repl`, `codex-code-mode-host`, MCP servers) live in `<seat>.scope` and survive.
  - Legacy seats launched before this release (whose `<seat>.scope` lacks `Delegate=yes` / `tools/`) skip sweep cleanly with a structured warning (no migration needed, Signpost 6a).
  - *What it could break*: Any workflow that intentionally starts a detached daemon inside a tool shell in phase N and expects it to stay alive in phase N+1 (e.g. a per-seat `ssh-agent` started by the agent, review-B F6). In akrogon's workflow, each phase is supposed to be self-contained and host `ssh-agent` lives outside the leaf slice, so ending tool-spawned daemons is arguably *better* hygiene — but it is a deliberate contract change from the stopped brief's Q2.
- **4b (Fallback `/proc` sweep for legacy seats or unhooked shells)**: Keeps the entire F1/F6/F11 bug surface alive in production for a one-time rollout window. Not worth it.

### Fork 5: Sweep timing and the `seed-decision.md` F1 residual
- **5a (Recommended — sweep in `commitMove`, leave F1 residual out of this leaf)**: Sweep runs in `src/phase.ts:commitMove` after `saveState` and `logMove` (non-blocking, no wait under `.lock`, warns on failure and never fails the committed move). Keeps `forks/seed-decision.md` `## Findings` F1 (a shell started *after* the seat's `akrogon phase` call in the same turn, or a turn ending without a phase call while a shell runs) as a separate chart if observed in practice.
- **5b (Add periodic listener wake + quiet-period sweep now)**: Even with `tools/t-*` cgroups, `hc` still cannot distinguish a genuine long tool turn from an ended turn masked by a background shell (P1). Adding a timer risks killing real long-running commands unless paired with per-harness transcript turn-end parsing (`src/transcript.ts`). Out of proportion for this re-chart (Signpost 4a).

### Fork 6: Recovered bare-shell seat (`#157` part 2, old Q3)
- **Keep old Q3a unchanged**: `live` terminal with `status === null` and either parked (`pid === null`, `reason` set and `!== 'spawn_pending'`) or spawned (non-empty `argv`, `argv[0] !== 'systemd-run'`, `foreground.name` in shell set `{sh, bash, dash, zsh, fish, ash, ksh, nu}` — matching `hc --help`'s `shell = ["nu"]` recovery setting). Used only in `src/next.ts:dispatchSlot`'s lost branch, charging `lost` up to 3.
- **Verified compatibility**: Adding `-p Delegate=yes` to `src/seat.ts:startSeat` keeps `argv[0] === 'systemd-run'`, so Q3's spawned predicate is completely unaffected.

---

## 3. Practitioner questions and pitfalls over the work's lifetime

1. **Claude 2.1.332 built-in cgroup (`tengu_tool_memory_cgroup`) conflict** *(inspected binary `/home/ivan/.local/share/mise/installs/claude/2.1.332/claude`, 2026-11-25)*:
   - If `Delegate=yes` makes `<seat>.scope` writable and `CLAUDE_CODE_TOOL_MEMORY_LIMIT` is not set to `none`, Claude can create its own sub-cgroup, write `subtree_control`, and late-attach tool shell PIDs (`pt()`/`Aer()`), pulling them out of akrogon's `tools/t-*` or breaking `mkdir`/`cgroup.procs` with `-EBUSY`. Always set `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` in `startSeat` for `claude` seats (and monitor future Claude releases in case that opt-out env var is renamed).
2. **`DelegateSubgroup=` does NOT work on `.scope` units** *(empirically probed on systemd 262.2-1-arch, Probe 8, 2026-11-25)*:
   - Passing `-p DelegateSubgroup=harness` to `systemd-run --user --scope` exits 0 and is silently ignored — the process stays directly in `<seat>.scope`. Because `cgroup.subtree_control` in `<seat>.scope` stays empty, keeping the harness directly in `<seat>.scope` while placing tool shells in `<seat>.scope/tools/t-*` and writers in `<seat>.scope/runs` works cleanly without violating the cgroup v2 no-internal-processes rule (verified in Probes 2, 3, 7, 9). Do NOT enable controllers in `<seat>.scope/cgroup.subtree_control` while processes live directly in `<seat>.scope`!
3. **`src/seat.ts:scopeEntry` and `cgroupOf` boundary** *(inspected `src/seat.ts:scopeEntry`, `src/seat.ts:cgroupOf`, `src/scope.ts:procRoot`)*:
   - `cgroupOf(pid)` currently reads `/proc/${pid}/cgroup` directly instead of `procRoot()`. It must route through `procRoot()` for testability (same correction as old leaf review). Because the harness stays directly in `<seat>.scope`, `scopeEntry`'s `cgroup.endsWith('/' + slice + '/' + unit)` continues to work unchanged.
4. **Creating `tools/` and `runs/` dirs before the harness spawns tools**:
   - In `startSeat`, systemd creates `<seat>.scope` when `systemd-run --scope` runs, *after* `hc run` spawns the process. Either wrap the seat launch command (`sh -c 'cg=/sys/fs/cgroup$(sed -n "s/^0:://p" /proc/self/cgroup); mkdir -p "$cg/tools" "$cg/runs"; export AKROGON_SEAT_CGROUP="$cg" AKROGON_TOOL_CGROUP_DIR="$cg/tools" AKROGON_RUN_CGROUP_DIR="$cg/runs"; exec ...'`) inside `systemd-run --scope -- ...` — note this does NOT change `argv[0]` (`systemd-run`) — OR have `startSeat` create them after `scopeEntry()` returns. Doing it inside the seat bootstrap before `exec`ing the harness guarantees zero race between `startSeat` and the harness's very first tool call (and works identically if `akrogon` is restarted).
   - *Pitfall*: Check `src/transcript.ts:fromProcess` and `seatPids`! If the bootstrap uses `exec` before launching the harness, `t.pid` IS the harness PID (same as today's `systemd-run ... -- env ... <harness>` where `env` `exec`s the harness), so `src/transcript.ts` is completely unaffected!
5. **`src/run-check.ts:checkedRun` stdout/stderr ordering & EPIPE** *(inspected `src/run-check.ts:checkedRun`)*:
   - Today `checkedRun` writes `process.stdout.write(result.stdout)` and `process.stderr.write(result.stderr)` *before* writing the permanent `check-*.log` and unlinking `captureOut`/`captureErr`. Under Fork 3a-i (parent shell in `tools/t-rc` killed while writer lives in `runs/`), an unhandled `EPIPE` on `stdout`/`stderr` would abort `checkedRun` before unlinking captures, recreating abandoned captures! Publishing `check-*.log`, appending `check_end`, and unlinking captures *before* echoing (plus swallowing `EPIPE` on echo) closes that hole permanently.
6. **`src/run-check.ts:constructedEnv` strips seat vars, but copies `PATH`** *(inspected `src/run-check.ts:constructedEnv`)*:
   - `constructedEnv` does NOT copy `BASH_ENV`, `CLAUDE_CODE_SHELL`, or `AKROGON_TOOL_CGROUP_DIR` (good: check payloads stay clean). It *does* copy `PATH`. Under Fork 2a (`agy` `PATH` `bash` shim), the shim MUST verify `/proc/self/cgroup` matches `$AKROGON_SEAT_CGROUP` (and fast-exec `/usr/bin/bash` otherwise) so `run-check` payloads and tests are unaffected — and check whether any test asserts `which bash === '/usr/bin/bash'` inside a seat!
7. **Empty cgroup dir cleanup & cgroup limits**:
   - Linux enforces `cgroup.max.descendants` / kernel cgroup count limits (model knowledge; web search not needed beyond observing `cgroup.max.descendants` exists in `ls` of Probe 6). Reaping empty `tools/t-*` dirs (`cgroup.events` has `populated 0`) via best-effort `rmdir` both during sweep and opportunistically on wrapper entry prevents accumulation over multi-hour leaves. Never poll waiting for `rmdir` after `cgroup.kill` under `.lock` (preserve Q1 no-wait).
8. **`reconcile.ts` and `stop.ts` interaction with delegated sub-cgroups** *(inspected `src/reconcile.ts:subtreeHasProcess`, `stopSlice`, `src/stop.ts:stopLeaf`; verified in Probe 4)*:
   - `subtreeHasProcess` already recurses into subdirectories under `leafSlice`.
   - `systemctl --user stop <leafSlice>` already kills processes inside `<seat>.scope/tools/*` and `<seat>.scope/runs` and removes the delegated sub-cgroups (verified in Probe 4).
9. **Observability (`shell_sweep` timing row) without turning observability back into a kill list**:
   - Reading `tools/t-*/cgroup.procs` and `<pid>/comm` *before* writing `'1'` to `cgroup.kill` is fine for best-effort `shell_sweep` timing metadata (`src/timing.ts`), provided the code **never** gates or filters the `cgroup.kill` write on that read! A `t-*` dir with `populated 1` in `cgroup.events` is killed unconditionally (unless it is the caller's cgroup). Also note `src/timing.ts:readTimings` strictly parses every row via `timingEventSchema` — adding a new `shell_sweep` kind means older builds reading newer `timings.jsonl` warn and return `[]` (same known trade-off accepted in old final-shape check).
10. **What if a seat launches `systemd-run --user --scope` directly (not via `run-check`) or runs a tool that creates its own systemd scope?**
    - Any process that leaves `<seat>.scope/tools/t-*` via `systemd-run` escapes `tools/t-*` (just like `run-check` payloads). Unless it runs inside `leafSlice` (which `reconcile` stops at leaf close), akrogon won't kill it at phase advance. That is acceptable and strictly safer than F3/F8 cross-scope kills.
11. **`observeBusy` (`src/next.ts:observeBusy`) and `silentEnd` (`src/next.ts:dispatchSlot`) checks carried from old design**:
    - Confirm `busy_since` clears when a previously masked seat flips to `done` (it does in `observeBusy` when `status !== 'working' && status !== 'blocked'`).
    - Confirm a recovered bare-shell seat (whose `turn` resets to `0`) cannot match `silentEnd` (`recordedPrompt.turn < seat.turn` is false when `seat.turn === 0`) and lands in the `seat_lost` branch.
12. **Unverified harness behaviors needing a quick probe before locking Fork 2**:
    - **`agy` 1.5.16**: Does `agy` honor a `PATH`-prepended `bash` shim, and does it strip `BASH_ENV`? (Not probed with a live `agy` launch here — paid launch requires `akrogon run-check` budget; worth a single budgeted probe or checking `agy` source/docs if available.)
    - **`codex` 0.172.0**: Confirm `codex` actually passes `BASH_ENV` through to `exec_command` tool shells under default `config.toml` (not stripped by `shell_environment_policy`), and check whether `codex` masks `hc` when a background shell runs.
    - **`pi` 1.6.0**: Confirm `-e <extension>` interacts cleanly with existing user extensions in `~/.pi/agent/extensions` and `pi`'s `--session-id` / `PI_SESSION_FILE` tracking (`src/transcript.ts`).

---

## 4. Recommended direction, cost, and open questions

### Recommended direction
**M1a + Fork 2a + Fork 3a-i (or 3a-ii) + Fork 4a + Fork 5a + Fork 6**:
1. Launch leaf seats with `-p Delegate=yes` (and `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` for `claude`), bootstrapping `<seat>.scope/tools` and `<seat>.scope/runs` before `exec`ing the harness.
2. Put each top-level harness tool shell into `<seat>.scope/tools/t-<pid>-<rand>` via one tiny idempotent wrapper (exact-seat-cgroup check), wired per harness (`CLAUDE_CODE_SHELL` for `claude`, `-e` extension for `pi`, `BASH_ENV` for `codex`, `PATH` `bash` shim for `agy`).
3. Have `src/run-check.ts:checkedRun` self-migrate its own Bun writer PID from `tools/t-*` into `<seat>.scope/runs` before opening captures, and publish/unlink captures before echoing stdout/stderr (with EPIPE tolerance).
4. In `src/phase.ts:commitMove` (non-blocking, no wait under `.lock`, no `admission.lock`), for each recorded seat of the leaf, skip the caller's own `t-*` cgroup from `procRoot()/self/cgroup`, write `'1'` to `cgroup.kill` on every other populated `tools/t-*` dir, best-effort `rmdir` empty `tools/t-*` dirs, record one `shell_sweep` timing row per seat that killed a cgroup or errored, and warn without failing the committed move on error.
5. Keep Q3a recovered bare-shell seat handling in `src/next.ts:dispatchSlot` and `src/hc.ts:terminalSchema`.

### Cost & trade-offs of this direction
- **Code surface**: Very small and clean — no `/proc` tree walker, no two-pass collector, no PGID heuristics, no `SIGSTOP`, no `admission.lock` coupling. Main new pieces are: (a) ~25-line seat-shell wrapper + bootstrap in `src/seat.ts`, (b) ~40-line cgroup.kill sweep in `src/seat.ts`, (c) ~15-line writer self-migration + publish-before-echo fix in `src/run-check.ts`, (d) tiny `pi` extension file if `-e` is chosen over `BASH_ENV`, (e) Q3 predicate in `src/hc.ts` & `src/next.ts`.
- **Test surface**: Dramatically simpler and stronger than `shell-sweep` — real `systemd-run --user --scope -p Delegate=yes` throwaway-scope tests can directly exercise a real tight-looping `bash` + `sleep` + reparenting + concurrent `run-check` writer self-migration and verify 0 survivors with real kernel `cgroup.kill`, alongside `AKROGON_CGROUP_ROOT` / `AKROGON_PROC_ROOT` unit tests.
- **Ongoing cost**: Must maintain the 4-harness hook wiring as harnesses upgrade, keep `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`, and accept that `codex` on a non-bash `/etc/passwd` login shell (`zsh`/`fish`) would need an extra hook (`ZDOTDIR`) or remain uncovered.

### Questions not settled by intake (for operator or autopilot door A)
1. **Tool-spawned detached daemons (F6 contract boundary)**: Is it accepted that *everything* started inside a seat tool shell (including a detached `ssh-agent` or `nohup` daemon) ends at phase advance, while only harness-direct helpers (`node_repl`, `codex-code-mode-host`, MCP servers) survive? (Recommended: **yes** — clean phase isolation, removes F6/F11 permanently.)
2. **Foreground `run-check` parent shell during an operator-forced move (Fork 3a-i vs 3a-ii)**: Once the `run-check` writer has self-migrated to `<seat>.scope/runs` (guaranteeing zero abandoned captures), should the sweep still kill the parent shell `tools/t-rc` (simpler, unmasks a seat that left `akrogon run-check &` running) or best-effort spare `tools/t-rc` when a live writer is recorded (preserves foreground caller's shell on operator moves, but leaves background `run-check &` masking)? (Recommended: **3a-i** — simplest, zero race, unmasks background checks; `run-check` still publishes cleanly.)
3. **Non-bash login shells for `codex`**: Does akrogon need to support hosts where the user's `/etc/passwd` `pw_shell` is `zsh` or `fish` (requiring `ZDOTDIR` for `zsh` and still having no clean hook for `fish`), or is `/bin/bash` (or `bash` + `zsh` via `BASH_ENV` + `ZDOTDIR`) the supported scope for `codex` seats? (Recommended: `BASH_ENV` + optional `ZDOTDIR` only if needed; this host is `/usr/bin/bash`.)
4. **Budgeted probes before handoff**: Should the chart run minimal budgeted checks (via `akrogon run-check --holder ...`) to verify tool-shell cgroup placement on real `claude` (confirming `CLAUDE_CODE_SHELL` + `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`), `codex` (`BASH_ENV`), `pi` (`-e` or `BASH_ENV`), and `agy` (`PATH` `bash` shim vs `BASH_ENV`)? (Recommended: yes for `agy` and `codex`, where binary inspection found real risks — `agy`'s `BASH_ENV` denylist string and `codex`'s `shell_environment_policy`.)

---

## 5. Recorded free observations (2026-11-25)

Host environment: Linux `7.2.15-5-omarchy`, `cgroup2fs`, `systemd 262 (262.2-1-arch)`, `hc 0.1.22`, `claude 2.1.332`, `codex 0.172.0`, `pi 1.6.0`, `agy 1.5.16`, passwd shell `/usr/bin/bash`.

- **Obs 1 — `Delegate=yes` + child cgroup + `cgroup.kill` on a tight fork loop** (free, 2026-11-25):
  - Command: `systemd-run --user --scope --quiet --unit=akrogon-probe-c2-<pid>.scope -p Delegate=yes -p CollectMode=inactive-or-failed -- bash -c '...'` creating `tool-1`, moving `$BASHPID` running `while true; do sleep 60 & sleep 0.05; done` into `tool-1`, writing `1` to `tool-1/cgroup.kill`.
  - Result: `cgroup.subtree_control` empty, `tool-1` created as `domain` cgroup owned by user, 7 live procs before kill -> `0` procs (`populated 0`) after single `echo 1 > tool-1/cgroup.kill`, loop exited 137, `rmdir` succeeded.
  - Cleanup: Scope exited 0; `systemctl --user list-units --all 'akrogon-probe-c*'` returned empty.
  - Limits: Synthetic bash loop, single host/kernel.
- **Obs 2 — Nested `tools/t1`, `tools/t2` selective kill + `cgroup.freeze`** (free, 2026-11-25):
  - Command: Throwaway scope in throwaway slice `akrogon-probe-c3-<pid>.slice` with `Delegate=yes`, two `sleep 300` processes in `tools/t1` and `tools/t2`.
  - Result: `echo 1 > tools/t1/cgroup.kill` ended `t1` (0 procs) while `t2` survived (1 proc). `echo 1 > tools/t2/cgroup.freeze` moved `t2` to `frozen 1`; `echo 1 > tools/t2/cgroup.kill` killed the frozen process (`populated 0 frozen 1`).
  - Cleanup: `rmdir` succeeded, `systemctl --user stop <slice>` exited 0.
- **Obs 3 — `systemctl --user stop <slice>` cleans delegated sub-cgroups** (free, 2026-11-25):
  - Command: Throwaway scope in `akrogon-probe-c4-<pid>.slice` with `Delegate=yes` leaving `sleep 300` inside `tools/t1`, then `systemctl --user stop <slice>`.
  - Result: Slice stop exited 0 and terminated the process inside the delegated `tools/t1` sub-cgroup.
  - Cleanup: Stopped parent `akrogon-probe.slice`; `systemctl --user list-units --all 'akrogon-probe*'` empty.
- **Obs 4 — Sibling scope `cgroup.kill` without `Delegate=yes`** (free, 2026-11-25):
  - Command: `systemd-run --user --scope` seat scope launching sibling `systemd-run --user --scope` tool scope (`akrogonprobe5<pid>-tool1.scope`) with `sleep 30 &`, then `echo 1 > <tool-scope>/cgroup.kill`.
  - Result: `cgroup.kill` was `--w------- ivan:ivan`; direct write succeeded and systemd immediately collected the empty scope (`ENOENT` on subsequent read).
  - Cleanup: `systemctl --user stop <slice>`, verified empty.
- **Obs 5 — `BASH_ENV` execution across bash modes + per-tool-cgroup idempotency** (free, 2026-11-25):
  - Command: `/bin/bash -c`, `/bin/bash -lc`, `/bin/bash --norc --noprofile -c`, `/bin/sh -c` with `BASH_ENV` set; followed by throwaway `Delegate=yes` scope (`akrogonprobe7<pid>.scope`) launching two `/bin/bash -c` tool shells (one fork-looping with a nested `/bin/bash -c`, one simulating `akrogon phase` caller).
  - Result: `BASH_ENV` ran in `-c`, `-lc`, and `--norc --noprofile -c`, and did NOT run in `/bin/sh -c`. In the scope probe, `t1` and its nested `/bin/bash -c` stayed in `tools/t-1575247-9538` with `BASH_ENV=unset`; `t2` landed in `tools/t-1575250-512`. Killing all `tools/t-*` except `t2`'s cgroup ended `t1` (6 procs -> exit 137) while `t2` survived and exited 0.
  - Cleanup: Temp `BASH_ENV` script removed, subdirs `rmdir`'d, `systemctl --user list-units --all 'akrogonprobe*'` empty.
- **Obs 6 — `DelegateSubgroup=` on `.scope` and `run-check` writer self-migration** (free, 2026-11-25):
  - Command: (a) `systemd-run --user --scope -p Delegate=yes -p DelegateSubgroup=harness -- bash -c 'cat /proc/self/cgroup'`; (b) throwaway `Delegate=yes` scope with parent shell in `tools/t-1` spawning a child that moves itself to sibling `runs/cgroup.procs`, followed by `echo 1 > tools/t-1/cgroup.kill`.
  - Result: (a) `DelegateSubgroup=harness` was silently ignored on `.scope` (process remained in `<unit>.scope`); (b) child migrated cleanly to `<unit>.scope/runs`, parent shell in `tools/t-1` died with exit 137, migrated child survived and completed normally (`runs/cgroup.procs` empty afterward).
  - Cleanup: `rmdir` succeeded, scopes exited cleanly.

## Primary sources consulted (2026-11-25)

- Inspected repo files: `src/seat.ts` (`harnessArgv`, `agyTask`, `cgroupOf`, `scopeEntry`, `startSeat`), `src/scope.ts` (`leafSlice`, `runUnitArgv`, `startRunGuard`, `stopRunUnits`, `sliceCgroup`, `unitPopulated`, `procRoot`, `cgroupRoot`), `src/phase.ts` (`commitMove`, `refuseAbandonedCaptures`, `completeOwner`, `transition`, `phaseCommand`), `src/next.ts` (`observeBusy`, `dispatchSlot`, `phaseWake`, `nextCommand`), `src/listen.ts` (`listenCommand`), `src/run-check.ts` (`constructedEnv`, `abandonedCaptures`, `checkedRun`), `src/admission.ts` (`withAdmissionLock`, `liveStartTime`, `liveRuns`, `awaitTurn`, `callerScope`, `withAdmission`), `src/reconcile.ts` (`subtreeHasProcess`, `stopSlice`, `pidsInside`, `leafSeats`, `reconcile`), `src/stop.ts` (`stopLeaf`), `src/stop-run.ts` (`stopRunCommand`), `src/transcript.ts` (`fromProcess`, `transcriptFor`), `src/timing.ts` (`timingEventSchema`, `readTimings`), `src/hc.ts` (`terminalSchema`), `src/akrogon.ts`, `docs/reference/config.md`.
- Local tool binaries/docs: `/usr/lib/pi-coding-agent/pi`, `/usr/lib/pi-coding-agent/docs/{settings,shell-aliases,environment-variables}.md`, `/home/ivan/.local/share/mise/installs/claude/2.1.332/claude`, `/home/ivan/.local/share/mise/installs/codex/0.172.0/bin/codex`, `/home/ivan/.local/share/mise/installs/antigravity-cli/1.5.16/antigravity`, `hc schema` (`hc 0.1.22`).
- Web primary docs (read 2026-11-25): Linux kernel cgroup v2 (`docs.kernel.org`, `cgroup.kill` and `cgroup.freeze`), systemd `systemd.resource-control(5)` (`Delegate=`, `DelegateSubgroup=`), `openai/codex` `codex-rs/shell-command/src/shell_detect.rs` (`default_user_shell`, `get_user_shell_path` via `getpwuid`) and issues `#3916`, `#16579`, `#48678`, Claude Code `CLAUDE_CODE_SHELL` / `CLAUDE_CODE_SHELL_PREFIX` docs, `pi` (`pi.dev`) `shellPath` / `shellCommandPrefix` docs, Antigravity CLI `settings.json` docs (no shell override key found).
