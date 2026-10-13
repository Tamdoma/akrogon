# Chart: akrogon

## Destination
All leaves, workers and their test runs on this host share one load limit enforced below the agent layer, and the operator has one stop that reaches every process a leaf started, browsers included.

Route: lifecycle (debate no)

## Forks taken
- [fog-defaults](forks/fog-defaults.md): six leftover cases accepted as design residuals, no extra code (1a)
- [framework-fanout](forks/framework-fanout.md): no framework chart now, quota kept if the rerun passes in 300 s or less (1a)
- [ceiling-values](forks/ceiling-values.md): akrogon.slice unit file, weight 20, 16-thread quota, memory brake 64G/96G, no swap (1a)
- [queue-order](forks/queue-order.md): flock order, no bound, holder line in status, wait field on check_start (1a)
- [stop](forks/stop.md): new akrogon stop/start with a stopped.yaml fence, stop --all per repo, pause and pi Esc unchanged (1a)
- [permit-release](forks/permit-release.md): permit freed at run process exit, in-process flock, leftovers end with leaf stop (1a)
- [restore](forks/restore.md): herdr auto-resume stays on, akrogon replaces any leaf pane outside its box at startup (1b)
- [seat-scope](forks/seat-scope.md): pane shell boxed in allocate before agent start, rollout by one manual tab close (1a)
- [heavy-runs](forks/heavy-runs.md): every run-check and base-run execution takes the permit (settled by limit-boundary 1a)
- [limit-boundary](forks/limit-boundary.md): revised 1a, one host-wide permit in run-check/base-run plus every seat in a stoppable cgroup with the session bus cut, no task cap

## Open forks

## Fog

## Off route
- Framework fan-out caps: later chart only on the triggers in forks/framework-fanout.md.
- Merge-first queue priority: revisit when merge-phase wait fields show real cost (queue-order).
- herdr per-tab restore opt-out (restore 1c): would remove the startup window entirely, needs a herdr change. Possible later chart.
- Blepsis detached Chrome launch: a detached browser stays in the leaf cgroup under the bus cut (measurement 2), so no blepsis change.
- Selector breadth: framework leaf test-changed-shared-files owns it.
- Wave size and leaves-as-chunks: settled in chart leaf-speed.

## Pending steps
- Human-only, owner operator: run `gh auth login -h github.com -p https -w --insecure-storage` in a normal terminal so gh keeps its token in ~/.config/gh/hosts.yml instead of the keyring. Needed before L2 ships, because boxed seats cannot reach the keyring. Check: `gh auth status` no longer says (keyring), and T1 rerun passes gh and private git under the bus cut. Done 2026-10-13 (proofs.md T1 rerun).
- Human-only, owner operator: when the seat-containment leaf merges, close every running akrogon leaf tab once so new tabs start boxed. Check: `akrogon status` dispatches only into newly created tabs. Pending.
- Framework `issues/config.yaml`: remove the `flock /home/ivan/.akrogon/framework-tests.lock` prefixes from test_changed, cheap and merge verify. Owner: door. Waits on the akrogon permit leaf merging. Check: `akrogon config` at the framework root shows the commands without flock.

Handed off 2026-10-13
