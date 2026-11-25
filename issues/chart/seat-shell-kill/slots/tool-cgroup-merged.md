# Merged notes: tool-cgroup

Sources: slots/tool-cgroup-A.md, -B.md, -C.md, -D.md (2026-11-25). Tags name the slots whose notes hold the line.

## Q1 Granularity and the caller

- a, one cgroup per tool shell `tools/t-<pid>-<starttime>` (A,C,D). Kill inside commitMove, caller's own `t-` spared by identity, no helper, no wait. Cost: per-spawn mint, empty dirs (best-effort rmdir, D N3), and a background child started in the same tool command as the phase call survives one advance (A,C,D).
- b, one `shells/` plus a detached helper that waits for the caller shell to exit, then kills (B). Total hygiene with a clean tool result. Cost: one helper process per move, a pid wait with a timeout backstop, a bus call or spawn under the home lock, a helper that dies before its write leaves that phase's shells (B,D).
- c, kill including the caller (all reject): `akrogon phase` dies on its own write (D E5a) or its shell does, the harness sees the phase call killed and may retry.
- B against a: the spared `t-` keeps exactly the masking shape (claude stays `working`) until the next advance.
- Evidence: D N1 (kill on an empty cgroup succeeds), N2 (`tools/cgroup.kill` ends nested `t-` trees), N3 (empty `t-` rmdirs, populated EBUSY), N5 (entry mints `t-<pid>-<starttime>`, nested bash stays, orphan dies with its `t-`); C Obs 5.
- Pitfalls: `t-` id reuse (removed by pid plus start time, D); the caller's `t-` must be known after Q2 relocation (removed by reading the starting cgroup before relocating, or the entry's exported marker `AKROGON_TOOL_CGROUP`, C,D); a caller in a `t-` it cannot name kills nothing for its own seat and warns (D); moves from outside any seat (operator, merge) have no caller and kill every `t-` (B).

## Q2 akrogon's own processes

- a, every akrogon CLI process found in a `t-` moves itself to `<seat scope>/akrogon/` at startup, before locks, records or captures (A,B,C,D). C adds the same idempotent call at the start of `checkedRun` for direct library calls.
- Target must be a seat-scope child, never the leaf slice root (EBUSY, B P-c) (A,B).
- Window: a kill between spawn and relocation loses a command that has published nothing (A,C,D).

## Q3 Harness entry

- a, one akrogon-owned entry asset (A,B,C,D). Wiring differs:
  - per kind: claude `CLAUDE_CODE_SHELL=<seat-bin>/bash`, pi and codex `BASH_ENV`, agy `PATH` shim (A,C; B with `SHELL=/bin/bash` for agy).
  - D: the same plus `BASH_ENV` for every kind as a base layer, so claude-on-bash stays covered if `CLAUDE_CODE_SHELL` is ever ignored.
- Paid observations (D, standing grant 3b, logs under the chart's direct/): P-claude, claude 2.1.332 accepted a wrapper named `bash` via `CLAUDE_CODE_SHELL`; it ran for the `-c` probe, the `-c -l` snapshot and the Bash tool call; `BASH_ENV` also fired in the same shells and the tool call ran. P-codex, codex-cli 0.172.0 `exec` read `BASH_ENV` (9 firings) and never used a `PATH`-shadowed `bash`. P-agy, agy 1.5.16 asked for OAuth inside the run-check payload and timed out before any tool ran: no conclusion.
- B and C read claude's binary as stripping `BASH_ENV` and gating commands on it; D's paid run with `BASH_ENV` set ran the tool call. The gate's condition is unobserved (possibly sandbox mode, B).
- `bash -l -c` reads `BASH_ENV` (D N4, B P-f).
- Pitfalls: the asset path must outlive release switches, so it lives at a stable akrogon home path written by `startSeat`, not in a release dir (D); a failing entry must never break a tool call: output discarded, exit 0, wrapper falls through to `exec /usr/bin/bash` (C,D); entry fires inside run scopes and payloads, so it acts only when the current cgroup is exactly the seat scope root named by the env marker (A,B,C,D); coverage decays on harness updates, visible through a per-advance population signal (D).
- Unasked: claude on a zsh host becomes bash under `CLAUDE_CODE_SHELL` (D); zsh is not installed here (B).

## Q4 Delegation

- `-p Delegate=yes` (A,C,D): the documented promise that systemd leaves the subtree alone; without it a flatten empties `tools/` silently.
- No property (B): no observable effect on user scopes (probe D in B's notes); a future need would fail loudly at mkdir.

## Q5 Width

- Everything descended from a tool shell ends; harness-direct children survive by placement (A,B,C,D). D asks whether any current workflow parks a tool-started process across phases on purpose.

## Q6 Seat scope lookup

- Enumerate the leaf slice cgroup for seat scopes that hold a `tools/` directory (A,C). No state field, no naming coupling, and it reaches scopes of seats replaced by the lost path.
- Record the unit name at `startSeat` (B,D). Exact, no IO. B: enumeration must filter and join, strictly more steps, and stays the fallback for older records. D: an absent field is a no-op until the seat's next `startSeat` (no migration); pattern enumeration makes the unit-name scheme a lookup key forever and can reach a scope started by a concurrent dispatch that is not in commitMove's state snapshot; a replaced seat's orphan scope cannot mask a harness and ends at leaf close. D asks whether `startSeat` should kill the replaced seat's `tools/` from the overwritten record.
- A's answer to D's overreach point, for the rebuttal: the filter is "has a `tools/` directory", not a name pattern, so run scopes and guard services never match.

## Points where slots differ

1. Q1: a (A,C,D) against b (B).
2. Q3 wiring: per kind (A,B,C) against per kind plus a `BASH_ENV` base layer for all (D).
3. Q4: Delegate (A,C,D) against none (B).
4. Q6: enumerate (A,C) against record (B,D).

## Evidence still missing before handoff

- pi end-to-end entry with the final env (source and docs only so far).
- agy entry: P-agy did not reach a tool.
- claude and codex with the exact final env shape, if it differs from D's probes.
