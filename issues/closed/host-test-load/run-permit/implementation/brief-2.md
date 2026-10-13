# Brief 2: base-run permit (U2)

## 1. Goal
`akrogon base-run` holds the host-wide permit only while its command runs. Plan decision D9 in `/home/ivan/Work/infra/akrogon/issues/open/host-test-load/run-permit/plan.md`.

## 2. Acceptance criteria
Planned test (committed, you write or edit no test): `tests/run-permit.test.ts` › `a base-run waits for a live run-check holder before its command` turns green. `tests/base-run.test.ts` stays green.

## 3. Read first
- `src/base-run.ts:100-191`
- `src/permit.ts` (landed by U1: `withPermit`, `Admission`), and how `src/run-check.ts` calls it
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Changes and interfaces
Owned path: `src/base-run.ts` only. Prerequisite: U1 (landed on your starting HEAD). Shared test resource: none.
Wrap only the `spawnLogged(['sh', '-c', script, ...], target, env, log)` call (around line 164) in
`withPermit({ repo: repo.name, leaf: leaf.state.slug, check: 'base-run' }, async (admission) => { env.AKROGON_RUN = admission.token; return spawnLogged(...); })`.
Worktree prep, record writes and cleanup stay outside. No timing events.

## 5. Do-not
- Edit no file except `src/base-run.ts` (other units own the rest).
- No test edits: a wrong planned test is a mismatch returned to A.
- No timing events for base-run (locked design).
Reasons restated: ownership, locked tests, locked design. Exception: a revised brief from A.

## 6. Steps
1. `src/base-run.ts` change; the base-run planned test goes green.
2. `bun run typecheck`, `bun run format` (revert any hunk outside `src/base-run.ts`), then section 7.
Advisory size: 1 file, under 6 turns.

## 7. Commands
From the worktree: `bun install --frozen-lockfile` once, then
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`
Expected red only: `status names the live holder ...` (U3).

## 8. Done-when
One commit (`feat: hold the run permit while base-run runs its command`, no co-author line). Return the commit ID and:

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
