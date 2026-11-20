# Merged map: watch-live-speed (A, after B, C, E)

## Urgent
- U1 The live test removed ~/.pi/agent/skills/watch-issues and ~/.agents/skills/watch-issues and did not restore them (E; A checked: both missing, ~/.claude/skills link intact). Breaks the readiness stop_line on outside writes.
- U2 Seat A is still launching paid runs: 22-23 vs N1's 8 (B lower bound 20, C 23, E 22); a claude-shell run was live at A's check.

## Root cause of the shell failure
- F1 The timer never sends the tick (E, C; B: no send evidence). Watcher screens show no tick text (E).
- F2 Leading cause (C, A spot-checked the code path): tests/e2e/watch-tier.ts sets `worktree_root: leafTemp` while the tier's runtime folder (`-rt`, holding the hc socket) and helper folders also live in leafTemp. The shell shape runs `akrogon unpause` (watch-live.e2e.ts:398), whose pass runs reconcile's `dropUnowned` over the worktree root and deletes them. The timer's hc reads then fail and timer.ts returns 'stay' silently. The root shape never unpauses, so it passed. Test-machinery defect, not pin or receipt design.
- F3 Silent error handling hid it: timer.ts swallows HcError, tick.ts ends in a catch-all no-watch (A, B, C, E).
- F4 Secondary defects: SKILL.md tells the model `akrogon status <root>`, which fails "Missing leaf" and doubles calls (C, E); exact model-call counts in asserts (E, C); timer.ts gate changes made without evidence (B, C, E); log-tail.ts misreads pi `exec` records, so the watcher sees `exec #- -> unknown` (C).

## Why slow and over the grant
- F5 Worker U1 held all 7 scripts: ~105 min, 57% of implement (B, C, E).
- F6 Blind paid loops: repeat runs with the same failure, no free reproduction, whole batch launched with no stop after the first red (A, B, C, E).
- F7 Most reds were test or setup bugs a free run finds (E: 13 of 20).
- F8 Grant was text only: plan forecast 9 of 8 and called it a count, not a stop; no count lines written (B, C, E). Paid red run at plan spent 1 (B, C, E).
- F9 Cells long by design (every behavior in every cell, ~345 s) and serial in one hc session (A, C, E).

## Running leaf
- O1 Let finish: rejected (A, B, C, E).
- O2 Stop, fix in place, new grant for one clean pass (E recommends; C fastest).
- O3 Stop, re-chart: tier-parallel prerequisite, product leaf, live-proof leaf blocked by both (C recommends; B similar).
- Disagreement: E rejects shipping the product before the live proof (the failing part is the unproven part). C's split keeps the product leaf free-proven and gates merge-to-use on the live leaf.

## Faster and better
- C1 Paid cells prove only what a real harness alone shows; timer mechanics run on stand-ins with real hc (E; standing design already says so, not applied).
- C2 Coverage audit per launch shape for every hc signal read, test-tier wiring included (C, E; extends proof-limits-handoff).
- C3 Grant sized as cells x (1 + retries), stop or count stated (E, B).
- P1 No paid red run at plan (B, C, E; paid-proof-bounds 1a, not applied).
- P2 Assert receipts and lower bounds, never exact model wording or call counts (E).
- P3 Balanced worker units (C, E).
- I1 Free preflight, then one paid canary, then the rest (A, B, C, E).
- I2 Same-symptom stop: no third paid run on one error without a free reproduction (E, B, C).
- I3 Every refusal or skipped send prints its reason (A, B, C, E).
- T1 Parallel tiers only after full isolation: session, socket, worktree root, trust and skill files (B, C, E; naive session-name change races home files).
- T2 Tests never edit operator home (E).
- E1 Enforcement: visible launch counter in run-check (E), per-grant reservation (B), hard cap (C). Any hard stop reverses operator locks in grant-run-count 2b and paid-proof-bounds; operator decision.

## After rebuttals (B, C, E)
- F2 confirmed (B withdrew the readiness diagnosis, E withdrew the design-defect class; E read /tmp/watch-timer.log and /tmp/akr-e2e during a live run).
- U2 updated: at least 25 implement launches plus 1 at plan (B, E); still running at 18:40 CET.
- U1 wider: the test writes /tmp/akr-e2e and /tmp/watch-timer.log outside the leaf temp (E). The abandoned agy-shell capture had no cleared record, which left the links missing (C).
- New product defect in committed timer.ts: a due held behind a busy turn is sent only at the next boundary, up to 20 minutes in production, against criterion 4 (C, B, E).
- No shell cell has run past unpause, so second pause, agent exit and no-stray-tick steps are untested (E).
- Tag fixes: F4 exact counts (E only); E1 hard cap (A, not C; C proposed a repeated-red flag).
- Split needs a mechanism: merging the product deploys it and removes the Claude cron path, so keep cron until the live proof passes or land the tier first (B, E). Frozen test files block fix-in-place without an amendment (C).
- C1 narrows signpost 6a and needs the operator (B, C). E rejects a parallel-tier prerequisite leaf (saves ~10 min once C1 cuts cells to ~90 s); B and C keep it isolation-first.
- Kept from E: record-then-judge (assert over recorded evidence so a test-code bug costs a free re-judge) and collect all failures per cell (cross-leaf-proof 3a, not applied).
- B: any counter reopens grant-run-count 2b; count at the paid boundary, not at run-check start.
