# Implementation report: completion-dependents

## Changed files and reasons

- `src/next.ts`: added `dispatchDependents(global, repo, completedSlug, invocation)` that filters `discover(repo).leaves` by `blocked-by` includes `completedSlug` and passes the result to `sweep`. Replaced `sweepAll` at the three completion sites (targeted single, `tab_closed`, pane hook) with `dispatchDependents`, capturing the slug before `dispatchLeaf`. Keeps all gating in `dispatchLeaf`. Covers AC1.
- `tests/next.test.ts`: added `completing a leaf via {targeted|tab_closed|pane_hook} starts only same-repo dependents` (two repos, dependent gets a tab, `loose` and repo-Y leaf get no tab, worktree, or panes) and `a dependent still blocked by an unmerged leaf stays unallocated`. Renamed the `tab_closed` chaining title from `sweeps and starts the next leaf` to `starts the dependent`. Covers AC2, AC3, AC4.
- `docs/guide/limits.md`: qualified Folder targeting to manual passes and added `A completion starts only its dependents`. Covers AC5.
- `docs/guide/next.md`: added the dependents-only rule as its own paragraph plus Manual dispatch wording, qualified `later sweeps` to `later manual sweeps`. Startup sentence line left untouched (B repaired worker's paragraph split with a direct 2-line edit). Covers AC5.
- No agent skill docs changed.

Worker returns folded: brief-1 (code plus tests) reported red-then-green with 114 pass on changed tests; brief-2 (guides) reported 114 pass and grep confirmation. B's direct repair moved the new rule out of the startup paragraph so the owned line has zero diff.

## Commands run with pasted results and artifact paths

- Worker brief-1 changed tests: `AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed="1a21e22e0056a7e9d6b5e35a5a395b867847a844"` then 114 pass, 0 fail, 1028 expects. Red first showed the 4 new tests failing before the fix.
- Worker brief-2 changed tests: same command then 114 pass, 0 fail, 1028 expects.
- B `grep -n sweepAll src/next.ts` then only line 564 (definition) and the `--all` outside-repo path.
- B `bun run format` then exit 0, all files unchanged.
- B `bun run typecheck` (`tsc --noEmit`) then exit 0.
- B `bun test` then 295 pass, 0 fail, 3508 expects across 14 files in 71.27s.
- B `git diff docs/guide/next.md` confirms the `Herdr events ... Startup also runs a sweep ...` line is context only.

Artifacts:

- `implementation/brief-1.md`
- `implementation/brief-2.md`
- `implementation/report.md` (this file)

## Base and committed head

- Base: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Head: `4ac0f7a65e16f47594a31bf2c53ce49236199f39`
- Branch: `completion-dependents`, worktree clean, no `issues/` files on the branch.

## Known limitations

Plan's open limitation stands: a merged leaf still under `issues/open` returns `completed` on later passes, so dependents re-dispatch idempotently.

## Unverified criteria

None. AC1-AC6 verified by grep plus format, typecheck, and full `bun test`.
