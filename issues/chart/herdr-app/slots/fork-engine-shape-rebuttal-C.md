# Rebuttal C: engine-shape

One disagreement, on Q3 option 3b's stated reasons. Attributions to C are correct.

3b lists "codex question shows working" and "backgrounded Claude shows nothing" as hc status gaps that a direct dispatch from `akrogon phase` would cover. Neither case is covered by 3b:

- Codex asking a question has not run `akrogon phase`; it is mid-turn with no move committed. No dispatch path, event or direct, fires. That seat is the watcher's case (intake 2026-11-03: judge by screen and log), whichever Q3 option is taken.
- A backgrounded Claude seat shows `agent: bash` and `status: null` to hc (intake 2026-11-04). If `phase` dispatched directly to it, `hc send` would type into the terminal whose foreground is the background viewer, not the agent, with no status to confirm delivery. The right treatment is the one the merged map already keeps: unknown status means hands off, and no `/background` in a seat (operator step).

So 3b's remaining gains are the other-seat case (faster by one turn end) and a hand-run `phase` from a shell. Today a hand-run `phase` from a plain shell also advances nothing until the next event or a manual `next` (`src/akrogon.ts:76-96` wakes merge work only), so 3a keeps that behavior unchanged, which is the carry. If the operator wants hand-run `phase` to advance, the smaller change is to have `phase` end by running `akrogon next <slug>` under the existing global lock, which already refuses a busy seat (`src/next.ts:704`) and records one prompt per phase and seat (`invocation.dispatched`, `:970-973`), instead of a second dispatch path inside `phase`. That is still 3a with one extra `next` call, not two success paths.

No other disagreement.
