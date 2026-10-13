# Intake: leaf-speed

## Scope
Cut post-implement time and test rounds per delivered framework leaf. Destinations: akrogon (lifecycle measurement, chained-unit policy, revisit rule for leaves-as-chunks) and framework (check config, test selection, test environment). Split proposed in round 2.

## Provenance
- Operator: /chart-issues invocation, 2026-10-12, akrogon pane w8:pNP

## Source: operator 2026-10-12
Look at the discussion I had with the watch framework tab inside of the framework workspace. I want to see if we can speed up the process by eliminating chunks and using leaves instead.This is just my idea, but I'm open on doing any kind of a revamp that will speed up the process of implementation, which will not trigger as many tests, or better said, test rounds, as today. I want you to base everything on the actual logs from the previous two or three weeks of work. Spawn consultant b in this tab as a new pane (codex gpt 6.1 sol high effort, which is probably default). Also spawn consultant c (pi, muse wonder full contributor, xhigh effort), and consult with them. This is very important, so give me the data that I really need.

## Agent findings
Window 2026-09-21 to 2026-10-12. Sources: framework and akrogon `issues/log.jsonl`, framework `issues/merge-attempts.jsonl`, seat transcripts, framework config git history. Full maps and rebuttals in `slots/`.

- Akrogon, 106 leaves: median end to end about 25 min, merge about 2 min. Framework, 239 leaves: median 3.0 h, p90 11.4 h.
- Framework post-implement median by period: before Oct 2 (no `framework:verify` merge gate) 17 min, ejections 0.01/leaf. Oct 2 to 10: 190 min, 0.77/leaf. Oct 10 to 12: 90 min, 0.25/leaf. After #87 (n=4): 33 min, 0. Implement time unchanged across periods.
- Merge is 37% of logged leaf time. 245 of 436 merge-phase leaf-hours sit before the first merge prompt (cause not traced). Full verify median 8.2 min.
- 90 ejections, low-confidence classes: environment 25, leaf defect 17, stack/newer base 15, flaky 10, red base 3, unknown 20. Since Oct 10 (8): 5 leaf defects, 2 newer base, 1 timeout.
- Chunks: about 4 min seat time per extra unit, about 12 min per median leaf. 137 of 203 multi-worker leaves overlapped units.
- Framework `checks` run parity and contracts 3 to 4 times per pass (`parity`, `contracts`, inside `test`, inside `cheap`).
- #87 (`test_changed: bun run test:changed`) committed and pushed in framework 66c03e7a8 on 2026-10-12 22:59 +0200. `test:changed` selects all 138 scripts when a shared doc changes.
- Plan time is not in the log. Transcripts give a median of about 4 to 9 min.
