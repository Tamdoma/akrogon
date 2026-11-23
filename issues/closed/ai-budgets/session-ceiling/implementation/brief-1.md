# Unit U-budget: paid session budget schema, ledger module and state-home entry

## 1. Goal

Implement plan.md D1, D2, D3, D6 (budget refusals), D7, D9: the optional `paid_budget` machine-config key, the new `src/budget.ts` reservation module, and the `budget.jsonl` state-home entry. A later unit (not yours) wires `reserve` into `run-check`.

## 2. Numbered acceptance criteria

1. `globalSchema` in `src/config.ts` gains optional `paid_budget`: `z.strictObject({ sessions_per_day: z.number().int().positive(), session_minutes: z.number().int().positive(), approved: z.strictObject({ date: z.string().trim().min(1), answer: z.string().trim().min(1) }) })`. The strict global schema keeps refusing every other unknown key.
2. `src/budget.ts` is new and exports:
   ```ts
   export async function reserve(
     repo: Repo,
     slug: string,
     run: string,
     sessionsText: string,
   ): Promise<{ sessions: number; minutes: number }>
   ```
   Behavior, in order:
   - Parse `sessionsText` with `Number`; unless the result is a positive integer, throw `Error('Invalid --sessions <text>: a positive integer')`.
   - `readGlobal().paid_budget` absent → throw `Error('Missing paid_budget in <globalHome>/config.yaml')` (wording free, must contain `paid_budget` and the config path).
   - `withLock(resolve(globalHome(), 'budget.lock'), action)` (exclusive) from `src/state.ts` around: read ledger, sum, refuse or append.
   - Ledger `<globalHome>/budget.jsonl`: absent file → empty list. Every line strict-parses `{at: z.iso.datetime(), repo: nonblank, slug: nonblank, run: nonblank, sessions: int positive}`; any unparseable line throws an `Error` containing the ledger path and the offending line content (e.g. `Invalid <path> row 2: not-json`). Read error (unreadable file) throws similarly with the file path. A trailing newline is ignored.
   - Window: a row counts when `Date.parse(at) > now - 24h`. Rows from every `repo` sum.
   - If `total + n > sessions_per_day`: if `n > sessions_per_day` throw `Error('paid session budget: --sessions <n> over the rolling 24-hour total <total> of <cap> sessions per day; never fits')`; else throw the same prefix with `fits at <ISO>` where `<ISO>` is the earliest `row.at + 24h` (rows ascending by `at`) such that the sum of rows with `at > row.at` plus n is `<= cap`. These strings are asserted by tests: keep `paid session budget`, `24-hour total <t> of <cap>`, `fits at <ISO>` (bare ISO, no trailing punctuation), `never fits`.
   - Otherwise append `JSON.stringify({at: new Date().toISOString(), repo: repo.name, slug, run, sessions: n}) + '\n'`; an append failure throws an `Error` containing `Append failed`, the ledger path and the cause (`Append failed <path>: <err>`), and the caller must see a refusal.
   - Return `{sessions: n, minutes: paid_budget.session_minutes}`.
3. `copiedEntries` in `src/state-home.ts` gains `'budget.jsonl'` (design 2').
4. No other file changes; `tests/` untouched (worker writes no tests).

## 3. Read-first list

- `plan.md` (leaf folder) decisions D1, D2, D3, D6, D7, D9 and its criterion table.
- `src/config.ts` — `globalSchema` (line ~20), `globalHome()`, `GlobalConfig` type, `Repo` type. Pattern to copy: `slotConfigSchema`'s `z.string().trim().min(1)`.
- `src/state.ts` `withLock` (~line 369) — blocking exclusive flock helper.
- `src/state-home.ts` `copiedEntries` (~line 10).
- `src/timing.ts` — contrast: `readTimings` returns `[]` on error; your ledger reader must refuse, never skip (design rejects the timing pattern).
- `tests/budget.test.ts`, `tests/config.test.ts` (new cases near line 975), `tests/state-home.test.ts` (new case near line 117) — the red proofs your code must turn green.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/config.ts`: `paid_budget` optional key in `globalSchema` before `.superRefine`.
- `src/budget.ts` (new): `reserve` per section 2. Imports: `z` from 'zod', `resolve` from 'node:path', fs `appendFileSync`/`readFileSync`/`existsSync`, `globalHome`, `readGlobal`, type `Repo` from './config', `withLock` from './state'.
- `src/state-home.ts`: add `'budget.jsonl'` to `copiedEntries`.
- Owned paths: `src/config.ts`, `src/budget.ts`, `src/state-home.ts`. Shared test resource: none (fixture homes are per-test). Prerequisite: none (wave 1).
- Worker worktree created at commit `7517bdf0` (the red-test commit).

## 5. Do-not, reasons and exceptions

- Do not wire `reserve` into `run-check`/`akrogon.ts`/`usage.ts` — that is U-runner's unit in wave 2; your `reserve` is its consumed interface.
- Do not add the two `AKROGON_SESSION*` names to `copied` or `constructedEnv` — U-runner owns `src/run-check.ts`.
- Do not add `AKROGON_SESSION*` to the `constructed` set — that is also U-runner's `src/config.ts` change? No: the `constructed` set lives in `repoSchema.superRefine` inside `src/config.ts`, which you own; DO add `'AKROGON_SESSIONS'` and `'AKROGON_SESSION_MINUTES'` to that `constructed` set (plan D8) since the file is yours. Clarification: add both names to the `constructed` `Set` in `repoSchema.superRefine`.
- Do not write or edit tests; a planned test red or wrong is a mismatch returned, never a fix.
- Do not change `timing` schema or add ledger fields — `slug` is `caller.slug` (`checkout` for `--holder`), `run` is the run id; no timing-row field (design).
- Never run `git stash`; a shared stash can lift a sibling worker's edit. To set work aside, commit it as WIP and `git reset --soft <creation commit>` before returning so A's cherry-pick carries one commit.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree (needed for tests).
2. `src/config.ts`: `paid_budget` in `globalSchema`; two names in the `constructed` set. Criteria 1, 4.
3. `src/budget.ts`: `reserve` per section 2. Criterion 2.
4. `src/state-home.ts`: `copiedEntries`. Criterion 3.
5. `bun run typecheck` must pass; run your targeted tests (section 7).

Advisory size: about 3 files and under 14 turns.

## 7. Commands

- `bun run typecheck`
- `bun test tests/budget.test.ts`
- `bun test tests/config.test.ts -t 'AKROGON_SESSIONS|paid_budget'`
- `bun test tests/state-home.test.ts -t 'budget ledger'`

Keep each command's output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line. Budget-related tests that exercise `--sessions` will still be red until U-runner lands the flag — that is expected and NOT a mismatch; your job is the schema, module and state-home pieces. Report which budget tests stay red and confirm each failure is `unknown flag --sessions` or refusal-order related, not a schema/module defect.

## 8. Done-when, evidence and report

Acceptance: typecheck clean; `config.test.ts` new cases green; `state-home.test.ts` new case green; `src/budget.ts` exports `reserve` with the exact signature; `budget.test.ts` failures are only the missing `--sessions` flag / run-check wiring.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
