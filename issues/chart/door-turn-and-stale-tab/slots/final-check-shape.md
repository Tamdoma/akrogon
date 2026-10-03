# Peer turn: proposed final shape (for B focused check)

Operator correction 2026-10-03, verbatim: "1a - check every 10 seconds, with a deterministic script like what you have now so almost no tokens are spent"

## Shape
1. While a prompted peer's turn is open, A stays in its turn. No background waits. The footer never names a pending peer. A ends its turn only for an operator round, a peer failure or a peer in `blocked`.
2. The wait is one foreground script call per tool call. It loops `herdr agent wait <pane> --timeout 10000` (`herdr agent wait` without --until matches idle, done or blocked, verified on herdr 0.9.3). After each return it checks the return file. It prints nothing per loop and one line at the end, so A spends tokens only when the script returns.
3. The script exits:
   - done: the return file is non-empty, or the peer is idle/done and the file is non-empty.
   - peer failure: the peer is idle/done and the file is missing or empty.
   - blocked: the peer reports `blocked`.
   - budget: its run budget is used up, still working. A reruns it at once. The budget is an argument kept below the harness command timeout.
   - any herdr failure other than `timeout`: pass through herdr's error.
4. Proposed home (A): a shipped file `skills/chart-issues/assets/peer-wait.sh <pane> <return-file> <budget-seconds>`, called from questions.md Blind peer exchange, with short pointers in SKILL.md Drain/Take and Printed footer. Reason: the AND/OR bug in #54 came from A retyping the loop by hand. A shipped file runs the same code every time.
   Alternative (operator may have meant this by "like what you have now"): the loop is written inline in questions.md and A types it each time.
5. Prompting is unchanged: guarded `--wait --until working --timeout 5000`, no automatic re-prompt.

## Ask
Disagreements only, with evidence. Also: is the script's home (4) a material question the operator must answer, or settled by the correction?
