# Opening map: slot A

## Destination
A leaf that adds or changes a test cannot reach merge while that test fails under load, so the failure lands on the leaf that changed it, not on a later unrelated leaf's merge gate.

## Facts (inspected)
- The only gate on changed tests is a citation: `requireTestChangeCitations` src/phase.ts:505-522 checks M/D/T test paths for a `Test-Change:` trailer; added files (A) are not checked there. Called on every phase move src/phase.ts:385 and in the merge batch check :636, :642. It never runs a test.
- `checks` run before review and after repair; `merge_checks` run once per merge attempt (check-reruns lock). akrogon's own `checks.test_changed` is `bun test --changed="$AKROGON_BASE"` (akrogon config).
- bun 1.4.2 has `--rerun-each=<N>`, `--retry`, `--concurrent`, `--changed` (`bun test --help`, 2026-10-11). `--changed` selects files affected by changed files through imports, not only changed test files.
- The concrete case: an iteration-count poll (`for i<100` x 100 ms) inside one CDP eval with a 15 s budget; operator fix 58df9333c bounds it by wall clock (framework playback-probe.test.ts:123-129). It ran green twice standalone and failed inside the full selftest gate.
- probe-waits already saw the case red inside the full gate (fix commit 349c15739), then one green gate run admitted the rewrite after 4 fix rounds.

## Material forks
1. Where the proof runs.
   - a. akrogon built-in: a phase move (before check.review, or in the merge batch check) runs each added/changed test file N times through a repo-configured command template and refuses on any failure. Every repo, every path. Cost: new config key, file substitution per runner, minutes per leaf; invites a gate that is itself load-flaky.
   - b. Per-repo `checks` entry, no akrogon code: e.g. framework adds a check that reruns changed test files. Zero new machinery, already runs before review and after repair. Cost: each repo must opt in, and the seed asks why akrogon did not stop it.
   - c. Skill rule only: check-issue B reruns changed tests under load when reviewing. Cheapest; prose drift, not mechanical.
   - d. Test-writing rule only (prevent the class): waits inside a bounded outer budget are wall-clock bounded, never iteration counts. Removes this exact class at the source, catches nothing else.
   My pick: b plus d is the smallest that removes this class; a only if the operator wants a mechanical guard across all repos.
2. What "under load" means.
   - a. Plain reruns on an idle host (`--rerun-each N`). Cheap. Evidence: the case passed standalone twice; Shaker (ICSME 2020) found stress-injected runs catch far more concurrency flakes than idle reruns.
   - b. Reruns with injected CPU stress, or N copies at once. Closer to the gate. Costs a stress tool or parallel browsers.
   - c. Repeat the full merge gate M times. Real conditions; about an hour for 10 replays in this case. Too costly as a default.
   My pick: b if a gate is built; a alone would have missed this case.
3. Which tests. Added and modified test files (A/M/T), not only M/D/T like the citation gate. Deleted files have nothing to run.
4. Failure handling. Any failure in N refuses the move (no retry-to-green; `--retry` would hide the flake). The leaf's own seat repairs.
5. Only after a merge bounce, or always? Narrow variant: when a leaf bounces at merge on a test and its fix touches that test, the repair must prove it under the failing conditions. Fits this case exactly, misses first-time flaky tests.

## Practitioner questions
- How many runs give what detection chance? At a 10% load failure rate, 5 runs catch it 41% of the time, 20 runs 88%.
- Mozilla test-verify runs each modified test 10x, 5x in fresh browsers, then again in chaos mode, up to 1 hour, and treats failure as "backout should be considered (but is not mandatory)" (firefox-source-docs test-verification, read 2026-10-11). Advisory, not a gate.
- Chromium CQ runs flake detection on new/modified tests and blocks by default, skippable by CL footer (chromium docs/infra/cq.md, LOW: rerun count not found).
- Google (Micco 2016): 16% of tests show some flakiness; mitigation is rerun-on-fail plus quarantine, which hides flakes rather than catching them at the author.
- Bazel `--runs_per_test` is plain iteration, no stress.
- What is the cost ceiling per leaf for browser tests rerun N times?

## Pitfalls
- A rerun gate on an idle host passes this exact case: removed by stress injection (2b) or by the wall-clock rule (1d).
- `--retry` turns a flake green: never use retry in the proof.
- The new gate itself flakes on shared seat load (max_active 20): bound its runs and record PSI like merge attempts already do.
- Heavy-run slot and lower max_active were rejected (test-runs, merge-load-flakes): do not reopen through this chart.
- Runner variance across repos: a built-in gate needs a runner-agnostic command template, or it stays per-repo.

## Off route
- Fixing the named framework test: done on framework main (58df9333c).
- Host capacity (#69): merge-load-flakes owns it.
- Affected-test selection: framework-test-scope.
- Quarantine/retry-on-fail lists: hide flakes, opposite of the goal.
