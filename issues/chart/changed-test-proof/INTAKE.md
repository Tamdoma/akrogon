# Intake: changed-test-proof

## Scope
Destination akrogon. One chart, one completion owner: what akrogon requires before a leaf that adds or changes a test can merge, so a test that fails under merge-gate conditions is caught on that leaf, not in a later unrelated leaf's gate.

## Provenance
- GitHub: Tamdoma/akrogon#86
- Operator: 2026-10-11 chart open, "Check the latest issue and let's chart it out if necessary. Use slot b consultant (already here)."

## Source: Tamdoma/akrogon#86
# A changed test that fails under load merges after one green run: probe-waits rewrote a playback-probe case, passed the Test-Change citation gate, and the case later timed out in parallel-selftest's gate

Source: Tamdoma/akrogon#86
URL: https://github.com/Tamdoma/akrogon/issues/86

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-11.

1. Leaf `probe-waits` added the case `pause persistence observes the page re-entry callback inside the window` to `.claude/hooks/tests/playback-probe.test.ts` (commit `fb2024e0f`).
2. The merge turn bounced `probe-waits` (`merge -> check.fix` at 2026-10-11T12:11:31Z). The fix commit `349c15739` says: "the case ran green standalone but red inside framework:verify's selftest". Its rewrite polls in-page inside a single `Runtime.evaluate`: `for (let i = 0; i < 100; i++)` with a 100 ms sleep, for up to 6 rounds. The commit carried a `Test-Change:` trailer. The leaf merged at 13:58:16Z after 4 fix rounds. The file later moved to `.claude/skills/test-audit-design-impeccable/kit/scripts/lib/playback-probe.test.ts` (`21f690925`).
3. About 19:04Z, leaf `parallel-selftest` ran the full merge gate on a merged copy of main (replay 9). It failed in that same case:
   ```
   error: blepsis eval failed: Error: Timeout: Runtime.evaluate
   {"name":"BrowserCoreError","code":"cdp_timeout","retryable":true,"message":"Timeout: Runtime.evaluate","context":{"method":"Runtime.evaluate","timeoutMs":15000}}
     at evalOnPage (page-measure.mjs:447)
     at playback-probe.test.ts:134
   ```
   `parallel-selftest` touches no playback file. Two standalone runs of `test:playback-probe` passed, and replay 10 passed. The seat ran 10 full-gate replays across fix rounds 2-3.
4. The operator patched this one case on framework main (`58df9333c`, in-page poll bounded by wall clock). Nothing in akrogon would stop the next load-sensitive test change in the same way.

## Location
akrogon phase gates on changed tests: `src/phase.ts:505` `requireTestChangeCitations` and `src/phase.ts:547` `requireFrozenCitations`, called at `src/phase.ts:385`, `:387`, `:636` and `:642`. Merge checks config: `src/config.ts:50-51` (`merge_checks`, `merge_covers`).

## Reproduction
1. A leaf changes a test whose wait logic depends on timer speed.
2. The leaf adds a `Test-Change:` trailer and passes one merge gate run.
3. The test then fails in a later leaf's gate under heavier load.

Frequency: one confirmed case so far (above), plus the original `probe-waits` merge bounce from the same case.

## Expected behavior
A changed test that only passes on a quiet host is caught on the leaf that changed it, before merge. It should not bounce a later, unrelated leaf.

## Urgency
Medium.

Cost of this one case:
- About 1 hour of replays in `parallel-selftest`, plus at least one fix round.
- Operator time to trace the flake.
- One earlier merge bounce on `probe-waits`.

Workaround: the operator finds and patches the test on main by hand.

## Suspected cause
The only akrogon gate on changed test files is a citation. `requireTestChangeCitations` checks that each modified, deleted or type-changed test path has a `Test-Change: <path> <reason>` trailer. It does not run the changed test, and it does not run it more than once.

The merge gate (`merge_checks`) runs once per attempt. So a rewrite that passes one gate run is admitted, even when its pass depends on host load. Nothing in `src/` repeats a changed test or measures its stability; a search for repeat/flake logic found none.

Contributing condition: heavy concurrent seat load on one host (#69) widens timing variance. That turns a marginal wait budget into a failure.

The mechanism in this case is inferred, not measured. The loop counts 100 x 100 ms, which is about 10 s, under the 15 s CDP limit. The test's own comment says the headless tab re-hides between ops. A hidden tab's throttled timers would stretch that loop past 15 s, and the eval then throws instead of returning `hit: false` for the next round.

Whose view: both. The reporter asked why the test merged; the agent traced the commits and the gate code.

Files read:
- akrogon `src/phase.ts:442-600` and `src/config.ts:50-103`.
- Framework `playback-probe.test.ts` at `58df9333c^`.
- Framework commits `fb2024e0f`, `349c15739`, `21f690925`, `58df9333c`.
- Framework `issues/log.jsonl` (probe-waits and parallel-selftest records).
- Replay 9 log on the seat host.

Not inspected:
- The `probe-waits` B review text.
- Chrome timer throttling in the failing run (not measured).

Would disprove: the case still failing at the same rate under load after `58df9333c`. That would point to host load (#69) rather than the test's wait logic.

Related reports:
- Tamdoma/akrogon#69 (closed): host load causes load flakes at merge. That is the capacity side; this report is the gate on changed tests.
- Tamdoma/akrogon#71 (closed): merge_checks deferred to the merge turn.
- Tamdoma/akrogon#53 (closed): merge_checks timeouts under seat load.

Searched Tamdoma/akrogon, all states:
- `--author @me` created since 2026-10-09 (limit 30)
- "flaky test merge" (limit 10)
- "Test-Change" (limit 10)

## Source: operator 2026-10-11
Check the latest issue and let's chart it out if necessary. Use slot b consultant (already here).

## Agent findings
See CHART.md Findings and slots/map-merged.md with slots/map-rebuttal-B.md.
