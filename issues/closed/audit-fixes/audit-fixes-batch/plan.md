# Plan: audit-fixes-batch

Seven audit fixes in `src/state.ts`, `src/config.ts`, `src/next.ts`, `src/phase.ts`, one import in `src/pull.ts`, and their tests. Each deletes code or sharpens an error. Valid input is unchanged. `debate: no`; this plan is synthesized directly from the brief and locked design.

## Decisions

- D1 (F16): Delete `withLeafLocks` from `src/state.ts`. In `src/phase.ts` `phaseCommand`, call the inner body directly inside `withRepoLock`. In `src/next.ts` `dispatchLeaf`, the `try/catch` that sat inside `withLeafLocks` becomes the direct return value of the `withRepoLock` callback. Remove `withLeafLocks` from both import lists and remove `basename`/`dirname` from the `node:path` import in `src/state.ts` (they are used nowhere else there). Global `~/.lock` and repo `issues/.lock` locks stay.
- D2 (F17): Delete `dependenciesReady` from `src/state.ts`. No callers exist.
- D3 (F18): In `within` in `src/config.ts`, drop `&& !isAbsolute(diff)` and remove `isAbsolute` from the `node:path` import.
- D4 (F7): Add `export const sourcePattern = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/` to `src/state.ts`. `stateSchema.sources` becomes `z.array(z.string().regex(sourcePattern)).optional()`. In `src/pull.ts`, import `sourcePattern` alongside `withRepoLock`/`Leaf` from `./state` and replace the private literal in `closeSource` with `sourcePattern.exec(source)`; the `SourceError` on null stays identical.
- D5 (F9): `commonDirectory(cwd)` runs exactly one `run(['git', 'rev-parse', '--git-common-dir'], cwd)`. `code !== 0 && stderr.includes('not a git repository')` returns null; any other non-zero throws `new Error(JSON.stringify({ cwd, ...result }))`; zero returns `realpathSync(resolve(cwd, result.stdout))`. The `command` import stays (used by `effectiveConfig`, `base`, `ensureWorktree` callers).
- D6 (F6): First line of `requireClean` in `src/phase.ts`: `if (!existsSync(worktree)) throw new Error(\`Missing worktree: ${worktree}\`)`. `existsSync` is already imported. This covers transitions and merge recovery, both of which reach `requireClean`.
- D7 (F8): In `stateSchema`, `tab` and `worktree` become `z.string().min(1).optional()`; `pane` and `prompted` keep `.default({})` with `z.string().min(1).optional()` members. `prompted_at` is unchanged.
- D8: Delete `muse-audit.md` at the repo root in this diff.
- D9 (tests): Repoint every gh probe `lock` to `resolve(f.root, 'issues/.lock')` at `tests/phase.test.ts:267,542,547,635` and `tests/next.test.ts:673,906,1509`. Drop `'leaf'` from the scope loop at `tests/next.test.ts:1065` so it iterates `['global', 'repo']` and the lock path ternary becomes `scope === 'global' ? f.home : resolve(f.root, 'issues')`. In `tests/fetch-deadline-harness.ts`, the reacquire loop keeps only `resolve(f.home, '.lock')` and `resolve(f.root, 'issues/.lock')`.
- D10 (tests): In the source retry test at `tests/phase.test.ts:324`, remove `'malformed'` from the `sources` array. The gh script and warning count are unchanged (the malformed entry consumed no gh step); `stderr` still contains `malformed` via `view(8, '{malformed-json')`.
- D11 (tests): New load-rejection test in `tests/phase.test.ts`: a leaf with `sources: ['malformed']` and a leaf with `worktree: ''`, each run through `cli(f, ['phase', slug, 'implement'])`, asserting non-zero exit, the field name (`sources` / `worktree`) in stderr, the state file byte-identical, no `issues/log.jsonl`, and no `gh` calls (`gh.db + '.calls'` absent).
- D12 (tests): New F6 test in `tests/phase.test.ts`: leaf in `plan.synthesis` with `worktree` set to a removed folder; `akrogon phase <slug> implement` exits non-zero with `Missing worktree:` and the path in stderr; state file and log untouched. `plan.synthesis` requires slot B, and `transition` auto-fills the single required slot, so no `--slot` flag is needed.
- D13 (tests): New F9 test in `tests/config.test.ts`: a `git` shim on `PATH` that appends `"$1 $2"` to a log file then `exec`s the real git; a `bun -e` child imports `commonDirectory` and calls it once per cwd kind (normal checkout, nested subdir, linked worktree, non-repo dir). Assert one log line per call, correct resolved `.git` path for the three repo cases, null for the non-repo. A second shim variant that emits `fatal: disk gone` and exits 128 proves a non-`not a git repository` failure throws with `cwd` and the stderr text. `bun -e` argv: `process.argv[2]` is the first positional after the script.

## Read-first paths

- `src/state.ts` — `withLeafLocks` (lines 138–147), `dependenciesReady` (148–150), `stateSchema`, `basename`/`dirname` import.
- `src/config.ts` — `within` (79–82), `commonDirectory` (84–92), `isAbsolute` import.
- `src/phase.ts` — `phaseCommand` (186–197), `requireClean` (157–160).
- `src/next.ts` — `dispatchLeaf` `withLeafLocks` wrapper (~line 489).
- `src/pull.ts` — `closeSource` literal regex (~line 104).
- `tests/fake-gh.ts` — probe lock check (lines 29–34); unchanged, explains why probes must point at `issues/.lock`.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeGh`.
- `tests/fetch-deadline-harness.ts` — lock reacquire block (lines 87–94).
- `tests/phase.test.ts` — probe sites 267, 542, 547, 635; source retry test ~320–400.
- `tests/next.test.ts` — probe sites 673, 906, 1509; scope loop ~1065.
- `tests/config.test.ts` — existing `cli`-based style for the new F9 test.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` — area orientation.

## Interfaces

- `src/state.ts`: `export const sourcePattern: RegExp` (exact literal in D4). `withLeafLocks` and `dependenciesReady` removed; `basename`, `dirname` no longer imported.
- `src/config.ts`: `commonDirectory(cwd: string): Promise<string | null>` — signature unchanged; one git spawn per call.
- `src/phase.ts`: `requireClean(worktree: string): Promise<void>` — throws `Missing worktree: <path>` before any git invocation.
- `src/pull.ts`: `closeSource` uses `sourcePattern.exec(source)`; `SourceError` shape unchanged.
- `stateSchema`: `sources` entries must match `sourcePattern`; `tab`, `worktree`, `pane.{A,B}`, `prompted.{A,B}` reject empty strings; all remain optional.

## Ordered checklist

1. `src/state.ts`: add `sourcePattern` export; apply to `sources`; add `.min(1)` per D7; delete `withLeafLocks` and `dependenciesReady`; trim `basename`/`dirname` imports.
2. `src/config.ts`: drop `isAbsolute` clause and import; rewrite `commonDirectory` per D5.
3. `src/phase.ts`: add `existsSync` guard in `requireClean`; unwrap `withLeafLocks` in `phaseCommand`; drop the import.
4. `src/next.ts`: unwrap `withLeafLocks` in `dispatchLeaf`; drop the import.
5. `src/pull.ts`: import `sourcePattern`; replace the literal in `closeSource`.
6. `tests/phase.test.ts`: repoint four probe locks; drop `'malformed'` from the retry test sources; add the load-rejection test (D11) and the missing-worktree test (D12).
7. `tests/next.test.ts`: repoint three probe locks; reduce the scope loop to `['global', 'repo']`.
8. `tests/fetch-deadline-harness.ts`: reacquire only global and repo locks.
9. `tests/config.test.ts`: add the F9 single-spawn test (D13).
10. Delete `muse-audit.md`.
11. Run `bun run format` so the diff is prettier-clean, then the verification commands.

## Verification

- `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` returns nothing.
- `bun test` passes; test count drops only by the removed `'leaf'` lock-scope case.
- `bun run typecheck` passes.
- `prettier --check src tests` passes (run `bun run format` first).
- `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/akrogon-audit-fixes-batch-test.log'` exits 0; the implementation report records `/tmp/akrogon-audit-fixes-batch-test.log` as the artifact.
- `test ! -e muse-audit.md`.

## Acceptance criteria (from done-criteria)

1. The grep above is empty.
2. The F9 test proves one git spawn per `commonDirectory` call across normal checkout, nested cwd, linked worktree and non-repository; non-repo returns null; other git failure throws.
3. The load-rejection test proves a bad `sources` entry or empty `worktree` fails at load naming the field, with state, log and gh untouched.
4. The F6 test proves `akrogon phase <slug> implement` on a leaf whose recorded worktree is gone fails with `Missing worktree: <path>` before any state or log write.
5. Every gh probe test still asserts the `issues/.lock` lock is held during closure.
6. Suite, typecheck and prettier pass; count drops by one.
7. `muse-audit.md` is gone.
8. The tee'd test log exists at `/tmp/akrogon-audit-fixes-batch-test.log` and is recorded in the report.

## Notes for review

- Brief says "eight gh probe `lock` paths"; the live tree has seven (four in `phase.test.ts`, three in `next.test.ts`). Design lists the same seven. All seven are repointed; the count discrepancy is recorded here, not treated as a missing site.
- `within` without `isAbsolute`: on a filesystem where `relative()` can return an absolute path (different Windows drive roots), `within` would now return true instead of false. Akrogon paths share one host root; accepted per the fix text.
- `commonDirectory` inside a `.git` dir: old code returned null via `--is-inside-work-tree`; new code returns the resolved common dir. No caller passes a `.git` dir; accepted per the fix text.

## Dependencies

None.
