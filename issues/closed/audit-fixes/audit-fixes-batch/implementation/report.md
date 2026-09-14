# Implementation report

D1–D13 implemented per plan.md. `withLeafLocks` and `dependenciesReady` deleted; `within` drops the `isAbsolute` clause; `sourcePattern` is exported from `src/state.ts`, applied to `stateSchema.sources` and reused by `closeSource`; `commonDirectory` spawns git once per call; `requireClean` throws `Missing worktree: <path>` first; `tab`, `worktree`, `pane` and `prompted` members reject empty strings; `muse-audit.md` deleted. All seven gh probe locks repointed to `issues/.lock`, the `'leaf'` lock-scope case removed, `'malformed'` moved out of the source retry test, and the fetch-deadline harness reacquires only global and repo locks.

## Verification

- **V1 (grep):** `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` exits 1, no matches.
- **V2 (F9):** New `tests/config.test.ts` test spawns `bun -e` children calling `commonDirectory` through a logging `git` shim: one `rev-parse --git-common-dir` line per call across normal checkout, nested cwd, linked worktree and non-repo; non-repo returns null; a `fatal: disk gone` failure throws with cwd and stderr. Red: 7 git lines for 4 calls pre-fix.
- **V3 (F7/F8):** New `tests/phase.test.ts` load-rejection test: `sources: ['malformed']` and `worktree: ''` each fail `akrogon phase <slug> implement` naming the field, state byte-identical, no `issues/log.jsonl`, no gh calls. Red: exited 0 pre-fix.
- **V4 (F6):** New `tests/phase.test.ts` test: leaf in `plan.synthesis` with a removed worktree fails with `Missing worktree: <path>` before state or log writes. Red: ENOENT from `git status` pre-fix.
- **V5 (probes):** All seven gh probe `lock` paths assert `issues/.lock` held during closure; suite green.
- **V6 (suite):** `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/akrogon-audit-fixes-batch-test.log'` exited 0: 223 pass, 0 fail, 2913 assertions across 12 files. Artifact: `/tmp/akrogon-audit-fixes-batch-test.log`. `bun run typecheck` and `prettier --check src tests` pass. Changed-tests run (`bun test --changed` against base `20c613b5`): 166 pass. Red/green logs: `/tmp/akrogon-audit-fixes-batch-red.log`, `/tmp/akrogon-audit-fixes-batch-green.log`.
- **V7:** `muse-audit.md` absent from the repo root.

## Known limitations

- The F9 `bun -e` child uses a placeholder positional because Bun 1.4.0 puts the first user argument at `process.argv[1]`; the test accounts for it via `slice(2)`/`argv[2]` after the placeholder.
- Brief said "eight gh probe `lock` paths"; the tree has seven. All seven repointed; recorded in plan notes for review.
- `within` without `isAbsolute` differs only where `relative()` returns an absolute path (cross-drive Windows roots); akrogon paths share one host root.

Unverified criteria: none.
