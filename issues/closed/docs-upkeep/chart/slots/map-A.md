# Map A: docs upkeep

Mechanism: implement-issue:27 "updates affected docs and area index entries before review" (since f89b8fa 2026-09-10); check-issue:35 verifies paths only for AREA files already in the diff (since 421934b 2026-09-11); plan-issue:25 reads the index into the read-first list; init-issues:56-60 creates them.

Measurement (A): akrogon since the rule: 49 commits on main touching src/, 5 touching src/AREA.md; docs/guide touched in 7. tests/AREA.md untouched since 09-11 across 63 tests/ commits and still names the Playwright command. framework: 161 hooks commits since 09-01, 2 hooks/AREA.md commits; hooks/AREA.md:24 names harness/run-hook.ts, real path tests/harness/run-hook.ts. pi-extensions: index updated 23 times (works), but names two deleted files (forced-native-compaction/index.ts, subagents/btw.ts). mdcny: index is a 3-line scaffold. boulevard: grounding none. clinique: inherited framework docs, no own leaves.

Root cause (A): the rule fires only if the implementer remembers; the reviewer checks only what the implementer touched. Enforcement is conditional on the thing it should enforce.

Forks (A): Q1 discovery: plan names affected docs (agent AREA + human page) from the index and README in its checklist, so implement does it as a checklist item and check verifies it against the plan (recommended) vs a config path list. Q2 review: check derives affected docs from the diff, not from the diff's AREA files. Q3 repair the found stale entries now (small, in their repos) vs later. Optional convention: each reference-index line may link the human page for its area so both docs are found from one place.

Split (A): L1 akrogon skill rule (plan, implement, check prose), L2 pi index repair, L3 mdcny index repair; framework/clinique shorthand paths left, akrogon tests/AREA.md owned by the pending guide-markdown leaf.
