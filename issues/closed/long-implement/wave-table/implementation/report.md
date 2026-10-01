# Implementation report: wave-table

Base: 2b796e98a2da6f914332e736974b93a0bc645715. Committed head: a055f6417629f2d6b79fa9f870303a7d2f2bdf18.
Lane history: `2dd1106` (operator test fix for the seat TMPDIR assertion, outside this leaf), then `f62cd3b` U1, `5383e64` U2, `a055f64` U3.

This pass resumed after an earlier stop (`bun test` red on base from the TMPDIR assertion in `tests/next.test.ts`). The operator's `2dd1106` removed that assertion. No leaf file changed in this pass.

## Changed files and reasons

- `skills/plan-issue/SKILL.md` (U1): plan.synthesis checklist grouped into waves, with owned paths, shared test resources, prerequisites, shared-wave condition, later-wave placement and cap 3. Criterion 1.
- `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md` line 44, `skills/implement-issue/brief-template.md` (U2): each plan wave runs whole, the only reasons a unit leaves a wave, fallback grouping from sub-brief records, inline wave order, "one at a time when unsure" deleted. Criterion 2.
- `skills/implement-issue/SKILL.md` check.fix paragraph (U2): repair sub-briefs grouped by the same rule. Criterion 3.
- `skills/AREA.md:21`, `docs/guide/phases.md:77,87` (U3): match the skills. Criterion 4.

## Commands and results

- Worker changed tests: 0 tests affected (prose only). Worker worktrees removed.
- `grep -rn "one at a time when unsure" skills docs`: no match (exit 1). Criterion 2.
- Read of the added lines against criteria 1-4: all stated. No stale "ordered checklist" in `skills/` or `docs/`.
- `bun run format`: exit 0 (1s).
- `bun run typecheck`: exit 0 (1s).
- `bun test`: exit 0, 353 pass, 0 fail (79s).
- `bun test --changed="$AKROGON_BASE"`: exit 0, 148 pass, 0 fail (63s).

## Criteria

1-4: met, proven by the read and grep above. 5: met, all four commands exit 0.

## Known limitations and unverified criteria

None known. No test added (design: a wording test is a vanity test).
