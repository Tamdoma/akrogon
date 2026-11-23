# History reversals, 2026-09-20 to 2026-11-22

Read-only history pass for lean-akrogon. Each cycle (C1..C14) lists its timeline, what drove each flip, the state on main today, the cost signals and the tension behind it. Confidence is high when commit messages or fork `## Taken` records state the sequence, and low when I inferred it.

Two open seeds would flip a cycle again: #149 P1 ("rerun the failing units inside the land run", operator 2026-11-22) reverses C1, and #148 ("run scratch moves to RAM") would be the sixth placement in C2.

## C1. Rerun a red inside the merge/land run vs never rerun (high)

Timeline:
- 2026-10-01: test-time-and-temp/forks/check-proof.md Q2 2a (operator). A red with no cause in the diff gets one same-command run at `AKROGON_BASE`. Red there means `failed`. "Never run automatically after every fail."
- 2026-10-10: red-base-wait/forks/comparison.md Q3 3a (operator "1a | 2a | 3a"). One with-change retry of the same command before any base run. A green retry is recorded as inconsistent (flaky).
- 2026-10-11 301ee46f: an inconsistent record needs a completed green retry.
- 2026-10-14 87dbb4b6: a green retry continues to `merged --check` (operator O6). On the same day dc2e2b0c deleted the compare machinery, and 78b678ac says "the green-retry comparison was removed". The same-head retry survived only as skill text (base-red/forks/red-base-policy.md Taken, "only after the same-head retry stays red").
- 2026-10-15 fb236ec0: `akrogon flaky` lists same-tree flips. Its whole input is those reruns.
- 2026-11-01 suite-repeats/forks/merge-reuse.md Q1 (A autopilot): merge accepts a same-tree receipt. The fork states that "merge-time flake flips stop feeding `akrogon flaky`".
- 2026-11-21: merge-lanes/forks/signposts.md 5a (operator: "a failed merge leaves the line at once"). red-exit Taken 3 and 5 say "5a removes all same-tree reruns". Shipped in 66f90be9. fbb4e4f8 re-keys flaky across rebases to recover the lost signal.
- 2026-11-22 #147: framework land runs were red 12 of 13 times, 10 of 12 on nameless timeouts that pass a targeted rerun. land-reds/forks/fix-shape.md Taken 4 again rejects "in-land rerun (5a)" and adds the land hold instead (9cdf9888).
- 2026-11-22 #149 (operator seed decision): "P1 (rerun the failing units inside the land run) comes first."

Drivers: operator answers on 10-10 and 11-21, then the measured incidents #147 and #149.

Main today: no rerun. A red goes `merge -> check.repair` through `repairExit` (src/land.ts:81-95). The only second run is the taken8 base pass (src/land.ts:143, :218).

Cost: #149 says that before 66f90be9 a second run in the same attempt went green in 172 of about 539 first-red attempts (32%). In the 1.5 days after it, 75 same-head bounces cost 62 h (median 29 min). red-exit Findings put in-lane reruns at 19.8 h per week. That is 3 charts (red-base-wait, merge-lanes, land-reds) plus #149, and 4 flips in 52 days.

Tension: holding the line and adding PC load with a rerun, against absorbing load flakes cheaply. Both sides treat a symptom. The reds come from host load (C3) and suite flakes, not from leaf code.

## C2. Leaf TMPDIR placement: RAM tmpfs vs disk vs home (high)

Timeline:
- 2026-10-01 1db77343: leaf temp moves to `/var/tmp/akrogon-<uid>` (test-time-and-temp/forks/leaf-temp.md, operator "1a | 2a"). The operator asked "why does it HAVE to be in /var/tmp/?"
- 2026-10-02 5b2f4d0f: back to `/tmp` (RAM), because "on-disk /var/tmp made headless Chromium captures hang at random". It adds a new-tab scratch wipe (temp-release/forks/leaf-path.md, operator "1a").
- 2026-10-10 3ae682fd: `~/.akrogon/scratch/<repo>` (home, disk).
- 2026-10-11 021a3b43: run-check root gets a short `/tmp` path for the Chrome 107-byte socket limit. Reverted the same day in 2c3a0afb, which moved leaf temp to `/tmp/akr-<uid>` (RAM), "gone when its seat or check ends".
- 2026-10-14 c6981701: `/var/tmp/akr-<uid>` (disk), because "tmpfs ... counted as akrogon.slice memory and held admission closed overnight". The new-tab wipe is removed because it deleted live captures.
- 2026-10-16 temp-release/forks/release.md (A autopilot) keeps disk, saying "c698170's overnight admission incident is the newer evidence".
- 2026-10-22 LESSONS.md:41: `/var/tmp` vs `/home` causes `EXDEV` on rename (a cost of the disk move).
- 2026-11-22 #148 (operator): "Run scratch moves to RAM (tmpfs)". Disk teardown takes 163 s vs 0.3 s on tmpfs and times out land runs.

Drivers: Chromium hangs (to RAM), the socket path limit (short `/tmp`), the admission memory gate holding closed (to disk), and disk teardown timeouts (to RAM again).

Main today: `/var/tmp/akr-<uid>` (src/config.ts:373-379). `retiredLeafTempRoot` `/tmp/akr-<uid>` is kept only so the sweep can delete it (src/config.ts:382-387).

Cost: 21 src commits touch leafTemp/TMPDIR, plus 5 placements in 14 days, 2 charts (test-time-and-temp, temp-release), the lesson at LESSONS.md:41 and seed #148.

Tension: tmpfs is fast and avoids disk teardown timeouts but counts as slice memory. Disk is free of the memory count but slow under load. The 10-14 reason (the memory start check) was itself removed the same day (81196b3b, C3), so the stated cause of the last flip had already lapsed when it shipped.

## C3. Admission control: permit, memory/spacing gate, CPU quota, full-suite line, land hold (high)

Timeline:
- 2026-10-13 6968997a: host-wide run permit, "one ticket for the whole PC" (host-test-load/forks/heavy-runs.md, operator 1a). akrogon.slice ships with CPUQuota 1600% (ceiling-values 1a).
- 2026-10-13, same day: the operator says "don't put any caps, it must not be the solution". 1fa5f89a drops CPUQuota (permit-bypass/forks/ceiling-trigger.md). The operator also says "I don't want the line to even be there". e1da855a replaces the permit with a memory and spacing start check (permit-bypass/forks/guarantee.md, load-guard.md 1b). src/permit.ts lived less than one day.
- 2026-10-14 81196b3b: "Drop the memory start check and start spacing (operator amendment)" (305 lines deleted). 4f6cf9e0 deletes the waiting state.
- 2026-10-14 e5e12355: "Run one full verify at a time per host". Reverted 56 minutes later in efabd591.
- 2026-10-15 system-speed/CHART.md D4: a load-wait helper is rejected because "it is a lock, which the operator ruled out".
- 2026-10-24 861d0e4e: full suites run one at a time host-wide (host-run-load/forks/full-suite-line.md, operator "only do it for full tests"). Reverted the same day in 20455420 (operator O7, "every run starts at once again").
- 2026-10-26 6a29a6db: the full-suite line is restored per repo ("Restores the reverted host-wide line narrowed per repo").
- 2026-11-21 merge-lanes red-exit Taken 9: framework `full: [verify]` is not taken.
- 2026-11-22 9cdf9888 and 18f93b5d: a land run holds its repo (land-reds fix-shape Taken 1). The pressure gate is rejected ("no sourced number").

Drivers: operator words within hours of each change, the measured clog (permit queues and timeouts), and #147 (load-flake reds).

Main today: a per-repo line for checks in `full`, plus the land hold (src/admission.ts:96-105, :124-132, :167-183). Slice limits are CPUWeight=20, MemoryHigh=64G, MemoryMax=96G and no CPUQuota (systemd/akrogon.slice:6-9).

Cost: 26 commits on src/admission.ts, src/permit.ts and systemd/. 3 same-day reversals. 4 charts (host-test-load, permit-bypass, host-run-load, land-reds).

Tension: run everything at once for speed, against serializing for stable test timing. Operator words keep saying both: "no line" (10-13) and "no PC blow-up, no flakes" (11-21 hard limits).

## C4. max_active value and what it counts (high)

Timeline:
- 2026-10-05: merge-turn/forks/merge-order.md Q2 2a (operator). Waiting merge leaves keep their tab and their `max_active` slot. "Uncounted waiting tabs" is foreclosed.
- 2026-10-13 485dc2f8: set to 6 (permit-bypass dispatch-wip 1a). 2e6cbbd7 sets 12 the same day (operator: "6 is too little").
- 2026-10-14 09fc15aa: 24, "so every ready leaf dispatches".
- 2026-11-21 633db0ad: merge leaves stop counting (merge-lanes/forks/waiting-seats.md Taken 1, which says it "reverses the 2026-10-05 ... foreclosure").
- 2026-11-22 8ef5c061: per-repo `max_active` under the machine cap, plus a refill of the longest waiter.

Main today: `activeCount` excludes `merge` (src/next.ts:381). The live host config has `max_active: 9` (~/.akrogon/config.yaml:1, untracked since 75bc664b on 10-16).

Cost: 5 value changes and 2 counting-rule changes. The cap only bites on waiters (waiting-seats Findings: 9-13 of 12 seated leaves sat in `merge`).

Tension: the cap is used as a load limiter (C3) and as a throughput limiter at the same time.

## C5. Batching/stacking several leaves per merge vs one leaf per land (high)

Timeline:
- 2026-10-05: merge-order Q1 1d (operator). Per-repo turn plus batching. Q3: a red batch makes every member solo, and "split-in-half retry" is foreclosed.
- 2026-10-08 27adeef6: halve a red batch instead of solo (reverses the 10-05 Q3 foreclosure).
- 2026-10-10: merge-throughput/forks/batch-size.md (operator "1a | 2a | 3a"). `--culprit` and `batch_limit` default 4 (c1040c7c, 58769a9d).
- 2026-10-14 6640ab5f: "Merge one leaf per turn: drop batch members, split, --culprit and batch_limit" (2,932 lines deleted). No fork record found. stacked-turn/brief.md says it was removed "because it was too much machinery".
- 2026-10-15 9e4c0938: stack waiting merge leaves under the holder (overnight-recs D5, leaf merge-batch/stacked-turn). system-speed D7 had warned that "it brings back code removed in 6640ab5".
- 2026-10-19 6e7a33ff: delete member stacking (merge-stacks/forks/stack-fate.md 1a, operator).
- 2026-11-21: merge-lanes signposts account: "Each leaf is still tested alone (no batching) ... Given up: batching."

Main today: one leaf per land. #149 counts 0 of 413 attempts with members since 11-08.

Cost: 164 commits from 10-01 to 10-19 mention batch/stack/member/culprit/split/solo. 5 shape changes in 14 days. 4 charts (merge-turn, merge-throughput, overnight-recs, merge-stacks).

Tension: amortizing one suite over several leaves, against the cost of bisecting a red stack (worse with a 33-45% first-run red rate) and the machinery that needs.

## C6. Red main: hold the line, compare against base, or let known reds pass (high)

Timeline:
- 2026-10-09: merge-throughput/forks/red-main-hold.md (operator "1a | 2a | 3a"). `--red-on-base`, a hold file and `unhold`. src/hold.ts was added 10-10 (0d0e0016).
- 2026-10-10: red-base-wait/forks/merge-gate.md Q2 2a (operator) retires the hold. src/hold.ts was deleted 10-11 (6bfe4c45). 42 commits on hold work between 10-08 and 10-11.
- 2026-10-11: the `akrogon base-run` verb (cb48aee8), compare.ts and red-record.ts (deec699e). Per-test comparison records are written by the seat (comparison Q1 1a).
- 2026-10-14 dc2e2b0c deletes base-run, compare and red-record (3,242 lines). base-red/forks/red-base-policy.md calls this a policy reversal "with no recorded reason".
- 2026-10-17 1f2a7657: `verify --known-red` runs the base fresh (base-red, A autopilot). Base reuse was cut by the operator 10-10 (base-evidence-reuse "cut").
- 2026-10-25 248dfd8e: base-side green reuse (verify-waste receipts Q3, A autopilot), which reopens the 10-10 cut.
- 2026-11-09 68c3d11e: a nameless known-red is covered by a nameless base run (known-red-nameless, operator 1a-6a).
- 2026-11-21 b7480dca: the main-red cover. "A nameless main red is not covered" (red-exit Taken 7). A base pass runs only on a named repeat (Taken 8, operator N3 "yes").
- 2026-11-22 fb0874c1: only uncovered repeats count toward the base pass.

Main today: covers in src/verify.ts (`uncoveredMainRedUnits`) and the taken8 base pass (src/land.ts:143-218).

Cost: base-run, compare and red-record lived 3 days (23 commits on those files). 132 commits mention base/known-red/compare. #149 counts 91 base runs costing 7.2 h. 4 charts (red-base-wait, base-red, known-red-nameless, merge-lanes).

Tension: detecting red main and blaming nobody costs extra suites. Skipping that sends leaves to `failed` or repair for main's reds.

## C7. A red on base or main sends the leaf to `failed` vs never (high)

Timeline:
- 2026-10-01: check-proof Q2 2a. Red on base means `failed --reason "... red on base"`.
- 2026-10-10: red-base-wait/forks/waiting-leaf.md (operator): "I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main?" Pre-merge leaves never stop for a red main.
- 2026-11-21: red-exit Taken 3. A main red the cover does not reach "takes the existing operator-only `failed` stop".
- 2026-11-22 #147: two leaves ended `failed` on main causes. land-reds Taken 4 narrows the stop to "a unit red outside the land run".

Main today: skills/check-issue/SKILL.md:106-107.

Cost: #149 counts 18 `failed` visits on base red (11.4 h).

Tension: an honest state ("show exactly what is") against keeping the line moving.

## C8. Verify receipt reuse and scope (high)

Timeline:
- 2026-10-01: check-proof Q1 1a (operator). No check-record runner and no SHA reuse ("every #50 run was red").
- 2026-10-14 c00246dd: receipts are matched by tree and command set. Scope is not matched, and a green receipt is reused.
- 2026-10-25 fbac86c6: per-command reuse (verify-waste receipts Q1, A autopilot). 9aaed138 matches scope again.
- 2026-11-01 37d5975e: drops per-command reuse ("saved six 2-second commands", quick-red-skip/brief.md). d53072d9 judges "by one completed row, never by scope" (merge-reuse Q2, A autopilot).

Main today: one-row rule with no scope and same-tree merge reuse. The schema still parses `reused`.

Cost: 114 commits mention receipt/reuse. 3 flips on scope in 18 days.

Tension: skipping identical work, against stale evidence and the loss of flake signal (C1).

## C9. Fail-fast in verify vs "a failing run shows every failure" (high)

Timeline:
- 2026-10-03 and 2026-10-10: operator locks (framework verify-gate, merge-gate fail-fast), cited in verify-waste/forks/receipts.md Q2. Q2 is "not taken" on 10-24, and the operator answers "keep every member running after a red".
- 2026-11-01 37d5975e: `full` checks are `blocked` when a quick check is red. suite-repeats/forks/quick-red.md (A autopilot) "reopens the operator's 2026-10-24 answer".

Main today: blocked `full` checks.

Cost: 124.6 min of wasted suites was the stated driver.

Tension: complete failure reports against compute spend.

## C10. Merge queue place after a red (medium)

Timeline:
- 2026-10-05: merge-turn/forks/turn-release.md Q3 3a (operator). A new stamp on every move into merge.
- 2026-11-21: red-exit Taken 6 (A, "A's pick against an earlier operator answer"). The first return keeps the first stamp.

Main today: src/phase.ts:244-251.

Tension: fairness to the queue against first-entry latency.

## C11. Repair round cap (high)

Timeline:
- 2026-10-02: reviewer-repair/forks/round-budget.md (operator) keeps `fix_rounds` through recovery.
- 2026-10-10 2595d710: merge bounces count toward fix_rounds (bounce-counting 1a, operator).
- 2026-10-11 57e6523c and 2eb011ad: the cap is removed ("so check.fix commits as computed").

Main today: `fix_rounds` default 3 (src/config.ts:63) is read but bounds only direct-route rounds (skills/init-akrogon/SKILL.md:25). #149 says "read but never enforced". The lifecycle counter remains (src/phase.ts:238-241).

Cost: the cap lived 1 day after its widening.

Tension: bounding wasted rounds, against `failed` stops on caps that need no operator.

## C12. check.repair verify run before returning to merge (medium)

Timeline:
- 2026-10-14 278d5499: drops the check.repair verify run.
- 2026-10-15 fb236ec0: a repair move into merge needs a leaf receipt.
- 2026-11-01 de57a744: verify runs only on the merge move (suite-repeats repair-verify, A).
- 2026-11-21: red-exit Taken 4 skips the receipt for a no-edit return.
- 2026-11-22 b2266a29: "Route merge reds from kept evidence without a repair suite".

Main today: skills/check-issue/SKILL.md:91.

Tension: proof before merge against duplicate full suites.

## C13. Run evidence: delete vs keep (medium)

Timeline:
- 2026-10-02 5b2f4d0f: new-tab scratch wipe. 2026-10-14 c6981701 removes it because it deleted live captures.
- 2026-10-10: operator (check-env design, cited in run-check-kept-evidence/forks/kept-run-root.md): "always cleaned up unless it's logs ... I don't want any gigabytes on the disc".
- 2026-10-11 2c3a0afb: temp is "gone when its seat or check ends".
- 2026-10-15 7f4377c2: logs are packed into evidence.tar.zst (operator).
- 2026-11-15 and 2026-11-20: LESSONS.md:55 and :59 record that run-check deletes kept evidence.
- 2026-11-20 980e92b2: keep a red run's whole TMPDIR (#145, A autopilot).
- 2026-11-22 #148: kept red runs hold 29.4 GB (84% of 51 GB), mostly caches.

Main today: src/run-check.ts:466 (`.akrogon-kept`).

Tension: readable evidence against disk and teardown cost. The keep stores whole trees, not the evidence alone.

## C14. Short-lived builds removed within days (high)

- Tasks board herdr-app mod: built 11-03/11-04 (2011245a and about 12 more commits), deleted 11-08 (8c26bfb7, "herdr-app/tasks and its tests are deleted").
- Watch wake path: hc listener typed `/watch-issues tick` (e82ef65a, 11-08). Removed the same day in 3fdf8cd2, "the watch is cron only again". An hc timer cell replaced cron 11-20 (e03a2ccc, c512cd13).
- run-check short `/tmp` root: 021a3b43, reverted in 2c3a0afb the same day (C2).

## Patterns

- P1. Host load symptoms get fixed in the lifecycle layer. C1, C3, C6, C7, C11 and C12 all answer flaky, load-driven reds with lifecycle rules: reruns, base passes, `failed` stops, round caps, permits and holds. Each rule moves the cost (line time, PC load, LLM turns) somewhere else, and the next incident flips it back. The cause has stayed constant: framework suites flake under concurrent load on one PC (#147, #148: teardown timeouts, Chromium on disk). No cycle closed until load itself was addressed, and the land hold (11-22) is the first fix aimed at the cause.
- P2. Same-day operator reversals follow untested shapes. Permit, CPUQuota, both full-suite lines, the watch wake path and max_active 6 were each reversed within hours, once the operator saw the effect. All were taken without a measured probe (contrast merge-lanes N2, which gates two-suite runs on a probe).
- P3. Autopilot picks overturn operator answers or earlier picks without a new number. Examples: dc2e2b0c ("no recorded reason"), quick-red Q1 (reopens 10-24), receipts Q3 (reopens the 10-10 cut), red-exit Taken 6 (against 10-05) and temp-release (keeps disk on a lapsed reason). Some are sound, but each one invites the next flip.
- P4. Machinery outlives its premise by days. hold.ts (1 day), permit.ts (less than 1 day), base-run/compare/red-record (3 days), stacked-turn (4 days), Tasks board (5 days). Each was built as a full leaf with tests, then deleted with tests.
- P5. Each flip leaves residue: `retiredLeafTempRoot` (src/config.ts:382), `reused` and `members` still parsed, held.yaml inert, `fix_rounds` read but not enforced in the lifecycle, base-runs.jsonl deleted later (78b678ac).
- P6. The decision is shaped by whichever metric is newest. "Speed from first entry" (11-21) dropped reruns. "Fails only for code under test" (11-22) brought them back as P1. No standing record weighs line time, PC load and LLM spend together.

## Stable decisions (no reversal found)

- S1. akrogon.slice memory limits and CPUWeight=20 since 10-13 (systemd/akrogon.slice:6-9). #149 questions CPUWeight 20 vs app.slice 100, but it has not changed.
- S2. Worktree store outside the checkout, `~/.akrogon/worktrees/<repo>` (1191e8c0 10-11, cd6cdda6 10-22).
- S3. Verify receipts in verify-runs.jsonl as the gate to main (dc2e2b0c, ef51bf4a 10-14). Matching rules changed (C8), the gate did not.
- S4. Known reds never make a pre-merge leaf wait (operator 10-10). The `failed` edge moved (C7), but no wait state came back.
- S5. Command-owned merge: green merge with no seat (10-19, stack-fate 2a), extended to "merge holds no seat" (66f90be9). A one-way progression.
- S6. B repairs most Fixes in check.repair (10-02), widened 10-14 (eae753cc). No second reader of B's repair (foreclosed 10-02 and 10-14). #149 proposes widening B again (test expectation corrections), which keeps the same direction.
- S7. Role swap (A implements, B reviews/merges, 09-29) and one broadcast per completion (09-30).
- S8. Per-run systemd units with stop-run and the stale sweep (f7ae65e3 10-14). Evidence packing at close (7f4377c2 10-15). Release/rollback model (20263e45, f0cb5677 10-16).

## Inputs

Read:
- `git log --since=2026-09-20` (2,014 commits): subjects grepped for rerun/retry/flaky, TMPDIR/temp, admission/permit/slice/max_active, batch/stack/solo, base/known-red, receipt/reuse, evidence/capture, watch/timer, revert/restore.
- Full bodies or stats of about 45 key commits (cited above).
- `-G`/`-S` on leafTemp, max_active, fix_rounds and merge_covers. Add/delete history of src/base-run.ts, compare.ts, red-record.ts, permit.ts and hold.ts.
- Fork `## Taken` sections: merge-lanes (4), land-reds (2), base-red (2), red-base-wait (7), known-red-nameless coverage-rule, merge-throughput batch-size/red-main-hold/bounce-counting, merge-stacks stack-fate, merge-turn merge-order, permit-bypass (all), host-test-load (all), host-run-load full-suite-line, test-time-and-temp (2), temp-release (2), check-evidence (3), run-check-kept-evidence (2), verify-waste receipts, suite-repeats (3), reviewer-repair (3), seat-role-swap what-moves, round-rewrites (2), seat-a-left.
- CHART.md for merge-lanes, land-reds, lean-akrogon and system-speed. Grep only of overnight-recs CHART.md. land-reds INTAKE.md (#147). Seeds #148 and #149. closed briefs merge-batch/stacked-turn and suite-repeats/quick-red-skip. learnings/LESSONS.md (grep) and the learnings/history listing.
- Current src for state: src/land.ts, admission.ts, config.ts, next.ts, phase.ts, run-check.ts, systemd/akrogon.slice, skills/check-issue/SKILL.md.

Skipped:
- Most of the 119 chart folders' forks and slots (blind notes, rebuttals, maps).
- Nearly all closed leaf brief.md/design.md files (2 read).
- learnings/history file bodies.
- docs/ (current state was taken from src and skills instead).
- Framework repo charts (suite-regrowth and others) except where akrogon forks cite them.
- Charts outside merge/test/load topics (herdr, door, autopilot, budgets), which may hold further reversals in charting-process rules.

Low-confidence items: C10 and C12 sequences are inferred from commit subjects plus one fork each. For 6640ab5f (C5) no fork record was found, and its reason comes only from stacked-turn/brief.md.
