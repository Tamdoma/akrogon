# Merged map: seat-shell-kill

Sources: slots/map-A.md, map-B.md, map-C.md, map-D.md (2026-11-25). Tags name the slots whose own map holds the line.

## Diagnosis (A,B,C,D)

shell-sweep picked victims by reading /proc and cgroup.procs while the tree forked, reparented and migrated. Every repair moved the race (F1, F3, F6, F8, F11) or added a wait or lock (F9, F10, F12). F4, F5, F7 are process hygiene and follow any design (C,D). The fix replaces kill-time selection with spawn-time placement: membership is set by fork inheritance into a dedicated cgroup, and one `cgroup.kill` write ends it (B,C,D). A's whole-seat option is withdrawn after the merge (see Differences).

## Evidence (all free, own throwaway units, cleaned up)

- `cgroup.kill` on a child cgroup of a scope ends a live forking loop, its `setsid` orphans and children forked during the write, zero survivors, siblings and scope root untouched (B P-a, C Obs 1-2, D E3). Kernel doc: kill "deals with concurrent forks appropriately and is protected against migrations" (D G6, docs.kernel.org cgroup-v2, read 2026-11-25).
- Child cgroups inside a user scope: mkdir and moves work without `Delegate=` (B P-b, D E1), and with it (C Obs 1, D E2). systemd only promises not to touch the subtree with `Delegate=yes` (D G7, systemd.resource-control, systemd 262). Moving into the leaf slice root fails (EBUSY, controllers enabled) (B P-c, D E4).
- `systemctl stop` of the scope or slice removes hand-made child cgroups and their members (B P-d, C Obs 3).
- A process that writes its own cgroup's `cgroup.kill` dies on the write (D E5a). Freezing its own scope freezes the writer (D E5b).
- A child can move itself out of a tool cgroup into a sibling (`runs/`) and survive the kill of its parent's cgroup (C Obs 6).
- `BASH_ENV` runs for `bash -c`, `-lc`, `--norc --noprofile -c` and `bash script`, not for `/bin/sh -c` (POSIX mode) (B P-f, C Obs 5, D E6).
- `DelegateSubgroup=` is ignored on a `.scope` (C Obs 6).

## Harness entry (how a tool shell gets into the tool cgroup)

| harness | how its tool shell spawns | hook | source |
| --- | --- | --- | --- |
| claude 2.1.332 | `CLAUDE_CODE_SHELL`, else `SHELL` if it contains bash or zsh and is executable; `<shell> -c` | `CLAUDE_CODE_SHELL=<wrapper path ending in bash>` (C). `BASH_ENV` is stripped and gates refuse commands while it is set (B,C). `CLAUDE_CODE_SHELL_PREFIX` also wraps stdio MCP server launches and hooks, so it would put MCP servers in the kill set (C,D) | binary reads (B,C), env-vars doc (D) |
| pi 1.6.0 | `getShellConfig`: settings `shellPath`, else `/bin/bash -c`, env inherited | `BASH_ENV` (B,C,D); `-e` extension with `spawnHook` or `shellPath` as alternative (B,C). Settings file is not per-seat (D) | installed source and docs (B,C,D), own tool shell observed (D E0) |
| codex 0.172.0 | `getpwuid` `pw_shell` (`/usr/bin/bash` here), `-lc`; ignores `SHELL` and `PATH`; `shell_environment_policy.inherit` default All | `BASH_ENV` (B,C,D), unverified end to end | upstream source and binary strings (B,C), config reference (D) |
| agy 1.5.16 | live tree shows `agy -> bash -c` via PATH lookup (C); `/bin/sh` strings (B); binary lists `BASH_ENV` beside other denylisted names (C) | `PATH=<seat-bin>:...` with a `bash` wrapper (C); `SHELL=/bin/bash` (B) | live ps (C), binary strings (B,C,D) |

Universal wrapper rule (C, matched by D's marker gate): one akrogon-owned script acts only when `/proc/self/cgroup` is exactly the seat scope root named in an akrogon env marker; anywhere else (already in a tool cgroup, a run scope, a consultant, a payload that inherited PATH) it does nothing and never fails the shell. All output discarded, exit 0.

## Options and positions

### Kill unit

- Tool cgroup(s) under the seat scope plus `cgroup.kill` (B,C,D). Removes F1, F3, F6-as-misselection, F8, F9, F10, F11, F12 by removing the census.
- Whole seat scope ended per phase, fresh or resumed harness (A, withdrawn). Rejected by B, C, D: the caller is mid-tool-call, a kill after it exits cuts the harness before its tool result and leaves a dangling tool call that breaks resume (C); context and prompt cache lost per phase; per-harness resume flags; panes churn; still hits F2 unless writers leave (C,D).
- Freeze plus selection (all reject): selection survives (F6, F11), self-freeze deadlock, async wait under the lock, a dead freezer leaves the whole seat frozen (B,C,D).
- Census plus scope-root kill or keep-set move (B S2, D O2d): keep set still needs discovery. Fallback only (B).

### Granularity and the caller

- One `shells/` cgroup per seat (B,D). The caller's own tool shell is inside it.
  - B C2: kill it anyway; the harness sees the phase tool call killed and may retry ("already moved" noise). B's default.
  - B C1: move the caller chain to `keeper/` first; leaks any background child of that shell forever (B).
  - D O3b: detached helper outside the scope waits for the caller's tool shell to exit, then writes the kill. Total, clean tool result, one transient unit per move (D).
- One cgroup per tool shell, `tools/t-<id>` (C). commitMove kills every populated `t-*` except the caller's own (read once from the caller's own cgroup). Synchronous, clean tool result, no helper. Residual: a background child started in the same tool command as the phase call survives this advance (C).

### Writers and akrogon processes

- Every akrogon CLI process found inside a tool cgroup moves itself out at startup, before captures or records exist (B to `keeper/`, D to scope root). One rule for writers, phase and status (B,D).
- Only the run-check writer self-migrates to `<scope>/runs` at the start of `checkedRun`, and publishes before echoing with EPIPE tolerance (C).
- Window: between the shell spawning akrogon and the move, a concurrent kill loses an in-flight command that has published nothing (C,D).

### Width

Everything descended from a tool shell ends at advance, including a seat-started `ssh-agent` or dev server; harness-direct children (codex helpers, MCP) survive by placement with no allowlist (B,C,D). D offers narrow entry (parent test at spawn) as the alternative, and recommends against it.

### Delegation

`-p Delegate=yes` on the seat scope (C,D) against none needed (B). D: without it systemd promises nothing about the subtree, and a silent flatten brings back the stall with no error.

### Recovered bare-shell seat

Old Q3a unchanged, same leaf, shares no machinery with the kill (A,B,C,D). `Delegate=yes` keeps launch `argv[0] == systemd-run`, so the spawned predicate is unaffected (C).

### Residuals and reporting

- Seed-decision F1 residual (shell started after the phase call, turn ending with no phase call) stays recorded, periodic wake stays a separate candidate (A,B,C,D).
- New residual: shells the hooks miss (`sh -c`, zsh, fish, a harness update) escape silently; slice stop at leaf close still ends them (B,C,D). D: record tool-cgroup population per advance as a standing signal.
- Timing row: per seat that killed or errored (C); a pre-kill population read for report only, never acted on (D).
- Seat scope resolution: record the unit name at `startSeat` (D) or enumerate the leaf slice directory filtered to recorded seats (B).

## Differences to settle

1. Granularity and caller: per-tool-shell cgroups (C) against one `shells/` with a helper (D) or with the caller killed (B).
2. Writer rule: all akrogon processes leave (B,D) against run-check writer only (C).
3. Hooks: per-harness matrix (B,C) against `BASH_ENV` only (D, which predates the claude strip finding).
4. `Delegate=yes` (C,D) against none (B).
5. Proof before handoff: per-harness entry probes (B,C,D all ask for codex and agy; B adds claude for the caller-killed question; D asks all four).

## Pitfalls collected

- Silent coverage hole when a hook stops firing (B,C,D). Removed by a per-harness charting probe and a positive marker, and by the population signal (D).
- `BASH_ENV` collision with a repo's own use (B): the gate acts only in the seat root; chain an existing value.
- Run-check payloads inherit PATH (C): the wrapper's exact-seat-root gate makes it a no-op there.
- Consultant and direct seats are outside seat scopes (D R6): hooks go in `startSeat` only.
- `cgroup.kill` is SIGKILL and does not wait for D-state reaping: write and forget, outside any wait (B,D).
- Two-record moves sweep per record commit (B).
- Tests: real throwaway scopes are free and writable as the user (B P-b), so the kill path is testable at the real boundary; fake roots only for path logic (C,D).
