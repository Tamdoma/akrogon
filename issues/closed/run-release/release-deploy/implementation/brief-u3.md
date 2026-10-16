# Brief u3: status deploy-failure line

## 1. Goal

`src/status.ts` prints the last failed deploy, per plan D8, in the overview form of `akrogon status` only.

## 2. Numbered acceptance criteria

1. When `readDeployRecord()` (from `src/release.ts`) returns a record with `ok === false` and its `attempted` differs from `currentReleaseCommit()`, print exactly one line before the `Failed:` leaf block in `statusCommand`'s overview path:

   `deploy failed: attempted <attempted.slice(0,12)>, active <active or 'none'>, step <step>: <error>`

   where `active` is `currentReleaseCommit()?.slice(0,12) ?? 'none'` and `<error>` is the record's `error` with newlines replaced by spaces, truncated at 120 chars.
2. Nothing prints when the record is absent, `ok === true`, or `attempted` equals the current release commit.
3. The line does not print under `akrogon status <slug>` (single-leaf form) — it returns before the overview code.
4. The deploy record is read once, inside the overview path only; `readDeployRecord`/`currentReleaseCommit` throw on a malformed `deploy.yaml` — that propagates (no try/catch around them; a corrupt record is a real failure).

## 3. Read-first

- `src/status.ts` `statusCommand` (~lines 383-460) — the overview path and where `Failed:` lines print
- `src/release.ts` — `readDeployRecord` (schema: `{attempted?, ok, step?, error?}`, null when absent) and `currentReleaseCommit()` (null when `current` is missing/dangling/workspace)
- skill folder `ponytail.md`

## 4. Change list and needed interfaces

Owns `src/status.ts` only. Add the import `{ readDeployRecord, currentReleaseCommit }` from `./release`. Insert the line emission after the `unreadable` scan-report loop and before the `Failed:` loop in the overview path (roughly between existing lines ~426-427). Use the record's `step` verbatim (fall back to `unknown` when absent).

## 5. Do-not, reasons and exceptions

- Do not touch `src/release.ts`, `src/self-update.ts`, `src/install.ts` or any test — owned by other units; a mismatch returns with evidence.
- Do not add the line to the `<slug>` path or per-repo rows — criterion 3.
- Do not filter on repo names — the record is global to the state home.
- Do not swallow parse errors — no fallback.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/status.ts` and `src/release.ts` (criteria 1-4).
2. Add the import and the emission block (criterion 1-4).
3. `bunx prettier --check src/status.ts`; `bun run typecheck` — only errors in `src/status.ts` are yours.

Advisory size: 1 file, ~15 lines added, under 8 turns.

## 7. Commands

- `bun install --frozen-lockfile` first (worktree has no node_modules).
- `bunx prettier --check src/status.ts` — must exit 0.
- `bun run typecheck` — only errors in `src/status.ts` are yours.

## 8. Done-when, evidence and report

`src/status.ts` prints the line per criteria 1-4, prettier-clean, no type errors in your file. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log. Commit only `src/status.ts`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
