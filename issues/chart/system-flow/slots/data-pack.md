# Data pack: week before vs last 24 hours

Built 2026-10-15 06:30Z by A from these raw files (read them yourself to go deeper):
- Phase moves since 2026-09-11: `/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl`, `/home/ivan/Work/infra/akrogon/issues/log.jsonl` (fields: ts, slug, from, to, slot, attempts, fix_rounds, verdict).
- Visits, prompts, waits, checks since 2026-10-12 23:41Z: `<repo>/issues/timings.jsonl` (kinds: visit_start, prompt, wait{reason: merge_turn|prerequisite|none}, check_start{wait_ms}, check_end{scope,exit,duration_ms}, batch, seat_done).
- Merge attempts since 10-10: `<repo>/issues/merge-attempts.jsonl`. Verify runs since 10-14: `<repo>/issues/verify-runs.jsonl`. Red records: `<repo>/issues/red-records.jsonl`.
- Handoff time = first git commit adding the leaf's `state.yaml` under `issues/open/`.
- Open intake (seeds): `/home/ivan/Work/infra/tamdoma/framework/issues/seeds/*.md` (57 open GitHub issues, filed 09-30 to 10-14), akrogon 2.
- Charts: `<repo>/issues/chart/*/CHART.md` (last line `Handed off|Closed|Held <date>` = ended).
- Seat sessions: pi `~/.pi/agent/sessions/`, codex `~/.codex/sessions/`.

Windows: W0 = 2026-10-07 06:30Z to 2026-10-14 06:30Z (the week before). W1 = 2026-10-14 06:30Z to 2026-10-15 06:30Z (last 24 h, after the fixes). A leaf belongs to the window it merged in. Dwell = time between phase moves in log.jsonl.


## akrogon

### week before (W0): 10-07 06:30Z to 10-14 06:30Z, 54 leaves merged (7.7/day)

- handoff to merged, hours: median 1.1, p90 9.6 (n=35)
- plan done to merged, hours: median 0.6, p90 2.0
- implement: total 25.0 h, median per leaf that visited 18.3 min, leaves visiting 54/54
- check.review: total 3.2 h, median per leaf that visited 2.5 min, leaves visiting 54/54
- check.repair: total 2.1 h, median per leaf that visited 3.2 min, leaves visiting 31/54
- check.fix: total 7.2 h, median per leaf that visited 14.4 min, leaves visiting 15/54
- merge: total 4.5 h, median per leaf that visited 2.8 min, leaves visiting 54/54
- failed: total 29.7 h, median per leaf that visited 270.2 min, leaves visiting 6/54
- review visits per leaf: median 1.0, mean 1.48
- leaves needing repair: 31/54; clean first review to merge: 23/54
- red merges (merge to fix/failed): 4 across 4 leaves
- failed visits: 11 across 6 leaves

### last 24 h (W1): 10-14 06:30Z to 10-15 06:30Z, 1 leaves merged (1.0/day)

- handoff to merged, hours: median 17.5, p90 17.5 (n=1)
- plan done to merged, hours: median 9.4, p90 9.4
- implement: total 6.9 h, median per leaf that visited 411.3 min, leaves visiting 1/1
- check.review: total 0.7 h, median per leaf that visited 40.6 min, leaves visiting 1/1
- check.repair: total 0.3 h, median per leaf that visited 16.3 min, leaves visiting 1/1
- check.fix: total 1.4 h, median per leaf that visited 81.8 min, leaves visiting 1/1
- merge: total 0.2 h, median per leaf that visited 14.6 min, leaves visiting 1/1
- failed: total 0.0 h, median per leaf that visited None min, leaves visiting 0/1
- review visits per leaf: median 2, mean 2.00
- leaves needing repair: 1/1; clean first review to merge: 0/1
- red merges (merge to fix/failed): 0 across 0 leaves
- failed visits: 0 across 0 leaves

- merge attempts W0: 37 {'held': 1, 'merged': 33, 'red': 3}; minutes median 3.1, p90 6.0; members per attempt mean 0.00
- merge attempts W1: 1 {'merged': 1}; minutes median 14.5, p90 14.5; members per attempt mean 0.00
- checks W0 part since 10-12 23:41Z scope=leaf: 114 runs, 21 non-zero, minutes median 0.1, p90 4.0, total 3.0 h
- checks W0 part since 10-12 23:41Z scope=merge: 0 runs, 0 non-zero, minutes median None, p90 None, total 0.0 h
- check start waits W0 part since 10-12 23:41Z: n=38 median 1.7 min, total 8.4 h
- checks W1 scope=leaf: 91 runs, 12 non-zero, minutes median 0.0, p90 2.2, total 0.8 h
- checks W1 scope=merge: 0 runs, 0 non-zero, minutes median None, p90 None, total 0.0 h
- check start waits W1: n=69 median 0.0 min, total 0.3 h
- handoffs (inflow): W0 36 (5.1/day), W1 1

## framework

### week before (W0): 10-07 06:30Z to 10-14 06:30Z, 101 leaves merged (14.4/day)

- handoff to merged, hours: median 12.2, p90 30.9 (n=72)
- plan done to merged, hours: median 5.8, p90 19.0
- implement: total 233.4 h, median per leaf that visited 87.4 min, leaves visiting 101/101
- check.review: total 16.6 h, median per leaf that visited 7.9 min, leaves visiting 101/101
- check.repair: total 20.0 h, median per leaf that visited 8.2 min, leaves visiting 85/101
- check.fix: total 111.6 h, median per leaf that visited 48.0 min, leaves visiting 72/101
- merge: total 363.0 h, median per leaf that visited 72.3 min, leaves visiting 101/101
- failed: total 58.8 h, median per leaf that visited 76.6 min, leaves visiting 24/101
- review visits per leaf: median 2, mean 2.50
- leaves needing repair: 85/101; clean first review to merge: 16/101
- red merges (merge to fix/failed): 67 across 40 leaves
- failed visits: 44 across 24 leaves

### last 24 h (W1): 10-14 06:30Z to 10-15 06:30Z, 31 leaves merged (31.0/day)

- handoff to merged, hours: median 15.6, p90 19.3 (n=8)
- plan done to merged, hours: median 3.2, p90 13.5
- implement: total 100.7 h, median per leaf that visited 84.0 min, leaves visiting 31/31
- check.review: total 15.4 h, median per leaf that visited 11.9 min, leaves visiting 31/31
- check.repair: total 12.9 h, median per leaf that visited 7.2 min, leaves visiting 24/31
- check.fix: total 60.9 h, median per leaf that visited 92.7 min, leaves visiting 18/31
- merge: total 10.8 h, median per leaf that visited 20.7 min, leaves visiting 31/31
- failed: total 5.7 h, median per leaf that visited 10.4 min, leaves visiting 15/31
- review visits per leaf: median 2, mean 2.23
- leaves needing repair: 24/31; clean first review to merge: 7/31
- red merges (merge to fix/failed): 15 across 9 leaves
- failed visits: 19 across 15 leaves

- merge attempts W0: 61 {'held': 5, 'merged': 37, 'red': 11, 'ejected': 7, 'reuse': 1}; minutes median 11.0, p90 24.1; members per attempt mean 0.03
- merge attempts W1: 45 {'merged': 30, 'ejected': 7, 'red': 8}; minutes median 7.5, p90 13.6; members per attempt mean 0.02
- checks W0 part since 10-12 23:41Z scope=leaf: 219 runs, 80 non-zero, minutes median 2.5, p90 18.5, total 33.4 h
- checks W0 part since 10-12 23:41Z scope=merge: 0 runs, 0 non-zero, minutes median None, p90 None, total 0.0 h
- check start waits W0 part since 10-12 23:41Z: n=148 median 8.2 min, total 90.9 h
- checks W1 scope=leaf: 786 runs, 247 non-zero, minutes median 0.4, p90 7.2, total 27.5 h
- checks W1 scope=merge: 0 runs, 0 non-zero, minutes median None, p90 None, total 0.0 h
- check start waits W1: n=742 median 0.0 min, total 0.4 h
- handoffs (inflow): W0 80 (11.4/day), W1 0

## Extra findings A checked by hand

1. Waiting before planning starts. Framework leaves merged in W1 had handoff to merged median 15.6 h but plan-done to merged only 3.2 h. timings.jsonl `wait` events explain most of the gap: 15 leaves waited with reason `prerequisite` (a `blocked-by` leaf not merged yet), e.g. backlink-audit-spine waited 10-13 12:12Z to 10-14 06:09Z (18 h) for pass-two-review-notes; promotion-script 27 h; competitor-brand-names 35 h. Actual planning after the prompt was 10 to 40 min for most. 75 `wait` events had reason `merge_turn` and 17 `none`.
2. Real planning time (prompt to next phase): akrogon median 14 min (7 plans; core-machinery plans 51, 61, 483 min; stacked-turn today 62 min). Framework real planning mostly 10 to 45 min, with outliers of 2 to 4 h.
3. Inflow is now near zero. Framework W1 handoffs 0, akrogon 1. Framework open leaves now: 0. Framework seeds waiting for charting: 57. Framework charts not ended: 16. The factory drained its stock in W1 (31 merged) and is idle.
4. In W1 the framework merge dwell fell from 363 h total (72 min median per leaf) to 10.8 h (21 min). Check-start waits fell from 90.9 h to 0.4 h after the check lock was removed.
5. The rework loop is the biggest in-leaf stock after implement: 77% of W1 leaves needed a repair (84% in W0), 2.2 review visits per leaf, check.fix median 93 min per visiting leaf, 60.9 h total check.fix in W1 vs 100.7 h implement.
6. Akrogon W0 leaves were small (implement median 18 min, handoff to merged median 1.1 h). Akrogon W1 merged only 1 leaf through the lifecycle; the rest of the day's akrogon changes landed by the direct route (door implements, B reviews), which log.jsonl does not record.

## What already changed (do not re-propose; build on it)

- Check lock removed; every check runs at once (operator: "No caps at all", "I dont want any slowdowns").
- Leaf runs cheap checks plus its own planned tests; full verify runs once at merge.
- Hand-copied test lists removed in framework (673ea4ab9).
- Repair gate and flaky-test sensor (L1 to L3), D1 rule (a stop on a missing case in existing tools goes back to A), G1/G2 (designs must name every consumer of a changed precondition and mark open mechanisms `Open for the plan:`; plans map each criterion to an observation).
- pi tool timeout ceiling of 600 s removed.
- Merge batching (stacked merge turn: B verifies the holder plus every clean waiting leaf stacked on top, one push) is in implement right now as leaf stacked-turn.
- Slot A is always devin/swe-2-max (pi, effort high); slot B is codex gpt-6.1-sol. Do not propose model swaps. Skills are never deleted. The rule count in skills stays as is.
