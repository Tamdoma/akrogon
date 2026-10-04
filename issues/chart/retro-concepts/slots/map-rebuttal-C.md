# Rebuttal C: retro-concepts

One disagreement. Everything else in map-merged.md stands, including the A,C recommendation (O1).

## D1. G1 overstates the second example

map-merged.md:15 says LESSONS.md:17 (blank reason) is "already enforced at src/phase.ts:327". That is true only for the one instance the lesson came from.

- The lesson is about a class: `z.string().min(1)` accepts whitespace-only input (LESSONS.md:17, learnings/history/2026-09-19-min1-not-nonblank.md:5).
- `src/phase.ts:327` and `src/state.ts:15` now use `.trim().min(1)`, so the `--reason` instance is fixed.
- The same pattern is still live without a trim at `src/config.ts:9`, `src/state.ts:51-54` and `src/next.ts:240`. Nothing stops the next schema from repeating it.

So LESSONS.md:17 is "checkable", not "already guarded". My map listed it that way (map-C.md F1). Only LESSONS.md:10 against `src/phase.ts:270-271` is a clean "already guarded" example.

## Why it matters for O1

The merge's own example is the "False already guarded" pitfall at map-merged.md:33. Citing a guard's file:line does not remove that pitfall, because a fixed instance has a file:line too.

The O1 sentence needs one more condition: a line is "already guarded" only when the guard covers the lesson's mechanism wherever it can recur, not just the case that produced it. A fixed instance with the pattern still reachable elsewhere is "checkable" or "stays".

Without that condition, the door would remove LESSONS.md:17 at the next open and the class would lose its only record in the active list.
