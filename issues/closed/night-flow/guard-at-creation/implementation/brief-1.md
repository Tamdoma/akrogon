# Sub-brief 1: drop `guard ancestors` from composed check commands

## 1. Goal

Implement plan decisions D1 and D3 of `guard-at-creation`: `withSetup` composes checks without the `akrogon guard ancestors &&` prefix, and the `src/AREA.md` guard bullet stops claiming composed commands run both guards.

## 2. Acceptance criteria

1. `withSetup`'s `inner` contains no `akrogon guard ancestors`; with a configured `setup` the composed command is `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && akrogon guard own-modules && sh -c <quoted cmd>`; without `setup` it is `akrogon guard own-modules && sh -c <quoted cmd>`. Nothing else in `withSetup` changes.
2. `src/AREA.md`'s `guard` bullet states composed check commands run `own-modules`, while `ancestors` runs at worktree creation through `checkLocation`.
3. The planned tests `config composes setup into printed checks, merge_checks and advisory identically from worktree`, `config reports merge_checks separately from checks` and `printed check runs to completion under a dirty ancestor with and without setup` pass; every other test in the changed set stays green.

## 3. Read-first

- `src/config.ts` `withSetup` (the only code change; around `:283-295`).
- `src/guard.ts` (what `checkLocation` and each `guard` verb do; unchanged).
- `src/next.ts` `createSparseWorktree` (~`:281`) for the `checkLocation` call the AREA line will reference.
- `src/AREA.md` Commands section (`guard` bullet).
- This skill folder's `ponytail.md`: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- One existing pattern to copy: the neighboring `akrogon config composes ...` bullet in `src/AREA.md` Non-obvious patterns for tone and length.

## 4. Change list and needed interfaces

- `src/config.ts`: delete `akrogon guard ancestors && ` from both `inner` forms. Two edits on adjacent lines, nothing else.
- `src/AREA.md`: update the `guard` bullet (today: `` `bun src/akrogon.ts guard <ancestors|own-modules>` refuses a checkout under foreign `node_modules`/`package.json` or a worktree missing its own `node_modules`; composed check commands run both.``) so the last clause reads that composed check commands run `own-modules` while `ancestors` runs at worktree creation via `checkLocation`. Keep it one bullet.
- Interfaces: `withSetup(config: RepoConfig): RepoConfig` signature and returned shape unchanged; only string content differs. `guard`, `checkLocation`, `buildStack`, `base-run` are all out of scope and unchanged.
- Chunk ownership: this unit owns `src/config.ts` and `src/AREA.md` only. No prerequisite units. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not touch `src/base-run.ts`: the design keeps `akrogon base-run` unchanged; its checkouts land under `~/.akrogon/scratch/` where the ancestor check is a no-op. Exception: none, a revised brief from A only.
- Do not touch `src/guard.ts`, `src/next.ts`, `src/batch.ts`: creation-time `checkLocation` is the kept guard, and the `guard` command itself stays whole. Exception: a revised brief from A only.
- Do not write or edit any test: planned tests are locked; a red or wrong one returns a mismatch with evidence. Exception: none.
- Do not remove the `ancestors` verb or its tests: the command still exists for creation use. Exception: a revised brief.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Install dependencies once: `bun install --frozen-lockfile` in your worktree.
2. Edit `src/config.ts` `inner` both forms (criteria 1). Run `bun test tests/config.test.ts tests/guard.test.ts` and paste results.
3. Edit `src/AREA.md` guard bullet (criterion 2).
4. Run the section-7 changed-test command; paste results.
5. Commit with a message like `fix: drop ancestor guard from composed check commands` covering both files.

Advisory size: about 2 files and under 12 turns.

## 7. Commands

```
AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

Run it from the worktree root. (The printed command still contains `guard ancestors` because the registered checkout's `akrogon` is not this leaf's code; that is expected and it passes here.)

## 8. Done-when, evidence and report

Both criteria verified by pasted `bun test tests/config.test.ts tests/guard.test.ts` output (all pass) and the changed-test command output; report your commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
