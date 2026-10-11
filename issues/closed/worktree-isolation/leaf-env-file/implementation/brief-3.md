# Brief 3: write leaf `.env` at dispatch

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/leaf-env-file-u3`
Lane base: `309d742605a0516067840863ffdf3be29b03fc0c` (`AKROGON_BASE`)

## 1. Goal

Implement plan D1–D8: replace the `.env` symlink at dispatch with a real written file. `linkEnv` becomes `writeLeafEnv`; state records `env_names` and `env_generation`. The wave-1 test commits (already on your worktree base) turn green.

## 2. Acceptance criteria

- C1 After dispatch, worktree `.env` is a regular file, mode 0600, holding exactly the repo config `env:` names with values from the registered checkout's `.env`; undeclared names absent. (brief criterion 1)
- C2 While a live tab matches (`matches.length === 1` in `allocate`), the file is untouched and state unchanged; a dispatch with no live tab rewrites it and bumps `env_generation`. (brief criterion 2)
- C3 A declared name missing from the root `.env` (or missing root file) refuses dispatch naming only the missing names — never values — before any write. (brief criterion 3)
- C4 Tracked `.env`, `.env` not ignored in worktree, or not ignored in the registered checkout still refuse, on every dispatch including live-tab ones. (brief criterion 4)
- C5 The wave-1 tests in `tests/next.test.ts` and `tests/batch-dispatch.test.ts` pass; `bun run typecheck` passes.

## 3. Read-first list

- `src/next.ts`: `allocate` (:353, computes `matches`), `ensureWorktree` (:277), `linkEnv` (:312–335) — replace it.
- `src/state.ts`: `stateSchema` (:60–88), `saveState`.
- `src/readiness.ts` :110 — existing `parseEnv(readFileSync(envFile, 'utf8'))` pattern from `node:util`.
- `src/config.ts` :53 — `repo.config.env` is `string[]` of uppercase names, validated.
- `src/AREA.md` :32 — stale symlink line to rewrite.
- `skills/implement-issue/SKILL.md` :47 and `skills/plan-issue/SKILL.md` :33 — stale "worktree link" phrase; reword to "worktree `.env`".
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Plan: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/leaf-env-file/plan.md` D1–D8 and Implementation notes (authoritative details below repeated).

## 4. Change list and needed interfaces

- `src/state.ts`: add to `stateSchema`: `env_names: z.array(z.string()).default([])`, `env_generation: z.number().int().nonnegative().default(0)` (repo default pattern like `done`, `fix_rounds`; old states parse unchanged).
- `src/next.ts`:
  - `ensureWorktree(repo, leaf, live: boolean)`: pass-through flag; call `writeLeafEnv` where `linkEnv` was called; merge into returned state: when it wrote, `env_names: repo.config.env`, `env_generation: leaf.state.env_generation + 1`; when skipped, leave both untouched.
  - `writeLeafEnv(repo: Repo, worktree: string, live: boolean): Promise<boolean>` — true wrote, false skipped (live). Steps in order:
    1. Same three refusals as `linkEnv` (tracked, not-ignored worktree, not-ignored registered checkout), same code paths/messages (wording may say `Refusing .env at <path>` — tests assert `Refusing .env` plus reason substring).
    2. `if (live) return false`.
    3. Root file `resolve(repo.root, '.env')`; read if present else empty. Parse with `parseEnv` from `node:util`.
    4. `const missing = repo.config.env.filter((name) => parsed[name] === undefined)`; if non-empty throw `Refusing .env write at <link>: missing declared names in <root>/.env: <NAMES>` — names only, no values, no parsed content.
    5. Content = `repo.config.env.map((name) => `${name}=${JSON.stringify(parsed[name]!)}`).join('\n')` plus trailing `\n` when non-empty; empty list → empty content.
    6. Atomic write: `const gitDir = resolve(worktree, await command(['git', 'rev-parse', '--git-dir'], worktree))`; temp = `resolve(gitDir, `akrogon-env-${process.pid}`)`; `writeFileSync(temp, content, { mode: 0o600 })`; `renameSync(temp, resolve(worktree, '.env'))`. Return true.
  - `allocate`: `await ensureWorktree(repo, leaf, matches.length === 1)` (call site ~:370; `matches.length > 1` throws before).
  - Imports: add `readFileSync`, `writeFileSync`, `renameSync` to node:fs import; `parseEnv` from `node:util`; `readlinkSync`/`symlinkSync` imports may become unused — remove if so.
- `src/AREA.md` :32: rewrite the symlink line as e.g. `- A leaf worktree's \`.env\` is a written file (mode 0600) holding only declared \`env:\` names copied from the registered checkout; dispatch rewrites it when no tab is live and refuses a tracked path or missing ignore rule.`
- Skills wording: in `skills/implement-issue/SKILL.md` (:47) and `skills/plan-issue/SKILL.md` (:33), change "the worktree link" to "the worktree `.env`" inside the `produces[].save` sentences; nothing else in those files.
- Owned paths: `src/state.ts`, `src/next.ts`, `src/AREA.md`, `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`. Shared test resource: none. Must land first: wave-1 test commits (they are in your base).

## 5. Do-not, reasons and exceptions

- Never print, log, or include env VALUES in errors, output, or state — criterion 3 and the seat's `.env` rules; errors carry names and paths only. Exception: none.
- Do not add a custom dotenv parser — `parseEnv` is the repo pattern; malformed lines skip and fall to the missing-name refusal. Exception: none.
- Do not keep symlink semantics for a pre-existing `.env` symlink or real file — `rename` replaces both silently (locked design). Exception: a `.env` directory propagates the `rename` error; do not special-case it.
- Do not run the live-check before the refusals — criterion 4 demands refusals on every dispatch. Exception: none.
- Do not write `env_generation`/`env_names` when skipped — a frozen tab keeps the old record. Exception: none.
- Return a mismatch with evidence instead of changing plan scope; the exception is a revised brief authorizing it.
- Restated: no values anywhere, parseEnv only, rename replaces, refusals first, state untouched on skip, escalate via mismatch.

## 6. Ordered steps

1. Read `linkEnv`, `allocate`, `ensureWorktree`, `stateSchema`, and the readiness `parseEnv` use.
2. Apply `src/state.ts` schema change; then `writeLeafEnv` + `ensureWorktree` + `allocate` in `src/next.ts`; then the two doc edits.
3. `bun run typecheck`; fix any type issues (e.g. non-null assertion on `parsed[name]` after the missing filter).
4. `bun test tests/next.test.ts tests/batch-dispatch.test.ts --timeout=30000` — the wave-1 tests must pass; repair your code (not the tests) until they do. Tests were written to the plan; a mismatch between test expectation and plan text is a mismatch report back, not a test edit.
5. Run the brief-7 command; then `bun run format` and re-run tests if format changed files.
6. Commit `feat: write declared leaf .env file at dispatch` — no `Test-Change` trailer needed (src/docs only; src files do not match `src/test-files.ts` path rule).

Advisory size: about 5 files, under 40 turns.

## 7. Commands

```
AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000
```

Run in your worktree. All must pass; paste the summary.

## 8. Done-when, evidence and report

Commit on worktree HEAD; changed-test run green; typecheck green; report filled below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
