# Merged opening map (A, B, C)

Code at origin/main 083264e. Framework log counts from C (computed 2026-10-09): 100 merge exits since 10-07, 54 merged, 46 bounced, merge stay median 3.3 h (mostly queue wait), bounce-to-return median 0.34 h, 12 bounces at `fix_rounds: 0`. Seed classes (unverified): DEFECT 12, DRIFT 10, BASE 9, INFRA 3 of 34.

## Model (A,B,C)
- Constraint: one merge turn per repo (locked, merge-turn chart). Throughput = turn runs/h x share of green runs x leaves per green run. Every red run on the turn is lost system throughput.
- Missing stock: main health. Nothing records "main red at sha X" (src/state.ts:42-85, src/turn.ts:37-73).
- Reinforcing loops: drift (queue wait -> conflicts -> persistent `solo` src/next.ts:1179-1181 -> back of queue src/phase.ts:152) (A,B,C); red-main cascade (merge-issue:65 routes every red to check.fix, check.fix ends `failed` on old base implement-issue:38) (A,B,C); late gate (merge_checks first met at the turn, repair proved by `checks` only, implement-issue:84, check-issue:85) (A,B,C); batch multiplier (first batch = whole queue src/next.ts:1020, limit dies with holder src/phase.ts:154) (A,B,C); host load (unproven, test-runs lock) (A,B,C).
- Balancing loops missing or weak: repair cap ignores merge bounces (src/phase.ts:151,302) (A,B,C); split halves around holder, no log record (src/phase.ts:788-798) (A,B,C).

## Leverage and picks
1. Red-main hold (A,B,C). On a red gate, run the failing command on fetched main. Red there: leaf stays in `merge`, the command records the red main sha, the merge turn for that repo waits; no check.fix. Covers #64, #67, BASE part of #62.
   - Clear rule differs: auto-clear when main moves (C) vs clear only on comparable green proof on new base (B). A: either, with a named owner printed.
   - Repair owner differs: operator or holder B fix-forward (merge-issue:55), fix leaf passes the hold by operator name (C); named repair owner plus bypass (B).
   - Latch only on a completed comparable base run (test-runs base-red rule) (B,C).
2. Gate proof before the turn (#71).
   - Bounce repair reruns the command that bounced it before re-review (B,C). One prose line in implement-issue:78-84.
   - Every leaf runs merge_checks once before entering merge (A). Reverses the check-reruns lock ("merge_checks run only at merge"), adds about 1 full run per leaf in parallel seats, raises host load. B, C: defer until attempt data shows DEFECT is the top remaining class.
3. Count merge bounces toward `fix_rounds`, after item 1 lands (A,B,C). Gives B-only re-review for free (src/routing.ts:54). B: count only bounces attributable to the leaf. C: count every merge->check.fix after the hold exists.
4. Attempt records in log.jsonl: attempt id, members, outcome green/red/split/reuse, gate wall time (A,B,C). Additive, needed to prove "faster at same quality".
5. Batch size (#68) differs: repo-level window, start 2, +1 on green, halve on red (C, Zuul and GitHub merge queue sources); simple fixed maximum first (B); wait for item 4 data (A). Attempt-scoped `solo` instead of permanent (A,C).
6. Dependents-first order (#65, #70): dispatch sort key safe (A,B,C). Merge queue key must never move a running holder (B,C): freeze it at merge entry or skip.
7. Clean gate tree (#63) differs: fresh detached checkout of the candidate, rank 1 (B); `git clean -fd` in the leaf worktree, rank 3 (A); off route, seen once, fixed forward, setup cost on the serial turn (C).

## Off route (proposed)
- #69 host load limit: test-runs lock, reopen only on a traced load failure; item 4 gives the data (A,B,C).
- #73 lessons to guards: separate destination, separate chart (A,B,C).
- Parallel merge turns, seats pushing, affected-only reuse, shared node_modules: locked (B,C).

## Pitfalls (A,B,C unless tagged)
- Counting bounces before the red-main hold fails good leaves. Removed by order: item 1 before item 3.
- Hold stuck on flaky main. Removed by latching only on completed comparable base runs.
- Reordering moves a running holder and its `merged` is refused (B,C). Removed by freezing priority at merge entry.
- Prose rules drift (seats already break the deferral rule 166 times). Removed by the command owning hold state (C).
- Long-running akrogon processes keep old code after a fix lands (B,C). Removed by an operator restart step at handoff.
- Metrics gamed by abandoned work (B). Removed by tracking landed leaves per gate-hour with failures and main regressions.

## Points where slots differ
D1 gate before turn: every leaf (A) vs bounce repair only (B,C).
D2 clean tree: rank 1 fresh checkout (B) vs git clean (A) vs off route (C).
D3 batch: window (C) vs fixed max (B) vs wait for data (A).
D4 hold clear: main moves (C) vs green proof (B).
D5 bounce counting: attributable only (B) vs every post-hold bounce (C).
