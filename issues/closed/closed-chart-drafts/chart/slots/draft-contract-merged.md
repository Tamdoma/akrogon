# draft-contract: merged round (A,B)

## Q1. Does the door contract still need a change for #39?
- 1a (recommended, A,B): no change. After archive-boundary, charts never enter the scanned folders, so a draft state.yaml in a chart cannot reach dispatch. shapes.md:15 already says charts hold no state.yaml, and SKILL.md:61 asks only for briefs and designs. A leaned toward 1b before reading B, then agreed: correctness must not depend on agents following wording.
- 1b (A,B): replace "scratchpad" in SKILL.md:61 with the chart slots location from questions.md:46, keeping briefs and designs only. Both repos already do this in practice (akrogon closed charts slots/handoff-draft, framework slots/leaf-draft). Clarity only, no protection.
- 1c (A,B): standardize state.draft.yaml bundles. Adds a draft format and conversion step nobody needs.
Pitfalls (A,B): the regression test must prove a chart holding nested draft state.yaml files survives completion without entering the inventory, not check wording. Framework evidence is not touched.
