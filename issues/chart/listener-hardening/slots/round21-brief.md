# Round 21 (door A): review O3 (commit 3fdf8cd2)

Operator picked O3 from round 20: delete the listener/label wake path (back to cron only, as in the herdr era) AND make a tick that arrives as the first prompt after /clear stop the watch.

Review commit 3fdf8cd2 on branch fix/watch-cron-only in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k7 (`git show HEAD`). Summary:
- Deleted: `wakeWatcher` (src/hc.ts) and its unused imports, the listener's `wake` and label map (src/listen.ts), the calls in src/next.ts (busy) and src/phase.ts (failed), the status `Watcher:` line (src/status.ts), tests/hc-watcher.test.ts.
- Skill (skills/watch-issues/SKILL.md Invocations): back to "Claude Code only" with no HC_TERMINAL_ID / HC_SESSION / label steps; new tick rule: first prompt of its conversation while CronList finds the exact-prompt job → run the stop steps, reply "Watch stopped: this conversation was cleared.", no check. Otherwise one check (a manual one-off tick with no job still checks).
- Docs: docs/use/watch-while-away.md, docs/reference/commands.md listen row, src/AREA.md.
- Tests: hc-status drops Watcher; hc-listener's ordering test now waits for the first session's `"finished"` event line in its tee'd stream instead of the watcher lookup's `hc connect`; e2e watch-check rewritten (start + 2 queued ticks + /clear then tick → one CronDelete and no `akrogon status` in the new transcript). The e2e is a paid tier and was not run.
- Suite: 1141 pass, 3 known env fails (leftovers, status --json, suite env). hc-listener passes 3/3 alone.

Concrete defects only, file:line: anything still referencing the removed wake/label (code, skills, docs, other skills like chart-issues), anything else the wake was secretly providing (e.g. was it the only thing that reacted to a seat finishing while no pass ran? the listener's own `next --wake` should cover that — check), the new tick rule's wording and edge cases (compaction summary, a manual tick in a fresh session, two jobs, a tick queued before the clear), whether the hc-listener sync change still proves what the test claims, and test gaps that matter. Read-only. Write round21-<letter>.md with a verdict and reply with the path.
