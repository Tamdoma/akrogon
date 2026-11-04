# Review B: status-attention-facts

Date: 2026-11-04. Phase: check.review. Verdict: **ready**.

Base: `7f697eee16682629d75754ef90d74686ecabc565`.
Reviewed head: `f96367e65953e5f34546f807eeb672a70c0be43a`.

## Findings

No Fixes, Nits or operator actions. Reviewed the whole three-file diff against the brief, design, plan and implementation report. No code changes or commits made. Initial review performed without reading or contacting the peer.

## Criteria and contracts

- C1: `blockedBy` supplies the existing dependency labels. Only parked, missing and unreadable produce attention. The CLI fixture includes all three plus live and merged controls, with exact attention arrays and red values.
- C2: `landAttempt` gates on merge phase and command ownership. One `landAlive` result feeds both JSON land state and attention. The fact additionally excludes recorded pushes. Traced `handOff` saving seat ownership before exit, successful `batchPush` saving `recorded: true`, and `reconcileBatch` handling pending candidates. The CLI proof uses the existing systemctl seam and covers dead, active, recorded and handed-off cases.
- C3: Failed phase with and without a failure record, readiness gaps, idle prompt errors and busy prompt suppression retain their contracts. Clean leaves have empty attention and red false. `red` is derived directly from the array length.
- C4: `requiredSlots(state.phase, state.fix_rounds)` is reused and filtered by done and busy state. CLI cases cover both idle seats, a fix round, a completed seat, a busy seat, implement, merged and failed. Order remains A then B.
- C5: The unchanged envelope sum counts red leaves, unreadable entries and failed deploy. New fixtures pin totals for the new attention facts. The existing combined alert test still covers unreadable repositories and failed deploy.

Opened `docs/reference/commands.md` through `docs/reference-index.md`. Its changed JSON row accurately names both added fields. Text rendering is unchanged. No AREA.md or index pointers changed. No lesson removal or new reusable concern found.

## Verification evidence

Read the saved logs with `akrogon log`. Reused current-head evidence rather than repeating completed checks. All four criterion commands match the plan and ran after the latest test edit. No planned case, runner configuration or required check was skipped or disabled, and no proof-command correction was made.

Criterion logs under this leaf's `implementation/`:

- `check crit1: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit1-1793749223559-2953227.log`.
- `check crit2: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit2-1793749223873-2953453.log`.
- `check crit3: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit3-1793749224174-2953749.log`.
- `check crit4: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-crit4-1793749224459-2953917.log`.

C5 assertions run inside crit1 and crit2. Each criterion log reports one passing real CLI test. Read planning's missing-field red in `check-crit1-1793749044047-2624146.log`, and the deliberate condition-break failures in `check-cond1-1793749034163-2623069.log` and `check-cond2-1793749039038-2623676.log`.

Authoritative `issues/verify-runs.jsonl` records completed leaf run `0b43af07-9f39-4a37-99c0-e14da5935f75` on the reviewed head, setup 0 and all configured checks 0:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-format-1793749147361-2644339.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-typecheck-1793749149812-2644339.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-test-1793749219716-2644339.log` (1303 pass, 0 fail, 75 files).

Read all three logs. The prior format failure is resolved by the final formatting commit and the current-head green receipt. No unresolved red test or check.

Review traces:

- `check review-b-context: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-review-b-context-1793749256762-2959343.log` records the clean worktree, head, commits, trailers and changed paths.
- `check review-b-inputs: 0 /home/ivan/Work/infra/akrogon/issues/open/tasks-hierarchy/status-attention-facts/implementation/check-review-b-inputs-1793749261201-2959672.log` records the full diff and routing/test-file rules.

The read-only `review-b-fixtures` inspection exited 2 because it also queried a nonexistent worktree-local `issues/verify-runs.jsonl`. The authoritative registered checkout's receipt was found and inspected. This was a path lookup error, not a test or configured-check failure.

## Test-Change trailers

`tests/status-json.test.ts` matches `src/test-files.ts`. All commits changing that existing test file carry its trailer:

1. `673fcf0398701804184588796257898e9702bba9`: `Test-Change: tests/status-json.test.ts added attention/waits_on cases for the status-attention-facts criteria and required the new keys in the strict leaf schema; no existing expectation changed`

   Accepted. New CLI cases and required schema fields implement the brief's criteria. No old assertion was removed or weakened.

2. `8a663fa1420806a42e7f6233ad0e677e4dcd99a5`: `Test-Change: tests/status-json.test.ts quiet's absent dep is 'missing', a real attention fact under brief criterion 1; blocking on a live dep keeps it the non-red control`

   Accepted against brief criterion 1. Its required missing-dependency attention contradicts the old calm fixture. The test retains its calm assertion with a live dependency, while the new criterion case explicitly covers missing dependencies.

3. `f96367e65953e5f34546f807eeb672a70c0be43a`: `Test-Change: tests/status-json.test.ts prettier reflow of the new attention/waits_on assertions; no expectation changed, format check evidence`

   Accepted. Inspected the commit: only formatting changed. Its source is the recorded format failure, followed by the current-head green format check and fresh criterion runs.
