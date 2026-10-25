# Review B: session-reads

Date: 2026-10-24. Phase: check.review. Verdict: **fix**.

Base: `842c85cf668a1667fa63454bec7e58d88d09beff`.
Reviewed head: `416d2d89a7d9e1ff3c45b8e96112d40f725eb5f1`.
The report names `fb1dc3d`; the later head adds only a trailer-only commit and has the same tree. Initial review was blind. Debate is off, so no positions/rebuttal artifacts apply.

## Fixes

### F1. Cross-session tab-id collision defeats the worktree keep-veto

`src/next.ts` projects the tagged session inventory to `Pane[]` before passing it as reconcile's union. `src/reconcile.ts:265` then treats a pane at the worktree root with `pane.tab_id === state.tab` as the leaf's own closing pane, regardless of its session. The new union callers at lines 789, 854, 1004 and 1091 inherit this mistake.

Realistic source: a user keeps a pane at a leaf worktree root in another running Herdr session while the leaf becomes merged or failed. Herdr's session-local tab ids can coincide, the exact collision the brief and design require handling. Trace: per-session pane list → `sessionPanes` → untagged `allSessionPanes` → `reconcile(..., union)` → `foreignPaneInside` excludes the foreign pane → worktree removal. No malformed input is needed.

Consequence today: `next --all` removes the checkout from under that pane and clears its recorded worktree. This violates criterion 2's requirement to keep a worktree whenever any session's pane has cwd inside it. The existing criterion test checks a foreign pane and an unrelated same-id tab separately, missing their combination.

Concrete proof: copied `tests/session-reads.test.ts` into a temporary directory under `$TMPDIR`, changed only the foreign kept-by-pane tab id `w9:tF` to the leaf's recorded `w1:tK`, resolved imports to the existing worktree modules, and ran the existing criterion-2 test through the real CLI/fake-Herdr boundary. Result: expected worktree existence `true`, received `false` at the first keep assertion. Temporary files were removed. This directly exercises a named criterion, and the input source is the normal cross-session inventory above.

Evidence, read back with `akrogon log`:

`check review-B-collision-proof: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-review-B-collision-proof-1792876752147-1064559.log`

The red has a direct cause in the changed union routing, so the unrelated-red retry/known-red rule does not apply. Repair must preserve session identity for the own-tab exemption, or otherwise restrict that exemption to panes from the resolved session. Cover all `foreignPaneInside` union callers and retain eligible own-session closes. Add a regression for the combined collision/cwd case.

## Verification and scope

Read brief, design, plan, report, ponytail, reference index, affected AREA pages, the command reference and plugin event wiring. Inspected the complete product diff and changed existing tests. No code changes or commits made during review.

`akrogon verify` on the reviewed head exited 0 and reused receipt `9b7ae3b8-6186-4276-82fa-9aa38ce89048`, tree `f9c2c95c6935b0275582c86eaef80d905d764a24`. Read its logs through `akrogon log`: format 0, typecheck 0, test 0 with 1142 passing tests. Logs:

- `implementation/check-format-1792876408692-255554.log`
- `implementation/check-test-1792876612797-255554.log`
- `implementation/check-typecheck-1792876615261-255554.log`

Read back `implementation/check-session-reads-proof-plain-1792876332075-142234.log`: seven criterion tests passed. The report consolidates the plan's filtered commands into one unfiltered invocation of the same file, preserving all cases. No configured runner, test or assertion was disabled. Those green results do not cover F1's combined criterion-2 scenario.

The AREA path listing was run from the repository root and read back:

`check review-B-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-review-B-area-paths-1792876739961-1044788.log`

All referenced code/test/doc paths exist. Missing `issues/closed`, `issues/timings.jsonl`, `issues/verify-runs.jsonl`, `issues/config.yaml` and `issues/merge-attempts.jsonl` are authoritative runtime/record paths outside this sparse worktree, not newly broken pointers. No present dead-pointer consequence found. The new AREA statement that tab ids are trusted only inside the resolved session is contradicted by F1's cwd exemption. No other human command contract changes were found.

## Test-Change trailers

Listed from `842c85cf..HEAD` and judged against the brief's event-origin contract and `src/test-files.ts`:

- `4a18b83b`: `tests/next.test.ts` — hook invocations carry `HERDR_SOCKET_PATH` and `workspace_id`. Valid: event ids and origin are now required by criteria 4–6. Env-only hook simulations become event-based simulations, retaining assertions.
- `2c7cfd92`: `tests/pause-next.test.ts`, `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts` — hook gate invocations carry socket/workspace. Valid for the same boundary change. The corrected `w2` event workspace in the release test now matches its actual `w1` fixture, preserving its slice behavior assertion.
- `fb1dc3d`: `tests/pause-next.test.ts` — formatting only, no expectation change. Valid.
- `416d2d89`: `tests/AREA.md` — document the new suite, no expectation change. Valid because the path rule includes the entire `tests` segment.

## Operator actions

None. No live Herdr calls or paid actions were made. No reusable Nits remain.

## 2026-10-24 check.repair

Repair base: `416d2d89a7d9e1ff3c45b8e96112d40f725eb5f1`. Repaired head: `50c91f47218a1cf55f82fbefcd0c41d799b43be2`.

Both initial reviews were read. No locked brief/design change, operator action, expectation correction or proof-command correction was needed. No item is handed to A.

### Review A capacity Fix

Reproduction commit `d4a0628a49c2a906a3ed98e27f44b2f93c122dd3` adds one CLI-boundary regression with an unreadable running session and no seated leaves. Before the fix it exits 1 after reaching allocation instead of waiting before any worktree is allocated. This proof does not claim that the second-seat guard allowed a tab launch: that later guard still refuses the unreadable session. The defect is the missing capacity observation and unknown-inventory guard required by plan D2.

Fix commit `31e231556f15c2bec2c7ecd755aa5b5f88a7faa3` removes `needs` from the resolved-repo union-read condition. Every resolved repo now checks unreadable sessions and unknown inventory before allocation. Refused-repo counting retains the existing `needs` rule.

Same reproduction command before and after: `bun test tests/session-reads.test.ts -t "before any leaf has a seat"`, preceded by the configured locked setup. Evidence read back with `akrogon log`:

- `check repair-B-capacity-red: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-repair-B-capacity-red-1792877715707-2616739.log`
- `check repair-B-capacity-green: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-repair-B-capacity-green-1792877723642-2630818.log`

### Review B F1

Reproduction commit `6d2e3691b9e6efb64abd8ad42b183d095970a127` adds one CLI-boundary regression covering both merged and failed worktrees, with foreign-session panes at their roots and colliding recorded tab ids. Both inventories are normal fake-Herdr session responses. Before the fix the merged checkout is deleted.

Fix commit `50c91f47218a1cf55f82fbefcd0c41d799b43be2` keeps `SessionPane` tags through the cached inventory and both reconcile entry paths, including unpause. Reconcile derives own-session and foreign-session cwd views from that tagged inventory. Only own-session panes receive the closing-tab root exemption. All four `foreignPaneInside` call sites use the corrected helper. Host cleanup still receives the untagged projection because it applies no own-tab exemption. Existing direct reconcile callers omitting the union keep their scoped-only semantics.

Same reproduction command before and after: `bun test tests/session-reads.test.ts -t "colliding tab ids"`, preceded by the configured locked setup. Evidence read back with `akrogon log`:

- `check repair-B-collision-red-final: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-repair-B-collision-red-final-1792877739704-2645777.log`
- `check repair-B-collision-green: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-repair-B-collision-green-1792877800102-2702655.log`

After the final product change, all nine tests in `tests/session-reads.test.ts` pass, including the seven pre-existing planned criterion proofs B did not write. This reruns every criterion because the shared input changed. The command runs the entire file without filtering, preserving the prior accepted proof scope, with the configured locked setup first:

`check repair-B-criteria: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-repair-B-criteria-1792877842476-2713363.log`

Both reproduction-test commits carry a `Test-Change` trailer citing their finding and realistic source. No existing test, fixture or assertion was changed. All new test fixtures clean up in `finally`; no temporary helper remains. The worktree is clean and `git diff --check` passed.

`akrogon verify` on repaired head `50c91f47218a1cf55f82fbefcd0c41d799b43be2` exited 0: format 0, test 0 (1144 pass, 0 fail), typecheck 0. Receipt: `09eb6235-740e-4f03-b203-511306c380d7`. Read back the logs with `akrogon log`:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-format-1792877855046-2723637.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-test-1792878076130-2723637.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/implementation/check-typecheck-1792878079578-2723637.log`

Both initial Fixes are repaired. No remaining Fix, reusable Nit, operator action or handoff to A. Ready for merge.
