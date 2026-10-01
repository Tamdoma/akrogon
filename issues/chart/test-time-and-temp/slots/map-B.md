# Blind opening map B

Read 2026-10-01. Repository paths below are relative to `/home/ivan/Work/infra/akrogon`. Framework paths are relative to `/home/ivan/Work/infra/tamdoma/framework`. No other peer map was read. This is a map, not authorization to reopen locks or implement seed proposals.

The strongest evidence points to broad inherited criteria and shared test resources. A check recorder can improve evidence ownership, but recording the same expensive, unstable checks does not remove their cost. Temp ownership should follow the existing leaf/worktree lifecycle rather than introduce another configurable cache system.

## Root causes

1. **F1: Old contracts still demand unrelated whole runs.** Framework `issues/open/emdash-cms/emdash-build/emdash-content-fixes/plan.md:89,111` requires `framework:verify` and whole-directory compatibility. Current `skills/chart-issues/assets/shapes.md:170` would refuse an unrelated repo-health criterion, but that audit happens at handoff. `skills/plan-issue/SKILL.md:55-59` preserves locked scope. Updating the skill did not revise already-open contracts. This explains the repeated run without proving that prose cannot work.
2. **F2: Test runs compete for undeclared mutable resources.** The same leaf's `implementation/report.md:60-63` records a base run with 163 pass/1 fail in 514 seconds, a separate head run with 38 failures, isolated/pair runs passing, and a browser profile locked by another session. The detailed report does not prove all 38 failures were base-red. Base/head comparison under changing contention cannot reliably identify introduced defects. Fix isolation in the consumer test/browser owner.
3. **F3: Consumer checks repeat work while omitting broader protection.** Framework `issues/config.yaml:8-12` runs parity and contracts separately, again in `test`, again in `test_changed`, plus selftest. Workers run changed tests, A runs them after cherry-picks, then A runs every check (`skills/implement-issue/worker-protocol.md:11,25`; `skills/implement-issue/SKILL.md:48`). Thus overlapping consumer commands amplify the schedule. The live config has neither the whole EmDash suite nor `framework:verify` as a protected gate. Deciding meaningful affected-area coverage belongs in framework, not a universal akrogon cache.
4. **F4: Red ownership is governed by a deliberate lock, not a missing exception.** `skills/implement-issue/SKILL.md:34` stops an unfulfillable red criterion. `skills/check-issue/SKILL.md:49` blocks failed checks. `skills/merge-issue/SKILL.md:39-41` sends reds to repair and fixes broken default branches forward. Seed #50's “only new failures block” changes this policy. It cannot be installed as a diagnostic detail.
5. **F5: Evidence is agent-written and phase transitions do not establish a check result.** `src/config.ts:34-35` supplies command strings. `src/akrogon.ts:32-91` has no check command. `src/phase.ts:215-218` checks worktree conditions, not test receipts. `skills/merge-issue/SKILL.md:33,43` owns checking and pushing. A runner could establish provenance, but a phase refusal after an agent already pushed cannot enforce a pre-push gate. Enforcement needs a concrete push boundary, which the seed does not specify.
6. **F6: Temp creation has no matching owner or lifecycle.** `src/next.ts:302-309` sets base/editor env but no temp root. `src/next.ts:559-565` removes completed worktrees, not temp copies. Workers have worktree removal ownership but no temp rule (`skills/implement-issue/worker-protocol.md:11`). Seed #49:15-24 shows large dependency copies surviving under arbitrary names. Moving them to disk relieves tmpfs pressure but still leaks storage unless teardown owns them.

## Material forks

### Q1. Does the new evidence justify reopening the check-runner decision?

- **1a recommended:** Keep scheduling-only Q1 and first correct old contracts, duplicated consumer commands and resource isolation. These explain observed cost directly. Keep command/head/base/duration/log evidence in the existing report.
- **1b:** Reopen Q1 for a tool-written execution record and explicit merge-consumption contract. Treat enforcement as its purpose. Decide the actual push gate before promising enforcement.
- **1c:** Add exact-SHA reuse, automatic base comparison and new-failure-only gating together as #50 proposes. Reject: these are different policy/mechanism changes, and SHA alone does not identify external inputs.

Research: operator · `issues/chart/check-reruns/forks/check-scheduling.md`, Taken 2026-10-01 · runner was deliberately Off route because prior runs were red or changed-head and inputs were undeclared · absence of code is not an undelivered accepted requirement. Better-than-training · F1/F2/F5 · new evidence strengthens contract/isolation repair more than cache savings.

Pitfall: “once per commit” conflicts with dirty development runs, rebase, changed commands, dependency/runtime changes and transient browser state. Passing-record reuse requires more than a commit identity. If 1b is chosen, determine where records/logs survive temp cleanup and how an interrupted execution is represented.

### Q2. Should base-red evidence change blocking policy?

- **2a recommended:** Preserve current red gates. Use one bounded, comparable base investigation only when it answers a specific attribution question, then stop and name the owning repair or operator contract decision. Do not rerun an entire suite automatically on every failure.
- **2b:** Explicitly reopen the red-criterion/review/merge locks to permit known base reds. Requires comparable structured failures and an owner for main repair. This is a policy change, not proof that head passes.

Research: operator · `issues/chart/leaf-run-stalls/forks/red-criterion.md`, Taken 2026-10-01, and `issues/chart/realistic-fix-bar/forks/test-bar.md` · red criteria/checks remain blocking · prevents silently weakening acceptance. Operator · framework leaf `implementation/report.md:60-63` · environment changed across attempts · failure subtraction is not established here.

Pitfall: two nonzero exits are not evidence of the same failure. Rerunning a failing test alone cannot reproduce a whole-directory interference failure. “Run new failures once” also promises a flake classification that two attempts cannot prove.

### Q3. How should already-open leaves receive the new proof rules?

- **3a recommended:** One operator-approved audit of the affected open contracts before resuming them. Keep each criterion's actual property, replace unrelated suite requirements with sufficient owned proof, and state which changed shared resources require integration proof. Apply the existing chart audit during future planning/repair when a mismatch is found.
- **3b:** Command-detect broad-suite text at every phase start and pause for an operator decision. Adds repeated interruptions and requires semantics the command cannot infer from free-form criteria.

Research: operator · framework `plan.md:89,111` and `report.md:46,69-73` · an operator narrowed execution but the old plan still claims the broad criteria · acceptance and the report must agree. Practitioner · Kent Beck, TDD/XP practitioner, [2008 first-hand answer](https://stackoverflow.com/a/153565), read 2026-10-01 · choose tests for confidence in likely mistakes · supports property-based review of criteria, not keyword rejection.

Pitfall: do not erase whole-run proof when order or integration itself is the required property. Current standing design already permits that case. A script checking exact prose would recreate the meaningless checks the operator objects to.

### Q4. Should temp ownership use existing worktree storage or a new cache hierarchy?

- **4a recommended:** Derive one private leaf temp directory beside its worktree under the existing `worktree_store`, using a distinct reserved subtree to avoid worker/leaf name collisions. Export `TMPDIR`, `TMP`, `TEMP` at pane creation/split and explicitly carry them into worker execution. Producers remove their individual scratch copies after use. Leaf teardown removes the enclosing directory after seats and descendants stop. Preserve required evidence under the registered leaf artifacts before deleting scratch.
- **4b:** Adopt #49's cache root, phase clearing, terminal clearing and status-size display. Costs another location and lifecycle, and phase clearing risks destroying a continuing session's scratch state or cited logs.

Research: better-than-training · `src/config.ts:127-128`, `src/next.ts:302-315,559-565` and [Herdr CLI env semantics](https://herdr.dev/docs/cli-reference/), read 2026-10-01 · storage and pane-env boundaries already exist; env applies only to newly launched processes · extend those boundaries rather than add a cache setting. [Node os.tmpdir](https://nodejs.org/api/os.html#ostmpdir), read 2026-10-01 · Unix temp selection respects TMPDIR/TMP/TEMP · inheritance covers compliant consumers, not literal `/tmp` paths.

Pitfall: remove temp after an individual merged leaf stops, even when sibling leaves keep its issue open. Current `cleanupMerged` delays worktree removal until the issue closes. Retain failed scratch for diagnosis/recovery, with its later disposal owner explicit. `close` closes a GitHub intake identity (`src/akrogon.ts:65-68`), not a leaf. Park refuses a leaf holding a tab/worktree (`src/park.ts:22-25,54-56`), so do not invent generic close/park teardown hooks.

## Practitioner questions and pitfalls

- **P1:** Which required property does every slow run prove, and what smaller run misses it? Existing proof locks already answer the test-selection principle. No new budget or test-count rule is needed.
- **P2:** Which tests share browser profiles, ports, process env, fixtures or output directories? Does whole-directory execution launch concurrent users of those resources? The report confirms profile contention, not its full fix or all causes of the 38 failures.
- **P3:** Do existing panes and resumed sessions actually inherit the chosen temp root? New-pane flags do not update running shells. A safe migration and real harness/worker inheritance probe remain necessary before handoff.
- **P4:** What happens after a seat crash, descendant leak, failed cleanup or machine restart? Reuse existing sweep/recovery paths for managed leaves. Do not delete a live directory based only on elapsed time or an idle agent label.
- **P5:** Which files are evidence and which are disposable? A passing record with a deleted log is poor evidence. Keep reports and required artifacts outside scratch before automatic removal.

Outside synthesis: Kent Beck's confidence-per-cost advice and Andrew Trenk's Google testing practice both support checks of behavior rather than implementation wording. [Trenk, 2013](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html), read 2026-10-01, changed the recommendation toward auditing the consumer checks' protected outcomes. Neither supports dropping a meaningful failing gate merely because it also fails on base. The [Bazel team's test specification](https://bazel.build/reference/test-encyclopedia), read 2026-10-01, requires declared dependencies for reproducible attribution. Its [cache documentation](https://bazel.build/remote/caching) warns that tools outside the workspace can invalidate reuse assumptions. These primary sources changed Q1/Q2 toward isolation and diagnostic evidence, not SHA-only caching.

Temp research: better-than-training · [systemd maintainers, Using /tmp and /var/tmp Safely](https://systemd.io/TEMPORARY_DIRECTORIES/), read 2026-10-01 · large scratch belongs on persistent storage, TMPDIR must be honored, and private persistent directories require their own cleanup. This changed Q4 toward disk-backed owned scratch with teardown and against “moving it fixes it.” It also warns age cleanup can remove live files. This is maintainers' primary guidance, not an independently measured akrogon deployment. No named outside temp-lifecycle case study was found in the search for Lennart Poettering temporary-file/TMPDIR cleanup. No recommendation relies solely on model knowledge.

## Off route and remaining fog

- **O1:** Framework #113 timeouts, #115's test audit, run-all reporting, affected-area selection, browser profile isolation and fixture cleanup. These are consumer mechanisms and need a separate framework destination. Akrogon cannot infer their dependency graph from arbitrary shell commands.
- **O2:** Nightly/post-merge health scheduling, notifications and automatic intake creation. These do not resolve the observed leaf contract or temp ownership. #50's proposal should not add another scheduler here.
- **O3:** OS-wide cleanup, existing unknown `/tmp` leftovers, standalone Claude sessions and Chrome profiles outside managed leaf ownership. Akrogon must not sweep them. Current `df -i /tmp` measured 2% of 4,194,304 inodes, so the immediate pressure is relieved. Causation of the 25-minute selftest hang remains unproven (#49:26).
- **O4:** New temp config knobs, status directory-size scans, universal output parsers, cross-leaf caches and automatic failure-set subtraction. None is needed to establish ownership and teardown. Disk filesystems still have finite capacity. Retaining failed leaves indefinitely needs an explicit operator disposal practice, not a claim that disk prevents leaks.

Fog: actual Claude scratchpad compliance with TMPDIR, worker harness env propagation and descendant shutdown behavior were not probed. No external mutation or lifecycle command ran in this map. Before handoff, the owning door must probe the chosen launch/cleanup boundary with the real harness and confirm that required evidence survives. Two independent akrogon outcomes are possible: existing-contract proof audit and managed temp ownership. Only adopting base-copy execution would create a dependency on temp ownership.
