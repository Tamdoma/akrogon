# Blind notes, seat C: proof-command-owner

Question: Do done-criteria lock only the observable result while the plan owns the exact proof command, and who may correct that command?

## 1. Pick

O1: Yes. A done-criterion in the brief locks only the observable result and its ownership. The plan owns the exact proof: test, runner, arguments, and inputs. Any test-runner command written inside a criterion is proof, not outcome, including in leaves already in flight. A direct invocation of the product named as the result itself (running the CLI prints X) stays locked outcome, because there the invocation is the behavior under test.

Who may correct the proof command:

1. Plan A chooses it at plan.synthesis, using the repo's configured runner, script, or `checks` command with its existing isolation, timeout, environment, and preload semantics. Plan A does not invent an ad-hoc invocation with different semantics.
2. Implement A and check.fix A may correct it in `plan.md` when it is wrong, as a plan correction, recorded with old command, new command, and the evidence below. This is the same seat and shape as the existing wrong-expectation correction.
3. Review seats judge the correction. B in check.review routes a wrong proof as a Fix to A and commits nothing. B in check.repair and merge does not replace the command to make its own repair pass: it hands to A through the existing endings.
4. Workers never correct it. They return a mismatch, as now.

A correction is allowed only when the observation is unchanged: same boundary, same cases and inputs, same failure caught. The seat proves that with kept logs showing the old command red or wrong for a runner-semantics reason (different from the repo's configured runner, or the same named failures at `AKROGON_BASE`), the new command running the same named tests through the repo runner, and for new behavior the deliberate break still turning it red. A correction that drops a case, filters names, narrows scope, weakens a budget beyond the repo's configured runner, or widens a live or paid action is not a correction. That changes the outcome or its grant and stays with the operator through the locked-decision stop.

Reason: the operator approves what must be true at handoff, not runner flags. The plan already chooses tests and commands at HEAD, so this removes a second owner for the same decision instead of adding a base-run gate on top of it. In #105 the operator's edit added `--isolate` and changed no outcome, which shows the command was never the operator's decision.

Cost: small. The outcome-only rule already exists in chart shapes, so the work is one defined correction rule where three skills already cite the undefined name `test-proof-rules`, plus the rule that a runner command inside a criterion is proof. The brief text is not edited by seats: `plan.md` records the corrected command, and review judges it there. No new command, phase, or state.

## 2. Rejected options

O2: The criterion locks the exact command and the operator amends it (what happened in #105). Rejected: it spends an operator round trip and about 25 minutes on a flag the operator did not choose, and it already recurred after #47.

O3: Run every criterion command on the base at charting or handoff and refuse a red one. Rejected: at charting the proof tests do not exist yet, the plan writes them, and new-behavior tests are intended red at base. The gate would refuse valid red-first proof, cost a full run per leaf, and still need a correction path when the base moves after handoff.

O4: Extend known-red so a criterion proof that is red at base counts as passing. Rejected: it waives the proof instead of proving the outcome. The #105 leaf would pass with no green run of its own criterion, and new failures mixed into base failures would be cleared with them. Known-red stays for `checks` commands run by `akrogon verify`, where head and base logs are compared per named test.

O5: Let any seat swap the command when it is red, including B in repair and merge. Rejected: the seat that needs a green result would grade its own repair. Current rules already accept B's repair only through a planned proof B did not write, and bar B from correcting test expectations. A proof command deserves the same bar.

O6: Keep commands in briefs and rely only on the chart audit refusing test files in criteria. Rejected as the sole fix: that audit already exists at HEAD and the #105 criterion still named three test files, and an audit at charting does nothing for in-flight leaves or for runner drift after handoff. O1 keeps the audit and adds the correction path behind it.

O7: Fix the base-red cause inside the leaf (here, the sibling files leaking module state). Rejected: the leaf does not own those files, so this widens scope to buy a green run of a command the repo runner already runs green.

## 3. Evidence

Tier 1 = HEAD source read directly 2026-10-19. Tier 2 = intake record. Tier 3 = lesson or map record.

E1 (Tier 1, `skills/chart-issues/assets/shapes.md`, sections "Leaf files" and "Preflight and validation", read 2026-10-19): a done-criterion is "an observable result in this leaf's ownership, never a test file, assertion or test count," and the handoff audit refuses a criterion naming one. Outcome-only criteria are already the written rule, so O1 enforces an existing contract.

E2 (Tier 1, `skills/plan-issue/SKILL.md`, section "plan.synthesis", read 2026-10-19): `plan.md` maps each criterion to "the command that observes it," each proof command "uses a runner or script that exists at `AKROGON_BASE` or is one direct invocation of the product," A writes the tests and shows each new one red, and "`plan.md` names the test and the command for each criterion." The plan is already the de facto command owner.

E3 (Tier 1, `skills/check-issue/SKILL.md`, section "check.review", read 2026-10-19): a scenario blocks "as an outcome the criterion names, never as a named test, because a criterion names a result, not a test file," and B checks that the report runs the planned tests through the commands `plan.md` names and that nothing "skips, filters or disables a planned test or the runner configuration it depends on." The equivalence guard O1 needs already sits in review.

E4 (Tier 1, grep of `skills/` and `src/` at HEAD, 2026-10-19): check-issue, implement-issue, and merge-issue each route "a unit of the leaf's own done-criteria that is wrong" to A under `test-proof-rules`, and no file defines that name. The correction authority is cited but missing, which is why a seat defaults to treating a wrong command as operator-locked.

E5 (Tier 1, `skills/implement-issue/SKILL.md`, section "Shared context", read 2026-10-19): a fix needing a locked decision changed ends the pass `failed`, and a red criterion that cannot pass within owned surfaces "is never handed off as pre-existing, base red or modulo anything." With the command inside the criterion, these two rules together make an operator stop the only exit for a wrong command. O1 keeps both rules for outcomes and removes the command from what they lock.

E6 (Tier 1, `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md`, known-red paragraphs, read 2026-10-19): known-red runs through `akrogon verify`, which runs the configured `checks` on head and base. It cannot clear an ad-hoc criterion command that no `checks` entry runs, which is the #105 shape, so O4 would need new machinery and O1 needs none.

E7 (Tier 2, `issues/chart/criterion-outcomes/INTAKE.md`, source Tamdoma/akrogon#105, 2026-10-18): the criterion command showed the same 9 failures at base `5319be650` and head `9762505ff`, the repo runner `hooks:selftest` uses `bun test --isolate` and passes, and the operator's criterion edit plus resume cost about 25 minutes after two review and fix rounds.

E8 (Tier 3, `learnings/history/2026-10-16-review-test-command-equivalence.md`, dated 2026-10-16): preserve the repo runner's "timeout, environment, preload and file-scope semantics" when judging a failure, since a stricter ad-hoc invocation is a different contract, and this "does not justify suppressing failures of required checks or weakening their budgets." O1's correction direction is only toward the configured runner, and this leaf can retire that lesson once the rule stops the mechanism.

## 4. Pitfalls

P1: A "correction" that quietly narrows proof, by dropping a file, filtering test names, or raising a timeout past the repo's configuration. Removed by the unchanged-observation test: kept logs show the same named tests running, a deliberate break still turns new-behavior proof red, and B already rejects skip, filter, and disable changes per E3. Anything narrower is an outcome change for the operator.

P2: Flake shopping, where a seat swaps commands until one is green and isolation hides shared-state damage the leaf itself caused. Removed by allowing correction only toward the repo's configured runner or `checks` command, never away from it, and only with the diff-cause judgment the known-red rules already require. When the configured runner itself is red at base with the same names, that is not a wrong command: `checks` take known-red, and the leaf's own criterion takes the existing red-criterion stop.

P3: The outcome is itself a command's behavior, so calling every command "proof" would unlock product behavior. Removed by the split in E2 that already exists: "one direct invocation of the product" named as the result is outcome and stays locked, while a test-runner invocation is proof. The plan's criterion mapping records which one it picked.

P4: A configured `checks` or `merge_checks` command goes red at base and a seat treats repo config as plan-owned proof. Removed by naming the boundary: the plan owns only the criterion proof command in `plan.md`. Config `checks` stay repo-owned, take the verify known-red path, and changing them is product work for another leaf, never a proof correction.

P5: Leaves already in flight carry a literal runner command in the brief, so an outcome-only rule for new briefs leaves the #105 class alive until they drain. Removed by the interpretive half of O1: a runner command inside any existing criterion is proof, not a locked decision, so A corrects it in `plan.md` under the same guard and no brief is rewritten.

P6: Correcting a live or paid proof command widens the operation it runs. Removed by existing bounds: grants are compared before each covered operation and never widened, and check.repair already excepts a new or widened live action from B. A correction that changes target, identity, or scope of a live or paid run is an operator stop, not a correction.

## 5. Questions the fork does not ask

Q1: Should the missing `test-proof-rules` be defined once and pointed to from check-issue, implement-issue, and merge-issue, instead of adding correction text as a fourth copy? The carry for this chart says remove redundancy before adding code, and E4 shows three citations of one undefined name.

Q2: Does this need a mechanical guard in the `akrogon` command (refusing a brief criterion that names a test runner invocation or test file), given the prose audit in E1 already existed and #105 still passed it? A prose-only fix may repeat the same miss at the next charting.

Q3: Who owns the proof command on routes with no `plan.md`, the chart direct route and standalone work? The direct route has a door and a reviewing B but no plan synthesis, so O1's owner and correction record need a named home there (the `Direct attempt` record is the candidate) or the fork settles leaves only.

Q4: When a repo has no configured runner script or `checks` entry covering a criterion's tests, what anchors the "correct" command for an equivalence judgment? O1 leans on the repo runner as the reference, and repos without one fall back to planner judgment that B reviews with no fixed reference.

Q5: Should corrections be bounded, for example one per criterion like the one-wrong-expectation exception, so a seat cannot keep swapping commands across rounds? The fork asks who may correct, not how many times, and an unbounded right weakens the P2 guard.
