# archive-boundary: merged round (A,B)

## Q1. Which layer keeps chart files out of the leaf inventory?
- 1a (recommended, A,B): stop `completeOwner` moving `issues/chart/<owner>` into `issues/closed/<owner>/chart` (src/phase.ts:173-174). Both leaf scanners already read only open/closed (src/next.ts:110-113, src/state.ts:104-107), so chart files never reach them. Matches the door contract that charts stay in place (SKILL.md:67, shapes.md:15,36) and keeps closed charts visible to `status --charts`, which reads only issues/chart (src/status.ts:275-285). The move came in a2b9e07 "sync issues" with no stated reason.
- 1b (A,B): keep the move and exclude the archived chart subtree in `discover` and `leavesUnder`, reaching status, phase lookup and park (src/park.ts:39-42). Adds a reserved-path rule every reader must honor and makes `chart` a reserved slug.
- 1c (A,B): rely on the door writing no draft state.yaml. Insufficient alone, since the incident shows a door did it. Belongs in draft-contract.
Pitfalls (A,B): 1a does not repair already-archived charts. None in any registered repo holds a state.yaml today. Tests at tests/phase.test.ts:169-185 and 638-683 assert the move and must change. Keep invalid-depth diagnostics for real misplaced leaves (tests/state.test.ts:114-135).

## Q2. Does completion append `Closed <YYYY-MM-DD>` to the retained CHART.md?
- 2a (recommended, A,B): no. The issue does not ask for it, `Handed off` stays accurate history, and completion is already recorded by merged states and the closed owner.
- 2b (A,B): yes. `status --charts` already renders a last `Closed` marker (src/status.ts:267-272). Cost: a new producer whose failure after `renameSync` cannot retry because `completeOwner` returns early for closed leaves (src/phase.ts:139) (B).
