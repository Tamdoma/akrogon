# Rebuttal C (disagreements only)

## X1. The Meta paper does not contradict B repair (merged.md:25)

The paper measured human reviewers who were shown AI-written patches during review. Reviewers took over 5% longer, so Meta showed the patches to authors only. It did not test a reviewer who writes the fix. The slowdown came from reading someone else's patch, which is the cost 2a adds to A, not a cost of B repairing. Source: https://arxiv.org/abs/2507.13499, abstract, read 2026-10-02.

Correct reading: the paper is weak evidence against adding a patch reader (2a), and no evidence against 1a.

## X2. Q2 recommendation 2a is not the better default (merged.md:33)

I still hold 2b for the re-check and merge passes. Evidence:

- 2a leaves an undefined path. If A's check of B's patch says `fix`, the command sends the leaf to check.fix, which is A only (`src/phase.ts:233`, `src/routing.ts:31`). A would then repair B's repair and B would re-check it. That is a new loop, not a shorter one.
- 2a needs routing and state work that 2b does not. `requiredSlots` has no notion of repair author (`src/routing.ts:42-44`) and state has no field for it (`src/state.ts:49` holds only the counter).
- B already ships unreviewed code edits today: it commits outstanding changes and resolves rebase conflicts before push (`skills/merge-issue/SKILL.md:35`, `:39`). 2a would hold a small tested fix to a stricter rule than a conflict resolution.
- The sources that require a separate judge do so when the judge only reads. Park and Choi found the gap closed when success was checked against real behavior (https://arxiv.org/abs/2607.25152). A failing-first test plus `checks` and `merge_checks` is that kind of check.

One point against my own position: A's patch check would be fast. Framework re-check legs have a median of 2 minutes (`framework/issues/log.jsonl`). The cost of 2a is the build work and the new loop, not wall time.

A fair middle option is missing from Round 1: 2b for re-check and merge, where B is alone in the worktree, and 2a only if B is later allowed to repair during the initial review.

## X3. "The loop grew after the seat swap" states a cause the log does not show (merged.md:5)

The log shows the fix rate rising before the swap: 24 of 135 review exits (18%) on Sept 1 to 15, 49 of 159 (31%) on Sept 16 to 28, then 35 of 70 (50%) since Sept 29 (`framework/issues/log.jsonl`). The date `gpt-6.1-sol` entered slot B is unverified. Leaf size also changed: the median recent repair is 121 lines against 27.5 all-time. The merged line should say "rose across September and is highest since Sept 29", without naming the swap as the cause.

## X4. "B repairs count against the cap" is not free under either Q2 option (merged.md:39)

`fix_rounds` increments only on a check.review to check.fix move (`src/phase.ts:107-109`). A B repair inside a review or merge pass makes no such move. Counting it needs a state change. The next-fork line should say so, or the fork should offer "B repairs do not count, B gets one repair attempt per pass" as the skill-only option.

## X5. "Verdicts have no commit identity" is only partly true (merged.md:14)

State holds no head per verdict, but every logged move records `head` (`src/log.ts:10`, `:28`), and each review file records its reviewed head (`skills/check-issue/SKILL.md:43`). The race is real. The claim should be "state does not bind a verdict to a head".
