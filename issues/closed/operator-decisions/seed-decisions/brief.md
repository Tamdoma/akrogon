# Brief: seed-decisions

## What

Rule text in existing skill, docs and test files (A,B), so that a decision a person with write access records in a seed under the heading `## Operator decision (<name>, <date>)` counts as already taken:
- seed-issue writes that section from the person's own words when asked to seed or to add it to an open report, and may write requested background sections that lock nothing;
- the chart door, at import, checks the author and every body editor have write or admin on the issue's repo, records each counting section as one verbatim taken fork shown first, picks up a section added later at the next door open, and treats a section that does not count as plain intake;
- a finding against the decision is raised only as evidenced breakage, conflicts between operator answers always go to the operator, autopilot never answers on a seed decision, and leaf designs carry the decision verbatim with an optional `## Held disagreements` heading;
- the docs sentences these rules make false are fixed.

## Why

Tamdoma/akrogon#144: seed-issue forbids fixes and the door re-asks every fork, so a decision the operator settled with consultants in a consumer repo (Tamdoma/tamdoma-framework#714) has no standing and is charted again. The operator: "the initial idea has to be the one that we are charting around".

## Done-criteria

1. (A,B) The heading start `## Operator decision (` is the same in skills/seed-issue/SKILL.md and skills/chart-issues/SKILL.md, and a change to one copy alone fails the destination's `test` check (deliberate break shown once).
2. skills/seed-issue/SKILL.md states seed-writer decisions 1 to 4 (design, Binding decisions): read by the reviewing seat against three made-up cases written into the plan: (a) a request "seed this; record the fix we agreed as my decision" after a settled design in the session gives a body with the section after `Unverified intake.`, the person's git `user.name` and date in the heading, and a final line naming that a section was written without its text; (b) "I think we should do X" gives no section; (c) adding a decision to a made-up open filed report reads the body, inserts after `Unverified intake.`, writes with `gh issue edit <n> -R <repo> --body-file -`, and reads back comparing outside text unchanged and the section equal, ignoring trailing whitespace. The ban on recommended fixes still holds for every other report.
3. (A,B) The chart-issues skill files (SKILL.md, questions.md, autopilot.md, shapes.md) state marker decisions 1 and 2, door-record decisions 1 to 4, finding-against decisions 1 to 4 and leaf-carry decision 1 (design, Binding decisions): read by the reviewing seat against two cases: a made-up seed body in the marker shape, written in the plan and not committed as a fixture, authored and edited only by a write-level login, gives one fork with the section verbatim, the label line and the check record, listed first; #144's own body, read from issues/chart/operator-decisions/INTAKE.md `## Source: Tamdoma/akrogon#144` (the heading named inside a sentence), gives no taken fork. The "one exception" lines in questions.md and autopilot.md and shapes.md's "operator answer" lines still read true.
4. (A,B) No docs/ line states a changed rule in its old form, read by the reviewing seat; the strings "never proposes a fix", "answer the signposts and every fork" and the six-section-only seed shape are where the reading starts, and a true sentence that keeps one of them with its new qualifier passes; no new docs page exists.
5. (A,B) Every link in a changed file resolves (proof: the destination's `test` check).
