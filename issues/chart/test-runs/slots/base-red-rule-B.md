# Base-red rule: independent slot B round

2026-10-02. No tests or probes run. Only this return file was written. Read the current Question/Carries, timeout-cause Taken and heavy-run-slot Taken. No other slot returns were read for this round.

## Recommendations

- **D1 / Q1:** A base-red stop needs a completed test/check result on both revisions, comparable execution, and evidence that the base defect explains the relevant leaf failure. Different test names can share a cause. Neither a nonzero shell status nor the word timeout establishes this by itself.
- **D2 / Q2:** Wait while the command is alive using its exit/completion handle. Once the runner has been killed, crashed or interrupted, record an incomplete execution and stop with an explicit `incomplete base run` reason. Do not automatically repeat it or hand it to leaf-code repair. A later rerun needs an identified execution correction or new evidence, not a search for a green result.
- **D3 / Scope:** Change only the two existing base-run paragraphs in implement-issue and check-issue. Keep merge's current red-to-check.fix route, existing artifact locations, one-base-run policy and failed-check blocking. No heavy slot, runner service, clock, watchdog, new state or scope selector.

## Repository evidence

**F1. The current rule records comparisons but does not use them to decide.** `skills/implement-issue/SKILL.md:38` and `skills/check-issue/SKILL.md:59` require the same command, arguments and whole-folder/single-file scope on detached `AKROGON_BASE`, the leaf's installation method, exit result and both runs' failing names/tails. Any red base then stops with `failed ... red on base`; green takes repair. Commit `6c296391e8a25237e08111577eeee8594782fbb2` (2026-10-01) introduced these prose branches. There is no explicit incomplete outcome, causal comparison after the base result, or distinction between the checked command and its enclosing shell.

**F2. Wait-on-exit cannot resurrect a killed run.** `skills/implement-issue/SKILL.md:40-43` says to wait for a slow command's exit/status, wait again when the wait returns early, and never infer completion from a quiet log. An early tool yield is not an interrupted command. A confirmed process termination is. Q2 must distinguish those cases, and explicitly apply exit waiting to base checks even when their planned duration is not hours/unknown.

**F3. The original base run was killed by its launcher, not merely a short wait.** Read the seat transcript at `/home/ivan/.claude/projects/-home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-fleet-backup/adc47027-2a34-45c1-a4b9-b536d5dbfa4b.jsonl`:

- Line 2335, 12:53:00.459 UTC: the Bash launch for the detached-base test folder sets `timeout: 1500000` and `run_in_background: true` (25 minutes). It runs `bun install --frozen-lockfile` before the check.
- Line 2395, 13:18:00.597 UTC: task `bqq0y97xp` reports status `killed` and says the command was stopped at its background time limit. The notification permits restart only with a longer timeout and forbids restart if already at the longest allowed timeout. It does not establish that this launch was at that maximum.
- Line 2397: the seat collects partial failures and removes the base worktree. Line 2402: it nevertheless records `red on base` and transitions failed.

This identifies the termination mechanism directly. The 25-minute cutoff covered the background shell, including dependency installation, not necessarily exactly 25 minutes of tests. Increasing a harness cutoff is also different from adding a test timeout, but this chart does not need to authorize either.

**F4. The same launcher obscured the leaf command's actual status.** Transcript line 2308 launches the leaf check followed by `echo` and a `grep ... | head` pipeline. Line 2322 announces background command exit 0 even though tests failed. The status belongs to the surrounding shell's last command, not the test command. The implementation report explicitly records that mismatch at `framework/issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md:183`. The minimum text correction must say to preserve the checked command's own status before reporting or filtering output. Adding a structured test-results parser is unnecessary.

**F5. Original and later evidence have different validity.** In the framework report above, `:183-186` records the first base run killed without final counts. Its `implementation/evidence/f9/cf-workers-deploy-base-ab700d4cc.log:144` ends with a partial 219026 ms failure, after several complete individual 300-second failures. Partial failures are useful diagnostic evidence but not a completed comparable base check. Later whole-file executions completed on leaf and base (`report.md:198-208`): 238 pass / 1 fail, different fixtures 07 and 13, 478/476 seconds. Their final results are at `cf-workers-deploy-leaf-1b95a0cfc-file-rerun2.log:306-310` and `cf-workers-deploy-base-ab700d4cc-file-rerun2.log:308-312` in the same evidence folder.

**F6. The accepted causal result matters more than exact failure names.** `issues/chart/test-runs/forks/timeout-cause.md:25-27` accepts the capture request-lifecycle race, fixed by framework `2cb00d537`, and rules out the heavy slot. The accepted cause explains varied fixture timeouts on identical base/leaf capture code. A test runner can report a timed-out individual case, finish its declared suite and exit normally with failure. That is a completed failed check, unlike a crashed runner or externally killed suite. An assertion-only rule would incorrectly discard this real base defect.

**F7. Merge routing and existing blocking rules already cover the rest.** `skills/merge-issue/SKILL.md:37,43` runs checks/merge_checks after rebase and sends red checks to check.fix with evidence. `skills/implement-issue/SKILL.md:36` blocks unrepairable failing criteria. `skills/check-issue/SKILL.md:53` says failed checks and named scenarios block. The chart should improve attribution and execution status without making upstream failures advisory or giving base-red a green merge path.

## Outside practice and its limits

Read on 2026-10-02. Named practitioner teams here operate the actual comparison systems, rather than offering generic advice.

**S1. Chromium infrastructure team, actual CQ practice.** Their [CQ documentation](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/infra/cq.md), source lines 250-262, describes repeated shard execution with the same configuration, then rebuilding/running failing suites without the change. It warns that running an individual failing test can change behavior. Patch attribution depends on contrasting with-change and without-change results. That supports comparable scope. Their retry-and-ignore-flakes policy differs from our locks and is not proposed here. Their matching-test policy also does not settle our common-cause judgment for different capture fixtures.

**S2. GitLab CI/CD team, merge-request base/head comparison.** [Unit test reports](https://docs.gitlab.com/ci/testing/unit_test_reports/), documentation lines 122-123 and 181-191, compares target/source results, separates new and existing failures, and leaves head failures visible when base data is absent. Reports do not set the job status. This supports preserving both command status and failure evidence rather than treating missing comparison as existing failure. The page excludes blocked pipelines from a historical failure count. It does not promise that all uploaded reports came from complete jobs, so it is not proof of our exact completion requirement.

**S3. LUCI team, explicit execution versus test outcomes.** [Buildbucket status definitions](https://chromium.googlesource.com/infra/luci/luci-go/+/refs/heads/main/buildbucket/proto/common.proto), inspected source lines 41-53 and 139-158, distinguish test/input failure, input-independent infrastructure failure and cancellation. Timeout detail can accompany any final status, so timeout is not automatically infrastructure failure. This supports retaining an incomplete-execution reason separately from causal base-red. It does not require importing LUCI states, retries or timers into akrogon.

Synthesis: Chromium and GitLab compare actual failures under identified revisions/configurations. LUCI keeps execution failure separate from input failure. These systems agree that a generic red status or missing baseline is insufficient attribution. Their retry/flake tolerance does not transfer because our checks always block and this chart forbids retry-until-green. Local evidence supplies the stronger reason for completed comparable checks and permits different test names when inspected code and failure mechanisms explain why.

The Chromium HTML opens failed in the browser tool. Its primary source and LUCI proto were read directly through Gitiles `?format=TEXT` in memory, with no saved files. Search results and source reads agree. No external source is being used to claim that every timeout is a runner fault.

## Decision details and pitfalls

**R1. Completion is functional, not a demanded output string.** Require the command's own declared terminal result and own exit status. A supported fail-fast runner that exits with a final failure result is complete for its declared mode even if it did not run every test. Do not require exact `Ran N tests` text or mandatory counts across arbitrary checks. A signal termination, killed-task notification or crashed runner without a final check result is incomplete even though the OS supplies a terminal status.

**R2. Comparability includes causes that change execution.** Record base/head, corresponding cwd, command/arguments/scope, installation method and success, runtime/browser versions and material environment/resource conditions. Use each revision's declared lockfile. Do not force the leaf lockfile onto base and stop testing the real base. A changed dependency, fixture or configuration that could explain the result defeats the “no plausible cause in leaf diff” premise and belongs in repair. Comparable does not mean identical PIDs, ports or instantaneous load values.

**R3. One common base failure cannot excuse an additional leaf regression.** Inspect the actual failures being attributed. An unrelated base failure or equal cleanup error does not explain a leaf assertion elsewhere. A shared capture race can explain different fixture names, but a leaf-only failure still follows repair. Neither green base nor unmatched red base proves which code to edit. The seat must investigate inside the authorized surfaces rather than automatically patching upstream code.

**R4. Incomplete execution is not an upstream-defect verdict.** Preserve partial logs, signal/task status, launcher settings and known termination cause. `failed ... incomplete base run` states missing required evidence, not that base is defective or the leaf is innocent. It remains resumable through the existing lifecycle. Do not add a new state or silently mark checks passed.

**R5. Automatic repetition would be a new policy.** The current rule allows one base run. The first incident's launcher cutoff is known, but whether the harness supported a sufficient execution mode is not established by the transcript. Repeating with the same limit invites the same incomplete result. Waiting after confirmed death cannot help. An operator could instead choose one replacement after a specific corrected launcher fault, but that needs an explicit exception to “once” and a stop when the correction cannot be made. That is more text and policy than D2.

## Smallest skill-text change

Proposed edits only, not applied. Keep both base worktree allocation and scope/installation instructions. In each existing base-run paragraph (`implement-issue:38`, `check-issue:59`), add before cleanup/outcome selection:

> Wait on the checked command's own exit and terminal check result, waiting again if a wait yields while it is still running. Preserve its exit status before any reporting command or pipeline. Record base and leaf revisions, both execution results and log paths, and material dependency, runtime and environment differences. A killed, interrupted or crashed runner without a terminal check result is an incomplete run, even if it returned a nonzero process status.

Replace the current “Red on base ends ... while green on base takes ...” decision sentences with the following, using the existing reviewing slot or A and its existing report destination:

> Red on base applies only when both checks completed under comparable command, arguments, scope, dependency installation and material execution conditions, and inspected failures support a shared cause absent from the leaf diff. Test names need not match. Record that causal judgment with both runs' evidence. Only then use the existing `failed --reason "<command> red on base <sha>"` stop. A completed base result that does not establish this comparison takes the existing investigation and repair path for the leaf failure. If either execution is incomplete, retain its termination evidence and use `akrogon phase <slug> failed --reason "<command> incomplete <base|leaf> run <sha>: <termination cause>; see <existing report>" --slot <existing slot>`. Do not repeat an incomplete base run automatically or infer a base defect from it. Preserve logs and wait for owned processes to exit before removing the detached worktree. Failed checks and criteria still block.

This keeps the single base execution and existing states. The same policy must appear in both caller paragraphs because both currently implement the rule. No new cross-skill dependency or duplicated helper is needed for two short policy edits. No merge-issue change is needed. Do not touch its “broken default branch fixed forward” sentence as adjacent policy work.

## Full operator round

This round separates a real base defect from a failed attempt to measure base. The incident runner was killed by its 25-minute background limit, so the first result could not justify a completed base-red stop.

### 1 · What must a base run show before red on base stops the leaf?

Today the rule stops on any red base status. The fleet case shows why both completion and causal comparison matter: later completed runs failed on different fixtures because of one shared capture defect.

Research: operator transcript/report and inspected repository code, read 2026-10-02 · transcript lines 2335/2395, report:183-208, implement-issue:38, check-issue:59, Chromium CQ:250-262 and LUCI common.proto:41-53 · separate missing execution evidence from test failure and compare mechanisms, not just names.

- **1a (recommended)** Require completed comparable checks and a supported shared cause outside the leaf diff. Capture the checked command's own result. Permit different names, and retain repair for failures the comparison does not explain.
- **1b** Require only matching failed test names and nonzero statuses. Simpler, but mistakes runner termination for a check result and misses shared races across fixtures.
- **1c** Keep any-red-base stopping. Smallest wording cost, but repeats the invalid incident verdict.

Pitfalls: per-test timeout can be a real completed failure. Missing final counts are not universally invalid if the check has another declared terminal result. A red base failure elsewhere does not clear a leaf regression.

### 2 · What should the seat do if the base check is killed or interrupted before producing its result?

A wait that yields early needs another wait. A killed runner has no running check to wait for, and its partial failures cannot complete the comparison.

Research: operator transcript, read 2026-10-02 · lines 2335 and 2395 prove an actual launcher kill after `timeout:1500000`; implement-issue:43 supplies exit waiting; LUCI common.proto:41-53 separates execution outcomes · an automatic restart is a policy exception, not existing wait behavior.

- **2a (recommended)** Stop with `failed ... incomplete base run`, preserving logs and the termination cause. Leave the required check unresolved. Resume/rerun only after a specific execution correction or new evidence, without automatic repetition.
- **2b** Allow one replacement execution after fixing a proven launcher interruption, then stop incomplete if that attempt cannot finish. Useful when the harness fault is removable, but adds a restart exception and must not increase the test timeout or retry completed red checks.
- **2c** Send incomplete execution to leaf-code repair. Avoids an immediate stop but assigns missing execution evidence to code without an established defect and can loop.

Pitfalls: no new clocks or polling loops. Existing no-retry-until-green applies. Restarting with the same cutoff is not correction, and silently narrowing to the isolated green fixture breaks comparability. The preferred stop describes unresolved execution, not base guilt.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check: stopping incomplete adds an operator interruption when an agent might be able to fix its launcher. That is the main cost of 2a, and 2b is the explicit alternative if automatic recovery is wanted. Outside systems often retry and tolerate known flakiness, which conflicts with our blocking/no-blind-retry policy. Their behavior cannot be copied wholesale. No test execution is required to settle this text policy, and no load slot is reopened.
