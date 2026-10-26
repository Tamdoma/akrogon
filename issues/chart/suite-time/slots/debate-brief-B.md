# Debate brief, slot B

Operator update (verbatim): "We can use all slots suggestions, so make all 3 of you agents debate them and then we can get a full list, not just one thing."

So the goal is now a full ranked list of improvements, each one small and separately deliverable, not a single pick. Read:
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-merged.md (options O1-O5)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-rebuttal-B.md and /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-rebuttal-C.md (both rebuttals)

A's rulings on the rebuttals, with evidence:
- B F2 accepted: the peer-wait 11s cost comes from test-supplied '11' budgets, not IDLE_GRACE_MS. O1 now means: shorten fixture budgets, keep deliberate boundary coverage, no production knob for peer-wait.
- C's denominator claim rejected: bun runs files one at a time with tests concurrent inside a file. The JUnit per-file times sum to 192.9s against a reported wall of 191.9s, so per-file times are wall time. Under fleet load the suite runs 190-235s, so removing ~40s of fixed waits is ~17-21%, not a flat 23%.
- C's run-check claim rejected: src/run-check.ts runCheck refuses an argv equal to a merge_checks entry's parsed words, its sh -c text, or its setup form. With test in merge_checks, run-check refuses the exact suite command. Seats keep narrower runs only.
- B withdrew O2 as a broad saving (~1.9% of merge verify time).

## Task
1. For each of O1-O5 give: keep or drop; expected gain with its named baseline and whether it meets 20% on cost, speed or quality; size (files, rough lines); main risk and what removes it; dependencies on other options.
2. Add at most two new candidates outside full-suite test time (for example seat model cost, repair rounds, phase wait time, prompt or skill size), each measured from recorded data with path and method. Only add one you believe clears 20% on its own named baseline.
3. Give your final ranked list.

You may run read-only commands and targeted single-file tests. Do not run the full suite. Do not edit repository files.

Reading rule: read process text by named section, locate the section first, batch reads with bounded output, and read held content at most once per session. Unread, changed or compacted-away content stays readable. Name sections, never line ranges.

Write to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/debate-B.md, under 80 lines, in one write when finished.
