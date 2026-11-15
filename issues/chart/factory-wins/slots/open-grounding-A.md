# Open grounding, slot A (2026-11-09)

Facts gathered at Open, before the signposts answer. "checked" means A ran the command itself; "reader" means a Haiku reader reported it and A has not spot-checked it. Reader scratch files: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6cc72dfc-1827-4b47-beb4-97de2f0e2718/scratchpad/{flow,usage}/`.

## Stocks

- G1 (checked, `git show <commit>:<file> | wc`): 2026-09-12 to 2026-11-09, skills `.md` words 9,327 → 38,728; chart-issues words 2,950 → 16,087; `src` lines 2,255 → 13,150; `tests` lines 5,280 → 40,052. Mid points: 10-10 26,225 / 9,143 / 5,689 / 20,437; 10-24 32,973 / 12,538 / 11,053 / 36,549.
- G2 (checked, `find issues/closed -name state.yaml`): landed leaves akrogon 276, framework 817, lingua-relay 72, boulevard-automation 23, pi-extensions 21, blepsis 11, mdcny 8, herdr-setup 6, lens 4, Himne 4, varhop 4; total 1,246. Charts: akrogon 125, framework 269.
- G3 (reader): skills total 92,191 words including fixtures; SKILL.md words: chart-issues 8,214, implement-issue 4,743, check-issue 4,167, merge-issue 2,825, plan-issue 1,938. The `.env` rule, the grant rule and the run-check/`akrogon log` rule are restated in all four lifecycle skills.

## Flows and delays

- G4 (checked, `akrogon timing --cohort --since 2026-10-25T00:00:00Z` in framework): `F` is joined-to-merged minus prompted implement time (src/timing-report.ts memberOf). 11 of 19 merged leaves spent more than 60% of F waiting for a merge turn; largest 11h54m of 12h57m. Verdict `fail`. In akrogon the same wait is about 1 minute; verdict `insufficient`.
- G5 (checked, issues/log.jsonl): 252 leaves merged; 121 entered check.fix or check.repair (67 check.fix, 104 check.repair). Moves into: check.review 354, implement 271, merge 269, merged 254, check.repair 139, check.fix 106, failed 35, plan.synthesis 8.
- G6 (reader): akrogon lead time first record to merged, median 0.36 h, p90 1.67 h, max 10.68 h. Elapsed share by phase: implement 47.5%, failed 19.1% (20 leaves), check.fix 12.5%, check.review 10.3%, merge 5.5%, check.repair 4.8%. Final fix_rounds 0 → 185 leaves, 1 → 49, 2 → 10, 3+ → 8. `fix_rounds` limit is 12 (`akrogon config`, checked).
- G7 (reader): a live seat is reused across phases by sending the next prompt (src/next.ts dispatchSlot); the prompt is `<skill> <slug> slot= phase= leaf=` (src/next.ts promptFor). Routing: plan.synthesis A, implement A, check.review A and B, check.repair B, check.fix A, merge B (src/routing.ts).

## Tokens

- G8 (checked, first line of each USAGE.md): 82 charts, 11,948,481 output tokens; A 7,806,602, B 2,055,887, C 1,940,967, D 145,025; median 90,222 per chart. herdr-panels and tasks-panel carry the same table.
- G9 (reader): akrogon records no token usage for lifecycle seats. Five recent leaves measured from transcripts: output 33,096 to 208,889 per leaf, cache read 3.7M to 34.3M per leaf, 57 to 292 calls.

## Earlier decisions that bound the map (reader digest of 35 charts)

- Declined or rejected: prose caps on door text (door-cost, operator "without the caps"); any clock, watchdog, elapsed trigger or numeric size gate (leaf-run-stalls, seat-stall-detection, stuck-seat-recovery); heavy-run slot (test-runs, merge-load-flakes); affected-only check reuse (check-reruns); central herdr read cache and compiled binary (git-calls).
- Deferred with a trigger: speculative testing of the next leaf in the merge queue (merge-stacks 4a); leaves-as-chunks behind a 20-leaf gate (leaf-speed); fresh-session rebuttals pending a paired quality trial (token-spend); fresh context for A as operator practice (usage-windows).
- Measured, not acted on (system-flow): of 102 review findings on 31 leaves, 45% real defects, 24% missing test or proof, 15% evidence format; pi polling cost 8.8 h sleeping over 134 polls.
- Held charts: framework-test-scope (2026-10-13), host-run-load-names (2026-10-24).

## Operator-placed sources

- autopilot-night-2026-10-16.md (checked): 2026-09-16 to 10-16, 270 rounds, 582 questions, recommended option taken on 518 (89%), 260 clarification requests of which 210 were `elid`/`eli`.
- systems-thinking-field-manual.txt (reader digest with line refs): capstone method lines 2813-2826 (behavior over time, stocks and flows, loops, delays, binding limit, traps, leverage); leverage list 2370-2392; bottleneck first 1759-1766; five focusing steps 1688-1690; review loop bounded at three iterations 3041-3043; monthly archetype check 2306-2314; "watch it run before changing anything" 2850-2851.
