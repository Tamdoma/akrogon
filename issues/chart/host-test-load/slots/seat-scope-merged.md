# Merged notes: seat-scope (A, B, C)

## Agreed
- Pick: pane shell, adopted into its scope before `herdr agent start`, so the harness and all it spawns are born inside (A,B,C). C reversed its round-1 seat-process pick on the shell_pid fact.
- Layout: `akrogon.slice` > one slice per leaf > one scope per pane shell, siblings (A,B,C). No per-run units (A,C), B leaves run units to the permit-release fork. Leaf slice name must avoid dashes or use a hash, since systemd reads dashes as hierarchy (C).
- Seat-process option rejected: harness init children are born outside, a rescan loop is needed at every seat restart, and a stopped seat leaves a live prompt the next dispatch pass can relaunch (A,B,C).
- Bus cut joins the placement env list at src/next.ts:453-467, which feeds new tab, repair split and B split (A,B,C). Placement env applies only to a newly created shell (B,C).
- B pane is adopted at allocation even in phases that never prompt B (A,B,C).
- Adoption fails closed: no contained shell, no dispatch for that leaf this pass, error recorded (B,C). Each pass compares shell PID plus start time first, then the cgroup, and calls systemd only when wrong (C, revised in rebuttal).
- PID race: re-read process-info and compare process start time before adoption (A,B,C).
- Stopping a pane scope kills the shell, herdr closes the pane (normal Linux path, respawn flag false by default, herdr/src/app/api.rs:482-505, terminal/state.rs:177-180). Stopping the leaf slice closes both panes and the tab and ends both live seats (B,C). Saved harness sessions and the worktree survive (B). Redispatch after a stop must be fenced by leaf state, which belongs to the stop fork (B,C).
- Replaced seat in the same pane needs no action. A new pane gets its own scope in the same pass. Pane swap repair needs no unit action if scopes follow the pane, not the slot (A,B,C).

## Disagreements
1. Rollout of already-running seats.
   - A: one-time live move of shell plus descendants. Withdrawn: a moved seat keeps the reachable bus, so its Chrome still escapes (B,C). Live migration is rejected (A,B,C).
   - B: controlled transition. An old leaf gets no new automated prompt until its panes are recreated with the cut env and adopted. The procedure must be settled and proven before rollout.
   - C: old panes are a named legacy class. They keep getting dispatched, still get the permit and the run-level bus cut through constructedEnv, and `akrogon status` marks them uncontained until their tab closes. Operator closes a tab to contain a leaf now.
2. Scope identity: per shell generation (B: pane id plus shell PID and start time) vs per pane id hash reusing src/next.ts:633 (A,C). Both follow the pane, not the slot.
3. Adoption location: inside `allocate` before state save, src/next.ts:524-526 (C), vs after allocation before the dispatch loop, src/next.ts:789-795, plus revalidation before start (B). A: either, as long as it covers reused allocations and busy seats.

## New questions raised
- QR1 herdr restore: the pending-resume path creates a shell and sends the saved resume command at once (herdr/src/app/agent_resume.rs:219-246), bypassing akrogon's barrier (B).
- QR2 hand-split panes in a leaf tab are in no `state.pane` record (C).
- QR3 herdr server restart empties every scope while state names dead panes (C).
- QR4 `akrogon.slice` as an installed unit file vs transient (C). Moves to ceiling-values.
- QR5 empty leaf slice cleanup when a merged leaf's tab closes (C).

## After rebuttals
- D1 settled among seats: controlled transition. No new automated prompt to an old leaf until its panes are recreated with the cut env and adopted, procedure proven before rollout (A,B,C). C withdrew its legacy class as contradicting the taken lock.
- D2 settled: scope per shell generation, named from pane id plus shell PID and start time, so a live unit name is never reused (A,B,C).
- D3 settled: adoption is created only inside `allocate`, after both panes resolve and before the final state save (src/next.ts:523-532). A read-only PID, start-time and cgroup check runs again before agent start (A,B,C). C rejects a second creation site.
- QR1 herdr restore breaks "born inside" for restored panes (B,C). Goes to its own fork.
