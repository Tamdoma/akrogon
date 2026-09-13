# Which areas of akrogon get an area file in this issue?

## Question
The index links seven folders: src, tests, skills, plugin, docs, issues, learnings. Which of these get an area file now, given the evidence that a file describing what one line already says costs tokens for nothing?

### Carries
Operator lock: no new machinery. Research: value is in commands, exact paths and non-obvious patterns, not overviews.

## Findings
`src/` has 13 files with cross-module rules a planner must otherwise read code for (locking order, dispatch outcomes, cleanup only on `--all`). `skills/` has eight folders with assets and scripts. `tests/` has a fake-herdr harness and browser specs with per-page configs. `plugin/` is two shell hooks and a TOML. `issues/`, `learnings/` and `docs/` are self-describing by name.

## Taken
Operator: `2a`, 2026-09-11. Area files for `src/`, `skills/` and `tests/` only. Reason: the other four folders are self-describing by name, and a file restating an index line costs tokens for nothing. Foreclosed: files for `plugin/`, `docs/`, `issues/`, `learnings/` in this issue.
