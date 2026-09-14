# Review A: audit-fixes-batch

Base: 20c613b599acfbfd7d19277c883cf13bd0920e46
Reviewed head: 4c34e07 (Apply audit fixes: drop leaf locks, share source pattern, sharpen errors)
Debate: no — no positions/rebuttal artifacts expected or present.

## Diff vs plan

- D1: `withLeafLocks` deleted from `src/state.ts`; `phaseCommand` calls the body directly inside `withRepoLock`; `dispatchLeaf` try/catch is now the direct return of the `withRepoLock` callback; imports trimmed in `next.ts`, `phase.ts`, `state.ts` (`basename`/`dirname` gone). Confirmed.
- D2: `dependenciesReady` deleted; no callers. Confirmed.
- D3: `within` drops `&& !isAbsolute(diff)`; `isAbsolute` import removed. Confirmed.
- D4: `sourcePattern` exported from `src/state.ts` with the exact literal; `stateSchema.sources` uses `z.string().regex(sourcePattern)`; `closeSource` in `src/pull.ts` uses `sourcePattern.exec(source)`; `SourceError` unchanged. Confirmed.
- D5: `commonDirectory` runs exactly one `run(['git','rev-parse','--git-common-dir'], cwd)`; non-zero + `not a git repository` → null; other non-zero → `throw new Error(JSON.stringify({ cwd, ...result }))`; zero → `realpathSync(resolve(cwd, result.stdout))`. Confirmed.
- D6: `requireClean` first line throws `Missing worktree: ${worktree}` on `!existsSync`. Confirmed; covers `transition` (line 117) and merge recovery (line 160).
- D7: `tab`, `worktree`, `pane.{A,B}`, `prompted.{A,B}` are `z.string().min(1).optional()`; `prompted_at` unchanged. Confirmed.
- D8: `muse-audit.md` deleted. Confirmed (`test ! -e` passes).
- D9: all seven gh probe `lock` paths repointed to `resolve(f.root, 'issues/.lock')` (phase.test.ts 267/542/547/635, next.test.ts 673/906/1509); scope loop iterates `['global','repo']` with the ternary `scope === 'global' ? f.home : resolve(f.root, 'issues')`; fetch-deadline harness reacquires only `~/.lock` and `issues/.lock`. Confirmed; no leaf `.lock` paths remain in tests.
- D10: `'malformed'` removed from the retry test sources; `view(8, '{malformed-json')` still supplies the stderr assertion. Confirmed.
- D11: load-rejection test covers `sources: ['malformed']` and `worktree: ''` via `cli(f, ['phase', slug, 'implement'])`, asserting non-zero, field name in stderr, byte-identical state, no `issues/log.jsonl`, no `gh.db + '.calls'`. Confirmed.
- D12: missing-worktree test uses `plan.synthesis` (auto-fills required slot B), removed folder, asserts `Missing worktree:` + path, state and log untouched. Confirmed.
- D13: F9 test uses a logging `git` shim (`echo "$1 $2" >> log; exec real git`) plus a `bun -e` child calling `commonDirectory` for root, nested subdir, linked worktree, non-repo; asserts 4 identical `rev-parse --git-common-dir` log lines, resolved `.git` for the three repo cases, null for non-repo; second shim emits `fatal: disk gone` exit 128 and asserts throw contains cwd and stderr text. Confirmed.

## Verification evidence

- `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` → exit 1, no matches (criterion 1).
- `bun test` → 223 pass, 0 fail, 2913 assertions, 12 files (run twice consecutively after one initial flake, see note). Test count vs base: +3 new tests, −1 removed `leaf` scope case = +2 net; criterion 6's "drops only by one" refers to the scope-case removal, consistent.
- `bun run typecheck` → clean.
- `bun run format` → no changes; `prettier --check src tests` → all files pass.
- `test ! -e muse-audit.md` → passes (criterion 7).
- `/tmp/akrogon-audit-fixes-batch-test.log` exists (23835 bytes) and ends with 223 pass / 0 fail; recorded in report (criterion 8).
- No AREA.md files in the diff; area-path check vacuous.
- Tests exercise real behavior (cli subprocess, git shim, real git worktree); no mocks of the unit under test.

## Notes

- First `bun test` run in this worktree showed one failure in the new `commonDirectory` test; it passed standalone (3×) and in two subsequent full-suite runs. Not reproducible; recorded for transparency, not a finding.
- `auditdeepseek.md` at repo root is pre-existing (untracked by this diff), not in scope.
- `issues/AKROGON-AUDIT-FIXES.md` untouched per exclusion.

## Findings

None.

## Verdict

ready

## Merge evidence (slot A)

- Rebase: `origin/main` (20c613b) already ancestor of HEAD; no rebase needed. Lesson commit `c321038` added on top.
- Checks at merge head `c321038`: `bun run format` clean (no changes), `bun run typecheck` clean, `bun test` 223 pass / 0 fail / 2913 assertions, `bun test --changed=20c613b` 166 pass / 0 fail.
- Push: `git push origin HEAD:main` → `20c613b..c321038` fast-forward, confirmed.
