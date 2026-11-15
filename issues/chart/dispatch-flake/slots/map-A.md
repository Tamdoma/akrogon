# Map A: dispatch-flake

Slot A, 2026-11-10, written before reading map-B.md. "observed" = A saw it in a log or a run; "reader" = a cheaper reader reported it; "inferred" = not seen.

## Root cause

1. Observed (code). A dependent's first attempt is counted only when its seat start is proven inside the start-proof window. `startSeat` (src/seat.ts) launches the terminal, then `firstTask` waits up to `START_PROOF_MS` for the seat to go `working` or its turn to pass the delivery turn. Proven: `attempts[slot] + 1` and `prompted`. Not proven: `delivery_error.not_confirmed`, no count, and the command prints `started, not confirmed <address>` and still exits 0.
2. Observed (code). The product window is 60 s (src/seat.ts `START_PROOF_MS`). The test fixture sets `AKROGON_START_PROOF_MS: '3000'` for every hc-fixture test (tests/hc-fixture.ts `hcFixture` env). Reader: plan N5 of issues/closed/herdr-app/hc-engine/engine-on-hc/plan.md calls it a test seam with no reason given for 3000; 39 test files use the fixture.
3. Observed (code). The test holds every stand-in turn `working` (`holdTurns`). After an unproven start the next pass (`dispatchSlot`, src/next.ts) sees a live seat that is `working` and returns, so `attempts.A` stays 0 for as long as the hold lasts. Waiting longer in the test cannot turn it into 1.
4. Observed (run, 2026-11-10, scratch clone at 63526537). With only the dependent's stand-in delayed 3.5 s (`case "$PWD" in */second) sleep 3.5`), the test fails with the recorded signature: `phase first merged` exits 0 and prints `started, not confirmed t2`, both `liveTabs` assertions pass, `attempts.A` is 0, state holds `delivery_error.A.code not_confirmed`, test time 3.64 s against 0.87 s unmodified (red run: 4.36 s against 1.91 s green in the full suite, where the green figure includes two later steps).
5. Inferred. In the red run of 2026-11-09 the dependent's stand-in took more than 3 s to report `working`. What stalled it is not recorded: the test does not print the command output. The run was not overloaded as a whole (red and green logs: p50 344 and 358 ms, p90 1,699 and 1,748 ms, both about 59 s).
6. Not reproduced by load: 360 unmodified runs in 6 parallel loops on 2026-11-10 gave 0 reds (about 1 s each).

Verdict: a test-side cliff, not a dispatch race. The product behaved by its contract (an unproven start is recorded, not counted, and resettled once the seat's turn moves). The test asserts a count that is true only when a real process start beats a 3 s clock that the fixture, not the product, sets.

Reader: the other flip (2026-10-26) is a 15 s test timeout in a log with 50 fails, from before the hc engine. It is host overload, a different mechanism.

## Exposed siblings

Same shape (start by `phase ... merged` or `next`, then an exact `attempts` count under the same 3 s window): next.test.ts `a merged leaf with its tab still open does not count toward max_active`, `completing a leaf via targeted next starts only same-repo dependents`, and every other exact-count assertion after a first dispatch in the 39 hc-fixture files (reader lists 18 such lines in next.test.ts and one in status-json.test.ts). Every one fails the same way when a stand-in start takes over 3 s.

## Options

- O1 Fixture window is the product's, short window is opt-in. Remove the global 3 s override so hc-fixture tests run with a window a real start cannot lose to (the product default, or a value at or above the per-test cap), and give the few tests that need an unproven start (stand-in mode `idle`: tests/hc-start.test.ts `hs-idle`, tests/session-reads.test.ts `dispatchFixture({ mode: 'idle' })`) their own short window through the env override `next`/`cli` already take. Parts: one fixture line changed, 2 to 3 tests gain an explicit value. A proven start returns on the event, so green tests take no longer. Lifetime: a start that stalls now shows as a test timeout, which is the true signal (host stall), instead of a wrong-looking count; a new never-confirms test must set its own window or it runs the full window. Removes the cliff for all 39 files.
- O2 Fix this test only: assert what its name says (the dependent has a live seat that received its task; the merged tab closes on typed next) and drop the exact count, or release the hold and wait on the core for the turn before counting. Parts: one test. Leaves the siblings and the cliff.
- O3 Count the attempt in the product when the start is launched or resettled. Changes the start-proof contract (plan D9) for a test-only symptom; under the hold the resettle never happens, so only "count at launch" would fix the test, and that counts starts that were never proven.
- O4 Raise the fixture window to a larger fixed number (for example 10 s). Same idea as O1 with a new magic number and the cliff moved, not removed.

Pick (A): O1. Signpost 1a: it removes a part's reach (a global timing override) instead of adding a wait, and removes the failure class. Cost: tests that rely on the short window without saying so must be found by one full-suite run with the override removed; any that slow down are the opt-in list.

Open product question (not this chart's outcome unless the operator says): a resettled unproven start is never counted in `attempts`, so such a seat gets one more silent turn than the three the rule states (src/next.ts `dispatchSlot`, resettle branch). No recorded cost found.

## Questions a practitioner would ask

- Does "per-test cap raises" (foreclosed in issues/chart/suite-time/forks/load-sensitive-tests.md, Taken Q1) cover the fixture's start-proof window? A reads it as no: that fork is about bun per-test timeouts, and this is a product setting the fixture overrides.
- Should the test print the command output on failure so the next red names its cause? Only if it costs no new part; the O1 outcome makes the signature impossible instead.
- How does the leaf prove the fix when the red is not reproducible by load? By the delayed-stand-in case: with the dependent's start delayed past 3 s, the test passes after the fix and fails before it.

## Pitfalls

- A longer window hiding a real stall: removed by the bun test cap (15 s on these tests), which still fails a start that never proves.
- Tests silently depending on the 3 s window for speed: removed by the full-suite duration comparison before and after on the same host.
- A wait added to the test that hides a broken contract: not used; O1 adds no wait.

## Split

One leaf, one outcome. No prerequisite. No paid call, key or grant.

## Evidence

- better-than-training: src/seat.ts `firstTask`, `startSeat`; src/next.ts `dispatchSlot`, `dispatchLeaf`, `phaseWake`, `dispatchDependents`; tests/hc-fixture.ts; tests/stand-in.sh; tests/next.test.ts; read 2026-11-10.
- better-than-training: red log check-test-1794236439927-3239663.log and green log check-test-1794236525694-3554339.log through `akrogon log`, read 2026-11-10.
- better-than-training: A's runs on 2026-11-10 in a scratch clone (360 unmodified, 1 with the delayed stand-in).
- practitioner: not searched yet; needed for the fork round (fixed-clock waits in tests against event waits).
