# Review B: cleanup-last-in-pass

Date: 2026-11-09. Phase: check.review. Verdict: **fix**.

Base: `50d925f2d952fcfca06db529b49b9cfe21efe22c`.
Reviewed head: `a47c26959831de2d3d8a02335d20b63483c4b918`.

Reviewed the whole four-file diff against brief, design, plan and implementation report. No peer review was read or contacted. No code edits or commits were made.

## Fixes

### F1: Keep the host cleanup step when no repository is active

Priority: P2. Location: `src/next.ts:1335`.

The added `if (touched.size > 0)` skips the entire cleanup call when every registered repository is paused. A real source is the operator pausing all repositories while existing seats finish: the listener still invokes `next --wake` on their turn/exit events (`src/listen.ts:99`), but `active` and `touched` are empty. `next --resume` has the same branch. On the base, `reconcileRepos(active, invocation, true)` still executes with an empty array and reaches its unconditional `reconcileHost` call. On this head it never does.

Consequence today: host cleanup stops running, leaving failed run units, orphan slices, expired verify directories and interrupted-write temp files until some repository is active again or a manual pass runs. Atomic-write temp files are produced by `src/admission.ts:75` and `src/shell.ts:149`. The host sweep already distinguishes paused repositories through its `acting` set, so skipping the host step adds a separate behavior change.

This breaks the brief's once-per-invocation cleanup requirement and the design's explicit statement that the host step stays once per pass. The plan's D1 also specifies an unconditional post-loop call. Remove the nonempty-repository gate while retaining the existing repo selection, automatic flag semantics and lock. Add a regression case for an all-paused automatic invocation.

Concrete CLI reproduction used existing `hcFixture`, `fakeSystemctl` and `cli` helpers with a private core and isolated filesystem:

1. Create a dead-PID atomic-write leftover at `<fixture.home>/stale.2147483647.tmp`.
2. Run `pause`, then one `next --wake`.
3. Observe exit 0, the leftover still present and no host report.
4. Run `unpause` as a control. It exits 0, removes the same file and writes the host report.

Kept evidence, read back using `akrogon log`:

```text
check review-b-paused-host-cli: 1 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-review-b-paused-host-cli-1794236643917-3948814.log
{"wake":0,"leftoverAfterPausedWake":true,"hostReportAfterPausedWake":false}
{"unpause":0,"leftoverAfterUnpause":false,"hostReportAfterUnpause":true}
```

The assertion expecting the leftover to be absent after the paused wake fails. The temporary reproduction file was removed by its shell exit trap and the fixture cleaned in `finally`. This is a diff-caused failure, so no unrelated-red retry or known-red comparison applies.

Source/base trace and clean-diff evidence:

```text
check review-b-source-trace: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-review-b-source-trace-1794236668176-3968881.log
```

## Verification audit

The implementation's required verification is current and green. Receipt `28832fb4-7254-47dd-a2b0-dba962a2359c` records this exact reviewed SHA and tree, setup 0, format 0, typecheck 0 and configured test 0. Its full test run finished after the latest test/fixture edit: 1148 pass, 0 fail. No planned tests or runner settings were skipped, filtered or disabled in the diff. No proof-command correction was recorded or needed.

Read back these kept logs:

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-format-1794236463444-3554339.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-typecheck-1794236465972-3554339.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-test-1794236525694-3554339.log
check review-b-records: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-review-b-records-1794236589805-3901154.log
```

C1 and C2 each have a genuine failure on the pre-product-change code at the retained worktree assertion, followed by their planned exact command passing. The frozen criterion test file was not changed afterward. C1 asserts all removals after the releasing invocation. C2 asserts one merged attempt and no additional removal/state/terminal mutation on the second invocation. Both also pass in the final full-suite receipt.

```text
check cleanup-last-c1: 1 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-cleanup-last-c1-1794236108418-2654528.log
check cleanup-last-criteria: 1 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-cleanup-last-criteria-1794236102205-2647180.log
check cleanup-last-c1-after: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-cleanup-last-c1-after-1794236192955-2723598.log
check cleanup-last-c2-after: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-cleanup-last-c2-after-1794236196864-2727598.log
check cleanup-last-retention: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-cleanup-last-retention-1794236210492-2730884.log
```

C3's publication, live-land, working-broadcast and seat-owned completion tests remain intact. Their focused retention run has 61 pass and 0 fail, and the final configured test run covers them again. `unpausePass` uses a fresh lock after merging, cleanup discovers fresh leaves, and `mergeWake` and retention code are unchanged.

Earlier configured test failures were inspected. The outdated dead-batch refusal fixture was corrected with its design source. The door-reset and dependent-seat cases were inconsistent across runs: the reported targeted retries pass, and the later complete configured test invocation passes both. The targeted retries alone do not replace the configured command. The final whole-green receipt supplies that evidence. No known-red acceptance or base-red filing is used.

Diagnostic attempts: `review-b-receipt` exited 2 because an inspection glob named a nonexistent receipt path. `review-b-records` corrected the path. `review-b-paused-host` exited 1 before creating a fixture because importing `hcFixture` with `bun -e` invokes a test-runner hook. The subsequent temporary `bun test` reproduction above exercises the real CLI. Neither diagnostic failure is a product-check result or an abandoned capture.

## Test-Change trailers

All trailers in `50d925f2d952fcfca06db529b49b9cfe21efe22c..HEAD`:

| Commit | Trailer | Judgment |
| --- | --- | --- |
| `0aad47de` | `Test-Change: tests/batch-dispatch.test.ts cleanup-last-in-pass criteria 1 and 2: the pass whose reconcileBatch releases a landed batch must run reconcileRepos against the post-release leaf set` | Accepted. Adds the brief's two missing criterion proofs without changing an old expectation. |
| `09b563d6` | `Test-Change: tests/reconcile.test.ts design cleanup-after-release: a dead batch record is now released before cleanup runs in the same pass, so the refusal must hold under a live land unit; no existing expectation changed` | Accepted. The design explicitly permits correcting a cleanup-before-merge expectation. The live command-owned attempt still tests the batch retention veto after release is moved earlier. |
| `a47c2695` | `Test-Change: tests/reconcile.test.ts prettier formatting of the seeded command-owned batch; no existing expectation changed` | Accepted. Formatting only, as shown by its diff. The final full-suite run follows it. |

The changed-file matching rule in `src/test-files.ts` includes both existing test paths. No assertion or old test was deleted.

## Documentation and scope

Opened the behavior docs through `docs/reference-index.md`, including `docs/use/park-pause-stop.md`, `docs/reference/commands.md` and the batch section of `docs/reference/state-and-phases.md`. The changed unpause ordering claim matches the implementation. The remaining grep hits concern retention, batch reconciliation, evidence recovery or the leftovers display and contain no stale cleanup-before-merge claim. No `AREA.md` changed or was deleted, so no changed-area path listing is required. No lesson line was changed. The design's stated L1/L2 limits remain.

No Nits or operator actions. No live/paid covered operations or grants were used. The review adds only this artifact and kept logs, with no repository code changes.

## check.repair: 2026-11-09

Repaired F1, which is the same defect as review-A Fix 1. No other Fix, operator action or Nit appears in either initial review. Nothing is handed to A.

Starting reviewed head: `a47c26959831de2d3d8a02335d20b63483c4b918`.
Repaired head: `a93fec755e9b4481d96feda0001841a5eb072ca9`.

Commits:

- `b767acb6`: reproduction test, committed before the product repair. Its final trailer is `Test-Change: tests/pause-next.test.ts review-B F1 and review-A Fix 1: listener wakes while all repos are paused must retain the existing host cleanup step`.
- `a93fec75`: remove the nonempty `touched` gate from the final locked cleanup call. No additional scan, state or helper was added. The empty-repo case now reaches the existing host cleanup, while the repo loop and its pause checks retain their prior behavior.

The only new test reproduces this finding through the existing CLI fixture. It pauses the registered repository and checks host leftover removal for both `--wake` and `--resume`. Existing paused-leaf assertions were not changed. Before the repair the first invocation leaves the dead-PID temporary file behind. Afterward both invocations remove it.

Fail-before/pass-after evidence, each read back with `akrogon log`:

```text
check repair-b-host-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-host-red-1794236779326-4059995.log
check repair-b-host-green: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-host-green-1794236791620-4069782.log
```

Both use `bun test --timeout=60000 tests/pause-next.test.ts -t "automatic passes clean host leftovers"`, preceded by the configured flocked setup. The red is caused by F1, so the unrelated-red retry rule does not apply.

Because `src/next.ts` and one retention test file changed, every planned criterion proof was rerun on the committed repaired head. C1 and C2 use the exact planned filtered commands, with unchanged tests written at planning. C3 uses the planned retention command over batch-dispatch, hc-teardown and pause-next, followed by green-merge. All pass: C1 1/1, C2 1/1, retention 62/62 including the new reproduction. These planned proofs were not written by the repair seat.

```text
check repair-b-c1: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-c1-1794236817283-4090345.log
check repair-b-c2: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-c2-1794236818310-4091983.log
check repair-b-retention: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-retention-1794236829329-4090341.log
check repair-b-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-diff-1794236826986-4128329.log
```

The final repair diff contains only the regression test and removal of the gate. The working tree is clean. Fixtures cleaned through their existing `finally` handlers. No grants, live mutations, paid calls, plan changes or documentation changes were needed.

Final `akrogon verify` exited 0 on `a93fec755e9b4481d96feda0001841a5eb072ca9`. Receipt `6cde4f36-9c04-417b-8fcf-b85cc09e3e2d` records setup, format, typecheck and the configured test command all green, with 1149 tests passed and no failures. No merge checks were run. Logs were read back:

```text
check format: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-format-1794236840197-4144516.log
check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-typecheck-1794236842607-4144516.log
check test: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-test-1794236901926-4144516.log
check repair-b-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/merged-batch-cleanup/cleanup-last-in-pass/implementation/check-repair-b-final-state-1794236909383-251627.log
```

F1 and review-A Fix 1 are resolved. All planned criteria pass on the committed repair. No outstanding Fixes, Nits, operator actions or handoffs remain. Ready for the merge move.
