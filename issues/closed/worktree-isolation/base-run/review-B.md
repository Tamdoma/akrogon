# Review B

Date: 2026-10-11. Phase: check.review. Verdict: fix.

Base: `01ca1fbe8654b11b3cec04e56d6ec498dae87196`.
Reviewed head: `8eb32c0978cd5c0037f04daeab726ba4016cd284`.

Read brief, design, plan, implementation report, affected command documentation, reference index and live implementation contracts. Debate is disabled, so no positions/rebuttal artifacts are expected. Reviewed the entire diff without reading the peer review. No code changes or commits made.

## Fixes

### F1: Exact configured checks cannot run inside the base checkout

Source: the real `akrogon config` check commands start with `akrogon run-check --name ...`; the rewritten check-issue, implement-issue and merge-issue instructions require replaying that same command and its arguments through base-run. `src/base-run.ts:161` executes it from a fresh base checkout, but `src/run-check.ts:88-94` recognizes only a leaf's recorded worktree. The base checkout is not that worktree, and no leaf/holder context is supplied.

Consequence today: a green check fails before its underlying command starts, preventing the required baseline comparison. This breaks the design's exact-command consumer contract and D6's integration with run-check. The new tests exercise raw shell commands and miss this actual check boundary. The report also lists raw test commands, rather than the configured commands required by the plan, so its green evidence does not establish this integration.

Proof: used the existing fixture helpers to create a real registered repository, caller worktree and implement-phase leaf. Configured `setup: mkdir -p node_modules`, `checks.test: printf check-marker`, and declared `AKROGON_HOME`/`AKROGON_LEAF_TEMP_ROOT` to preserve the fixture's identity inside the constructed environment, as the existing nested run-check test does. Obtained the command from the real `akrogon config` output and passed it unchanged as `base-run --base <actual HEAD sha> -- sh -c <printed checks.test>`. Result: exit 1, log contains `error: No leaf worktree matches cwd; pass --leaf or --holder`, stack at `leafTarget` then `runCheck`, and no `check-marker` output. An initial probe without those declared fixture variables failed earlier at repository resolution; the corrected probe above establishes the product defect independently of that fixture condition. Fixture and temporary proof script were removed.

### F2: Completed base-runs never remove their run root

Source: every real base-run allocates `runRoot` and writes `.owner` at `src/base-run.ts:142-146`, then makes it the setup/check TMPDIR. Unlike `runCheck`'s `finally` cleanup, base-run's `finally` at lines 164-187 removes only the Git checkout and rewrites its record. There is no removal of the allocated run root anywhere in the new module.

Consequence today: each completed invocation leaves another run directory and owner file in leaf scratch, plus any setup/command temporary files. Repeated baseline checks accumulate disk usage despite reporting successful cleanup. This is a concrete resource ownership defect against D6's fresh run-root contract shared with run-check and the brief's end-to-end checkout/run ownership. It occurs on ordinary successful invocations, without needing a crash.

Proof: invoked the real CLI using the existing registered-repository fixture and normal setup, with `sh -c 'printf "%s" "$TMPDIR"; touch "$TMPDIR/command-temp"'`. Read the printed log path to obtain TMPDIR after the CLI returned. Result: exit 0, `runRootExists: true`, `commandTempExists: true`. The trace applies to every invocation because creation is unconditional after setup preparation and no cleanup path refers to runRoot. The fixture's final cleanup removed the leaked resources and the temporary proof script was deleted.

## Verification

- `bun test tests/base-run.test.ts tests/run-check.test.ts tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000`: 30 pass, 1 timeout in the changed base-run test `a failing command keeps the same record and cleanup contract`. All run-check and documentation tests passed. The implementation report already records concurrent timeout behavior. An isolated rerun of the affected suite, `bun test tests/base-run.test.ts --timeout=30000`, completed with 9 pass, 0 fail in 6.05 seconds, including that test in 142 ms. This timeout is not evidence of a base defect, and the failing file is in this leaf's diff.
- `bun run typecheck`: exit 0.
- Both targeted live CLI probes above established defects absent from the existing assertions. No external resources or operator grants were needed.
- The report records 753 passing full-suite tests and 131 passing changed tests. No planned runner configuration or existing assertions were disabled or deleted in the diff. Existing expectations remain intact. The configured-command evidence gap is material specifically to F1.
- The new behavior's recorded red evidence is the tests-only commit `aca5d26`, before the verb existed. Criteria 1-8 have corresponding tests, with the integration and resource gaps above.

## Documentation and AREA paths

Opened README's command table, `docs/guide/setup.md`, all three changed skill paragraphs and `docs/reference-index.md`. The README describes base-run's constructed environment, logging, record and worktree removal. The skill paragraphs now call base-run rather than allocate a checkout by hand. Their exact-command instruction exposes F1. No additional wrong behavioral claim was found.

One shell listing per changed AREA file checked its literal repository paths. For `src/AREA.md`, all named source files, the reference index and test helper exist. `issues/` exists in the registered checkout and is intentionally absent from the sparse worktree. `issues/base-runs.jsonl` does not yet exist in the registered checkout: it is the output created by the first base-run, not a missing input or dead documentation link. For `tests/AREA.md`, every named test/helper/source/index path, `skills/watch-issues`, `bunfig.toml`, and the registered checkout's `issues/config.yaml` exists. No dead-pointer Fix.

## Test-Change trailers

In base..HEAD:

- `7d2cbd0`: `Test-Change: tests/command-reference.test.ts added a contracts entry for the new base-run verb; no existing expectation changed`. Accepted against brief's new CLI and plan D1. Adds the command contract without changing existing assertions.
- `8eb32c0`: `Test-Change: tests/AREA.md added tests/base-run.test.ts to Key files; no existing expectation changed`. Accepted against plan D9. The path matches `src/test-files.ts` through the tests segment, but the change is a documentation pointer, with no changed test expectation.

No lesson removals, Nits or operator actions.

## 2026-10-11 check.repair

Repair base: reviewed head `8eb32c0978cd5c0037f04daeab726ba4016cd284`. Repair head: `097f977`.
Read both initial reviews. A F1 and B F2 describe the same temporary-directory leak. All three distinct original Fixes were repaired, with separate reproduction and fix commits. No plan/design or existing test expectations changed.

### Repaired findings

- B F2 / A F1: test commit `c3375d4`, fix commit `0a26bc9`. New regression test runs successful and exit-7 commands which allocate command temporary files, then asserts that their TMPDIR no longer exists. Before fix: `Expected: false; Received: true`, 0 pass, 1 fail. After fix: 1 pass, 0 fail, 4 assertions. `runRoot` is now in scope for finally, which removes it alongside checkout cleanup.
- B F1: test commit `bdeac90`, fix commit `d9e66d2`, test boundary/typecheck correction `097f977`. New regression test obtains the real printed check command, runs it unchanged from a relative subdirectory, verifies its log lands under the caller leaf, and supplies a HEAD ahead of the tracking ref so a recalculated merge base would fail the assertion. Before fix: `Expected: 0; Received: 1`, 0 pass, 1 fail. After fix: 1 pass, 0 fail, 4 assertions. run-check now resolves an active base checkout through its existing base-run record, routes its log to the calling leaf, and preserves the supplied record base instead of recomputing it. No new environment flags or CLI arguments.
- A F2: test commit `7e064e2`, fix commit `616667f`. New merge-attempt regression test supplies `../escaped` and an absolute path and checks refusal before command execution or record/allocation. Before fix: `Expected: not 0`, 0 pass, 1 fail. After fix: 1 pass, 0 fail, 8 assertions. Validation rejects absolute paths and paths resolving outside the target before any record or checkout is created.

Each regression test was committed red before its corresponding fix. Every changed existing test-file commit has a Test-Change trailer citing the initial finding's real source. The tests-only typecheck correction parses YAML output with zod rather than assigning unknown data to a type.

### Required verification

Ran the exact strings from `akrogon config`'s `checks` map using `sh -c`, from this leaf worktree, including the run-check wrapper and both guards. No merge_checks exist and none were run.

- `checks.format` (`bun run format` under the configured wrapper): exit 0. Its only changes were known pre-existing formatting drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`; those changes were inspected and restored. Both were clean before this operation. Repair files already match the formatter.
- `checks.typecheck`: first exit 2 on the new reproduction test's YAML boundary typing (`TS2322: Type unknown is not assignable`). Corrected by `097f977`, rerun with the same configured command: exit 0.
- `checks.test` (`bun test --timeout=30000` under the configured wrapper): exit 1, 755 pass, 1 timeout. Failing test: `a base-run logs output, prints status, removes the checkout and records start, end, exit and removal`, 30000.64 ms. Log: `implementation/repair-B-test.log` (101.92 s).
- Exact `checks.test` rerun, unchanged command/args/scope: exit 1, 752 pass, 4 timeouts. Failures: the same happy-path test (30000.38 ms), `a failing command keeps the same record and cleanup contract` (30000.07 ms), `the base checkout .env carries the leaf generation of declared names and the record the generation and cwd` (30000.06 ms), and the new TMPDIR regression (30000.05 ms). Log: `implementation/repair-B-test-rerun.log` (98.51 s). Both completed runs and exit codes were kept before tailing their logs.
- Done-criteria suite rerun `bun test tests/base-run.test.ts --timeout=30000`: exit 1, 10 pass, 2 timeouts in `a checkout missing its own node_modules after setup is refused and named in the log` and the new exact configured-check regression, each 30000.05/06 ms. The three regression tests each passed when run separately after their fixes, but this full criteria run is red. Existing criteria 1-8 remain tested without filtering or disabling them.
- `checks.test_changed` (`bun test --changed="$AKROGON_BASE" --timeout=30000` under the configured wrapper): exit 0, 138 pass, 0 fail, 2790 assertions, 31.18 s. Log: `implementation/repair-B-test-changed.log`. This includes all 12 base-run tests, so every done-criterion and all three regression tests passed in the latest changed-test run. The required full-suite runs above remain red.

Timeouts were already observed on the original implementation and initial reviews, but these repair runs are not green and no base defect is claimed. Failing files are part of this leaf's diff. Neither the source of the intermittent stalls nor a clean required-check result has been established, so this pass cannot move to merge.

### Handed to A

- H1: Required full-suite checks remain red due to intermittent subprocess timeouts. Further concurrency diagnosis and correction exceed this repair pass. A must resolve the cause and rerun the exact configured commands, with all criteria, before returning for re-check. The original three Fixes are repaired, not handed back. Do not treat isolated/changed-test green results or earlier reports as replacement evidence for the red full-suite runs above.

No operator actions or live-resource cleanup remain. B holds no reusable Nit requiring a new lesson. Worktree is clean after the repair commits.

## 2026-10-11 re-check after check.fix

Prior repair head: `097f977`. Reviewed head: `239c73040eca551a78d8df599278aa1f15ae2b8e`.
Original leaf base remains `01ca1fbe8654b11b3cec04e56d6ec498dae87196`.
Verdict: fix.

Reviewed only `097f977..239c730`: shared shell output capture, run-check capture wiring, and test-side capture replacements. The earlier three behavior Fixes remain repaired. H1 is resolved: the exact configured full-suite command now completes green. This check.fix did not originate in a red merge ending, so merge replay fields do not apply.

### F3: A failed spawn leaks the newly allocated capture directory

Introduced by `b61fb31`, at `src/shell.ts:34-44`. `spawnFiles` allocates `akrogon-io-*` before `Bun.spawn`; if spawning throws, it returns no capture handle and never removes the directory. `spawnCaptured` cannot reach `finishCaptured` to clean it up.

Realistic source: the documented `akrogon run-check -- <argv>...` CLI accepts the user's check executable directly. A misspelled or unavailable tool is a normal user action. Trace: `src/akrogon.ts` run-check case forwards argv to `runCheck`, which calls `spawnLogged`, which now calls `spawnCaptured` and `spawnFiles`. A missing executable throws after the allocation. This is an input accepted by the real command boundary, not just a call to an internal helper.

Consequence today: every such failed check leaves a capture directory outside the run root that run-check removes in its finally. Failed command attempts therefore accumulate scratch directories instead of cleaning their owned resources. This is a new resource ownership defect in the timeout repair, related to the earlier run-root cleanup contract but at the newly introduced per-spawn layer. No existing test catches cleanup on this error path.

Proof: ran the actual CLI through the existing fixture helper with a real registered repository, leaf worktree, and `run-check -- akrogon-unavailable-review-command`. Isolated the proof's TMPDIR under a fresh `mktemp -d` root and compared its directory listing before and after the CLI returned. Output: `{"code":1,"spawnError":true,"leaked":["akrogon-io-fd9eOv"]}`. The error is `Executable not found`; the leaked directory was present after the caller returned and its normal run root was cleaned. The fixture and isolated proof root, including this leftover, were explicitly removed. No operator action or external resource is involved.

Repair must preserve the spawn error while removing capture storage on the spawn-failure path. Give this reachable error path one regression test shown red before the fix. Existing successful capture and exit-status behavior must remain intact.

### Verification and earlier findings

- Inspected the report's final full-suite log `/tmp/final-full.log`: 756 pass, 0 fail, 76.98 s. The report says the configured commands were used, but no newer corresponding check logs existed in the leaf; B independently ran the exact `checks.test` string obtained from `akrogon config`, unchanged through `sh -c`, from the leaf worktree. Result: exit 0, 756 pass, 0 fail, 7872 assertions, 95.47 s. Saved log: `implementation/recheck-B-test.log`, plus the run-check-generated leaf log. Exit status was retained before printing the log tail. This closes the material verification gap and H1 without relying on the raw command listing in the report.
- `bun test tests/base-run.test.ts tests/run-check.test.ts tests/shell.test.ts --timeout=30000`: exit 0, 38 pass, 0 fail, 233 assertions, 6.60 s. Includes all eight done-criteria, all three earlier regression tests, deadline behavior, error propagation, and captured output behavior.
- No existing expected values or assertions were removed or changed in the repair diff. Tests now obtain the same stdout/stderr/status values through file capture. The pause-next concurrency test retains its live barrier/release sequence through `spawnFiles` and `finishCaptured`.
- No new documentation behavior is exposed by the capture transport change. Reopened the README command table and `docs/guide/setup.md`; their command/environment claims still hold. No AREA file changed in the repair diff.

### Repair Test-Change trailers

`239c730` carries trailers for `tests/helpers.ts`, `tests/check-names.test.ts`, `tests/chart-usage.test.ts`, `tests/config.test.ts`, `tests/direct-guards.test.ts`, `tests/lessons.test.ts`, `tests/merge-attempts.test.ts`, `tests/next.test.ts`, `tests/pause-next.test.ts`, `tests/peer-wait.test.ts`, `tests/shell.test.ts`, and `tests/worktree-store.test.ts`. Each names the capture substitution. Accepted against H1's observed missing output/EOF under the real test runner, with assertions and scope retained. Its extra `tests/base-run.test.ts` trailer refers to removal of diagnostic lines during iteration; that file has no net change from the prior reviewed repair head and no expectation changed.

No new Nits, lesson removals, operator actions, code edits or commits during this re-check. F3 is the only remaining Fix.

## 2026-10-11 check.fix (slot A reply to H1)

### H1 root cause

Not a git or test-logic stall. Bun 1.4.2 pipe streams lose events under load: a spawned child exits, but `new Response(child.stdout).text()` either never receives EOF (30s hang) or resolves with buffered data dropped (`''`). Evidence: `git rev-parse HEAD`/`git worktree add`/`git commit` processes exited (`exited` resolved, `/proc/<pid>` gone) while `stdout`/`stderr` drains stayed pending for 30s; on other runs the drain returned empty for a child that wrote output, producing a ZodError inside the child's `command()` call.

### Fix

Capture through files instead of pipes (`b61fb31`): new `spawnFiles`/`finishCaptured`/`spawnCaptured` in `src/shell.ts` redirect child stdout/stderr into per-spawn files and read them after `exited`. `run()` keeps its deadline timer over `finishCaptured` (Bun's `timeout` option reports `killed` even for clean exits, so it cannot signal "deadline fired"). `spawnLogged` in `src/run-check.ts` switched to `spawnCaptured`. `withLock`'s stdout handshake is a live pipe by design and was left unchanged.

Every drain site in tests converted to `spawnCaptured` (`239c730`), including `pause-next.test.ts` via `spawnFiles` + `finishCaptured` to preserve its barrier-then-release child control.

### Verification

- `bun test tests/base-run.test.ts --timeout=30000`: 12/12 pass, run 9 consecutive times (was ~40% timeout rate).
- `bun test --timeout=30000` full suite: 756 pass, 0 fail on three consecutive runs (77s, 76s, 75s). Previously 1–4 timeouts per run.
- `bunx tsc --noEmit`: clean. `bunx prettier --check` on changed files: clean.
- One flake observed during diagnosis: `cancel()`-based drains also drop buffered bytes; file capture sidesteps both failure modes, no data-loss mode observed since.

Worktree clean. Ready for B re-check.

## 2026-10-11 check.repair: F3

Repair base: `239c73040eca551a78d8df599278aa1f15ae2b8e`.
Repair head: `e99984ec627aabbc331566134c648b3814df562e`.
Read the latest re-check finding: F3 was the only remaining Fix. Earlier findings and H1 remain resolved.

F3 repaired in two separate commits:

- `8b37b31`: committed the CLI regression test red. It runs `run-check -- <unavailable executable>` against a real registered leaf worktree with an isolated capture TMPDIR, verifies the failing status and executable identity in the error, and asserts that both capture storage and the run root are gone. Before the fix: 0 pass, 1 fail, 3 assertions; directory-list assertion expected `[]` but received `["akrogon-io-c4o8D8"]`. The Test-Change trailer cites F3's actual user input and cleanup consequence. No existing expectations changed.
- `e99984e`: `spawnFiles` removes its allocated capture directory in finally when the child was not launched. Successful launches retain the existing ownership handoff to `finishCaptured`; the original spawn error propagates without interception or replacement. After the fix, the same regression command passes: 1 pass, 0 fail, 4 assertions, 72 ms.

Regression command before and after: `bun test tests/run-check.test.ts --test-name-pattern='run-check preserves failed executable' --timeout=30000`. Filtering is confined to this red/pass proof; all required suites below ran at their configured scope.

### Required verification

Ran every exact command string in `akrogon config`'s `checks` map, from the leaf worktree, through `sh -c` with the run-check wrapper and both guards intact. Status was saved before printing each log's tail.

- `checks.format`: exit 0. Log: `implementation/repair2-B-format.log`. The only formatter changes were the known unrelated drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`; inspected and restored both. They were clean before the command. Repair files already match the formatter.
- `checks.typecheck`: exit 0. Log: `implementation/repair2-B-typecheck.log`.
- `checks.test` (`bun test --timeout=30000` inside the exact configured wrapper): exit 0, 757 pass, 0 fail, 7876 assertions, 75.70 s. Log: `implementation/repair2-B-test.log`.
- `checks.test_changed` (`bun test --changed="$AKROGON_BASE" --timeout=30000` inside the exact configured wrapper; base `01ca1fbe8654b11b3cec04e56d6ec498dae87196`): exit 0, 751 pass, 0 fail, 7796 assertions, 72.13 s. Log: `implementation/repair2-B-test-changed.log`.

All eight done-criteria and all earlier regression tests ran green in the full and changed suites. No tests, assertions or runner configuration were disabled. No merge_checks were run.

No Fixes, Handed to A items, operator actions or reusable Nits remain. Test fixtures clean their proof storage on both outcomes. No iteration-created scripts or temporary helpers remain. Worktree is clean. Ready for merge.

## 2026-10-11 merge: solo rebase

Attempt: `af2cd848-aaee-431f-baf6-9c91f7059b8f`.
Prior reviewed head: `e99984ec627aabbc331566134c648b3814df562e`.
Old base: `01ca1fbe8654b11b3cec04e56d6ec498dae87196`.
Fetched rebase target: `9ed8865d9cc959bf544875d15d49991440d93c9c` (`origin/main`).
Resolved head: `353a5e45a287a8cd89bc4a8105787542b23a8b51`.

Conflict in `src/run-check.ts` while replaying the active base-run context repair. Kept main's short `/tmp/akr-*` run roots for Chrome's Unix socket path limit, and the leaf's caller/log resolution plus supplied base SHA. No tests or expectations were changed during conflict resolution. Rebase completed with all 17 leaf commits retained. Range diff recorded before checks in `implementation/merge-range-diff.log`; only import/context adjustments to accommodate main's run-root location differ from the reviewed series.

Retired-lesson re-removal helper returned `none`; no removal commit needed. Refreshed AKROGON_BASE to the fetched target. All four checks remain required; merge_covers, merge_checks and advisory are empty.

### Merge integration correction and checks

The first configured typecheck exposed a stale `scratchRuns(f)` call in the leaf's new failed-launch regression: `TS2304: Cannot find name scratchRuns`. Main commit `021a3b4` moved run roots to short `/tmp/akr-*` paths and removed that fixture-scratch helper and its assertions. Commit `64f27d0` removes the obsolete call from this leaf's added test, with a Test-Change trailer citing that real source. The capture-directory cleanup assertion remains intact. The existing `run-check TMPDIR is a fresh short /tmp run root and is removed on success and failure` test still guards run-root cleanup. Before log: `implementation/merge-typecheck-before.log`; rerun typecheck exit 0 in `implementation/merge-typecheck.log`.

Final tested head: `64f27d0e3c4ae254a6aafd49ea393033dc677606`. Target/base: `9ed8865d9cc959bf544875d15d49991440d93c9c`. Final range diff, including the scoped test correction: `implementation/merge-range-diff-final.log`.

Ran the exact configured command strings in the worktree, through their run-check wrappers and both guards:

- format: exit 0, `implementation/merge-format-final.log`. Known unrelated formatter drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` inspected and restored. No repair/rebase file needed formatting.
- typecheck: exit 0, `implementation/merge-typecheck.log`.
- full tests: exit 0, 758 pass, 0 fail, 7872 assertions, 72.19 s, `implementation/merge-test.log`.
- changed tests against the refreshed target: exit 0, 752 pass, 0 fail, 7792 assertions, 72.19 s, `implementation/merge-test-changed.log`.

Every run's status was kept before printing its log tail. All criteria and regression tests are included. Worktree is clean. No advisory failures, operator actions or resource leftovers. Completion owner is the worktree-isolation issue; its ISSUE.md was read, and worktree-reconciler remains open in plan.synthesis, so this leaf does not finish that issue.

### Push and lifecycle recovery

`merged --check --attempt af2cd848-aaee-431f-baf6-9c91f7059b8f` returned `ok`. The subsequent `merged` call successfully pushed the tested head, then failed inside transition's frozen-citation gate: it compared against the now-updated origin/main, leaving an empty commit range for the changed frozen `tests/base-run.test.ts` blob. Its required trailers exist in the reviewed and rebased series; this is a post-push lifecycle error, not an uncited implementation or failed push. Remote read-back `git ls-remote origin refs/heads/main` confirmed `64f27d0e3c4ae254a6aafd49ea393033dc677606`. State retains the same attempt, tested_top, candidate and `recorded: true`, with phase merge.

The existing `next` batch reconciler independently fetches and verifies candidate ancestry, then completes a landed batch through `commitMove`. Using the narrowly selected `akrogon next base-run` recovery path rather than modifying state or retrying the failed gate.

Recovery returned `moved merged`; authoritative state now says `phase: merged` and the batch is cleared. Remote read-back confirms the tested `64f27d0e3c4ae254a6aafd49ea393033dc677606` is origin/main. No issue/epic completion line was printed, so no completion broadcast is due. Merge complete.
