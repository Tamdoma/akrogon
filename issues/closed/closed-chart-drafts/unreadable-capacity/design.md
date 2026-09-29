# Design: unreadable-capacity

## Binding decisions, verbatim

### unreadable-capacity (issues/chart/closed-chart-drafts/forks/unreadable-capacity.md)
Operator 2026-09-29, verbatim: `1a | 2a |`

Q1 1a: with an unreadable entry, a repo contributes readable leaves by the normal rule (not merged, not failed, live pane in recorded tab or worktree) plus one per unreadable entry. Unknown-population holds and foreign exclusion unchanged. Supersedes issues/closed/loop-hardening/chart/forks/dispatch-error-report.md:13. Reason: a broken neighbor gives no reason to discard known state. Foreclosed: 1b merged-only exclusion, 1c zero reservation.
Q2 2a: `findLeaf`/`allLeaves` keep refusing on any unreadable leaf, so `akrogon phase` and `akrogon status <slug>` stay strict. Reason: an unreadable file may hold the target slug. Foreclosed: 2b skip-and-continue.

### Excluded: archive-boundary, draft-contract
Keeping charts out of `issues/closed` belongs to leaf keep-chart-in-place. No door contract change. This leaf does not touch src/phase.ts.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no auth, secrets or browser flow are involved. The user-visible flow is `akrogon next`, exercised by real CLI invocations in the dispatch fixture (tests/next.test.ts `dispatchFixture`, `next`). Run `bun test tests/next.test.ts`, saving stdout and stderr to a retained file outside the fixture and repository, preserve the test command's exit status, and record the command, exit result and artifact path in the implementation report. The configured blocking checks must also pass. (A,B) The max_active 1 case and the preserved failed, foreign, duplicate and unknown cases are the mandatory negative and edge cases. No vanity tests: done-criterion 3 must fail on the current code.

## Leaf architecture
Owned: src/next.ts (`activeCount` only), tests/next.test.ts.
Interface: `activeCount(global, invocation): Promise<number>` keeps its signature. Per repo: `inventory.unknown ? global.max_active : live readable count + inventory.unreadable`.
Exclusions: no change to `discover`, `report`, `allLeaves`, `findLeaf`, error text or exit codes; no category exemptions for unreadable files by location; no docs edits (docs/guide does not state the old rule); no paths under `issues/`.
Dependencies: none. Runs in parallel with keep-chart-in-place.
Credentials: none.
