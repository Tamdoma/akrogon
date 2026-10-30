# Brief 1 — U1: `--backend=copyfile` in `buildRelease`

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/copyfile-installs-u1`

## 1. Goal

A release built by `buildRelease` installs dependencies with `--backend=copyfile`, so its `node_modules` files are private copies, not hardlinks into Bun's shared cache. Plan decision D1, brief done-criterion 1.

## 2. Acceptance criteria

1. `src/release.ts` `buildRelease` install argv is exactly `[process.execPath, 'install', '--frozen-lockfile', '--backend=copyfile']` — same order, flag appended last.
2. `argv[0]` stays `process.execPath`, so `src/self-update.ts` `deployStage` keeps classifying a failed build step as `install` (it reads `error.cause.argv[0]`).
3. The already-committed test `tests/release-deploy.test.ts` 'a built release holds private copies of its file: dependency, not shared files' passes. It is red on this base; do not touch it. If it is wrong or still red after the correct edit, return a mismatch — never edit the test.

## 3. Read-first

- `src/release.ts` `buildRelease` (install argv at ~line 69).
- `src/self-update.ts` `deployStage` build-step classification (~line 300).
- `tests/release-deploy.test.ts` (the committed criterion test; read-only).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `src/release.ts` only.
- Change: one line — append `'--backend=copyfile'` to the `command([...], staging)` argv inside `buildRelease`.
- No signature, import or helper changes. `command(argv, cwd)` is unchanged.
- No prerequisite units; consumes no worker output. Shares no test resource.

## 5. Do-not, reasons and exceptions

- Do not touch any test file: tests are locked after planning; a red or wrong planned test is a mismatch returned to A.
- Do not add the flag anywhere else in `src/` or elsewhere: other sites belong to sibling units U2/U3.
- Do not run `akrogon verify` or the full suite: those are A's commands.
- Do not write under `issues/` or the leaf folder except the report fill-in lines in this file.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Edit `src/release.ts` per acceptance 1.
3. Run the targeted command in section 7; expect all tests green including the previously red criterion test.
4. Commit `src/release.ts` alone with a short `fix:` or `feat:` message naming the flag change. No `Test-Change` trailer needed: this unit changes no test file.
5. Fill in section 8's report lines below and return with the commit ID.

Advisory size: 1 file, under 6 turns.

## 7. Commands

- `bun test tests/release-deploy.test.ts --timeout=30000`

## 8. Done-when, evidence and report

All `tests/release-deploy.test.ts` tests pass on the committed work; `git status --porcelain` in the worktree is clean.

Changed files and reasons: src/release.ts — appended '--backend=copyfile' to the buildRelease bun install argv so release node_modules are private copies, not cache hardlinks.
Tests run: bun test tests/release-deploy.test.ts --timeout=30000 — 15 pass, 0 fail (including the criterion test 'a built release holds private copies of its file: dependency, not shared files').
Known limitations: none known.
Unverified criteria: none.
