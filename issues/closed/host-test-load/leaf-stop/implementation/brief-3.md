# Brief 3: status marks (U3)

## 1. Goal
Mark stopped leaves in `akrogon status`. Plan decision D7 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md).

## 2. Acceptance criteria
Planned test (committed, do not edit) in `tests/leaf-stop.test.ts`:
1. `status marks a stopped leaf on the board and in its leaf view` passes: the board row of stopped `build` contains `stopped`, the row of unstopped `other` does not, `status build` output contains `stopped`.
2. `tests/status.test.ts` and `tests/pause-status.test.ts` stay green.

## 3. Read first
- `src/stop.ts` (landed from U1): `readStopped(): Set<string>` keys `<repo>/<slug>`.
- `src/status.ts:106-189` `note`, `cells`, `rows`; `src/status.ts:349-412` `statusCommand` with `readPaused()` and the `paused:` line.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Changes
Owned path: `src/status.ts`. Prerequisite: U1 (landed). Shared test resource: none.
- Read `readStopped()` once in `statusCommand` beside `readPaused()`.
- Board: the NOTE cell of a stopped leaf starts with `stopped`, joined to a non-empty existing note with `; `. Thread the set (or a boolean) into `cells` through `rows` the smallest way.
- `status <slug>`: print `stopped: <repo>/<slug>` right after the `paused:` line when the key is in the set.

## 5. Do-not
- Do not edit tests; a wrong or red planned test is a mismatch. Exception: none.
- Do not touch other src files or docs. Reason: other units own them.
- No new columns. Reason: the plan puts the mark in NOTE.
Reasons restated: tests locked; ownership; plan decision D7.

## 6. Steps
1. `bun install --frozen-lockfile`.
2. Edit `src/status.ts` (criteria 1, 2).
3. Run section 7 plus `bun test tests/leaf-stop.test.ts tests/status.test.ts tests/pause-status.test.ts --timeout=30000`.
4. Commit only `src/status.ts`, message `feat: mark stopped leaves in status`. No co-author line.
Advisory size: 1 file, under 6 turns.

## 7. Commands
`cd <worktree> && AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
