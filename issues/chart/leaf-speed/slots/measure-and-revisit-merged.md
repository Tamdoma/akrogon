# Merged notes: measure-and-revisit (A, B, C)

## Q1. What akrogon records and how it is read

Options:
- O1 (A,B,C picks O1) A separate command-owned append-only timing record plus a read-only timing command. `log.jsonl` stays phase moves only. Records: prompt delivered/failed per slot and phase visit (B,C), first-seat completion that today returns "recorded" without a log row (B), check start and finish with name, exit, duration, log path, including install/lock time (B,C), merge batch created with holder, members and excluded candidates with reason (B,C), full ISO `created` for new leaves (C). Reader prints per phase: entered-to-prompt waiting, prompt-to-exit "prompted time" (never called proven work), check time inside it, plus coverage gaps (B,C). Status adds only the current wait/prompted split (C). Cost: one schema, a three-file join, instrumenting dispatch, completion and run-check.
  - A's first view was O2. Withdrawn: B and C show it loses the first seat's completion and the initial plan prompt.
- O2 (rejected A,B,C) Copy `prompted_at` into each log row. Loses initial plan, earlier deliveries and first-seat completion (`src/phase.ts:151-162` resets it, `transition` returns without `logMove`).
- O3 (rejected B,C) Mixed event types in `log.jsonl`. Its Zod schema is phase-move only (`src/log.ts:9-22`), forcing a consumer migration.
- O4 (rejected A,B,C) Rebuild from transcripts and check filenames. Harness-specific, `run-check` discards start time (`src/run-check.ts:108-126`).

Evidence: better-than-training, akrogon source read 2026-10-12: `src/next.ts:542-551` sets `prompted_at` in state only. `src/status.ts:348-366` shows state and last ten moves. Framework 245 h before merge prompts could not be attributed.

Pitfalls and removal:
- A timing append failure must not undo a prompt, check or move. The reader marks that leaf's coverage incomplete (C).
- Retries and re-prompts: count the first delivered prompt per phase visit and slot, give each delivery a pass id (B,C).
- Overlapping A and B review: wall-clock union, not summed seat time (B).
- Crashed checks stay visible because start and finish are separate events (B,C).
- Batch checks counted once for the batch, with covered leaves (B).
- Criterion proofs run outside `run-check` are absent. The reader labels coverage "configured checks only" (B,C).

## Q2. What reopens leaves-as-chunks

Shared (A,B,C): a predeclared 20-leaf framework cohort starting after the loop fixes and timing land, including failed and stalled leaves, A prepares the readout and the operator decides a trial. No automatic adoption.

Differences in the gate:
- B: post-implement median <= 35 min, p90 <= 60 min, ejections <= 2/20, full verify runs <= 1.25 per delivered leaf. Labelled targets, not break-even.
- C: cohort = first 20 leaves with first-implement-exit diff <= 600 lines. Fixed overhead F = created-to-merged minus implement prompted time. Pass if >= 18 of 20 merge, >= 19 have complete timing, median F <= 35, >= 15 of 20 have F <= 45, ejections <= 2, merge entries <= 22. Any material lifecycle, check, selector, merge or model change restarts the cohort.
- A: agrees with C's F (it is the cost a new leaf repeats) and C's quantile form ("15 of 20 at most 45") over B's p90, since p90 at n=20 rests on two leaves (B,C both note this).

Evidence: better-than-training, framework `issues/log.jsonl` recomputed 2026-10-12. Since Oct 10, leaves < 600 lines: median 42.7 / p90 290 (B, n=17) or 50.2 / 220 (C, n=18, different boundary). Four post-#87 leaves: 33.0 / 37.3, 0 ejections, none under 200 lines (B). Duplicate checks removed 21:07Z, zero deliveries since (B). Current small-leaf F about 55 to 60 min, so the gate needs about a 20 min cut (C). Statistics: 0 of 20 ejections has a 95% upper bound of 13.9% (B), 2 of 20 about 30% (C). 20 leaves support a readout, not proof. Adoption needs the trial or about 50 to 60 leaves (B,C).

Pitfalls and removal:
- Cherry-picked cohort: predeclared start marker, consecutive leaves, failed ones included (B,C).
- Size drift: size fixed at first implement exit (C).
- Faster F bought by weaker tests: ejection and merge-entry caps (B,C).
- Paused, blocked-on-prerequisite and operator-held time distort F. Category rule must be set before the marker (C).

## Open questions found
- (C) Is paused, prerequisite-blocked and failed time reported as its own category or counted as waiting?
- (B,C) What does the trial compare: chained leaves, independent chunk-sized leaves, or both? Chains repeat F in series.
- (B) Must criterion proofs run through the same check recorder so "test rounds" is complete?

## Differences
- Gate metric: B post-implement median and p90. C fixed overhead F with a quantile count. A sides with C.
- B records waiting-reason changes and config revision. C limits to prompt, check and batch events and excludes argv.
