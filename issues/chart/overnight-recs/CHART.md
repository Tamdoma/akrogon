# Chart: overnight recommendations (akrogon + pi-extensions)

## Destination
Do the overnight report's recommendations (issues/chart/system-speed/CHART.md Q1-Q5). Operator 2026-10-15 07:00: "Do all of these recommendations now. Use consultant B as your reviewer according to akrogon rules. Consult with all slots before implementation to see what the best most elegant systemic solutions are." Then: "Why would you keep merging parked?"

Consult: slots/brief.md, answer-A/B/D/E.md, merged.md, rebuttal-B/D/E.md.

## Decisions
- D1 (I1/P1, B,E; D moved to A's side, A conceded on E's evidence): a criterion whose proof lacks only a case, capture or recording on the existing runner and helpers goes under `Handed to A`. check.fix A writes that one case, red against a deliberate product break, with a Test-Change trailer citing the criterion line, and B re-reviews it in check.review. `failed` stays for absent machinery (runner, dispatcher, session or port pool, fixture factory) or another leaf's unmerged work. Why A and not B: 3 of the 5 stops needed a new live capture, which B may not run in check.repair (check-issue :79), and a B-written test that goes green moves to merge with no second reviewer (rebuttal-E.md, rebuttal-B.md F1).
- D2 (I2, A,B,D,E): no watch-issues change. Stop order lifted 2026-10-15 07:00 (A prompted wA:pF9).
- D3 (I3/P2, A,D,E; B wanted the default gone): pi keeps the 120 s default (it bounds a forgotten timeout after a 59 min silent install hang) and drops the 600 s ceiling. implement-issue :45 drops the background-and-poll recipe: the command runs once in the foreground with the tool timeout above its run time. No Claude setting change while no slot runs claude (B, D).
- D4 (I5/P4, B,D; E conceded no change): chart-issues :47 hands off a chart whose forks are all taken without waiting for charts that still hold one. No runnable-leaf buffer number.
- D5 (I4/P3, B,E implement; D park unless overridden; operator challenged the park): merge batching, all-or-holder, no caps, built as a lifecycle leaf (core merge code, about 150-300 production lines plus tests).

Route: direct for D1, D3 (skill text), D4. B pane: w8:pNQ (codex gpt-6.1-sol). pi-extensions part: ~/.pi/agent/extensions/issues/chart/shell-no-ceiling.

## Landing
- akrogon direct (D1, D3 skill text, D4, plus the own-modules guard fix found on the way): b128139, 64ec27a, 8f0b08e, d90a43b, pushed 2026-10-15 at d90a43b. B reviews slots/review-B-1..3.md (ready at round 3). Verify green on d90a43b.
- D5: lifecycle leaf issues/open/merge-batch/stacked-turn, committed 2d938d4.
Handed off 2026-10-15
