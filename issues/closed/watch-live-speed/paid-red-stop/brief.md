# Brief: paid-red-stop

## What

The shared lifecycle rules make paid proof runs stop being used as a debugger: one paid launch of an operation (a grant entry's operation, as in "Grant reuse and count lines", so all cells of one live proof are one operation) runs before its others, and after a paid red no further paid launch of that operation runs until a free reproduction of the cause passes after its repair, or a live-only diagnostic launch names an observation no earlier run produced.

## Why

The watch-timer leaf spent at least 26 paid launches against a grant of 8. It started all 8 cells back to back with no stop after the first red, and repeated one failing cell 7 times with the same error while the cause was reproducible for free.

## Done-criteria

1. skills/lifecycle-rules.md (linked from plan-issue, implement-issue, check-issue and merge-issue) states the rule above inside its `## Grant reuse and count lines` section, so the four-rule count and every skill intro stay true, and says it changes no count line or repeat-bound rule.
2. A diagnostic launch that repeats the known failure without producing the named observation ends further paid launches of that operation under the seat's operator-blocker stop.
3. merge-issue's red-retry rule and the new rule do not contradict: a merge-stage paid launch follows the same stop.
