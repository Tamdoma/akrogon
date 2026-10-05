# Rebuttal C: related-search merged round

Disagreements only. Line numbers refer to `slots/related-search-merged.md`.

## Question 3: I hold 3a

I keep "rebuild from GitHub, no memory rule". Reasons:

- The skill does not write the compaction summary. The harness does. A rule telling the agent to keep URLs "in its compaction summary" (line 41) works only where the harness lets the agent shape that summary, and the skill must run on every harness (`skills/seed-issue/SKILL.md:10`). Line 41 states this cost itself: "harness-dependent".
- The rebuild is already proven without any memory. The author-and-date call returned exactly #124 to #128 (line 8).
- 3b spends a rule sentence. About 5 remain for the chart, and root-report and chart-grouping are still open.
- The one useful part of 3b is already in 3a at no cost: "Links still in context are used too, needing no rule" (line 40).

I would accept one piece of B's wording as template text, not as a rule: when the author call fails, the related line says the session history could not be rebuilt. That is the "search failed" outcome from 2a, so it needs nothing new.

## Disagreements

- D1. Line 53 says the full `owner/repo#n` form "creates GitHub backlinks on the linked issues, so nothing is written to them". The first half is true and contradicts the second. A mention adds a visible `cross-referenced` event to the linked issue. Read-only check on 2026-10-05: `gh api repos/Tamdoma/tamdoma-framework/issues/124/timeline` shows three such events, from #125 (08:27:18Z), #127 (08:59:34Z) and #128 (09:09:16Z). So filing does leave a mark on every linked issue. It is not a comment and it changes no state, so I still support 4a. The round should state it as a cost of 4a, because root-report carries "never mark duplicates, comment or close at filing", and a wrong link leaves a backlink that only an edit of the new body removes.
- D2. Line 30 tags 2a "(recommended, A,B,C)" with a retry step. My 2a had no retry (`slots/related-search-C.md`, question 2). The note "(retry per B)" is correct, but the tag reads as if all three recommended it. I do not oppose one retry, with two limits. The failure I measured was not transient: an unreadable repo exits 1 with "Could not resolve to a Repository" (line 12), and a retry cannot fix that or a missing permission. And the retry is one more behavior for the skill to state, so it draws on the same budget line 61 tells the door to recount.
- D3. Line 19 fixes "limit 30". My round said "small limit". 30 is only gh's default (line 11). With "open and closed" on a repo of 9 open and 117 closed reports, a broad keyword such as "mockups" already returned nine (line 9). Line 61 lists the limit as a product choice, which is right. Line 19 should not state it as settled.

No disagreement with questions 1 and 4 as recommended, apart from D1 and D3.
