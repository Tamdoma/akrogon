# Wave shape

## Question
Q1. How does B know which units may run together?
Q2. How does a worker's result come back to the lane?
Q3. Where do worker worktrees live?

### Carries
Operator 2026-09-27: "This is just for chunking, limit yourself to that issue". "Yes, i want to keep them max" (seat effort stays max). "If not, seed it there with details. Simple easiest change. Remember, we use pi most of the time as slot b in the lifecycle" (seeded Tamdoma/pi-extensions#4).
Agreed by A, B, C in slots/map-merged.md: a worktree per parallel worker, cap 2 fixed, serial merge-back, full suite unchanged.

## Findings
See slots/map-merged.md.
- Blind answers: slots/wave-shape-B.md, slots/wave-shape-C.md. Merged: slots/wave-shape-merged.md. Rebuttals: slots/wave-shape-rebuttal-B.md, slots/wave-shape-rebuttal-C.md.
- After rebuttals A, B and C agree on all three questions: brief section 4 records prerequisites, owned paths and verification dependencies. B checkpoint-commits before each wave, workers commit, and B cherry-picks one at a time. Worker worktrees go at `<lane>/issues/worktrees/<slug>-u<N>`.
- Estimated unit-time savings are 15-49% per leaf (C, corrected by B), unmeasured.
- Operator 2026-09-27, on the cap: "Ok, lets start with 2 then. But were not talking about leafs, but chunks inside of the leaf?" The cap is 2 chunks at once inside one leaf's implement pass.
- Operator 2026-09-27, correction: "Cap 3". The cap is 3 chunks at once inside one leaf, replacing 2. Evidence: slots/cap-C.md (cap 3 saves 37-49 more minutes on wide leaves, nothing on chained ones). Tamdoma/pi-extensions#4 was updated to a fixed limit of 3.

## Taken
2026-09-27, operator: "1a, 2a, 3a". Cap: "Cap 3".
- Q1: before delegating, B records in each brief's section 4 the chunks that must land first, the paths it owns, and any shared test resource or consumed output. B runs up to 3 chunks at once whose prerequisites have landed and whose edits and verification are independent, and runs them one at a time when unsure. No plan-issue change. Foreclosed: an `after:` field in plan.md.
- Q2: B commits the lane before each wave. Each worker commits its chunk in its own worktree and returns the commit ID with its report. B cherry-picks results one at a time and runs lane changed tests after each. On a conflict B aborts the pick, keeps the worker commit, and resolves it or delegates only the remainder. Foreclosed: patch apply without worker commits.
- Q3: worker worktrees go at `<lane>/issues/worktrees/<slug>-u<N>`, detached at the lane head and removed after the result lands. That path is inside pi's parent root and already gitignored. After a crash B inspects and resumes a retained worktree. Foreclosed: `<lane>/.akrogon-units/`, and sibling worktrees that need a pi confirm dialog.
- Reason: all three seats agreed after rebuttals, and it is the fewest moving parts with git-native isolation.
