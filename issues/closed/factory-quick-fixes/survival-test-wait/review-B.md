# Review B: survival-test-wait

Date: 2026-11-11. Phase: check.review, initial blind review.
Base: `a33d967b5dd07829b81b9dd87802c8a72f8effbd`.
Reviewed head: `123c9181f2a09cd35dcf5be820a18b8649d82426`.
Verdict: **ready**. No Fixes, Nits or operator actions.

## Scope and contract

Read the brief, design, plan, implementation report, installed check-issue and
ponytail instructions, standing design, reference index, tests area, human verify
documentation and the cited verify-lifetime decision. Reviewed the whole diff.
The peer's review was not read and the peer was not contacted.

The only change adds `waitInactive` after the complete-receipt poll in the
survivor test. It names the service from `receipt.run`, reuses the existing 12 s
bound and leaves every assertion and the 90 s test cap intact. `passUnit` and
`launchPass` establish the service name. `runOnce` publishes the completed
receipt before removing its checkout, inside that service. The new observation
therefore follows Taken point 4 and catches completed-service cleanup failures
without judging cleanup while it is running. The service uses the default simple
startup type, and the completed receipt comes from its running body, so the wait
does not race initial activation.

No documented behavior changed. `docs/reference/checks.md` already describes
receipt publication followed by checkout removal. No AREA.md, product source,
runner configuration, helper, fixture or lockfile changed. The worktree was clean.

Inspection evidence, read back with `akrogon log`:

```text
check review-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-review-b-diff-1794393270784-881306.log
check review-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-review-b-context-1794393282578-893098.log
check review-b-lifecycle: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-review-b-lifecycle-1794393330591-942859.log
check review-b-receipt-index: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-review-b-receipt-index-1794393336834-949461.log
```

## Test-Change audit

One trailer in `a33d967b..HEAD`, in commit `123c9181`:

```text
Test-Change: tests/run-units.test.ts issues/open/factory-quick-fixes/survival-test-wait/brief.md criterion 1: the pass writes its receipt before removing its checkout, so the proof waits for the pass service (waitInactive) before asserting the checkout is gone; no existing expectation changed
```

`src/test-files.ts` matches this existing test path. The cited criterion and live
publish-then-remove order justify the edit. No assertion was removed or weakened.

## Criterion evidence

Read every following saved log with `akrogon log`, and checked its recorded exit
and timing against `issues/timings.jsonl`.

| Criterion | Observed result |
| --- | --- |
| C1 | Under the recorded 2 s cleanup delay, base fails at the checkout assertion in 4.54 s and head passes in 6.44 s with all eight assertions. |
| C2 | With removal skipped, head fails at the same checkout assertion in 4.51 s. |
| C3 | With cleanup hanging, head fails through `waitInactive` in 16.56 s, naming `akrogon-verify-5d9bf003-5ca3-42c2-8d88-afd693356209.service`, before the test cap. |
| C4 | Clean head passes in 4.58 s with eight assertions, covering caller SIGKILL, successful setup and check, retained log, removed checkout and check-done. |

```text
check c1-base: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c1-base-1794392780338-2861247.log
check c1-head: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c1-head-1794392788477-2895230.log
check c2-leftover: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c2-leftover-1794392796674-2965097.log
check c3-hang: 1 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c3-hang-1794392816705-3013567.log
check c4-clean: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-c4-clean-1794392823564-3107576.log
```

These implementation runs start after the test commit at 10:25:56Z. The final
committed diff contains no scratch edit. The report uses D6's same Bun runner,
timeout, isolation flag, test file and name filter. Its narrow commands omit D6's
install prefix, retaining own-modules validation. This changes no selected test
or case, and fresh-checkout setup plus the entire configured suite also passed.
The recorded deliberate failures preserve the proof's discrimination. No planned
test or runner was disabled, and no missing current run requires a rerun.

## Configured checks

Receipt `d9c3c570-2a1b-4753-9aa0-e247e20cd22b` is complete for the reviewed
head and tree `e2f54d3e5a99bae3766fa32c0bc2dca8a243b08d`: setup, format,
typecheck and test all exit 0. Nothing is blocked. Read the saved logs:

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-format-1794393176388-540351.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-typecheck-1794393178766-540351.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/factory-quick-fixes/survival-test-wait/implementation/check-test-1794393238807-540351.log
```

The suite reports 1,152 pass, zero fail, including the survivor test. Also read
the two earlier red suite logs (`check-test-1794392897855-3140205.log` and
`check-test-1794393137734-4101725.log`) and the green retry
(`check-test-1794393017394-3516554.log`). The agy reset and simultaneous-base
notice failures are inconsistent on this unchanged tree and outside the one-line
diff. The survivor passes in all four suite logs. The failed known-red attempt
is not accepted as cover. Readiness rests on the later whole-green receipt.

## Grants and lessons

`grants` and `retained` are empty. No paid or external live proof was required or
launched during review. No reusable Nit remains to record as a lesson. No code
was edited or committed during review.
