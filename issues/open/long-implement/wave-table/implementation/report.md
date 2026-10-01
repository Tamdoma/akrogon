# Implementation report: wave-table

Base: 2b796e98a2da6f914332e736974b93a0bc645715. Committed head: 7fecdc7158d6e295f8f842c8710d6b851f928ce4 (three wave commits cherry-picked: 8971d81 U1, 7c5731e U2, 0c8f2d0 U3).

## Result: stopped, `bun test` red on base

Phase ended with `akrogon phase wave-table failed`. The leaf diff is prose only. The one failing test also fails at the base commit, so the stop rule applies, not a repair.

## Changed files and reasons

- `skills/plan-issue/SKILL.md` (U1): plan.synthesis checklist grouped into waves, with owned paths, shared test resources, prerequisites, shared-wave condition, later-wave placement, cap 3. Criterion 1.
- `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md` line 44, `skills/implement-issue/brief-template.md` (U2): run each plan wave whole, only reasons a unit leaves a wave, fallback grouping from sub-brief records, inline wave order, "one at a time when unsure" deleted. Criteria 2.
- `skills/implement-issue/SKILL.md` check.fix paragraph (U2): repair briefs grouped by the same rule. Criterion 3.
- `skills/AREA.md:21`, `docs/guide/phases.md:77,87` (U3): match the skills. Criterion 4.

## Commands and results

- Workers: each ran `bun test --changed=$AKROGON_BASE`: 0 tests affected (prose only). Worker worktrees removed.
- `grep -rn "one at a time when unsure" skills docs`: no match (exit 1). Criterion 2 proof.
- Read of all added lines against criteria 1-4: all stated. No stale "ordered checklist" in `skills/` or `docs/`.
- `bun run format`: exit 0, no file changed (1s).
- `bun run typecheck`: exit 0 (1s).
- `bun test --changed="$AKROGON_BASE"`: exit 0, 0 tests affected (under 1s).
- `bun test`: exit 1, 352 pass, 1 fail (79s).

## Red check and base run

Failing test: `tests/next.test.ts:3544` "fixture temp root isolates every TMPDIR and envs carry override". Assertion `expect(tmp.startsWith('/var/tmp/akrogon-')).toBe(false)` received true.

Same test, same command (`bun test --test-name-pattern "fixture temp root isolates"`), run in a detached base checkout at 2b796e9 with `bun install`: exit 1, same failure at the same line.

- Branch log: /var/tmp/akrogon-1000/wave-table-db8355545e69/tmp.3dIhkdQPNQ/wt.log
- Base log: /var/tmp/akrogon-1000/wave-table-db8355545e69/tmp.3dIhkdQPNQ/base.log
- Base worktree removed.

Likely cause, not verified by a rerun: this seat's `TMPDIR` is `/var/tmp/akrogon-1000/wave-table-db8355545e69`, so the fixture's temp root sits under `/var/tmp/akrogon-`, the exact prefix the test forbids. The test would then fail in any akrogon seat. No file of this leaf touches it.

## Criteria

1-4: met by the diff, proven by the read and grep above. 5: not met. `bun test` is red on base.

## Known limitations and operator action

Operator: decide whether `tests/next.test.ts:3544` should tolerate a seat `TMPDIR` under `/var/tmp/akrogon-` (a change outside this leaf's owned paths), or run `bun test` for this leaf from a shell whose `TMPDIR` is outside that prefix, then recover the leaf without `--slot`.
