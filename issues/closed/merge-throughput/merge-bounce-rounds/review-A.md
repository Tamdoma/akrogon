# Review A: merge-bounce-rounds

Base: `3fde73f` · Reviewed head: `2595d71` · Diff: 5 files, +19/-9. Worktree `git status --porcelain` empty; reviewed commits confirmed ahead of base.

## Verification evidence

- `bun test tests/phase.test.ts tests/hold.test.ts` — 69 pass / 0 fail (rerun during review).
- `bun run format`, `bun run typecheck`, `bun test --timeout=30000` (631 pass / 0 fail) — from implement report, not rerun; no code change since.
- Diff inspection: `commitMove` counts `check.repair -> check.fix` and `merge -> check.fix`; `transition` caps `merge` origin with `failure.phase: state.phase` naming `merge`; `slot ?? required[0]` resolves `B` from `routing['merge'].slots`.

## Criterion check

1. merge -> check.fix increments fix_rounds — proven by `conflict` leaf 0→1 in phase.test.ts. Pass.
2. Cap applies to merge origin, failure names `merge`, same outcome as check.repair (`cause: 'attempts'`, slot `B`, `reason: 'fix rounds exhausted'`, delivery `shown`) — proven by `capped` leaf `moved failed`. Pass.
3. `--red-on-base` hold leaves fix_rounds unchanged — hold path saves state without `commitMove`; hold.test.ts asserts 1→1. Batch split likewise leaves phase `merge`, not counted. Pass.
4. docs/guide/phases.md:108 and setup.md:60 name merge bounces. Pass.
5. Blocking checks pass. Pass.

## Other surfaces checked

- `requiredSlots(phase, rounds)` returns `['B']` on `check.review` when `fix_rounds > 0`, so a merge bounce's next review is B-only; matches design note citing routing.ts:54. Unchanged behavior, correct.
- No `merge -> check.fix` path bypasses `transition`: hold ends early, split keeps phase `merge`, solo/red path and no-batch path both reach `transition`.
- `failed -> check.fix` recovery is not counted; consistent with the existing check.repair-origin counting rule.
- Skills files mentioning `fix_rounds` (chart-issues, worker-protocol, init-akrogon, watch-issues) describe seats/rounds generically; none contradicted.
- No AREA.md in the diff; documented behavior claims verified against live doc lines.
- `git status --porcelain` empty; `src/status.ts` prettier drift was reverted, leaf diff contains only owned files.

## Findings

None.

## Verdict

ready
