# Map A: reviewer repairs

## Cost today (issues/log.jsonl, akrogon + framework, leaves created since 2026-09-15 and merged)
- 185 merged leaves, 92 check.fix entries. 112 leaves had 0 fix rounds, 62 had 1, 6 had 2, 4 had 3, 1 had 6.
- Phase time share (wall time between log rows, includes queue wait): implement 68%, check.review 11%, check.fix 10%, merge 6%, failed 5%.
- Share of reviewed leaves entering check.fix rose after the seat swap (09-29): 09-30 8 of 10, 10-01 7 of 15. Before 09-26 it was 0-40% per day.
- emdash-launch (framework): 10k-line diff, B initial review 10 Fixes. Each repair round introduced new Fixes found by B (F11 round 1, F12 and F13 round 2). F1 (live proof needing an operator permission) stayed open through 3 rounds before B stopped with failed. Two operator restarts from failed reset fix_rounds to 0, so `requiredSlots` (src/routing.ts:41) required A to review again, and A reviewed its own repair (screenshot: "the review is not independent").

## Forks
1. Who repairs a Fix: A (today), B in its own review pass, or B for a bounded class only.
2. Who verifies a B repair before merge: nobody (B self-certifies), A, or a fresh B session.
3. Which Fixes B may repair: all, or bounded ones (small patch inside leaf ownership, no plan or design change). Big gaps like emdash F2 "C9 spine absent" go to A.
4. Operator-only blockers: stop at first sight instead of riding fix rounds (emdash F1).
5. Restart from failed: should it reset fix_rounds and re-require A's review (src/phase.ts:107-112, src/routing.ts:41).

## Practitioners
- Anthropic, Prithvi Rajasekaran, "Harness design for long-running application development", 2026-03-24, https://www.anthropic.com/engineering/harness-design-long-running-apps: separating the worker from the judge is "a strong lever" because agents grading their own work praise it. The evaluator reports, the generator fixes. The evaluator becomes overhead for tasks inside the generator's ability.
- Cognition, "Closing the agent loop: Devin autofixes review comments", 2026-02-10, https://cognition.com/blog/closing-the-agent-loop-devin-autofixes-review-comments: reviewer bot and coding agent stay separate. The win came from removing the human hop, not from merging roles. Token spend rose a lot.
- Google eng-practices, https://github.com/google/eng-practices/blob/master/review/reviewer/standard.md and SWE book ch. 9: the author fixes. Reviewers may attach suggested edits, which the author accepts with one click.
- Agreement: keep the judge separate from the fixer. Disagreement: none on separation. Flip condition: small mechanical fixes (suggested-edit size) can be written by the reviewer when someone other than the reviewer accepts them.

## Pitfalls
- B merging its own repair has no independent check. Anthropic's self-evaluation bias applies directly.
- akrogon hops are already automated. The cost is cold-start context per pass and repairs that break other things, not a human in the loop.
- A weaker repair model (slot a sonnet) creates new defects the stronger reviewer then finds (emdash F11-F13). Changing who repairs targets that directly.
- realistic-fix-bar chart already took the Fix bar. Off route there: slot B model choice and fix_rounds cap.

## Recommended destination
B repairs bounded Fixes inside its own review pass, with a test that proves each, and A does a short accept check of only B's patch before merge. Large Fixes and plan gaps still go to A. Operator-only blockers stop at once. Restarts keep fix_rounds and never re-require A's review of A's own repair.
