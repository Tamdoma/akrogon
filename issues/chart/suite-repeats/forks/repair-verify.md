# repair-verify

## Question

Q1. At the end of check.repair, B runs `akrogon verify` on the committed head whether it then moves to `merge` or hands Fixes to A in `check.fix` (`skills/check-issue/SKILL.md` `## check.repair`, the paragraph beginning "After repairs"). Should B run it only when the move is `merge`, the one move whose gate needs the leaf receipt (`src/phase.ts` check.repair to merge calls `requireGreenReceipt(..., 'leaf')`)? And what about the done-criterion proof reruns in the same sentence?

Q2. What proof shows it works, without going overboard, given this is seat process text, not code?

### Carries

- Operator 2026-11-01: "Less is always more (less code, even removing)"; "do testing to confirm it works. Don't go overboard with testing, do something reasonable."
- History: 278d5499 (2026-10-14) removed B's check.repair verify ("merge verifies the stack top under the receipt gate"); fb236ec0 (2026-10-15, green-rate chart) restored it because "repair moves into merge need a leaf receipt". system-speed D3 (2026-10-15) rejected a check.repair to implement bounce (routing and the locked test-authorship decision).
- Gates: `src/phase.ts` requires a green leaf receipt on the move into check.review and on check.repair to merge; the move check.repair to check.fix has none.
- Taken: [merge-reuse](merge-reuse.md) (merge accepts the leaf receipt on the same tree), [quick-red](quick-red.md) (a quick red blocks `full` checks).

## Findings

Blind notes `slots/repair-verify-A.md`, `-B.md`, `-C.md`, `-D.md`; merged `slots/repair-verify-merged.md`; rebuttals `slots/repair-verify-rebuttal-B.md`, `-C.md`, `-D.md`.

- In every akrogon check.repair to check.fix visit where B committed (21-22 since fb236ec0), B ran verify: 27-28 runs, about 65 min; A then changed the tree in 19 of 21, 5 of 5 since 2026-10-26 (12 min) (B,C,D). Framework: 95 of 96 such visits ran verify (108 runs, 51 min), A changed the tree in 24 of 27 since 2026-10-26 (D).
- The only receipt gates are the move into check.review and check.repair to merge (`src/phase.ts:427-432`); check.repair exits only to merge, check.fix or failed (`src/routing.ts:38`) (B,C,D).
- The closing done-criterion sweep is not dead like the receipt: A keeps B's green proofs whose inputs did not change (implement-end rerun rule), and B's sweep is the only proof reading on the exact head B hands off, before A's refresh rebases onto main (B rebuttal, C rebuttal R1-R2). Framework sweeps on handoff cost 65 min in 27 visits since 2026-10-26 (D), but a whole-tree change does not show A reran each of those proofs (B rebuttal).

## Taken

A's pick under autopilot, 2026-11-01 (not operator words):

1. Q1: in `skills/check-issue/SKILL.md` `## check.repair`, B runs `akrogon verify` on the committed head only when its move is `merge`; on a move to `check.fix` or the `failed` stop it runs none. The changed-input criterion proof reruns stay on every exit, and the per-Fix evidence paragraphs are untouched. Reason: the verify's only reader is the check.repair to merge gate, which stays and refuses loudly if B skips it; on a handoff, A's own receipt-gated move into check.review verifies the final head. Rejected: remove every repair verify (the 278d5499 shape that fb236ec0 reversed); gate the proof sweep on merge too (A's proposed pick, withdrawn on B and C rebuttals: the sweep is reused by A and is the attribution boundary at B's head); a route change (D3 lock). Dissent: D (gate the sweep too; framework cost 65 min since 2026-10-26).
2. Q2: no prose test. One assertion inside the existing check.repair-to-merge gate test (`tests/receipt-gates.test.ts:43`) shows check.repair to check.fix moves with no receipt, pinning the ungated move this rule relies on (C, D's placement). The check.review reviewer walks the revised paragraph against a pure handoff (fewer-repeat-calls 2026-10-26), mixed repairs (abandoned-capture-stop 2026-10-28) and a direct merge (B). Rejected: a markdown string test; a synthetic live session.
