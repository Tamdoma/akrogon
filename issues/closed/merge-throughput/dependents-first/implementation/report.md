# Implementation report: dependents-first

Base: `2e78945849eed87c42abd56f224909f4d2050b36` (AKROGON_BASE). Head: `e8d8768`. Mode: delegated (subagents), 2 waves.

## Changed files and reasons

- `src/turn.ts` — new exported `dependentCounts(leaves)`: inverts `blocked-by` edges among `phase !== 'merged'` leaves into dependents-adjacency, DFS per leaf with a `seen` set, count = reached leaves minus self. `mergeQueue` comparator: batch-record first, then count desc, then unchanged merge_stamp/log/slug (D1, D2).
- `src/next.ts` — `sweep` computes `dependentCounts(discover(repo, invocation).leaves)` once per call and adds count-desc as second sort key after the merged key; stable sort keeps prior visit order for ties (D3, D4).
- `docs/guide/merge.md` — merge-turn paragraph rewritten: batch record keeps the turn, else most unmerged direct/transitive `blocked-by` dependents, ties by merge stamp → `to: merge` record → slug.
- `docs/guide/next.md` — "How order is decided" gained the dependents-first dispatch sentence.
- `docs/guide/state.md` — `merge_stamp` now described as the tie-break in the dependent-count ordering.
- `tests/batch-dispatch.test.ts` — `dep` blocked-by `['m2']` → `['m2', 'holder']`: under count ordering the member would rightly take the hold; tying the counts keeps the earlier-stamped holder first while preserving the member-dependency coverage (U1 mismatch F1).
- `tests/pause-next.test.ts` — same one-token fixture repair: `['member']` → `['member', 'holder']`.
- `tests/dependents-first.test.ts` — new file, 5 tests: C1 queue count order, C2 batch record first, C3 merged dependents not counted, C4 `next --all` dispatch order via fake-herdr prompts, C5 docs describe `blocked-by`/`transitively`.

## Commits

- `2245897` U1 code (worker Sam)
- `a84ee97` U2 docs (worker Gandalf)
- `a2b48ea` fixture repair for U1 mismatch F1 (A, Test-Change trailers)
- `bdf4040` U3 tests (worker Legolas)
- `e8d8768` dispatch fixture typing fix (A)

## Commands run and results

- `bun run typecheck` — pass (final head).
- `bun run format` — pass; rewrote pre-existing prettier drift in `src/status.ts` (long `phaseColor` line), reverted per LESSONS.md 2026-10-08.
- `AKROGON_BASE=2e78945… bun test --changed=$AKROGON_BASE --timeout=30000` — 47 pass, 0 fail.
- `bun test --timeout=30000` — 608 pass, 0 fail, ~40 s wall time (recorded: suite sized minutes).
- `bun test tests/docs-links.test.ts --timeout=30000` — pass (U2).
- Deliberate-break evidence (worker, all reverted): removing the mergeQueue count key reddens C1; removing the batch key reddens C2; removing the `!== 'merged'` filter reddens C3; removing the sweep key reddens C4.

## U1 mismatch F1 (resolved by A)

Two existing fixtures blocked their dependent only on the intended batch member, which under the locked ordering correctly takes the hold (member count 1 > holder 0) and the tests read `holder.batch` → undefined. Repaired by blocking the dependent on member and holder: counts tie 1-1, earlier stamp holds, member-dependency assertions preserved. No locked decision changed.

## Worker worktrees

`dependents-first-u1`, `-u2`, `-u3` all removed after landing. Worker reports: `report-u1.md`, `report-u2.md`, `report-u3.md` (inside the removed worktrees; key contents folded here).

## Done-criteria → evidence

- C1 (X with 2 transitive dependents ahead of earlier-stamped Y): `tests/dependents-first.test.ts` "TURN places the merge leaf with more unmerged dependents first despite the later stamp".
- C2 (batch record on Y stays first): same file, "keeps the batch record holder first".
- C3 (merged dependents not counted): same file, "ignores merged leaves".
- C4 (dispatch visits more-dependents first): same file, "next --all dispatches … many before … few", fake-herdr prompt order.
- C5 (status places + docs): the TURN assertions above exercise `akrogon status`; docs test asserts both guides describe the ordering; live wording verified in commit `a84ee97`.
- C6 (blocking checks): all `checks` commands run, all green (no `setup` configured).

## Known limitations

- Dependent counts ignore parked/missing/unreadable slugs (no leaf folder = no edges). Planned open limitation, kept.
- `sweep` runs one extra `discover` per call (also in `dispatchDependents` chains); leaf sets are small, no cross-call caching (D4).
- C4's red/green pin relies on tmpfs readdir order (documented in a test comment); the green assertion itself is order-independent.

## Unverified criteria

None.
