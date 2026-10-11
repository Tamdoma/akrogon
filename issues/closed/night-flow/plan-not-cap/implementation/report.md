# Implementation report: plan-not-cap

Base `c53f619`; head `4b52994` on `plan-not-cap`. Delegated mode, one wave of three workers (disjoint paths, no shared resources), cherry-picked serially.

## Changed files and reasons

- `src/phase.ts` — `capped` ternary and `fix rounds exhausted` failure removed; `transition()` commits `destination` as computed (D1).
- `tests/phase.test.ts`, `tests/culprit.test.ts` — cap assertions rewritten to movement assertions; later one A correction of own expectation (`toMatchObject({failure: undefined})` fails in bun on an absent key; state writer drops `undefined`, so the correct form is `toBeUndefined()`).
- `skills/check-issue/SKILL.md` — `moved failed at the repair cap` clause removed; `Handed to A` rule extended with the plan-correction handoff (D3).
- `skills/implement-issue/SKILL.md` — `repair cap` dropped from effective settings; overlap and check.fix wave/delegation text unconditional; plan-correction rule added (D4).
- `skills/implement-issue/worker-protocol.md` — last-allowed-round clause replaced by same-wave-rule delegation (D5).
- `skills/init-akrogon/SKILL.md` — `fix_rounds: 3` annotated as the direct-route bound (D8).
- `docs/guide/phases.md` — cap-failure claims removed at the three cited spots (D6).
- `docs/guide/setup.md` — `fix_rounds` bullet now describes the direct-route bound plus the recorded count (D7).

## Commits

- `fab0e0c` planned tests first (Test-Change trailers).
- `419c8f9` `src/phase.ts` (worker U1, cherry-picked from `6b3f547`).
- `82946f1` four skill files (worker U2, from `29f54cc`).
- `7b5d9e3` two guide files (worker U3, from `976b499`).
- `4b52994` test expectation correction (Test-Change trailer; A's own wrong expectation in a planned test, worker-reported mismatch).

## Criterion proof

- C1 `bun test tests/phase.test.ts tests/culprit.test.ts` — 71 pass / 0 fail on the lane head. Moves proven: `check.fix` from `check.repair` at `fix_rounds=1` under `fix_rounds: 1` lands `check.fix` with count 2 and no failure; same for a `merge`-phase leaf; `--culprit` eject of a member at count 1 lands `check.fix` count 2, holder stays merge, batch cleared, ejected attempt recorded. `grep -rn "fix rounds exhausted" src/` — empty.
- C2 `bun test tests/config.test.ts` — 23 pass / 0 fail (`fix_rounds` parse cases unchanged). `git diff c53f619..HEAD --name-only` shows `src/config.ts`, `issues/config.yaml` and `skills/chart-issues/SKILL.md` untouched; direct-route bound at `chart-issues/SKILL.md:117` unchanged.
- C3 check-issue `Handed to A` paragraph carries the plan-correction rule (skills/check-issue/SKILL.md:77); implement-issue check.fix carries the plan.md-correction + executable-check rule (skills/implement-issue/SKILL.md:80). Brief, locked design and test-change protections unmodified.
- C4 `grep -rn "fix rounds exhausted\|repair cap\|final allowed\|last allowed" skills/ docs/` — empty. Broader `fix_rounds|cap` hits reviewed: `skills/chart-issues/SKILL.md:117` (bound, unchanged), `skills/chart-issues/assets/shapes.md:44,276` (display/schema fields), `skills/watch-issues/SKILL.md:34` (seat table), `worker-protocol.md:13` (counter line), `init-akrogon` template (annotated), `docs/guide/phases.md` and `setup.md` (new counting prose), `docs/guide/limits.md` (capacity, unrelated), test fixtures under `skills/watch-issues/scripts/fixtures/` (verbatim session captures, no rule text). None describes failure at a repair cap.

## Commands run

- `bun run format` — clean, no drift (worktree clean after).
- `bun run typecheck` — clean.
- `bun test --changed=$AKROGON_BASE --timeout=30000` — 189 pass / 0 fail (7 files; includes the two changed test files and their consumers).
- `bun test --timeout=30000` — 792 pass / 0 fail, 41 files.
- All seconds–minutes; no slow or live runs needed.

## Known limitations

- `failure.cause: 'attempts'` remains producible only by seat-fault exits in `src/next.ts` (out of scope per design).
- `fix_rounds: 8` in this repo's and framework's config bounds nothing on those repos (both `direct: false`); per design C F2 no revert needed.

## Unverified criteria

None.
