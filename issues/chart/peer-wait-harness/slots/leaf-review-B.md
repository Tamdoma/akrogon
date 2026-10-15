F1 — Criterion 7 omits non-Codex identity continuity across budget reruns.

Evidence: `/home/ivan/.claude/jobs/6a0d8d81/tmp/pw/peer-wait-signal/brief.md:16` requires continuity only for Codex. Taken explicitly carries the exchange's kind and first session across reruns for all peers (`issues/chart/peer-wait-harness/forks/turn-end-signal.md:45–46`), as does draft `design.md:13–14`. Criterion 6 covers grace checks but does not explicitly cover replacement between separate waiter processes. Today every invocation reads a fresh identity (`skills/chart-issues/scripts/peer-wait.ts:156`), and the documented rerun starts another invocation (`skills/chart-issues/assets/questions.md:46`). A Claude session replacement or an unsupported-kind change between budgets could therefore escape the required identity error while satisfying the Codex-only rerun criterion.

Exact fix: replace criterion 7 with:

> 7. Every `budget` rerun carries the exchange's original kind and first adopted non-null session, and applies criterion 6 against that carried identity rather than starting a new identity baseline. Codex additionally carries the original pre-prompt boundary and any bound turn id, so a rerun never binds a different turn. The pi authority/session exception remains as stated in criterion 6.
