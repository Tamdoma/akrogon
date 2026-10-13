# Measure and revisit: blind notes C

## Q1. What to record, and how to read it

**Pick 1a: add a command-owned, append-only `issues/timings.jsonl`, read through a new `akrogon timing` command.** Keep `log.jsonl` as phase transitions only. Record:

- `prompt_delivered` and `prompt_failed` from `dispatchSlot`: timestamp, slug, phase, slot, session; for merge, attempt ID, holder, members and queue place.
- `check_started` and `check_finished` from `run-check`: run ID, slug, phase, check name, start, end, duration, exit code and log path. Do not record argv or environment.
- `merge_batch_created`: attempt ID, built-on revision, holder and members. Join the existing `merge-attempts.jsonl` for outcome and end.
- New leaves get a full ISO `created` timestamp. Date-only legacy values are unknown, never midnight. First plan prompt is measured plan-work start.

`akrogon timing <slug>` joins all three files and prints, per phase, waiting, prompted time and check time inside it. `--last <n>` aggregates a cohort. `status` only adds the current split and “revisit due”. Cost: one schema and a three-file join. “Prompted” must not be renamed proven working; akrogon cannot observe continuous seat work.

**Rejected:** 1b, mixed event types in `log.jsonl`: its Zod schema is strictly a phase move, so this forces a migration through existing log consumers for no data gain. 1c, derive from state, check filenames and transcripts: `prompted_at` is reset, check start is thrown away, and transcript formats differ by harness. 1d, a generated report as the record: stale immediately and loses crashed or unfinished runs.

**Evidence:** better-than-training, akrogon source read 2026-10-12. `src/log.ts:9-63` handles only transitions. `src/next.ts:542-551` captures `prompted_at` in state; `src/phase.ts:151-162` clears it each move. `src/run-check.ts:108-126` knows check start, result and slug, then deletes the run directory. `src/status.ts:348-366` shows the last ten transitions, not a split. `src/state.ts:82` already allows `created` as a string.

**Pitfalls:** Timing writes must not undo a prompt, check result or phase move; a failed append marks that leaf's coverage incomplete and is surfaced by the reader. Duplicate or resettled prompts are removed as a risk by counting the first delivered prompt per phase visit and slot. Crashed checks remain visible because start and finish are separate events. Direct commands bypassing `run-check` will be absent, so the reader must label coverage “configured checks only” rather than claim all test time.

**Missing question:** Should repo-paused, prerequisite-blocked and `failed` time be excluded from waiting, or reported as separate categories in every comparison? This changes leaf rankings and Q2.

## Q2. What reopens leaves-as-chunks

**Pick 2a: a predeclared 20-leaf cohort and a gate that reopens the question for an operator-decided trial, not automatic adoption.** Start at a marker when timing, the deduplicated framework checks and committed #87 are all active. The cohort is the first 20 framework leaves whose first plan prompt is after the marker and whose first implement-exit diff is at most 600 changed lines. Follow all 20 to a terminal state. Any material lifecycle, check, selector, merge or model change restarts the cohort.

Define fixed overhead `F = created-to-merged elapsed − implement prompted time`. It is the plan, review, repair, fix and merge cost another leaf would repeat. Reopen only if at least 18 of 20 merge, at least 19 have complete timing, median `F` is at most 35 min, at least 15 of 20 have `F` at most 45 min, total merge ejections are at most 2 and total merge entries at most 22. `akrogon timing` prints pass, fail or insufficient. Slot A runs it when the cohort closes and presents the component split; the operator decides whether to authorize a leaves-as-chunks trial. Cost: the decision waits for 20 eligible leaves and for any restart.

**Rejected:** 2b, any rolling 20 merged leaves: mixes sizes and regimes and invites cherry-picking. 2c, a calendar wait: leaf volume and load vary. 2d, automatic adoption on a pass: 20 leaves cannot prove the ejection rate or the chained-leaf outcome. 2e, total time or p90 as the gate: implement size dominates total time, and p90 at n=20 rests on the top two leaves.

**Evidence:** better-than-training, framework `issues/log.jsonl` and `merge-attempts.jsonl`, my recalculation 2026-10-12. Leaves at most 600 lines merged Oct 10-12: n=18, post-implement median 50.2 min, p90 220, ejections 0.17 per leaf, merge entries 1.17. Oct 2-9: n=35, 113.9 min, ejections 0.69. Adding INTAKE's 4-9 min plan median puts current `F` near 55-60 min, so the gate needs roughly a 20 min cut. At n=20 the 95% median interval is about the 6th to 15th ordered values, so “15 of 20 at most 45” is the trustworthy form. It does not prove ejections: 2 of 20 has a Wilson 95% upper bound near 30%. Adoption needs the trial or 50 leaves, where 3 ejections bounds near 16%.

**Pitfalls:** Size is fixed at first implement exit so later repair growth cannot move a leaf out of the cohort; report all sizes beside the gate. A faster `F` bought by weaker selection is guarded by the ejection and merge-entry caps, but only as a reopen trigger. Leaves stuck on prerequisites or operator input can distort `F`; Q1's missing category rule must be settled before the marker, with no post-hoc exclusions.

**Missing question:** Does reopening cover dependent chains, independent chunk-sized leaves, or both? A chain repeats `F` serially while independent leaves can overlap, so the trial design and the acceptable `F` differ.
