# Review B: blocked-report

Date: 2026-10-09
Phase: check.review
Base: `3e034dee43f0853446c2ba8f97bb72668ab213dc`
Reviewed head: `0303a1132bd7d2bca9a9e4fc2687d835f6b7e985`
Verdict: ready

## Findings

No Fixes, held Nits, or operator actions.

Reviewed the whole seven-file diff against brief.md, design.md, plan.md and implementation/report.md. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. Did not read the peer's review.

## Contract review

- C1: selection sweeps now carry picked=true. dispatchLeaf reports failed/deps/inputs through the existing report dedupe and skipped exit status, while continuing ready siblings. The epic-folder CLI case asserts three reports, the ready prompt and exit 1.
- C2: unmergedDeps preserves blocked-by order, excludes merged open/closed records, and labels absent inventory entries with parked/unreadable/missing. The dependency CLI case checks all labels and merged exclusions. eligibility and mergeQueue bodies are unchanged.
- C3: blockDetail checks dependencies before readiness and reuses gaps. The input CLI case asserts env/file names and holder, omits the present input and its value, and checks deps take priority.
- C4: merged completion remains before failed reporting. The mixed-folder case asserts only the failed recovery line. Existing completion/cleanup tests retain their state and side-effect assertions.
- C5: single selection and folder sweeps use the same dispatchLeaf implementation. The CLI comparison asserts identical reports by slug, leaf folder and epic folder.
- C6: explicit input ignores inherited event JSON, bare no-event next remains a selection, and both --all branches carry picked=true. Manual-form CLI cases compare reports and exits inside/outside the repo and with pane/event context.
- C7: resume, hook, merge paths and completion dependents pass false. Missing dependencies are now silent automatic waits, while discovery/delivery errors still use report. The automatic/resume, dependent and malformed-record cases cover these paths. mergeWake still uses the unchanged eligibility-based merge queue, which excludes blocked merge leaves before dispatch.
- C8: merge-turn, capacity and busy handling are unchanged after blocker evaluation. Three CLI cases assert silent successful waits and relevant prompt/allocation side effects.
- C9: opened the live docs/guide/next.md and followed docs/reference-index.md, src/AREA.md, tests/AREA.md and README.md. The new section describes selected subjects, ordered reasons, exit 1 and automatic silence. No AREA.md changed. Target-resolution documentation remains outside this leaf's diff.

The extra config.yaml commit is exactly the already-landed main fix 4534a569205c3903bcfd56145e74ec8caa4197d5. Checked its diff and the recorded leaf/base harness-test log tails: both had 0 pass, 3 fail, with the same literal model overriding the requested model. No test expectation was weakened to address it.

## Verification

Reused implementation evidence for unchanged reviewed content, per the review rerun rule:

- Full suite: 552 pass, 0 fail.
- Changed suite: 440 pass, 0 fail.
- blocked-report cases: 13 pass, 0 fail.
- Docs links: 3 pass, 0 fail.
- Typecheck: exit 0.
- Recorded deliberate reds R1-R5 show parked detail, missing-input reporting, failed reporting, outside --all classification and non-picked dependent classification are detected.

Additional review verification:

- `bun run format`: exit 0. Only unrelated src/status.ts formatting changed. Inspected and restored that review-created change. All changed source/test files were already formatted.
- A temporary CLI probe used tests/helpers.ts, a real isolated registered Git repo and fake Herdr. Allocated hook-owner, then added blocked-by missing-dep. Its idle plugin event produced exit 0 and empty stderr. Targeting the same leaf manually produced exit 1 and missing-dep (missing). Probe passed and its script/fixture were deleted. This verifies the blocked hook-owner scenario beyond the report's ready-owner hook test.
- `git diff --check`: exit 0. Final worktree status is clean and HEAD matches the reviewed head.

No live Herdr run or credentials are required by the design. Readiness has no inputs or grants and status reports no missing inputs.

## Test-Change trailers

Commit `0303a1132bd7d2bca9a9e4fc2687d835f6b7e985` contains:

1. `Test-Change: tests/next.test.ts added 13 blocked-report CLI cases proving C1-C8`
2. `Test-Change: tests/next.test.ts updated 13 manual-silence expectations to picked reports per brief criteria 1-4 and 6`
3. `Test-Change: tests/batch-dispatch.test.ts updated 5 manual --all expectations to picked reports per brief criteria 2 and 4`

Both files match src/test-files.ts. New tests need no prior source. Reviewed every modified existing assertion: failed manual targets/sweeps follow brief criterion 4, manual dependency waits follow criteria 1/2/6, and missing-input sweeps follow criteria 3/6. Existing prompt, allocation, notification, cleanup and batch-state assertions remain. No deleted tests or fixtures, and no changed expectation contradicts its cited brief outcome.

## Phase result

`akrogon phase blocked-report merge --slot B --verdict ready` returned `recorded` (exit 0). B's ready verdict is saved. The initial review is waiting for the other seat's verdict and has not moved to merge.

## Merge 2026-10-09: solo fadf4f30-bc51-430c-aa28-f5466d83245b

Fetched origin and rebased onto origin/main `1c371b75b3d06a912be1d5fae1e10c8c49c289ff`. Prior reviewed head: `0303a1132bd7d2bca9a9e4fc2687d835f6b7e985`. Resolved head: `d6c3b719b8c1627ab99eee617e27befb9c2b53c7`. Refreshed AKROGON_BASE to the rebase target.

Conflict was confined to src/next.ts, where main introduced pause-aware isAutomatic propagation. Kept main's pause guards and automatic classification, and added the separate picked flag through sweep. Manual next selections/--all are picked, resume/dependents/unpausePass are not picked. All existing pause behavior remains. No test assertion changed during resolution. The harness placeholder commit was skipped because main already contains it. Read live docs/guide/next.md pause contract before resolving.

Range comparison:

```text
1:  b7da0fb < -:  ------- blocked-report: restore {model} placeholder in claude harness
2:  37e39ed = 1:  7cb2b9a blocked-report U1: blocker detail beside eligibility
3:  a7113fb = 2:  1ebe1d7 blocked-report U2: document picked-leaf report
4:  3bc0a0c ! 3:  d810ced blocked-report U3: report picked waits in dispatch
    @@ Commit message
         those expectations to the brief.
     
      ## src/next.ts ##
    -@@ src/next.ts: import {
    - import { commitMove, completeOwner } from './phase';
    +@@ src/next.ts: import { commitMove, completeOwner } from './phase';
      import { sessionFile, deliveredAfter } from './session-file';
      import { readLog } from './log';
    + import { isPaused, readPaused } from './pause';
     -import { eligibility, mergeQueue, type Block, type QueueEntry } from './turn';
     +import { blockDetail, mergeQueue, type QueueEntry } from './turn';
      
    @@ src/next.ts: async function dispatchLeaf(
     -  explicit: boolean,
     +  picked: boolean,
        invocation: Invocation,
    -   mergeContext?: string,
    - ): Promise<DispatchOutcome> {
    +   mergeContext: string | undefined,
    +   isAutomatic: boolean,
     @@ src/next.ts: async function dispatchLeaf(
            await completeOwner(repo, { path: leaf.path, state }, false);
            return 'completed';
    @@ src/next.ts: async function dispatchLeaf(
              );
            return 'waiting';
          }
    -@@ src/next.ts: async function sweepAll(global: GlobalConfig, invocation: Invocation): Promise<v
    +@@ src/next.ts: async function sweepAll(global: GlobalConfig, invocation: Invocation, isAutomati
              repo,
              discover(repo, invocation).leaves.filter((leaf) => (leaf.state.phase === 'merged') === merged),
              invocation,
     +        true,
    +         isAutomatic,
            );
      }
    - 
    --async function sweep(global: GlobalConfig, repo: Repo, leaves: Leaf[], invocation: Invocation): Promise<void> {
    -+async function sweep(
    -+  global: GlobalConfig,
    -+  repo: Repo,
    -+  leaves: Leaf[],
    -+  invocation: Invocation,
    +@@ src/next.ts: async function sweep(
    +   repo: Repo,
    +   leaves: Leaf[],
    +   invocation: Invocation,
     +  picked: boolean,
    -+): Promise<void> {
    -   const ordered: Leaf[] = [...leaves].sort(
    +   isAutomatic: boolean,
    + ): Promise<void> {
    +   if (isAutomatic && isPaused(repo.name)) return;
    +@@ src/next.ts: async function sweep(
          (a, b) => Number(b.state.phase === 'merged') - Number(a.state.phase === 'merged'),
        );
        for (const leaf of ordered) {
    --    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, false, invocation);
    -+    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, picked, invocation);
    -     if (outcome === 'completed') await dispatchDependents(global, repo, leaf.state.slug, invocation);
    +-    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, false, invocation, undefined, isAutomatic);
    ++    const outcome: DispatchOutcome = await dispatchLeaf(global, repo, leaf, picked, invocation, undefined, isAutomatic);
    +     if (outcome === 'completed') await dispatchDependents(global, repo, leaf.state.slug, invocation, isAutomatic);
        }
      }
     @@ src/next.ts: async function dispatchDependents(
    @@ src/next.ts: async function dispatchDependents(
          discover(repo, invocation).leaves.filter((leaf) => leaf.state['blocked-by'].includes(completedSlug)),
          invocation,
     +    false,
    +     isAutomatic,
        );
      }
    - 
     @@ src/next.ts: export async function nextCommand(input: string | undefined): Promise<void> {
    -             invocation,
                );
    -           if (outcome === 'completed') await dispatchDependents(global, selection.repo, completedSlug, invocation);
    --        } else await sweep(global, selection.repo, selection.leaves, invocation);
    -+        } else await sweep(global, selection.repo, selection.leaves, invocation, true);
    -         touched.set(selection.repo.name, selection.repo);
    -         if (input === undefined) await cleanupRepos([selection.repo], invocation);
    +           if (outcome === 'completed')
    +             await dispatchDependents(global, selection.repo, completedSlug, invocation, false);
    +-        } else await sweep(global, selection.repo, selection.leaves, invocation, false);
    ++        } else await sweep(global, selection.repo, selection.leaves, invocation, true, false);
    +         touched.set(selection.repo.name, { repo: selection.repo, isAutomatic: false });
    +         if (input === undefined) await cleanupRepos([selection.repo], invocation, false);
            } else if (input === '--all') {
     @@ src/next.ts: export async function nextCommand(input: string | undefined): Promise<void> {
    -           for (const repo of registered.repos) touched.set(repo.name, repo);
    -           await cleanupRepos(registered.repos, invocation);
    +           for (const repo of registered.repos) touched.set(repo.name, { repo, isAutomatic: false });
    +           await cleanupRepos(registered.repos, invocation, false);
              } else {
    --          await sweep(global, current, discover(current, invocation).leaves, invocation);
    -+          await sweep(global, current, discover(current, invocation).leaves, invocation, true);
    -           touched.set(current.name, current);
    -           await cleanupRepos([current], invocation);
    +-          await sweep(global, current, discover(current, invocation).leaves, invocation, false);
    ++          await sweep(global, current, discover(current, invocation).leaves, invocation, true, false);
    +           touched.set(current.name, { repo: current, isAutomatic: false });
    +           await cleanupRepos([current], invocation, false);
              }
     @@ src/next.ts: export async function nextCommand(input: string | undefined): Promise<void> {
                      leaf.state.phase === 'merged' || leaf.state.tab !== undefined || leaf.state.worktree !== undefined,
                  ),
                  invocation,
     +            false,
    +             true,
                );
    -         for (const repo of registered.repos) touched.set(repo.name, repo);
    -         await cleanupRepos(registered.repos, invocation);
    +         for (const repo of active) touched.set(repo.name, { repo, isAutomatic: true });
    +@@ src/next.ts: export async function unpausePass(repo: Repo): Promise<void> {
    +       ),
    +       invocation,
    +       false,
    ++      false,
    +     );
    +     await cleanupRepos([repo], invocation, false);
    +   });
5:  c312e41 = 4:  3f8b769 blocked-report: format U3 long line
6:  0303a11 = 5:  d6c3b71 blocked-report U4: CLI tests for picked reports
```

First post-rebase full suite: 582 pass, 2 fail, exit 1. Log: `/tmp/akrogon-1000/blocked-report-44bc777275a0/tmp.BIEmwsewwo`. Both failures were old pause tests introduced on main, with expectations contradicted by this leaf's brief:

- `unpause failure exits non-zero with the pause cleared`: expected nonzero, received 0 because its only error source was an absent dependency in a non-picked continuation. Replaced that fixture with an unreadable state record, which remains a real error under criterion 7. Kept nonzero/stderr/unpaused/cleared-state assertions. Commit `3c4e03b`, dedicated test-change trailer. Targeted test: 1 pass, 0 fail, 5 assertions.
- `race: pause waits for landed-batch dependent dispatch, later automatic work is suppressed`: manual --all setup expected 0, received 1 because its picked dependent still waits on member. Brief criteria 2/6 require that report and exit 1. Updated only this setup exit expectation. All lock/barrier, dependent prompt and later suppression assertions remain. Commit `a2e9f94`, dedicated test-change trailer. Targeted test: 1 pass, 0 fail, 11 assertions.

These are wrong tests exposed by integration, repaired in separate commits under the solo merge rule. No production-code repair was needed. Format passed after repairs; unrelated src/status.ts formatter drift was restored. Typecheck passed after repairs.

Final tested head: `a2e9f9411d2639ec3841ef152c442b0bfe13778b` on target `1c371b75b3d06a912be1d5fae1e10c8c49c289ff`.

- `bun run format`: exit 0, scoped files unchanged, unrelated formatter drift restored.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 584 pass, 0 fail. Log `/tmp/akrogon-1000/blocked-report-44bc777275a0/tmp.2JSX9NRF3f`.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 463 pass, 0 fail. Log `/tmp/akrogon-1000/blocked-report-44bc777275a0/tmp.YtyGxZYpya`.
- No configured merge_checks or advisory commands.
- `git diff --check`: clean. Worktree clean.

Read both next-named-targets leaf briefs for completion context. named-targets is still open/failed, so landing this leaf alone does not finish the owner.

`akrogon phase blocked-report merged --slot B --check --attempt fadf4f30-bc51-430c-aa28-f5466d83245b`: `ok`, exit 0. Trailer validation accepted the rebased range and both integration test commits.

`akrogon phase blocked-report merged --slot B --attempt fadf4f30-bc51-430c-aa28-f5466d83245b`: `moved merged`, exit 0. The command pushed the tested head. Remote main read-back equals `a2e9f9411d2639ec3841ef152c442b0bfe13778b`. No issue/epic completion line was emitted, so no broadcast is due.
