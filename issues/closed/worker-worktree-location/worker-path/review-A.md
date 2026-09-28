# Review A: worker-path

Base `f984c8ae83156b31aaa5502abab4b02a0c96f360`, reviewed head `87fa8e4edf6786005bb20c5d962b9f156bb86bec` (3 commits). Debate `no`, so no positions/rebuttals.

## Evidence

- `src/config.ts:125` exports `worktreeStore` returning `resolve(repo.root, repo.config.worktree_root)`; `effectiveConfig` prints `worktree_store` whenever repo resolves, unconditionally of `top` (D1, D2).
- `src/next.ts:232,291` both call sites use `resolve(worktreeStore(repo), slug)`; mismatch error text and git logic unchanged. `grep "resolve(repo.root, repo.config.worktree_root" src/` matches only `src/config.ts:126`.
- `tests/config.test.ts:181` new test drives the real CLI via `fixture()`/`cli()`: default `issues/worktrees`, custom relative `custom/trees`, absolute root, call from root, call from linked worktree (identity asserted), unregistered cwd (`repo: none`, key absent). Asserts absolute path and `worktree_root` unchanged. No mocks.
- `worker-protocol.md:11` names `<worktree_store>/<slug>-u<N>` from `akrogon config` at the leaf's committed HEAD; one absolute path for sub-brief, spawn cwd, inspection, `git worktree remove`; occupied path reported never deleted/forced/reused; retained nested-path resume kept; standalone sequential kept. `grep "<lane>/\|parent root\|gitignored"` empty.
- Real-run artifact `/tmp/worker-path-verify-20260928.log` exists, outside `issues/`: worker `05d9449` equals leaf `05d9449`, sibling under `worktree_store`, key absent with `repo: none`.
- Rerun: `bun test tests/config.test.ts` → 7 pass, 0 fail.

## Docs and AREA

- No AREA.md in diff. Paths named by `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md` all exist (skills AREA's `scripts/observe.ts` resolves to `skills/watch-issues/scripts/observe.ts`, present).
- `README.md`, `docs/guide/setup.md` mention `worktree_root` only generically; plan's "human docs: none" confirmed. `src/AREA.md` command line "config prints effective settings and the worktree base" still accurate.
- Behavior changed: `akrogon config` gains a key. Documented surface (`Print effective configuration`) covers it; no wrong claims found.

## Findings

None. A1–A5 each have code, test, or artifact evidence above.

## Verdict

ready

## Merge pass (A)

- Rebase target: `origin/main` `337ab2672369754ad91de20e2ca7ab64b3f27434`. Prior reviewed head `87fa8e4edf6786005bb20c5d962b9f156bb86bec`, resolved head `1ca42c5905d568d1753493633a3d826d7e07cffd`. Rebase clean, no conflicts.
- `git range-diff f984c8ae..87fa8e4 337ab26..HEAD`: 3 commits, all `=` (unchanged).
- Post-rebase `AKROGON_BASE=337ab2672369754ad91de20e2ca7ab64b3f27434`.
- Checks in worktree: `bun run format` clean (all unchanged), `bun run typecheck` clean, `bun test` 307 pass / 0 fail / 14 files, `bun test --changed=$AKROGON_BASE` 236 pass / 0 fail / 7 files.
- Worktree clean after checks.
