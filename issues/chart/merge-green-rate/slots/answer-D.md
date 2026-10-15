# Green rate, seat D

Data: framework issues/merge-attempts.jsonl, 98 attempts since 10-07, 36 not merged. I classed each from log.jsonl failure reasons and each holder's review-B.md / implementation/report.md (table in my notes, lines cited below). Classes: a = test the leaf did not touch, red under load; b = real defect in the leaf's diff; c = integration with what main landed while the leaf waited; d = infrastructure.

| class | rows | examples |
|---|---|---|
| d infra | 14 | 6 GitHub credential loss after a green verify (log.jsonl:2596,2603,2604,2628,2700,2714), 2 memory admission blocks (:2631,:2649), 1 verifier vanished (:2658), 5 repo-wide holds (L1, L11-13, L21) |
| b defect | 11 | verify-aliases pinned list vs package.json delta (disavow-evidence-scope report.md:62), reader never called verifyPack (technical-pack-selection report.md:82) |
| c drift | 7 | check-scratch rebased onto main's new detectRepoRoot guard, 18 red (report.md:61); promotion-script 20:15 integrated main's build-disavow (report.md:115) |
| a load | 4 | fail-fast 5078 ms vs 5000 ms (report.md:55); spec-path-open-categories retry timeouts (review-B.md:97-142) |

Since 17:46 (single-leaf merge): 12 merged, 3 red: b, b, c. Class d is gone. 21 of 31 red/ejected rows came from 7 repeat holders (favicon-render x5, all d; pass-two-review-notes x4; technical-pack-selection x3).

## Q1 Stocks and flows
- S1 latent defects per branch. In: implementation. Out: leaf gate (cheap lane plus planned tests, verify.ts:49-57 with merge_covers [cheap], config.yaml:12), B's review, merge verify. D10 narrowed the first outflow, so class b now drains at merge by design.
- S2 drift: main commits since the leaf's last rebase. In: every merge (11 landings in 90 min at 19:26-20:56, attempts :88-98). Out: only the rebase at holder time (next.ts:1025-1051, batch.ts:76-86); a waiting leaf is never rebased, and a bounced leaf re-enters at the back with a fresh merge_stamp (phase.ts:150, turn.ts:93-105).
- S3 leaves waiting in merge. In: check.review green (phase.ts:313-317). Out: merged, or check.fix (routing.ts:35). Wait = depth x verify wall, 23 min typical (brief).
- S4 suite fragility: load-sensitive and racy tests. In: leaves add them (probe-waits report.md:72, parallel-selftest report.md:47 were leaves adding their own flaky test). Out: test-cpu leaves. No automatic outflow: an `inconsistent` verdict is prose in review-B.md (merge-issue SKILL.md:75, check-issue SKILL.md:67), nothing structured reads it.
- S5 host load and memory. In: concurrent verifies and checks. Out: completion. Admission blocks and load 393 (log.jsonl:2631,2647) were this stock overflowing.

## Q2 Loops
- B1 merge gate. Target: main green. Sensor: full verify on the rebased tree, receipt keyed by tree (verify.ts:63-76). Actuator: push or check.fix. Delay: the whole queue wait. Sensor fault: one bit, "red", for four causes. Until 6640ab5 a push failure or admission block was recorded as a leaf red and the leaf bounced (favicon-render five times for a credential, zero code cause). attempts.ts:8 still carries `held`, `split`, `reuse`, `ejected` with no writer.
- B2 leaf gate. Target: leaf correct. Sensor: cheap lane plus planned tests. Actuator: fix rounds. Blind to class b by design since D10; the cost of a b caught at merge is one full verify plus a review cycle instead of one targeted test.
- B3 repair loop after a merge red: merge -> check.fix -> check.review -> merge (routing.ts:34-35). After repair B runs neither verify nor the red command (check-issue SKILL.md:91), so the fix is first sensed at the next merge turn, a full queue wait later. Sensor at the end of the loop, actuator at the start. This is where repeat holders come from.
- B4 red judgment (merge.md:28). Sensor: B reading the diff. Actuator: one immediate rerun. The rerun runs under the same load as the red, so for class a it is a correlated sample, not an independent one.
- R1 load breeds reds: red -> rerun or check.fix -> extra verify -> load -> timeouts -> red. Evidence: pass-two-review-notes 21:18 and 04:09 (review-B.md:349-355, log.jsonl:2647).
- R2 drift breeds reds: a c-red sends the leaf to the back of the queue, it waits again, main moves more, the next rebase integrates more. Every red also lengthens every other leaf's wait by one verify wall, which raises their drift.
- R3 repeat holders: a leaf already red is likelier red again (B3 delay plus R2). 21 of 31.

## Q3 Leverage
L1 Information flow: a red carries its cause class in the record, not in B's prose. verify-runs.jsonl already stores per-command exit and log path (framework issues/verify-runs.jsonl, first record). Add the failing test file(s) parsed from the log and whether each is inside the leaf's diff; record `inconsistent` as an outcome on the attempt instead of only in review-B.md. Files: src/verify.ts (run record), src/attempts.ts (replace the dead `held|split|reuse|ejected` with `inconsistent`), merge-issue SKILL.md:75 and check-issue SKILL.md:67 (write the field, drop the prose duplicate). Removes: four dead outcome values and the hand classification reds.md is doing now. Mechanism: S4 gets a visible stock, chart-issues can read "tests red outside any diff" and delete or fix them, and class d can never again be charged to a leaf because a push or admission error is not a verify outcome. Breaks later: log formats differ per lane, so test-file parsing needs one regex per runner; if it fails, record the command only, which is today's state.
L2 Move B3's sensor to its actuator: after a merge red, the leaf re-enters merge only with a green run of the exact red command on the fixed tree. check-issue SKILL.md:91 already names this path for A's check.fix ("replays the exact rejected command"); make it the rule for re-entry and delete the exception that B skips it. Files: skills/check-issue/SKILL.md:91, skills/merge-issue/SKILL.md:75, phase.ts:277-288 (the move into merge checks a receipt for the red command, scope leaf, same receipt mechanism). Removes: nothing in code, one sentence of skill text; adds one receipt lookup. Cost: one lane, not a full verify. Breaks later: a red whose fix changes which command fails needs the full merge verify anyway, which still runs. Expected effect: the repeat-holder share (21 of 31) is the target; a and c do not shrink, b's second-bounce rate does.
Drift (c) shrinks with wait, which is the merge-par decision, not a green-rate change. Load (a) shrinks with the test-cpu leaves already landed.

## Q4 What not to do
- Retry wrappers, bun --rerun-each, quarantine lists, raised timeouts: they move S4 out of sight and leave R1 intact (fail-consult Q2 said the same).
- Full verify back at every leaf check: catches b early at 1,148 CPU-s per leaf, which refills S5 and R1.
- Rebase waiting leaves continuously: churns worktrees and CPU for leaves that may bounce anyway.
- More reruns at merge or landing on "last green" (GitHub's option): raises the green number by lowering the sensor's fidelity.
- Caps, locks, fix_rounds changes: parameters, not structure.

## Q5 Metric and target
Merge green rate is the wrong sensor on its own: it rose from 63% to 80% today mostly because class d stopped being counted, and it can be raised further by reruns. The system should measure verifies per landed leaf (today 15/12 = 1.25, attempts :83-99) split by class, and bounces per leaf. Target: a and d at zero, c bounded by queue wait, b at whatever D10 accepts. With b at 11 of 98 attempts the structural ceiling is about 0.88 unless b is caught cheaper earlier (L2 catches its second bounce, not its first).

## reds.md
Not present when I finished (folder holds brief.md, extract.py). If its classes differ from the table above, the counts change, not the loops.
