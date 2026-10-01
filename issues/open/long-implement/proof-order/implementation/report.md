# Implementation report: proof-order

Base 2b796e98a2da6f914332e736974b93a0bc645715, head 9644cd79a2ea2af00a1acfdd896e9d11e4899a29. Implemented inline by A (two coupled prose edits, no worker units).

## Changed files
- `skills/implement-issue/SKILL.md`: new Shared context "Proof order" paragraph (slow-run definition, rules 1-3, D1-D5); implement-end and check.fix proof sentences point to it.
- `skills/implement-issue/worker-protocol.md`: line 11 before-wave and closing clauses, line 25 failure-ownership clause (D6-D8).

## Commands (all sized seconds except full bun test, minutes)
- `bun run format`: exit 0, no files changed.
- `bun run typecheck`: exit 0 (2s).
- `bun test`: 352 pass, 1 fail, 78.5s. Fail: `tests/next.test.ts:3544` "fixture temp root isolates every TMPDIR and envs carry override".
- `bun test --changed=$AKROGON_BASE`: exit 0, "2 changed files, but no test files are affected".
- Criterion 3 grep for harness terms on added lines: one hit, the plain word "until" in rule 2. No harness command or tool is named.

## Base run (red on base)
- Command: `bun test tests/next.test.ts`, run once at detached base 2b796e9 and once in the leaf.
- Base: exit 1, 147 pass, 1 fail, same test. Log: /var/tmp/akrogon-1000/proof-order-e11032a02086/po/base.log
- Leaf: exit 1, 147 pass, 1 fail, same test. Log: /var/tmp/akrogon-1000/proof-order-e11032a02086/po/leaf.log
- Failing line: `expect(tmp.startsWith('/var/tmp/akrogon-')).toBe(false)` received true.
- Cause: this seat's exported TMPDIR is /var/tmp/akrogon-1000/proof-order-e11032a02086, which the test forbids. `env -u TMPDIR bun test tests/next.test.ts` passes (148 pass, 0 fail). The leaf diff touches only two markdown files.

## Criteria
- 1, 2, 3: wording in place, checked by reading the diff. Not rechecked after the stop.
- 4: not met in this seat. `bun test` is red on base because of the seat's TMPDIR, so the pass ends `failed` per the base-run rule.

## Operator action
Rerun the implement pass with TMPDIR not under /var/tmp/akrogon-. The two edits are committed on the branch and need no change.
