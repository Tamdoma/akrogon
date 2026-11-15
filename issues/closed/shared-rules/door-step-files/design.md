# Design: door-step-files

## Binding decisions, verbatim

Chart `issues/chart/shared-rules`, fork `forks/shape.md`, Taken. Operator, door t126, 2026-11-11, verbatim: to question 1 "1b, then. Continue."; to questions 2 and 3 "2a | 3a |".

- Question 2: 2a. "Only the chart door is split: the details of Direct route, Autopilot and Handover move into files beside the door skill, read when that step arrives. The mode definitions, the direct-route refusal list and the handover continuation check stay where a door reads them before it needs the detail (Findings, cross-phase imports). The four lifecycle skills stay one file each." Foreclosed: 2b (splitting implement-issue and check-issue by phase), 2c (no split).
- Question 3: 3a. "The implementation report carries a table, old place to new place for every rule; the reviewing seat follows it along each phase's reading path; a check shows every link opens from an installed copy. No paid run." Foreclosed: 3b.
- Question 1, the part that touches the door: "the door's fourth copy of the red-check rule in chart-issues Direct route stays as it is." It moves with the direct route's detail and keeps its meaning and its command form.
- Signposts (forks/signposts.md, Taken, operator 2026-11-10 "1a | 2c | 3a | 4a | 5b | 6a | 7a |"): 2c "No win may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record or any current chart-door step" (blind consultant notes, rebuttals, final-shape checks); 6a "Changes land in akrogon only"; 7a "Earlier decisions stay binding and reopen only when the operator names one".
- Earlier decisions in reach, binding under 7a: token-spend forks/levers.md, Taken, amendment of 2026-10-17: "the post-compaction partial re-read leaves the leaf and goes off route". The door's opening rule ("Re-read this file and its references only after compaction…") keeps its meaning; this leaf adds only when a step file is first read. door-cost CHART.md: prose caps "declined by the operator 2026-10-26", and every blind step stays. No word cap is added and no step is shortened.
- A leaf branch carries code and skill text only: no path under `issues/`.

Excluded here, with owners: the link check and the door's lesson-rule link file (`skill-links-in-folder`, which this leaf is blocked by); the shared lifecycle rules file (`lifecycle-rules-source`); any change to what a door step does; `assets/questions.md`, `assets/shapes.md` and `assets/standing-design.md` beyond a citation that must follow a moved rule; question rounds (the next chart, `round-rewrites`); the door's scripts.

Standing design, installed path `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf:

- A test exists only as the proof of a done-criterion: criterion 5 is proven by the repo's existing command-literal tests and the link check reading the files that now carry the text. Criteria 1 to 4 and 7 are judged by the reviewing seat from the table and the diff. No wording snapshot of skill text is added.
- Cheapest sufficient proof for moved text is the clause table read by a thinking reviewer along the named reading paths.
- A test never keeps a hand-copied list of another file's entries: the command-literal tests name commands a door runs as written.
- No machinery, no auth, no secret, no outside call, no live run. Agent-owned, no human-only prerequisite.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md`; new files `skills/chart-issues/assets/direct-route.md`, `skills/chart-issues/assets/autopilot.md`, `skills/chart-issues/assets/handover.md`; the tests "chart-issues direct landing names the known-red command" and "chart-issues skill names akrogon pack at every end-marker site" in `tests/docs-links.test.ts`; `skills/AREA.md`; pages under `docs/` that name a moved door rule's place.

Literal interfaces: the three file names above; the headings `## Direct route`, `## Autopilot` and `## Handover` in `SKILL.md`; the commands `verify --holder <chart>/direct --known-red` and `akrogon pack <chart>`; the handover start prompt, which names `<absolute skill folder>/SKILL.md` and stays as it is. A link from a step file back to `SKILL.md` stays inside the skill folder.

What must stay readable in `SKILL.md` before a step file is opened, with the reader that needs it:

- Handoff shows the route question or the one-line refusal, so the direct-route refusal list and the route question rule stay; the Handoff paragraph on the direct route's end markers stays.
- Every section carries "under autopilot" clauses that point at `## Autopilot`, and a door must be able to tell which of the three modes is on: the three-mode definition, the rule that only the operator's words start autopilot, and the rule that the door reads the latest mode-record entry before continuing stay. The rest is read once the mode is autopilot or full autopilot.
- A fresh A starts from the handover start prompt, which names `SKILL.md`: the paragraph beginning "Any session that receives a start prompt" stays, with the trigger that tells old A when a handover happens. Old A reads the handover file at the switch. `## Autopilot`'s own handover paragraphs (the autopilot entry form, deferring `seats.yaml` to fresh A) travel with the handover or autopilot detail; Open for the plan: which file holds them so that both an attended and an autopilot switch find them on their path.

Consumers of what changes:

- `assets/questions.md` cites "`SKILL.md` `## Autopilot`" twice and links `../SKILL.md#open`; `assets/shapes.md` cites "`SKILL.md` `## Handover`", "`## Autopilot`" and "`## Direct route`" and relies on SKILL.md's Drain. Decision: the headings stay, and a citation of a rule that moved names the step file.
- The test "chart-issues direct landing names the known-red command" reads `SKILL.md` for `verify --holder <chart>/direct --known-red`. Decision: it follows the text to the direct-route file.
- The test "chart-issues skill names akrogon pack at every end-marker site" requires the three end-marker words and at least three `akrogon pack <chart>` literals in `SKILL.md`; today one stands in Handoff and two in Direct route. Decision: it reads the files that now carry the three sites.
- The test "lesson write sites link the shared lesson rule" requires `lesson-rule.md` in `SKILL.md`; the Open section keeps that link.
- `skills/chart-issues/scripts/door-reset.ts` names "chart-issues SKILL.md, Handover" in a comment and sends the start prompt naming `SKILL.md`; no script reads the skill's text. Not changed.
- `docs/use/quick-fix.md` and `docs/use/autopilot.md` describe the direct route and autopilot for the operator and link the skill; Open for the plan: whether any page states a place that moves.
- The installed door: this change reaches a door only when the next release is linked; a running door keeps the text it loaded.

The substance of every rule is fixed; the wording and the cut between `SKILL.md` and each step file are the leaf's, inside the bounds above.
