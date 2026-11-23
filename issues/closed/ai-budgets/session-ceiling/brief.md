# Brief: session-ceiling

## What

Add one optional machine key `paid_budget: {sessions_per_day, session_minutes, approved: {date, answer}}` to `~/.akrogon/config.yaml` and a `--sessions <n>` flag to `akrogon run-check`. With the flag, run-check reserves n paid sessions in a host ledger `<globalHome>/budget.jsonl` under an exclusive host lock `<globalHome>/budget.lock` before the command starts, refuses when the rolling 24-hour total plus n passes `sessions_per_day`, and exports `AKROGON_SESSIONS=<n>` and `AKROGON_SESSION_MINUTES=<m>` to the command. Outcome: paid test sessions on this host are counted by the machine against one operator-set ceiling.

## Why

Today every paid session count is a per-leaf operator approval and a seat-written count line, so the operator is the approval bottleneck (four approvals for one leaf on 2026-11-21/22) and no total across leaves exists. A machine count against one standing ceiling removes per-leaf counts while keeping a hard budget (signposts S1, S3, S4).

## Done-criteria

1. With `paid_budget` set, `akrogon run-check --name <x> --sessions <n> -- <cmd>` under the ceiling starts `<cmd>` with `AKROGON_SESSIONS=<n>` and `AKROGON_SESSION_MINUTES=<session_minutes>` in its environment and appends one ledger row `{at, repo, slug, run, sessions}` before the command starts; the row stays whatever the command's exit. Proof: own CLI tests under a temp `AKROGON_HOME`.
2. A reservation whose rolling 24-hour total plus n passes `sessions_per_day` is refused, starts no command, writes no row and prints the window total, the ceiling and the time at which this n fits, or that n exceeds the ceiling and never fits; rows older than 24 hours are not counted and rows from two repos sum. Proof: own CLI tests.
3. `--sessions` with no `paid_budget` key refuses naming `paid_budget` in `~/.akrogon/config.yaml`; a non-positive or non-integer n refuses. Proof: own CLI tests.
4. A malformed or unreadable ledger refuses printing the file and the bad row; a failed append refuses and starts no command. Proof: own CLI tests.
5. While another process holds `<globalHome>/budget.lock`, a `--sessions` run writes no row and starts no command, and it proceeds after the lock is released. Proof: own test.
6. A run refused by `refuse()`, the `merge_checks` refusal, `ownerRefusal` or the first `failedRefusal` writes no ledger row; a run refused later keeps its row. Proof: own CLI tests.
7. A repo config listing `AKROGON_SESSIONS` or `AKROGON_SESSION_MINUTES` in `env` or `pass_env` is refused at parse; a run-check without `--sessions` passes neither variable to its command, including a nested run-check inside a reserved one. Proof: own tests.
8. `akrogon config` prints `paid_budget` when set; `budget.jsonl` is moved with the home by `src/state-home.ts`. Proof: own tests.
