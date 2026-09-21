# Review B: fork-per-round

Blind initial review. Did not read peer review.

- Base: `c9c96553f8d64c76668a1e2a9aee027e9d634ad1`
- Reviewed head: `fc1cd2ef34c3ffbf82a788fb41d468275fd43788` (1 ahead of base, worktree clean)
- Diff: 4 files, 12 insertions, 5 deletions. No AREA.md in diff, so no AREA path check applies.

## Criteria

- C1: questions.md:29 holds new current-fork sentence. Old `Present all currently material questions` count 0. Tail after replaced sentence byte-identical to base. Pass.
- C2: Take holds re-read Fog, move sharp material, reshape forks, update Open forks list, select and research next fork. Handoff tail after semicolon byte-identical to base. Pass.
- C3: Drain holds one-fork sentence at SKILL.md:35 between territory-map and split paragraphs, with next-answerable-first, reshape-preference, one-fork-costs-one-round. Direct-item condition is no open fork and no fog. Old wordings count 0. Pass.
- C4: Template has `## Open forks` at shapes.md:26 between Forks taken and Fog with ordered-link line. Fork last sentence replaced, old `CHART.md lists none` count 0. Preflight refusal at line 166 intact. Pass.
- C5: Guide has one-per-round paragraph at chart.md:124 and records sentence at :158. Same 5 `##` headings as base, line shift only. Diff touches only those two hunks, diagrams and export-csv example unchanged. Pass.
- C6: Independent grep confirms skills/AREA.md and README.md hold no sentence describing chart rounds (AREA hit is `grounding` substring, README hits are skill names and links). Both unchanged in diff. Report states none found. Pass.
- C7: Only added heading in diff is `+## Open forks`. No new files. No new fork-file fields; `blocked-by` hits in shapes.md are pre-existing lifecycle samples, untouched. Drain, Take, round, fork paragraphs read as map, one fork per round, reshape, next fork, handoff. Contradiction sweep finds no leftover multi-fork round sentence. Pass.
- C8: `bun test tests/docs-links.test.ts` rerun by this seat: 3 pass, 0 fail. Full suite per report: 287 pass, 0 fail; no code change, evidence accepted without rerun. `git diff base..HEAD -- src/ tests/ issues/ plugin/` empty. Pass.

## Design exclusions

Round-shape block intact (Research, Pitfalls, reply key, challenge check all present). Blind B exchange section untouched. No change to src, tests, plugin, other skills, issues, or installed copy. No `blocked-by`, status, or claim field added to fork files.

## Changed-behavior doc check

The doc page describing charting is docs/guide/chart.md, itself updated consistently with the skill. No wrong claim and no missing path.

## Report check

Report names changed files with reasons, pastes worker and B check results with artifact paths, records base and head correctly, and lists the installed-copy limitation. No material gap.

## Findings

No Fix. No Nit.

## Verdict

ready
