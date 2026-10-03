# Round 4, slot C: bad test demanded by a criterion

## Diagnosis
- F1. The chart door already writes tests. The brief shape defines a done-criterion as "a command in `checks` ... or a test this leaf adds" (`skills/chart-issues/assets/shapes.md:134`, repeated in the audit at `:252`). So briefs are written in test language at the one point where nobody has read the test code.
- F2. The TMPDIR case follows from F1. `issues/closed/leaf-temp/leaf-temp-dir/brief.md:10-15`: six of eight criteria start "A test shows". Criterion 6 is about the test suite itself: "No test in the suite creates anything under the real `/var/tmp/akrogon-<uid>` ... a test asserts the fixture root was used." The outcome was "running the suite leaves the real temp root untouched". A turned the test-shaped wording into a path-prefix assertion (plan.md:56,85, then 175b862 `tests/next.test.ts`), which is false inside any akrogon seat because the seat's own TMPDIR starts with that prefix.
- F3. A criterion locks its proof. plan-issue maps each criterion to a proof command (`skills/plan-issue/SKILL.md:61`). A red criterion proof that A cannot make pass ends in `failed` (`skills/implement-issue/SKILL.md:36`). check.fix may not touch "criteria or failing tests" (`:75`). A scenario a criterion names always blocks at review (`skills/check-issue/SKILL.md:55`). When the criterion names a test, the test is the contract, so a bad test has no repair path.
- F4. The damage landed on other leaves. The assertion passed in its own leaf and merged. It then went red on base in wave-table and proof-order (`issues/log.jsonl:411,413`, both `implement -> failed`, recovered with `slot:null`). Red on base is a stop by rule (`skills/implement-issue/SKILL.md:38`, `skills/check-issue/SKILL.md:59`), and a seat cannot resume a failed leaf (`src/phase.ts:180-182`).
- F5. The guard against A shrinking its target already exists and does not depend on the door naming tests: B blocks when "a done-criterion has no test that would catch its failure" (`skills/check-issue/SKILL.md:51`), B reruns proof for every criterion (`:81`), and 7a adds the deliberate break.
- F6. Nothing in `src/` stops a seat editing `brief.md` (grep for `brief` in `src/*.ts` returns nothing). The "cannot shrink the target" rule is prose only.

## Options
- O1 (recommended). Criteria state outcomes only. The door stops naming tests. Proof choice belongs to plan, where it already sits (`plan-issue:61,63`).
  - Delete: the "or a test this leaf adds (...)" clause in `shapes.md:134` and the matching sentence in `:252`. Replace with one phrase: "an observable outcome inside this leaf's ownership".
  - Delete from the door's standing design the test-selection lines that only plan and implement use (`standing-design.md:7-10`). They already exist downstream (`implement-issue:57`, `brief-template.md:13,47`).
  - Change `check-issue:55`: "scenarios a done-criterion names always block" becomes "an outcome a done-criterion names always blocks". A test is then never the cited authority, only the outcome is.
  - Add: one mechanical check in `akrogon phase` when leaving implement or check.fix. It refuses the move if `git diff "$AKROGON_BASE"...HEAD -- <leaf>/brief.md` is non-empty. This turns F6 from prose into a fact. It checks state, not wording.
  - Result: a bad proof is a defect in the leaf's own new test. A rewrites it in implement, and B judges the proof against the outcome under the existing `check-issue:51`. No correction record, no return to the chart, no `failed`. Net text: about four lines deleted, one changed, about ten lines of `src/phase.ts` added.
- O2. Split ownership: B writes the criterion proofs before A writes code, and A may not edit those files (mechanical path check at the phase move).
  - Removes self-grading completely. Costs a new phase turn per leaf and a file-ownership list per leaf. B writes tests against interfaces that do not exist yet, which produces the brittle structure-coupled tests the operator wants gone. Conflicts with the open akrogon-slow-phases chart.
- O3. Keep test-shaped criteria and add an automatic amend route: a seat files a criterion-change request, the other seat approves, akrogon rewrites the brief.
  - Adds a new state, a new artifact and a second writer of the contract. It guards the fragile part instead of removing it. It is the rejected option with the human swapped for a seat.
- O4. Cross-leaf half only (F4): red on base opens a fix leaf instead of stopping. Already taken in `issues/chart/failed-leaf-routing` (1a, 2a). Do not rebuild it here. O1 lowers how often it fires.

## Recommendation
O1. It deletes door text instead of adding any, so charting carries less testing than today. The contract the code writer cannot touch becomes smaller and mechanically protected (`brief.md` outcomes). Everything A can touch (proofs) is checked by a different seat against that contract using rules that exist. F4 stays with failed-leaf-routing.

Applied to the example: criterion 6 would read "running `bun test` leaves the real `/var/tmp/akrogon-<uid>` unchanged". Any proof of that passes inside a seat. The prefix assertion would never have been a contract item, and a reviewer hitting it would have a Fix against the test, not a stop.

## Practitioner basis (from memory, not re-fetched this round; verify before quoting)
- Kent Beck, Test Desiderata: tests should be behavior-sensitive and structure-insensitive. A criterion that names the assertion makes the test structure-sensitive by contract.
- Ian Cooper, "TDD, Where Did It All Go Wrong": the trigger for a test is a behavior requirement, not a class or method.
- Software Engineering at Google, ch. 12: test behaviors through public APIs and aim for tests that never change unless the requirement changes.
- Dan North, BDD: acceptance criteria are stated as outcomes (given, when, then) and the automation is derived from them.
- Kent Beck's 2025 notes on augmented coding list "agent deletes or disables tests to pass" as a warning sign. That is why F5/F6 keep a second seat and a mechanical lock on the contract.

## Pitfalls
- P1. Vague outcomes. "Works correctly" passes an outcome-only shape. The existing implementer-read audit (`shapes.md:252`) must still refuse a criterion with no observable result. This is a contract rule, not a test rule.
- P2. A picks a weak proof for a correct outcome. Covered by `check-issue:51` plus 7a. It depends on B judgment, the same as today.
- P3. A genuinely wrong outcome still ends in `failed`. That is correct: it is a locked decision, not a testing problem. O1 removes only the cases where the goal was right and the named test was wrong.
- P4. Leaves already open carry test-shaped briefs. Apply O1 to new handoffs only. Do not rewrite open briefs.
- P5. The `brief.md` diff check must compare against the handoff base, not the previous commit, or a two-commit edit passes it. Whether rebases at merge change that base is unverified.
- P6. Overlap: realistic-fix-bar (lock) wrote "smallest test set proving criteria" into implement. O1 keeps that line and removes only the door copies. Check the lock text before deleting `standing-design.md:7-10`, since other charts cite it.
