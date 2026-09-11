# Review A: isolated-dispatch-errors

Base: `8eebd88033301dfd7dbe943641d3028bf4b3a041`
Reviewed head: `6c0da772348e72b8fbaf9b7365b0549cbf054842`
Debate: no, so no positions or rebuttal input.

## Verdict: nits

## Verification

- Diff: only `src/next.ts` and `tests/next.test.ts` changed, matching the brief change list. `src/state.ts`, `src/config.ts`, `src/phase.ts` and docs untouched.
- D3 lock boundary: the `try` in `dispatchLeaf` sits inside the `withLeafLocks` callback; `withRepoLock`/`withLeafLocks`/`withLock` calls are outside every catch. `completeOwner` and `recoverMerge` in `src/phase.ts` take no locks, so no lock helper runs inside a recoverable boundary. Cleanup catch encloses only `cleanupMerged`.
- D4 capacity: unreadable leaf adds readable count plus one marker per unreadable; unknown directory or registration adds `max_active`. Confirmed by code and by the capacity 3/4 tests.
- Reran `bun test tests/next.test.ts`: 34 pass, 0 fail, 245 assertions. B's `format.log`, `typecheck.log` and `full-tests.log` (77 pass) are present and consistent with the report.
- Own temp-repo CLI runs against `bun src/akrogon.ts next` with fake herdr:
  - explicit hand-built target: exit 1, one JSON record with slug and original message.
  - healthy `--all`: exit 0, empty stderr, one prompt.
  - merged leaf whose owner has a malformed member: two records (malformed path without slug, merged leaf with slug carrying the completion failure), exit 1, dispatch continues; new tab withheld at default `max_active` 3 because occupancy is 3 readable + 1 unreadable, as D4 specifies.
  - explicit dependent on a readable unmerged dependency: JSON record naming the dependent, exit 1.
- Dedup: repeated `discover` across cleanup, two sweep passes and per-dispatch inventory printed each path once.
- Tests are real subprocess runs with isolated fixtures. The only `mock.module` targets `readRepo` in `src/config.ts` to inject a non-Error throw, not the unit under test. `cli-artifact.log` records exit 1, the broken-dependency record and the healthy prompt (A8).
- A1–A8 each have a corresponding regression test; A6 covers global/repo/leaf acquisition via dangling `.lock` symlinks, finalization via a fake `flock` exiting 7, invalid hook event and non-Error throw.

## Nits

- N1. Folder selection with zero matching leaves returns silently when any unrelated leaf in the repo is unreadable (`selected.length === 0` early return keyed on `inventory.unreadable || unknown`). The brief approved this for an unresolved slug; for a folder input the operator loses the `No leaves match` diagnostic for their actual argument while exit is still 1 from the unrelated record. Reason: diagnostic loss, not wrong dispatch, so not blocking.
- N2. `tests/next.test.ts` asserts akrogon prose in two places (`toContain('Missing leaf')`, `not.toContain('Missing')`). OS codes and git output substrings are fixed references and fine. Reason: wording assertions are brittle per check-issue rule, but the tests otherwise assert parsed fields and prompt records.
- N3. Explicit-target failures (hand-built, unmet dependencies, multiple tabs) now surface as JSON skip records with exit 1 instead of thrown rejections. `docs/next.html` says the reason is printed, which still holds, but B may want a one-line doc note that `next` emits one JSON line per skipped scope and exits 1. Doc authorship stays with B.

No lesson claim to verify in the report.

## Merge (slot A)

Rebased `6c0da77` onto `origin/main` `31a6873094a6185fecbe39cac1a9281d919c9b47` without conflicts, new head `f9e7ddd`. Upstream moved code including `tests/next.test.ts`, so every check ran fresh with `AKROGON_BASE=31a6873`:

- `bun run format`: exit 0, worktree unchanged.
- `bun run typecheck`: exit 0.
- `bun test --changed=31a6873`: exit 0, 35 pass, 0 fail, 250 assertions.
- `bun test`: exit 0, 86 pass, 0 fail, 935 assertions.

No advisory checks configured. No merge nit reusable as a lesson.
