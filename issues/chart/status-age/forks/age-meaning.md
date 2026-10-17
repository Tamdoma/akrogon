# What the status time column measures

## Question
Q1. What does the column measure for finished and for still-running leaves?
Q2. Where does a leaf's clock start?
Q3. How is the time printed?
Q4. What is the column called?

### Carries
- Operator 2026-10-17: "show the age how much time it took for everything to go from zero to the end ... this just goes up every time I refresh the status, which doesnt make any sense."

## Findings
- better-than-training · `src/status.ts` `cells`, read 2026-10-17: AGE = now minus the last `log.jsonl` move into the current phase. Merged leaves keep growing.
- better-than-training · `issues/timings.jsonl` via `src/timing.ts` `readTimings`, read 2026-10-17: first delivered `prompt` marks when a seat began work. First `visit_start` marks when dispatch first saw the leaf, which includes time blocked by prerequisites (new-rules-pilot: 17.5h gap).
- better-than-training · `src/status.ts` `note`: busy seats already print `busy A 0h04m`, so per-phase stall time stays visible after the change.
- model-knowledge: no outside source applies, this is the repo's own display.

## Taken
Operator 2026-10-17: `1a | 2a | 3a | 4a`

- Q1 1a: finished leaves (merged, failed) show first-prompt to the move into that phase, frozen. Running leaves show first-prompt to now. Reason: one meaning, total time spent. Foreclosed: 1b time-in-current-phase for running leaves. Busy seats keep their own NOTE clock.
- Q2 2a: the clock starts at the leaf's first `prompt` record with `outcome: delivered` in `issues/timings.jsonl`. A leaf with no such record shows `-`. Foreclosed: 2b first `visit_start`, which counts prerequisite wait.
- Q3 3a: printed as `<h>h<mm>m` (`0h29m`, `17h28m`), the same format as the busy note. Foreclosed: whole minutes.
- Q4 4a: header `TIME`. Foreclosed: `AGE`.

Operator 2026-10-17, route: "Why not direct mode? You can spawn slot B (codex) to check for you." Route direct, B = codex pane w8:pRM.
