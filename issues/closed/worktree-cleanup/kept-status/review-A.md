# Review A: kept-status

Initial review (blind). Base `f3557d8dc8a74459eefcc63dacb419332df1659e`, reviewed head `79504506837bd8912b08088db9b44d9fb3c2cc47` (`f3557d8..HEAD`: 848006a tests, 7950450 implementation).

## Diff inspected

- `src/status.ts` (+2): inside the non-charts per-repo loop of `statusCommand`, after the leaf table / `no open leaves`, prints `  Kept by last cleanup: <path> — <reason>` per `readKept(scan.repo)` entry with `existsSync(entry.path)`. `scan.repo` is `Repo` inside the `scan.ok` narrowing — typechecks. Reached only when `charts` is false (that branch `continue`s) and `scan.ok` is true (earlier `continue`), matching D1/D4. No write, no `reconcile` call, no `herdr` call added; the read-only guarantee of criterion 3 holds structurally and is proven by the `snapshot(f.home)` assertion.
- `README.md` (1 line): the reconcile sentence now names plain `akrogon status` `Kept by last cleanup:` lines and `status <slug>` `Kept:` lines — consistent with the code. `docs/guide/cheat.md` and `docs/guide/in-practice.md` mention `akrogon status` only as a command invocation, no output claims; no doc stale. `command-reference.test.ts` usage row unchanged — the invocation contract did not change.
- `tests/status.test.ts` (+35): new test seeds `<home>/reconcile/repo.json` with one existing and one nonexistent path, asserts the labelled line after `  no open leaves`, the gone path absent, and an identical `f.home` snapshot — covers criteria 1, 2, 3 at the CLI boundary, no mocks.
- `tests/reconcile.test.ts` (+12/−1): extends the existing dirty-worktree test with plain-status assertions and the removed-path stale case — covers criterion 4 through a real `next --all` reconcile. `rmSync` import added.
- `Test-Change:` trailers present for both changed test files, naming what was added; no existing expectation changed.

## Evidence

- `akrogon verify` green on reviewed head `7950450`: format, 846 tests pass / 0 fail (181.54 s), typecheck 0 errors — per `implementation/report.md` and `implementation/check-*.log`.
- Planned proofs ran after the last test change on the committed head (plan-named commands): `bun test tests/status.test.ts` 32 pass / 0 fail; `bun test tests/reconcile.test.ts` 23 pass / 0 fail.
- Both planned tests were recorded red before product code in `plan.md`.

## Criteria check

1. Kept entry printed under a repo with no open leaves, labelled as last cleanup's result — proven by the new status test (`Kept by last cleanup:` line after `  no open leaves`).
2. Missing-path entry not printed — proven by the same test and by the reconcile test's removed-worktree rerun.
3. Status writes nothing — proven by identical `snapshot(f.home)`; the code path adds only reads.
4. Merged leaf's dirty worktree survives reconcile, shown with `uncommitted changes` — proven by the extended reconcile test through real `git worktree` state.

No area files changed in the diff; AREA.md path-listing check not applicable. No documented behavior beyond the README line changed. `debate: no` leaf — no debate artifacts expected.

## Findings

None. Uncertainties resolved in review: em dash matches the detail-branch `Kept:` line; `--charts` exclusion is a plan decision, not a criterion.

## Verdict: ready
