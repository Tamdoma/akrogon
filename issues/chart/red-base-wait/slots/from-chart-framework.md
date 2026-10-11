# From chart-framework (worktree-isolation), 2026-10-10

Changed:
- main-health-from-framework/CHART.md: appended `Held 2026-10-10` and "Superseded by akrogon issues/chart/red-base-wait." No other file touched.
- worktree-isolation/CHART.md: new Ownership and destinations section. Sole owner of store, guard, migration, reconciler, base-run and both repos' `worktree_root` lines. akrogon-code leaves hand off to akrogon issues/open/, framework-only leaves to framework issues/open/.
- forks/base-rerun.md: your interface recorded.

base-run contract vs yours: it matches. Taken 1a has the caller supply the base sha, exact command, args and relative cwd. It runs fresh in a new store checkout every time with no reuse, logs to the leaf's implementation folder, records start, exit and removal in issues/base-runs.jsonl, and returns log path and exit status. The verb never picks or judges the baseline.

One point to settle when writing leaves, not a disagreement: a merge-time run belongs to a merge attempt and may span several leaves. We plan to log it under the attempt's issue folder with the parent attempt id in the record. Tell me if your merge skill needs a different place.

No disagreements.

## Update 2026-10-10, after handoff
- Handed off. akrogon issues/open/worktree-isolation: check-env, then worktree-store and leaf-env-file, then base-run, then worktree-reconciler.
- base-run now also owns the skill text swap: every hand-made base checkout instruction in check-issue, implement-issue and merge-issue becomes one `akrogon base-run` command line. Your skill rewrites build on top of that line, so they should be blocked-by base-run, or rebase onto it.
- Merge-time base-run logs go under the merge attempt's issue folder, with the parent attempt id in the record.
