# containment: merged notes (A,B,C,D,E)

Sources: fork-containment-A.md .. -E.md.

## Proof (free, A, 2026-11-06)
- Command: `bash -c "echo bash=$$; systemd-run --user --scope --quiet --collect -- <script printing $$, $PPID, /proc/$$/cgroup>"` (script in the session scratchpad, deleted after). Identity: operator's user, systemd 262. Result: `bash=203970` (bash execs its last command, so systemd-run ran as 203970), `child=203970 ppid=203968`, cgroup `.../app.slice/run-p203970-i37855002.scope`. So `systemd-run --scope` registers the scope and execs the command in place: same pid, already inside the scope. Cleanup: `--collect`, the scope ended with the script. Limits: proves exec in place and scope membership for a plain script; not under hc's holder, not with a leaf slice, not for each harness.
- This settles D's reading of the man page ("executed by systemd-run itself as parent process") against B's v262 source reading: B is right.

## Live facts
- Every unboxed hc terminal and the core's holder share one cgroup, `app.slice/hc-hold-<id>.service` (`Delegate=no`, `KillMode=process`) (C,D,E). An unboxed leaf would share memory accounting with the core and every terminal; `akrogon.slice` limits would bind nothing (C,E).
- `callerScope()` (`src/admission.ts:206-221`), `akrogon stop-run`, `akrogon stop`, and reconcile's slice vetoes depend on a leaf seat living in a `.scope` under its leaf slice (D,E).

## Q1. Keep boxing
- Keep per-leaf boxing for leaf seats A and B, same slice and limits; consultants, reviewers and doors unboxed as today (all). Probe the loaded limits on the real cgroup, not only the unit name (B).

## Q2. How
- Wrap at start: `systemd-run --user --scope --quiet --expand-environment=no --unit=<unique> --slice=<leaf slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed [-p SendSIGHUP=yes] -- env K=V ... <harness argv> "<task>"` (A,B,C,E). Box exists before the harness runs; every child inherits it; `adoptShell`, `paneShell`, the busctl call and the 50 ms poll loop (`src/next.ts:626-631`) go (all four). Unique unit name per start: hc name plus a random suffix (C,E). One read of `/proc/<pid>/cgroup` after the start proof confirms it, no loop (C,E).
- Move hc's `pid` after start with today's `adoptShell` (D): rested on systemd-run not exec'ing in place, disproved above. Also leaves children forked in the first moment outside (B,C,E; codex forks helpers at launch, E).
- `--expand-environment=no` so `$` in the task text survives (B,C,E).

## Q3. Env
- `env K=V` in the wrapped argv (A,C,D,E): one `hc run` path, visible in `hc get` argv. `terminal.run`'s `env` through the API (B).
- Systemd-started work: per-call pinning of `HC_SESSION`/`HERDR_APP_HOME` from the resolved repo session, no forwarding of the caller's (C,D,E) vs explicit `--setenv` for land and verify (A,B). Land gets `XDG_RUNTIME_DIR` like verify so socket discovery works (E). Check runs never copy `HC_*` into their constructed env (B,E).

## Probes
Each harness under the wrapper: `hc get` pid is the harness, status and first task work, transcript resolver finds the file (B,C); `systemctl --user stop <scope>` ends a grandchild server, another leaf and the core survive (B,C); a land run from a non-default session reaches the right core (B,E); a seat replaced by hc's keep shell after a core loss is seen outside its box and restarted (C).

## Corrections after rebuttals (2026-11-06)
- B: B carries resolved `HC_SESSION`/`HERDR_APP_HOME` into checked work only when it calls hc or app tools, excluding seat identity variables; B's `--setenv` values come from the resolved repo session, never the caller, so forwarding and per-call pinning can coexist. "Every child inherits" means OS children only: a terminal started through hc is launched by the holder and is not boxed. A checked: implement-issue workers are harness subagents (`skills/implement-issue/SKILL.md:58`), OS children of the seat, so they stay boxed; no worker is an hc terminal today.
- C: no disagreement; `callerScope()` takes the last `.scope` segment with no name pattern and `akrogon stop` stops the leaf slice, so the new unit name needs no parser change.
- D: withdraws move-after-start after A's proof; the wrap is strictly better; D's holder probe is no longer needed.
- E: no disagreement.
