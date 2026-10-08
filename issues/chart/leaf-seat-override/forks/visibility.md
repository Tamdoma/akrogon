# Visibility, timing and door capture

## Question

Q1. Does `akrogon status` show each leaf's desired next-start seats (A and B harness/model/effort with their source level), or is leaf-effective `akrogon config` inside the worktree enough?

Q2. Does the chart door ask about seats on every handoff, or only when the intake or map names a model-sensitive leaf, writing nothing otherwise?

Q3. Does the nonblank rule apply to the existing global and repo seat boundaries too, or only to the new levels?

### Carries

- Shared recommendation (A,B), not a lock: a setting applies at the next agent start per pane (`src/next.ts:527`); an edit while a session runs does nothing until that session ends; no per-phase switch and no automatic session replacement.
- Batch merge: one holder's B runs the shared merge pass (`src/next.ts:649-653`, `src/batch.ts:42-47`); a per-leaf B choice does not govern a merge carried by another holder; batching preserved.
- Related: forks/setting-home.md, forks/worker-model.md.

## Findings

See slots/map-merged.md (visibility, door, validation) and slots/map-rebuttal-B.md R2, R3, R4. B: display desired next-start seats separately from any claim about the running model; harness references are validated in the resolver before tab or worktree allocation (`src/next.ts:655-659`), not inside `readState()`. `effectiveConfig()` already detects a linked worktree (`src/config.ts:168-180`) and `tests/config.test.ts:152-174` lock repo-level output there.

## Taken

2026-10-07. Operator verbatim: "1a | 2a | 3a".

Q1 taken: 1a. `akrogon status <slug>` prints the effective A and B seats with the file each came from; `akrogon config` inside a managed leaf worktree prints the leaf-effective `slots`; the status table marks a leaf whose seat comes from an index. All read the one resolver and are labelled as the next-start seat, never the running model. A detached worker worktree is not a managed leaf worktree and prints repo seats as today. Foreclosed: config-only visibility.

Q2 taken: 2a. The door asks about seats once at the handoff review only when the intake, map or a leaf design names model-sensitive work; otherwise it writes no block. The index block is written before any leaf `state.yaml`. Foreclosed: asking on every handoff.

Q3 taken: 3a. One seat schema at machine, repo and index level: `harness`, `model`, `effort` nonblank after trim, no quote characters. Foreclosed: a second schema for index blocks only.
