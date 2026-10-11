# Rebuttal, slot C

No disagreement with the root cause or L1-L3. Four lost points and one wrong line.

1. Facts line 5 undercounts. F9 was also A-introduced harness code (review-B.md:288 "introduced by A's `1390f1235..4857af300` repair"). All six post-round-1 findings (F7-F12) came from A's repairs, zero from product. Cites should be review-B.md:224, 288, 309-327.

2. Outflow rate lost. The measured rate per check.fix round: round 1, 263 min to run 1 of 6 real cases to 14/15 assertions (report.md:59,61); round 2, 230 min to run 6 cases to 3 PASS, 3 PARTIAL (report.md:67-74); criteria 2-7 closed in neither. Add to Stock and flow, it is the number that shows the stock is not draining.

3. B2 lost its rule cite. `chart-issues/SKILL.md:69`: the live-run estimate at handoff is "information only, it never times out a leaf and never waives a criterion". That is the explicit statement that time is not a target anywhere in the system, and the only time target ever set was A's own 30-minute budget, which B correctly rejected under the rules (review-B.md:226). Both seats were right by the rules, which is the finding. Restore under B2 or B4.

4. B5 understates the notice. `src/next.ts:246`: it fires once, then `busy_notified` suppresses it until the pane goes idle. For this chart that detail matters: the notice cannot even repeat, let alone act.

5. Facts line 6 tags "siblings in the same area finish phases in 5-80 min" as C by position. That comparison is B's, not mine. My pattern evidence is the 353-leaf distribution (check.fix median 24 min) and the three tail leaves' plans and reports.
