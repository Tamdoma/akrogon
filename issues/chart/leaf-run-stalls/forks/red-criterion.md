# Red criterion at handoff

## Question
Q1. How does charting stop a done-criterion from citing a repo-wide command that nothing keeps green?
Q2. What does a seat do when a criterion is red and it cannot turn it green inside the leaf's scope?
Q3. (Operator action in framework, outside akrogon leaves.) How is framework's red `framework:verify` settled for the live leaf and the three other emdash leaves that cite it?

### Carries
- Lock: failed checks and named criteria always block review (issues/chart/realistic-fix-bar/forks/fix-bar.md).
- Lock: no clocks, watchdogs or polling (seat-stall-detection, stuck-seat-recovery, failed-leaf-routing).
- Lock: failed-leaf-routing picks a new fix leaf, never a reopen (issues/chart/failed-leaf-routing/forks/fix-routing.md:17-18).
- Rule: a handed-off contract change is new intake, not an edit to emitted contracts (skills/chart-issues/assets/shapes.md:36).

## Findings
Exchange: blind maps A, B, C and rebuttals B, C in ../slots/map-*.md. The fork questions come from those maps.

- (A,B,C) C1 cites `bun run framework:verify` (framework emdash-conversion/brief.md:26). Framework blocking `checks` are hooks:parity, contracts:verify and hooks:selftest only, and merge runs only `checks` (skills/merge-issue/SKILL.md:33). Siblings emdash-access-gate and emdash-deploy-profile merged 2 skills:typecheck errors without any check failing (A).
- (C, verified by A) Recurrence: framework learnings/LESSONS.md:38 (2026-09-13). emdash-kit AC8 failed the same way and the operator ruled by hand (emdash-kit/review-B.md:129-131). emdash-content-fixes brief.md:27 and emdash-launch brief.md:84 cite the same command.
- (B,C) Part of the red was the leaf's own fixture node_modules residue (review-B.md).
- (A,B,C) implement-issue/SKILL.md:31-32 already ends a pass `failed` when a locked decision must change, but it is worded for "a fix". A handed off "C1 modulo pre-existing base red" (report.md:69), then recorded F1 "Documented, not repaired" (plan.md:133). B will re-file F1, so the leaf loops toward `fix_rounds` 3.
- (C R8) A base probe at handoff goes stale when another leaf merges red before the leaf starts. That is exactly how the 2 type errors arrived.
- (B F1) Command-owned proof (phase refuses red) is a real option. Today `src/phase.ts:211-216` checks only a clean, non-empty diff.
- Research: practitioner · Graydon Hoare, after Ben Elliston, "not rocket science rule": "automatically maintain a repository of code that always passes all the tests" (via Jane Street, https://blog.janestreet.com/making-never-break-the-build-scale/, and typesanitizer.com/blog/not-rocket-science.html, read 2026-10-01; the original graydon2.dreamwidth.org/1597.html returned 403). akrogon's merge gate already implements this rule, but only for `checks`. A criterion citing a command outside `checks` relies on a command the rule does not protect. This finding shaped Q1's recommendation.
- Research: better-than-training · framework package.json:91. `framework:verify:core` chains hooks verify, skills/fingerprint typecheck, lint, contracts, scans and validators. Wall time is unrecorded, so adding it to `checks` has an unknown merge cost.

### Partial answers (operator 2026-10-01)
Verbatim: "1 - elid, I dont understand at all | 2a - but how will this work? | 3 - just communicate the exact fir to the watch-framework tab over there. It can stop the current leaf, do the fixes and restart it. Just tell it through herdr what to do and how to test it fast."
- Q1: open. Re-explained in simpler words.
- Q2: 2a chosen. The question asks how it works, which does not reopen the choice.
- Q3: settled as an operator action, outside akrogon leaves. The door sent the framework watch-framework pane (wA:pF9) a task file: stop the leaf `failed`, fix the 2 type errors and lint on framework main, remove the fixture node_modules residue, rebase the lane, fast-test (skills:typecheck, lint, hooks:verify-mojibake, test:emdash-conversion, then framework:verify once), record evidence in report.md, and restart. Adding `framework:verify` to framework `checks` is held for Q1.

## Taken
Operator 2026-10-01, verbatim: "1a |" (Q1). Q2 and Q3 were answered earlier (see Partial answers).

- Q1 1a: a done-criterion may cite only a command in the destination's blocking `checks` or a test the leaf itself adds. A leaf that needs a larger repo-wide command gets it added to `checks` first, after a prerequisite makes it pass. Reason: merge already refuses red `checks`, so a protected command cannot be broken by a sibling (the not-rocket-science rule). Foreclosed: 1b, a base probe at handoff, which goes stale when another leaf merges red.
- Q2 2a: during implement or check.fix, a criterion that still fails and cannot pass within the leaf's owned surfaces ends the pass `akrogon phase <slug> failed --reason "<criterion> red: <cause>"`. It is never handed off as pre-existing. This reuses implement-issue/SKILL.md:31-32 and the existing failed announcement (src/phase.ts:57,75). Foreclosed: 2b, a command-owned proof gate in `src/phase.ts`.
- Q3: operator action through the framework watch-framework pane, not an akrogon leaf. Following Q1, step 7 adds `framework_verify: bun run framework:verify` to framework `issues/config.yaml` `checks` once it is green on main.
Observed 2026-10-01 07:07: round 2 rebased onto the base fix (c5ff8786e) and ran `framework:verify`, which exited 1 after 1m46s on `validators:verify-secret-env-index` (5 names in .env.example declared by no skill, reproduced on main). Seat A ended the pass `failed` as 2a requires, and the stop held. Cause: `framework:verify` is not in `checks`, so merged leaves broke main without the merge gate seeing it. `framework:verify:core` (framework package.json:91) is one `&&` chain, so each run shows only the first red. Q3 amended (door task v3, scratchpad framework-c1-fix-v3.md): run every step separately to list all reds at once, fix them, and add `framework_verify` to `checks` in the same push.
