# Systems map, merged (A, B, C), 2026-10-13

Sources: slots/system-A.md, -B.md, -C.md.

## Headline
The PC is not the binding constraint (A,B,C): slice cap 16 of 32 cores held, host 86% idle at 14:40, slice averaged ~4.3 cores over 92 s at 14:45 with no new throttling (B), memory events zero (B). The binding constraint is permit-minutes per merged leaf, made large by broad selection, sequential subset runs and repeated cycles (A,B,C).

## Numbers
- test_changed selects 101-106 of 139-140 lanes; 97 are `always` (framework test-changed-ownership.json, check logs) (A,B,C).
- Subset runs `--sequential` (run-test-changed.ts:440); full selection runs `framework:verify:core` `--parallel` (:430-431, package.json:168). Subset 12.2-13.8 min vs all-lane runs 4.0-4.7 min (timings :9/:24/:35 vs :56/:58/:547) (A,B,C). Different workloads, strong mechanism lead, not a measured causal 3x (B).
- Median framework leaf ~2 check sets + verify ~ 33 permit-min; the 60 min leaf is the p90 tail (C). fix_rounds median 1 since Oct 10 (B) / 0 over full log (C).
- Framework merges 0.55/h over 7 d; permit cap from current demand ~1-1.8/h, so seat time is co-binding (C).
- One raw neighbor slowed the holder 731 -> 826 s (+13%) (C).

## Loops
- R1 queue/timeout -> raw or timeout-wrapped run -> contention -> slower service -> longer queue (A,B,C). B: the first raw call came before any timeout, so queue delay did not cause that bypass.
- R2 contention -> flakes -> retry, base-run, fix cycle -> more runs (A,B,C). Not attributed in records (B).
- R3 leaf age -> bigger diff -> broader selection -> longer runs -> older leaves (C); evidence ageing via refresh/restack (B).
- R4 WIP: dispatch counts active leaves only (src/next.ts:414-460), workers multiply test demand up to 3x per wave (A,C). B: accumulation, a loop only if someone starts more leaves when merges slow.
- R5 duplicate payment: worker runs test:changed, A reruns after each pick, then at implement end (C; B: dedup only for proven identical inputs).
- R6 safety ratchet: unresolved reads -> mark always (framework test-changed-reads.ts:984-988) and nothing retires always (B,C).
- R7 merge ageing: solo merges, rebases, fresh proof (B,C).
- B1 slice quota (works, hides overload from the operator: C). B2 permit (works only for callers). B3 max_active (barely binds). B4 merge verify runs everything once (C: makes a narrower leaf gate safe). B5 known-red comparison. B6 fix_rounds cap. B7 operator stop/pause.

## Missing feedback
Dispatch blind to queue (A,B,C); seats blind to queue (A,C); no CPU-seconds per check (B,C); no per-lane yield or cost, so always can never be retired (B,C); raw demand invisible (B,C); no exact-identity coalescing (B,C); no ageing signal (C).

## Leverage, merged rank
1. Cut framework check cost: parallel subset runs (A,B) and shrink the 97-always floor using the existing reads resolver, prioritized by lane cost and yield (A,B,C). Destination framework. Biggest gain per cost.
2. Workers stop running full test:changed; they run their unit's targeted lanes, A runs test:changed after the pick (C). B dissent: separate scheduling change, needs evidence of duplicate work and an explicit contract reopen.
3. Close the bypass plus a long-run path (A,B,C). C: no direct throughput gain, but every measurement is meaningless while demand leaks.
4. Permit count 2 only after a one-vs-two measurement under the same slice (A,B,C). CPU-share admission later, needs CPU prices (B,C).
5. Queue visibility, then queue-aware dispatch or a lower max_active trial (A,B,C; B: operator trial, reopens queue-order only for a registry).
6. Coalescing identical admitted work (B,C narrow; reopens check-reruns).
Low value: raising CPUQuota, raising max_active, shaving selftest/cheap (C).

## Measurements (all proposed, none run)
- Zero-load: lane cost and yield mining over kept logs (B E1, C M-2); selector replay over recent merged diffs with always converted (C M-3); cycle audit of two finished leaves (B E4).
- Bounded load: same selection sequential vs bounded-parallel under one permit (A M1, B E3); two runs together vs one (A M2, B E2, C M-1), after bypass drains, with CPU-seconds per check (C M-5).
- Config only: max_active 8 for a day (C M-4).
