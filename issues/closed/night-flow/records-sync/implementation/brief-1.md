# Worker brief 1: shared inner sequence in src/sync.ts (unit U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/records-sync-u1`

Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

## 1. Goal

Extract the fetch → incoming-tree hazard checks → land → push spine out of `syncCommand` into an exported `integrate` in `src/sync.ts`, so `src/self-update.ts` (a later unit) can reuse it without staging. Implements plan D1; `syncCommand`'s observable behavior must not change.

## 2. Acceptance criteria

1. `tests/sync.test.ts` passes unchanged (`bun test tests/sync.test.ts --timeout=30000`).
2. `integrate(repo, opts, move)` is exported from `src/sync.ts` and: takes the global `.lock` once via `withLock(resolve(globalHome(), '.lock'), ...)`; validates the checkout is on `repo.config.default_branch` (today's `Cannot sync from <actual>; required branch: <branch>` error, `detached HEAD` wording kept); fetches `repo.config.remote` `repo.config.default_branch` and resolves `incoming` as `FETCH_HEAD^{commit}`; runs all four existing hazard checks in the existing order (tracked local lock paths, incoming lock paths, replayed lock paths, ignored-operator-path collisions) with the existing error messages verbatim; then calls `move(incoming)`; then pushes `git push <remote> <sha>:<default_branch>` only when `move` returned a sha.
3. `opts` carries exactly: `checkStaged?: boolean` — when true, run the current staged-paths eligibility refusal (the `Cannot sync with staged paths outside eligible issue records` check) first inside the lock, before fetch; and `pre?: (incoming: string) => Promise<string | null>` — called after fetch and before hazard checks, returning `null` to proceed or a skip reason string that makes `integrate` return `{ pushed: null, skip: <reason> }` without running hazards, move or push.
4. `move: (incoming: string) => Promise<{ tip: string } | { conflict: { paths: string[] } }>` returns the tip to push, or a conflict the caller reports. On `conflict`, `integrate` throws `Error` with message `record conflict: <paths joined by ', '>; run akrogon sync` — the caller (self-update) catches and formats; `syncCommand` never produces it.
5. `integrate` returns `{ pushed: string | null; incoming: string; skip: string | null }`: `pushed` is the pushed sha or null; `skip` is the `pre` reason or null.
6. `syncCommand` calls `integrate` with `checkStaged: true` and a `move` that performs exactly today's stage-eligible-records, commit-if-staged, `git rebase --autostash incoming`, unmerged-paths refusal sequence, returning `{ tip: 'HEAD' resolved }`. Message texts, check order and staging behavior are identical to today.
7. `eligibleRecord` is exported from `src/sync.ts` unchanged (signature `(root, worktree, path) => boolean`) for self-update's per-commit classifier.
8. `bun run typecheck` passes. `bun run format` applied to `src/sync.ts` only.

## 3. Read-first list

- `src/sync.ts` — the whole file; you are refactoring it.
- `src/self-update.ts` — the caller you are enabling; read to keep the interface right.
- `src/config.ts` — `globalHome`, `worktreeStore`, `within`, `Repo`.
- `src/state.ts` — `withLock`.
- `src/shell.ts` — `command`, `run`, `CommandError`, `Result`.
- `tests/sync.test.ts` — the contract that must stay green.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Existing pattern to copy: the function stays plain TypeScript, same `command`/`run`/`Result` style as the rest of the file.

## 4. Change list and needed interfaces

Owns: `src/sync.ts` only. No other file may be edited.

- Export `integrate(repo: Repo, opts: { checkStaged?: boolean; pre?: (incoming: string) => Promise<string | null> }, move: (incoming: string) => Promise<{ tip: string } | { conflict: { paths: string[] } }>): Promise<{ pushed: string | null; incoming: string; skip: string | null }>`.
- Export `eligibleRecord` unchanged.
- `syncCommand(cwd)` keeps its signature and its `Cannot sync ...` errors verbatim; it resolves `repo` via `readGlobal`/`requireRepo` as today, then delegates to `integrate`.
- Push inside `integrate` is `git push <remote> <sha>:<default_branch>` run in `repo.root` (`move` returns a sha that exists in the object store, e.g. `HEAD` for syncCommand or a scratch-worktree tip for self-update).
- The `replayedLocks` and `replayedPaths` hazard inputs stay `git log --format= --name-only --no-renames -z <incoming>..HEAD` computed in `repo.root`.

Depends on: nothing (wave 1). Preceding output consumed by: `src/self-update.ts` unit.

## 5. Do-not, reasons and exceptions

- Do not edit `src/self-update.ts`, tests, or docs: they are other units; a needed interface change is a mismatch, return it.
- Do not change any error message text, check order, or which git commands `syncCommand` runs: criterion 6 requires identical behavior.
- Do not add options, flags or parameters beyond `checkStaged` and `pre`: YAGNI; anything else is a mismatch.
- Do not write or edit tests: tests are locked; a red test is a mismatch returned to A.
- Do not hold the `.lock` differently (no second lock, no releasing before push): `tests/sync.test.ts` `sync holds global lock through push` proves it.

Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `src/sync.ts` and `src/self-update.ts` end to end.
2. Refactor `src/sync.ts` into `integrate` + rewritten `syncCommand` per sections 2 and 4.
3. `bun install` in the worktree, then `bun run typecheck`, `bun run format` (on your file), `bun test tests/sync.test.ts --timeout=30000` (acceptance 1) and `bun test tests/install.test.ts --timeout=30000` (regression surface).
4. Commit one commit on the detached HEAD; report the sha.

Advisory size: 1 file, under 12 turns.

## 7. Commands

Changed-test command (AKROGON_BASE supplied): run in the worktree

```sh
bun install --frozen-lockfile
bun test --changed=c53f6196533289555518577f08907ec9c713721c --timeout=30000
```

plus the targeted `bun test tests/sync.test.ts tests/install.test.ts --timeout=30000` from step 3. `tests/self-update.test.ts` is expected red (7 planned failures) — that is not your scope; do not report it as a defect.

## 8. Done-when, evidence and report

Done when: sync tests green, typecheck green, single commit containing only `src/sync.ts` changes. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
