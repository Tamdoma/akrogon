# Review A: model-choice-rule

Seat A (claude-opus-5-5), check.review, 2026-11-17. Blind: B's review not read.

Base 7cecb045ef1311343a2fcaf067f2eb86ed0438f1. Reviewed head b85d09900286782bedaf52c48fb358991cf2cc74, 9 commits ahead, `git status --porcelain` empty.

Seat A also wrote this diff. For a read not anchored on the author's, A had a fresh agent (same model) review the diff against the brief and design. A spot-checked every finding marked blocking at its cited line before adopting it.

## Verification evidence

- Criterion 4: `check crit4-final: 0 .../implementation/check-crit4-final-1794916673226-2157562.log` on b85d0990, 14 pass. The independent reader also ran `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts tests/run-units.test.ts`: 35 pass, 0 fail. No change since, so no rerun.
- `akrogon verify` receipt green on b85d0990 (`check-test-1794916993152-2710493.log`). The earlier red on the same head is recorded `inconsistent` in the report, with both logs, under the lifecycle red-check rule.
- AREA.md: one listing of every named path. All resolve, the bare names relative to their skill folders (`skills/chart-issues/assets/*.md`, `scripts/*.ts`, `skills/watch-issues/scripts/*.ts`, `skills/plan-issue/lifecycle-rules.md`). 36 lines, four sections.
- Docs: `docs/start/why-it-works.md:17-19` and `docs/reference/skills.md` (plan, implement, check sections) stay accurate under the new text. No documented behavior became wrong.
- No grants, paid launches or count lines. No `Test-Change:` trailers, because no test file changed.
- Design W1-W8: every element is present (W1 standing-design.md:8-19; W2 questions.md:27, 37; W3 shapes.md:267, 386; W4 autopilot.md:9; W5 plan-issue:41, 45, 51; W6 check-issue:49-95; W7 implement-issue:36-97; W8 lesson-rule.md:6, learn-issues:3, 22, 33, AREA.md, docs/reference/skills.md:53, 79).
- Report: the site table, walk, still-blocks, removals and unproven sections exist. The cited head line numbers were checked.

## Fixes

### F1. check-issue test comparison still blocks a recorded-choice Fix for lacking a test

- Where: `skills/check-issue/SKILL.md:51`, "a missing or bad test blocks only when a done-criterion has no test ... (never the choice part ...), a realistic Fix has no test, or a test mocks the unit under test", and "Bug fixes show fail-before/pass-after".
- Realistic source: the next leaf run under the released text whose reviewing seat raises a recorded-choice Fix under check-issue:49. check-issue:79 sends it to A, and the writer redoes the choice with no reproduction test. The re-check applies "the same fix-bar" and this test comparison.
- Consequence today: the choice-part exemption covers only the first clause. A recorded-choice Fix is "a realistic Fix" with no test, so the re-check blocks until a test pins the choice, which is the expected value standing-design.md:11 forbids. "Bug fixes show fail-before/pass-after" is unscoped as well, while standing-design.md:15 scopes both halves.
- Criterion hit: brief criterion 1, "no sentence left in the owned files still orders a test ... for the choice part", at the named site check.review.
- Repair: scope "a realistic Fix has no test" and "Bug fixes show fail-before/pass-after" to mechanical behavior and a choice's record, as :51 already does for the deliberate break.

### F2. implement-issue has no rule for a handed recorded choice, and its bug-fix rules stay unscoped

- Where: `skills/implement-issue/SKILL.md:56`, "A's one reproduction test for a proven product bug during implement or check.fix, shown red on the head before the fix" and "a bug fix shows fail-before/pass-after". Also `## check.fix` (:75-83), which never mentions a handed recorded model choice.
- Realistic source: the same next leaf. B's check.repair hands a recorded choice under `Handed to A` (check-issue:79), and A reads only its own skill at check.fix.
- Consequence today: "with no reproduction test for the choice" exists only in check-issue:79. A's skill tells A that a bug fix shows fail-before/pass-after and allows one reproduction test for a proven bug. A redoing a judged choice can therefore write a red-first test with an expected value for the choice.
- Criterion hit: brief criterion 1, at the named site check.fix.
- Repair: scope the reproduction-test exception and "a bug fix shows fail-before/pass-after" to mechanical behavior and a choice's record. In check.fix, add one clause: a handed recorded choice is redone by its writer with the named harm as new evidence, with no test or reproduction test for the choice.

## Nits

Each Nit is deferred because nothing shows a seat misreading it today. Evidence that would promote one to a Fix is a real seat pass that acts on the reading described.

- N1. plan-issue:53, :55 read alone ("Each condition ... gets a case", "A writes a test for each done-criterion") are unscoped. They are governed by the :51 paragraph placed before them, which is the shape design proof-form 1a chose. Promote if a planner writes a case for a choice despite :51.
- N2. standing-design.md:19, "A group-size-dependent check ... is tested ... with a too-small pool", is a separate sentence. The bullet's last sentence, "A rule needing a model's judgment has no script checker", covers a model-judged group check.
- N3. standing-design.md:18: a proxy removal under the slow-run exception is then given "each such fix gets a fail-first test". That test would assert the gate no longer refuses, which is mechanical under :15, so no choice is pinned.
- N4. implement-issue:79, "adds an executable check A runs for the corrected rule", could attach a check to a handed "record the missing reading" item (check-issue:59).
- N5. The keep lists in check-issue:49, implement-issue:56 and plan-issue:51 say "text that runs literally" and rely on standing-design.md:11 to define it as including "a marker command code parses". They also leave out destructive effects and grants, which standing-design.md:11 lists. Design W6/W7 gave these exact lists.
- N6. lesson-rule.md:6 and learn-issues:22, :33 have no keep-list exclusion, so a lesson "a spend bound refused a needed run" would be seeded as a removal. It is only a seed, and charting's audit judges it. Design W8 wording.
- N7. check-issue:59 sends a missing reading to A, while check-issue:79's "A step the brief or design already requires but plan.md lacks is repaired by B" could let B record it.
- N8. plan-issue:51 and check-issue:59 say the reading is recorded "beside" the criterion, while implement-issue:52 puts A's reading under `## Implementation notes`. check-issue:59's no-reading branch tests "plan.md records", which covers both.
- N9. The named-source lists differ: shapes.md:386 has no provider limit or schema, and autopilot.md:9 names only operator words and outside standards. Both follow design W3/W4 verbatim.
- N10. implement-issue:52, "When planning is over, A records ... reading", has no "that plan.md lacks" condition and reads like a repeat of the planner's duty.
- N11. implement-issue:56 says "the reviewing seat judges each removal", but check-issue has no matching sentence. The report's removal list (design B12) and whole-diff review cover it.
- N12. autopilot.md:9, "takes the model-decides option and parks the chart for no number" (design W4 wording), can be misread as an order to park. "never parks the chart waiting for a number" is clearer.
- N13. docs/use/learn-from-work.md:5: the image alt text now lists "removal", but `docs/pictures/lessons-flow.svg` draws four outcomes. The report lists the SVG as a known limitation.
- N14. learn-issues Sort gives no precedence when Removal and Checkable both match a check that refused valid work.

## Verdict

fix (F1, F2).
