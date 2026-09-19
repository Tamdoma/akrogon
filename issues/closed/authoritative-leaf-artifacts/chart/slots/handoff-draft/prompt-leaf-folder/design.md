# Design: prompt-leaf-folder

## Binding decisions, verbatim
From `issues/chart/authoritative-leaf-artifacts/forks/artifact-placement.md`, operator 2026-09-18, "1 - I'm for a, but what happens then, does it autocorrect? | 2a | 3a":
- Q2: A. The dispatched prompt carries the absolute authoritative leaf folder and every lifecycle skill's write lines point pass artifacts there. Foreclosed: skill text only.
- Q3: A. No artifact-existence gate; today's debate gate stays. Foreclosed: phase-to-artifact table.
- Q1 (A) is excluded from this leaf: the phase guard belongs to `phase-issue-diff-guard`.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: the user-visible flow is the dispatched prompt; verification is a real `akrogon next` run in the fixture with the fake harness recording prompts (`database(f).prompts`), asserting the `leaf=` value functionally. Negative test: the value is not a worktree path (criterion 2). No secrets, no auth, no browser.

## Leaf architecture
Owned: `src/next.ts` prompt construction at the dispatch site (`dispatchSlot`), `tests/next.test.ts` prompt assertions, prompt and write lines in the four lifecycle `SKILL.md` files, prompt-shape mentions in `README.md`, `docs/guide/`, `tests/command-reference.test.ts`.
Interfaces: prompt string `<skill> <slug> slot=<S> phase=<P> leaf=<path>`; `leaf.path` as already resolved by `discover()`. Paths with spaces are passed as-is inside the single prompt argument (criterion 6 verifies); skills read the value to end of line.
Excluded: `src/phase.ts`, the debate gate, `learnings/` lesson locations (B), `chart-issues`, `seed-issue`, `init-issues`, `broadcast-issue` skills (not dispatched by `next`), any file move or existence check.
Dependencies: none. Runs in parallel with `phase-issue-diff-guard`.
