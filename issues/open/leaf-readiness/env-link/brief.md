# Brief: env-link

## What
When `akrogon next` prepares a leaf worktree (`ensureWorktree` in `src/next.ts`, new or reused), it makes `<worktree>/.env` a symlink to `<registered root>/.env`. An existing link to that exact target is kept. It refuses with an error naming the path and reason, leaving `<worktree>/.env` unchanged and starting no seat, when `<worktree>/.env` is a real file, a tracked path, or a link to anything else, or when `.env` is not gitignored in the worktree or in the registered checkout. A worktree and branch created before the refusal stay and are reused on the next dispatch. (A,B) It never creates the target: when the registered `.env` does not exist the link is created dangling. Removing a merged leaf's worktree deletes only the link and leaves the registered `.env` unchanged. Akrogon's own `.gitignore` gains a `.env` line, since on 2026-10-02 `git check-ignore -q .env` failed at the akrogon root and the new refusal would stop akrogon's own dispatch. (A) The shared test fixture repo ignores `.env`, so existing dispatch tests keep passing. (A,B)

## Why
Akrogon creates worktrees with plain `git worktree add` (`src/next.ts:264-269`) and seats start inside them, so by-name checks there read "absent" (I8: 67 min until failed) and keys added mid-run never reached running leaves (Tamdoma/akrogon#52). The operator chose one linked file over copies or path-only fixes.

## Done-criteria
1. `tests/next.test.ts`: after dispatch of a new leaf, `<worktree>/.env` is a symlink whose target is `<registered root>/.env`, and a line appended to the registered file afterwards is read through the link.
2. `tests/next.test.ts`: a reused worktree without the link gets it on the next dispatch, and one already linked is left unchanged.
3. `tests/next.test.ts`: with no registered `.env`, dispatch creates a dangling link and no target file exists afterwards.
4. `tests/next.test.ts`: each refusal case (real file at `<worktree>/.env`, tracked `.env`, link to another target, `.env` not gitignored in the worktree, `.env` not gitignored in the registered checkout) makes `akrogon next <slug>` report the path and reason, leaves the existing path byte-identical, and prompts no seat.
5. `tests/next.test.ts`: merged-leaf cleanup removes the worktree and the registered `.env` still exists with its original content.
6. The repo-root `.gitignore` contains a `.env` line, and the fixture repo created by `tests/helpers.ts` commits a `.gitignore` ignoring `.env`. The refusal tests remove that rule deliberately. (A,B)
