# Final-shape check, slot C: stock-flow

## Correctness against plan-issue:25-27,39

- C1. The shape reads more into :25 than it says. The planner keeps "useful paths" as read-first; it does not judge whether a lesson is checkable or whether a guard covers it. Checkability is the learn-issues sort (skills/learn-issues/SKILL.md:18-21: read history, trace the mechanism through current code and checks). Under the taken promotion 1a the writer skips the coverage trace and charting does it, so the shape is consistent with 1a only if the planner also skips it, which means a relevant already-guarded lesson produces a seed rather than a deletion.
- C2. :27 permits opening history "only to verify a cited lesson's evidence". Checking for a seed link is a different read with a different purpose. The shape needs :27 widened or it contradicts it.
- C3. Debate mode runs two planners (positions-A, positions-B) before A's synthesis (plan-issue:47,59). Both read LESSONS.md and both would see the same unseeded lesson. seed-issue's dedupe (SKILL.md:59-60) is two `gh` lookups with a two-day author window and a keyword search, run concurrently by two seats, so a double filing is possible. The shape must name one filer, A at synthesis, or it adds a race.
- C4. "Relevance is recurrence" is not true. The planner picks a lesson because the leaf touches the same area, not because the failure happened again. The seed then records a risk, not an observed repeat. Intake accepts that, but it is not the same thing 1a files, and the fork's Taken 1a wording ("same failure cause") should not be stretched to cover it.

## Cost

- Speed: per relevant lesson at synthesis, one history read plus up to three `gh` calls (two lookups, one create). A leaf touching an area with several unseeded backlog lessons pays that several times in the plan pass, which is on the critical path of every leaf. The first leaves after adoption pay most, since the backlog is unseeded. Evidence: seed-issue:56-68; framework backlog 145 lines, 0 seeded.
- Quality: a seed per relevant already-guarded lesson lands as intake that charting must inspect and close, instead of the line being deleted with `file:line` evidence. Evidence: learn-issues:28 deletes with evidence; the shape's bullet 4 routes the same lines through a seed, a chart and a retirement. That is more operator work per guarded line than the one-time run, for that subset.
- Elegance: one rule, "whoever writes or cites a checkable lesson without a seed files one", at two sites. Acceptable as a mental model. The exceptions it needs (single filer in debate mode, widened :27, relevance vs recurrence) are what grows it.
- What it does not change: reader tokens. Lines leave only via a guard leaf (4a) or chart retirement. Judgment lessons, the majority under 3a, and every lesson no leaf touches stay, so the roughly 15k tokens per framework plan stays. The shape converts part of the backlog into seeds; it does not shrink the stock on its own.

## Existing machinery that does this better

- For the forward loop: taken 1a at write time already files the seed when the lesson is new or matched. The planner-filer only adds coverage for the pre-1a backlog.
- For the backlog: `/learn-issues` once. Same judgment the shape delegates to charting, done in one bounded pass, deletes guarded lines directly and prints seeds for the rest. It is the only existing step that removes lines without a leaf.
- The shape is B's P3 moved from the chart door to the planner: same topic-overlap bound, run more often, with a weaker judge (the planner does not trace coverage, the door does). If the operator wants an opportunistic drain inside an existing pass, the door (chart-issues:31) is the better site, since it already carries intake judgment, dedupe and routing, and it runs without the critical-path cost of planning.

## Should 3a stay required

Yes. The shape drains only lessons new work touches, turns guarded backlog lines into seeds instead of deletions, adds plan-pass latency, and leaves reader cost unchanged. The one-time run is bounded, uses existing machinery, and is the only path that empties the guarded and checkable backlog. Keep 3a required and keep the planner-filer as an optional forward addition, if at all, limited to A at synthesis.
