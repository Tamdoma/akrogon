# Unit U-docs: reference docs for the `--sessions` flag and `paid_budget` key

## 1. Goal

Implement plan.md's docs checklist: `docs/reference/commands.md`, `docs/reference/config.md`, `src/AREA.md`, `tests/AREA.md` for the new `akrogon run-check --sessions <n>` reservation feature and the `paid_budget` machine-config key.

## 2. Numbered acceptance criteria

1. `docs/reference/commands.md` run-check row: invocation gains `[--sessions <n>]` and the effect text gains the reservation behavior: with `paid_budget` set, `akrogon run-check --sessions <n>` reserves n paid sessions in `<akrogon home>/budget.jsonl` under `<akrogon home>/budget.lock` before the command starts, exporting `AKROGON_SESSIONS` and `AKROGON_SESSION_MINUTES`; it refuses when the rolling 24-hour total plus n passes `sessions_per_day` (naming the total, ceiling and when n fits, or `never fits`), without the key, on a bad ledger or a bad n. The row's argument text must equal `[--name <n>] [--leaf <path>] [--holder <dir>] [--sessions <n>] -- <argv>...` exactly (tests/command-reference.test.ts contract).
2. `docs/reference/config.md`: machine `config.yaml` table gains a `paid_budget` row (optional; `sessions_per_day` and `session_minutes` positive integers; `approved.date`/`approved.answer` hold the operator's approval words; written only by the operator, never by akrogon); the YAML example gains a commented `paid_budget` sample; the reserved-name prose ("A few names akrogon sets itself, such as TMPDIR and AKROGON_BASE, are refused.") gains the two `AKROGON_SESSION*` names.
3. `src/AREA.md`: the run-check bullet in `## Commands` gains the `--sessions` reservation (ledger, exclusive lock before admission, early-refusal ordering, exported variables). Keep the file's structure and line conventions.
4. `tests/AREA.md`: the tests key-files entry gains `tests/budget.test.ts` (session-budget reservation proofs).
5. No code or test changes.

## 3. Read-first list

- `plan.md` (leaf folder): decisions D4, D8, D9, docs checklist, criterion proofs C1-C8.
- The leaf `design.md`: ledger/lock/refusal wording (items 1, 2, 5, corrections 2', 9').
- `docs/reference/commands.md` — run-check row (line ~51).
- `docs/reference/config.md` — machine `config.yaml` table (~line 27), repo `env`/`pass_env` prose (~line 79), YAML example.
- `src/AREA.md` `## Commands` first bullet.
- `tests/AREA.md` key files.
- `tests/budget.test.ts` — the behavior the docs describe.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owned paths: `docs/reference/commands.md`, `docs/reference/config.md`, `src/AREA.md`, `tests/AREA.md`.
- Consumed interface (from parallel unit U-budget, not yours to write): `reserve(repo, slug, run, sessionsText)` in `src/budget.ts`; flag parse/refusals inside `checkedRun` after early refusals (U-runner). Document against plan.md, not the not-yet-landed code.
- Shared test resource: none. Prerequisite: none (wave 1).
- Worker worktree created at commit `7517bdf0`.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/`, `docs/reference/files.md` or `docs/reference/where-things-go.md` — plan checklist limits docs to the four files; `files.md` lists no akrogon-home state files today (plan limitation L1).
- Do not edit `tests/command-reference.test.ts` — it is committed at plan; your docs row must match its contract.
- Do not write or edit tests or code.
- Keep `src/AREA.md`'s one-line-per-file style inside `## Commands`/`## Key files`; do not restructure.
- Never run `git stash`; a shared stash can lift a sibling worker's edit. To set work aside, commit it as WIP and `git reset --soft <creation commit>` before returning so A's cherry-pick carries one commit.
- Return a mismatch with evidence instead of changing scope or wording contracts; the exception is a revised brief from A.

## 6. Ordered steps

1. `docs/reference/commands.md` run-check row edit (criterion 1).
2. `docs/reference/config.md` table row + YAML example + reserved-name prose (criterion 2).
3. `src/AREA.md` run-check bullet (criterion 3).
4. `tests/AREA.md` tests/budget.test.ts mention (criterion 4).
5. Run `bun test tests/command-reference.test.ts` and `bun test tests/docs-links.test.ts` (install deps first with `bun install --frozen-lockfile --backend=copyfile`).

Advisory size: about 4 files and under 16 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile`
- `bun test tests/command-reference.test.ts`
- `bun test tests/docs-links.test.ts`

Keep each command's output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Acceptance: both named test files green (the docs row matching the committed contract is what turns command-reference green), all five criteria met, one commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
