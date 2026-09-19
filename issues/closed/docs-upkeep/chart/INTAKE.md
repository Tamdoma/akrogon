# Intake: docs-upkeep

## Scope
Keep agent docs (AREA.md files, docs/reference-index.md) and human docs (README, docs/guide) current through the existing lifecycle: plan names the affected docs, implement updates them, check verifies from the changed behavior. Repair the stale indexes found in pi-extensions and mdcny. Make `akrogon init` refuse a declared index that is not a readable non-empty file and drop the silent `grounding: none` default. Grouping: three independent leaves, one per destination repo.

## Provenance
- Operator: 2026-09-19 session message (chart request), 2026-09-19 follow-ups quoted in forks/round-1.md

## Source: operator 2026-09-19
One thing I just remembered, now that we are doing the documentation in this format, what skill is being used to update the documentation for agents? Maybe it would be good to have it update the docs for humans as well? Let's start charting. Include slot B. I want an elegant minimal change solution. If mine is not the best, please provide your options and solutions. We need to come up with the best, most elegant, easiest to implement and the least complex solution for this. The intent is to have the human docs updated automatically. Same as the agent docs are being updated today. Also please check if they are being updated or if there was a bug of some sort. We need to make sure that both sides, for humans and for agents, work flawlessly. Also, take a look at the area files across the repos where Aprogon is used. See if they are being updated or if there is a problem.

## Source: operator 2026-09-19, follow-ups
did you check the areas in different repos? are area.md files being updated?

why is boulevard not grounded? it should have been?

## Agent findings
- Updater is skills/implement-issue/SKILL.md:27 (since f89b8fa, 2026-09-10). Verifier is skills/check-issue/SKILL.md:35, which checks only AREA.md files already in the diff and says "Open no area file outside that diff" (since 421934b, 2026-09-11). plan-issue/SKILL.md:25 reads grounding.index into the read-first list. init-issues/SKILL.md:56-60 reuses or creates docs/reference-index.md and AREA.md files.
- Per merge window (B's method): akrogon 6/10 recent merges touched an AREA, 1/10 the index; watch-issues-skill (391bc82) merged with no README or index row. framework 1/10. pi-extensions 3/10, index lines 24 and 73 point at deleted files. mdcny index never grew past the three-line scaffold while README did. boulevard `grounding: none`. clinique inherits framework docs, no own leaves. tests/AREA.md in akrogon untouched since 2026-09-11 across 63 tests/ commits.
- Root cause: the rule fires only if the implementer remembers, and review verifies only what implement touched.
- Boulevard: `grounding: none` first committed in 1ded67a (2026-09-18) with the boulevard-ghl-sync handoff. src/config.ts:35-45 defaults omitted grounding to `none`; src/init.ts:18-50 never checks the index. The skill was run without a grounding proposal and nothing refused. Not a deliberate opt-out.
- src/config.ts grounding fields docs, surfaces, indexed_scopes have no reader in src/ or skills/.
- Token cost of Q1-A and Q2-A (B estimate, not billing): 3-8k extra input tokens per no-debate leaf, 7-15k with debate, roughly 1-3% of a 300k leaf.
- watch-issues rows in akrogon README, reference index, skills/AREA.md, in-practice and cheat pages were written directly on main by the operator's instruction on 2026-09-19, not as a leaf.
