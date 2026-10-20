# Review A: slug-witness

Base: abfee125b4ab68bec34bd73325c077c12c74fc47 (origin/main at review). Reviewed head: c57794661a683bb5ee849f797cca10ee931a3ad5. Diff: `4b4a9160` tests, `c5779466` product.

## Findings

None.

## Evidence

- `src/pull.ts` diff inspected: the worktree guard and `git rev-parse HEAD` read are deleted; `closeSources` posts `delivered by ${leaf.state.slug}` through `closeSource`, matching locked decision 1a and `closeCommand`'s existing text. Signature unchanged, so `completeOwner`'s two call sites are untouched; closure stays before `packFolder`/`renameSync` (design mechanism preserved).
- `closeSource` retry path unaffected: `delivered by <slug>` is deterministic, so the `item.body === comment` dedupe on attempt 1 still works; covered by the updated `partial commented close` and `failed or malformed retry comment listing` tests.
- Old error text `Sourced completion requires a worktree` has zero hits in `src`, `tests`, `skills`, `docs`, README.
- Callers of `closeSources`: only `src/phase.ts:213` and `:218`, both inside `completeOwner`. The `next` merged-leaf branch (`src/next.ts:761`) and `phaseCommand` merged path (`src/phase.ts:717`) now reach `closeSources` without a worktree read — the #103 mechanism is gone.
- Test diff inspected: every `merged ${head}` expectation replaced by `delivered by <triggering slug>`; dead `head`/`firstHead`/`PLACEHOLDER` plumbing removed; false-expectation test rewritten per design ("deleted or rewritten with that reason") rather than deleted; new next.test case exercises the exact criterion-1 retry with `probe.worktree = f.root` so the `.git` check passes while still asserting open/closed ordering and `GH_HOST`.
- `Test-Change:` trailers present on commit `4b4a9160` for both changed test files, citing design close-witness 1a.
- No `AREA.md`, skill, or guide text describes the source-close comment as `merged <commit>` (docs/guide has no source-close comment description at all), so no doc changes needed.

## Verification evidence (A ran and confirmed)

- `check crit1-next-retry: 0` — `bun test tests/next.test.ts -t 'merged sourced leaf with no recorded worktree'`; red before on `Sourced completion requires a worktree` (log `check-crit1-next-retry-1792425039866-2960873.log`), green after.
- `check crit1-phase-sourced: 0` — rewritten phase-driven case.
- `check crit2-epic: 0` — both epic-attribution tests pass; shared sources close `delivered by two`, private `delivered by first`/`last`.
- `check crit3-no-merged-comment: 0` — grep clean outside `src/timing-report.ts` (merged-count summary, not the close comment).
- `check touched-phase-tests: 0`, `check touched-next-tests: 0` — all eight other updated sites pass.
- `akrogon verify` on c5779466: green receipt (format 0, test 1053/0, typecheck 0).

## Verdict

ready
