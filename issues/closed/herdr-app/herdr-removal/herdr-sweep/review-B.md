# Review B: herdr-sweep

Date: 2026-11-08
Base: `47186f909bd5dd8fb7373dc9f9b82b28889dccc5`
Reviewed head: `f672fb781cfdc82cb17aead387c7336ded752383`
Verdict: **fix**

## Fixes

### F1 (P2): Restore the required non-JSON stderr regression coverage on hc

Location: `tests/shell.test.ts` (deleted `retryable is false on non-JSON stderr without throwing`), `src/hc.ts:70-80`, plan D7 and Implementation notes.

The binding design's Standing design says that a test guarding a past regression must not be dropped while its behavior exists on hc. D7 explicitly plans the hc counterpart. The implementation deletes the test and supplies no counterpart. The implementation note says that hc has no retry-on-code, but the retained behavior is preserving an outside CLI's non-JSON stderr without a parser exception. That behavior still runs through `hc() -> errorKind() -> HcError`. The report and the updated history both acknowledge the missing coverage.

Actual source: the CLI panic, usage-error and socket-failure stderr described in `learnings/history/2026-09-10-stderr-json-parse.md`, now consumed at the hc process boundary. Consequence today: the migration removes the regression guard required by the binding design while retaining the same parsing boundary. This is a contract violation, not a request for extra coverage of an unrelated case.

Required change: restore D7's one process-boundary case proving that plain stderr with exit 1 yields `HcError`, kind `exit 1`, and the original stderr rather than `SyntaxError`. Use the existing Bun runner and driver-child pattern. Show a deliberate break of the guard makes the case red, restore the implementation, and record current green evidence. Update the implementation note/report to match. This is the existing planned case, not new proof machinery.

Evidence: `check review-b-final-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-review-b-final-evidence-1794129850301-3871606.log` records the deletion and the conflicting D7 note. The hc code and regression history were read directly. No existing hc test asserts this outcome.

### F2 (P2): Run the checkout backup verification in the herdr repository

Location: `implementation/report.md`, C4, Checkout step, Save command block.

The report creates an incremental herdr bundle with `git -C ~/Work/infra/herdrdev/herdr bundle create ... --branches --not --remotes=origin`, then verifies it with bare `git bundle verify ...`. The second command checks prerequisites in the caller's current repository. The report sets no working directory.

Actual source: the operator executing the published removal checklist from the Akrogon worktree. I created a temporary bundle from the actual named herdr checkout using the report's arguments. Creation exited 0. The report's verification from this worktree exited 1 with `Repository lacks these prerequisite commits` and listed `9a4ce5e13c1d4622ca63c2947d0eaa018ec35715` and `d78e3d3b51266a1ff80ae6858b894e782aac3e9f`. Verification of the same bundle in the herdr repository exited 0 and printed `is okay`.

Consequence today: the supplied save-before-delete check fails from the review/leaf workflow's current directory, preventing the required backup confirmation. This hits brief criterion 4 and design Q3's verified save before checkout deletion.

Required change: use `git -C ~/Work/infra/herdrdev/herdr bundle verify ~/herdr-local-$(date +%F).bundle` in the report, and retain the save-before-delete condition.

Evidence, read back with `akrogon log`: `check review-b-bundle-command: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-review-b-bundle-command-1794129786966-3708045.log`. This diagnostic wrapper records both verification exits. The temporary bundle and directory were removed on exit. No source checkout, branch, stash, machine config or installed runtime was changed.

## Verification and criteria audit

The authoritative readiness record `issues/chart/herdr-app/forks/e2e-proof.md` was read from the registered checkout. It records the suite, window/kinds/watcher runs, consultant round, real leaf lifecycles and mod-build observation before this sweep. The issue record is outside the reviewed code commit, so an attempted `git show` was not used as evidence.

- C1: the install/deploy diff removes all old-herdr service calls and mod creation, retaining the existing owned-link prune. The process/deploy tests cover no-call, no-mod-link, removal of the actual current-based Tasks link, and preservation of foreign links and real directories. Current proof: `check c1-install-deploy-2: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-c1-install-deploy-2-1794129533648-3296479.log`, 33 pass. Read back through `akrogon log`.
- Current configured verification receipt: run `7d29438e-519b-485c-9a41-0083b31dddae`, reviewed head and tree `061f782e17e8d36c189043f0e8e7a8f6e88efb57`, setup 0, all three commands exit 0. Format: `check-format-1794129536195-3299032.log`. Typecheck: `check-typecheck-1794129538455-3299032.log`. Test: `check-test-1794129596400-3299032.log`, 1135 pass, 0 fail, 80 files. All are under this leaf's `implementation/` and were read with `akrogon log`. The configured commands match the plan and receipt. No runner configuration was changed. The green current-head run follows the latest test/helper edits and the rebase.
- C2: the current grep log `check-c2-grep-2-1794129603264-3562196.log` and the scoped source/doc/skill hits were read. Remaining terms are current herdr-core/herdr-app names and labels, old-state/rollback history, recording stubs, cleared legacy env names or recorded fixtures. No remaining old-herdr runtime call was found. The rollback guard remains.
- Changed documented behavior was checked against `docs/start/install.md`, `docs/reference/releases-and-updates.md`, `docs/reference/state-and-phases.md`, `docs/reference-index.md` and affected workflow pages. Both changed AREA files had their named paths listed from the repository root. All concrete paths exist. Pattern references are patterns, not dead pointers. Trace: `check review-b-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-review-b-area-paths-1794129716385-3587906.log`, read back. Deleted Tasks files and their removed index pointers match the design.
- C3: reviewed the lessons diff without reading the active LESSONS file as review input. The CLI parsing lesson is generalized with its history retained. The plugin-cwd mechanism is removed on every shipped path and has its matching Applied history entry. The headless-window lesson is unchanged. F1 concerns the independently binding regression-test retention rule.
- C4: inventory and removal checklist cover the required categories, infra Tasks symlink and checkout save listing. F2 blocks the executable backup check. The earlier stopped inventory is not treated as a completed proof by itself.
- C5: current test duration is `57935 ms` in timings, matching the report's 57.9 s against the 75 s median baseline. No increase requires explanation.
- No paid/live grants exist and no covered operation was launched in this review. No env values were opened. Current full checks were reused because there was no code change or unresolved concern requiring a rerun. The temporary local bundle was a filesystem-only command reproduction.
- An optional character-level diff diagnostic was stopped by its exact run id `8b5c83a1-9ee8-4041-b389-ae9ba12063b2` after it proved inefficient. It completed capture with `check review-b-semantic-diff: 143 .../check-review-b-semantic-diff-1794129802896-3598534.log`. It ran no tests or fixture mutations and supplies no proof. The diff was inspected directly and with a completed token-level comparison instead.

## Test-Change audit

All changed existing test paths match `src/test-files.ts` and have trailers in `47186f909bd5dd8fb7373dc9f9b82b28889dccc5..HEAD`. Install/deploy expectation changes cite C1/D1/D2, the required outcome. Tasks tests cite the explicitly deleted mod. Other changes remove the obsolete fixture, its database/call assertions or rename its retained process environment. The pinned rollback predecessor still calls old herdr and now has a recording stub. These sources support the batch except for `tests/shell.test.ts`'s regression deletion (F1). No planned check is skipped, filtered or disabled. No proof-command replacement is claimed.

Exact trailers follow, grouped by commit.

### 87523ea0

- Test-Change: tests/install.test.ts plan.md C1 and D1/D2: no-call and no-mod-link expectations replace the herdr call lists and the mod link assertions; adds the mods/tasks prune case; deletes "install from a listener release succeeds with no herdr binary on PATH" (install makes no herdr call, so a missing herdr is not a separate path)
- Test-Change: tests/deploy-shapes.test.ts plan.md C1 and D1/D2: no-call expectations replace the plugin link and unlink calls; adds the deploy mods/tasks case; deletes "a listener release deploys with no herdr binary on PATH and skips the unlink" (same reason)
- Test-Change: tests/helpers.ts plan.md C1: adds herdrStub and herdrCalls, a recording herdr for no-call assertions

### 71761d83

- Test-Change: tests/tasks-mod.test.ts deleted: brief "the Tasks mod: herdr-app/tasks/, tests/tasks-mod.test.ts, tests/tasks-mod-host.test.ts" (forks/config.md Q2); the mod is deleted
- Test-Change: tests/tasks-mod-host.test.ts deleted: same brief item; the mod is deleted
- Test-Change: tests/self-update.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures ...": fake herdr setup removed, deploy makes no herdr call (D1); no expectation changed
- Test-Change: tests/release-deploy.test.ts brief "tests: ... tests of removed behavior": plugin link call assertion removed, deploy makes no herdr call (D1); tests/deploy-shapes.test.ts proves no call

### 10148cd3

- Test-Change: tests/AREA.md brief "wording: ... AREA files ... describe herdr-core and herdr-app": fake herdr, Tasks mod and deploy-shapes lines rewritten for the end state; no test expectation changed

### 952008ff

- Test-Change: tests/fake-herdr.ts deleted: brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason"; src makes no herdr call
- Test-Change: tests/helpers.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr/HerdrFixture replaced by procFixture/ProcFixture without herdr link, herdr.json, FAKE_HERDR or db
- Test-Change: tests/isolation.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fake herdr bundle build and fakeHerdrBin deleted
- Test-Change: tests/hc-fixture.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": notices-only fake herdr deleted (notices run on hc); creates <home>/bin and the proc root directly
- Test-Change: tests/deploy-fixture.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": uses procFixture
- Test-Change: tests/shell.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": cases for removed herdr, herdrError, retryable and paneSchema deleted (functions removed from src/shell.ts)
- Test-Change: tests/phase.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": herdrCalls helper and its three call-log assertions deleted (vacuous); fakeHerdr renamed procFixture (no fake herdr); herdr-unreachable test renamed
- Test-Change: tests/status.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": three herdr.json.calls absence checks deleted (vacuous); fakeHerdr renamed procFixture (no fake herdr); busy-durations test name drops "herdr calls"
- Test-Change: tests/status-json.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": herdr.json.calls absence check deleted (vacuous)
- Test-Change: tests/next.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": herdrDb helper and its two database reads deleted (vacuous)
- Test-Change: tests/session-routing.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fake herdr session seeds, herdrCalls, herdrOther, HERDR_SOCKET_PATH stale entries and their call-log assertions deleted; land-unit case keeps its env probe, renamed
- Test-Change: tests/park.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": local fake herdr deleted; next --all runs with no herdr env
- Test-Change: tests/merge-attempts.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr); hcHerdr renamed hcProc returning { env: f.env }
- Test-Change: tests/batch-merge.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/abandoned-capture.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/close-pack.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/durable-capture.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/receipt-gates.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/slow-merge.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/store-sweep-safety.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr)
- Test-Change: tests/verify.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": fakeHerdr renamed procFixture (no fake herdr); PATH dir noherdr renamed nohc
- Test-Change: tests/green-merge.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": land-socket test name calls HERDR_SOCKET_PATH an old herdr socket
- Test-Change: tests/rollback.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": the pinned pre-hc predecessor's install calls herdr; herdrStub answers it now the deploy fixture has no fake herdr
- Test-Change: tests/e2e/watch-tier.ts brief "tests: tests/fake-herdr.ts, herdr fixtures and tests of removed behavior, each deletion with its reason": /usr/bin/false herdr link deleted (no akrogon code calls herdr)

### f672fb78

- Test-Change: tests/install.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures ...": the self-update fixture's fake herdr link, herdr.json seed and FAKE_HERDR env removed (tests/fake-herdr.ts is deleted; deploy makes no herdr call); no expectation changed

## Operator actions

None. F2 is a correction to the report, not permission to execute machine removal.

## Nits

None.

Requested transition: `check.repair`, slot B, verdict `fix`.

## check.repair — 2026-11-08, slot B

Reviewed both initial reviews on `f672fb781cfdc82cb17aead387c7336ded752383`. A has no Fixes. B's F1 and F2 are the complete repair list.

### Repaired

F2: corrected the C4 operator checklist's backup verification command to pin the herdr repository.

Before:
`git bundle verify ~/herdr-local-$(date +%F).bundle`

After:
`git -C ~/Work/infra/herdrdev/herdr bundle verify ~/herdr-local-$(date +%F).bundle`

The existing review reproduction supplies before evidence: `check review-b-bundle-command: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-review-b-bundle-command-1794129786966-3708045.log` records verification exit 1 from this worktree.

After evidence: `check repair-b-f2-proof: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-repair-b-f2-proof-1794130064483-3966711.log` read the corrected command from the report and ran it from this worktree against a temporary bundle created from the actual herdr checkout. Only the bundle destination was replaced by a TMPDIR path. Verification exited 0 and printed `is okay`. The temporary bundle and directory were removed. Both logs were read back with `akrogon log`.

C4's planned report observation now contains the corrected check and retains the operator's confirmation before deletion. This repairs the deliverable's operator command, not a plan proof-runner correction.

Commit: `ad275d686f9047fba886cc30042ae9fd26b3fd29` on the registered checkout's `main`, changing only `issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/report.md`. The report was previously untracked, so the record commit adds that report including its one-line correction. No push. Commit evidence: `check repair-b-f2-commit: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-repair-b-f2-commit-1794130076138-4013725.log`, read back.

### Handed to A

- F1: missing D7 regression proof case, required by the design's regression-retention rule. Exception: the proof lacks a case that the existing Bun runner and driver-child pattern can run. Add the hc non-JSON stderr case, demonstrate it goes red when the parse guard is deliberately broken, restore the guard, record current green evidence, and update the plan's implementation note, report and affected lesson history to name the case. No new proof machinery or design change is needed.

### Verification and disposition

The code worktree stays clean at `f672fb781cfdc82cb17aead387c7336ded752383`. C1/C2/C3/C5 proof inputs are unchanged, so their earlier evidence remains. C4 was re-observed after the correction. No full verification or merge checks were run for this artifact-only repair and check.fix handoff. No test file changed, so no new Test-Change trailer is required.

No operator actions, paid operations, live mutations or unresolved fixture cleanup. A's N2-N4 remain deferred and were not expanded into repair work.

Next move: `akrogon phase herdr-sweep check.fix --slot B`.

### Actual handoff result

The phase command committed `check.fix` and incremented `fix_rounds` to 1, then exited 1 because its run-check wrapper removed `XDG_RUNTIME_DIR` before the logging/dispatch follow-up. This did not undo the move: `check repair-b-handoff: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-repair-b-handoff-1794130124463-29017.log`.

Recovered with `akrogon next herdr-sweep`, supplying the parent runtime path explicitly through `env XDG_RUNTIME_DIR=...` inside run-check. `check repair-b-resume: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-repair-b-resume-1794130154026-53955.log`, read back, completed successfully. Normal next self-update pushed the one report record commit `ad275d686f90` and deployed that record-only main revision. This supersedes the earlier "No push" status at commit time.

Final state read-back: `phase: check.fix`, `fix_rounds: 1`, `attempts.A: 1`, `prompted.A: {turn: 4, address: t6s}`, no delivery error. Evidence: `check repair-b-dispatch-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-repair-b-dispatch-evidence-1794130165319-59795.log`. A has the next repair prompt.

## check.review re-check — 2026-11-08, slot B

Prior reviewed base/head: `47186f909bd5dd8fb7373dc9f9b82b28889dccc5` / `f672fb781cfdc82cb17aead387c7336ded752383`.
Handed-off base/reviewed head: `ad275d686f9047fba886cc30042ae9fd26b3fd29` / `083185aadf981f3cb8e1650ed23e7cb9e05fc386`.
Verdict: **ready**.

### Repair scope

Computed `git range-diff 47186f909bd5dd8fb7373dc9f9b82b28889dccc5..f672fb781cfdc82cb17aead387c7336ded752383 ad275d686f9047fba886cc30042ae9fd26b3fd29..083185aadf981f3cb8e1650ed23e7cb9e05fc386`.

All six original commits compare equal after the rebase. Only `b06b5abc` (the regression case) and `083185aa` (its history pointer) were added. Reviewed `a7ca78e7..083185aa` as the repair, excluding main's report-only commit. No conflict resolution or product-code change was introduced. Worktree is clean. Evidence, read back: `check recheck-b-range: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-recheck-b-range-1794130346549-617163.log`.

### Earlier findings

- F1 resolved: the new driver-child case exercises the actual `hc()` wrapper and `errorKind()` through a process boundary. It asserts `HcError`, kind `exit 1`, and the exact raw stderr. The process stub supplies the external CLI error, without mocking the parsing function under test. Temporary paths use `registerTemp`. The history now names the case and the plan's dated note corrects the earlier omission.
- F2 remains resolved: the report retains `git -C ~/Work/infra/herdrdev/herdr bundle verify ...` and the operator-confirmation condition before deletion. The prior before/after bundle proof remains valid.

### Verification

F1's recorded green case was read with `akrogon log`: `check f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-f1-green-1794130189697-67615.log`. The deliberate guard removal produces the intended failure, `AssertionError: SyntaxError: JSON Parse error`: `check f1-break: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-f1-break-1794130195724-69146.log`. The guard is restored in the reviewed tree. This is the requested deliberate-break proof, not a configured red check.

Current verify receipt `b8bb9540-a576-44bf-8a64-f17156ea5715` matches head `083185aa` and tree `e95caaca1ff62e300931a9ca80d8459216c419cf`, with setup 0 and every configured command green. Logs, all read with `akrogon log`:

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-format-1794130221418-79099.log`.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-typecheck-1794130223666-79099.log`.
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/check-test-1794130294341-79099.log`, 1136 pass, 0 fail, including the new hc case. This full run follows the final test and history commits.

The targeted `-t` command isolates the deliberate-break proof. The required configured suite runs unfiltered and still covers the planned tests. No runner, helper, fixture or config was altered by the repair. C2/C3 rerun logs were inspected and agree with the report. C1 inputs are unchanged and its cases also pass in the current suite. C5 records 70665 ms against the 75 s baseline. No rerun is needed for this unchanged reviewed head.

No documented product behavior changed. The only changed history claim names the test that now exists. No AREA file changed in the repair. No plan proof-command correction or red-merge repair is involved.

### Test-Change audit

The original trailer list above remains applicable through the six equal range-diff pairs. The only new trailer is justified by F1, D7 and the binding regression-retention rule. No existing expectation was changed:

`Test-Change: tests/shell.test.ts adds "hc plain-text stderr rejects with HcError kind exit 1 carrying the raw stderr"; design Standing design "no test that guards a real past regression is dropped while its behavior still exists on hc (its hc counterpart is named)" and plan D7, review-B F1; no existing expectation changed`

No new Fixes, Nits, operator actions or covered launches. Both earlier Fixes are closed. Requested move: `merge`, slot B, verdict `ready`.
