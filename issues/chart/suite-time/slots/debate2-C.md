# Slot C debate (second run): ranked list of separately deliverable improvements

Evidence date 2026-10-25. Sources: my map (map-C2.md), map-merged.md, map-rebuttal-B.md, debate-B.md, plus spot checks noted per item. No repository edits, no full suite run.

## Corrections I accept
- A: files run one at a time and per-file time is wall time (JUnit file times sum to 192.9s against 191.9s wall). This removes my map-C2 caveat that peer-wait wall gain was uncertain under concurrent files. My earlier "wall uncertain" for peer-wait was wrong.
- B F2: the peer-wait cost is the test-supplied '11' budget argument, not IDLE_GRACE_MS. This matches my own grep (13 literal '11' sites in tests/peer-wait.test.ts). No production grace knob is needed.

## Options: keep or drop

### O1a. Shorten peer-wait test budgets. KEEP.
- Gain: baseline file wall 22.8s (A). If all '11' budgets shrink, file time falls over 70%, meeting 20% on the file baseline. About 18s off a 192s suite, roughly 9% of every full-suite run, so no 20% at suite level alone. My single-file run agrees with A's file time: 22.6s wall, 3m15s user CPU, 37 pass.
- Condition B leaves implicit: the file wall is set by its longest test, "carried exchange binds the original turn on rerun" (tests/peer-wait.test.ts:730) at 22.3s, which waits out '11' twice. If that case keeps 11+11, shrinking the other 16 cases saves almost no wall time. The leaf must include the carried-exchange budgets, or it will prove roughly nothing.
- Size: one test file, 15 to 35 lines. Risk: a budget that expires before the subprocess reaches the intended branch passes for the wrong reason. Removed by keeping outcome, exchange and signal assertions, choosing budgets above measured startup time (B measured a proven idle failure at 123.54ms against the 11,060.77ms budget exhaustion), and proving file wall time after.
- Dependencies: none. Multiplies with O6, do not add the two savings.

### O1b. Split the nine-case "named target equivalence" test. KEEP.
- Gain: baseline tests/next.test.ts 49.2s (A), my single-file run 46.4s wall, 246 pass. Split into nine concurrent tests, projected file time about 30s, 39% on the file baseline, meeting 20% there. About 19s off a 192s suite, roughly 10%, not 20% alone. Projection, not measured.
- Extra quality gain B does not claim: this test took 28.5s in the green log of 2026-10-25 and sits against the 30s per-test timeout. `akrogon flaky` carries it with flip count 3. Nine cases at roughly 3s each remove that timeout risk.
- Size: one test file, 15 to 40 lines. Risk: nine fixtures at once add contention, and A already saw 1 new failure when raising next.test concurrency to 64. Removed by keeping the existing concurrency limit of 20 and requiring zero new failures plus preserved nine-case coverage, not only a faster wall time.
- Dependencies: none.

### O1c. Compress the two 10s discovery-deadline waits. KEEP, conditional, last of the O1 parts.
- Gain: baseline tests/session-routing.test.ts 10.2s (A), projected 2.6s, 74% on the file baseline, about 4% of the suite. Mechanism unproven.
- Size: 2 to 3 files, 30 to 80 lines (B's estimate). Risk: an env seam for DISCOVERY_DEADLINE_MS (src/shell.ts) is inherited by production (B F3). Removed only by a test-controlled subprocess or clock boundary that production cannot pick up, with the real timeout path still asserted once. If no such seam is small, drop O1c in the leaf rather than ship a public setting.
- Dependencies: re-measure after O1a, O1b and O6. Combined O1 parts give roughly 37 to 45s off 192s (19 to 23%), so the 20% suite claim needs O1c or a full O1a. Do not promise it per part.

### O3. Move `test` from checks to merge_checks. KEEP as operator policy option only, not in the ranked implementation list.
- Gain: leaf-scope test time is 8.88h of 11.78h in-verify test time (75%, my E1 join; B got 75.36% by receipt scope). Deleting it clears 20% on raw verify compute by a wide margin. Net lead time after later failures is unproven.
- Confirmed today by reading src/run-check.ts `runCheck` refusal (lines 154 to 159): an argv equal to a merge_checks entry is refused through run-check. Under O3 no seat can run the boxed whole suite at leaf stage, and check.review would judge leaves with no suite evidence at all, not just later evidence.
- Risk nothing removes: the 39 leaf-scope test reds out of 190 runs (E1) surface in the serialized merge turn instead, and the current clean merge record (53 of 53 merge attempts merged since Oct 14, issues/merge-attempts.jsonl) was produced with leaf-stage suite filtering in place. It also reverses the operator decision of 2026-10-14 (commit 7ad17efc, per map-merged).
- Size: under 10 lines in issues/config.yaml. Dependencies: largely supersedes O6 (only merge-scope format reds would remain, 3 of 61 merge runs) and O2. Requires the operator's explicit policy call per Q1 in my map.

### O4. Fix the status overview clock-skew test. KEEP.
- Gain: about 100% of this one failure cause, meeting 20% on that named quality baseline. Fleet-wide it is 8 sole-failure runs of 53 red test receipts (15.1%, B), 1,502s of failed test execution plus 8 seat round trips. Not a 20% fleet gain.
- Spot check today: tests/status.test.ts fixture helpers sample `Date.now()` separately per record (lines 40, 56 and 82) while src/status.ts samples its own now (line 470) and floors elapsed minutes. One captured epoch in the fixture helper removes the skew class, not only the overview test.
- Size: one test file, 10 to 25 lines. Risk: weakening the elapsed-time assertion. Removed by keeping exact expected minute values computed from the captured epoch. Dependencies: none. Also the #1 name in `akrogon flaky` (5 flips, my E4), so this directly shrinks the flaky list the operator already sees.

### O5. Raise per-test timeouts in load-sensitive files. DROP.
- Agree with B. No measured gain, it masks real slowdowns, and my concurrency count (map-C2 C5) shows fails are not concentrated at high check concurrency. After O1a, O1b and O4, any remaining timeout gets investigated by name.

### O2. Cross-scope receipt reuse. DROP entirely, not low priority.
- B's own rebuttal F1 settles it: exactly one completed merge run in the whole ledger had earlier leaf greens on the same tree, worth 200.576s against 10,746.823s of merge verification (1.87%). My count agrees in shape (one leaf-to-merge same-tree pair). A receipt-semantics change for a case that may not recur in the next 50 leaves cannot prove its benefit, and O1 plus O6 shrink its absolute value further.

### O6. Fail-fast verify on first red sequential check (my C1, re-counted by A). KEEP.
- Gain: named baseline is red-run verify time, 5.06h over 90 red runs. Test time burned inside the 48 format-red runs was 2.01h, so removing it cuts red-run time about 40% and meets 20% on that baseline. On all-verify time (12.1h, 251 runs) it is 17%, stated plainly. Average saving is 28.8s per verify run (2.01h over 251 runs), larger than O1a or O1b per run, and red feedback on cheap-red trees drops from about 155s to about 4s.
- This is measured burn, not a projection: every result on a format-red tree is discarded because the format fix creates a new tree. O1's savings, by contrast, are estimates until proven per file.
- Size: src/verify.ts 15 to 25 lines (break the sequential loop in `runOnce`, record the rest as blocked, the pattern already used there for merge_checks members), tests/verify.test.ts about 40 lines, issues/config.yaml reorder so typecheck precedes test.
- Risk: production gate code, unlike the test-only O1a and O1b. A blocked entry must never read as green. Removed by existing mechanics (`greenEntry` requires exit 0, blocked carries the blocker's nonzero exit, flaky and known-red already skip blocked), pinned by a test in the leaf. Also (P1 in my map): a test red hiding behind a format red surfaces one cycle later, on the rerun that must happen anyway.
- Dependencies: none to implement. Multiplies with O1 (after O1, O6 saves 19% of runs times the shorter suite). Loses most of its value if O3 is adopted.

## Other candidates from my map
- My C4 (review to repair loops: 57 against 43 to merge since Oct 12, issues/log.jsonl): still backed as the largest agent-cost pool, still not deliverable. Cause is unclassified, so it stays an investigation item (sample closed review Fix items), not a ranked leaf. Agree with B D3 that no seat, prompt or repair-round change can claim a proven 20% today.
- The 25 verify runs with no end and no commands (my E12, latest 6 on Oct 24): not ranked. If not a known stop-run pattern, seed it. It can distort O6's after-measurement either way (pitfall P5 in my map).

## Where I disagree with B's ranked list
- G1. B's list has no O6 (debate-B predates A's O6 assignment). Inserted above at rank 2: its per-run saving is ledger-measured at 28.8s averaged over all verify runs, larger than O1b's projected 19s, and it is the only option that shortens the seat feedback loop itself. It sits below O1a only because it changes production gate code while O1a touches one test file.
- G2. B keeps O2 at rank 5. Dropped here: B's F1 shows one eligible run ever, so even a perfect O2 leaf may show zero observable saving in its own proof window. A candidate that cannot prove itself does not belong on a delivery list.
- G3. B ranks O4 third, above O1c only. I put O4 fourth, after O1b: 1,502s of failed execution over the full window is smaller than O1b's projected saving and O6's measured 7,216s. O4 is still worth doing early in calendar terms because it is tiny and independent, so this is ordering, not opposition.
- G4. B's O1a target of a 3 to 5s peer-wait file implies shrinking every '11', including the carried-exchange double wait that sets the 22.8s file wall. B does not state this condition. Without it, O1a's wall saving is close to zero and the whole O1 combined estimate of 23% fails. This is the single easiest way for O1a to be done and prove nothing.
- Agreement: O5 dropped, O3 held for the operator as policy (not counted toward any combined 20%), O1 split into three leaves with per-file baselines and no double counting against O3 or O6.

## Final ranked list
1. O1a. Peer-wait budgets, carried-exchange case included. Test-only, proven cause, about 18s off every suite run. Proof: file wall from 22.8s toward 5s and identical outcome assertions.
2. O6. Fail-fast sequential checks in verify plus cheap-first config order. About 40% off red-run verify time, 17% off all verify time, red feedback in about 4s. Proof: next 100 or more ledger runs, test seconds on format-red runs near zero, merge reds not up from the 53 of 53 baseline.
3. O1b. Split named target equivalence into nine concurrent tests. Projected 49.2s to about 30s for the file, and removes a 28.5s test from against the 30s timeout. Proof: file wall down, nine cases present, zero new failures, flaky count for this name stops growing.
4. O4. One captured epoch in the status test fixtures. Removes the top flaky name and 8 sole-failure false reds per window. Proof: repeated targeted runs green, overview name leaves the flaky list as old flips age out.
5. O1c, only if a production-proof test seam is shown in the leaf. Otherwise drop it and accept O1a plus O1b at roughly 19% of suite wall, with O6 carrying verify time past 20% on the red-run baseline.
Not ranked: O3 pending the operator's policy decision (largest raw saving, weakest proof at leaf stage). Dropped: O2, O5. Investigations, not leaves: repair-loop Fix classification (C4) and the 25 no-end verify runs (E12).
