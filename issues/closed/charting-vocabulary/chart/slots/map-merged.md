# Merged territory map

## Forks
1. Disk names: keep `decisions/`, `## Resolution`, `## Not Yet Specified`, `## Out Of Scope` literals and use new words in prose (recommended, both), or rename with parser, test and chart migration (both). Evidence src/status.ts:238-252, tests/status.test.ts:460-482 (both). Renaming only the template silently zeroes counts (B).
2. Fog record shape: bullets under the retained heading so status counts them (both; A as own fork, B as F3).
3. Multi-question fork taken only when all material questions answered; partial reply stays open; continuous numbering per round (both).
4. Correction to a taken fork before handoff: new fork naming the superseded one, original verbatim (both).
5. docs/guide/files.html:106 wording: leave under option 1 (A). Migration scope of closed charts under option 2 (B Q2).

## Contradictions
- implement-issue does not read chart files; the command does (both).
- Map "never saved" vs slots exchange files: temporary, not a saved map (both).
- Current rule is per question, not per file (both).
- shapes.md "charts stay here" is only true until owner close; phase.ts:103 moves it (B).
- "One screen" means one complete message, no viewport cap (B Q3).

## Pitfalls
- Grep-shaped done-criterion 1 vs verbatim template literals (A, lesson 2026-09-11).
- Partial answer under `## Resolution` reads as decided to status (B).
- Immutability must not block operator corrections; unsuperseded answers can put contradictory binding decisions into a design (B).
