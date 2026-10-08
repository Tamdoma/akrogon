# Implementation report: hand-built-removal

Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad. Head: 2da133d (U2 a71dcbc, U1 2da133d). Mode: delegated, one wave of two workers (brief-1.md, brief-2.md). Both worker worktrees were removed after cherry-pick.

## Changed files and reasons

- `src/state.ts`: removed `hand_built` from the strict `stateSchema` (D1). A stored key is now an unknown-key error.
- `src/turn.ts`: removed the `hand-built` `Block` variant and its `eligibility` branch, which `mergeQueue` used (D2).
- `src/next.ts`: removed the dispatch branch that refused or waited on hand-built leaves (D2).
- `tests/status.test.ts`: new CLI test "a leaf with the removed hand_built key is unreadable while healthy repos remain visible" (criterion 1). Removed the field and its absence assertion from the `broken` fixture. The TURN-empty test now holds `manual` with `blocked-by` on a failed `hold` leaf (D3, D4).
- `tests/state.test.ts`: removed `hand_built` from the supported state in the lazy-migration test (D3).
- `tests/next.test.ts`: dropped the hand-built refusal and renamed that test. Collapsed the `hand_built`/`blocked-by` loop to the `blocked-by` case. Five epic-sibling `waiting` fixtures are held by `blocked-by` on a failed `hold` leaf (D3).
- `tests/batch-dispatch.test.ts`: `zz` holds `m1` back as a failed leaf (D3).
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`: removed the three hand_built mentions (D5).
- `docs/guide/state.md`: replaced the field bullet and example with one line pointing to `akrogon park <issue>` (D5). The worker dropped "It does not stop an agent already working" because `src/park.ts` refuses to park an issue with a running leaf, so the sentence would mislead.
- `docs/guide/problems.md`: "Confirm the leaf's issue is not parked." (D5)

## Criteria and evidence

| Criterion | Evidence |
|---|---|
| 1 | New test in `tests/status.test.ts:306`. The worker ran it before the schema edit and it failed (status exit 0), then it passed after. Included in the changed-tests run below. |
| 2 | `grep -rn "hand_built\|hand-built" src` prints nothing (rc=1). In `tests` the only hits are the three lines of the criterion-1 test, which must name the key. Dispatch and merge-queue tests pass. |
| 3 | `grep -n hand_built` over the four files prints nothing (rc=1). `docs/guide/state.md:46` names `akrogon park <issue>`. |
| 4 | Read-only grep for `hand_built` in `state.yaml` under `issues/{open,parked,closed}` of every `akrogon config` repo root printed no files. |

## Commands run

- `bun run typecheck`: rc=0.
- `bun run format`: rc=0. It also rewrote `src/status.ts:198` (`phaseColor` line wrap). That drift exists on base and is unrelated to this leaf, so it was reverted and not committed.
- `AKROGON_BASE=f57bb35... bun test --changed="$AKROGON_BASE" --timeout=30000`: rc=0, 426 pass, 0 fail, wall 26s.
- `bun test --timeout=30000`: rc=0, 533 pass, 0 fail, wall 31s.

## Known limitations

- Base has a format drift in `src/status.ts:198` that `bun run format` rewrites. Not touched here.
- One unreadable leaf makes its whole repo unreadable in `akrogon status` (existing behavior), so the criterion-1 test puts the readable leaf in a second repo.
- Note for review (from plan D4): the design says the `tests/status.test.ts:99/:145` fixture "becomes" the unreadable case. A separate test was added instead, because making `broken` unreadable would void that test's other assertions.
- `origin/main` is one commit ahead (27adeef). It has no hand_built lines. The merge rebase handles it.

## Unverified criteria

None.
