# map-size, proposed final shape after round 4

Operator answer (verbatim): "1a - but we need to do a test here first."

## Shape to record
Q1 = 1a (the job rule in slots/map-size-merged.md, O1 with the "After rebuttals" lines), held until one test is run. The skill edit happens only after the operator sees the result.

## Test (smallest replay, about 15 minutes, about $5)
- Intake: the merge-turn chart (Tamdoma/akrogon#57), handed off 2026-10-05. It is a typical code chart and had the largest peer maps (B 31.3KB, C 28.5KB).
- Surface: a private clone of akrogon at 923c6c9, the commit main held when the original maps were written (2026-10-05 17:09Z). Later commits are pruned from the clone, so the delivered merge-turn code and the merge-turn chart folder are absent. The seed text is copied from issues/chart/merge-turn/INTAKE.md.
- Mappers: two fresh sessions with no chart-cost context. B seat: codex gpt-6.1-sol at medium effort, as in the original. C seat: Claude Fable 5.1, as in the original. Each works blind in its own clone.
- Prompt: A's original map prompt, with one change. The sentence asking for "material forks (each with options, what each could break or invite later)" and outside research at the highest tier becomes the 1a job rule.
- Baseline, measured from the original transcripts: B 6.4 minutes, 9.5k output tokens, 31.3KB. C 4.7 minutes, 24.3k output tokens, about $4.6, 28.5KB.

## What the test must show, fixed before it runs
1. Missed decisions: the merge-turn chart took four forks (merge-order, issues-only, turn-release, dependency-setup). Each test map is checked for each of the four. 1a passes when the two test maps together name all four. A fork one seat's original map named and its test map lacks is listed.
2. Saving: minutes, output tokens, cost and map bytes per seat against the baseline. No threshold. The numbers are reported as measured.
3. Contamination: each test session's tool calls are checked for reads outside its clone that could reveal the delivered design.

## Known limits
One chart and one run per seat, so run-to-run noise is unknown. Fresh headless sessions and not the operator's panes. The framework evidence folder the original prompt named has moved from issues/open to issues/closed.

## Ask
Reply only with disagreements, each with evidence, on the shape to record, on whether this test can answer points 1 and 2, and on the pass rule. Write "No disagreement." when you have none. Do not run the test. Write to slots/map-size-final-check-<your slot letter>.md.

## After the peers' check (slots/map-size-final-check-B.md, -C.md), all accepted
- Point 1 is judged by substance and not by label: each map is checked against each merge-turn fork file's Question, and the matching line is quoted (B R1, C C2).
- Control: the same check runs on the original map-B.md and map-C.md first. 1a passes when the test maps cover at least what the originals covered, per seat and together (C C1). Material dependencies and lifetime pitfalls an original map held and its test map lacks are listed (B R1).
- The prompt keeps the original source rule (highest tier, practitioners first, the same named candidates). Only the map's job changes (B R2).
- Framework evidence is restored from the framework repo at e612d10ee (2026-10-05 18:41 local), the last commit of that folder before the original maps. Uncommitted live state at that time is not restored. C's original effort setting is not recorded in its transcript, so it is unmatched (B R3).
- B's dollars are unmeasured. B is reported in tokens by class and minutes. C's dollars are an estimate from fitted prices (B R4).
- The test measures the map turn only. The cost of map text re-read on later turns is not measured (C C3).
