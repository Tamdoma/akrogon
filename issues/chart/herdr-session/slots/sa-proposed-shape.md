# stopped-and-ambiguous proposed final shape

Operator 2026-10-24: "1a 1b | 2a | 3a | 4a | 5a"
- Q1 1a+1b: skip sessions listed stopped, never start one; count matching workspaces (same session included), two or more refuse naming session and workspace_id; an open session returning any error other than server_not_running refuses (uniqueness unknown); a session listed running whose read returns server_not_running is treated as stopped and skipped; refusal names sessions searched and skipped-as-stopped; a failed `session list` is reported once per invocation.
- Q2 2a: per-repo refusal, other repos continue, invocation exits nonzero; one report per repo per invocation; cached refusal honored by later steps of that repo; paneOwners, owner-count throws, host reconcile step and selectLeaves contain a per-repo refusal instead of aborting the pass.
- Q3 3a: every discovery call (session list, per-session workspace list, and the cross-session pane/tab lists for the second-seat guard) runs with a 10-second deadline through the existing run/retryCommand deadline parameter in src/shell.ts; a deadline hit counts as an unreadable session (refuse).
- Q4 4a: no new notification; manual commands print the refusal, automatic passes log it.
- Q5 5a: done 2026-10-24, `herdr --session personal workspace create --label Himne --cwd /home/ivan/Work/personal/Himne --no-focus` created w3; `workspace list` shows label exactly `Himne`.
