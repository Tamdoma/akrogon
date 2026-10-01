# Review A: proof-order

Base 2b796e98a2da6f914332e736974b93a0bc645715, reviewed head abcbfc9fa3e092b4090de27023ada26ab729d2af. Worktree clean (`git status --porcelain` empty), head is ahead of base.

## Verification
- Read `git --no-pager diff 2b796e9...HEAD -- skills` against criteria 1-3 and plan D1-D8.
- Criterion 1: Shared context defines a slow run (any live run, or a proof sized hours or unknown) and rule 1 with "whatever its own size". Both the implement-end paragraph and the check.fix after-repair paragraph point to it. The blocked-check and final-proof rules stay.
- Criterion 2: rule 2 has the three conditions, delegated-only, never on the final allowed repair round, committed-HEAD start, deferred commits, picks and landing, and the changed-stage rerun. `worker-protocol.md` line 11 keeps the before-wave commit rule outside overlap. Its closing clause and line 25 allow independent proof beside workers and require the final proof, checks and `akrogon phase` after every worker commit lands and every worker worktree is gone. Workers still run only their changed-test command.
- Criterion 3: rule 3 states the exit-and-status wait, waiting again after an early return, no fixed sleep then log read, and exit status as the result. It names no harness command or tool.
- Criterion 4: A's report records format exit 0, typecheck exit 0, `bun test` 353 pass 0 fail, changed tests 148 pass 0 fail. The head is unchanged since those runs, so no rerun.
- No `AREA.md` is in the diff. `skills/AREA.md` and `docs/guide/phases.md:91` still describe proof accurately (no documented behavior changed).

## Findings
- N1 (Nit): rule 2 says "under the slow-run rerun rule", which lives in `skills/chart-issues/assets/standing-design.md:12` and is not defined in the implement-issue skill. A reaches it through the standing-design path in `design.md`. Deferred because the design and brief both require reusing that rule and not restating it. It becomes a Fix if a leaf's `design.md` omits the standing-design path and A reruns too few stages.
- N2 (Nit): the branch carries `2dd1106`, which deletes one assertion in `tests/next.test.ts`. It is outside the leaf's owned surfaces and was made before A's pass, and A disclosed it in the report. Deferred because it fixes a failure that is red on base in akrogon seats and the remaining `startsWith(root + '/')` assertion still checks isolation. It becomes a Fix if the merge leaf shows the deleted assertion guarded a real regression.

## Verdict
nits
