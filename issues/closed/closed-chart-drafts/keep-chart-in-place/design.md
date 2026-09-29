# Design: keep-chart-in-place

## Binding decisions, verbatim

### archive-boundary (issues/chart/closed-chart-drafts/forks/archive-boundary.md)
Operator 2026-09-28, verbatim: `1a - but what will happen then, where will they stay? How is it gonna work? | 2a |`

Q1 1a: `completeOwner` stops moving `issues/chart/<owner>` into `issues/closed`. Charts stay in `issues/chart/<slug>/` permanently. Completed lifecycle records still move to `issues/closed/<owner>/`. Reason: removes the only path by which chart files enter a scanned area, and matches the door contract that charts stay in place. Foreclosed: 1b reader exclusions for `closed/<owner>/chart`, 1c door-only rule as the boundary. Already archived charts under `issues/closed/*/chart` stay where they are.
Q2 2a: completion writes no `Closed` marker. Reason: not needed by #39, and `Handed off` stays accurate history. Foreclosed: 2b completion-authored marker.

### draft-contract (issues/chart/closed-chart-drafts/forks/draft-contract.md)
Operator 2026-09-29, verbatim: `1a`

Q1 1a: no door contract change for #39. Reason: after archive-boundary a draft state.yaml in a chart cannot reach dispatch, and correctness must not depend on agents following wording. Foreclosed: 1b clarify "scratchpad" to chart slots, 1c state.draft.yaml bundles.

### Excluded: unreadable-capacity
The capacity rule (src/next.ts:273-274) and strict `findLeaf` belong to leaf unreadable-capacity. This leaf does not touch `activeCount` or `allLeaves`.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no auth, secrets or browser flow are involved. The user-visible flow is the CLI. Done-criterion 3 exercises real `akrogon phase`, `akrogon next --all` and `akrogon status` invocations in an isolated fixture repo (tests/helpers.ts). Run the test file containing this regression with `bun test`, saving stdout and stderr to a retained file outside the fixture and repository, preserve the test command's exit status, and record the command, exit result and artifact path in the implementation report. The configured blocking checks must also pass. (A,B) The duplicate-slug draft and the invalid-depth leaf are the mandatory negative and edge cases. No vanity tests: the new regression must fail on current code because completion moves the chart into the leaf inventory, and pass after the fix. Supporting setup and preserved-behavior assertions need not fail before the fix. (A,B)

## Leaf architecture
Owned: src/phase.ts (`completeOwner` only: remove the chart rename and the now-unused `chart` binding and any imports left unused), tests/phase.test.ts, and tests/next.test.ts only for the new regression test if placed there.
Exclusions: no reader exclusions in `discover`, `leavesUnder`, status or park; no `Closed` marker; no migration of existing `issues/closed/*/chart` folders; no skill or docs edits (docs/guide does not describe the move); no paths under `issues/`.
Dependencies: none. Runs in parallel with unreadable-capacity.
Credentials: none.
