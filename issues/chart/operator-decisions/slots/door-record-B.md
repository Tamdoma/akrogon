# Fork notes: door-record, slot B, 2026-11-19

Read: forks/door-record.md `## Question` and `### Carries`, forks/marker.md and forks/seed-writer.md `## Taken`. Live surfaces held from the map exchange: chart-issues `## Open`, `## Take`, questions.md round paragraphs, shapes.md fork shape and `## Preflight and validation`, autopilot.md.

## Q1. How is a counting section recorded as taken, and where is it shown?
Pick: at import, right after the account check, the door writes one fork file per counting section in the normal fork shape.
- `## Taken` holds the section verbatim, heading line included, and one label line: seed decision from `owner/repo#n`, taken at import on the date, not asked, decided by the login. A reason or alternative the section does not state is written "not stated".
- `## Findings` holds the check record: the logins and their `permission`, `lastEditedAt`, the pull time and the commands.
- Shown in: CHART.md `Forks taken` as a pointer to the fork with no restated answer, the opening map (signpost 1a), the carries of every consultant brief as a lock, the handoff review, and under autopilot the pass-end line.
- The operator's objection at the map is a dated correction under `## Taken` (shapes.md fork paragraph).
- Reason: verbatim text needs no door reading, and the existing leaf copy rule then carries it (shapes.md `## Leaf files`). Cost: the section sits twice, in INTAKE.md as source bytes and in the fork as the binding record.
Rejected:
- One fork per decided point. The door must cut the text, which invites paraphrase.
- INTAKE.md only. Breaks signpost 3a, and `akrogon status --charts` counts fork files.
- Inside forks/signposts.md. That file is session-wide and copied to every chart. A decision belongs to one chart.
Evidence:
- better-than-training · `chartRow` in src/status.ts, read 2026-11-18 · a fork counts as taken when non-blank text follows `## Taken` · no code change is needed. Free proof: `akrogon status --charts` on a chart holding such a fork.
Pitfalls:
- The signposts round asks about something a decision settled. Removed by listing the taken seed decisions in that round's opening paragraph, since import runs before it (chart-issues `## Open`).
Questions the fork does not ask:
- Is the account check run again at a later door open for a decision already taken, such as after a colleague lost access? My pick: no. Taken stays taken.

## Q2. Where does the rule live so the "only a round reply answers" lines stay true?
Pick: one definition sentence in questions.md, in the paragraph holding "Recommendations and silence cannot supply an operator answer". It says an operator answer is a reply in a round or a counting decision section in an imported seed, and points to `## Open`. The test and the record step live in chart-issues `## Open`, import paragraph, because import is where they run and SKILL.md is always loaded.
- Every existing line then stays true as written. A counting section is neither a recommendation nor silence. "The one exception is an autopilot session" (questions.md) and "this is the one exception" (autopilot.md) still name the only case where a non-operator answer counts. shapes.md's "no operator answer … is open" and `## Preflight and validation`'s "lacks an operator answer" need no edit.
- Cost: "operator answer" now covers a write-level colleague's section. Marker decision 2 already decided that.
Rejected:
- A second exception beside the autopilot one. It makes "The one exception" false in two files and needs four edits.
- The rule in shapes.md. shapes is read "before creating a chart or handing off" (chart-issues `## Shared context`), so a door could import before reading it.
Evidence:
- better-than-training · questions.md round paragraph, autopilot.md second paragraph, shapes.md fork paragraph and `## Preflight and validation`, read 2026-11-18 · four lines lean on the words "operator answer" · defining the words once reaches all four.
- better-than-training · docs/use/plan-work.md and docs/use/autopilot.md (sweep, spot-checked 2026-11-18) · "you answer the signposts and every fork" · these lines turn false. learnings/LESSONS.md's 2026-09-11 line says own or report the hit. Whether docs fall inside signpost 5a's "skill files only" has not been asked.
Pitfalls:
- A's autopilot pick lands on a decision fork. Not possible once the fork is taken, since A answers only open forks. autopilot.md needs no line for the record itself.

## Q3. What happens when a counting section appears after a chart imported the seed?
Pick: it is read at the next door open, never mid-chart, and what follows depends on the chart.
- Chart still open: the door takes it. It appends a dated `## Source` block holding the section to INTAKE.md, leaves the first copy untouched, and writes the fork as in Q1. An open fork the decision settles becomes taken with a pointer to it. A fork already taken that it contradicts goes to finding-against.
- Chart handed off or closed, or the identity is in a leaf's `sources`: the door names it and does nothing else. The designs are locked and dispatch is not the door's (chart-issues `## Handoff`). Under autopilot it goes in the pass-end line.
- A section that differs from the one the fork recorded, which seed-writer decision 2 allows by replace: appended as a dated correction when it counts.
- Reason: signpost 1a binds in every mode. A name-only rule would leave the decision unread under autopilot, which is the defect #144 reports. This stays inside signpost 4a, since it is the section as pulled at a door open.
- Cost: one more compare at open. The set is small. The mirror holds only open issues (`pullRepo` in src/pull.ts), and Open already walks "each skipped GitHub identity that is still open on GitHub".
Rejected:
- First import only. #714 was filed at 21:53 and decided at 22:32. A door opened in between loses the decision in silence.
- Name it and wait for the operator's yes. I leaned this way in my map. The account check now does the vouching, so the yes adds nothing in manual mode and blocks autopilot.
- Re-read during a chart. Signpost 4a gave that up.
Evidence:
- better-than-training · chart-issues `## Open`, import and close-offer paragraphs · identities already in a chart intake are skipped, and still-open skipped identities are named · the compare attaches to a step that exists.
- practitioner · Michael Nygard, 2011-11-15, read 2026-11-19 · a reversed decision is kept and marked superseded · a replaced section is appended, never overwritten.
Pitfalls:
- A leaf is already building a different design. Not removed here. The door names it and the operator decides whether to stop the leaf.

## Q4. What does the door do with a section that is "marked, not taken"?
Pick: it is plain intake in every mode. Its claim to be decided counts for nothing, and its content is weighed like any reporter claim.
- Both modes: the reason goes in INTAKE.md `## Agent findings` and in the opening map. No fork file is written for it.
- Manual: the operator may take it in words in the door (marker decision 2). Then the fork is written as in Q1 with those words and the date. Silence leaves it not taken.
- Autopilot and full autopilot: its questions are ordinary forks A answers by evidence and signposts. The reason goes in CHART.md `## Autopilot` and the pass-end line. No wait.
- "Edited after the pull" and a failed permission read get one retry at that same door open: pull or read once more and re-check. A second miss is not taken.
- Cost: under autopilot a real decision that fails the check is charted as if absent. The operator sees why at pass end.
Rejected:
- The chart waits for the operator. Any GitHub account could park a chart on public akrogon by filing a marked issue.
- A treats the section as its default pick. That hands the text the weight the account check just refused.
Evidence:
- practitioner · Simon Willison, "The lethal trifecta", 2025-06-16, read 2026-11-19 · models "will happily follow any instructions that make it to the model" · a refused section must lose its authority claim, not only its lock.
- better-than-training · autopilot.md third paragraph · the list of what makes a chart wait holds no "unverified intake" entry · no new wait keeps that list unchanged.
Pitfalls:
- The door reads a near miss as taken because it looks decided. Removed by marker decision 1: only the literal counts.
