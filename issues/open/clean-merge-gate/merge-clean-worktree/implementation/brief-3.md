# Sub-brief 3: remove empty untracked dirs before merge prompts

## 1. Goal

Plan decisions D1–D5 of `merge-clean-worktree`: before every merge prompt (`attempt=<id> top=<sha>` and `attempt=<id> solo`) the command removes the holder worktree's empty untracked folders — folders containing no file at any depth — never a file, never an ignored path, in every worktree state. A failed removal aborts that prompt. Plan: `issues/open/clean-merge-gate/merge-clean-worktree/plan.md`.

## 2. Numbered acceptance criteria

1. `src/batch.ts` exports `removeEmptyUntrackedDirs(worktree: string): Promise<void>` implementing D2 (see §4).
2. `src/shell.ts`: `run` gains an optional trailing `stdin?: string` and `command` the same; existing callers untouched.
3. `src/next.ts` `dispatchSlot`: after `if (!idle(ready)) return;` and before the `file`/`offset` block, `if (mergeContext !== undefined && state.worktree !== undefined && existsSync(state.worktree)) await removeEmptyUntrackedDirs(state.worktree);`.
4. The fail-first tests in `tests/batch-dispatch.test.ts` (already landed) turn green: T1 top-form folder removal + byte-identical files, T2 solo form, T3 dirty-holder removal, T4 removal failure stops the prompt with the folder path in stderr and no prompt recorded.
5. Errors propagate unchanged: any `readdirSync`/`rmSync`/`git` failure inside the helper throws; `dispatchLeaf`'s existing catch reports and skips. No catch, no retry, no state write added.

## 3. Read-first

- `src/next.ts` — `dispatchSlot` (call site; `state` is the post-`allocate` observed state), `dispatchLeaf` (catch → `report`), `mergeContext` flow from `dispatchMergeLeaf`.
- `src/batch.ts` — `run`/`command`/`CommandError` usage pattern.
- `src/shell.ts` — `run`/`command` signatures (`Bun.spawn` stdin `'ignore'` today).
- `tests/batch-dispatch.test.ts` — the landed T1–T4 tests define the contract; read them before designing.
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `src/batch.ts`, `src/shell.ts`, `src/next.ts`. Prerequisite: sub-brief 1's tests landed on the lane (they are — read them).
- `run(argv, cwd?, deadlineMs?, stdin?)`: when `stdin !== undefined`, pass `stdin: new Blob([stdin])` (or Buffer) to `Bun.spawn` instead of `'ignore'`; keep `trimEnd` behavior. `command(argv, cwd?, stdin?)` forwards.
- `removeEmptyUntrackedDirs` (D2 semantics, verified against live git):
  1. `command(['git', 'ls-files', '-c', '-o', '--exclude-standard', '-z'], worktree)` union `command(['git', 'ls-files', '-o', '-i', '--exclude-standard', '-z'], worktree)` → the file set (NUL-split). Every strict ancestor dir of each file is kept.
  2. Recursive `readdirSync(path, { withFileTypes: true })` walk collecting relative dir paths. `Dirent.isDirectory()` is false for symlinks → never entered, counts as file-ish content (keeps parent). An entry named `.git` (file or dir) is never entered and keeps its parent. A walked dir whose rel path is in the file set is a gitlink — keeps parent, do not descend.
  3. `run(['git', 'check-ignore', '-z', '--stdin'], worktree, undefined, dirs.join('\n'))` → NUL-split output = ignored dirs. Exit 0 = some ignored, 1 = none; anything else → `CommandError`. Ignored dirs and their ancestors are kept.
  4. Collected dirs not kept → `rmSync` deepest-first, non-recursive (empty only; a racing file fails ENOTEMPTY instead of deleting work).
- No new imports in `src/next.ts` beyond adding `removeEmptyUntrackedDirs` to the existing `from './batch'` import; `existsSync` is already imported.
- `src/batch.ts` needs `readdirSync`/`rmSync` (extend the `node:fs` import) and `resolve`/`relative`/`dirname`/`sep` style path joins — check the existing import line and match it.

## 5. Do-not, reasons and exceptions

- Do not use `git clean` (any flags) — the operator correction replaced it because a dirty solo holder would lose uncommitted untracked files.
- Do not use `git ls-files --others --ignored --exclude-standard --directory` — it collapses a dir whose whole subtree is untracked/ignored even when the dir itself is not ignored, hiding empty dirs that must go.
- Do not remove files, tracked or untracked — non-recursive `rmSync` on directories only.
- Do not enter `.git`, symlinked dirs, gitlinks, or prune the walk by ignore status — the `check-ignore` step marks; pruning on `--directory` output is proven wrong (see above).
- Do not add catches, retries, logging, config, flags, or state fields — failure must propagate to `dispatchLeaf`'s existing `report` path so the prompt is not dispatched (criterion 4).
- Do not touch tests, skills, or other files — owned paths are the three listed.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: the helper must equal "what `git clean -fd` removes on a clean status" without ever deleting files; wrong ignore handling either keeps phantom folders (the #63 bug) or deletes ignored content (criterion 2); swallowing failure silently prompts with the folder present (criterion 4). Exceptions: none without a revised brief.

## 6. Ordered steps

1. Read the files in §3, including the landed T1–T4 test bodies. (≤5 turns)
2. Extend `src/shell.ts`. (≤3 turns)
3. Write `removeEmptyUntrackedDirs` in `src/batch.ts`. (≤6 turns)
4. Wire the call in `src/next.ts`. (≤2 turns)
5. Run the §7 commands until the new tests are green and the file's old tests still pass. (≤5 turns)
6. Commit; fill the report.

Advisory: 3 files, under 25 turns.

## 7. Commands

```sh
bun install
AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5 sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
bun test tests/batch-dispatch.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Done when T1–T4 pass and the rest of `batch-dispatch.test.ts` stays green, `bun run typecheck` is clean, and one commit lands on the worktree's HEAD. `src/batch.ts`/`src/shell.ts`/`src/next.ts` are source files — no `Test-Change:` trailer needed (the trailer covers files matched by the test-file path rule).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
