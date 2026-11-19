# Opening map, slot B, operator-decisions, 2026-11-18

Read: INTAKE.md, forks/signposts.md, #714 (earlier this session), seed-issue `## Report`, `## Lifecycle filing`, `## Submit and finish`, chart-issues `## Open` to `## Handover`, questions.md (round rules, `## Research`), shapes.md (`## Chart records`, signposts, intake, fork, `## Leaf files`, `## Preflight and validation`), autopilot.md, standing-design.md, handover.md, direct-route.md. A Haiku sweep covered tests/, docs/, src/ parsers, plan-issue and check-issue. I spot-checked the lines I rely on. Nothing written outside this file.

## 1. Forks

F1. Where does the section live and what marks it?
- F1a (pick) A fixed heading start, `## Operator decision (<name>, <date>)`, placed after `Unverified intake.` and before `## Observation`, as #714 has it. The lock is the text under that heading up to the next `## ` heading. Inside, prose is free and `Not in scope:` and `Done when:` are optional.
- F1b Any text saying the operator decided, judged by the door. Invites #714's `## Proposed solution (operator-requested…)` being read as a decision.
- F1a cost: a decision under another heading is not taken and is asked in a round as today. That failure is safe. #714's "Details and evidence are in Proposed solution below" locks nothing outside the section.

F2. How does seed-issue sanction it and who may write it?
- F2a (pick) One exception sentence beside "adding no recommended fixes or planning metadata" (seed-issue `## Report`) and one optional block in the body template. The section is written only when the operator states the decision in that session and orders it recorded. It holds the operator's decided points and nothing the agent adds. `## Lifecycle filing` and lesson-triggered reports never carry it.
- F2b Leave seed-issue alone. Keeps the contradiction #144 reports.

F3. How does a decision reach a report that already exists? This is #714's real path.
- Today seed-issue creates one report, posts nothing when a covering report is found, and never changes a linked issue (seed-issue `## Report` lookups paragraph, `## Submit and finish`). The edit that added #714's section has no sanctioned route.
- F3a (pick) seed-issue may add the section to the filing account's own open covering report with one body edit that changes nothing else, and prints that URL.
- F3b Decision at filing only. A later decision needs a second seed and an exception to the covering rule.
- F3c Edits stay outside the skill.
- F3a invites a body edit that clobbers text. The rule must say read the body, insert the section, write it back.

F4. Is the evidence behind the decision sanctioned too? #714 holds `## Proposed solution` and `## Second review`, agent-written, with rejected options and risks.
- F4a (pick) Allowed as a separate attributed section that locks nothing. The door reads it as tier 1 research, "named in the intake" (questions.md `## Research`). This is what saves re-research around the decision.
- F4b Decision section only. The evidence is lost or leaks into the locked text.

F5. How does the door record it as taken?
- F5a (pick) At import, one fork file per marked section. `## Taken` holds the section verbatim with the source identity, heading and pull date, labelled as the operator's seed decision, not asked. It is listed under CHART.md `Forks taken` and shown in the opening map. A missing reason or alternative is written "not stated", never invented.
- F5b One fork per design point (five for #714). The door must cut the text, which invites paraphrase.
- F5c INTAKE only, no fork. Breaks signpost 3a.
- Wording: define "operator answer" once in questions.md (the paragraph holding "Recommendations and silence cannot supply an operator answer") as a round reply or a marked seed decision. Then shapes.md's fork paragraph and `## Preflight and validation` ("lacks an operator answer") need no change. Adding a second exception instead makes "The one exception" in questions.md and "this is the one exception" in autopilot.md false.

F6. Does an outsider's marker bind? Tamdoma/akrogon is PUBLIC (`gh repo view`, 2026-11-18). Anyone can file an issue with the heading, and under 1a it binds unattended.
- F6a (pick) The door takes the marker only when the issue's author is the door's own gh account. One read at import: `gh issue view <n> -R <repo> --json author` against `gh api user`. Both returned `ivanjuras` for #144 today. Otherwise the section is plain intake, shown as not taken with the reason.
- F6b Marker alone. Leaves an injection route into every public issues repo.
- F6a proves "not an outsider", not "the operator". It misses edits by other collaborators. The mirror holds no author (`pullRepo` in src/pull.ts writes title, Source, URL and body).

F7. How is a finding against the decision raised?
- F7a (pick) A finding is a fact with evidence that the decision cannot work as written: a cited surface is gone, the done-test cannot pass, it clashes with a locked decision. It goes under the decision fork's `## Findings`. In manual mode the next round shows it as one keep-or-change question the operator answers, and a change is a dated correction (shapes.md fork paragraph). Charting keeps going around the decision as recorded.
- F7b An ordinary fork with a door recommendation, answered per mode. Breaks 2a under autopilot.
- F7c Recorded only, shown at the handoff review.
- F7a without a bar becomes re-asking by finding. Use check-issue's Fix bar, a concrete consequence and never a preference (check-issue `## check.review`). The door researches no alternative to the decision.

F8. What does autopilot do?
- F8a (pick) A never picks on a recorded decision. A finding against it is recorded, carried into each affected design as a held disagreement, and named in the pass-end line with each seed decision taken. No new wait. Existing waits still apply: a failed proof cuts the contract, and a cut that removes the outcome parks the chart (chart-issues `## Take`).
- F8b Any finding parks the chart. Recreates the stall.
- Text: extend autopilot.md's "answers the operator gave before a mid-chart switch-on stay the operator's" to seed decisions.
- Related: questions.md says an unresolved conflict about a fork "becomes a fork answered per mode". Two operator decisions that conflict (two seeds, or a seed against an earlier fork) would then be A's pick. Pick: operator-only, the chart waits.

F9. How do `Done when:` and `Not in scope:` reach leaves?
- F9a (pick) `Done when:` is copied verbatim under `## Binding decisions, verbatim`. The brief's Done-criteria are the door's, each traceable to it, and pass the shapes audit. A done-test the audit refuses is an F7 finding, never a silent rewrite. `Not in scope:` items go to Off route with the decision as the reason and into each design as exclusions.
- F9b `Done when:` becomes the Done-criteria as written. Breaks when it names something `## Preflight and validation` refuses.

F10. Do docs change? docs/use/report-an-observation.md says "It never proposes a fix" and lists six sections. docs/use/plan-work.md and docs/use/autopilot.md say "you answer the signposts and every fork". The signposts limit says "rule text in existing skill files only". learnings/LESSONS.md (2026-09-11 line) says grep docs for a changed rule and own or report the hit.
- F10a (pick) Read the limit as no code and no new files. The leaf owns those docs lines. This needs the operator's yes as a signposts correction.
- F10b Skills only. Docs go stale and the hit is reported as a seed.

## 2. Pitfalls

- P1. Marker inflation: agents learn the heading binds and put their own advice under it. Removed by F2a's writer rule, F6a, and the opening map showing every taken decision.
- P2. Stale decision: #714 cites line numbers. Take's key-part rule already forces one real observation of each part that exists before the leaf builds (chart-issues `## Take`). A miss becomes an F7 finding.
- P3. Paraphrase drift. Removed by verbatim `## Taken` and the verbatim design copy (shapes.md `## Leaf files`). The CHART.md line points to the fork and restates nothing.
- P4. A marker added after a chart imported the seed is never read. Open skips identities already in a chart intake and intake bytes are preserved (chart-issues `## Open`, shapes.md intake paragraph). Removed by one clause: at door open, name each intake source whose mirror now holds a marked section the copy lacks. The operator then answers in the door. This stays inside signpost 4a, since it is the section as pulled at door open.
- P5. Two copies of the marker. seed-issue is standalone, and tests/docs-links.test.ts fails a link leaving its skill folder, so the heading form sits in seed-issue and in chart-issues. Removed by one binding decision holding the literal. An agreement test on that one literal fits standing-design's writer and checker line. It is the only script-checkable part.
- P6. Mixed releases. New seed-issue with an old door asks again, which is safe. The change reaches doors at the next release link (chart-issues `## Handoff`), so #714 waits for it (signpost 6a).
- P7. Rule spread over five files drifts. Removed by F5's single definition.

## 3. Split

One leaf. One outcome, about ten sentences across seed-issue, chart-issues SKILL.md, questions.md, shapes.md and autopilot.md, plus docs if F10a. No prerequisite. If A wants two, they are writer (seed-issue) and reader (chart-issues), parallel with no order, sharing the F1 literal as a binding decision. On my reading of chart-issues `## Direct route` the chart is eligible: no inputs or grants, no live run, one outcome, B named. That is the door's and the operator's call.

## 4. Proofs

Free proofs can show the text and its fit to #714. They cannot show a door stops asking (signpost 5a).
- Seed side: the reviewing seat reads the changed `## Report` against #714's body and finds the place, the writer rule and the ban on agent advice still standing.
- Door side: a read-through with #714's body as the case gives one fork with the section verbatim, no fork on design points 1 to 5, four Off route items, and the done-test under binding decisions. `bun test` stays green (tests/docs-links.test.ts checks links and anchors). No test asserts the changed sentences today.
- Parts resting on what exists:
  - K1. The mirror keeps extra headings. `pullRepo` writes the body unparsed. Observed: issues/seeds/144-…md holds the body's six `## ` headings. The sweep cited tests/pull.test.ts for this and my grep did not confirm it.
  - K2. A filled `## Taken` counts as taken. `chartRow` in src/status.ts tests for non-blank text after the heading. Free observation: `akrogon status --charts` on this chart.
  - K3. Designs carry binding decisions verbatim (shapes.md `## Leaf files`).
  - K4. Later seats do not reopen them: plan-issue `## Shared context` ("the design wins"), `## plan.synthesis` ("without reopening locked scope"), check-issue `## check.repair` (no repair changes a locked decision). check.review can still raise a Fix against the decided design. That fits the operator's 2a correction.
  - K5. A chart with no open fork goes straight to the handoff review (chart-issues `## Drain`).

## 5. Questions the list misses

- Q1. Who unlocks a decision? Pick: only the operator's words in the door, as a dated correction. The door never edits the seed.
- Q2. Two marked sections in one seed, or one seed charted into two destinations: one fork each, copied to every affected leaf with exclusions (shapes.md `## Leaf files`).
- Q3. Legacy `issues/open/<slug>.md` reports and operator notes: the marker does not count there under 4a. Say so, or doors will guess.
- Q4. Sweep surprise, outside this chart: `chartRow` counts an empty `## Taken` as taken when another section follows, which is the signposts shape with `## Needs`. Seed candidate.
