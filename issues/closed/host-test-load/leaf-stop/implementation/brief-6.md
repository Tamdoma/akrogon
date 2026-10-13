# Brief 6: stop --all selects only allocated leaves (R2, check.fix C2)

## 1. Goal
`akrogon stop --all` stops only open, unmerged leaves that have a tab. Plan decision D3 as corrected on 2026-10-13 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md, C2).

## 2. Acceptance criteria
Committed tests in `tests/leaf-stop.test.ts` (do not edit):
1. `stop --all skips merged and closed leaves that keep their tab` passes. It is red now because `repo/done` (closed) and `repo/landed` (open, merged) get records and systemctl calls.
2. `stop --all stops every allocated leaf, reports each, and one failure does not block the others` still passes.

## 3. Read first
- `src/stop.ts:55-65` `stopCommand`. It currently selects `allLeaves(repo).filter((l) => l.state.tab !== undefined)`.
- `src/state.ts:144-167` `leavesUnder(path, areaRoot)` and `allLeaves` (which scans open and closed).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Changes
Owned path: `src/stop.ts`. Prerequisites: none. Shared test resource: none.
- Replace the `--all` selection with the leaves under `issues/open`: `const open: string = resolve(repo.root, 'issues/open');` then `leavesUnder(open, open).filter((leaf) => leaf.state.tab !== undefined && leaf.state.phase !== 'merged')`. Drop the `allLeaves` import if it is now unused.

## 5. Do-not
- Do not edit tests. A wrong or red planned test is a mismatch returned to A. Exception: none.
- Do not touch `src/turn.ts`, `src/next.ts` or docs. Reason: another worker owns them. Exception: a revised brief from A.
- No broad catch or fallback.
Reasons restated: tests are locked, and other paths are owned elsewhere.

## 6. Steps
1. `bun install --frozen-lockfile`.
2. Edit `src/stop.ts` (criteria 1 and 2).
3. Run section 7 plus `bun test tests/leaf-stop.test.ts --timeout=30000`.
4. Commit only `src/stop.ts` with message `fix: stop --all selects only allocated leaves`. No co-author line.
Advisory size: 1 file, under 6 turns.

## 7. Commands
`AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
