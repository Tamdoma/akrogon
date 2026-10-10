# Plan: merge-clean-worktree

## Intent

Before every merge prompt (applied `top=<sha>` and `solo` forms) the command removes the holder worktree's empty untracked folders, so the merge gate on `HEAD` cannot see phantom directories that `git status --porcelain` never reports (Tamdoma/akrogon#63). Files are never removed, ignored paths are never entered or deleted, and removal runs in every worktree state (dirty solo holders included). A failed removal stops that prompt.

## Decisions

- D1: Helper `removeEmptyUntrackedDirs(worktree: string): Promise<void>` exported from `src/batch.ts` (the merge/worktree maintenance module), not `git clean`: the operator correction replaces `git clean -fd` because a dirty solo holder would lose uncommitted untracked files, and `git clean -nd` collapses an untracked parent so an empty child inside it stays hidden.
- D2: Emptiness is computed from the filesystem plus git, matching `git clean -fd` semantics on a clean status:
  - File set: `git ls-files -c -o --exclude-standard -z` (tracked + non-ignored untracked) union `git ls-files -o -i --exclude-standard -z` (ignored files), run with cwd = worktree, `-z` output split on NUL.
  - Directory set: recursive `readdirSync({ withFileTypes: true })` walk of the worktree collecting relative dir paths. Symlinks are not directories (Dirent.isDirectory() is false), so they are never entered. An entry named `.git` (file or directory) counts as content of its parent and is never entered (worktree gitfile, embedded repo). A walked dir whose relative path also appears in the file set is a gitlink (submodule): it counts as content and is not entered.
  - Ignored dirs: one `git check-ignore -z --stdin` over every collected dir path (newline-separated stdin in the worktree); output `-z` NUL-split names the ignored subset. Exit 0 = some ignored, 1 = none (via `run`), anything else = `CommandError`.
  - Keep set: ancestors of every file, plus ignored dirs, plus ancestors of ignored dirs. This preserves a dir holding only ignored content (`up/ignored-empty/` keeps `up/`), matching observed `git clean -fd` behavior.
  - Victims: collected dirs not in the keep set, removed deepest-first with non-recursive `rmSync` (only empty dirs can succeed; a race-added file makes it fail ENOTEMPTY instead of deleting work).
- D3: `run` in `src/shell.ts` gains an optional trailing `stdin?: string` parameter (`Bun.spawn` stdin Blob instead of `'ignore'`); `command` gains the same optional trailing parameter. Existing callers are untouched.
- D4: Call site is inside `dispatchSlot` in `src/next.ts`, gated on `mergeContext !== undefined` (dispatchMergeLeaf passes it, `dispatchLeaf` in the sweep does not), after the `if (!idle(ready)) return;` gate and before the prompt `run(args)`: `mergeContext !== undefined && state.worktree !== undefined && existsSync(state.worktree)`. `state` is post-`allocate`, so the worktree exists and is recorded; the `existsSync` guard covers the no-worktree case with zero removals.
- D5: Failure propagation is the existing path: a thrown error inside `dispatchSlot` is caught by `dispatchLeaf`, reported via `report()` (stderr JSON carrying repo, leaf path, slug and the error message containing the folder path), added to `invocation.skipped` so `akrogon next` exits 1, and the prompt `run(args)` never executes. No new error type, no state write, no swallow.
- D6: Skill clause: `skills/merge-issue/SKILL.md:41` and `:51` each gain a short clause that the command removed empty untracked folders before the prompt and ignored files remain. No test asserts the wording (standing design); the diff is review-checked.
- D7: Limit stated (from design): ignored-file leftovers such as stale `.temp/` output are not covered; only empty folders go. Gate tree alternative 1b (fresh checkout) stays foreclosed.

## Read-first

- `src/next.ts`: `dispatchSlot` (call site, `mergeContext` parameter, `state.worktree`), `dispatchLeaf` (try/report), `ensureWorktree`, `mergeTurn`/`dispatchMergeLeaf` (who passes mergeContext).
- `src/batch.ts`: existing git helper style (`run`+exit-code, `CommandError`, worktree moves).
- `src/shell.ts`: `run`/`command` signatures for the stdin extension.
- `tests/batch-dispatch.test.ts`: `dispatchFixture`, `allocatedLeaf`, `toMerge`, `expectedPrompt`, `mergePrompts`, `head`, wrapper-script pattern.
- `tests/helpers.ts`: fixture repo layout, `.gitignore` initial content, `fakeHerdr`.
- `skills/merge-issue/SKILL.md` lines 35-55: the two gate sentences.
- `learnings/LESSONS.md` 2026-10-08 entry: `bun run format` rewrites pre-existing prettier drift in untouched files; revert unrelated drift after formatting.

## Interfaces

- `removeEmptyUntrackedDirs(worktree: string): Promise<void>` in `src/batch.ts`; imported into the existing `from './batch'` block in `src/next.ts`.
- `run(argv: string[], cwd?: string, deadlineMs?: number, stdin?: string): Promise<Result>` and `command(argv: string[], cwd?: string, stdin?: string): Promise<string>` in `src/shell.ts`.
- No new config key, state field, flag, or prompt text.

## Checklist

### Wave 1 (independent, parallel)

- U1 — owns `tests/batch-dispatch.test.ts`. Test resource: shared fake-herdr fixture DB per test (each test builds its own `dispatchFixture`, no cross-test resource). No dependency.
  - T1 `empty untracked folders are removed before an applied merge prompt` (criteria 1,2): allocate `holder`, `commitFile` a tracked file under a tracked dir, write+commit `.gitignore` on the holder branch listing `.env`, `.temp/`, `node_modules/` (keeps `.env` ignored for linkEnv). Plant in the worktree: `e1/` at root; `empty2/` inside the tracked dir; `up/empty-child/` beside `up/keep.txt`; `only-ignored/e2/` where `only-ignored/` is untracked and `e2/` empty but inside an ignored parent is out of scope — instead `.temp/` with `.temp/out` file, `node_modules/` with a file, and an empty ignored dir under the tracked dir (`.gitignore` gains one entry, e.g. `e2/` name-scoped, or `.temp/e3/`). After `toMerge` + `next --all`: `e1`, tracked-dir `empty2`, `up/empty-child` do not exist; `up/keep.txt`, `.temp/out`, the `node_modules` file, `.env` symlink and all tracked content byte-identical; `mergePrompts` equals `[expectedPrompt(holder.path, holder.b)]` (top form).
  - T2 `empty untracked folders are removed before a solo merge prompt` (criterion 1): same plant minimal (`solempty/`), leaf `toMerge` with `{ solo: true }`; prompt text contains `solo`, folder gone.
  - T3: extend the existing `a dirty holder worktree drops the batch to solo and restores carried members` (criterion 3): plant `empty-dirty/` plus the existing uncommitted file; after the pass the file is byte-identical, `empty-dirty/` gone, batch `solo: true`, solo prompt sent.
  - T4 `a failed removal stops the merge prompt` (criterion 4): plant `lp/child/` empty, `chmodSync(lp, 0o555)` so `rmSync(child)` fails EACCES while `git status` still reads. `next --all` exits 1, stderr contains the `lp/child` path, `mergePrompts` is empty, `lp/child` still exists. Restore `chmodSync(lp, 0o755)` in a nested `finally` before `f.clean()`.
- U3 — owns `skills/merge-issue/SKILL.md`. No test resource. No dependency. Add the D6 clause at :41 and :51 only.

### Wave 2 (depends on U1 for fail-first evidence)

- U2 — owns `src/shell.ts`, `src/batch.ts`, `src/next.ts`. Implements D1-D5. Before landing, A runs `bun test tests/batch-dispatch.test.ts` and records the new tests' failure output in the implementation report (fail-first, criterion 1); after landing, the same file is green.

## Docs

- `skills/merge-issue/SKILL.md` lines 41 and 51: one clause each (D6). Checked `docs/` and the other skills: the only other "on `HEAD` in the worktree" prose is the check-issue/implement-issue base-checkout text and worker-worktree text, both unrelated to the merge gate. No other doc affected.

## Verification

| Criterion | Proof | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 folders gone before prompt, both forms | `bun test tests/batch-dispatch.test.ts` (T1,T2; T1 red before U2 lands — record output) | missing call site, wrong dir set, wrong form coverage | seconds | change to `dispatchSlot`, helper, or test file |
| 2 files/ignored/tracked byte-identical | T1 assertions: `existsSync`/`readFileSync`/`lstatSync` comparisons incl. `.env` symlink and `.temp/out` | file removal, ignored-path removal, symlink damage | seconds | same |
| 3 dirty worktree keeps changes | T3 extended test | removal deleting untracked files, removal skipped on dirty | seconds | same |
| 4 failed removal stops prompt | T4 | swallowed error, prompt dispatched anyway, exit code | seconds | change to error path |
| 5 skill clause | `grep -n "empty untracked" skills/merge-issue/SKILL.md` shows the clause on both lines; review diffs wording | missing or wrong clause | seconds | SKILL.md change |
| 6 blocking checks | `bun run format` (revert unrelated drift per lesson), `bun run typecheck`, `bun test --timeout=30000`, `bun test --changed="$AKROGON_BASE" --timeout=30000` | format/type/test regressions | minutes | any code change |

Not a slow-run leaf: all proofs are seconds-to-minutes; no restart boundaries needed.

## Notes

- `git ls-files --others --ignored --exclude-standard --directory` was rejected for the ignore check: it collapses a dir whose whole subtree is untracked/ignored even when the dir itself is not ignored, which would keep empty dirs `git clean -fd` removes. `check-ignore` answers per-dir truth.
- Newline-in-dirname is the accepted edge for `check-ignore --stdin` (line-separated input); worktree dir names containing newlines are out of scope.
