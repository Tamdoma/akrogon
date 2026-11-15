# Merged map: dispatch-flake

Written by A on 2026-11-10 from slots/map-A.md and slots/map-B.md. Tags name the slots that hold a line. "observed" = seen in a log or a run, "inferred" = not seen.

## Root cause

- (A,B) Observed in code: a dependent's first attempt is counted only when its seat start is proven inside the start-proof window (src/seat.ts `startSeat`, `firstTask`). An unproven start records `delivery_error.not_confirmed`, counts nothing, prints `started, not confirmed <address>` and the command exits 0.
- (A,B) Observed in code: the product window is 60 s; the test fixture sets `AKROGON_START_PROOF_MS: '3000'` for every hc-fixture test (tests/hc-fixture.ts).
- (A,B) Observed in code and runs: the test holds the seat `working`, and a later pass leaves a working seat alone (src/next.ts `dispatchSlot`), so the count stays 0. Waiting or repeating `next` in the test cannot make it 1.
- (A,B) Observed in runs, 2026-11-10: a delay of just over 3 s reproduces the recorded signature (both tab assertions pass, `attempts.A` 0, `not_confirmed`). A delayed the dependent's stand-in 3.5 s: 1 run, 1 red, 3.64 s. B delayed the `hc events` subscriber for that terminal 3.2 s: 3 runs, 3 reds, about 3.87 s each. Product code unchanged in both.
- (B) Observed in code: the window's clock starts while the `hc events` subscriber is still starting, so subscriber startup spends the same 3 s (src/hc.ts `waitFor`). At the timeout `firstTask` reads a last snapshot but does not apply its own proof test to it.
- (A,B) Inferred: the red of 2026-11-09 took this route. Its log holds no command output, so what stalled for 3 s is unknown. (B) the log cannot rule out an error during start observation that `phaseWake` reports while the command still exits 0. (A) the 4.36 s duration fits a full 3 s wait, and an error would return early.
- (A,B) Not reproduced without a forced delay: A 360 runs in 6 parallel loops, 0 reds; B 20 runs, 0 reds, and one full suite with the target green.
- (A,B) Verdict: a timing-sensitive test assumption. No lost or doubled dependent dispatch was seen. The product followed its contract: the operator decision of 2026-11-06 (engine-on-hc design, Task delivery and report proof; plan D9, D13) allows a live unproven seat and forbids a blind resend (B read it).
- (A, reader) The other flip (2026-10-26) is a 15 s test timeout in a log with 50 fails, before the hc engine: host overload, another mechanism.

## Recorded cost (3a)

- (A) This test: 2 flips; one (2026-11-09) has this signature.
- (A) The same 3 s window, estimate from the 25 red `test` logs in issues/verify-runs.jsonl since 2026-11-07 (script over `akrogon log`, 2026-11-10): 16 failed tests in 7 logs failed on a `next`/`phase` exit code or an `attempts` count after 3.4 to 6.0 s. The class is a heuristic (assertion kind plus duration); the logs hold no command output. One of them is this test failing at its first `next first` with exit 1 after 3.85 s (chart-door-on-hc, check-test-1794109264711-557749.log). A's 1 ms window run and B's E5 show that route: an unproven start goes on to the scope check before systemd placed the seat, the command exits 1 and the seat is ended. Most of the 16 fall in the 2026-11-08 systemd unit-leak episode (learnings/LESSONS.md).
- (B) did not measure the class and says ordinary dispatch tests "should not trigger a broad rewrite".

## Siblings

- (A,B) tests/next.test.ts `a merged leaf with its tab still open does not count toward max_active` and `completing a leaf via targeted next starts only same-repo dependents`: same steps, same exact count.
- (B) `next --resume completes and cleans a merged leaf and starts its dependent`: same count after a resume; already asserts the delivered task.
- (A, reader) 18 exact-count lines in next.test.ts and one in status-json.test.ts sit behind a first dispatch under the same window; 39 test files use the fixture.

## Options

- P1 (B pick) Test the start directly. In the target and the three siblings, replace the count with the exact task the dependent received, an event wait for its `working` state, and no second task after a later pass. No product change. Reuses `delivered` and `core.waitFor`. Scratch proof by B: 3 greens under the 3.2 s delay with product code unchanged, `attempts` still 0. Cost: four tests rewritten; every other test behind the window keeps the cliff, and a start that exits 1 at the scope check still fails. Lifetime: the count and error accounting stay covered only by tests/hc-start.test.ts and tests/hc-delivery.test.ts.
- P2 (A pick) Remove the fixture-wide 3 s window. hc-fixture tests run with the product's window, and the tests that need an unproven start set a short window themselves through the env override `next` and `cli` already take. One fixture line and a handful of explicit values. A proven start returns on the event, so green tests take no longer. Cost: a start that stalls now ends as a bun test timeout (15 s on these tests), and a new never-confirms test must set its own window. (B, as its O3) rejects a larger budget: it keeps the scheduling assumption and no latency bound exists in the evidence.
- P3 (B, not picked by either) Apply the proof test to the last snapshot in `firstTask`. Two branches, no new part. Scratch proof by B: 3 greens under the subscriber delay. Fixes a late observer, not a seat that starts after the read. A product change inside the engine-on-hc decision's area.
- Off route (A,B): retries, serial runs, a fixed sleep or counter poll in the test, a new timer or listener, counting an unproven start as an attempt, changing how a working seat is handled.

## Where the slots differ

- A: P2 removes the failure class with fewer parts (signpost 1a) and has a recorded class cost. B: P1 removes the assumption for the tests that make it and keeps every earlier decision untouched; a bigger window only moves the deadline.
- A reads "per-test cap raises" (foreclosed in issues/chart/suite-time/forks/load-sensitive-tests.md, Taken Q1) as bun per-test timeouts, not the fixture's product setting. B lists a larger budget as selectable (its O3), so it does not read it as foreclosed either, but rejects it on merit.
- B: say plainly that the 2026-11-09 trigger is inferred. A agrees.

## Pitfalls and what removes each

- (B) Dropping the count weakens coverage: P1 keeps exact task, seat, working state and no duplicate.
- (A) A longer window hides a real stall: the bun test cap still fails a start that never proves.
- (A) Tests that lean on the 3 s window without saying so: one full-suite run with the override removed lists them. Observed by A, 2026-11-10, scratch clone at 63526537, `bun test --timeout=30000 --parallel=4 --no-isolate`: unmodified 1,149 pass, 2 fail, 57.29 s (both fails are listener tests in tests/hc-listen files, at 15.1 s and 21.5 s, while B's and A's other runs loaded the host); override line removed 1,146 pass, 5 fail, 82.66 s. Four of the five ran to the 30 s cap and are the tests that need an unproven start: `a seat that never works stays running, is reported started not confirmed, and is not resent`, `a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves`, `a manual next ignores an inherited HC_TERMINAL_ID`, `the busy notice lands in the session holding the repo space`. The fifth is one of the two listener tests that also failed unmodified. No other test changed result.
- (B) Fixed sleeps and larger budgets recreate load sensitivity: only event waits, bounded for failure.
- (A,B) A proof for a red that load does not reproduce: the forced-delay case, red before the fix and green after.

## Open questions

- (B) Does "starts" mean one correct task received plus `working`, or must every successful `phase`/`next` also have counted the attempt? The second is a contract change, not this repair.
- (A) A resettled unproven start is never counted, so that seat gets one more silent turn than the three the rule states (src/next.ts `dispatchSlot`). No recorded cost found; listed, not charted.

## Split

- (A,B) One leaf, one outcome, no prerequisite, no paid call, key or grant.

## Evidence

- better-than-training: source and logs named above, read 2026-11-10; A's and B's scratch runs, 2026-11-10, scratch copies removed.
- practitioner: Fowler, "Eradicating Non-Determinism in Tests" (2011-04-14, https://martinfowler.com/articles/nonDeterminism.html, read 2026-11-10): no bare sleeps; wait by callback or polling; the callback's timeout "pretty high"; limits never literal, set in bulk by constants or the runtime environment; exceeding the limit throws a clear test-timeout error.
- practitioner, not counted: Micco, "Flaky Tests at Google and How We Mitigate Them" (2016-05-27): the page body did not load on 2026-11-10.

## After B's rebuttal (slots/map-rebuttal-B.md, 2026-11-10)

- M1, B's pick changes to P2 (A,B). B's O3 rejected a larger arbitrary deadline; P2 removes the shared override, uses the product setting and makes the four unproven-start tests state their own short window. P1's event wait also has a failure deadline, so "no latency bound exists" does not separate the options. B has not repeated A's suite comparison.
- M2, accepted (A,B): "an error would return early" is withdrawn. After the window ends `firstTask` still reads `terminal` and `screen`, and either read can fail; `phaseWake` reports the error and the command exits 0. The 4.36 s fits the timeout route but cannot rule out an observation error after the timeout. The 2026-11-09 trigger stays inferred.
- M3, accepted (A,B): "No other test changed result" is replaced by: four newly failing unproven-start tests; the listener outcomes also varied (two failed unmodified, one with the override removed). The two runs name the tests that need their own window and are not an otherwise identical red/green pair.
- No remaining disagreement.
