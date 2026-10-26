# Map B: git-calls

2026-10-26. Independent consultant assessment. No code changes, measurements, commits or phase moves. Read only the assigned brief and census in this chart's slots directory. Source HEAD a4fc68d3 has no src/tests changes from census base 02dc5f91.

## Evidence

- E1, operator, 2026-10-25/26: INTAKE.md, **Source: operator** and **Autopilot switch-on**. Preserve workflow, backend replacement allowed when beneficial, fix the loaded failure and do proper testing.
- E2, better-than-training, 2026-10-26: slots/census-A.md, **Full suite**, **One test**, **Per call**. Accepted as supplied measurements, not independently reproduced. Full suite: 29,119 product git calls, 13,270 test git calls, 17,729 fake Herdr calls. Target: git 447 ms, Herdr 2,224 ms inside 4,187 ms of CLI time. These are summed wall times, not CPU attribution.
- E3, better-than-training, inspected 2026-10-26: src/config.ts commonDirectory/currentRepo; src/next.ts ensureWorktree/writeLeafEnv/dispatchLeaf/mergeTurn; src/preflight.ts checkBase/remoteBase; src/batch.ts buildStack/move. Identity is repeatedly resolved. HEAD, refs, index and worktree contents also change during command execution.
- E4, better-than-training, inspected 2026-10-26: src/shell.ts sessionList/repoSession/sessionPanes; src/next.ts allocate/currentPane/assertUnseated/nextCommand; src/scope.ts adoptShell/inOwnScope. Some discovery is already shared. Fresh reads also protect session ownership, dispatch and process placement.
- E5, better-than-training, inspected 2026-10-26: tests/isolation.ts, tests/helpers.ts cli/fakeHerdr/fixture, tests/fake-busctl.ts. Herdr is already bundled per worker. Busctl still launches Bun source. CLI calls remain separate processes. Fixtures own writable repositories and remotes.
- E6, better-than-training, inspected 2026-10-26: tests/next.test.ts test **a leaf re-entering merge queues behind the two leaves stamped earlier**; issues/chart/suite-time/slots/load-tests-rebuttal-B.md, F29–F31. Continuous history proves prompt order aa, bb, cc, aa. F30 records an earlier operator three-suite bar, beyond today's two-suite reproducer.

Recommendations below are model-knowledge engineering judgments grounded in these sources. No external practitioner evidence was gathered.

## Findings

- F1. The census establishes counts and time concentration, but does not finish the requested census of every process kind and its CPU share. Bun, other fake tools, shells and descendants need coverage. Nested CLI and child wall totals overlap and cannot be added as independent CPU costs. [E2]
- F2. Git elimination alone cannot be claimed to solve the loaded failure. Even eliminating all measured product git time removes only about 11% of this test's quiet CLI time, excluding setup. Loaded behavior must be measured separately. Herdr is the larger measured cost. [E2]
- F3. Repeated calls are not necessarily redundant. Existing code deliberately re-reads after fetch, rebase, reset, allocation and before dispatch or cleanup. The current call sites encode those boundaries. [E3, E4]

## Material forks

### D1. Resolve stable repository identity once within an explicit command scope

Pick: reuse successful identity resolution for the registered checkout, and pass already-resolved values through helpers. Batch compatible identity queries where Git's output remains unambiguous. Keep worktree-specific git directories distinct from the common directory. Cost: low to moderate plumbing, targeted identity tests. [E2, E3]

Reject a generic argv-result cache in run/command: arguments alone omit cwd, environment and mutable state. Reject persistent caches, hand-reading .git/refs, or replacing Git's backend for this work: they add invalidation or compatibility work without evidence of a necessary payoff. [E3; model-knowledge]

Pitfall: arbitrary worktree paths can be removed/recreated and symlinks can change. Reuse registered-root identity only while its lifetime is established, and freshly validate newly created or replaced worktrees. Normalize relative cwd against the invocation's directory. Do not cache missing repositories or failures. A command-owned lifetime prevents cross-fixture leakage under --no-isolate and future embedded callers.

### D2. Remove repeated mutable queries by passing facts within an unchanged operation

Pick: eliminate demonstrated duplicate work at callers. Concrete starting point: checkBase calls ensureRemote, then remoteBase repeats ensureRemote on paths requiring remote proof. Share that successful validation within this call chain while preserving standalone remoteBase behavior and C1/C2/C3 errors. Reuse explicit commit SHAs only where the existing operation already fixes their meaning. Cost: small for preflight, moderate for additional measured paths. [E3]

Reject whole-command HEAD/tracking-ref/branch/worktree-list/.env-policy memoization. Fetch changes refs, buildStack reads HEAD after rebase and commit, move checks status after reset, and allocation creates worktrees. Root and leaf .env ignore policies are separate facts. Do not remove safety checks merely because their command strings repeat. [E3]

Pitfall: the global application lock does not stop external Git or editor activity. Bound reuse by the original operation's consistency contract, not merely lock ownership. Re-read at existing mutation and action boundaries. Immutable object queries can use explicit SHAs where existing semantics allow, without converting moving-ref decisions into snapshots.

### D3. Reduce Herdr calls only where the observation has the same lifetime

Pick: trace the target's pane-list/process-info/get repetitions by caller and look for sharing inside a single observation step. Reuse lists already passed to helpers before introducing another cache. Cost: moderate investigation and mutation tests, with a larger potential return than git alone. Treat as a conditional leaf if the smaller changes do not clear loaded proof. [E2, E4]

Reject one pane/tab/process snapshot for the entire next pass. Existing sessionLists/resolutions and hostPanesOnce already share selected reads. Allocation, close, swap, start and prompt change observations, and other agents can change them too. Preserve currentPane's accepted-tab proof and fresh process placement checks unless equivalent protection is demonstrated. [E4]

Pitfall: stale absence can authorize deletion or duplicate seats. Never use an earlier discovery list as fresh destructive authorization. Preserve unknown/unreadable versus empty distinctions, cross-session checks, discovery deadlines, PID start-time checks and post-placement verification. If these boundaries erase the saving, reject that optimization.

### D4. Make fake startup cheaper without weakening process coverage

Pick: measure bytecode-bundling fake busctl using the existing worker-owned build mechanism. Its 938 source launches account for 33.8 s of summed full-suite wall time. Include build cost and target-specific benefit before accepting it. Cost: small, isolated to test infrastructure. Other fake executables qualify only when CPU attribution identifies them. [E2, E5]

Reject an in-process CLI/fake replacement, resident fake daemon, shared writable fixture or shared Git remote as the opening move. They change process lifetime, environment, persistence or isolation semantics and require much more proof. Native fake rewrites and a runtime migration remain options only after a measured startup floor justifies their maintenance cost. [E1, E5; model-knowledge]

Pitfall: a faster fake must retain fixture-script mutations and delayed/failing busctl behavior. Keep per-call database reads, exit codes, stdout/stderr and child behavior. Store builds in existing worker roots so the landed cleanup owns them. Do not revisit capture transport: spawnFiles deliberately avoids Bun pipe loss under load. [E4, E5]

## Independently checkable leaves

1. L1, repository identity: D1 only, config/next identity paths. Proof: fewer repeated identity calls, unchanged root/linked-worktree/symlink/unregistered/unrelated-worktree results, fresh validation after replacement, no reuse between command contexts.
2. L2, caller-level Git duplicates: D2, beginning with preflight's repeated remote validation. Proof: unchanged configured remote/branch and C1/C2/C3/transport errors, branch/tag ambiguity tests, moving refs observed after fetch/rebase/reset, fewer calls on affected paths. Independently shippable from L1.
3. L3, fake startup: D4, tests/isolation.ts and helpers. Proof: busctl placement/failure/delay tests pass using the bundle, parallel worker roots remain isolated, measured CPU falls including compilation. Independently shippable from L1/L2.
4. L4, conditional Herdr reuse: D3 only after caller attribution. Proof: fewer identified reads while pane movement, death, prompt mutation, session ambiguity and unreadability retain current behavior. Name each shared observation's lifetime before implementation. This leaf may overlap next.ts with L1, so schedule edits accordingly.

Do not create a general cache framework to connect these leaves. Measurement is the entry and exit gate for each, not a new product feature.

## Proper testing and done criteria

- P1. Complete F1 on an isolated detached baseline checkout. Record SHA, Bun/Git versions, host load, command and worker settings. Count every process family and attribute user/sys CPU without counting descendant totals twice. Keep instrumented census separate from uninstrumented timing. Use the same method before and after, include bundle builds, and retain raw evidence outside src/tests. Remove scratch worktrees/helpers afterward.
- P2. Run affected behavioral tests, configured format/typecheck checks and the exact configured full test command: `bun test --timeout=30000 --parallel=4 --no-isolate`. Preserve all tests and existing caps. For changed reuse boundaries, add behavioral mutation cases only where current coverage does not exercise the stale-state failure. Call-count checks may prove the specific removed duplicate, not freeze every incidental command order.
- P3. Preserve the target's continuous causal history and 15 s cap. It already batches initial allocation and seeds verification. Do not split it or substitute seeded transitions without showing equivalent history coverage. [E6]
- P4. Reproduce the original failure under two simultaneous full checks, then require 20 candidate rounds with both complete checks passing under comparable busy-host conditions. Record each target duration and every suite result, including failures. Report median, slowest target and margin below 15 s. No --retry, new test.serial or timeout increases. Twenty clean rounds provide evidence, not a guarantee against every future load.
- P5. E6 records a three-suite operator bar. Unless the chart can cite a later instruction superseding it, also exercise three simultaneous full checks and report those results separately. A two-suite reproducer alone does not establish three-suite acceptance.
- P6. Compare at least three uninstrumented quiet baseline/candidate full checks on the same host with order alternated. Require reduced subprocess counts and user+sys CPU, unchanged behavior, and no material full-suite wall regression. Report magnitude and variance rather than claiming improvement from one run. If loaded proof remains red, the destination is incomplete regardless of quiet gains.

## Questions the chart should settle

- Q1. Does today's two-suite reproducer supersede the recorded three-suite acceptance bar, or merely identify the current failure? Locate operator evidence before weakening the bar.
- Q2. What CPU belongs to every remaining process family, and how much of the target's unaccounted time is startup, setup, filesystem work or waiting? E2 cannot answer this with child wall totals.
- Q3. For each proposed shared value, exactly which operation establishes its lifetime, and which mutation or external action requires a fresh read? If this cannot be stated, do not cache it.
- Q4. How much 15 s margin is required under the agreed load, and can the chosen leaves plausibly provide it? Do not equate fewer git calls with the target being fixed.

Recommendation: land measured, narrow Git savings and the existing-style fake build improvement first. Expand into Herdr sharing only where loaded proof still needs it and the observation boundary remains safe.
