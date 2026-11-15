# report-130 merged notes (A, B, C)

## Q1 options
- Delivered by 97034315, close (A,B). Reason: leaked hc-shutdown units made CLI passes slow (lesson 2026-11-08); 97034315 stops the suite creating units; timings flat under CPU saturation (15.4 s at load 19-30), full check passes the test, unit count unchanged (A,B). Cost: no cover for other host-global state.
- A cause remains (C). Reason: every fixture registers its repo as `repo` (tests/helpers.ts `fixture`), `leafSlice` hashes `repo.name/slug` (src/scope.ts), and teardown runs `systemctl --user stop leafSlice({name:'repo'}, slug)` in the real user manager (tests/hc-delivery.test.ts `teardown`), so concurrent runs of the same file (two verifies of different leaves) share slices and one run's teardown kills the other's seat (C).
- Observation, A, 2026-11-09 (slots/evidence/conc-*.log): two runs of 'a working seat', second started 3 s later: both pass twice (teardowns coincide). Started 7 s and 10 s later: the second fails both times at hc-delivery.test.ts:145 (`cli` exit 3, expected 0) in 11.4 s and 8.8 s. C's map fail (10.6 s, line 145) overlapped B's same-slug run (C). So the collision is real and deterministic when a teardown lands mid-run. A changes its Q1 pick to C's.
- The 30 s timeout channel itself is delivered by 97034315 (A,B,C).

## Q2 options
- Make each fixture's host-global footprint unique: the fixture's registered repo name derived per fixture, and every teardown reads it instead of `{name:'repo'}`; keeps every assertion and the real core (C; A adopts). Covers every slug in the file and the 8 test files calling `leafSlice({ name: 'repo' }, ...)` (hc-window-calls, hc-teardown, hc-identity, leaf-slices, green-merge, hc-start, hc-delivery, store-sweep-safety) with one boundary (A).
- Split scenarios (B O1 rejected by B and C): same waits, moves the failure.
- Controlled `not_started` reply (B O2 rejected by B and C): circular.
- Timeout raise / product wait change: foreclosed by signpost 2a (A,B,C).
- `hd-silent` in scope only through the shared boundary, no own change (B,C).

## Evidence
- better-than-training: src/scope.ts `leafSlice`; tests/helpers.ts `fixture` (`repos: { repo: root }`); tests/hc-delivery.test.ts `teardown`; 97034315; lesson 2026-11-08-hc-shutdown-unit-leak (A,B,C).
- measured: m130-*.log, full-test-2026-11-09.log, conc-*.log (A).

## Pitfalls and what removes each
- Hardcoded new name reintroduces the collision: derive from the fixture, tests read it back (C).
- Per-suite or per-slug uniqueness fails across two verifies of different leaves: per-fixture uniqueness (C).
- Leaf "improves" the ~15 s fixed wait: out of scope, hc client behavior (C; signpost 2a).
- Calling the full check green: 2 hc-listener failures recorded separately (B).
- Other host-global state (runSlice/run units, sockets): check whether the same name feeds them; Open for the plan (A).

## Points where slots differ
- B: close, nothing remains. C, A: a host-global collision remains, one test leaf.

## A's proposed final shape (to check)
- #130 is not closed now. One leaf in akrogon, tests only: every test fixture registers a repo name unique to that fixture, and every test teardown and slice lookup reads that name, so concurrent runs of the suite on one host never stop each other's slices. Done-criteria: (1) two concurrent runs of tests/hc-delivery.test.ts, the second started while the first is mid-run, both pass (red before: the line-145 failure above; green after); (2) the configured `test` check passes the leaf's own changed tests. No seconds named. No product file changes. `sources: [Tamdoma/akrogon#130]`, closed by the leaf's completion.
