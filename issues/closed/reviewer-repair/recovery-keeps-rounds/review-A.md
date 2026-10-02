# Review A: recovery-keeps-rounds

Base: `22c447039b192f4caae6cad4d5b56092941d1bed`. Reviewed head: `00ccfb9f396ecae00578f64927e04135474db44d`. Worktree clean.

## Diff against plan

- D1, D2: `src/phase.ts` `commitMove` lost only the `recorded.phase === 'failed' ? 0` arm. The increment condition, the cap move (`src/phase.ts:236-239`) and all other cleared fields are unchanged. This matches the design's exclusions.
- D3: the cap test asserts `failure.reason: 'fix rounds exhausted'` with `fix_rounds: 1` after `moved failed`, and `fix_rounds: 1` after recovery to `implement`. It checks only the stored count.
- D4: the renamed test keeps 3 on recovery to `plan.synthesis` and keeps 2 on recovery to `check.fix`. Attempts and done still reset.
- D5: `docs/guide/phases.md:73` adds the recovery-keeps-count sentence. No AREA.md is in the diff. No other doc claims a reset (grep of docs, README and skill SKILL.md files for recovery plus round, reset or count).

## Verification

Evidence reused from the implement pass at this same head (no code change since):
- Old `src/phase.ts` with the new tests: the cap test expected `fix_rounds: 1` and received 0, and `stuck` expected 3 and received 0. Both were red.
- `bun test tests/phase.test.ts -t "caps repairs|failed exits by command"`: 2 pass, 0 fail.
- `bun run format` made no changes, `bun run typecheck` exited 0, `bun test` had 353 pass and 0 fail, and `test_changed` had 39 pass and 0 fail.

Done-criterion 1 has tests that catch its failure.

## Findings

### N1 (Nit): the doc's "one more repair" is true for only one recovery target at this head

Concern: with the current cap move, recovering a cap-failed leaf to `check.fix` gives one repair and then a B-only re-check, as the doc says. Recovering to `failure.phase` (`check.review`), which `skills/watch-issues/SKILL.md:39` uses, gives a B-only re-check of unchanged code with no repair first. A `fix` verdict there fails again at once.

Why deferred: the sentence is the locked design's wording (Q2 2a). Where the cap sits and which phase a cap failure records belong to `b-repair-phase` (Q3), which this leaf must not touch. Watch recovery already stops after two unproductive cycles.

Would become a Fix if: `b-repair-phase` merges without making recovery at the cap produce a repair, and a real watch-issues recovery log shows `failed -> check.review -> failed` with no `check.fix` in between.

## Verdict

nits
