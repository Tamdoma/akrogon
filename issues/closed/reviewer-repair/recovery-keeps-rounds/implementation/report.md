# Implementation report: recovery-keeps-rounds

Base: `22c447039b192f4caae6cad4d5b56092941d1bed`. Committed head: `00ccfb9f396ecae00578f64927e04135474db44d` (worker U1 commit `cd82f81` cherry-picked). Mode: subagents, one wave, one unit (`implementation/brief-1.md`). The worker worktree was removed.

## Changed files and reasons

- `src/phase.ts`: `commitMove` no longer sets `fix_rounds` to 0 when leaving `failed`. Only that branch was removed. The increment condition, the cap and the other cleared fields are unchanged. (D1, D2)
- `tests/phase.test.ts`: the cap test now asserts the stored `failure.reason` is `fix rounds exhausted` with `fix_rounds: 1`, and that the count stays 1 after recovering to `implement`. The renamed `failed exits by command reset attempts and keep fix_rounds` test asserts 3 is kept on recovery to `plan.synthesis` and 2 is kept on recovery to `check.fix`. (D3, D4)
- `docs/guide/phases.md:73`: one sentence saying recovery keeps the repair count. (D5)

## Done-criterion to evidence

Criterion 1 is proven by the tests `review aggregates verdicts, rechecks only B, caps repairs and permits operator restart` (cap failure) and `failed exits by command reset attempts and keep fix_rounds` (general recovery). Both check only the stored count.

Before/after proof (real bug: recovery reset the count):
- Old `src/phase.ts` with the new tests: the worker saw `stuck` expect 3 and receive 0. A saw the cap test expect `fix_rounds: 1` and receive 0 (`0 pass, 1 fail`).
- New source: `bun test tests/phase.test.ts -t "caps repairs|failed exits by command"` gave 2 pass, 0 fail, 20 expect() calls.

## Commands run at head

- `bun run format`: all files unchanged.
- `bun run typecheck`: exit 0.
- `bun test`: 353 pass, 0 fail, 15 files, 114.49s wall.
- `AKROGON_BASE=22c4470… bun test --changed=22c4470…`: 39 pass, 0 fail, 6.43s.

## Known limitations

- Leaves reset by older recoveries keep their lower stored count. The design accepts this.
- `b-repair-phase` edits the same `fix_rounds` expression. The merge seat resolves the overlap.

## Unverified criteria

None.
