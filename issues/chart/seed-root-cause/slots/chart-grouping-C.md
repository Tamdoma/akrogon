# Chart grouping: slot C round (blind)

This round settles what the chart door does with the new cause sections and related links once reports reach it. It is the last fork. The four earlier locks make filing write a suspected cause and links. Nothing yet tells the door to use them. Paths are relative to `/home/ivan/Work/infra/akrogon`.

Size check for chart-issues. The recorded cap is the family rule "under 300 lines, under 4k tokens, under 20 rule sentences" (`issues/closed/akrogon-loop/chart/forks/skill-rewrite.md:36`). `skills/chart-issues/SKILL.md` is 92 lines, 2,331 words and 15,363 characters today. That is roughly 3.8k tokens by a characters-divided-by-four estimate, and far more than 20 sentences. So the entry file has almost no room. Its reference `assets/shapes.md` (256 lines) already holds the import rules, and the skill reads it at import ("using the provenance in shapes", `skills/chart-issues/SKILL.md:31`). Both recommendations below put their text in `shapes.md`, next to the paragraph at `:246`, and add no sentence to `SKILL.md`.

Walk-through used in both questions. The door opens in tamdoma-framework. `akrogon pull` has mirrored five open reports into `issues/seeds/`: #124 (dropped variants block the close), #125 (phases close on run history), #126 (motion CLI false failures), #127 (photo paths), #128 (the root-cause report). #125 links #124. #126 links #125. #127 links #124 and #125. #128 links all four. I did not read tamdoma-framework's source, so the door's verification result below follows #128's own account and is an illustration.

### 1 · Does the door group seeds by suspected cause, and how does it decide what one fix may close?

Today the door only matches exact identities (`skills/chart-issues/assets/shapes.md:62`). It copies each report verbatim and keeps its own findings apart (`skills/chart-issues/SKILL.md:31`, `shapes.md:58-59`). One completion owner can carry many identities, and finishing it closes all of them (`shapes.md:244,246`). So the grouping machine exists. What is missing is a rule for when to use it.

What the door would do with the five seeds under the recommended option:

1. Read the links and suspected causes. Candidate group: #128 with #124, #125, #126, #127.
2. Open the real source files, not the `.claude/...` copies the reports cite. Write its own file:line evidence under Agent findings.
3. Find, as #128 itself says, that only #124 comes from the missing "variant chosen" state. #125 is a separate gate design problem. #126 and #127 are their own rule conflicts.
4. Show the operator a proposed split. One owner for the variant-choice state, with #128 and #124 in its `sources`. #125, #126 and #127 as their own issues, side by side.
5. Wait for the operator to confirm or change it. Only then write anything.
6. Put #124 into the root owner's `sources` only because that owner has a done-criterion replaying #124's steps. Without that criterion, #124 stays open.

Research: operator · `forks/discovery-role.md` Taken, read 2026-10-05 · the door "verifies the cause against live code with its own file:line evidence and groups seeds under one completion owner only after operator confirmation", and for symptoms without one shared cause it "reassesses, never copies" · grouping, verifying and asking are already decided, so this question settles the mechanics. practitioner · Google SRE book, "Postmortem Culture", https://sre.google/sre-book/postmortem-culture/, read 2026-10-05 · causes are plural and written by a later, grounded pass · the door may split one reported root into several owners. better-than-training · ITIL problem management, secondary summaries, searched 2026-10-05 · one problem record links many incidents, and an incident closes when its own service is restored · a symptom report closes on its own check, not just because the root was fixed. better-than-training · `shapes.md:246`, read 2026-10-05 · "A partial match stays open and is shown with its uncovered part" · the rule for a symptom the root fix does not cover already exists.

- **1a (recommended)** Group as a proposal. The door builds candidate groups from links and suspected causes, checks each cause in the real source, and shows the grouping inside the split it already proposes (`skills/chart-issues/SKILL.md:41`). The operator confirms. A symptom report joins a root owner's `sources` only when that owner has a done-criterion that replays the symptom. It wins because one fix can close a whole problem class, and no report closes without its own symptom being checked. Cost: the door reads more source per seed drain, and each grouped symptom adds a done-criterion.
- **1b** Group by links alone, with no source check, and ask the operator. Faster. Cost: the operator is asked to confirm a guess written in a consumer repo from installed copies, and a wrong shared cause closes unrelated reports together.
- **1c** No grouping rule. The door works as today, and cause sections are just text it copies. Cost: the door charts #124 as its own fix, and the backlog keeps collecting symptom fixes, which is the #56 failure moved one step later.

Pitfalls avoided: A wrong cause becoming the plan is removed by the door's own file:line check before any grouping is shown. A root fix closing a symptom it did not fix is removed by the done-criterion rule in 1a, backed by the existing partial-match rule. The door's finding overwriting the reporter's words is removed by the existing split: source text stays verbatim, the door's view goes under Agent findings (`shapes.md:58-59`). An older seed with no Suspected cause section (all five real ones, and #56) is treated as "no hypothesis" and still grouped by its links, with a done-criterion for that case.

### 2 · If the door opens with a note about one symptom, do the linked seeds come in too?

Today mirrored seeds are imported "only when the door opens without an operator note or the note asks for them" (`skills/chart-issues/SKILL.md:31`). Example: the operator opens the door with "fix #124". The door imports #124 only. It never sees #128, so it charts a fix for the symptom.

What the door would do under the recommended option:

1. Import #124, as the note asks.
2. Scan the other local seed files for links to #124, and #124 for links out. This is a file read, not a network call. It finds #125, #127 and #128. It does not find #126, which links only #125.
3. Show those three as candidates, each with its title and suspected cause.
4. Import only the ones the operator picks. The rest stay untouched in `issues/seeds/`.

Research: operator · `forks/related-search.md` Taken, read 2026-10-05 · links are written as `owner/repo#n` in the body and must "survive unchanged into issues/seeds/" · the door can find them by reading local files. better-than-training · #124 to #128 bodies, read 2026-10-05 · the first report links nothing, and every later one links back · the scan must look in both directions, or a note about #124 finds nothing. better-than-training · `skills/chart-issues/SKILL.md:69` and `shapes.md:246`, read 2026-10-05 · candidate matches are shown and acted on "only on operator confirmation", and "checking never imports unrelated seeds" · the same show-then-confirm habit is reused. No practitioner source was searched for on this question.

- **2a (recommended)** One hop, both directions, shown as candidates. The door lists seeds that link to the named seed or are linked from it, and imports only what the operator confirms. Links are read in the full `owner/repo#n` form, and a bare `#n` is read against the seed's own `Source:` repo (`shapes.md:62`). It wins because a note about any one symptom now surfaces the root report, and nothing unrelated is pulled in. Cost: one extra confirm step when links exist.
- **2b** Follow links all the way and import everything reached. No extra step. Cost: from #124 it reaches #125 and then #126, which has nothing to do with the variant choice, so unrelated work lands in the chart.
- **2c** No pull. The note decides, as today. Cost: the door fixes the one symptom it was told about, even when the root report sits in the same folder.

Pitfalls avoided: Unrelated seeds entering the chart are removed by the one-hop limit and the confirm step. Missing the root because the first report has no links is removed by the both-directions scan, with a done-criterion that a note naming #124 lists #128 as a candidate. A link to a closed report, which is not in the mirror (`src/pull.ts:57`), is removed by showing it as evidence to read and never as a seed to import, matching the related-search lock. A link into another repo is left to the destination check the door already runs (`skills/chart-issues/SKILL.md:69`).

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
- The size figures are my rough counts. The closed fork gives the cap but not the counting method. If the door counts differently, the conclusion still holds: put the new text in `shapes.md`, not `SKILL.md`. A practitioner could reply that `shapes.md` at 256 lines is itself near the 300-line rule.
- Under 1a the door's check can disagree with the report's cause. The report body on GitHub then keeps the wrong hypothesis, and the mirror re-copies it on each pull. The door could correct it with a comment or an edit. I left that out, because the door writes to GitHub today only to close (`skills/chart-issues/SKILL.md:33`). It may deserve its own intake.
- The done-criterion rule in 1a makes grouping cost real work per symptom. An operator could prefer to close symptoms on the root fix alone and reopen if they recur. That is faster, and it is the false-merge risk the map named.
- 2a reads a bare `#n` against the seed's own repo. That is needed for the five real seeds, which use bare numbers. New reports will use the full form, so this part matters less over time.
- The walk-through's verification outcome is taken from #128's text. I did not open tamdoma-framework's source, so it shows the steps, not a verified result.
- All of this helps only repos that chart. A consumer that files but never charts relies on the printed root line from the root-report lock.
