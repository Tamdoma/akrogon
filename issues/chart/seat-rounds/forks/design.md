# Design: seat-rounds

## Question

Final shape for X1 (drop A's first review), P3 (B repairs test and proof mistakes, signpost 5a), the frozen-citation scope, P8 and X2.

## Findings

slots/design-B.md, slots/design-C.md.

- A-only real product defects in first reviews: B counts 42 of 426 leaves (10%), 15 of 15 spot-checked held; C counts about 1% verdict-changing plus about 4.5% inside fix/fix leaves. Both find a real share A alone catches. (B,C)
- Seat work is fast: A's review median 1.4 min, B 3.2 min, against merge 1,089 h vs implement 365 h (#149 intake). Dropping A's review saves about 1.4 min per leaf. (A, INTAKE #149)
- check.repair to check.fix hand-offs: 0.6 per merged leaf, each two turns. Expectation and proof-command items: 22% of lists alone (B), 48% of items (C); with missing case, capture or recording 56% of lists (B). (B,C)
- Frozen citation: nothing says what "locked" covers; check16-reads-imports stopped for the operator over a named call that did not give the stated result. (B,C)
- X2: repeated text, no two copies disagree. P8 is the frozen-citation rule. Mechanical implement-exit check: not needed after P3. (B,C)

## Taken

A's picks (full autopilot), 2026-11-23:

1. X1: keep both blind first reviews (B Q3 O1). 4a is merge speed; A's review costs about 1.4 min and catches a real product defect in 4.5-10% of leaves, each of which would otherwise ship or come back as a red. C's drop recorded as dissent.
2. P3: skills/check-issue/SKILL.md:79 first sentence replaced by B's text (slots/design-B.md section 2): B repairs test-expectation corrections, proof-command corrections and a criterion proof missing only a case, capture or recording, when B has not changed in this leaf the product code that test or command exercises; a pair needing both goes to A; each correction cites its source in the Test-Change trailer, keeps old and new value, the old red on the head and one deliberate break turning the corrected test red in review-B.md; never deletes a case, skips or filters a test, or widens an assertion past the source. Acceptance: "B's code repair is accepted only by a proof B did not write or change in this leaf passing on the repaired head." The same commit fixes check-issue :65, :79 (missing-case sentence), :83, :95 and plan-issue :43. (B Q1 O2, Q2 O1; 5a "only real code problems go back to A"; C's narrower reach not taken)
3. B keeps repairing code Fixes as today (B Q4 O1).
4. Frozen citation: one rule in skills/lifecycle-rules.md (B section 3 text: a decision locks the result it states; a named means is locked only when the decision says so; a means shown not to give the result is replaced with one dated plan.md implementation note, no brief edit, no operator). The "four rules" count at :3 becomes five. (B Q5 O1; C's two copies and shapes.md clause not taken: one place)
5. Dropped: P8 as its own item, X2, the implement-exit mechanical check. Re-measure after P3. (B,C)

Figure: framework seat moves per merged leaf 6.8 mean (B, log.jsonl) / 9.32 last 50 (C, with first reviews); hand-offs per merged leaf 0.6 toward 0.3.

### Final shape corrections (A, 2026-11-23, from slots/final-C.md)

- [2] "the old red on the head" applies only when the old test or command failed; for a vacuous test (green on broken behavior) B keeps the run showing it passes on broken behavior; a missing case has no old run. The deliberate break turning the corrected or added test red stays required always. (C1)
- [2] check-issue :87 joins the edit list: a Test-Change trailer is also required for a test file B adds after the freeze, matching src/phase.ts:680-685. (C2)
- [2] For an added case, capture or recording the evidence is the deliberate break alone: the new case red with the break, green without it. (B2, same as C1)
- [2] docs/start/why-it-works.md:19 changes its example of a hand-back to a locked decision; docs/examples/autopilot-story.md:48 is a past-run story and stays as history. (B1)
