# Brief: epic-broadcast-once

## What
`akrogon phase <slug> merged` prints a completion line only when the leaf's completion owner finishes: `issue complete <issue>` for a standalone issue (unchanged), `epic complete <epic>` once when the last leaf of an epic merges, and no completion line when an issue inside an unfinished epic finishes. The merge-issue skill broadcasts on either line and gathers the owner's briefs (the whole epic's, when there is one). Skill and guide wording follows.

## Why
Tamdoma/akrogon#42: finishing one issue inside an epic posts a Discord broadcast about building blocks that ship nothing usable yet. The operator wants one broadcast per standalone issue and one per whole epic.

## Done-criteria
1. In a `tests/phase.test.ts` scenario with an epic of two issues, merging every leaf of the first issue prints neither `issue complete` nor `epic complete`, and merging the last leaf of the second prints `epic complete <epic>` exactly once.
2. When two final leaves of one completion owner merge concurrently, exactly one invocation prints the completion line.
3. A standalone issue still prints `issue complete <issue>` on its last merge (existing `tests/phase.test.ts` and `tests/next.test.ts:844,1007` pass unchanged in that respect).
4. Recovery paths (`merged` retried on a merged leaf, and `akrogon next` completing a merged leaf) print no completion line, and a repeated `merged` stays refused with no completion line.
5. Existing source-closure assertions in `tests/phase.test.ts` (private sources close when their inner issue finishes, remaining sources close at epic completion) pass unchanged, with only their printed-line expectations updated to this rule.
6. `skills/merge-issue/SKILL.md` runs broadcast-issue only when the invocation prints `issue complete` or `epic complete`, and gathers the completion owner's briefs (every leaf brief under the epic when the leaf has one) before `merged`.
7. `skills/broadcast-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/cheat.md:125`, `docs/guide/idea.md:89` and `README.md:188` describe one broadcast per completed standalone issue or completed epic; `grep -rn "issue complete" docs skills README.md` shows no line claiming an inner issue triggers a broadcast.
8. `bun run format`, `bun run typecheck` and `bun test` pass.
