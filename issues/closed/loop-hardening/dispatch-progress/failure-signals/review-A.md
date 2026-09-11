# Review A: failure-signals

Base: 9dc1055a0a1ba3682335622d81f41873de966f11
Reviewed head: 9ad20ab (Record failure notifications and warn on prolonged busy seats)
Diff: src/next.ts, src/phase.ts, src/state.ts, src/status.ts, tests/next.test.ts, tests/phase.test.ts, tests/status.test.ts

## Verification

- Read plan D1–D6 / C1–C7, brief, design, implementation brief and report; traced observeBusy, dispatchSlot, dispatchLeaf, commitMove, allocate, ensureWorktree and status note against the plan.
- D1: three fields added with false/empty defaults; legacy state parses (existing tests untouched pass). Cleared seats are written as `[seat]: undefined`; confirmed `Bun.YAML.stringify` drops undefined keys, so re-read never sees null.
- D2: failed branch notifies only when `failed_notified` is false and saves the flag after `command` resolves; a herdr failure throws before the save and is reported through the existing dispatch error boundary. `commitMove` resets the flag on every transition and preserves busy records via spread.
- D3/D4: observeBusy keys on physical seat, stamps once, warns strictly after STALL_MS, saves `busy_notified` only after success, clears both on idle/done/agentless, retains on unknown-with-agent. Called under the leaf lock before the merge early return and before required-slot filtering, and reused at the three pane reads in dispatchSlot.
- D5: dispatchSlot derives attempt/prompted/commitMove state from the observed state; dispatchLeaf builds `refreshed` after observation, and allocate/ensureWorktree derive from the passed leaf, so observations survive later saves.
- D6: status formats whole minutes with two-digit remainder, clamps negatives, orders A then B, no herdr calls (existing no-call assertion retained).
- Tests: real CLI subprocesses with fake herdr at the boundary, controlled clock via `Date.now` override in the child, exact 60/61 minute boundary, retry after delivery failure without attempt/phase change, fallback seat, working merge seat, idle/done/agentless clearing, unknown retention, transition preservation. No mocks of the unit under test. Exact-format assertions cover only the plan-fixed NOTE string and the seat token.
- Reran `bun implementation/verify-cli.ts`: exit 0, regenerated `implementation/cli-artifact.log` with the fake herdr notification arrays for failed dedup/retry and the busy warning. Report records format/typecheck/full test passing (95 pass, `implementation/full-test.log`); no code change or specific concern warranted a rerun.

## Findings

Nits

N1. `dispatchLeaf` calls `panes()` for observation and again for the merge-active check in the same sweep. Reusing the first result is one fewer herdr round trip. Reason: minor efficiency only, not a defect.

Fixes: none.

## Verdict

ready

## Merge

Rebased 9ad20ab onto origin/main 35a2088 (three new commits, no conflicts) as f644c76. AKROGON_BASE refreshed to 35a20886b65463c0c7c6b0a30047f56a680d5e63. Checks in the worktree after rebase: `bun run format` exit 0 (no changes), `bun run typecheck` exit 0, `bun test` exit 0 (128 pass, 0 fail, 1282 assertions), `test_changed` exit 0 (54 pass, 0 fail). Worktree clean before push.

First push was rejected non-fast-forward: 131b02d (Fix dispatch session and recorded seat guards) landed on origin/main. Second rebase onto origin/main 131b02d stopped with a conflict; the rebase is left in progress in the worktree for repair.

Rebase target: 131b02de1c3352f35371ca391c59beca5f8dcd95
Conflicting files: tests/next.test.ts (one hunk, the `./helpers` import line: HEAD lacks `entry`, the leaf commit adds it; `type State` is already imported from `../src/state` on both sides).
Not conflicting but co-modified with 131b02d: src/next.ts dispatchSlot. Repair must resolve the import, complete the rebase (`git rebase --continue`), and rerun all checks with AKROGON_BASE=131b02de1c3352f35371ca391c59beca5f8dcd95 to confirm the seat-guard changes and busy observation still agree.

## Re-check after check.fix (round 1)

Baseline: rebase target 131b02d with reviewed head f644c76 in conflict. Repair head: e2eba23.

- `git range-diff 35a2088..f644c76 131b02d..6aae8fc`: the only patch change is the resolved `./helpers` import line in tests/next.test.ts (retains `entry` and upstream imports). No source change beyond the reviewed leaf.
- `git diff 6aae8fc..e2eba23`: only the upstream blocked-merge regression test changes. It replaces byte-equal state after a blocked merge sweep with the expected busy observation: a fresh timestamp for seat A bounded by the test's clock, the retained stamp for seat B, empty `busy_notified`, and all other state unchanged. This follows D4/D5 (a working or blocked merge seat is observed) and does not weaken the original no-fetch, no-status, prompt/start and dirty-file assertions.
- Integrated dispatchSlot keeps the upstream defined-session guard and 30s start timeout while threading the observed state into the guard, attempts and prompted saves.
- Reran on e2eba23: `bun run typecheck` exit 0, `AKROGON_BASE=131b02d bun test --changed=131b02d` exit 0 (66 pass, 613 assertions). B's `implementation/repair-full-test.log` shows `bun test` 140 pass, 0 fail; `repair-format.log` exit 0. Worktree clean.

Earlier findings stand (N1 unchanged). No defect introduced by the repair.

Verdict: ready

## Merge attempt 2: red checks on rebase target eed65fb

Rebased e2eba23 onto origin/main eed65fb70e72215d300d40c5187b77ec01d01bdc cleanly (no conflicts) as 389c0b4. AKROGON_BASE refreshed to eed65fb70e72215d300d40c5187b77ec01d01bdc. Worktree clean.

Checks: `bun run format` exit 0. `bun run typecheck` exit 2. `bun test` exit 1 (139 pass, 1 fail). `test_changed` exit 1 (65 pass, 1 fail).

Failing typecheck output:
```
src/next.ts(552,11): error TS2304: Cannot find name 'allLeaves'.
src/next.ts(553,22): error TS7006: Parameter 'leaf' implicitly has an 'any' type.
src/next.ts(554,19): error TS7006: Parameter 'leaf' implicitly has an 'any' type.
src/next.ts(558,13): error TS2322: Type 'string' is not assignable to type 'boolean'.
src/next.ts(558,40): error TS2554: Expected 5 arguments, but got 4.
src/next.ts(559,28): error TS2554: Expected 2 arguments, but got 1.
```
Failing test: `tests/next.test.ts` "a closed tab hook from a merged leaf sweeps and starts the next leaf", `expect(received).toBe(expected)` at tests/next.test.ts:364, expected exit 0, received 1.

Root cause: the default branch is broken independently of this leaf. Commit eed65fb ("sync issues") also committed source edits to `src/next.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts` and `plugin/herdr-plugin.toml` adding a `tab_closed` hook. Its `nextCommand` block calls an undefined `allLeaves(repo)`, calls `dispatchLeaf` with four arguments and assigns its `DispatchOutcome` string to a boolean, and calls `sweepAll(global)` without the invocation argument. A detached checkout of origin/main fails typecheck and this test with no leaf changes applied (verified in a temporary worktree, since removed).

Repair (fix forward, failing tests as criteria): make the `tab_closed` hook block in `src/next.ts` compile against the existing `discover`/`registeredRepos`, `dispatchLeaf(global, repo, leaf, explicit, invocation)` and `sweepAll(global, invocation)` signatures so the named test passes, then rerun all checks with AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc. Do not change the leaf's own behavior.

## Re-check after check.fix (round 2)

Baseline: 389c0b4 on rebase target eed65fb. Repair head: 9da8210.

- `git diff 389c0b4..9da8210`: only the upstream `tab_closed` block in `src/next.ts`. It now resolves owners through `registeredRepos`/`discover` with the invocation, passes the owning Leaf and invocation to `dispatchLeaf`, and sweeps only on the `completed` outcome. This is the same shape as the adjacent pane hook block. No leaf behavior, tests, plugin or config changed.
- Reran on 9da8210: `bun run typecheck` exit 0, `AKROGON_BASE=eed65fb bun test --changed=eed65fb` exit 0 (66 pass, 614 assertions). B's `implementation/tab-closed-full-test.log` shows `bun test` 140 pass, 0 fail; format exit 0. Worktree clean.

Earlier findings stand (N1 unchanged). No defect introduced by the repair.

Verdict: ready

## Merge attempt 3

origin/main still at eed65fb; branch up to date, head 9da8210. Checks in the worktree: `bun run format` exit 0 (no changes), `bun run typecheck` exit 0, `bun test` exit 0 (140 pass, 0 fail, 1372 assertions), `test_changed` exit 0 (66 pass, 0 fail). Worktree clean before push.

## Merge attempt 4

Push of 9da8210 was rejected non-fast-forward: 8be77cd and a6b53fd landed. a6b53fd ("Update closed-tab hook to current dispatch contracts") fixes the same upstream tab_closed break as this leaf's round-2 repair 9da8210 with identical behavior (only a local alias differs). Rebase conflicted solely on that commit; resolved with `git rebase --skip`, keeping main's version. The leaf's two reviewed commits applied cleanly: head 352fe91, diff against origin/main is exactly the seven reviewed source/test files. AKROGON_BASE refreshed to a6b53fdceca8e54b7618f59cffd0beb53c2d882b.

Checks: `bun run format` exit 0 (no changes), `bun run typecheck` exit 0, `bun test` exit 0 (140 pass, 0 fail, 1372 assertions), `test_changed` exit 0 (66 pass, 0 fail). Worktree clean before push.
