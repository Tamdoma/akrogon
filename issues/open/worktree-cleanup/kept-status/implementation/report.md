# Implementation report: kept-status

Serial-solo run (one unit in the plan). Base `f3557d8dc8a74459eefcc63dacb419332df1659e`; committed head `79504506837bd8912b08088db9b44d9fb3c2cc47`. Branch refreshed before work: fetch + rebase onto `origin/main` was already up to date.

## Changed files

- `848006a test: kept entries in plain status` — `tests/status.test.ts` new test (criteria 1–3), `tests/reconcile.test.ts` extension of `dirty merged worktree is kept and reported` (criterion 4 + removed-path case), committed before product code with `Test-Change:` trailers.
- `7950450 feat: show kept-by-cleanup entries in plain status` — `src/status.ts`: in the non-charts per-repo loop, after the leaf table / `no open leaves`, print `  Kept by last cleanup: <path> — <reason>` for each `readKept(scan.repo)` entry whose path still exists (`existsSync`). `README.md`: the reconcile sentence now covers plain `akrogon status` lines alongside `status <slug>` `Kept:` lines.

## Criterion proofs

| Criterion | Command | Commit | Result |
| --- | --- | --- | --- |
| 1–3 | `akrogon run-check --name 'test' -- bun test --timeout=30000 tests/status.test.ts` | 7950450 | green — 32 pass 0 fail; kept line printed after `no open leaves`, missing-path entry absent, `snapshot(f.home)` identical before/after |
| 4 (+removed path) | `akrogon run-check --name 'test' -- bun test --timeout=30000 tests/reconcile.test.ts` | 7950450 | green — 23 pass 0 fail; worktree still on disk after `next --all`, plain status shows `Kept by last cleanup: <worktree> — uncommitted changes`, gone path's line absent |

Red before product code (recorded in `plan.md`): both tests failed with `Received: ["repo", "  no open leaves"]` at `848006a`'s parent state; green at `7950450`.

## Checks

- `akrogon verify` in the leaf worktree on `7950450`: green — format, `bun test` 846 pass / 0 fail across 49 files (181.54 s), typecheck 0 errors. Receipt: `verify leaf 7950450...: green`. Logs under `implementation/` (e.g. `check-typecheck-1792097711068-2808969.log`).

No merge_checks run: none configured and no criterion names a whole-run requirement.

## Docs

- `README.md` updated (plan D5). `tests/AREA.md` and `src/AREA.md` unchanged — no new file, no new command surface.

## Known limitations

- `status <slug>` still prints kept entries whose paths no longer exist (plan D3; the record stays reachable for the leaf it names).
- A kept entry under an unreadable registered repo is silent; the repo's `unreadable` diagnostic explains the gap (plan D1).
- No unverified criteria.
