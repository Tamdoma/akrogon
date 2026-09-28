# Implementation report: worker-path

Delegated mode, one wave of 2 workers. B's own workers ran at the new sibling path per plan Implementation notes (2026-09-28).

## Changed files and reasons

- `src/config.ts` (worker U1, commit c1cafac): added `worktreeStore(repo)` returning `resolve(repo.root, repo.config.worktree_root)`; `effectiveConfig` prints `worktree_store` whenever a repo resolves. One resolver shared by config output and worktree creation (D1, D2, A1).
- `src/next.ts` (worker U1, commit c1cafac): `ensureWorktree` and `allocate` build the leaf path via `resolve(worktreeStore(repo), slug)`. No behavior or error-text change (D3, A1).
- `tests/config.test.ts` (worker U1, commit c1cafac; B format/type fix on top, commit 87fa8e4): real-CLI test over default, custom relative, and absolute roots, root and linked-worktree callers, and unregistered cwd (D4, A2). B's top-up is prettier reflow plus `StoreParsed` casts for `tsc`; no logic change.
- `skills/implement-issue/worker-protocol.md` (worker U2, commit 67a102f): worker path is now `<worktree_store>/<slug>-u<N>` from `akrogon config` at the leaf's committed HEAD, one absolute path for create, spawn, inspect, and remove; occupied path reported to operator; retained-nested resume kept; standalone unchanged (D5, A3, A4).

Base `f984c8ae83156b31aaa5502abab4b02a0c96f360`, head `87fa8e4edf6786005bb20c5d962b9f156bb86bec` (3 commits: 3679904, a792cf1, 87fa8e4). Lane clean, both worker worktrees removed before checks.

## Commands run with results

- U1 red: `bun test tests/config.test.ts` before src change failed naming `worktree_store` (evidence was in worker worktree `.worker-evidence/`, removed with the worktree).
- After pick 3679904: `AKROGON_BASE=f984c8ae... bun test --changed="f984c8ae..."` → 236 pass, 0 fail, 7 files.
- After pick a792cf1: same command → 236 pass, 0 fail.
- U2 changed-tests: same command → 0 tests matched (prose-only change, expected).
- `bun run format` → exit 0, stable (one reflow of the new test, committed).
- `bun run typecheck` → exit 0 (after B's cast fix; first run flagged 5 unknown-parse errors in the new test).
- `bun test` (full suite, B) → 307 pass, 0 fail, 14 files.
- `grep -rn "resolve(repo.root, repo.config.worktree_root" src/next.ts` → empty.
- `grep -n "<lane>/\|parent root\|gitignored" skills/implement-issue/worker-protocol.md` → empty.

## Real-run artifact (A5)

`/tmp/worker-path-verify-20260928.log` (outside tracked `issues/` paths). Temp registered repo, leaf worktree with one commit ahead of main:

- `akrogon config` from the leaf prints `worktree_store: /tmp/.../repo/issues/worktrees`, `worktree_root` unchanged, same store from the registered root, no key with `repo: none`.
- `git worktree add --detach <worktree_store>/myleaf-u1 HEAD` → worker `05d9449` equals leaf `05d9449` (HEADS MATCH), both parents equal `worktree_store` (SIBLINGS UNDER worktree_store).

## Known limitations

- `~` in `worktree_root` stays split: leaf/worker paths use plain `resolve`, sync/init use `expandPath` (plan's recorded limitation, unchanged).
- `<lane>` worker-path wording survives in frozen history under `issues/chart/worker-worktree-location/` and `issues/closed/parallel-units/chart/`; those records are not rewritten. No live doc outside `worker-protocol.md` names a worker path (`README.md`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`, AREA files checked, all still accurate).

## Unverified criteria

None. A1-A5 each have the evidence above.
