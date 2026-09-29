# Review B: unreadable-capacity

Base: 53508e807128de2a77b22cf4874e266224cf4f0e
Head: 0a55e38b519f3f9b26284b82fc836e4901d0b0c2
Verdict: ready

## Scope check

Diff touches only `src/next.ts` and `tests/next.test.ts`. No `AREA.md` in diff, so no area path audit applies. No paths under `issues/`, no `src/phase.ts`, no `src/state.ts`, no docs. `findLeaf` and `allLeaves` live in `src/state.ts` and are untouched, so strict lookup stays as locked.

## Behavior check

`activeCount` now uses one shared predicate for readable leaves (not merged, not failed, live pane by tab or worktree cwd) plus `inventory.unreadable`, with full hold on `inventory.unknown` and on `registered.unknown`. This matches plan D1 plus D2 and design Q1. Each leaf counts once. `discover`, `report`, stderr shape, and exit codes are untouched per D3.

## Tests check

- B2 update at 699 now expects one tab at `max_active` 2. Tabs count proves one allocation since tab creation follows worktree creation. Retry at 4 still allocates both.
- B3 split at 1111 expects one tab plus one prompt at 3 and two plus two at 4, with the capacity 5 retry kept only for 3. Matches the new arithmetic of one live plus two unreadable.
- B4 update at 1353 admits `healthy` with worktree plus one tab plus one prompt while keeping the malformed skip plus foreign count 2 and exit 1.
- B5 regression uses two repos at `max_active` 3 with one malformed plus three merged plus two waiting in the first repo and one waiting in the second. Explicit dispatch order proves both allocate and the third stays blocked with malformed skip and nonzero exit. Report shows red on old code with `other` worktree undefined, which matches the old branch counting merged history.
- B6 negative at `max_active` 1 asserts zero tabs, zero prompts, one skip, exit 1.
- Tests use real CLI runs with fake herdr at one boundary and assert allocation plus skips plus exit codes. No mocks of the unit under test and no prose wording checks.

## Docs check

No documented behavior changed. `docs/guide/next.md` and `docs/guide/limits.md` describe `max_active` only as a global limit with existing tabs continuing. Neither states the old unreadable rule, so no doc edit is needed.

## Verification evidence

- Report base and head match live. Base is ancestor of head. Worktree clean.
- Retained log `/tmp/unreadable-capacity-next-20260929.log` exists with 136 pass and exit 0.
- Live spot runs at reviewed head: new regression 1 pass, new negative 1 pass, all `unreadable` named tests 5 pass, both bad-YAML capacities 2 pass.
- Report full suite 328 pass across 15 files with format plus typecheck clean. No rerun of the full suite needed since head is unchanged and evidence is complete.

## Findings

None. No Fix and no Nit.
