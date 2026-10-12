# Fork notes brief: proof-rule round 2, slot B

You are slot B. Write blind notes, your own position, for the two open questions below. Do not read slots/proof-rule-2-A.md or slots/proof-rule-2-merged.md. You may read forks/proof-rule.md (Question and the "Partial operator answers" block) and forks/proof-owner.md. Do not edit any repository file.

Note format: the five-part fork note in /home/ivan/.claude/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (paragraph starting "For the opening map"). One note per question. Keep it under 500 words total; the operator wants the plainest possible round.

Return path, exactly:
/home/ivan/Work/infra/akrogon/issues/chart/changed-test-proof/slots/proof-rule-2-B.md

## Operator answer, verbatim
`1a | 2a | 3a | 4- I don't understand this, why do we need a minimum. We just need a minimum of minimums that will suffice. | 5a | Question: why do we even need to run this chart? What was the trigger point? Are we again changing how the testing works?`

## Questions
Q4 (reopened). How many proof runs, where one run means the changed case runs while the stages affecting it at merge run beside it (2a, about 4-5 min for a framework browser test)? The operator asks for "a minimum of minimums that will suffice". Options to weigh, add your own: one run; a fixed small floor; different counts for a new or changed risky test versus a test being fixed after it already failed under load; planner-set.
Q6 (new). Should akrogon add this rule at all: the rule as answered (1a 2a 3a 5a plus Q4); a reviewer-only version (proof taken before the test changed does not count, a test fixed after failing at merge needs more than one run, no new runs for new tests); or no change, closing #86 as not planned (one confirmed case, test already fixed on framework main 58df9333c)?

## Carries
- Earlier testing-rule charts handed off: check-reruns 2026-10-01, test-runs 2026-10-03, agent-test-rules 2026-10-03, merge-load-flakes 2026-10-10; framework-test-scope still open.
- #86 was filed from the operator's account 2026-10-11T19:22Z after the operator asked why the test merged.
- Locks as in forks/proof-rule.md Carries.

When the file is written, your turn is done.
