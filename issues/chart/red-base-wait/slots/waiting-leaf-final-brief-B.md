# Focused final-shape check, slot B: waiting-leaf (operator changed the mechanism)

Read: /home/ivan/Work/infra/akrogon/issues/chart/red-base-wait/forks/waiting-leaf.md (all sections, including both operator replies and the "Systemic angle" finding), and the Chromium CQ doc https://chromium.googlesource.com/chromium/src/+/master/docs/infra/cq.md.

Proposed final shape to record (operator chose 1a and 2a):
1. No pre-merge leaf ever stops, waits or fails because main is red. A red check with no cause in the diff gets one without-change (base) run; tests red on both sides are recorded on the leaf as known-red-on-base and the leaf continues to review and merge. The leaf is blocked only by tests that fail with its change and pass without it.
2. Comparison is per failing test name, not per command exit.
3. Partial answers kept: 2a (a seat whose red is already recorded for the same base skips its own base run) and 3a (one repo record listing each red check with evidence; one notice per newly red check; joins silent).
4. Reshaped next forks: (a) comparison: how a seat gets failing test names from arbitrary check commands; (b) merge gate: merge turn adopts the same rule, replacing the #67 hold that stops all merges on a red main; (c) red record close: who clears a red check from the record and who owns its fix; (d) base evidence reuse: when a recorded base result may be reused (old evidence-expiry fork); (e) worktree location outside the checkout. Old release fork dissolves (nothing waits).

Task: one focused check. Return only: anything in this shape that is wrong, unsafe or missing, with evidence (tier, source, date), and any fork that should be added, merged or dropped. No restatement of agreement.

Return path (write only this file): /home/ivan/Work/infra/akrogon/issues/chart/red-base-wait/slots/waiting-leaf-final-check-B.md
