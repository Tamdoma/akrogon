# Design: repair-verify-merge

## Binding decisions, verbatim

From `issues/chart/suite-repeats/forks/repair-verify.md` `## Taken`:

A's pick under autopilot, 2026-11-01 (not operator words):

1. Q1: in `skills/check-issue/SKILL.md` `## check.repair`, B runs `akrogon verify` on the committed head only when its move is `merge`; on a move to `check.fix` or the `failed` stop it runs none. The changed-input criterion proof reruns stay on every exit, and the per-Fix evidence paragraphs are untouched. Reason: the verify's only reader is the check.repair to merge gate, which stays and refuses loudly if B skips it; on a handoff, A's own receipt-gated move into check.review verifies the final head. Rejected: remove every repair verify (the 278d5499 shape that fb236ec0 reversed); gate the proof sweep on merge too (A's proposed pick, withdrawn on B and C rebuttals: the sweep is reused by A and is the attribution boundary at B's head); a route change (D3 lock). Dissent: D (gate the sweep too; framework cost 65 min since 2026-10-26).
2. Q2: no prose test. One assertion inside the existing check.repair-to-merge gate test (`tests/receipt-gates.test.ts:43`) shows check.repair to check.fix moves with no receipt, pinning the ungated move this rule relies on (C, D's placement). The check.review reviewer walks the revised paragraph against a pure handoff (fewer-repeat-calls 2026-10-26), mixed repairs (abandoned-capture-stop 2026-10-28) and a direct merge (B). Rejected: a markdown string test; a synthetic live session.

Excluded here: verify internals and receipt rules (leaves `merge-receipt-reuse`, `quick-red-skip`); `src/phase.ts` and `src/routing.ts` are not changed.

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md` applies as follows: no prose-matching test; the one test change extends the existing check.repair-to-merge gate test with the check.fix move, which is the cheapest proof of the ungated move this rule relies on; no machinery.

## Leaf architecture

Owned surfaces: `skills/check-issue/SKILL.md` `## check.repair` (the paragraph beginning "After repairs"), and `tests/receipt-gates.test.ts` (the test "a repair move into merge needs a green leaf receipt for HEAD").

State changes and their consumers: B no longer leaves a leaf receipt on a check.fix handoff. Consumers: A's check.fix closing pass (`skills/implement-issue/SKILL.md` check.fix) verifies its own final head before its receipt-gated move into check.review (`src/phase.ts`), and keeps B's green criterion proofs whose inputs did not change under the implement-end rerun rule; the check.repair to merge gate (`src/phase.ts`) still requires the receipt and refuses loudly if B skips it.

Open for the plan: whether docs (`docs/reference/checks.md`, `docs/examples/autopilot-story.md`) restate B's unconditional repair verify.
