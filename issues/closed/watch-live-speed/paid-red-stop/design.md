# Design: paid-red-stop

## Binding decisions, verbatim

From issues/chart/watch-live-speed/forks/disposition.md, A under autopilot: Correction 1 "New item 8 (C D6): ... one paid launch of an operation runs before its others; after a paid red no further paid launch of that operation runs until a free run reproduces the cause or a new observation is written. Count lines and the warn-and-continue repeat rule stay as the operator decided." Correction 2 item 8 and Correction 3 item 8 refine it: the reproduction must pass after its repair; a live-only diagnostic names an observation no earlier run produced and stops when it repeats the known failure without it; "red-first proof at plan is free" is not part of this shared rule.

Operator answers this leaf must not change: issues/chart/grant-run-count/forks/signposts.md Taken (written rules only, warn and continue past a repeat count) and issues/chart/paid-proof-bounds (no counter).

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: skill text only, no live session. The existing link and docs checks (`tests/docs-links.test.ts`) prove only that the links and command references stay valid; criteria 1-3 are proven by review reading the rule against today's case (8 cells launched back to back, one cell repeated 7 times on one error), the review seat reads the text, since no text check would turn red if the stop sentence were removed (slots/leaf-review-b.md F9).

## Leaf architecture

Owned surfaces: skills/lifecycle-rules.md `## Grant reuse and count lines` (the per-skill paths are symlinks to it).

Consumers: plan-issue, implement-issue, check-issue and merge-issue seats, which read lifecycle-rules.md; merge-issue's red-retry rule.

Exclusions: no akrogon command, counter or refusal; no change to the grant count line or repeat-bound wording.
