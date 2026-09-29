# Design: init-lessons-union

## Binding decisions, verbatim
Source: issues/chart/lessons-merge-conflicts/forks/union-rollout.md, operator 2026-09-29: "1a | 2a | 3a | 4a - but you will do it for all repos. No time for me to do anything manually | 5a |"

- Q1 1a: path-specific `learnings/LESSONS.md merge=union` in tracked `.gitattributes`, and `akrogon init` appends it idempotently, preserving other entries. Reason: small, measured twice. Foreclosed: one file per lesson (1b), manual resolution (1c), gacp resolving conflicts.
- Q2 2a: tracked rule only, init writes no `.git/info/attributes`. Reason: no hidden per-clone override. Consequence: any local rule used for bootstrap is removed, including framework's. Foreclosed: init writing tracked plus local (2b).
- Q3 3a: `issues/log.jsonl` keeps normal merging. Reason: status reads the log by line order (src/status.ts:123, 293). Foreclosed: log union with or without an ordering fix.
- Q4 4a, operator correction: the door runs the backfill for all 8 repos, the operator does nothing manually. One akrogon code leaf changes init, its tests, skills/init-akrogon/SKILL.md:76 and docs/guide/setup.md:31. Foreclosed: rerunning init (4b), a leaf per repo (4c). Exclusion for this leaf: the backfill is done (fork record, 2026-09-29) and is not leaf work.
- Q5 5a: accept union's silent retention on overlapping edits and deletes. Reason: rare, and the next prune removes leftovers. Foreclosed: coordinated maintenance with temporary `merge=text` (5b), immutable lessons (5c).

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- No auth, secrets, backend or browser flow is touched. No credentials are needed.
- No vanity tests: each assertion checks written bytes, git's effective attribute or a real rebase result.
- Negative and edge cases: missing trailing newline, repeated init, no local rule written, and an unrelated conflict still stopping the rebase.
- The user-visible flow is `akrogon init` followed by a rebase. The fixture test runs the real CLI and real git and is the end-to-end invocation. Its saved output is the artifact.

## Leaf architecture
Owned: `src/init.ts` (`initialize` only), `tests/init.test.ts`, `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md`.
Interface: the literal line `learnings/LESSONS.md merge=union` in `<root>/.gitattributes`. Reuse the existing append pattern for `.gitignore` rather than adding a helper with a mode flag.
Exclusions: no `.git/info/attributes`, no `issues/log.jsonl` rule, no gacp or sync changes, nothing under `issues/`.
Dependencies: none.
