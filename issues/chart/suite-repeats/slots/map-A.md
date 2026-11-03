# Map A

## 1. Measurements

Window: 20 leaves from `akrogon timing --cohort --since 2026-10-10T00:00:00Z`, each expanded with `akrogon timing <slug>`, aggregated by scratch script `agg.py` in the scratchpad.

- Logged leaf time 26.2 h. Prerequisite wait (blocked-by) 11.3 h, failed 1.2 h, merge-turn wait 0.7 h. Active seat time ("prompted") 12.7 h.
- Per phase (total / prompted): plan.synthesis 11.8 / 2.5 h (rest is prerequisite wait), implement 5.5 / 4.6, check.fix 4.8 / 4.1, check.review 1.3 / 0.9, check.repair 0.8 / 0.6, merge 0.8 / 0.
- Checks inside turns: 5.4 h. Full `test` check 158 runs, 4.09 h, about 8 per leaf (range 1 to 39, scratch-copy-removal 39). Runs by phase: plan.synthesis 46, implement 60, check.fix 27, check.repair 14, merge 11.
- Full test duration: median 127 s, p90 198 s, max 1454 s; one base run 55 m 40 s (worker-test-duty). format and typecheck about 2 s each (89 and 82 runs). Warm `bun install --frozen-lockfile --backend=copyfile` 3 ms, `akrogon guard own-modules` 22 ms (timed once by A).
- Full test runs are about 32% of active seat time.
- Caveat: `suite-time` (closed 2026-10-26) and `verify-waste` (handed off 2026-10-24) landed inside the window; the per-leaf run count may already be lower. Timing data ends 2026-10-29.

## 2. The post's nine items in akrogon

1. Queue for a machine: equivalent is blocked-by wait (11.3 h, calendar) and merge-turn wait (0.7 h). Admission waits are small.
2. Slow lint: no, format about 2 s.
3. Slow typecheck: no, about 2 s.
4. Unsharded tests or small machine: the opposite problem. One host, `max_active: 12`, each full suite `--parallel=4`; p90 198 s vs median 127 s and a 24 min max point to host contention, not shard size.
5. Every test file reloading the app: `--no-isolate` already set; suite-time closed.
6. Slow setup (cache, clone, parallel > cores): setup is 3 ms warm. Parallel tasks over cores applies: 12 leaves x 4 test workers.
7. Jobs not parallel: format, test, typecheck run serially inside each verify; they cost about 4 s outside test, so no gain.
8. Every PR runs the full suite: yes, about 8 times per leaf. The main finding.
9. No local checks before push: n/a; everything is local.

## 3. Material forks

F1. Who runs the full suite, and how often. Today the planner runs it (46 runs; `skills/plan-issue/SKILL.md` "A runs only the planned criterion tests" section says it should not), implement runs it early under "Cheap proof first: ... runs every `checks` command" (`skills/implement-issue/SKILL.md`, Shared context proof order) and again through `akrogon verify` at the end, check.fix runs verify again, merge runs verify again.
- Option a (removal): the full suite runs only inside `akrogon verify`, once per committed head handed to review and once at merge. Seats run targeted tests only. Delete "every `checks` command" from the cheap-proof-first rule. Invites later: a seat hands off a head that fails the full suite and pays a whole review round; that cost is bounded because verify is the gate before check.review anyway.
- Option b: leave the rules, find out whether the 46 plan runs are rule-breaking habit, and fix the habit with one sentence. Smaller change, but the habit pattern can return.
- Option c (addition, rejected): affected-test selection. framework-test-scope was held for missing breakages; adds a dependency graph.

F2. Host contention loop. More active leaves -> more concurrent full suites -> slower suites -> longer turns -> leaves stay active longer -> more overlap. Cutting F1 runs breaks the loop without a new cap. Option: lower `max_active` (config only, no code), measured before and after. Invites later: lower throughput when suites are already rare.

F3. Process text weight. Active seat time (12.7 h) is three times the full-suite time; every turn reads long rules. Example: the red-retry and known-red paragraph exists nearly verbatim in `skills/implement-issue/SKILL.md` (Shared context), `skills/check-issue/SKILL.md` (check.review and check.repair) and `skills/chart-issues/SKILL.md` (Direct route landing). The run-check capture-recovery paragraph appears four times. Option: one copy, referenced by section. Invites later: a seat that skips the reference; measured by turn tokens, not wall time. Low confidence on how much wall time this saves.

F4. blocked-by waits (11.3 h calendar). Option: no change (charting already orders only real dependencies), or audit which blocked-by edges were real. Adds no code either way; saves calendar time only.

## 4. Removal candidates

- R1. The "run every `checks` command before the first slow run" clause in implement's cheap-proof-first rule: verify runs the same commands on a fresh checkout at the end, and verify is what the check.review move requires.
- R2. Duplicate copies of the retry/known-red and capture-recovery paragraphs across three skills.
- R3. `test_changed` style ad-hoc runs and per-leaf full runs during plan.synthesis, if the 46 runs are habit; the planner rule already forbids them.

## 5. Pitfalls

- Acting on pre-2026-10-26 data after suite-time and verify-waste: removed by re-measuring on leaves after 2026-10-26 first.
- Saving seat time but losing catches: removed by keeping verify as the single gate before review and at merge, unchanged.
- Measuring wall time under different host load: removed by comparing runs per leaf (a count), not seconds.

## 6. Practitioner questions

- How many full-suite reds did seats catch before verify that verify would not have caught at the same head? If near zero, R1 is free.
- Does a lower `max_active` raise or lower leaves landed per day on this host?
