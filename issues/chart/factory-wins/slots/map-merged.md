# Territory map, merged (2026-11-10)

Merged by A from slots/map-A.md and slots/map-B.md, written blind to each other. Tags name the slots that hold a point. "reader" numbers come from Haiku readers run 2026-11-10 for A (scripts under `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/1160556f-c628-4449-8d45-fa8fb6899642/scratchpad/map/`); "checked" means the named slot ran the command or read the lines. Cohort: the 35 akrogon leaves first merged on or after 2026-10-25. Ranking follows signpost 1a.

## System

- (A,B) Stocks with measured growth (A calls them stocks that only grow; B does not): skill text 9,327 → 39,540 words in 8 weeks; the four lifecycle SKILL.md files hold 14,311 words (B); tests 48 → 120 files since 10-10; the flaky list 129 rows, 24 with a flip since 11-01 (B checked).
- (A,B) Loop R1: failure → chart → more rule text, tests and code → more to read and keep in step → next failure. B holds this as a hypothesis: the stocks coexist, the causal links are not proven.
- (B) Loop R2: a flaky red provokes retry and diagnosis; since 11-01, 35 of 84 completed verify rows ran red, 3,241 s of 7,270 s (not all avoidable).
- (A,B) The review stays. (A) 69 Fix rows on 20 leaves, 44 real defects, 14 missing test or proof, 6 evidence or format, 5 other, 49 repaired by B (A reader; B has not checked this classification).
- (A,B) No current akrogon binding stage has been established by these measurements. (A) merge wait about 1 minute, checks 23% of a leaf's elapsed time at the median (A reader). (B) no demonstrated current akrogon merge queue; 253 merged slugs, 121 with repair visits.
- (B) Q1: the cohort includes the move to hc (2026-11-07/08), so some costs are one-time migration costs.

## Small wins

- W1 (A) CLI flags. `akrogon <verb> --help` prints a stack trace and exits 1 (src/akrogon.ts strict parseArgs); `akrogon timing --flow --since 2026-10-25T00:00:00Z` fails with a ZodError while `--cohort --since` takes the same value (A checked). Risk: none found.
- W2 (B) Verify-survival test. `a verify pass survives its caller being SIGKILLed mid-check…` has 5 flips, latest 11-08; src/verify.ts publishes the receipt before `git worktree remove`, and tests/run-units.test.ts polls only the receipt. Change: wait with the existing `waitInactive` helper for that run's service. Risk: waiting on the wrong service hides a leak; use the pass's run id. Touches verify-lifetime Taken point 4 (follows it).
- W3 (B) Dependent-dispatch flip. `merged phase closes tab on typed next and starts the dependent` has 2 flips, latest 11-09; same tree ran red (64.43 s) and green (65.09 s); the red log shows attempts.A 0 where 1 was expected at 4.36 s. Root cause not established, so diagnose first; may be a product race. Risk: a longer wait could hide a broken contract.
- W4 (B) Transcript length. src/transcript.ts `transcriptEnd` reads the whole JSONL to get its byte length, and `transcriptRecords(path, from)` reads the whole file before slicing; recorded transcripts run to 9,117,037 bytes. Change: file-size metadata, then a suffix read if its reader stays simple. Risk: a short read turning a real operator input into absence; keep door-cost's late-input refusal.
- W5 (B) Implement references. brief-template.md (931 words) and worker-protocol.md (1,104) are needed only when delegating, but the opening line of implement-issue requires re-reading every reference at every prompt; 52 of 255 closed plans mention serial-solo (lower bound). Change: resolve that contradiction in the opening line. Risk: a later mode change skipping worker rules; the conditional read at the delegation point stays.
- W6 (A) Flaky list outflow. 129 rows and nothing removes one; each door open reports them. (B) differs: the list is cumulative history, and the real outflow is fixing named flakes (W2, W3). Open: whether a row may leave the list, and on what event (a time expiry would touch the "no clock" decisions).

## Big wins

- W7 (A,B) One source for the shared lifecycle rules. The grant paragraphs total 1,074 words and the `.env` paragraphs 281 across plan, implement, check and merge (B checked; A reader 238/237/311/288 and 66 to 78). Only 80 words are exactly identical (B), so the copies already differ. grant-run-count had to edit all four for one rule (A). Change: one required policy reference for the shared invariants; phase-specific actions and record targets stay local. Risk: an over-broad extraction erases a real difference (B). Fewer maintenance sites are the first benefit; (A) no token saving per seat, since each seat reads one copy today; (B) per-seat token savings are unmeasured. B ranks this its strongest structural candidate.
- W8 (A,B) Read only what the current step needs. Lifecycle: check-issue 4,373 words including 910 for check.repair and 175 standalone, implement-issue 4,948 including 876 for check.fix and 298 standalone; whole-file reads on 143 prompts since 11-01 are an exposure of 591,857 words, an estimate, not observed tokens (B). Door: Direct route, Autopilot and Handover are 3,761 of 8,387 words of chart-issues/SKILL.md, read by every door session (A reader). Change: fresh reads of the preamble, shared context, the current phase or mode, and followed references. Risk: a rule living outside its apparent section; needs a contract walk first (B). Real dependency: after W7 if W7 moves text (B). token-spend levers scoped selective reading to consultants; this reads the selected part fresh and does not revive its deferred comparison (B).
- W9 (A) Question rounds understood the first time. Charts opened since 10-17, 27 door transcripts: 77 of 102 operator answers came directly after a clarify message; 132 exact `eli`/`elid`/`scr`/`foc`/`ref` messages, 123,472 output tokens of rewrites; W45 had 46 alias messages for 39 answers, after round-drawings and direction-round landed (A reader; the "other clarify" class is a heuristic). (B) L1: questions.md already requires plain language, so apply that rule and add no overlapping prose. Open: what in the round shape defeats the existing rule. Word caps stay declined (door-cost O6).
- W10 (A,B) Keep seat token use. Nothing in `src` records tokens; 98 of 184 recorded transcript paths are already gone (B checked); 32 prompts have no session, 27 of them in check.review, and 31 of 35 merge windows have no prompt because it is recorded under `merged` (A reader). Change: (A) record the session on every prompt and keep a per-leaf, per-seat usage line with the parsers chart-usage.ts has; (B) keep usage under the verified identity when one is available and mark unavailable evidence, telling apart command-only merges, real seat prompts, completion broadcasts and unavailable transcripts. Risk: double counting across retries, compaction, shared sessions and workers; one more thing to maintain (B Q4: which recurring decision does it change?).
- W11 (A) Fresh session for implement. Slot A keeps one session from plan.synthesis into implement and check.fix: in 31 of 33 leaves the first implement call carries the whole plan conversation, 45k to 438k tokens, about 100k at the median; implement is 40.6% of the 952.8M context tokens read over 6,012 calls (A reader, table spot-checked by A). Change: implement starts a new session that reads plan.md, brief.md and design.md. Risk: what the plan knew but did not write is lost and returns as repairs. Needs W10's record and the paid before/after run (needs row N1, cap pending). (B) did not propose a reset and has not assessed this new baseline. Outside sources: Anthropic, "Effective context engineering for AI agents" (2025-09-29, read 2026-11-10): recall falls as context grows, and long tasks continue from a summary or written notes in a new window; Horthy, "Advanced Context Engineering for Coding Agents" (2025-08-29, secondary accounts only, essay not read): research, plan and implement each in a fresh window, with the warning that compaction drops details whose importance shows later.

## Measured and dropped

- X1 (A, retracted) Dropping slot A's self-review. 35 A review visits read 64.8M context tokens, but 10 of A's 24 Fix rows were not in B's review, 7 of them defects, on 8 of 35 leaves (A reader follow-up; several "no" rest on B's repair notes, medium confidence). The self-review earns its place. (B) agrees no review is cut.
- X2 (A, retracted) `fix_rounds` miscount. watcher-on-hc shows the counter rising once on check.repair → check.fix and staying on re-entry after `failed`, which is the same round (A checked). Not a defect.
- X3 (A,B) Further check-time cuts. suite-time and suite-repeats already delivered them; whole-receipt reuse works (3 merge-phase test runs for the leaves since 11-02, A checked; B L5).
- X4 (A) The cron watcher beside the event listener: no cost number, listed only.
- X5 (B) M8 shared evidence lookup in `akrogon flaky`: the whole command takes about 0.05 s; too small.

## Earlier decisions with new numbers (7a: listed, the operator reopens by name)

- E1 (A) Who may edit tests. 4 of the 15 moves into `failed` since 10-25 name the rule that implement may not edit or write tests (engine-on-hc, notices-on-hc, chart-door-on-hc twice), plus 3 Fix rows that were stale test expectations (A checked and reader). All four sit in the hc migration epic, so they may be one-time (B Q1). agent-test-rules test-authority and system-flow repair-loop stay as they are unless named.
- E2 (A) Testing the next leaf while one merges (merge-stacks 4a). In framework 11 of 19 merged leaves spent over 60% of non-build time waiting for a merge turn, longest 11h54m (A checked 2026-11-09). The deferral's own trigger is a probe showing two full suites run at once on this host without slowing or flaking, which has not been run. (B) L2: a consumer observation, recorded for framework, no akrogon-owned fix shown.

## Step on main, not a leaf

- herdr-panels and tasks-panel have shown "Unpacked" since 2026-11-03 and carry the same USAGE table (A reader, `diff` clean past line 1; B has not checked it). Packing is storage only: `akrogon pack` moves a chart's `.log` files into one verified archive (src/pack.ts, A read 2026-11-10). Whether the shared table is counted twice is a separate accounting question that packing does not answer.

## Split

- (A) small wins (W1, W2, W3, W4, W5, W6) → question rounds (W9) → rule source and reading (W7 then W8) → seat tokens and fresh session (W10 then W11).
- (B) quick chart (W5, W2, W4) → W7 → W8 after it → W3 alone → W10 only if the operator values the decision it enables. No chart for W9 or W11.
- Where the slots differ: W9 as its own chart (A) or the existing rule applied (B); W11 charted (A) or not (B); W6 a list outflow (A) or only named fixes (B); W3 inside the quick chart (A) or alone (B).

## After B's rebuttal (slots/map-rebuttal-B.md, 2026-11-10)

- Attribution above is corrected for RB1, RB2, RB5, RB6 and RB7.
- (A) concedes RB3: W6 stays listed until a reporting defect or a repeated reading cost is measured. No list outflow is charted.
- (A) concedes RB4 in part: W3 gets its own chart because its root cause is unknown, and under signpost 1a the rule source (W7, fewer parts) goes before question rounds (W9, operator time). W1 stays in the quick chart: A ran both failing commands on 2026-11-10.
- (A) concedes RB6 in part: W11 is not charted now. It stays listed as the first decision the usage record (W10) serves; the paid comparison is defined only then (total usage across affected seats, findings and decisions kept, extra repair work). The Horthy essay is not counted as evidence.
- Still differing: (B) opens no chart for W9 and opens W10 only on the operator's word; (A) charts both, W9 starting from the cause and adding no rule text before the cause is known.
- Split after rebuttal (A): quick fixes (W1, W2, W4, W5) → dispatch flake (W3) → rule source then reading (W7, W8) → question rounds (W9) → usage record (W10).
