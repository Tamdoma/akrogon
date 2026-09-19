# Implementation report: brief-2 (failed leaves in next.ts)

## Changed files and reasons
- src/next.ts: activeCount excludes failed in readable filter and unreadable branch; dispatchLeaf skips observeBusy for failed; dispatchSlot passes attempts failure to commitMove.
- tests/next.test.ts: added 3 tests (readable capacity, unreadable capacity, blocked-pane observation) and extended the three-misses test with failure assertion.

Criterion 2 uses two repos to keep max_active 2 literal: failed plus malformed in repo, healthy in other. Single-repo would need max_active 3 because the healthy leaf itself counts in the unreadable branch.

## Tests run
Command (from worktree root):
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" with AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408

Result: 167 pass, 0 fail, 2312 expect() calls, Ran 167 tests across 5 files in 49.25s.

Tail output:
```
(pass) a failed leaf with its tab still open does not count toward max_active [629.73ms]
(pass) a failed leaf does not reserve capacity in the unreadable branch [643.69ms]
(pass) a failed leaf with a blocked pane is not seat-observed [351.97ms]
(pass) a stale prompt never re-prompts a busy or done seat, and three stale misses fail the leaf [~1337ms]
167 pass
0 fail
```

Red-green checks (filtered runs):
- crit1 failed before activeCount fix (tabs [first] missing second), passed after.
- crit2 failed before fix (tabs [failed-one] missing healthy), passed after.
- crit3 failed before observation skip (busy_since.B set), passed after.
- crit4 failed before dispatchSlot fix (failure undefined), passed after.

Typecheck: bun run typecheck clean.

## Known limitations
None known.

## Unverified criteria
None. All 4 criteria verified by tests above.
