# Opening map: merged A + B

Tags name the slots that hold a line: (A), (B), (A,B).

## Destination
A changed or added test that fails under the conditions it runs in at merge is caught on the leaf that changed it, before merge, not in a later unrelated leaf's gate. No finite number of green runs proves a test can never fail later. (A,B)

## Evidence
- E1 The only gate on changed tests is a citation trailer: src/phase.ts:505-522 (M/D/T only), frozen guard :547-580 also covers added tests; called :385-387, :636-642. Nothing in src runs a test more than once. (A,B)
- E2 The case had two admission gaps, not one. (a) The probe-waits reviewer accepted "20 green playback runs under the full core lane" as load proof for a case added after those runs ("this repair changes no playback implementation behavior ... so that load evidence remains applicable", framework issues/closed/merge-flow/probe-waits/review-B.md:143). The case then failed in the merge gate (:162-173). (b) The rewrite (349c15739) passed one replay of the rejected verify command and landed (:243-245). (B found, A confirmed)
- E3 Failure: 15000 ms CDP eval timeout in that case (parallel-selftest merge-verify-run9 log :9743-9749). Wait at 349c15739 was 100 x 100 ms sleeps inside one eval; 58df9333c bounds it at 5000 ms wall clock. Cause (hidden-tab timer throttling vs CPU) unmeasured. (A,B)
- E4 Framework config: `checks` parity, contracts, test, test_changed, selftest, cheap; `merge_checks` verify; `merge_covers` all six checks, so at merge only verify runs. Framework `test_changed` runs parity/contracts, not changed browser tests (framework issues/config.yaml:8-17). akrogon's own `test_changed` is `bun test --changed=$AKROGON_BASE`. (A,B)
- E5 Existing red handling: an unattributed red gets one retry; a green retry is recorded `inconsistent`; a leaf's own criterion cannot become known-red (skills/implement-issue/SKILL.md:38, skills/merge-issue/SKILL.md:75, docs/guide/merge.md:31). (B)
- E6 bun 1.4.2: `--rerun-each` (help says per file, web docs say per test), `--retry` reports a later pass as passing, `--randomize`, `--seed`, `--changed` (affected by imports). (A,B)
- E7 `testFile()` matches fixtures and `.snap` files, not only executable tests (src/test-files.ts:19-27). (B)

## Outside evidence (read 2026-10-11)
- Mozilla test-verify: each modified test 10x, 5x in fresh browsers, then again in chaos mode, up to 1 hour; failure means "backout should be considered (but is not mandatory)". Advisory, not a gate. firefox-source-docs.mozilla.org/testing/test-verification (A)
- Chromium CQ runs flake detection on new/modified tests, blocking by default, skippable per CL footer; rerun count not found (LOW). chromium docs/infra/cq.md (A)
- Micco, Google Testing Blog 2016-05-27: 16% of tests show some flakiness; retries and quarantine hide real races. (A,B)
- Shaker (Silva, Teixeira, d'Amorim, ICSME 2020): runs under injected CPU/memory stress found far more concurrency flakes than idle reruns. (A)
- Archibald, Chrome 88 timer throttling (2021-01-05): hidden-page chained timers are throttled, so a short sleep can take far longer. Plausible here, unmeasured. (B)
- pytest flaky-test guidance: shared state, ordering and timing assertions are main causes. (B)

## Forks
### M1 Who makes a changed test prove itself (mechanism owner)
- Agent workflow obligation in plan/implement/check: proof must cover the test's current revision and the conditions it runs in at merge; B refuses reused proof from an earlier revision. Pick (B), pick (A after E2). Cost: judgment can still be wrong.
- akrogon command gate: a phase move runs a repo-configured command on changed tests N times, refuses on any failure. Mechanical. Cost: new config contract per runner, selects fixtures (E7), idle reruns miss load flakes, minutes per leaf, the gate itself can flake. (A as fallback, B as later option)
- Per-repo `checks` entry, no akrogon change. Cost: nothing in akrogon changes; framework has no changed-test selector yet (framework-test-scope open). (A)
- Test-writing rule only (wall-clock bounded waits). Cost: a deadline checked after a sleep still overruns if one wakeup is throttled past the outer budget (B R4); catches nothing else. (A proposed, B disputed)
### M2 What proof counts
Fresh runs of the command where the test runs at merge, for the current test revision, plus a shown failure of the intended behavior (B); stress-injected reruns (A); N same-process reruns (A,B reject as sole proof); repeated full gates before every review (A,B reject, check-reruns lock). Count N: no source sets it; operator chooses or settles by cost (A,B).
### M3 Which tests trigger it
All executable changed/added tests (A); tests with real browser/process/timing behavior plus any test repaired after a red integrated run (B). Citation path rule is not the selector (E7) (A,B).
### M4 Failure ending
Repair on the owning leaf; no `--retry`, no quarantine, no retry-to-green (A,B). Agreed; no question needed unless challenged.
### M5 Narrow variant
Only after a merge bounce on a test the leaf changed: the fix proves it with more than one replay (A). Covers E2(b), misses E2(a).

## Pitfalls
- Stale proof reused after a test change (E2a): proof bound to the test revision. (A,B)
- One green replay admits a rewrite (E2b). (A,B)
- `--retry` hides the flake. (A,B)
- Command name taken as coverage (E4). (B)
- Reopening heavy-run slot, max_active, capacity or check scheduling locks. (A,B)

## Off route
Framework test fix (done, 58df9333c); host capacity (#69, merge-load-flakes); affected-test selection (framework-test-scope); citation syntax and path rule (agent-test-rules 10a/11a/12a); quarantine service. (A,B)

## Differences
- A first leaned to a mechanical gate plus a test-writing rule; B to a workflow obligation. After E2, A agrees the first gap was reviewer reasoning, which a rerun gate would not have fixed by itself.
- A wants stress-injected runs; B warns stress adds an untraced workload and can create different failures.
- B says a wall-clock rule does not remove the class (R4); A accepts.
