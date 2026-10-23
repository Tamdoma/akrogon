# Review B: record-panes-early

Base: `bd996a7ad22225d35328088e7a7d1a1bc0c95d89`
Reviewed head: `1c13b2f0864266183f6d71706d7d8acbe56bf9e2`
Verdict: **fix**

## F1 — Preserve live B in every early save

Fix, `src/next.ts:448`: the first save carries B only through `repairB`. When both recorded seats are live, `recordedA` exists, so `repairB` is undefined and this save writes only `{A: first.pane_id}`, dropping the live recorded B.

Real source: an ordinary repeated `akrogon next <leaf>` with both seats already allocated, followed by interruption during the awaited `box(first)` scope lookup. Process interruption is the recovery scenario this leaf addresses. No malformed state or synthetic input is required. The regular CLI trace below observes the damaging save without injecting a failure.

Consequence today: interruption after that save leaves B permanently unrecorded. On retry, the entry sweep cannot inspect B and `recordedB` cannot find it because state lacks its id. Allocation splits a new B while the old live pane remains. This recreates the orphan problem and violates the brief's “never drops a live recorded seat while saving” and design decision 2. The new tests cover missing-B and missing-A paths, but neither catches the ordinary both-live path.

Repair: carry the live `recordedB` in the first save even when A already exists. Keep `repairB` restricted to the swap behavior. Add a regression proving the live B record survives this early-save boundary. Plan D1's exact expression currently repeats the defect and needs correction consistent with design decision 2.

Evidence: `check review-b-live-b-save: 0 implementation/check-review-b-live-b-save-1792697501438-3567109.log`, read back with `akrogon log`. A temporary observer used the existing fixture and real `cli(... ['next', 'build'])`, allocated both seats, then watched state writes during a second normal pass. Output:

```json
{"before":{"A":"w1:p2","B":"w1:p3"},"lostLiveB":[{"pane":{"A":"w1:p2"},"oldBLive":true}],"after":{"A":"w1:p2","B":"w1:p3"}}
```

The observer and fixtures were removed. No code was changed or committed during review.

## Verification and scope

Read brief, design, plan and implementation report. Debate is off, so no positions-B or rebuttal-B artifacts exist. Reviewed the complete initial diff, allocation entry sweep, both saves, swap path, broadcast dispatch, state writing, and the documented behavior in `docs/guide/next.md` through `docs/reference-index.md`. The guide correctly documents the never-saved limit and manual `herdr pane close <pane>` action. Broadcast now goes through allocation as required.

Diff and trailers: `check review-b-diff: 0 implementation/check-review-b-diff-1792697422078-3418836.log`. All paths named by changed `tests/AREA.md` were listed from the repository root and exist: `check review-b-area-paths: 0 implementation/check-review-b-area-paths-1792697430747-3435023.log`. Both logs were read back.

Read back all three planned red-first test logs and their current green counterparts:

- Criterion 1: red `check-record-b-box-failure-1792697023520-2687445.log`; `check record-b-box-failure: 0 implementation/check-record-b-box-failure-1792697154776-2846372.log` (1 pass, 24 assertions).
- Criterion 2: red `check-record-a-box-failure-1792697028335-2691973.log`; `check record-a-box-failure: 0 implementation/check-record-a-box-failure-1792697159256-2849201.log` (1 pass, 23 assertions).
- Criterion 3: red `check-broadcast-unboxed-b-1792697032576-2696926.log`; `check broadcast-unboxed-b: 0 implementation/check-broadcast-unboxed-b-1792697162995-2852723.log` (1 pass, 12 assertions).
- Criterion 4 is asserted in both allocation tests. Criterion 5: `check guide-unsaved-pane: 0 implementation/check-guide-unsaved-pane-1792697164765-2856240.log`, read back and guide inspected.

The report's planned command names, arguments and filters match the plan. No proof-command correction, skipped planned case, changed runner configuration or stale test proof found. Green runs follow the assertion reflow. The final amend changed only commit trailers, preserving the verified tree. Existing verify evidence was sufficient, so no full-suite rerun: read back `check format: 0 implementation/check-format-1792697176630-2861605.log`, `check test: 0 implementation/check-test-1792697353447-2861605.log` (1110 pass, 0 fail), and `check typecheck: 0 implementation/check-typecheck-1792697355690-2861605.log`.

## Test-Change trailers

Judged against `src/test-files.ts`, which includes all paths under `tests/`:

- `495d6179`: `Test-Change: tests/seat-containment.test.ts adds 'a B pane whose boxing fails is recorded and replaced before the next prompt' and 'boxing a replacement A fails while B lives keeps B recorded'; no existing expectation changed`. Accepted: new cases for brief criteria 1, 2 and 4, with no existing expectation edits.
- `495d6179`: `Test-Change: tests/green-merge.test.ts adds 'a pending broadcast recreates a live recorded B outside its scope before prompting it'; no existing expectation changed`. Accepted: new case for brief criterion 3.
- `1c13b2f`: `Test-Change: tests/seat-containment.test.ts prettier reflow of the planned cases' pane-close assertions; no expectation changed`. Accepted: formatting only, same assertions.
- `1c13b2f`: `Test-Change: tests/AREA.md coverage lines updated for the new seat-containment and broadcast cases; no expectation changed`. Accepted: coverage index only.

No Nits or operator actions.

## 2026-10-22 check.repair

F1 from both initial reviews repaired. Prior reviewed head: `1c13b2f0864266183f6d71706d7d8acbe56bf9e2`. Reproduction commit: `3e6428a`. Fix commit: `c5e9874`.

The first save now carries live `recordedB`, independently of whether A needs repair. `repairB` remains the swap condition. This implements existing design decision 2, without changing the locked brief or design. Added the permitted dated implementation note to plan.md because D1's expression omitted the already-required both-live case.

The single new reproduction runs ordinary `next` twice against the existing isolated fixtures. A test-local Herdr wrapper copies state before each `pane process-info`, then delegates to the existing fake unchanged. It proves that both recorded IDs survive every scope lookup, including the awaited lookup immediately after the early save. This observes the interruption boundary deterministically without killing a process. The wrapper and copied states live under the fixture and are cleaned on success and failure. No existing test expectation was changed.

Evidence, all read back with `akrogon log`:

- `check repair-b-regression-red: 1 implementation/check-repair-b-regression-red-1792697605491-3883579.log`: before the fix, expected `{A: w1:p2, B: w1:p3}`, received `{A: w1:p2}`.
- `check repair-b-regression-green: 0 implementation/check-repair-b-regression-green-1792697615335-3948208.log`: same reproduction after the fix, 1 pass.
- `check record-b-box-failure: 0 implementation/check-record-b-box-failure-1792697623730-3988726.log`: planned criterion 1 and 4 proof, unchanged command.
- `check record-a-box-failure: 0 implementation/check-record-a-box-failure-1792697623743-3988724.log`: planned criterion 2 and 4 proof, unchanged command.
- `check broadcast-unboxed-b: 0 implementation/check-broadcast-unboxed-b-1792697623487-3988723.log`: planned criterion 3 proof, unchanged command.

All proofs affected by the changed allocation code and test file were rerun. Criterion 5's guide and inputs did not change, so its earlier green proof remains valid. The repaired behavior is accepted by the original planned proofs B did not author. Searched allocation save sites: both seat saves retain all live resolved seat IDs. No broader code changes were needed.

No Handed to A items or operator actions. A's N1 concerns layout coverage outside the done-criteria, reports no current defect, and is not adopted as a reusable Nit by B.

Final verification: `verify leaf c5e98748b9c79ae75a5e4cd2ddc410462435ffe8: green`. Read back `verify format: 0 implementation/check-format-1792697628629-3996761.log`, `verify test: 0 implementation/check-test-1792697824621-3996761.log` (1111 pass, 0 fail, 11143 assertions), and `verify typecheck: 0 implementation/check-typecheck-1792697833230-3996761.log`. No merge checks ran. Worktree clean. F1 resolved, ready for merge.
