# Seed-writer rebuttal, slot B, 2026-11-19

Read: seed-writer-merged.md only. No disagreement on the three picks. Five points.

R1. Q2 concurrency, A's `updatedAt` stop is the wrong field. An issue's `updatedAt` moves on comments, labels and state changes, not only body edits (my knowledge of GitHub, not observed today), so a comment during the edit would stop it for nothing. The body-edit time is GraphQL `lastEditedAt`. My read on 2026-11-19: #144 has `lastEditedAt` null and 0 edits, #714 has `lastEditedAt` 22:32:08 matching its last edit. If the stop is kept, it uses `lastEditedAt`. The same field is what marker decision 2 needs for "a body edit later than the pull". My position stays: state the limit, since a window remains between the check and the write either way.

R2. Q2 proof, three gaps in A's throwaway cycle. I agree Take's operation-proof rule asks for it.
- Target: Tamdoma/akrogon is PUBLIC. A throwaway issue there is public and notifies watchers. Run the cycle on a private repo.
- Cleanup: deleting an issue needs admin on that repo (my knowledge of GitHub, not observed today). The door's identity is admin on akrogon and tamdoma-framework (A's probe), so name one of those or cleanup can fail.
- Record: the session's needs sheet says "none". This grant is a late find under chart-issues `## Take` and goes on the sheet as a `late` row.
- "Else the edit route is cut" understates what survives. The door takes a section that reached the body by any edit, as #714's did. The cut removes only seed-issue's sanction for making that edit.

R3. Q2 dropped pitfall. A report authored by an account without write still reads "marked, not taken" after a colleague edits the decision in (marker decision 2). Not removed here. The operator should see it, since it is the one case where the edit route succeeds and the decision still does not bind.

R4. Q3 merged standing leaves the research tier open. "Read first as named intake material" can be read as tier `operator` in questions.md `## Research`. That tier outranks code and primary docs, and a round written from a lower tier is redone. Agent-written text that says "Nothing was run" should not hold it. Say: read first, no tier of its own, and each claim takes the tier of the source that confirms it.

R5. Q3 dropped question for the operator. #714's proposal was written into the issue before the decision so a second consultant could review it. Under the pick that step has no sanctioned place. The merged notes list it only as a rejected option. The operator did exactly this yesterday, so the round should state the cost.
