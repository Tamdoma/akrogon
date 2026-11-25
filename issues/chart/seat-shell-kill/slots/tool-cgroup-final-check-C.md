# Final-shape check, slot C: tool-cgroup (round: autopilot pick 2026-11-25)

Date: 2026-11-25  
Checked: `forks/tool-cgroup.md` (`## Taken`, `## Findings`).

## Defects

### D1. Q1 deferred caller kill can kill a tool shell in an unrelated leaf
- **Line (`## Taken`, Q1)**: *"The caller is the `t-` the akrogon process started in, from `/proc/self/cgroup` read before its Q2 relocation. For the caller's own `t-`, the relocated process spawns one detached helper (in `akrogon/`, no unit, no bus call) that waits, with no timeout, for that tool shell's pid plus start time to end, then writes that `t-`'s `cgroup.kill`."*
- **Concrete failure**: Taken does not require the caller's `t-` to belong to the *moved leaf's* slice (`sliceCgroup(leafSlice(repo, state.slug, homePath()))`). If a command inside a seat of **leaf X** runs `akrogon phase <leaf-Y> ...`, `commitMove` sweeps leaf Y's scopes and then spawns a deferred helper targeting leaf X's caller `t-`.
- **Fix**: Treat the starting `t-` as a caller of this move (and spawn the deferred helper) *only* when that `t-` sits inside one of the moved leaf's enumerated seat scopes under `sliceCgroup(leafSlice(repo, state.slug, homePath()))`. Otherwise the move has no caller `t-`.

### D2. Q1 deferred caller kill deadlocks when the caller tool shell becomes a zombie (`Z`)
- **Line (`## Taken`, Q1)**: *"waits, with no timeout, for that tool shell's pid plus start time to end, then writes that `t-`'s `cgroup.kill`."*
- **Concrete failure**: On Linux, an exited process not yet reaped by its parent (state `Z` in `/proc/<pid>/stat`) keeps `/proc/<pid>/stat` present with the exact same field-22 `starttime` (verified empirically in Probe A below). When a tool shell runs `sleep 600 & akrogon phase ...` without redirecting `sleep 600`'s stdio, and a harness reads stdout to EOF before calling `waitpid` (standard for pipe readers such as Go `os/exec.Cmd.Output`/`Run`), the tool shell exits into state `Z` while `sleep 600` holds stdout open. A helper polling only `pid + starttime` waits forever on the zombie while the harness waits forever on `sleep 600` — permanent deadlock.
- **Fix**: Treat `/proc/<pid>/stat` state `Z` (and `X`/`x`) as ended alongside `ENOENT` and start-time mismatch.

### D3. `Reporting` and `Residuals` contradict each other on entry-decay visibility
- **Lines (`## Taken`, `Reporting` and `Residuals`)**: *"each commitMove that killed or failed to kill appends one timing row with leaf, unit, the `t-` dirs that read populated before the write (report only, never acted on) and errors. A seat whose `tools/` stays empty while it works is the visible sign that entry stopped firing."* / *"Shells the entry misses ... escape until leaf close. The timing row makes that visible."*
- **Concrete failure**: When entry stops firing, `tools/` has zero `t-` dirs, so nothing is killed and nothing errors — under the stated trigger ("killed or failed to kill"), **no timing row is appended at all**. The timing row therefore cannot make entry decay visible.
- **Fix**: Either remove the claim that the kill-only timing row detects empty `tools/`, or explicitly record/warn when an enumerated seat scope's `tools/` directory has zero `t-` entries (neither empty nor populated `t-` dirs) and no caller `t-` from that scope (which also requires Obligation M3a below so `tools/` exists from seat start).

### D4. `Recovered bare-shell seat` drops the non-empty `argv` guard
- **Line (`## Taken`, `Recovered bare-shell seat`)**: *"Spawned: `foreground.name` in {sh, bash, dash, zsh, fish, ash, ksh, nu} and `argv[0]` not `systemd-run`."*
- **Concrete failure**: For an empty `argv: []`, `argv[0]` is `undefined`, and `undefined !== 'systemd-run'` evaluates to `true`, misclassifying an empty-`argv` terminal as a recovered bare shell. This drops the earlier correction in `issues/chart/seat-turn-idle/forks/shell-sweep.md` `### Final-shape check` (*"require a non-empty launch `argv` whose first word is not `systemd-run`"*).
- **Fix**: Require `argv.length > 0 && argv[0] !== 'systemd-run'`.

---

## Missing obligations

### M1. Q1 deferred helper must detach stdio (`stdin`/`stdout`/`stderr` closed / `/dev/null`)
- If the detached helper spawned by `akrogon phase` inherits `stdout` or `stderr` from `akrogon phase`, the harness (or a calling pipeline/command substitution) waits for pipe EOF from the helper while the helper waits (with no timeout) for the tool shell to exit — guaranteed mutual deadlock. Taken must require spawning the helper with detached stdio (`ignore` / `/dev/null`), `setsid`/`detached`, and `unref()`.

### M2. `src/run-check.ts:checkedRun` must publish and unlink captures before echoing stdout/stderr and tolerate `EPIPE`
- Under Q1 + Q2, killing `tools/t-rc` terminates the parent shell holding the read end of `akrogon run-check`'s stdout/stderr pipes while the writer lives on in `<seat scope>/akrogon/`.
- Today `src/run-check.ts:checkedRun` calls `process.stdout.write(result.stdout)` and `process.stderr.write(result.stderr)` *before* `await ownerRefusal(...)`, `writeFileSync(kept, ...)`, `appendTiming(check_end)`, and `unlinkSync(captureOut)`/`unlinkSync(captureErr)`.
- Empirically in Bun on this host (Probe B below), `process.stdout.write` to a broken pipe crashes the process with exit code `1` on an unhandled `EPIPE` error at the next event-loop tick (`await ownerRefusal`), aborting before `unlinkSync(captureOut)` and leaving an abandoned capture pair on disk — re-creating the exact failure class of review-B F2 despite Q2 relocation!
- **Obligation**: In `checkedRun`, run `ownerRefusal`, `writeFileSync(kept, ...)`, `appendTiming(check_end)`, and `unlinkSync(captureOut)`/`unlinkSync(captureErr)` *before* writing to `process.stdout`/`process.stderr`, and ignore `EPIPE` on `process.stdout`/`process.stderr` (including `runCheck`'s final summary write).

### M3. Seat bootstrap, sourced-vs-executed entry asset, and atomic refresh
- **M3a (Who creates `tools/` and `akrogon/`)**: Taken does not state who creates `<seat scope>/tools` and `<seat scope>/akrogon`. Creating both inside `startSeat`'s `systemd-run --scope -- ...` command before `exec`ing the harness eliminates any startup race with the harness's first tool call, ensures `tools/` exists even when entry never fires (needed by Q6 and D3), and preserves `argv[0] === 'systemd-run'` and `t.pid === harness pid` (`src/transcript.ts`).
- **M3b (Sourced vs executed form & real bash path)**: Q3 describes "one entry asset" used as both `BASH_ENV=<asset>` (sourced by bash — must `return 0`, never `exec` or `exit`) and `<asset dir>/bash` (executed by `CLAUDE_CODE_SHELL` / `PATH` — must `exec` an absolute real bash path such as `/usr/bin/bash "$@"`, never bare `bash` on `PATH` which recurses infinitely). Taken must state the sourced-vs-executed split explicitly (either two files — a sourced script plus a thin `bash` wrapper — or an explicit `BASH_SOURCE` guard).
- **M3c (Atomic asset refresh)**: Because `startSeat` writes or refreshes the shared stable asset while other seats are live, writing in place risks `ETXTBSY` or a truncated read on concurrent tool launches. Refresh must write a temp file beside the target, `chmod`, and `renameSync` atomically.

### M4. Deferred helper boundary (`procRoot()` / `cgroupRoot()`) and post-kill behavior
- The Q1 deferred helper must read `<pid>/stat` through `procRoot()` (so tests under `AKROGON_PROC_ROOT` can drive and cleanly terminate the helper instead of leaking an immortal no-timeout process against real `/proc`), and Taken should state whether the helper does best-effort `rmdir` of the caller's `t-` and whether it stays silent on errors/timings (since its stdio is detached and it runs outside `.lock`).

---

## Recorded free observations (2026-11-25)

- **Probe A — Zombie `/proc/<pid>/stat` preserves field 22 `starttime`** (free, 2026-11-25, Linux `7.2.15-5-omarchy`):
  - Command: Python `os.fork()` child calling `os._exit(0)` without parent `waitpid`, reading `/proc/<child>/stat` after 0.1 s, then `os.waitpid()`.
  - Result: `zombie pid=3973232 state=Z starttime=6952914` — field 22 `starttime` stayed intact while state was `Z`.
  - Cleanup: Child reaped by `os.waitpid()`, process exited 0.
- **Probe B — Bun `process.stdout.write` to a broken pipe crashes on `EPIPE`** (free, 2026-11-25, installed `bun`):
  - Command: `Bun.spawn(["bun", "-e", ...])` calling `process.stdout.write("x".repeat(131072))` after parent cancels the stdout pipe reader (`reader.cancel()`), checking exit code.
  - Result: Child exited with `code: 1, signalCode: null` (unhandled async `EPIPE` error on `process.stdout` after returning from `write`).
  - Cleanup: Temp marker file removed, child exited cleanly.
