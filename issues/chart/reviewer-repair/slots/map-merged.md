# Merged map and round 1: reviewer repairs

## Measured cost
- akrogon: the loop is small. Repair plus re-check is about 8% of leaf time, median repair 5 min, median re-check 1 min. 22 of 23 re-checks passed. (B,C)
- framework: the loop grew after the 2026-09-29 seat swap. Half of reviews since then open a repair (35 of 70). Repair plus re-check is 25% + 6% of pipeline time. Median recent repair is 121 changed lines, and only 10 of 35 are 20 lines or fewer. (C, A agrees on direction)
- The re-check is cheap. The cost is A's repair leg. (A,B,C)
- Repairs by A create new defects that B then finds: 18 of 123 framework re-checks sent the leaf back again. emdash-launch F11, F12, F13. (A,C)
- emdash-launch is mostly a large-leaf and operator-blocker problem: 10k-line diff, a 191-min repair, a 547-min overnight repair, F1 and F2 needing operator permissions, and 5 failed recoveries. Changing who repairs does not fix that part. (A,B,C)

## Agreed findings
- B repairs only a bounded class, judged by scope and proof, not line count. (A,B,C)
- Operator-only items (missing token scope, live-run permission) must not be Fixes routed to A. A cannot act on them. `skills/check-issue/SKILL.md:27` already says to stop with failed, but emdash review-A.md listed the stray repo as Fix F2. (A,B,C)
- Failed recovery resets `fix_rounds` to 0 (`src/phase.ts:107-112`), so `requiredSlots` (`src/routing.ts:42-44`) requires A's review again, and A reviews its own repair. The cap of 3 never fired on emdash. Dispatch should follow who made the last repair, not the counter. (A,B,C)
- B must not edit while A's blind initial review is still reading the same head (`src/phase.ts:216` refuses a dirty worktree, verdicts have no commit identity). (B,C)
- Keep models, the cap value and the realistic Fix bar unchanged. (A,B,C)

## Disagreements
- Who checks a B repair: A checks only B's patch (A,B) vs no second reader, gated by a failing-first test plus checks and merge_checks (C).
- B repairing red checks at merge: yes, same bounded rule (C) vs keep today's route to A (B). A has no position yet.

## Practitioners (read 2026-10-02)
- Anthropic, Rajasekaran, 2026-03-24, harness-design-long-running-apps: keep builder and judge separate because self-judging is lenient. The judge reports and does not fix.
- Cognition 2026-02-10 and Cursor Bugbot Autofix 2026-02-26: automate the hop from review to fix, but a separate agent fixes. Cursor: 35% of autofixes merged.
- Google eng-practices and Gerrit suggested edits: the author fixes. Reviewers may write small suggested patches that the author applies. "LGTM with comments" skips a second round for minor items.
- Meta, Maddila et al., arXiv 2507.13499, 2025-07-17: showing fix suggestions to reviewers raised review time 5.5%. They keep fix work with authors. This contradicts B repair, unless B's existing reproduction and stronger model shorten total time.
- Park and Choi, arXiv 2607.25152: self-judging loops claimed progress falsely, and the gap closed when success was checked against real behavior.

## Round 1 (fork: repair-authority)
Q1 Which Fixes may B repair itself?
- 1a (recommended, A,B,C) bounded: B already reproduced it, the change stays in files the leaf owns, no plan or design change, no missing unit, no new live run, no operator permission. Other Fixes go to A.
- 1b all Fixes after initial review.
Q2 Who checks a B repair before B merges it?
- 2a (recommended, A,B) A checks only B's patch: before/after commits and the test that failed before. Needs routing/state work so dispatch follows repair author.
- 2b (C) No second reader. Each B repair is its own commit with a failing-first test, B runs `checks`, merge runs checks and merge_checks. Skill-only change, removes the hop.

## Next forks after round 1
- timing: re-check only, initial review after A's verdict, merge red checks
- operator-only exit: one failed stop with the exact action
- round budget and restart: B repairs count against the cap, recovery stops resetting authorship
