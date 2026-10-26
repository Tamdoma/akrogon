# Debate brief, slot C (second run)

Operator update (verbatim): "We can use all slots suggestions, so make all 3 of you agents debate them and then we can get a full list, not just one thing."

The goal is a full ranked list of small, separately deliverable improvements. Your own map is the one you just wrote. Read also:
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-merged.md (options O1-O5 from A, B and an earlier C run)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/map-rebuttal-B.md and /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/debate-B.md (B's rebuttal and B's ranked list)

A's rulings so far, with evidence:
- O1 now means: shorten the test-supplied '11' budgets in tests/peer-wait.test.ts (O1a), split the serial nine-case "named target equivalence" test in tests/next.test.ts (O1b), shorten the two 10s discovery-deadline waits in tests/session-routing.test.ts only if production cannot inherit the seam (O1c).
- Files run one at a time: A ran the full suite with --reporter=junit; per-file times sum to 192.9s against a reported wall of 191.9s. concurrentTestGlob makes tests concurrent inside a file only. So per-file time is wall time, and peer-wait's 22.8s file time is real wall time.
- run-check refuses an argv equal to a merge_checks entry (src/run-check.ts runCheck), so O3 removes boxed whole-suite runs at leaf stage.
- O2 is dropped (~1.9% of merge verify time).
- Your fail-fast candidate is now O6. A re-counted it: 48 format-red completed runs, 35 format-only, 2.01h of test time inside them.

## Task
1. For each of O1a, O1b, O1c, O3, O4, O5 and O6, plus any other candidate from your map you still back: keep or drop; expected gain with its named baseline and whether it meets 20%; size; main risk and what removes it; dependencies.
2. Where you disagree with B's ranked list, say why with evidence.
3. Give your final ranked list.

You may run read-only commands and targeted single-file tests. Do not run the full suite. Do not edit repository files.

Reading rule: read process text by named section, locate the section first, batch reads with bounded output, and read held content at most once per session. Unread, changed or compacted-away content stays readable. Name sections, never line ranges.

Write to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c8a48fc5-8a0e-4cc6-bd95-474f9490fb19/scratchpad/door/debate2-C.md, under 80 lines, in one write when finished.
