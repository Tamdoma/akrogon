# Slot B: dispatch-flake territory map

Read and run on 2026-11-10 UTC. Independent map. No other dispatch-flake slot file read.

## 1. Root cause and command contract

**F1. The failing assertion assumes a stronger startup guarantee than the command provides.** A live dependent can have received its task and be working while `attempts.A` remains 0. I reproduced exactly that state, including both preceding live-tab assertions passing. This is not an unawaited state write that a test-side sleep or counter poll will finish. No lost dependent dispatch was observed.

**F2. The historical red's precise trigger remains inferred.** Its captured suite log contains the assertion and elapsed time, but not the captured phase command output or dependent state. A 3-second proof timeout is consistent with its 4360.24 ms duration and with my controlled reproduction. The log cannot uniquely distinguish that timeout from an exception during startup observation which `phaseWake` reports without undoing the committed phase. Do not describe the exact historical timeout as observed.

Trace, separating observations from code inference:

1. **Observed in source:** `tests/next.test.ts`, target test, calls `holdTurns`, awaits initial `next first`, saves `first` in merge, awaits `phase first merged`, and awaits bare `next` before reading the count. No asynchronous CLI result is left unawaited.
2. **Observed in source:** `src/akrogon.ts`, phase case, awaits `mergeWake` then `phaseWake` after the move. `src/next.ts::phaseWake` awaits `dispatchLeaf` and, for its completed result, `dispatchDependents`, under the global lock. `dispatchDependents` sweeps same-repo leaves naming that blocker. This is synchronous command work, not a detached dispatch job.
3. **Observed in source and controlled run:** allocation and `startSeat` create the dependent's worktree/tab/terminal and pass its phase task in argv. The seat record is saved before first-task proof. My delayed-subscription run logged exactly one dependent phase task and a live, working terminal at turn 0.
4. **Observed in source:** `src/seat.ts::firstTask` waits through `src/hc.ts::waitFor` for working status or a turn beyond delivery. The fixture sets `AKROGON_START_PROOF_MS=3000`; production defaults to 60000. `waitFor` starts its timer while starting the `hc events` subscriber, so subscriber startup/observation consumes this budget too.
5. **Observed in controlled run:** delaying only `hc events --json --terminal t2` by 3.2 seconds produces `started, not confirmed t2`, exit 0, no stderr, `delivery_error.A.code=not_confirmed`, `attempts.A=0`, and a working dependent with its task already received. Product code was unchanged.
6. **Observed in source:** the timeout branch of `firstTask` reads a final terminal snapshot but returns unconfirmed without applying its working/turn/ended predicates to that snapshot. `startSeat` increments attempts only for confirmed, while unconfirmed records the error and keeps the seat alive.
7. **Observed in source and controlled run:** `src/next.ts::dispatchSlot` observes busy state, then returns for a working seat before idle/done resettlement. Bare next closes the merged tab but leaves the working dependent's counter/error unchanged. Repeating next is not a guaranteed way to make that counter become 1.
8. **Inferred for the archived red:** the same unconfirmed-start route explains its passing tab assertions and zero counter. A natural instrumented recurrence is needed to identify its exact observation failure.

**F3. Classification:** a timing-sensitive test assumption is established. A product failure to start the dependent is not. There is a demonstrable observation-boundary weakness in `firstTask`, but the accepted contract explicitly permits an unconfirmed live seat and requires working seats to be left alone. Calling the retained zero count a dropped-dispatch race would overstate the evidence.

Actual contract: new-seat attempts count when `startSeat` confirms first-task proof, before it returns. An unconfirmed launch returns successfully with a recorded delivery error and no increment. `dispatchSlot` counts a later ordinary send only when hc reports `started:true`. The historical engine-on-hc delivery decision explicitly allows successful unconfirmed startup and forbids blind resend. Its D13 step 1 requires working/blocked/error/null seats to be left alone apart from busy observation. This map does not propose reopening that decision.

Missing historical observation: merged command stdout/stderr, dependent state immediately after merged and before the failed assertion, terminal status/turn, and received tasks. The smallest useful instrumented test is the target alone; isolated repetition was green here. To catch the original concurrent trigger, run the recorded configured suite once with those diagnostics captured on target failure, then repeat only if needed. I ran one such suite without a target recurrence.

## 2. Reproduction and limits

**E1. Factory records, read 2026-11-10:** `akrogon flaky` reports 2 flips, latest 2026-11-09T15:02:05.905Z. Receipts `fe4b306c-f96a-416b-913e-843e24ded7dd` and `28832fb4-7254-47dd-a2b0-dba962a2359c` have the same tree `f0c2ba02f72f12c3adba65ec83887bbfb6e94fdc`, red/green respectively, lasting 64.434/65.088 seconds end to end. The red test log reports 4360.24 ms and `Expected: 1, Received: 0` at the dependent count. Command: `akrogon log issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-test-1794236439927-3239663.log`.

**E2. Baseline:** from the repository, `bun test tests/next.test.ts --timeout=30000 --test-name-pattern '^merged phase closes tab on typed next and starts the dependent$' --rerun-each=20`. Result: 20 runs, 0 reds, 16.60 seconds total.

**E3. Controlled reproduction:** scratch `/tmp/dispatch-flake-b-63h_wjtx`, made with `git archive HEAD`, original node_modules symlinked, target diagnostics added. The source/test files `src/seat.ts`, `src/hc.ts`, `tests/hc-fixture.ts`, and `tests/next.test.ts` match the historical tree before experiments, verified with `git diff --exit-code <historical-tree> HEAD -- <those files>`.

Added only this test-shim delay before its existing exec:

```sh
if [ "$1" = events ] && [ "$4" = t2 ]; then sleep 3.2; fi
```

Command in scratch: `bun test tests/next.test.ts --timeout=30000 --test-name-pattern '^merged phase closes tab on typed next and starts the dependent$' --rerun-each=3`.

Result: 3 runs, 3 exact assertion reds, 3878.94/3877.31/3861.97 ms. Both tab assertions passed. Merged and typed next returned 0. The dependent had exactly one task and status working, turn 0, attempts 0, not_confirmed error. No CPU load generator or paid harness was used. This recreates the failure mechanism, not a natural historical-trigger recurrence.

**E4. Experimental comparisons, same three-run command:** applying the existing proof predicates to `firstTask`'s final snapshot gave 3 greens under the same delay, 12.12 seconds total. Restoring all product code and replacing the counter proxy with proof of the exact received task plus an event-based working-state wait also gave 3 greens, 12.02 seconds total. The latter additionally asserted one received task after another next pass; attempts remained 0.

**E5. Other runs, fully disclosed:** an initial 1 ms proof-budget experiment produced 3 reds at the earlier tab assertion because the scope check ran before scope placement. It does not reproduce the target failure. A first delay attempt checked the wrong positional argument and was an ineffective-delay control: 3 greens. One diagnostic full run used `bun test --timeout=30000 --parallel=4 --no-isolate` in the archive copy: target green at 1639.87 ms, overall 1086 pass/65 fail in 70.87 seconds. The archive is not a clean verification checkout and that run is not a validation pass. I did not investigate its other failures or rerun the full suite.

Cleanup completed: scratch directory removed and absence checked. All seven experiment terminals removed after exit. No product changes, live factory mutations, paid calls or pushes. The only retained file I wrote is this return.

## 3. Sibling exposure

| Ref | Test in tests/next.test.ts | Exposure |
| --- | --- | --- |
| S1 | `a merged leaf with its tab still open does not count toward max_active` | Same held working seat, merged command, typed next, tab checks, and exact dependent count. Same exposure by source inspection. |
| S2 | `completing a leaf via targeted next starts only same-repo dependents` | Same setup and count, targeted next instead of bare. Same working-seat early return, so exposed by source inspection. |
| S3 | `next --resume completes and cleans a merged leaf and starts its dependent` | Resume launches the dependent and checks its exact count after cleanup. Exposed to unconfirmed startup, with the same held turn. Already has an exact delivered-task assertion. |
| S4 | `next --resume starts an open dependent of an already closed leaf` | Same dependent-launch machinery, but asserts only tab allocation. Not exposed to this count assertion; also does not itself prove working status. |

S1-S3 were not individually reproduced. Ordinary dispatch tests asserting counts can share the startup-proof limit, but are not additional merged-dependent siblings and should not trigger a broad rewrite.

## 4. Options

**O1. Test the dependent-start contract directly.** Replace the count-as-start proxy in the target and matching siblings with existing delivered-task evidence and an event-based working-state observation for their held seats. Retain the same-pass cleanup assertions and prove no duplicate task on a later next.

Parts: no production changes, state fields, timers, new helper abstraction or dependency. Reuse `delivered` and `core.waitFor`; S3 already has delivered evidence. Risk: merely deleting the count would weaken coverage. Remove that risk by checking exact task, correct seat, actual working status, and no duplicate delivery. Done: even when startup confirmation is delayed past its budget, the merged tab disappears during the requested pass, the right dependent is working on its single phase task, and a later pass does not resend it. Nonworking/exited/wrong-task dependents must still fail that proof.

**O2. Reclassify the final startup snapshot using the existing proof predicate.** In `firstTask`, apply working/turn/ended checks to the final terminal snapshot already being read before returning unconfirmed.

Parts: two outcome branches, no new command, timer, state or dependency. Scratch proof: E4. Risk: this fixes a delayed observer when the seat is already working at that read, but cannot guarantee a confirmed count for a seat which starts after it. It therefore cannot alone justify the current unconditional counter assertion. Done: a final snapshot showing working or an advanced turn produces one confirmed count; an ended/error snapshot fails; a genuinely unproven live seat still remains alive, unconfirmed, and unresent.

**O3. Increase the fixture proof budget.** Gives the observer more time using the existing setting. Adds no mechanism but retains the scheduling assumption and makes genuine unconfirmed-start tests slower. It cannot prove timing independence under the permitted contract. Done would require bounded observed startup latency and correct unconfirmed behavior beyond it; no such universal latency bound exists in the evidence.

Off route, not selectable options: retries, serializing the suite, a new listener/timer, counter polling, changing working-seat handling, or changing the permitted unconfirmed-start contract. Earlier suite-time and engine-on-hc decisions bind those areas.

## 5. Pick and cost

**D1. Pick O1.** The test names promise dependent startup and cleanup. Actual task receipt and working state prove that behavior more directly than an internal confirmation counter. E4 demonstrated the proposed proof passing with unchanged product code in the exact zero-count condition that defeats today's assertion. It removes the unsupported timing requirement and preserves the earlier startup policy.

Cost is one small test-only leaf touching the target and the three exposed siblings, reusing existing helpers. No operator workflow or production runtime cost. Exact implementation time was not measured. Keep the focused delayed-observer red/green demonstration as the leaf's evidence and perform the normal clean-checkout checks.

Reject O2 as the sole fix because it leaves the legally late-start case outside its snapshot. It is a possible narrow product improvement, not required for this test-contract repair. Reject O3 because it moves the deadline and increases waiting instead of removing the assumption. Do not combine options by default.

## 6. Practitioner questions and lifetime pitfalls

**Q1. Does the missing historical output show unconfirmed startup or a caught observation error?** Preserve the stated uncertainty. The next instrumented natural red, if required before handoff, supplies that answer. Do not promise the artificial delay identifies the original host scheduling event.

**Q2. Does “starts” mean one correct received task plus working status?** That is my proposed proof, supported by the accepted delivery contract. If the operator wants every successful phase/next to guarantee confirmed accounting, that is a different contract and cannot be smuggled into this test repair.

**Q3. Can a new assertion pass for a wrong or duplicated prompt?** Exact task/seat evidence plus the later-pass task-count assertion removes that pitfall. Waiting on tab existence alone does not.

**R1. Fixed sleeps and larger budgets recreate load sensitivity.** Use the fixture's existing snapshot-first event wait, bounded only for failure, with a genuinely held working turn. No retry-to-green.

**R2. Confirmation and task execution can diverge again.** Keep this integration test about its behavioral contract; leave confirmation/error accounting to `hc-start` and `hc-delivery` coverage. Do not erase their unconfirmed-start cases.

**R3. Cleanup changes can accidentally kill the reporting seat.** Preserve merged-batch-cleanup's same-pass placement and every veto. This test-only option changes no cleanup or listener code.

**D2. One leaf.** There is no need to split production accounting work, because D1 does not include it. Keep the second-seat review, clean-checkout checks, operator decisions and all chart-door steps.

## 7. Evidence tiers

- **Operator:** dispatch-flake INTAKE Scope, CHART Destination/Forks/Off route and signposts Taken/Needs, read 2026-11-10. Fewer parts first; root cause before fix lock; existing approvals/review/checks/records stay; no paid consumer/cap here.
- **Operator:** suite-time/load-sensitive-tests Taken and Direct review F32, read 2026-11-10. No retry or test.serial cure; earlier concurrency decisions remain binding.
- **Operator:** engine-on-hc design, Task delivery and report proof, operator decision dated 2026-11-06, read 2026-11-10. Successful unconfirmed startup and hands-off working-seat policy. Plan Decisions D9/D13 supplies its implementation interpretation.
- **Practitioner:** merged-batch-cleanup CHART Destination/Forks/Off route and cleanup-after-release Taken, read 2026-11-10. Final same-pass reconcile, no mergeWake cleanup or new event/timer.
- **Practitioner:** src/AREA, tests/AREA selected Key files/Non-obvious patterns/Commands, and located relevant LESSONS entries, read 2026-11-10. Fixture isolation, real cores, exact configured command and load-sensitive proof caveats.
- **Better-than-training:** E1 factory receipt/log observations, source trace F1-F3, same-source comparison, and local runs E2-E5, all read/run 2026-11-10. These support the mechanism and bounded proof, not a claim of naturally reproducing the archived timeout.
- **Model-knowledge:** option ranking and the recommendation to prove startup through task receipt/status. Judgment, not an additional observation.
