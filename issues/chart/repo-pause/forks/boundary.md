# Boundary

## Question
Q1. Which automatic paths does a repo pause stop: herdr event hooks (`pane.agent_status_changed`, `pane.exited`, `pane.closed`, `tab.closed`), startup `next --resume`, the `mergePass` after a hooked pass, `mergeWake` after `akrogon phase`, dependent dispatch after a completion? Does merged-leaf cleanup (tab close, worktree removal) still run while paused? Does an explicit operator `akrogon next <target>` or `--all` on a paused repo run in full, including its cascaded dependents and merge pass?

### Carries
- Intake: Tamdoma/akrogon#61. Expected: event-driven `akrogon next` skips that repo while explicit operator commands still work.
- Locks: none yet.

## Findings
Agreed (A,B), see slots/boundary-merged.md:
- Paused: four herdr events, plugin startup --resume, mergePass after an automatic pass, mergeWake after akrogon phase, dependent starts from automatic completion. Running agents, phases, queue order and capacity untouched.
- Manual next <target>, typed bare next and --all run in full with their cascades; never clear pause.
- Every akrogon lock site uses the one global lock (src/next.ts:814,911,928,981,1079,1097,1245; src/phase.ts:533-772). The pause write takes it, and each automatic start/prompt re-reads pause inside the locked section that launches, so no automatic start follows a successful pause (B rebuttal 3, A).
- Classification by event JSON or --resume, never HERDR_PANE_ID or leaf count. A skipped automatic pass exits 0.
Research: Kubernetes CronJob .spec.suspend and Argo CD auto-sync (A), Temporal Schedule Pause and Astronomer Airflow scheduler write-up 2026-08-31 (B), all read 2026-10-08: automatic stops, manual works, started work continues.
Differ: cleanup while paused (A freeze all, B keep cleanup and owner completion); manual --resume (A always paused, B bypass with startup marker). Rebuttal: slots/boundary-rebuttal-B.md.

## Taken
Operator 2026-10-08: `1a | 2a`
- 1a: a pause freezes every automatic action for the repo, including merged-tab close, temp cleanup and owner completion (broadcast, source close); the first pass after unpause does them. Reason: one rule, every skipped step is idempotent. Foreclosed: 1b keep cleanup while paused.
- 2a: `--resume` is always automatic and paused; operators force a pass with `next --all` or a target. Foreclosed: 2b manual --resume bypass with a startup marker.
Binding with the agreed findings above: paused paths are the four herdr events, startup --resume, mergePass after an automatic pass, mergeWake after akrogon phase and dependent starts from automatic passes; manual next <target>, typed bare next and --all run in full with cascades and never clear pause; the pause write takes the global lock and each automatic start/prompt re-reads pause inside its locked section; classification by event JSON or --resume, never HERDR_PANE_ID or leaf count; a skipped automatic pass exits 0.

