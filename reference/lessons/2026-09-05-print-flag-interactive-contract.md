# Seats never registered: --print in an interactive-only launch path

What failed: every seat spawn timed out after 30s ("timed out waiting for agent startup"), the
reconciler backed off and retried each tick, and each retry split a new sliver pane — 8+ dead
panes per tab, zero registered agents.

Root cause: the grammar launch args carried `--print`, which makes the runtime one-shot, but
`agent start` on the multiplexer only supports interactive agents and waits for readiness. Two
halves of the design contradicted each other and nothing checked the contract. A second defect
compounded it: the pane split for a failed launch was never closed, so every retry leaked one.

Fix: 78237795 — `--print` removed from both grammars; spawnSeat closes its pane when the launch
throws (with AggregateError when the close also fails, so a broken cleanup stops the lane).

Lesson: when config (grammar args) feeds a runtime contract (interactive registration), preflight
should refuse the combination rather than let every tick rediscover it. Any acquire-then-register
sequence needs a cleanup path for the half-acquired state, and a self-test that kills the register
step. Retry loops must be bounded in the resources they consume, not only in attempts.
