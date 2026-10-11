# From the akrogon chart door (red-base-wait, pane w8:pCT), 2026-10-10

The operator approved this split. Please apply it in your charts and confirm by writing $C/slots/from-chart-framework.md (a few lines: what you changed, anything you disagree with).

## 1. main-health-from-framework is superseded
Folder: /home/ivan/Work/infra/akrogon/issues/chart/sources/main-health-from-framework
- The same problem (#76, #77) is charted in /home/ivan/Work/infra/akrogon/issues/chart/red-base-wait with the operator's later, opposite decisions. Read its CHART.md and forks/*.md Taken sections.
- Key differences you must not build against: no leaf waits or is held on a red main (each leaf is judged only by failures its change introduces, compared per test against a fresh run without the change); held.yaml, `--red-on-base`, `hold-fix` and `unhold` are retired; one operator notice per newly red test; no reuse of earlier base results; no automatic repair leaf.
- Action: stop work on main-health-from-framework. Append `Held 2026-10-10` on its own line to its CHART.md with one line: "Superseded by akrogon issues/chart/red-base-wait." Leave its files where they are; red-base-wait keeps them as source input (the stale-base addendum is noted there). Its open Scope fork (#78, #69) is not yours to settle: #78 is charted in akrogon issues/chart/busy-seat-notice, #69 stays with merge-load-flakes.
- Live unblock and the framework fixes (C8, motion-probe) already done stay as they are.

## 2. worktree-isolation owns where task copies live
- You are the single owner of: the store `~/.akrogon/worktrees/<repo>/<slug>` for every registered repo, the ancestor guard, migration and reconciler, and the `akrogon base-run` verb. red-base-wait will not build any of these and depends on them.
- You also own the `worktree_root` line changes in both repos' issues/config.yaml (framework and akrogon), as part of your rollout.
- Where the files go: leaves that change akrogon code (store, guard, reconciler, base-run verb, config default) are handed off to the akrogon repo (registered root /home/ivan/Work/infra/akrogon, issues/open/), not framework. Leaves that change only framework (bunfig copyfile, binary boundary, fixture installs, framework config line) go to framework issues/open/. Your chart folder can stay in framework.
- Interface red-base-wait needs from `akrogon base-run`: the caller supplies the baseline commit (pre-merge: the leaf's AKROGON_BASE; merge: the exact target the stack is built on), the exact command, args and scope; the verb runs fresh every time (no reuse) and returns the run's log path and completion status. Per-test comparison and the known-red judgment stay with the seat. A green-on-retry result never reaches base-run.
- Ordering: red-base-wait's skill rewrites will call `akrogon base-run` once it lands. Tell me if its contract differs from the above.

## 3. Nothing else changes
Do not edit files under /home/ivan/Work/infra/akrogon/issues/chart/red-base-wait except your reply file.
