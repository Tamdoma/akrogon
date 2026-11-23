# Unit U-runner: wire `--sessions` into `akrogon run-check`

## 1. Goal

Implement plan.md D4, D5: parse the `--sessions <n>` flag, call `reserve` inside `checkedRun` at the reservation point, export the two variables to the reserved command only. Prerequisite `src/budget.ts` (U-budget) is already landed on your worktree HEAD.

## 2. Numbered acceptance criteria

1. `src/usage.ts`: `'run-check'` gains `sessions: { type: 'string' }` in `VERB_OPTIONS`; `RUN_CHECK_USAGE` becomes `Usage: akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] [--sessions <n>] -- <argv>...`.
2. `src/akrogon.ts` `case 'run-check'`: `values.sessions` (a `z.string().optional().parse(values.sessions)`) is passed to `runCheck` as a new trailing parameter.
3. `src/run-check.ts`:
   - `runCheck(cwd, name, leafOverride, holder, argv, sessions?: string)` passes `sessions` to `checkedRun` as a new trailing parameter.
   - `checkedRun(repo, caller, akrogonBase, name, argv, cwd, sessions?: string)`: when `sessions !== undefined`, after `failedRefusal(caller, repo, name, run)` (the first one, ~line 317) and before `mkdtempSync` (the run root), call `const reserved = await reserve(repo, slug, run, sessions)` imported from `./budget`. On a throw the error propagates (refusal: no command, no run root). When `sessions === undefined` nothing is reserved (this is the `verify` path too — `verify` never passes it).
   - After `const env = constructedEnv(repo, runRoot)`, when a reservation happened set `env.AKROGON_SESSIONS = String(reserved.sessions)` and `env.AKROGON_SESSION_MINUTES = String(reserved.minutes)`. `constructedEnv` keeps its current signature; the `copied` list gains nothing (the variables must never be inherited — nested run-check drops them).
4. `src/verify.ts` callers of `checkedRun` compile unchanged (new param is optional).
5. All 13 tests in `tests/budget.test.ts` pass; `tests/run-check.test.ts`, `tests/cli-help.test.ts`, `tests/command-reference.test.ts` stay green.

## 3. Read-first list

- `plan.md` (leaf folder): decisions D4, D5, D6 and the criterion table.
- `src/run-check.ts` `checkedRun` (~line 293): early `ownerRefusal` → `run` mint → first `failedRefusal` → `mkdtempSync` → `constructedEnv` → `withAdmission`. The reservation point is between the first `failedRefusal` and `mkdtempSync`.
- `src/budget.ts` — `reserve(repo, slug, run, sessionsText)` returns `{sessions, minutes}`; throws a plain `Error` for every refusal.
- `src/usage.ts` `VERB_OPTIONS`, `RUN_CHECK_USAGE`; `src/akrogon.ts` `case 'run-check'` (~line 319).
- `tests/budget.test.ts` — the 13 proofs.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owned paths: `src/run-check.ts`, `src/akrogon.ts`, `src/usage.ts`.
- Consumed (landed): `src/budget.ts` `reserve(repo: Repo, slug: string, run: string, sessionsText: string): Promise<{sessions: number; minutes: number}>`. `run` is `checkedRun`'s `randomUUID()` mint; `slug` is the `LeafTarget.slug` (`checkout` for `--holder`).
- Shared test resource: none (fixture homes are per-test). Prerequisite: U-budget landed (on your HEAD).
- Worker worktree created at commit `98c82d25`.

## 5. Do-not, reasons and exceptions

- Do not add `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` to `copied` or `forbidden` — C7 requires an unreserved run (including a nested run-check) to pass neither variable; `constructedEnv`'s allowlist already drops them.
- Do not change `constructedEnv`'s signature or `src/budget.ts` — the interface is settled; a defect in `reserve` is a mismatch returned.
- Do not write or edit tests; a red planned test is a mismatch returned, never a fix.
- Do not touch `src/verify.ts` beyond what compilation requires — `verify` must never reserve (design exclusion).
- Do not gate reservation on `admission` or move it inside `withAdmission` — design 2' fixes it before `withAdmission` so a later refusal keeps its row.
- Never run `git stash`; a shared stash can lift a sibling worker's edit. To set work aside, commit it as WIP and `git reset --soft <creation commit>` before returning so A's cherry-pick carries one commit.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile`.
2. `src/usage.ts` flag + usage string (criterion 1).
3. `src/run-check.ts` signatures + `reserve` call + env export (criterion 3).
4. `src/akrogon.ts` pass `values.sessions` (criterion 2).
5. `bun run typecheck`; run the targeted tests in section 7. Confirm every budget test passes and no run-check regression appears.

Advisory size: about 3 files and under 12 turns.

## 7. Commands

- `bun run typecheck`
- `bun test tests/budget.test.ts`
- `bun test tests/run-check.test.ts`
- `bun test tests/cli-help.test.ts tests/command-reference.test.ts`

Keep each command's output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Acceptance: typecheck clean; all 13 `tests/budget.test.ts` tests green; `tests/run-check.test.ts`, `tests/cli-help.test.ts`, `tests/command-reference.test.ts` green; one commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
