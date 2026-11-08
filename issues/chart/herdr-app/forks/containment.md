# Process containment and environment

## Question

Today each leaf seat's pane shell is moved into a transient scope in the leaf's slice under `akrogon.slice` (CPU and memory limits, `systemd/akrogon.slice`) by `busctl StartTransientUnit` (`src/scope.ts:147-190` `adoptShell`, checked by `inOwnScope` :191, called from `src/next.ts:543,620-630`); the seat env `AKROGON_BASE`, `GIT_EDITOR=true`, `TMPDIR=<leaf temp>`, `NODE_DISABLE_COMPILE_CACHE=1` reaches the shell by `herdr tab create --env` (`src/next.ts:569-578`). Check runs, verify and land already use `systemd-run` (`src/run-check.ts:298`, `src/verify.ts:651`, `src/land.ts:16-19`). Under hc the terminal's program is started by hc's holder; `hc run` has no `--env` flag, the API's `terminal.run` takes `env`.

1. Is the per-leaf boxing kept, and for which seats (leaf seats; consultants and doors today are not boxed)?
2. How: wrap the harness argv in `systemd-run --user --scope --slice=<leaf slice> -- ...` at start (it execs in place, so hc's `pid` stays the harness), or move hc's `pid` into a scope after start (today's `adoptShell` with the pid from `hc get`)?
3. How does the seat env arrive: `env K=V` in argv, or `terminal.run`'s `env` through the API; and does `HC_SESSION` reach systemd-started work (land, verify, check runs) that calls hc?

### Carries

- Signposts: forks/signposts.md `## Taken` and its 2026-11-06 directions (behavior like old akrogon; no polling or waiting, `<hc>` where possible; fewest moving parts, nothing that works today may break).
- Engine-shape, identity, start-and-pane, delivery, session-id, notices: `## Taken` in each fork file (binding; session-id reads the transcript from hc's `pid` first).
- Map: slots/map-merged.md fork "containment".

## Findings

- Merged notes: slots/fork-containment-merged.md (A,B,C,D,E with rebuttal corrections).
- Proof (free, A, 2026-11-06): `systemd-run --user --scope --quiet --collect -- <script>` from bash: systemd-run ran as pid 203970, the script reported `child=203970` and cgroup `.../app.slice/run-p203970-i37855002.scope`. systemd 262 execs the command in place inside the new scope. Cleanup: `--collect`, scope gone with the script. Limits: plain script, not under hc's holder, no leaf slice, no harness.
- Q1: keep per-leaf boxing for leaf seats only (all). Unboxed hc terminals share `hc-hold-<id>.service` with the core (C,D,E); `callerScope`, `stop-run`, `stop`, reconcile need the scope (D,E).
- Q2: wrap the harness in `systemd-run --scope` at start (all after D withdrew); delete `adoptShell`, busctl, the 50 ms poll.
- Q3: env by `env K=V` in argv (A,C,D,E) vs `terminal.run` env (B); detached land/verify resolve the session themselves (C,D,E) vs receive the resolved values by `--setenv` (A,B); land gains `XDG_RUNTIME_DIR` (E).

## Taken

Operator 2026-11-06, door t15, verbatim: "1a, 2a - what does this fence even mean? Elid, 3a - this is only for charting, right?, 4a,"

A's answers to the questions (no pick changed): the fence is the systemd slice `akrogon.slice` (memory high 64G, max 96G, no swap, CPU weight 20 against the default 100) with one child slice per leaf; a leaf seat's processes and everything they start live there, so a runaway leaf is slowed or killed alone and `akrogon stop` ends every process of that leaf. 3a is not for charting: the settings are the leaf seats' (`AKROGON_BASE`, `TMPDIR` the leaf temp folder, `GIT_EDITOR=true`, `NODE_DISABLE_COMPILE_CACHE=1`); chart consultants and the door get none, as today.

Read as:
- Q1 1a: per-leaf boxing kept for leaf seats A and B, same slice and limits; consultants, direct reviewers and doors unboxed as today.
- Q2 2a: the start command wraps a leaf seat's harness as `systemd-run --user --scope --quiet --expand-environment=no --unit=<leaf slice base>-<seat name>-<random suffix>.scope --slice=<leaf slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -p SendSIGHUP=yes -- env ... <harness argv> "<task>"`; one read of `/proc/<pid>/cgroup` after the start proof confirms the scope, no loop. `adoptShell`, `paneShell`, the busctl call and the 50 ms poll in `src/next.ts:626-631` are deleted; `callerScope`, `stop-run`, `stop` and reconcile keep working unchanged.
- Q3 3a: leaf seat env by `env AKROGON_BASE=... GIT_EDITOR=true TMPDIR=<leaf temp> NODE_DISABLE_COMPILE_CACHE=1` inside the wrapped argv; one `hc run` path.
- Q4 4a: land, verify and check runs resolve the repo's hc session themselves per call (identity Taken), no forwarding of the caller's values; land's `--setenv` gains `XDG_RUNTIME_DIR` as verify has; check runs keep their allowlist and bus isolation.

Addition, operator 2026-11-07, door t15 (probe round Q3, forks/proofs.md P0), verbatim: "3a"

Read as: the start command clears, for every seat it starts, the session variables a running Claude Code hands to its children (`CLAUDECODE`, `CLAUDE_CODE_*`, `CLAUDE_PID`, `CLAUDE_EFFORT`) before the harness runs, inside the same exec chain so the terminal's `pid` stays the harness; the operator's own settings such as `CLAUDE_CONFIG_DIR` stay. Reason: a core restarted by a call from inside a Claude agent inherits that agent's variables (P0), and every Claude seat it starts then runs as a child session that writes no transcript, silently breaking usage, the watcher's log reads and reset confirmation. Done-criterion: a seat started from a core whose environment carries those variables shows none of them in `/proc/<pid>/environ`, writes its transcript, and its `pid` is the harness.

Final-shape check, 2026-11-07 (slots/final-probe-B.md, -C.md), applied by A within 3a: the cleared set is the child-session markers a running Claude Code exports, enumerated from P0: `CLAUDECODE`, `CLAUDE_CODE_CHILD_SESSION`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_EXECPATH`, `CLAUDE_CODE_MESSAGING_SOCKET`, `CLAUDE_CODE_MESSAGING_TOKEN`, `CLAUDE_CODE_SESSION_ATTENDED`, `CLAUDE_PID`, `CLAUDE_EFFORT`, by `env -u` in the existing `env` step; configuration keys are kept (B over C's prefix glob: the prefix also holds settings). The done-criterion adds a kept configuration variable to the case.
