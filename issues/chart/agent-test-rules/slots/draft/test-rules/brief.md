# Brief: test-rules

## What
Rewrite the akrogon skill rules on tests and done-criteria. This leaf changes skill and asset text only.

1. Outcome criteria (4h). Done-criteria state observable results only, never a test file, an assertion or a test count. The plan picks the proof for each criterion (`skills/plan-issue/SKILL.md:61`), and that proof is replaceable work, not contract. The shapes Done-criteria template (`skills/chart-issues/assets/shapes.md:134`) and the implementer audit (`:252`) say so. The audit refuses a criterion that names a test file, assertion or count. It keeps refusing `merge_checks` commands and repo-health claims outside leaf ownership. In check.review, a scenario a criterion names blocks as an outcome, not as a named test (`skills/check-issue/SKILL.md:55`). B judges the diff against the brief's done-criteria as well as the plan (`:39`).
2. Cited source (1a). Any seat, whether implementer, reviewer, repairer or merger, may change or delete an existing assertion, fixture or recorded output only when it cites the brief outcome or the real source the old expectation contradicts. Otherwise the seat leaves it unchanged. New tests need no citation. This applies in implement and check.fix (`skills/implement-issue/SKILL.md:57`, `:75`), in check.repair (`skills/check-issue/SKILL.md:75`) and at merge after a rebase (`skills/merge-issue/SKILL.md:43-45`). In check.review, B judges each changed existing expectation against the source it cites.
3. Tests worth having (5a, 6a, 7a), in `skills/implement-issue/SKILL.md:57`, `skills/check-issue/SKILL.md:51` and `skills/chart-issues/assets/standing-design.md`:
   - 5a: default to the smallest test at the real boundary (CLI, HTTP, browser, DB). Use unit or property tests only for logic that matters, where they catch bugs more cheaply. Use E2E only where smaller tests miss browser, runtime or wiring bugs.
   - 6a: delete a false or outdated expectation with its reason. Delete a duplicate only after naming the test that still catches the same bug. Judge a batch of deletions as a batch. Keep every test that guards a real past regression.
   - 7a: a bug fix shows its test failing before and passing after. New behavior shows one deliberate break turning its test red. No mutation score.
4. Wrong test red on base (8a). The base-run rule (`skills/implement-issue/SKILL.md:38`, `skills/check-issue/SKILL.md:59`) gains one case. When a seat proves a test is red on base and the test itself is wrong, meaning it contradicts a brief outcome or real source under rule 2, the first seat to prove it fixes that one expectation in its own commit with the reason and continues. B reviews that commit like any other diff. Other leaves get the fix by rebase. A test that is red on base because the code is really broken keeps today's `failed` stop. At merge, a wrong test exposed by the rebase takes the same fix (`skills/merge-issue/SKILL.md:45`).

The commit trailer format and the `akrogon phase` check belong to `test-change-check`. This leaf states when a change is allowed and what it must cite, never the trailer format.

## Why
Today the shapes template makes each criterion a test recipe ("a test this leaf adds", `shapes.md:134`), and check-issue:55 makes named scenarios block. A bad test written into a brief therefore becomes contract, and seats either stop on it or bend code around it. In the past week codex B changed existing expectations in 5 leaves and the pi merger re-recorded tests in 10 framework leaves, with no rule saying when that is allowed (`issues/chart/agent-test-rules/INTAKE.md`). A low-value TMPDIR assertion blocked two akrogon leaves until the operator ordered it removed. A test that is wrong on base stops every leaf that touches it.

## Done-criteria
1. `skills/chart-issues/assets/shapes.md`: the Done-criteria template and the implementer audit say a criterion states an observable result, never a test file, assertion or test count, and the audit refuses one that does. `skills/plan-issue/SKILL.md` still maps each criterion to its proof.
2. `skills/check-issue/SKILL.md`: check.review blocks on criterion outcomes, not on named tests, judges against the brief's done-criteria, and judges each changed existing expectation against its cited source. Test blocking states 5a, 6a and 7a.
3. `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` check.repair and `skills/merge-issue/SKILL.md` each state rule 2: an existing assertion, fixture or recorded output changes only with a cited brief outcome or real source, and new tests need no citation. implement-issue and `standing-design.md` state 5a, 6a and 7a.
4. The base-run paragraphs in `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md` and the fix-forward line in `skills/merge-issue/SKILL.md` state the 8a case: a wrong test proven red on base is fixed in its own commit with the reason, and a really broken base keeps the `failed` stop.

Credentials: none. Human prerequisites: none.
