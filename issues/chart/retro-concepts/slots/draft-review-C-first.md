# Draft review C: learn-issues

Three disagreements. Line targets, readiness.yaml (src/readiness.ts:62-73), state.yaml and the binding decisions are otherwise right on main at 7bac4c1.

## D1. Criterion 4 cannot be met as written for cheat.md
brief.md:20 says both tables get a row "linking the skill". README rows link (README.md:182-190). The cheat table uses plain names with no links (docs/guide/cheat.md:116-126). A linked row there breaks the table's form, and brief.md:22's "docs link test proves the new table rows resolve" is then true for README only.

Replace criterion 4 with: "The workflow count in `docs/reference-index.md` matches the number of skill folders. The `README.md` skill table has a `learn-issues` row linking the skill, and the `docs/guide/cheat.md` skill table has a `learn-issues` row in that table's existing form. `docs/guide/learn.md` names `/learn-issues` where it describes pruning stale entries. `skills/AREA.md` lists the skill's key file."

Replace the second sentence of criterion 6 with: "The docs link test in `checks` is the property that proves the new README link resolves."

## D2. Missing surface: docs/guide/cheat.md:128
That line lists what the operator invokes by hand: "Invoke setup, intake, charting and watching when you need them." The new skill is operator-invoked and is not in the list, so the page would name the skill in the table and omit it from the sentence below.

Add to design.md:28: "`docs/guide/cheat.md:128` adds lesson triage to the operator-invoked list." Add to criterion 4: "The sentence under the cheat table that lists operator-invoked skills includes lesson triage."

## D3. Ambiguous: does the skill wait before removing a line?
design.md:25 says "show the operator the full sorted list with evidence before any edit; apply removals and history dating". brief.md:5 says only "The skill removes the active line". The binding decision gives accept or decline for seeds only (forks/adopt.md, answer 2). An implementer has to guess whether "show before any edit" means a pause for approval.

This matters because the registered checkout's LESSONS.md can already hold uncommitted lines that seats left for the operator (skills/check-issue/SKILL.md:59), so a wrong removal cannot be undone with a plain checkout of the file.

Replace that step in design.md:25 with: "show the operator the full sorted list with each guard's file:line, then apply the already-guarded removals and history dating without a further question; the uncommitted diff is the operator's review, and a line the operator restores stays". Add to brief.md:9: "It asks no question before a removal."

If the operator prefers a pause, the replacement is one sentence the other way. Either is fine. The draft must say which.
