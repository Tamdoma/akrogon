# Brief 3: status holder line (U3)

## 1. Goal
`akrogon status` (board, no slug) prints the live permit holder. Plan decision D10 in `/home/ivan/Work/infra/akrogon/issues/open/host-test-load/run-permit/plan.md`.

## 2. Acceptance criteria
Planned test (committed, you write or edit no test): `tests/run-permit.test.ts` › `status names the live holder and drops it once the holder is gone or dead` turns green. `tests/status.test.ts` and `tests/pause-status.test.ts` stay green.

## 3. Read first
- `src/status.ts:287-294` (`since`), `:348-420` (`statusCommand`)
- `src/permit.ts` (landed by U1: `liveHolder()` returning `{ token, pid, start_time, boot_id, repo, leaf, check, started }` or undefined)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Changes and interfaces
Owned path: `src/status.ts` only. Prerequisite: U1 (landed on your starting HEAD). Shared test resource: none.
In the overview branch (no slug), after the `Missing:` loop and before the per-repo tables, print once when `liveHolder()` is defined:
`Run permit: <repo>/<leaf> <check> pid <pid> <since(now - Date.parse(started))>`.
Nothing for waiters, nothing in `status <slug>`.

## 5. Do-not
- Edit no file except `src/status.ts`.
- `bun run format` rewrites pre-existing drift in `src/status.ts` (LESSONS:23): keep only your hunk.
- No test edits: a wrong planned test is a mismatch returned to A.
Reasons restated: ownership, known format drift, locked tests. Exception: a revised brief from A.

## 6. Steps
1. `src/status.ts` change; the planned test goes green.
2. `bun run typecheck`, `bun run format`, revert unrelated hunks, then section 7.
Advisory size: 1 file, under 6 turns.

## 7. Commands
From the worktree: `bun install --frozen-lockfile` once, then
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`
Expected red only: `a base-run waits ...` (U2).

## 8. Done-when
One commit (`feat: show the live run permit holder in status`, no co-author line). Return the commit ID and:

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
