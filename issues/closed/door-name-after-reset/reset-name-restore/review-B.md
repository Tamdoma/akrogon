# Review B: reset-name-restore

Initial `check.review`, 2026-11-14. Verdict: **fix**.

Base: `d44920b8d45e0713450b374d9f0ec18bce5a2112`.
Reviewed head: `7071124e4016bd1d4940e659d33bc74c7a1b6a39`.
Reviewed the whole diff against brief.md, design.md, plan.md and implementation/report.md, the standing design, handover.md, its skill/index pointers, and the transcript/hc consumers. No peer review was read. No code was changed or committed.

## Fixes

### F1: C4 does not prove the helper exits non-zero

`tests/door-reset.test.ts:576` calls `exited()`, whose assertions at lines 204–209 establish only that the terminal disappeared or finished. They accept the hc wait command's status 0 or 3 without reading the helper's exit status. The remaining C4 assertions inspect the stop log and absent reset/start inputs. A helper logging the same stop and exiting successfully would satisfy all these assertions.

Criterion: brief done-criterion 4 explicitly requires a non-zero exit when the rename turn remains open at the bound, and the final brief paragraph requires criteria 1–5 to be proven by the leaf's own boundary tests. The realistic scenario is the criterion's held rename turn. Its exit result currently has no test that catches failure. This is a verification gap, not a demonstrated product bug: the current shared `stop()` does call `process.exit(1)`.

Required correction: capture and assert the helper's actual non-zero exit in this existing real-core scenario, then rerun the planned `bun test --timeout=60000 tests/door-reset.test.ts` through run-check. A terminal finishing is not a proxy for failure. The report's known-limit paragraph acknowledges the proxy but does not satisfy C4. This needs a missing capture/assertion using the existing runner and hc fixture, not new proof machinery or a locked decision change.

## Verification evidence

- Read back `implementation/check-door-reset-suite-1794651857905-2818098.log` with `akrogon log`: 16 pass, 0 fail. This is the exact planned file command, after the final test/fixture changes. It proves C1–C3 and C5, and C4's stop/no-input behavior, subject to F1.
- Read back `implementation/check-c2-break-nowait-1794651660303-2780446.log`: the deliberate removal of the rename wait fails C2's turn-end-before-clear assertion. Also read the own-name/order break logs and the base suite's 11 intended failures. Expected plan-pass reds are not failing final checks.
- Read back the configured verification logs: `check-format-1794651863911-2821111.log` passes, `check-typecheck-1794651866156-2821111.log` passes, and `check-test-1794651924184-2821111.log` ends with 1183 pass / 0 fail. These are from the report's full `akrogon verify` on d31c696c. Independently confirmed d31c696c and the reviewed head have the identical tree `9e02b066643cc116680156220c5ebb2d30fdbfa6`. No test, helper, configuration or lockfile changed after these proofs. No planned command was filtered, disabled or corrected since planning.
- C6: handover.md states the name stage and ordering, own-name precedence, live tab lookup, no stored state, all three skip reasons, claude-only scope, bound stop and thrown-error stop. Its existing skill/index pointers remain valid.
- Listed paths named by the changed `tests/AREA.md` from the repo root, including glob expansion. All exist. Evidence: `check review-b-area-paths: 0 implementation/check-review-b-area-paths-1794652023764-3181468.log`. The separately named sibling paths also exist: `check review-b-area-relative-paths: 0 implementation/check-review-b-area-relative-paths-1794652061166-3214461.log`. Both logs were read with `akrogon log`.
- No checks were rerun: the unchanged tree has current green evidence. No live or paid operation or grant exists for this leaf, so no covered-launch counts apply.

## Test-Change trailers

- `790e1050`: `tests/door-reset.test.ts` cites brief criteria 1–5. Accepted: new boundary cases plus the stage-list update required by the new name stage. Existing regression cases remain.
- `790e1050`: `tests/door-agent.ts` cites criteria 2 and 4. Accepted: fixture rename turn and name carry are required by the locked design, and existing harness behavior remains.
- `7071124e`: `tests/AREA.md` cites the stand-in's rename turn/name carry. Accepted: a matching area-description change, with no expectation change. The path rule in src/test-files.ts includes this file because it is under tests/.

## Nits and operator actions

None. No reusable Nit or lesson was identified.

## check.repair — 2026-11-14

Re-read both initial reviews, the brief, design, plan and implementation report. A recorded no Fixes. B's F1 is the only Fix. The worktree is clean at the unchanged reviewed head `7071124e4016bd1d4940e659d33bc74c7a1b6a39`; the C4 test and exited() still have the missing exit-status capture described above.

No B-owned product repair is needed. No code, test, plan or design was changed, no commit was made and no proof was rerun. Earlier green evidence remains valid for the unchanged inputs, with C4's non-zero exit still unproven. No operator action is open. The peer's two deferred Nits do not require repair.

### Handed to A

- **F1 / C4:** the existing `bun:test` runner, `tests/door-reset.test.ts` reset()/exited() helpers and real `HcCore` fixture can run the held-rename scenario; capture and assert the helper's actual non-zero exit, then rerun `bun test --timeout=60000 tests/door-reset.test.ts` through run-check and update the report. Exception: check.repair assigns a criterion missing only a case, capture or recording to A. No new proof machinery, live action or locked-decision change is required.

Disposition: request `check.fix` for A to supply the missing proof capture.

## check.review re-check — 2026-11-14

Verdict: **ready**. F1 is resolved. No new Fixes, Nits or operator actions.

Original base: `d44920b8d45e0713450b374d9f0ec18bce5a2112`. Repair review base (prior reviewed head): `7071124e4016bd1d4940e659d33bc74c7a1b6a39`. Reviewed head: `c4e0ef383bbcb1b4e2b8dfa4cd9da547fb5de188`. Confirmed the prior reviewed head is an ancestor; the only repair commit is c4e0ef38 and it changes only tests/door-reset.test.ts. No branch refresh was recorded for check.fix, so no range-diff is required.

The repaired exited() parses hc wait's JSON exit_code at the boundary and returns it. C4 now asserts exit 1 while retaining the stop-log and no-reset/start assertions. A gone terminal returns null and therefore cannot falsely satisfy C4. All other callers ignore the new return value and retain their existing completion checks. The product's stop() still exits 1. No documented behavior changed in this repair, and no AREA.md changed.

Evidence read back through `akrogon log`:

- `check c4-break-exit0: 1 implementation/check-c4-break-exit0-1794652195402-3302240.log`: the deliberate exit-0 break fails the added assertion with expected 1, received 0. This establishes that the repaired proof catches the missing C4 outcome.
- `check door-reset-suite-fix: 0 implementation/check-door-reset-suite-fix-1794652203842-3305760.log`: exact planned `bun test --timeout=60000 tests/door-reset.test.ts`, 16 pass / 0 fail, including the repaired C4. This current run supersedes the old file proof for the changed test/helper.
- The reported `akrogon verify` on c4e0ef38 has green format (`implementation/check-format-1794652209063-3313561.log`), typecheck (`implementation/check-typecheck-1794652212170-3313561.log`) and test (`implementation/check-test-1794652279306-3313561.log`, 1183 pass / 0 fail) logs. No later test, helper, fixture, configuration or lockfile change exists. No planned test was disabled or filtered from the final proofs.

Repair trailer accepted: `Test-Change: tests/door-reset.test.ts brief done-criterion 4 needs the non-zero exit asserted, not just the finished terminal; hc wait's JSON carries exit_code for the --rm terminal`. It directly cites the outcome missing in F1 and adds its observation without weakening any existing assertion. The earlier trailers remain accepted as recorded above.

The worktree is clean. No additional checks were needed, no code was changed in review and no covered operation was launched. No reusable Nit remains to record. Request merge.
