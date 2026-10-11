# Slot C: why leaves can run 4+ hours

Primary case: framework `formspark-build-wiring`. Times are UTC from `framework/issues/log.jsonl:2307-2372`. Worktree commit times are local (UTC+2).

## Timeline of the primary case

| Phase | Seat | From → to | Minutes | Diff at exit | What happened |
|---|---|---|---|---|---|
| implement | A | 07:54 → 10:09 | 135 | +2291 | 8 units, 4 waves |
| check.review | A+B | 10:09 → 10:14 | 5 | | A `nits`, B `fix` F1-F6 |
| check.repair | B | 10:14 → 10:21 | 7 | +2334 | B repairs F1, F2, F4, F5, F6 (all product). F3 "real live runs" handed to A (review-B.md:38) |
| check.fix r1 | A | 10:21 → 14:44 | **263** | +4257 | +1923 lines, all `proof:` commits. Ran 1 of 6 real cases under a self-set "30-minute budget" (report.md:61) |
| review + repair | B | 14:44 → 15:03 | 19 | +4336 | F7, F8 repaired. F9 handed to A (review-B.md:288) |
| check.fix r2 | A | 15:03 → 18:53 | **230** | +4475 | 6 real cases run, 3 PARTIAL (report.md:67-74) |
| review + repair | B | 18:53 → 19:02 | 9 | +4508 | F10, F11 repaired. F3, F12 handed to A (review-B.md:357) |
| check.fix r3 | A | 19:02 → open | **>75** | | `proof:` commits continue (worktree log 21:04-22:17 local) |

A in check.fix: 494+ of 668 minutes (74%). B total: 52 minutes. Every product finding (F1, F2, F4, F5, F6) was closed by B at 10:21. Everything after that is proof work.

Diff since the implement head (`git diff --stat 025c5bb..HEAD`): `run-formspark-build-wiring-proof.ts` +1346, `lib/blueprint-run.ts` +434, `lib/blueprint-fixture.ts` +378. Product files: tens of lines each. Commits since implement head: 39 `proof:`, 18 `fix:`/`test:`.

## 1. Stock

The stock is unproven done-criteria, unit: criteria. Plan rows 3-8 (plan.md:80-87) require real `claude -p` dispatches of 6+ blueprint cases plus a browser submission. After three rounds only criterion 1's declaration is established; criteria 2-7 remain open (review-B.md:366). The stock has barely drained in 10 hours.

A second stock grew instead: proof-harness code, unit lines. 0 at charting, ~2160 lines now. It is unreviewed, untested code that each review round must judge, which is where F7-F12 came from.

## 2. Inflows and outflows

Inflows to A's check.fix queue:
- Live-run Fixes B may not repair: `check-issue/SKILL.md:75` "B repairs every Fix except ... required live runs". F3 (review-B.md:38), F9 (:288), F12 (:357).
- Defects in A's own harness found at re-check: all six findings after round 1 (F7-F12) were introduced by A's repair commits (review-B.md:224, 288, 309-327).
- Framework bugs the live run exposes, fixed in-branch: four in round 1 (report.md:57), permitted by standing-design.md:15.
- Environment failures (blepsis daemon, hook write gates, transcript paths): worktree commits 15:46, 15:59, 16:11, 16:22, 18:37, 19:38, 19:49 local, each one small `proof:` patch.

Outflows: B's repairs, 7-10 minutes per round. A's proof passes, 0 criteria closed per round for criteria 2-7.

Rule that multiplies inflow: `implement-issue/SKILL.md:84` "After every repair, supply passing proof for every done-criterion", and :40 "Proof order applies ... after every check.fix repair". Every harness tweak re-queues the full live matrix.

## 3. Bottleneck

Seat A in check.fix. Measured rate: round 1, 263 minutes to run one real case and reach 14/15 assertions (report.md:59). Round 2, 230 minutes to run six cases to 3 PASS, 3 PARTIAL. Each real case is a chain of `claude -p` sessions, a build, a consumer repo, a browser. Each failure in the chain costs the whole chain again.

Across 353 framework leaves, check.fix median is 24 minutes. The tail: emdash-launch 840, pitch-writing-brief 582, formspark-build-wiring 494, emdash-offer-join 488, offer-join-deploy 423. Every tail leaf except pitch-writing-brief (operator-grant wait) carries a live-run criterion sized "hours" plus a harness or browser daemon built or repaired inside the leaf (emdash-launch plan.md:52,111 and report.md:169 "operator ended the pass after more than 3h"; emdash-offer-join plan.md:132 "rerun trigger: any repair", 4 live runs, 2 aborted by cross-leaf bugs). The fast contrast leaf (`redirect-crawl-input/write-destination-inputs`) has no live run and a check.fix of minutes. This is a pattern, not one leaf.

## 4. Reinforcing loops

R1 Harness defects breed findings. Live proof needs a harness → harness is new code → re-check finds harness defects → A repairs harness → new harness defects. Evidence: F7-F12 all A-introduced, all harness. Review bar treats a harness defect like a product defect (check-issue/SKILL.md:51 Fix definition has no carve-out), so each one blocks.

R2 Harness growth. Each round adds harness surface (+1923, +79, +33 lines) and each addition is reviewed next round. 39 `proof:` commits.

R3 Scope creep through live runs. The live run exposes bugs outside the leaf; standing-design.md:15 allows in-branch fixes; review-B.md:82 reviews them "despite design's integration-code exclusion". More diff, more review, more proof.

R4 Flake attribution. A labels a failure "transient runner-environment flake" (report.md:69); B shows it is A's own `spawnSync` (F10, review-B.md:313). A retries, B finds the cause, a round is spent.

## 5. Balancing loops with wrong target or sensor

B1 `fix_rounds` cap (`src/phase.ts:306-311`, default 3 in `src/config.ts:45`). Sensor: count of B→A handoffs. It never sees time or diff size inside a round. One round here is 4 hours. The cap fires only at the next handoff, so this leaf ends `failed` after ~16 hours, which is the worst outcome at the highest cost.

B2 60-minute stall notice (`src/next.ts:227-259`). Sensor: pane busy. Target: 60 minutes. Action: one desktop notification, then `busy_notified` suppresses further ones. It is a monitor with no control action, and "busy" is not the quantity that matters; the seat was busy and making commits the whole time.

B3 Leaf size at charting. `shapes.md:286` "no count, size or duration trigger". `chart-issues/SKILL.md:69` live-run estimate is "information only, it never times out a leaf and never waives a criterion". The plan sized the live matrix "~8 sessions, minutes each" (plan.md:82) with the harness (U8) as a unit of the same leaf and "Waves 1-3 need no live calls" (plan.md:90). The sensor read the proof as minutes because the harness did not exist yet; the first real signal arrived after all eight units landed.

B4 Review ownership. `check-issue/SKILL.md:75` routes live runs to A only. Correct target (real evidence), wrong sensor: no distinction between "product wrong" and "proof machinery cannot yet produce evidence". The second is routed as a repair instead of a stop.

B5 Proof-after-every-repair (`implement-issue/SKILL.md:84`) with "reuse unchanged evidence" as the only relief. A harness change makes all prior evidence stale, so reuse never applies in R1.

B6 Done-criterion stop (`implement-issue/SKILL.md:36`): "still failing after the repairs the protocol permits" ends `failed`. "Permits" is unbounded, so A keeps repairing. A's own 30-minute budget was the only time target anyone set, and B rejected it as not a criterion exemption (review-B.md:226). Both were right within the rules, which is the problem.

## 6. Root cause and changes

The lifecycle bounds repair by handoff count and bounds nothing inside a seat's pass. A leaf may bundle a product change, the proof harness that proves it, and the live proof itself. When the harness is new, the check loop runs on harness defects while the product has been done since the first repair, and every harness fix re-queues the whole live matrix. Nothing in charting, review or repair can tell "product not done" from "proof machinery not done", so the system spends seat-hours on the second as if it were the first.

C1 Structure: a live-run proof harness is its own prerequisite leaf, landed green on an existing behavior before the product leaf opens. `shapes.md:286` already names the rule for parts a producer could merge with its own proof; apply it to harnesses explicitly. The product leaf then owns product diff plus live runs on proven machinery, and B can judge F3-style findings as "evidence missing" rather than "build the evidence pipeline". Invites: one more leaf per live-run epic, and harness drift when the product contract changes, which the product leaf absorbs as a small repair.

C2 Rule: in check.fix, A repairs recorded Fixes only. When a done-criterion stays red because the proof cannot run (harness, environment, daemon), A records the cause and ends with the existing `failed --reason "<criterion> red: <cause>"` stop (`implement-issue/SKILL.md:36`) instead of building more harness. This turns a 4-hour round into a 20-minute operator decision. Invites: more `failed` leaves for the operator to unblock, which is cheaper than 16 seat-hours and is the signal the operator asked for.

C3 Target: at charting, a live-run criterion whose proof needs a harness not already in the repo is refused unless C1's leaf precedes it. This is the sensor B3 lacks. Invites: nothing new, it makes the SKILL.md:69 estimate honest.

Not recommended: a wall-clock cap per pass or a louder stall notice. Both add a monitor on top of the loop and leave R1 running.
