# Direct review B, round 1

Verdict: **fix**.

Base: `e48585a5d197b50114cafa685a759367dab89973`.
Reviewed head: `2ee7cf7654c7a50851dc2f529df09074d9fc060a`.
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/faster-suite-files`.

Reviewed the five-file diff, direct/brief-1.md through brief-3.md, direct/plan.md, direct/report.md, the taken fork decisions, tests/AREA.md and the affected tool flows. The worktree was clean and remained at the requested head. No implementation edits, commits, phase moves or full-suite reruns were made.

## Fixes

### F32. The peer-wait wall-time criterion was replaced with a different outcome

Source: direct/brief-2.md, Numbered acceptance criteria, item 1, and direct/plan.md, Criteria, item 3. Both require tests/peer-wait.test.ts to finish faster than base. direct/report.md, Criteria, item 3, reports the same 22.63-second solo wall time on base and head. It then claims no unverified criteria after substituting load survival and fewer spin seconds in the plan's Implementation notes.

That substitution does not satisfy the original observable result. The plan-issue skill's plan.synthesis rule permits correcting a proof command while preserving its observable result. It does not authorize replacing faster file completion with different budget arguments or a different stress result. The original single-file command was not shown to be an invalid observer of file completion time.

The retained eleven-second proven-open waits have a sound coverage reason: peer-wait.ts's grace branch distinguishes budget from failure at ten seconds. Do not shorten those waits or weaken their assertions merely to clear this finding. Return the mismatch to the chart door for a decision on the criterion, or meet the existing criterion within the exclusions. Until then, mark the peer-wait wall-time outcome unmet rather than complete.

This blocks the named done-criterion. It is not a request to redesign production timing.

### F33. The new door-reset wrapper fails from checkout paths containing spaces

Location: tests/door-reset.test.ts:222.

The generated shell line interpolates the absolute fake-herdr.ts path into `exec` without quoting it. A developer running the test from a checkout whose directory contains spaces supplies that path through import.meta.dir. The shell splits it into words, so the fake never executes correctly and the identity-change assertion at :229 fails.

I reproduced this with real local Git checkouts at the exact base and head, in a directory named `checkout with spaces`, using the same installed dependencies and this unchanged command:

```sh
bun test --timeout=30000 tests/door-reset.test.ts -t '^a session change during the turn wait'
```

Base: exit 0, one pass, all three expects. Head: exit 1, one failure at the identity-change assertion. The temporary checkout was removed and its absence checked. This is a checkout/build regression introduced by the changed wrapper, not a known-red failure, so the unrelated-red retry rule does not apply.

Quote the executable path when constructing the shell command. The existing src/shell.ts quote helper already supplies shell quoting. Preserve the three outcome assertions and the protocol-triggered session change.

Kept reproduction and read-back:

```text
check review-b-space-root: 0 /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-review-b-space-root-1792966015845-3392484.log
```

The harness's exit 0 means it completed both comparisons and cleanup. Its recorded child test exits are base 0 and head 1. I read the log back with akrogon log.

## Verification and proof mapping

1. V1. Required checks are green on the reviewed head. Receipt `df9fe746-0469-4532-94f6-41b3ef3ebb06` records setup 0, format 0, test 0 and typecheck 0 for this SHA. I read all three check logs. The suite ran 1175 tests across 69 files, zero failures, 11676 expects, in 168.37 seconds. This is existing verification evidence, not a new review run.
2. V2. I read back all twelve head three-copy file logs. leaf-slices, peer-wait, door-reset and status each pass all cases in all three copies. Counts are respectively 15/82, 37/173, 17/75 and 35/367 tests/expects per copy. The pinned peer-wait comparison also records four failures per base copy and three green head copies.
3. V3. The next.test.ts alternating proof keeps 2246 expects while increasing tests from 246 to 254. Base walls are 66.66, 45.65 and 46.79 seconds. Head walls are 26.59, 26.42 and 26.76 seconds. The nine owner/directory fixtures, comparisons and cleanup are retained in the diff.
4. V4. The count-baseline correction preserves the original outcome. The same-checkout base log records 1167 tests and 11674 expects. Head records 1175 tests and 11676 expects, matching the eight added test registrations and two added assertions. Replacing the main-checkout count with the same-checkout count is valid. It is distinct from F32's change to the required result.

Receipt and proof read-back records:

```text
check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-review-b-receipt-1792966038150-3393591.log
check review-b-proof-readback: 0 /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-review-b-proof-readback-1792966120007-3396541.log
check review-b-final-head: 0 /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-review-b-final-head-1792966202035-3400414.log
```

The original verify logs read back were check-format-1792964965883-981911.log, check-test-1792965134401-981911.log and check-typecheck-1792965137162-981911.log under direct/. The same-checkout base count is from check-base-suite-plain-1792965730789-2825426.log.

The third agent-list read in the new door-reset fixture is appropriate despite the brief's shorthand about the second read. main reads the initial identity, child checks it again, and waitTurnEnd performs the third read. The implementation changes identity inside the intended turn-wait observation. F33 concerns shell path handling, not that ordering.

No documented product behavior changed. tests/AREA.md's timeout description remains true. No AREA.md was changed. Production code, configuration and shared fixture helpers are unchanged.

## Test-Change trailers

All five changed existing test files have trailers in their commits' final trailer blocks. Each cites the supplied overload logs and taken load-sensitive-tests fork. Those sources support the fixture/budget changes and the named-target split. The unmet wall-time requirement is separately recorded as F32.

```text
e013618927fccb699e712eff6958ce496e63d7ac
Test-Change: tests/leaf-slices.test.ts S1 overload logs (/home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs) and chart fork issues/chart/suite-time/forks/load-sensitive-tests.md: concurrent copies collided on shared real systemd slice names

b32f321212d23d3138e1c7a4b2fa6226aa59198c
Test-Change: tests/peer-wait.test.ts S1 overload logs issues/chart/suite-time/slots/s1-logs and fork issues/chart/suite-time/forks/load-sensitive-tests.md: short budgets expired before the required observations (status null, session-A)
Test-Change: tests/door-reset.test.ts S1 overload logs issues/chart/suite-time/slots/s1-logs and fork issues/chart/suite-time/forks/load-sensitive-tests.md: the session change was ordered by a sleep, not by the observed read

2ee7cf7654c7a50851dc2f529df09074d9fc060a
Test-Change: tests/status.test.ts status TIME fixtures use one epoch per test, source /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs and issues/chart/suite-time/forks/load-sensitive-tests.md, reason 0h 23m flaked to 0h 22m from separate Date.now() samples
Test-Change: tests/next.test.ts named-target loop split into nine tests, source /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs and issues/chart/suite-time/forks/load-sensitive-tests.md, reason serial 26.5 s test is a load-sensitive timeout risk at 60000 ms
```

No Nits or operator-only access blockers. Return to the chart door with F32 and F33. No phase command was run.
