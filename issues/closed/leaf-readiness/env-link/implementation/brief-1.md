# Sub-brief: env-link U1 — linkEnv in src/next.ts

## 1. Goal

Implement plan decisions D1–D5 for leaf `env-link`: when `ensureWorktree` prepares a leaf worktree (new or reused), it makes `<worktree>/.env` a symlink to `<registered root>/.env`, keeps an existing link to that exact target, and refuses otherwise.

## 2. Numbered acceptance criteria

1. `ensureWorktree` in `src/next.ts` calls `linkEnv(repo, path)` on both the existing-worktree and new-worktree paths, before `saveState`.
2. `linkEnv(repo: Repo, worktree: string): Promise<void>` in `src/next.ts` checks in this exact order:
   a. `run(['git', 'ls-files', '--error-unmatch', '.env'], worktree)`: code 0 → refuse (tracked path); code 1 → continue; other → `throw new CommandError(...)`.
   b. `run(['git', 'check-ignore', '-q', '.env'], worktree)` and `run(['git', 'check-ignore', '-q', '.env'], repo.root)`: code 1 on either → refuse; code 0 → continue; other → `throw new CommandError(...)`.
   c. `lstatSync(resolve(worktree, '.env'))`: `ENOENT` → `symlinkSync(target, link)`; symlink whose `readlinkSync` equals `target` → keep; anything else → refuse.
3. `target` is `resolve(repo.root, '.env')`. The link is created even when the target does not exist (dangling); nothing is ever written through the link.
4. Every refusal throws `Error` containing the absolute path that failed and a reason phrase. Use `Refusing .env link at <path>: <reason>`; for the registered-root ignore failure the path is `resolve(repo.root, '.env')` and the reason names the registered checkout.
5. No other file changes; no behavior change outside this function.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/next.ts` — `ensureWorktree` (the `git show-ref` probe shows the `run()`+code pattern to copy) and the `node:fs` import block.
- `src/shell.ts` — `run`, `command`, `Result`, `CommandError`.

## 4. Change list and needed interfaces

- `src/next.ts` only. Add `readlinkSync` and `symlinkSync` to the `node:fs` import (`lstatSync`, `resolve` already imported; `CommandError`, `run` already imported).
- New function: `async function linkEnv(repo: Repo, worktree: string): Promise<void>` placed next to `ensureWorktree`.
- Call site: end of `ensureWorktree`, after the existing/new worktree branches and before `const state: State = { ...leaf.state, worktree: path }`.
- This unit owns: `src/next.ts`. Depends on no other unit; units 2 and 3 depend on it.

## 5. Do-not, reasons and exceptions

- Do not use `existsSync` on `<worktree>/.env` — it follows links and misreads a dangling link as absent; use `lstatSync` and catch `ENOENT`. Same for `statSync`.
- Do not use `command()` for `ls-files`/`check-ignore` — exit 1 is a normal verdict, `command()` throws on it.
- Do not create the target file, do not write through the link, do not touch `.env.*`.
- Do not change seat prompts, `src/init.ts`, `cleanupMerged`, or anything outside `src/next.ts`.
- Do not add tests — U3 owns `tests/next.test.ts`.
- If the plan's ordering or interface seems wrong, return a mismatch with evidence instead of changing scope or the signature; the exception is a revised brief from A.

Reasons restated: exit-1-as-verdict needs `run()`; dangling links need `lstatSync`; scope beyond `src/next.ts` belongs to other units; wrongness goes back as a mismatch, only a revised brief authorizes change.

## 6. Ordered steps

Advisory size: 1 file, under 6 turns.

1. Read `ensureWorktree` and imports in `src/next.ts`.
2. Add the `node:fs` imports and `linkEnv` per criteria 2–4.
3. Insert the call before `saveState` in `ensureWorktree` (criterion 1).
4. Run the changed-tests command; it must pass (it may also select zero or `tests/next.test.ts` only — do not add tests).

## 7. Commands

`AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000`

Run `bun install` first if `node_modules` is absent in your worktree.

## 8. Done-when, evidence and report

`linkEnv` exists with the specified order, target, refusal messages and call site; the changed-tests command passes; you committed only `src/next.ts` on the detached worktree HEAD and return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
