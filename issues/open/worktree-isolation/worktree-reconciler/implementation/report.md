# Report: worktree-reconciler

Base: `64f27d0e3c4ae254a6aafd49ea393033dc677606`
Head: `46952bf docs: reconciler entry in area files and README`

## Commits

- `41813c7` test: worktree reconciler removal, refusal and migration scenarios — red tests from plan.synthesis, all `Test-Change:` trailers.
- `24f21a8` feat: per-pass worktree, scratch and run-root reconciler — worker commit, cherry-picked from `worktree-reconciler-u1` worktree (removed after landing).
- `46952bf` docs: reconciler entry in area files and README (carries `tests/AREA.md` Test-Change trailer).

## Changed files and reasons

- `src/reconcile.ts` (new, 437 lines) — `reconcile(repo, leaves, panes)`, `keptReportPath`, `readKept`, `closeMergedTab(repo, leaf, panes)`, `reconcileNeedsPanes`. Implements D1–D9: D4 removal rule (porcelain clean, rebase/merge markers, `rev-list --count HEAD --not --branches --remotes`), leaf worktree lifecycle incl. old-root migration, store/old-root sweep (base-*, batch-*, seat variants, unknown dirs, unmanaged outside roots, foreign-slug protection, adoption of unrecorded store dirs by active leaves), scratch and `run-*` `.owner` sweeps, atomic kept report.
- `src/next.ts` — `cleanupRepos`→`reconcileRepos`; `removeLeafTemp`/`cleanupMerged` deleted; `tab_closed` and single-leaf-skip paths call `reconcile`; pane fetched once lazily via `reconcileNeedsPanes`; `closeMergedTab` call sites pass fetched panes; failed-leaf picked throw gated on unrecorded/attempts/live-tab.
- `src/status.ts` — `Kept: <path> — <reason>` lines before each repo heading, from `readKept` (no git/herdr).
- `tests/reconcile.test.ts` (new), `tests/next.test.ts`, `tests/helpers.ts` + 9 test files (`registerTemp` exit cleanup), `README.md`, `src/AREA.md`, `tests/AREA.md`.

## Done-criterion evidence

| DC | Proof | Result |
|---|---|---|
| 1 merged clean removed + `-d`; failed removed, branch kept | `tests/reconcile.test.ts` `failed leaf worktree is removed…`, `tests/next.test.ts` cleanup tests | pass |
| 2 kept+reported: dirty, rebase, unreachable count, live pane, active leaf, unknown dir | `tests/reconcile.test.ts` (6 tests) + `akrogon status` `Kept:` assertions | pass |
| 3 dead `.owner` removed, live kept | `run root with a dead owner pid is removed, live owner kept` | pass |
| 4 old-root migration + 5 refusal cases | `clean old-location worktree…recreated sparse`, `refused while dirty|mid-rebase|live tab|live cwd|batch` | pass |
| 5 sparse reads clean | migrate test's final merged pass removes the sparse worktree | pass |
| 6 unconfirmed base-run under rules | `unconfirmed base-run worktree is removed when clean, kept when dirty` | pass |
| 7 no `/tmp/akrogon-*` debris | `touch /tmp/.leak-mark && bun test --timeout=30000 && find /tmp -maxdepth 1 -name 'akrogon-*' -newer /tmp/.leak-mark` → empty | pass |

## Commands run

- `bun test tests/reconcile.test.ts tests/next.test.ts --timeout=30000` — 248 pass, 0 fail [22s]
- `bun test --timeout=30000` — 774 pass, 0 fail [79.5s] (wall: ~80s)
- `bun run format` — clean after reverts; rewrites pre-existing drift in `skills/chart-issues/scripts/peer-wait.ts` on base too (reverted, untouched by leaf)
- `bun run typecheck` — clean
- `akrogon run-check --name format` — exit 0, log `implementation/check-format-1791711195605-521407.log`
- `akrogon run-check --name typecheck` — exit 0, log `implementation/check-typecheck-1791711199281-531448.log`
- `AKROGON_BASE=64f27d0… akrogon run-check --name test_changed` — 760 pass, 0 fail [130s], log `implementation/check-test_changed-1791711436736-881433.log`
- DC7 leak diff — zero `/tmp/akrogon-*` entries newer than the marker after the full suite

## Known limitations

- `run-check` run roots live under `/tmp/akr-` (commit `021a3b4`, Chrome socket path), outside the reconciler's `leafTemp` sweep root; killed-run debris there is framework check-scratch's lane, recorded in plan.md.
- `git worktree prune` runs only when the pass removed something — unconditional prune deletes `prunable` registrations the `changed repo root` test requires preserved.
- `pane list unavailable` keep reason has no planned test (no test drives a `panes()` failure); implemented per D1/D7.
- Merged leaf's closed worktree removed this pass leaves `state.tab` recorded until the record moves.

## Unverified criteria

None — every done-criterion has a green planned test or a recorded command result above.
