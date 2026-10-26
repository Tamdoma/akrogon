# Review B: one-test-run

Date: 2026-10-26. Phase: check.review. Verdict: **fix**.

Base: `672a2ab513d80e9705e17cbb3f883f57153a258f`.
Reviewed head: `5e50bb353e88c90178b11d76c6d9e07664f2f53d`.
Initial blind review of the whole diff. No peer review read. No branch edits or commits.

## Fixes

### F1: a listed nested run can bypass another repo's line

`src/admission.ts:93–101` checks the inherited record's `full` flag but never its repo. `withAdmission` passes only `holder.full` to this shortcut. The real CLI action `akrogon run-check --name test -- sh -c 'cd <other-repo-leaf>; akrogon run-check --name test -- <command>'` carries `AKROGON_RUN` into the second registered repo. When both repos list `test`, the inner run is treated as nested even while a separate holder runs in that second repo. Two listed commands of that repo then overlap and the inner run has no record.

The CLI reproduction uses two registered fixture repos and an actual held `run-check` in the second repo. Output: `other_holder_alive: true`, `inner_started: true`, with only the original second-repo holder recorded there. This violates C1's same-repo exclusion and the design's binding nesting decision: a run inside another repo's run must take its own turn. The same-repo nesting test does not exercise this path. Pass the current repo into the nesting decision and require the matching repo for a listed run, preserving same-repo nesting. Add its regression test.

Evidence, read back with `akrogon log`:

`check review-b-cross-repo-confirm: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-review-b-cross-repo-confirm-1793017769948-791443.log`

The complete temporary CLI probe is in `check-review-b-cross-repo-cli-1793017751741-791147.log`; the confirming invocation adds the existing `FULL_CONFIG` and record-reader helpers from `tests/run-permit.test.ts`. Earlier probe-construction failures are not product evidence. Temporary probes and fixture repos were removed after the runs.

### F2: stop-run without an ID does not cancel its sole waiter

`src/stop-run.ts:14–19` selects the only scoped candidate and immediately chooses its units. Only the explicit-ID branch reaches `cancelWaitingRun`. Since `liveRuns()` now includes waiting records, a user running the documented `akrogon stop-run` command from a pane with one waiting run reaches this branch. No run units exist yet. The command attempts to stop nonexistent units, leaves the record waiting, and the command eventually runs after the holder releases.

The CLI probe starts a holder and waiter in separate scopes, then calls `stop-run` from the waiter's scope. A systemctl seam represents the nonexistent-unit failure. Observed: `stop_code: 1`, attempted `systemctl --user stop akrogon-run-<waiter>.scope ...-guard.service`, and the waiter's record still `waiting`. The shim does not implement the cancellation under review. This breaks the documented optional-ID stop contract in `docs/reference/commands.md` and the new waiting-run behavior in `src/AREA.md`. Resolve the candidate in either argument form, then use the same waiting cancellation path. Add a regression test for the sole scoped waiter.

Evidence, read back with `akrogon log`:

`check review-b-stop-sole: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-review-b-stop-sole-1793017839878-797826.log`

That log contains the full probe. Both fixture runs were released and awaited, and the temporary probe and fixture repo were removed.

### F3: C1 does not prove exclusion through record removal

`tests/run-permit.test.ts:307–314` releases the holder, awaits its exit, awaits the second run, and only then checks that the holder's record is absent. This observes two eventual outcomes, not their required order. A second command starting while the first record is `ended` and its units are still stopping would satisfy every assertion. The status test proves that an `ended` row is displayed, not that admission waits for its removal.

C1 explicitly requires the second command to start only after the first record is gone. The plan claims that observation, but the test never makes it. The present product reader retains ended records correctly. The blocking gap is the missing criterion proof. Use the existing fixture command/systemctl seam to hold shutdown with the ended record present, assert the next command remains absent, then release shutdown and observe it start. Show a deliberate break of ended-record exclusion turning that case red. This needs an added case using existing machinery, not a new runner.

Trace: `check review-b-final-scope: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-review-b-final-scope-1793017853891-798518.log`.

## Verification and contracts

Read brief, design, full plan, report, ponytail, lesson rule, reference index, affected checks/config/commands docs, both changed AREA files, all product changes, tests and their changed helpers. Traced widened `liveRuns()` through all three reconcile consumers and stop-run, record liveness through the migration gate, and `checkedRun` through verify.

The report's C1–C8 commands match the plan's commands and scopes, with C5's shorter filter selecting the same sole case. No runner or configured check was skipped, filtered or disabled. Read back the nine current green criterion logs, C2 deliberate-break log, the three cited test-correction red logs, and format/test/typecheck logs. The full suite reports 1207 pass, 0 fail. Receipt `b3d8f2a8-ceda-45f1-a9a0-989fadd1c1f9` proves tree `7e9e343e12d78d17080fa942521bc5e59b1fbe64` at `34fe236a`; reviewed HEAD differs only by a trailer-only empty commit, so the receipt still applies. All recorded greens follow the last test/helper changes. No proof-command replacement was made that needs the equivalence guard. No full-suite rerun was needed for this unchanged tree.

Dependency-using review probes followed the configured locked setup:

`check review-b-setup: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-review-b-setup-1793017689377-789508.log`

Changed docs describe the requested per-repo queue, config validation, waiting table and cancellation. F1/F2 identify the mismatches. Both AREA files' named source/test/doc paths were listed from the repository root in one command per listing. Static pointers exist. Absent `issues/*` paths are registered-checkout runtime/config artifacts, not missing source pointers. The initial bare-token listing also includes example record names and schema/phase names, which are not source paths. No dead-pointer Fix is supported.

Path listing: `check review-b-real-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-review-b-real-paths-1793017648868-788449.log`.

No lesson removals, grants, outside services, credentials or operator actions. No Nits held.

## Test-Change trailers in target..HEAD

Path rule checked in `src/test-files.ts`, including `tests/AREA.md`. Listed verbatim below with judgment against the cited source.

- `d379ecc3`: `Test-Change: tests/run-permit.test.ts adds the per-repo line, nesting, kill, stop-run cancel and config-refusal cases (one-test-run plan)` — additive cases required by C1–C5/C8. Accepted.
- `d379ecc3`: `Test-Change: tests/status.test.ts adds the run-line table case (one-test-run plan)` — additive C6 case. Accepted.
- `d379ecc3`: `Test-Change: tests/leaf-slices.test.ts adds the waiting-record slice-keep case (one-test-run plan)` — additive C7a case. Accepted.
- `d379ecc3`: `Test-Change: tests/state-home.test.ts adds the waiting-record cutover-gate case (one-test-run plan)` — additive C7b case. Accepted.
- `46f9635e`: `Test-Change: tests/run-permit.test.ts inner-run wait observed on the record (outer stderr buffers it) and waiter ids resolved by leaf (queue order can differ from spawn order); tests/status.test.ts expects the real ended state instead of excluding the row` — record observation retains the nesting outcome, leaf identity fixes the wrong waiter cancellation. The cited C3/C5 red logs support both. The status path embedded later in this single trailer is separately covered by `5e50bb35` below.
- `34fe236a`: `Test-Change: tests/run-permit.test.ts 'other' renamed 'zzrepo' — lineRuns sorts by repo first, so a cross-repo break was invisible while the other repo's name sorted first (real output: c2 passed under the deliberate break)` — same C2 behavior/cases, renamed input makes removal of the repo filter observable. The kept C2 break is red and final C2 is green. Accepted.
- `5e50bb35`: `Test-Change: tests/AREA.md describes the new run-permit and leaf-slices cases (one-test-run plan docs checklist; no expectation changed)` — matches the plan's documentation checklist. Accepted.
- `5e50bb35`: `Test-Change: tests/status.test.ts expects the real ended state instead of excluding the row (real output: c6 log 1793016852053)` — C6 red output includes the ended holder. The binding design retains ended holders through shutdown, so expecting the honest ended row preserves that contract. Accepted.

## Result

Requested destination: check.repair, verdict fix. F1 and F2 are product repairs. F3 is a missing C1 case/capture using existing helpers and falls under check.repair's handoff-to-A rule.

## 2026-10-26 check.repair

Input head: `5e50bb353e88c90178b11d76c6d9e07664f2f53d`.
Repaired head: `a39d363d9eb25d02865f16441b3710e25b0e02fe`.
Read both initial reviews and the brief/design/plan/report again. A's F2 duplicates B's F1; A's F1 duplicates B's F2. No locked decision or live action changed.

### F1 repaired (also A F2)

- Reproduction commit: `36bada0` adds the cross-repo nesting leg to the existing planned C2 test, sharing its two registered repos and live holder. No existing expectation changed.
- Fix commit: `cf743ee` passes the current repo to `nested` and requires a matching repo for listed nesting. The existing unlisted nesting behavior is retained. `nested` has one caller, now updated.
- Added only the required dated implementation note to `plan.md`: D6 had omitted the design's explicit cross-repo nesting requirement.
- Fail-before/pass-after, both read back with `akrogon log`:
  - `check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-f1-red-1793018043641-803605.log`
  - `check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-f1-green-1793018058761-804718.log`
- Command in both runs: `bun test tests/run-permit.test.ts -t 'start at once over the line'`. Before: the inner command starts while its repo holder remains active. After: it waits, then runs after release.

### F2 repaired (also A F1)

- Reproduction commit: `904c707` adds one CLI case for bare stop-run with a sole scoped waiter. A systemctl seam fails and records any attempted call, so the case also verifies cancellation requires no units. No existing expectation changed.
- Fix commit: `a39d363` resolves the run once for either argument form, then applies the existing cancellation path. Empty-scope, no-match and multiple-run errors retain their behavior.
- Fail-before/pass-after, both read back with `akrogon log`:
  - `check repair-b-f2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-f2-red-1793018074776-806013.log`
  - `check repair-b-f2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-f2-green-1793018105956-807056.log`
- Command in both runs: `bun test tests/run-permit.test.ts -t 'sole waiting run without an id'`. Before: stop-run exits 1. After: it exits 0 without systemctl, the waiter exits nonzero, its command never starts and its record disappears.

### Current planned proofs

Reran every C1–C8 proof after both repairs because admission and the shared test file changed. Commands and case filters are the plan's original commands. Kept logs below were read with `akrogon log`.

| Proof | Result | Kept check line |
| --- | --- | --- |
| C1 | green, with F3 still open | `check repair-b-c1: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c1-1793018135123-807745.log` |
| C2, including F1 reproduction | green | `check repair-b-c2: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c2-1793018135201-807747.log` |
| C3 | red, see F4 | `check repair-b-c3: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c3-1793018133963-807752.log` |
| C3, identical retry | red, same assertion | `check repair-b-c3-retry: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c3-retry-1793018142980-810403.log` |
| C4 | green | `check repair-b-c4: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c4-1793018135026-807748.log` |
| C5, unchanged A-written proof | green | `check repair-b-c5: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c5-1793018135999-807749.log` |
| C6 | green | `check repair-b-c6: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c6-1793018134014-807751.log` |
| C7a | green | `check repair-b-c7a: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c7a-1793018134230-807746.log` |
| C7b | green | `check repair-b-c7b: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c7b-1793018133940-807744.log` |
| C8 | green | `check repair-b-c8: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-repair-b-c8-1793018133888-807750.log` |

### F4: C3's record assertion races the outer command's exit

The planned C3 command twice fails at `tests/run-permit.test.ts:415`: expected one record, received zero. The test's outer command runs the inner `touch` and immediately exits. The parent polls for that file every 20 ms, then counts records. By that time the correctly completed outer run may already have removed its record. There is no lifetime handshake around this observation. This code and assertion are unchanged by repair; the new repo comparison is true for this same-repo case, so its nesting path remains the same. The original C3 case was introduced in this leaf, so a known-red exemption against main would not establish its result.

This is a current failing planned criterion proof, not evidence of a product nesting defect. Preserve the one-record expectation and hold the outer fixture command alive until the count is observed, using existing `hold`/file handshakes, then release and await it. B did not change this test or its expectation. C3 needs a current green proof after A corrects that observation.

### Handed to A

- **F3, C1:** add the missing shutdown/record-removal ordering case using existing `run`, file handshakes and systemctl fixture seam. Exception: a criterion proof lacks a case/capture that existing machinery supports. Show the ended-record exclusion break red and repaired behavior green.
- **F4, C3:** correct the lifetime of the existing record-count observation using existing `hold`, `waitFor` and CLI fixture helpers. Exception: correction of an existing test/proof capture; B writes only the product-bug reproductions. Preserve both nesting outcomes and rerun the planned command.

A N1 remains a nonblocking guide omission. The guide makes no conflicting claim about waiting records, and the reference documents cancellation. It supplies no reusable mechanism to record as a lesson. No operator actions or credentials are needed. No temporary helpers remain in the worktree.

### Configured verification and disposition

`akrogon verify` on committed head `a39d363d9eb25d02865f16441b3710e25b0e02fe` finished **red**: format 0, test 1 (1207 pass, 1 fail), typecheck 0. The sole failure is F4's existing C3 count assertion, expected 1 / received 0. Its full-suite trace also confirms the record-lifetime race. Logs read back with `akrogon log`:

- Format: `/home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-format-1793018182109-811360.log`.
- Test: `/home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-test-1793018239109-811360.log`.
- Typecheck: `/home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-typecheck-1793018241688-811360.log`.

Unchanged planned proofs written by A pass on the repaired head for C1/C4/C5/C6/C7/C8. The two product reproductions also pass. Acceptance remains blocked by F3's missing C1 ordering capture and F4's red C3 proof. No known-red claim is made for a test added by this leaf. Request `check.fix` for A to complete both handed-off proof items, then rerun the affected criterion proofs and configured verification. The code worktree is clean, with one red-test commit and one product-fix commit per repaired behavior.

## 2026-10-26 check.review after check.fix round 1

Verdict: **ready**. F1–F4 are closed. No new Fixes, Nits or operator actions.

Prior reviewed base/head: `672a2ab513d80e9705e17cbb3f883f57153a258f` / `5e50bb353e88c90178b11d76c6d9e07664f2f53d`.
Prior B-repaired head: `a39d363d9eb25d02865f16441b3710e25b0e02fe`.
Current base/head: `790953873c47303bd216fa6754e30463d56b02da` / `249d01cfb63a4bc0f4073ac46e255cf976527868`.

Re-read the skill/references, brief, design, plan and report. Computed the refresh comparison independently:

`git range-diff 672a2ab513d80e9705e17cbb3f883f57153a258f..a39d363d9eb25d02865f16441b3710e25b0e02fe 790953873c47303bd216fa6754e30463d56b02da..249d01cfb63a4bc0f4073ac46e255cf976527868`

All eight original/product-repair commits match exactly (`=`). The only added commit is `249d01cf`, changing only `tests/run-permit.test.ts`. Main's changes are excluded from repair review. Original F1/F2 fixes and their reproductions are unchanged, mapped to `780c187d`/`715256ea` and `64a0be01`/`5c11b4a3` respectively. No conflict-resolution change or product regression appears in the replay.

Evidence, read back with `akrogon log`:

`check recheck-b-range: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-recheck-b-range-1793018697932-1437587.log`

### Finding disposition

- **F1 closed:** matching-repo condition and cross-repo nesting reproduction remain intact. Current C2 passes with the nested target waiting behind its own repo holder.
- **F2 closed:** both stop-run forms share candidate resolution and cancellation. Current C5 and bare-cancel C5b pass.
- **F3 closed:** the added CLI case releases the holder's command while a systemctl seam holds its shutdown, observes its record in `ended`, checks the waiter has not started after a promotion interval, then releases shutdown and observes successful completion and record removal. The intentional ended-exclusion break fails at the negative command-start assertion, not setup or timeout: `check c1-break: 1 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-c1-break-1793018509794-1133502.log`. Restored behavior passes: `check c1-removal: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-c1-removal-1793018512144-1133969.log`. Both logs were read. The interval allows the existing one-second poll to act, and makes no elapsed-performance assertion. Together with the explicit ended/shutdown handshakes and observed deliberate-break failure, this supplies the missing ordering evidence.
- **F4 closed:** C3's outer command waits on `outer-release` until its one-record assertion finishes. The original assertion and both nesting outcomes remain. Current planned C3 passes: `check c3: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-c3-1793018522909-1136266.log`.

No documented product behavior changed in A's repair, and no AREA file belongs to this repair diff. The checks reference still describes the reviewed queue contract. No test expectation was removed or weakened, no planned test or runner configuration was skipped or disabled, and no proof-command replacement needs the equivalence guard. A changed the fixture lifetime and added the missing case under the same runner.

### Current verification

Read back A's current C1, C2, C3, C4, C5, C5b and C8 logs (`1793018519889`, `1793018521449`, `1793018522909`, `1793018524288`, `1793018526628`, `1793018528003`, `1793018528233`). All are green after the latest test edit.

The refresh changed shared fixture helpers on main, so B refreshed C6/C7a/C7b with the plan's exact commands instead of relying solely on older targeted runs. All passed, and each log was read back:

- `check recheck-b-c6: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-recheck-b-c6-1793018734540-1446524.log`
- `check recheck-b-c7a: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-recheck-b-c7a-1793018734737-1446523.log`
- `check recheck-b-c7b: 0 /home/ivan/Work/infra/akrogon/issues/open/test-line/one-test-run/implementation/check-recheck-b-c7b-1793018734455-1446525.log`

Configured receipt `947ae5cd-e1d4-4613-874a-c83965750efb` matches current HEAD and tree `4b6370b95d101c9dd1f3c502617415fd91de29d3`: setup, format, test and typecheck are green. Read back `check-format-1793018533599-1138616.log`, `check-test-1793018586564-1138616.log` and `check-typecheck-1793018588951-1138616.log`. Test result: **1212 pass, 0 fail**. The receipt follows the final committed test change. No repeated full-suite run was needed.

### Additional Test-Change trailers

The prior trailer judgments remain valid through the exact range-diff matches. The three repair trailers in current base..HEAD are:

- `780c187d`: `Test-Change: tests/run-permit.test.ts reproduces review-B F1 / review-A F2: a listed run changing to another registered repo inherits AKROGON_RUN and overlaps that repo holder` — accepted against F1's traced CLI source and recorded red/green proof.
- `64a0be01`: `Test-Change: tests/run-permit.test.ts reproduces review-B F2 / review-A F1: documented bare stop-run from a pane with one waiting run tries nonexistent units instead of cancelling` — accepted against F2's documented CLI action and recorded red/green proof.
- `249d01cf`: `Test-Change: tests/run-permit.test.ts adds the ended-record ordering case (B check.repair F3, shown red under the ended-exclusion break in check c1-break 1793018509794) and holds leg A's outer command until its record is counted (B check.repair F4 race)` — accepted against the deliberate-break log and the prior C3 red logs. The one-record expectation is preserved.

No reusable Nit is held, and no lesson changes are needed. Requested destination: merge, verdict ready.
