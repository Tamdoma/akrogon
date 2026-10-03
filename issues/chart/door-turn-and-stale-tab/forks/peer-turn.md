# Peer turn

## Question
Q1. While a prompted peer's turn is open, what must slot A do, and where does that rule live, so the peer's return is read and the exchange continues without the operator?

### Carries
- Lock from chart peer-wait (handed off 2026-09-30): guarded prompt `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`, any non-zero exit to the operator with no automatic re-prompt; bounded repeated `herdr agent wait <pane> --timeout <T>` before and after the prompt, T below the harness command timeout.
- Related: [stale-tab](stale-tab.md) (independent).

## Findings
- Evidence: see INTAKE.md Agent findings (#54).
- Options merged (slots/map-merged.md): 1a stay in turn with foreground bounded waits (A,B), 1b end turn only after a proven harness resume mechanism (B), 1c `akrogon peer-wait` command (A).
- B rebuttal (slots/rebuttal-B.md), accepted: keep the harness-timeout bound on T; idle with a missing or empty return file is peer failure; the notification-timing finding is A's alone.
- Operator 2026-10-03, verbatim: "1a - check every 10 seconds, with a deterministic script like what you have now so almost no tokens are spent"
- Final shape: slots/final-check-shape.md. B focused check (slots/final-check-B.md), accepted: per-wait cap min(10000, remaining budget) on a monotonic deadline, no new wait after expiry; exit precedence herdr error, then blocked, then file. B: script home is not a material operator question (A,B).

## Taken
Operator 2026-10-03, verbatim: "1a - check every 10 seconds, with a deterministic script like what you have now so almost no tokens are spent"

Settled shape:
1. While a prompted peer's turn is open, A stays in its turn. No background waits. The footer never names a pending peer. A ends its turn only for an operator round, a peer failure or a peer in `blocked`.
2. The wait is a shipped script, `skills/chart-issues/assets/peer-wait.sh <pane> <return-file> <budget-seconds>`, called in the foreground. It loops `herdr agent wait <pane> --timeout <min(10000, remaining)>` on a monotonic deadline, starts no wait after the deadline, prints nothing per loop and one result line at the end. The budget stays below the harness command timeout with room for overhead.
3. Exit precedence after each return: a herdr failure other than `timeout` (pass the error through), then `blocked`, then done (return file non-empty), then peer failure (idle/done with the file missing or empty), then budget used up while still working (A reruns at once).
4. questions.md Blind peer exchange calls the script. SKILL.md Drain/Take and Printed footer get short pointers. Prompting is unchanged (guarded `--wait --until working --timeout 5000`, no automatic re-prompt).

Reason: a background wait plus a footer stranded B's return for 10 minutes (#54), and the hand-typed loop used AND where the rule says OR. A shipped script runs the same code every time and spends tokens only when it returns.
Foreclosed: 1b harness resume mechanism (does not exist, unproven); 1c `akrogon peer-wait` command (more code, still needs the stay-in-turn rule); inline loop typed by A (drifts, caused the AND/OR bug).
