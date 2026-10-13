# Brief 5: a stopped merge holder keeps the turn (R1, check.fix C1)

## 1. Goal
A merge turn held by a stopped leaf waits for `akrogon start`. It is never handed to another leaf. Plan decision D6 as corrected on 2026-10-13 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md, C1).

## 2. Acceptance criteria
Committed tests in `tests/leaf-stop.test.ts` (do not edit):
1. `stopping the holder of an applied batch builds no second batch and prompts no merge seat` passes. It is red now: after `stop aa`, `next` gives `bb` its own applied batch while `aa`'s batch still carries `bb`.
2. `the merge path builds no stack and starts no merge seat for a stopped leaf` still passes. A stopped leaf that holds no batch stays out of the queue, and `bb` becomes holder.
3. The other leaf-stop cases and the batch/merge suites stay green.

## 3. Read first
- `src/turn.ts:82-104` `mergeQueue`. The `eligible` filter currently has `!isStopped(leaf.state.repo, leaf.state.slug)`.
- `src/next.ts:1086-1130` `mergeTurn`: reconcile loop, then `holder = mergeQueue(...)[0]?.leaf`, then dispatch if applied, else restore, then fetch and build.
- `src/stop.ts`: `isStopped(repoName: string, slug: string): boolean`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Changes
Owned paths: `src/turn.ts`, `src/next.ts`. Prerequisites: none. Shared test resource: none.
- `mergeQueue`: keep stopped leaves that hold a batch. Change the filter term to `(leaf.state.batch !== undefined || !isStopped(leaf.state.repo, leaf.state.slug))`. The existing sort already puts batch holders first.
- `mergeTurn`: right after `if (holder === undefined) return;`, add `if (isStopped(repo.name, holder.state.slug)) return;` (import `isStopped` from `./stop` if not imported). This skips dispatch, restore and build while the holder is stopped.

## 5. Do-not
- Do not edit tests. A wrong or red planned test is a mismatch returned to A. Exception: none.
- Do not touch `src/stop.ts`, `src/status.ts`, `src/phase.ts` or docs. Reason: other units own them, and the two gates above cover every caller. Exception: a revised brief from A.
- No broad catch or fallback.
Reasons restated: tests are locked, the two gate points cover the callers, and other paths are owned elsewhere.

## 6. Steps
1. `bun install --frozen-lockfile`.
2. Edit `src/turn.ts` and `src/next.ts` (criteria 1 and 2).
3. Run section 7 plus `bun test tests/leaf-stop.test.ts tests/batch-dispatch.test.ts tests/merge-compare.test.ts --timeout=30000`.
4. Commit only your files with message `fix: a stopped merge holder keeps the turn`. No co-author line.
Advisory size: 2 files, under 10 turns.

## 7. Commands
`AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
