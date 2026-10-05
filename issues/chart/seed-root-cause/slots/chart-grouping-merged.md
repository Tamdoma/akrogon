# chart-grouping, merged round

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

This round settles what the chart door does with seeds that carry a Suspected cause, Related links and sometimes a root report. It is the last fork. Verification and operator confirmation are already locked by discovery-role; this round settles the mechanics. (A,B,C)

Existing machinery: imported text is copied verbatim, door findings go under Agent findings (`skills/chart-issues/SKILL.md:31`, `assets/shapes.md:58-59`). Every claim needs file:line evidence (`SKILL.md:47`). One completion owner can carry many identities and closes them all; a partial match stays open with its uncovered part; owned identities are conflicts, never reassigned (`shapes.md:244-246,62`). The split already follows independently checkable outcomes (`SKILL.md:41`). Missing: a rule for when to build cause groups and what one fix may close. (A,B,C)

Size: chart-issues has its own recorded cap, under 300 lines, 4k tokens, 20 substantive rules, judged semantically, no hiding duplicate workflow in references (`issues/closed/akrogon-loop/doors/chart-issues/plan.md:26`, brief.md:15). SKILL.md is 92 lines, 2,331 words, about 3.8k tokens by chars/4 (C's estimate). (cap A,B,C) Placement: C recommends `shapes.md` beside the ownership paragraph (`:244-246`), limited to one short paragraph per question written as outcomes per identity, no step list, since `plan.md:24` allows intake identity a short paragraph there and forbids moving workflow into references to evade the cap. (C) B places by responsibility: cause comparison in Open/Drain, coverage in the ownership rules, after a tokenizer recount. (B) shapes.md is 256 lines. (C) Cap source tags: plan.md:26 (A,B); C cited skill-rewrite.md:36. (per B, C rebuttals)

### 1 · How does the door group seeds that share a cause, and what may one fix close?

Walk-through, door opened on tamdoma-framework, seeds #124-#128 imported (C's illustration follows #128's own account; no slot read the framework source): (A,B,C)
1. Read links and suspected causes. Candidate group: #128 with #124-#127.
2. Open the destination source, not the `.claude/...` consumer copies. Write file:line under Agent findings.
3. Find, as #128 says, only #124 comes from the missing variant-choice state. #125 is a separate gate problem. #126 and #127 are their own rule conflicts; #127's abandoned-variant part may share #124's condition, its photo-serving part does not. (B,C)
4. Propose: one owner for the variant-choice state with #128 and #124 in `sources`; #125, #126, #127 as their own issues; #127 partial (its photo-serving part belongs to no variant fix). #128 is a full match because coverage is judged against its own Expected behavior and Reproduction, and the reports it links are context, not its scope. The operator's confirmation records that coverage judgment. (coverage test per C rebuttal, explicit record per B rebuttal; resolves the #128 contradiction both raised)
5. Operator confirms or changes. Only then write.

Research: operator · discovery-role Taken · verify against live code, group only after confirmation, reassess never copy. (B,C) practitioner · Google SRE Effective Troubleshooting and Postmortem Culture, read 2026-10-05 · correlated failures can have different causes; causes are plural · a reported root may split into several owners. (A,B,C) better-than-training · ITIL problem management (secondary) · a problem links many incidents; an incident closes on its own restoration · a symptom closes on its own check. (A,C)

- **1a (recommended, A,B,C)** Group as a proposal. Build candidate groups from links and suspected causes, verify each cause in destination source, show groups inside the existing split, operator confirms. A report joins an owner's `sources` only when that owner covers the report's own Expected behavior and Reproduction, shown by a done-criterion that replays it; linked reports are context, not scope; otherwise it stays a partial match. Wins because one fix can close a problem class and no report closes without its own symptom checked. Cost: more source reading per drain, and a done-criterion per grouped symptom. (replay criterion per C, whole-report coverage per B)
- **1b** One epic for the affected workflow with separate leaves per verified condition, confirmed to cover every sourced report. Gives broad reports one complete owner. Cost: completion waits for all included work, and the epic may be larger than the symptom needs. (B)
- **1c** Group by links alone without a source check, operator confirms. Cost: the operator confirms a guess written from installed copies, and a wrong shared cause closes unrelated reports. (A,C)
- **1d** No grouping rule. Cost: the door charts #124 as its own fix, which is #56 moved one step later. (A,C)

Pitfalls avoided: wrong cause becoming the plan is removed by the door's own file:line check before showing groups. (A,B,C) A root fix closing an unfixed symptom is removed by the replay criterion plus the existing partial-match rule. (B,C) Older seeds without a Suspected cause heading (all five real ones) are grouped by links, and causal claims embedded in their text (#124 checkManifestRule, #126 parser bug, #128 reporter statement) are extracted as unverified claims, source bytes unchanged. (C; extraction per B rebuttal) Done-criteria: #124-#128 replay shows the split and closes nothing uncovered; nothing grouped before confirmation; ownership conflicts stay visible. (A,B,C)

### 2 · When the door opens with a note about one symptom, do linked seeds come in?

Today seeds are imported only with no note or when the note asks (`SKILL.md:31`). "Fix #124" imports #124 only, and the door never sees #128. `:69` already compares destination seeds against scope at destination selection and acts only on confirmation. (A,B,C)

Walk-through, note "fix #124" (C): import #124; scan local seed files for links to #124 and #124's links out (file reads, no network); find #125, #127, #128 (not #126, which links only #125); show them with title and suspected cause; import only what the operator picks.

Research: operator · related-search Taken · links are `owner/repo#n` and survive into `issues/seeds/` · the door finds them by reading local files. (B,C) better-than-training · #124-#128 bodies · the first report links nothing and later ones link back · the scan must go both directions. (C) better-than-training · `SKILL.md:27,69`, `shapes.md:62,246` · show-then-confirm, failed refresh never authorizes stale mirrors. (A,B,C)

- **2a (recommended; C blind, B after review adding incoming links to its outgoing-links round, A moved from the :69-only option)** At open, one hop in both directions: seeds that link to the named seed or are linked from it. Read them as context, show candidates, import only what the operator confirms, no recursion. A bare `#n` is read against the seed's own `Source:` repo. A linked closed report is evidence to read, not a seed to import. Wins because a note about a symptom surfaces its direct neighbors, including a root report that links it, and confirmation filters out unrelated neighbors. Cost: one extra confirm step when links exist, and a root two hops away is not found. If the named seed has no links in either direction, the existing `:69` comparison still applies. (qualified per B rebuttal)
- **2b** Reuse only the `:69` destination check, counting Related links as candidate matches. Cost: linked seeds appear at destination selection, after the forks may already be shaped around the symptom. (A, blind round)
- **2c** Follow links all the way and import everything reached. Cost: from #124 it reaches #126, unrelated to variant choice. (B,C)
- **2d** No change. Cost: the door fixes the one symptom even when the root report sits in the same folder. (A,B,C)

Pitfalls avoided: unrelated neighbors are filtered by relevance evidence and confirmation; one hop bounds the walk. (A,B,C) Missing the root because the first report has no links is removed by the both-directions scan, with a done-criterion that a note naming #124 lists #128. (C) Done-criteria also cover an unrelated linked seed, a closed precedent, an ownership conflict and a failed refresh. (B)

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
- When the door's check disagrees with a seed's cause, the GitHub body keeps the wrong hypothesis and pull re-copies it. The door writes to GitHub only to close (`SKILL.md:33`). Correcting it is off route, a candidate separate intake. (C)
- 1a's replay criterion makes each grouped symptom cost real work. Closing symptoms on the root fix alone is faster but is the false-merge risk. (C)
- Size counts are rough; the leaf recounts both skills with a tokenizer, per the closed plan's V5. (B,C)
- All of this helps only repos that chart. Non-charting consumers rely on the printed root line. (C)
