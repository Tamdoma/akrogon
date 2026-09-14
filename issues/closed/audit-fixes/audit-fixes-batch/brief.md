# Brief: audit-fixes-batch

## What
Seven audit findings land in `src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts`, one import line in `src/pull.ts`, and their tests. Each either deletes code or turns a confusing failure into a clear one. Valid input behaves exactly as before.

- F16. Delete `withLeafLocks` from `src/state.ts` and its two call sites in `src/next.ts` and `src/phase.ts`. Global and repo locks stay. Remove the `basename` and `dirname` imports left unused.
- F17. Delete `dependenciesReady` from `src/state.ts`.
- F18. In `within` in `src/config.ts`, drop the `!isAbsolute(diff)` clause and the `isAbsolute` import.
- F7. Export the GitHub source pattern from `src/state.ts`, apply it to every `sources` entry in `stateSchema`, and import it in `closeSource` in `src/pull.ts` in place of the private literal. Grammar unchanged.
- F9. In `commonDirectory` in `src/config.ts`, run only `git rev-parse --git-common-dir` through `run`. Exit non-zero with `not a git repository` in stderr returns null. Any other failure throws with cwd and the full result. Success keeps `realpathSync(resolve(cwd, stdout))`.
- F6. At the top of `requireClean` in `src/phase.ts`, throw `Missing worktree: <path>` when the path does not exist.
- F8. Add `.min(1)` to `tab`, `worktree`, `pane.A`, `pane.B`, `prompted.A`, `prompted.B` in `stateSchema`. Fields stay optional.
- Delete `muse-audit.md` from the repo root in the same diff.

Tests: repoint the eight gh probe `lock` paths to `issues/.lock`; drop the `'leaf'` scope from the lock-failure test; move `'malformed'` out of the source retry test into a load-rejection test; trim the leaf-lock reacquire lines in `tests/fetch-deadline-harness.ts`; add cases for F9, F6 and F8.

## Why
Akrogon must be small enough to hold the dispatch path in one head and its errors must name the real cause the first time. Leaf locks guard nothing under the global lock, dead helpers cost reasoning, and a malformed state file or missing worktree today fails late with a message that blames the wrong thing.

## Done-criteria
1. `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` returns nothing.
2. A test proves `commonDirectory` spawns git exactly once per call for a normal checkout, a nested cwd, a linked worktree and a non-repository, and that a non-repository returns null while any other git failure throws.
3. A test proves a state file with a `sources` entry not matching `owner/repo#n`, or an empty `worktree`, fails at load with an error naming that field and leaves state, log and gh untouched.
4. A test proves `akrogon phase <slug> <next>` on a leaf whose recorded worktree folder is gone fails with `Missing worktree: <path>` before any state or log write.
5. Every existing gh probe test still asserts the lock at `issues/.lock` is held during closure.
6. `bun test`, `bun run typecheck` and `prettier --check src tests` pass. Test count drops only by the removed `'leaf'` lock-scope case.
7. `muse-audit.md` no longer exists at the repo root.
8. (B) The verification run leaves an artifact: `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/akrogon-audit-fixes-batch-test.log'` exits 0 and the implementation report records that path.
