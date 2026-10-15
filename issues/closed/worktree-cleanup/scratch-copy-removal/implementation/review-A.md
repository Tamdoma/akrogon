# Review A — scratch-copy-removal

Base: `dace0f7` (rebased lane; original `AKROGON_BASE=f3557d8`). Reviewed head: `fa9a4a7`.
Diff: `git diff dace0f7..HEAD` — `src/reconcile.ts`, `src/batch.ts`, `README.md`, `src/AREA.md`, `tests/reconcile.test.ts`, `tests/batch.test.ts` (+481/-47).

## Evidence
- `akrogon verify` receipt on `8e296df` (same tree as `fa9a4a7`, trailer-only commit on top): `verify leaf 8e296df…: green` — 856 tests, format, typecheck.
- `tests/reconcile.test.ts` 30/30 green and `tests/batch.test.ts` 14/14 green under `akrogon run-check --name 'test'` during implement.
- AREA.md trace: every path `src/AREA.md` names exists; `<slug>-u<N>` is a naming pattern, not a dead pointer. README paragraph matches the code: `verify-*`/`batch-*`/`<slug>-u<N>` force-removed by owner state behind live-pane and process vetoes.
- All 9 done-criteria have a boundary test (`next --all` + `status`) and each is green; the deliberate-break proof for criterion 6 is recorded in plan.md.
- `Test-Change` trailers in `dace0f7..HEAD`: `b688f9d` (planned tests), `48e3181`, `64ab23a`, `8e296df`, `fa9a4a7` — each names its changed test path and source; the frozen-citation gate passed at `implement → check.review`.
- Ordering verified in `src/batch.ts`: `checkLocation` → `mkdirSync` → `writeOwner` → `createSparseWorktree`, `rmSync(owner)` in `finally` after `git worktree remove` — the node_modules refusal still throws before the store dir is created (regression test green).

## Checks against the plan
- D1 force rule: `removeWorktree(path, force)` skips `worktreeRemovable` and passes `--force`. Correct.
- D2 worker rule: leaf-slug match precedes the `-u<N>` owner regex; `merged` force-removes, `failed` keeps the guarded path (`unreachable commits` reason in status). Correct — `worker copies follow the owner leaf` covers both arms.
- D3/D4 vetoes: `live === null`, `livePaneInside`, and `pidsInside(targets(), path)` run before every stray removal; one `/proc` scan per pass, lazy (`targets()`). Correct.
- D5 owner record: written atomically (tmp+rename) before the copy; reconcile sweeps `batch-*.owner` files whose copy is absent and whose owner is dead/absent. Correct.
- D6 `state.batch` name guard removed — owner record is the only guard. Correct.

## Findings
No Fixes.

### Nits
- **N1** `src/run-check.ts:159` still writes the run-dir `.owner` record inline (`JSON.stringify({pid, boot_id, started})`) while `src/reconcile.ts` now exports `writeOwner`/`readOwner` for the same record. Duplication can drift (e.g., boot field handling). Deferred: preexisting code, behavior correct today, `readOwner` already consumes it; promoting it needs a `writeOwner` call that does not currently exist there. Promotes to Fix if the two record shapes diverge.
- **N2** A crash between `writeOwner`'s `writeFileSync(temporary)` and `renameSync` leaves `batch-*.owner.<pid>.tmp` in the store; the orphan sweep regex `^batch-.*\.owner$` does not match it, so it lingers. Consequence today is a stray invisible file. Promotes to Fix if such files accumulate in practice.
- **N3** A `batch-*` copy with a live `.owner` is `continue`d with no `keep()` — it never appears in the `Kept by last cleanup` report unlike every other kept path (live `verify-*` copies do record `verify <run> in progress`). Documented design choice (silent keep), but a small observability gap. Promotes to Fix if an operator needs to see it.
- **N4** `processesInside` is exported per plan D7 but has no caller outside `src/reconcile.ts` (the pass uses the lazily cached `targets()`/`pidsInside`). Harmless dead export.

## Verdict
`nits` — the diff implements every decision and criterion faithfully, all proofs are green, and the four residual items are observation/duplication concerns without a defect today.
