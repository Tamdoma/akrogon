# Seat scope

## Question
Q1. Which process is moved into the leaf's cgroup: the pane shell before `herdr agent start` (per-pane, survives seat restarts, stop kills the shell) or the seat process after start (per-seat, may miss children started during harness init)?

### Carries
- Depends on limit-boundary.
- Slots differ: B pane shell, C seat process. Rebuttals: ../slots/limit-boundary-rebuttal-B.md R2, ../slots/limit-boundary-rebuttal-C.md 2.

## Findings
Round 2026-10-13, blind notes slots/seat-scope-{A,B,C}.md, merge slots/seat-scope-merged.md, rebuttals slots/seat-scope-rebuttal-{B,C}.md.
- All seats pick the pane shell. herdr 0.9.1 `pane process-info --pane <id>` gives `shell_pid` before any seat exists, so the harness is born inside. C reversed its round-1 pick on this fact.
- Layout: akrogon.slice > one slice per leaf (dash-free or hashed name) > one scope per pane shell generation, named from pane id plus shell PID and start time.
- Adoption is created only inside `allocate`, after both panes resolve and before the final state save (src/next.ts:523-532). A read-only PID, start-time and cgroup check runs before agent start. Failure fails closed: that leaf is not dispatched this pass.
- Bus cut joins the placement env list (src/next.ts:453-467). It applies only to newly created shells.
- Rollout: live migration rejected. A moved seat keeps the reachable bus, so its Chrome still escapes. Old leaves get no new automated prompt until their panes are recreated and adopted.
- Stopping a pane scope kills the shell and herdr closes the pane (herdr/src/app/api.rs:482-505). Saved harness sessions and worktree survive.
- New fork: restore (herdr resume sends the saved command into a fresh shell before akrogon adopts it, herdr/src/app/agent_resume.rs:219-246).
- To Fog: hand-split panes in a leaf tab, herdr server restart with stale pane ids, empty leaf slice cleanup. akrogon.slice unit file vs transient goes to ceiling-values.

## Taken
1a, operator 2026-10-13, after asking about speed and complexity. Reason: no added waiting (measurement 2 ran boxed at normal time), and the change stays in one place.
- Each pane shell is placed in its own scope (named from pane id plus shell PID and start time) under a per-leaf slice under akrogon.slice, inside `allocate` before the final state save and before any agent start. Failure skips the leaf this pass with the error recorded.
- A read-only PID, start-time and cgroup check runs before agent start.
- The bus cut joins the placement env list.
- Rollout has no code for old leaves: the operator closes every running leaf tab once when the change ships. No legacy tracking, no live migration.
- Foreclosed: 1b (uncontained legacy leaves), 1c (seat process after start), live migration.
- Proof done 2026-10-13 (proofs.md T2): `herdr pane process-info` gave shell_pid, systemd StartTransientUnit with PIDs moved that live shell into a named scope under a leaf slice, a pi seat started afterwards was born inside it, and stopping the leaf slice closed the herdr pane and tab. Scopes carry SendSIGHUP=yes (see stop).
- Proof done 2026-10-13 (proofs.md T7): under the bus cut, `busctl --user` cannot reach systemd. akrogon's scope-creating busctl subprocess sets DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus for itself only. `systemctl --user stop` works under the cut.

Amended 2026-10-13 ~23:30 (operator "yes, do it", after A,B,C review in issues/chart/idle-processes/slots/scopes-{A,B,C}.md): scopes stay; the seat-wide bus cut is removed from pane placement (src/next.ts). The cut stays on every run-check and base-run run (src/run-check.ts:56). Reason: the seat-wide cut broke keyring-backed gh/git and every other session-bus tool in seats (merge pushes failed from ~13:00); worker-test-duty routes checks through run-check. Accepted residual (C): a browser launched outside run-check can move itself out of the leaf slice until framework browser-dies-with-run lands. Check: census Chrome in leaf slices vs app-*.scope over a day of normal work; escapes reinstate the cut or a filter denying org.freedesktop.systemd1 only.
