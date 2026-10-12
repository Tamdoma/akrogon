# Fork notes: proof-rule, slot A

Measured 2026-10-11 from framework issues/closed/merge-flow/parallel-selftest/implementation/*.log `verify-stage` lines: `framework:verify:core` 241-291 s across 9 runs; `framework:verify:fast` 90-382 s. Inside core, `test:playback-probe` took 54.37 s (merge-verify-run9-playback-flake.log). Standalone it took 30.77 s (probe-waits review-B.md:139). Core runs playback in parallel with 7 other heavy stages (framework package.json:165). Observed failure rate of the case under the real gate: 1 in about 10 replays (seed #86 point 3; LOW, small sample).

## Q1 which tests
- Pick: tests whose pass depends on time, a browser, other processes or shared resources, plus any test the leaf repairs after it failed in an integrated run. The planner names them in plan.md; B checks the classification against the diff. Cost: a misclassified test gets no proof.
- Rejected: every added or changed test. Pure logic tests have no load dependence, so running them under load proves nothing extra and adds planner work. Rejected: only repaired-after-merge tests. Covers gap (b), misses gap (a), where the new case was never load-proven.
- Evidence: better-than-training, seed #86 and review-B.md:143 (gap a), :243-245 (gap b), read 2026-10-11. Luo et al. FSE 2014: async wait and concurrency are the leading flaky-test causes.
- Pitfalls: misclassification, removed by B checking the planner's list against the diff; fixtures and snapshots selected by `testFile()`, removed by selecting on what the test does, not its path.
- Extra question: none.

## Q2 what runs count
- Pick: the changed test rerun several times while its neighbours from the merge gate run beside it once. For framework playback: the playback stage with `--rerun-each N` inside a `bun run --parallel` of its verify:core siblings. Cost about one core lane (4-5 min) when N x test time fits inside it; about 9 min for N=10 at 54 s per run.
- Rejected: injected CPU stress. stress-ng is not installed on this host (`command -v stress-ng` empty, 2026-10-11) and B warned it adds a workload the gate never has. Rejected: the file rerun alone. It passed twice standalone (seed #86) and Shaker (ICSME 2020) found idle reruns miss most concurrency flakes. Rejected: repeated full merge gates, about 10-13 min each and blocked by the check-reruns lock.
- Evidence: measured stage times above; Mozilla test-verify reruns modified tests 10x plus 5x in fresh browsers plus chaos mode (firefox-source-docs test-verification, read 2026-10-11).
- Pitfalls: a composed command is new proof machinery under plan-issue's rule (skills/plan-issue/SKILL.md:62). Removed because `bun run --parallel` and `--rerun-each` exist at base; the plan only composes them. `--rerun-each` semantics differ between help (per file) and web docs (per test): the plan states which applies and the report shows the run count.
- Extra question: none.

## Q3 how many runs
- Pick: a fixed floor of 10 runs under load, higher when the planner states why. At a 1-in-10 failure rate, 10 runs catch it about 65% of the time, 5 runs 41%, 20 runs 88%. A floor stops the one-green-run judgment that admitted gap (b).
- Rejected: planner sets the count. The case shows a seat judging one run sufficient. Rejected: 5 as floor, too weak for the observed rate.
- Evidence: detection math 1-(1-p)^n; observed rate LOW confidence.
- Pitfalls: a floor read as a guarantee. Removed by the report stating the count and that it bounds risk only.

## Q4 failure ending
- Pick: yes. The leaf repairs its own changed test with failure logs kept; `--retry`, quarantine or a later green run never count as passing; the single retry for unattributed red stays.
- Rejected: retry to green, quarantine. Both hide the failure on the leaf that caused it (Micco, Google Testing Blog 2016-05-27).
- Pitfalls: confusing an unrelated red with the leaf's own test. Removed by the existing attribution rule (skills/implement-issue/SKILL.md:38).
