# Implementation report: proof-order

Base 2b796e98a2da6f914332e736974b93a0bc645715, committed head abcbfc9fa3e092b4090de27023ada26ab729d2af. Implemented inline by A (two coupled prose edits, no worker units). This is the second implement pass. The first ended `failed` because `bun test` was red on base with this seat's TMPDIR under /var/tmp/akrogon-.

## Changed files
- `skills/implement-issue/SKILL.md`: new Shared context "Proof order" paragraph (slow-run definition, rules 1-3); the implement-end and check.fix proof sentences point to it.
- `skills/implement-issue/worker-protocol.md`: line 11 before-wave and closing clauses, line 25 failure-ownership clause.
- `tests/next.test.ts` (commit 2dd1106, not made by this pass): drops the `/var/tmp/akrogon-` prefix assertion that failed in akrogon seats. It is on the leaf branch below this pass's commit and is outside the leaf's owned surfaces. Reviewers should judge it as a pre-existing branch commit.

## Commands (results this pass)
- `bun run format`: exit 0, no file changed (seconds).
- `bun run typecheck`: exit 0 (2s).
- `bun test`: 353 pass, 0 fail, 80s wall (minutes).
- `bun test --changed=$AKROGON_BASE`: 148 pass, 0 fail, 62s wall (minutes). It ran only `tests/next.test.ts`, since that is the changed test file.
- The "Missing leaf: resting (parked)" stderr line is expected test output.
- Criterion 3 grep for harness terms on the added lines: one hit, the plain word "until" in rule 2. No harness command or tool is named.

## Criteria
1. SKILL.md defines a slow run and states rule 1, including "whatever its own size", once in Shared context. Both the implement-end paragraph and the check.fix after-repair paragraph name that proof order. Evidence: `git --no-pager diff 2b796e9...HEAD -- skills/implement-issue/SKILL.md`.
2. SKILL.md rule 2 states the three conditions, delegated-only, not the final allowed repair round, committed-HEAD start, deferred landing and changed-stage rerun. worker-protocol.md lines 11 and 25 allow independent proof beside workers and still require the final passing proof and checks after every worker commit lands and every worker worktree is gone. Evidence: the same diff for both files.
3. SKILL.md rule 3 states the exit-status wait, waiting again after an early return, no fixed sleep then log read, and exit status as the result. It names no harness command or tool.
4. Every `checks` command passes, including the resolved changed-tests command (results above).

## Known limitations
- No slow run in this leaf, so no restart boundaries, reused stages or blocked checks.
- Wording was verified by reading the diff, per the design. No wording test was added.
- wave-table edits the same two files. Whichever leaf merges second rebases onto the other's text at worker-protocol.md line 11.
