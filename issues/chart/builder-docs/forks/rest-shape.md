# Fork: rest-shape

## Question

Shape of the remaining docs work after the operator read pages 04 to 08. Sources: slots/rest-review-a.md, rest-review-b.md, rest-review-c.md. Operator, verbatim: "consult with both consultants before all the charts are completed and handed off. As I said, if there is a better architecture, we don't have to keep the old one." and "Same thing with installation and setup process. It needs to be easy to follow."

## Taken

A's picks, 2026-11-27 (builder-docs runs under autopilot; the operator delegated the architecture in the words above).

- R1 Guide pages: 01-install, 02-set-up-a-repo, 03-your-three-tabs, 04 to 08 unchanged numbers, 09-lifecycle, 10-merging, 11-while-you-are-away, 12-when-work-stops. Removed: 01-what-akrogon-is (README owns it) (B,C), 13-other-tools (minor tools get a short table in docs/README.md linking the shelf; hand-written issues and rollback live on the shelf) (B,C). 09 and 10 stay separate because the operator named merging as its own chapter (B; C would merge them). 04's tab section shrinks to a link to 03 (B,C).
- R2 Setup easy to follow: 01 to 03 are numbered steps from a bare machine to `akrogon status` showing client-portal, each step with its command and what the reader should see, a full copyable machine config, and the clone step (B).
- R3 One running example through 09 to 12: client-portal's `csv-export` and `scheduled-email` from page 08 through build, review, merge, the night and one failure; client-portal is one of page 02's two product repos beside the made-up acme-core upstream (B).
- R4 docs/reference/words.md maps each guide word to its shelf word (task/leaf, slot A/seat A, charting agent/chart door) (B).
- R5 Order: a small charting-fixes leaf first (agy writer): em dashes out of README.md, docs/**/*.md and docs/pictures/*.svg; full consultant examples on 04 to 08 and docs/README.md; one sentence on 04 that consultants sit in slots B, C, D while charting and a Lifecycle task gets a fresh slot B (B G2); a dash guard reading the disk. charting-pictures-more and guide-chapters are blocked by it (A,B,C: removes the 04 to 08 collision).
- R6 Pictures split by chapter: charting-pictures-more (04 to 08 and the mark fix), setup-pictures (README hero, 01 to 03), build-pictures (09, 10), away-pictures (11, 12, old-picture deletion, shelf embeds). Each later picture leaf is blocked by guide-chapters and charting-pictures-more (A,B; C proposed the same size). Merge gets its own picture; watch-loop.svg is the overnight watcher only.
- R7 Logo: only charting-session.svg is off (B,C measured: 4 px high). Fix by one mark group holding the "created by" text and the logo, copied whole into every picture and placed by one translate; where-things-go.md says so (B). Proof: the mark group markup is identical across pictures, plus slot B's screenshot reading (B K1, C).
- R8 Picture per section: a section may share a picture when the report gives a reason slot B accepts; a series drawn from one base drawing is fine; a picture above the first `##` counts for the page opener (B K2, C).
- R9 Renders: one light render per picture, one dark render per leaf (the card is opaque) (B,C).
- R10 Text criteria: behavior-claim proof scoped to commands, paths, numbers and always/never/only rules (B K3, C); a move map from every retired page to its new home, checked by slot B (B K5); the cold reader also re-reads 04 to 08 and gets a setup question; Q2, Q3, Q6 wording fixed (C); README carries no picture until the hero exists (B K7).
- Not taken: C's folds of roll-back-a-release.md into releases-and-updates.md and limits.md into README (no reader gain named; rollback test keeps its page). B G3 (`xhigh` unproven): consultant C has run on agy neon xhigh all day (seats.yaml), so the example stays.

Final-shape corrections (A, 2026-11-27, from slots/final-shape-b.md and final-shape-c.md):
- 04's c- tab section gets no picture; charting-pictures-more stays parallel with guide-chapters (B D1). C's block of charting-pictures-more on guide-chapters not taken: it would hold the logo fix and 04 to 08 pictures behind the longest leaf, and the two leaves no longer share lines.
- Machine config: one config that works with one agent CLI plus an optional block for the other harnesses (B D2, C 3). Harness lines are checked against the live machine config (B D3). Setup opens with a check list of what the machine needs, then numbered steps from the clone (B D3).
- Phrase guard: docs from disk, skills from `git ls-files` (B D4, C 2).
- Cold-reader question 8 answer written (B D5). README hero wording fixed (C 4).
- Not taken: an operator look at charting-pictures-more before the later picture leaves start (B F3); R8 sharing lowers the cost of a wrong reading and the operator asked for no further gate. Splitting charting-pictures-more by page (C 5); with sharing its size is near setup-pictures. Skipping em dashes on soon-deleted pages (C 5); the guard stays simple (B accepted).
