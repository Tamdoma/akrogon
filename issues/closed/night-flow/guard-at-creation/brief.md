# Brief: guard-at-creation

## What
A check never fails because of folders above the worktree. The ancestor guard runs only when a worktree is created, and the skills make base checkouts only through `akrogon base-run`, which already places them under akrogon's scratch root (`src/base-run.ts:143-145`, `src/config.ts:263-267`) (B,C).

- `withSetup` (`src/config.ts:283-289`) stops prefixing `akrogon guard ancestors`. It keeps the setup step under the install lock and `akrogon guard own-modules`.
- The creation-time location check stays (`checkLocation` at `src/next.ts:287`, reached for batches through `src/batch.ts:97`) (B,C).
- The temp-file sentence "Temp files, logs, and base copies go under `$TMPDIR`" (`skills/implement-issue/SKILL.md:25`, `skills/check-issue/SKILL.md:18`, `skills/merge-issue/SKILL.md:18`) no longer places base copies under `$TMPDIR`. It says a base copy is made only through `akrogon base-run`. The base-run instructions themselves are unchanged (B,C).

Owned: `src/config.ts` (`withSetup`), its tests, and the temp-file sentence of `skills/implement-issue/SKILL.md` (today `:25`), `skills/check-issue/SKILL.md` (today `:18`) and `skills/merge-issue/SKILL.md` (today `:18`) (B,C).

## Why
Tamdoma/akrogon#81 and the operator's 2026-10-11 night: base checkouts left under `framework/.temp/tmp.*` sat inside a repo that has `package.json` and `node_modules`, so `akrogon guard ancestors` failed every check run in them, and seats read it as a red base. The guard protects against an install leaking from a parent folder, which only matters where the worktree is created. The operator chose to guard at creation only (chart night-flow, fork stop-rules, S3).

## Done-criteria
1. Every check command `withSetup` builds runs without `akrogon guard ancestors` and still runs the setup step under the install lock and `akrogon guard own-modules`, with and without a configured `setup`.
2. A check run inside a worktree whose parent folder holds `package.json` or `node_modules` is not refused by an ancestor check; a worktree whose own `node_modules` is missing is still refused by `own-modules`.
3. Creating a leaf worktree or a batch worktree under a folder holding `package.json` or `node_modules` is still refused, as today.
4. The temp-file sentences of `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` and `skills/merge-issue/SKILL.md` place no base copy under `$TMPDIR` and say a base copy is made only through `akrogon base-run`. A sweep of `skills/` by meaning finds no instruction to make a base checkout by hand or inside a repo; hits outside scope are listed in the report (B,C).
