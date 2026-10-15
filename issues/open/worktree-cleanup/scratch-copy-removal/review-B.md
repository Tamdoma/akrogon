# Review B

Base: `dace0f7ae802db734890e43e2860a46a80d1653d`
Reviewed head: `fa9a4a79be260a10b6ef5e6b1d3eb2738d1b0690`
Verdict: **fix**

Read brief, design, plan, implementation report, affected code and tests, README, reference index, src/AREA.md, and the cleanup guide. This is an initial blind review. Debate artifacts are absent as expected for `debate: no`.

## Fixes

### F1. Closing one fd drops the entire live process from the deletion veto

Location: `src/reconcile.ts:143-149`, consumed by the scratch candidate removal at `src/reconcile.ts:457-463`.

Real source: a surviving process of this user with cwd inside a dead verify checkout, opening and closing files during ordinary work. Linux `/proc/<pid>/fd` enumeration races with those closes. The broad catch around both cwd and the entire fd loop discards the already-read cwd and every successfully read fd whenever one enumerated fd disappears. The cached scan then treats that process as absent for the whole reconcile pass.

Consequence today: reconcile force-removes a checkout still in use. This violates brief criterion 8 and plan D3/D4. A real `/proc` probe with a Python child opening/closing `/dev/null` while keeping its cwd inside the target missed that live process in 29 of 40 scans. A second probe at the actual `reconcile(repo, [], [])` boundary created a registered temporary `verify-dead-owner` checkout with no record. Pass 1 kept it for pid 233524. Pass 2 removed it while the same child remained alive, whose cwd read back as `.../verify-dead-owner (deleted)`. Neither probe used a fake proc tree. Both children were killed and awaited and all fixtures removed in finally.

Repair: preserve each successfully observed target independently. A disappearing fd must not discard a known cwd or another open fd. Add one regression reproduction covering fd churn with the process still inside the copy, shown red before and green after.

Evidence:

- `check review-B-process-veto: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-review-B-process-veto-1792101080511-30675.log`
- `check review-B-reconcile-race: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-review-B-reconcile-race-1792101104114-232763.log`

These are observation probes, so exit 0 means the probe completed, not that the product met the criterion. The second log records `exists:false`, the path in `removed`, and the surviving child's deleted cwd.

## Verification

The recorded full `akrogon verify` receipt for `8e296df8641b2c566dec11709b267e598c0526ba` is green: format 0, test 0 (856 pass, 0 fail), typecheck 0. Its tree and the reviewed head's tree are identical: `ceda1469b581ac14f8f2a1113fde5171550e946b`. The latest commit only adds a trailer, so this run postdates all test/helper changes and remains current. The configured checks were not filtered, skipped or disabled. Read back the recorded format, test and typecheck logs; no full rerun was needed.

All nine criteria have corresponding planned tests, with their green results in the full test log. F1 demonstrates that the combined cwd/fd fixture does not catch the real fd-close race. The other reviewed changes follow the scratch force rules, real-leaf-before-worker classification, failed-worker guards, and owner-before-copy ordering. No other blocking defect found.

AREA path listing:
`check review-B-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-review-B-area-listing-1792101079955-40645.log`

Every source/doc/test path listed exists. `issues/timings.jsonl` and `issues/verify-runs.jsonl` are absent in this sparse worktree because they are runtime records held in the registered checkout, not dead source pointers. README and AREA describe the intended new behavior, whose process guarantee is currently broken by F1. No area file was deleted or index pointer changed.

The installed command has no `akrogon log` subcommand (it returns Usage), so kept logs were read directly from the printed paths. Preliminary stdin/eval probe invocations were discarded after invocation errors and provide no product evidence.

## Test-Change trailers

Listed from `dace0f7ae802db734890e43e2860a46a80d1653d..HEAD`, judged against the diff and cited sources:

- `b688f9d`, `tests/reconcile.test.ts`: brief criteria 1–9, including changing ended dirty verify copies from kept to removed. The expectation change follows criterion 1's force rule.
- `b688f9d`, `tests/batch.test.ts`: brief criterion 3, new owner-before-copy case. No prior assertion removed.
- `48e3181`, `tests/reconcile.test.ts`: recorded ENOENT after completeOwner moved the owner record to closed. The case now follows the actual closed record and retains both worker assertions.
- `64ab23a`, `tests/batch.test.ts`: recorded real-home versus fixture-store mismatch. Explicit worktree_root keeps the existing build assertions in the intended isolated store.
- `8e296df`, `tests/batch.test.ts`: recorded shim not reached through runtime PATH mutation. Spawned driver supplies PATH at process creation and retains the ordering assertion, adding the actual child pid assertion.
- `fa9a4a7`, `tests/reconcile.test.ts`: formatting-only changes in `0df876b`. Diff confirms no assertion/case change.

No lesson line removals, operator actions, or deferred Nits.

## 2026-10-15 check.repair

Reviewed repair input: `fa9a4a79be260a10b6ef5e6b1d3eb2738d1b0690`.
Repaired head: `65aa12b9d8d0b2d7fa895cb5d533dcab4a48802c`.
Only review-B.md exists for this head; F1 is the sole recorded Fix.

F1 repaired in two commits:

- `0e84505`: one regression test at the `next --all` boundary, with a real Bun process whose cwd stays in a verify copy while unrelated fds open and close. It checks retention and the pid reason across ten passes, then removal after the process exits. The Test-Change trailer cites F1's actual surviving-process scenario. No existing expectation changed.
- `65aa12b`: process filesystem reads handle only ENOENT/EACCES/EPERM individually. The scan retains every successful cwd/fd observation when another read fails, and unexpected errors propagate. The shared scanner serves both reconcile and exported processesInside. Search of src found no other proc cwd/fd scanner; the readlink calls in install concern installed links, not process retention.

Fail-before/pass-after:

- `check repair-B-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-repair-B-F1-red-1792101230952-892261.log`
- `check repair-B-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-repair-B-F1-green-1792101252575-936950.log`

Both ran `bun test tests/reconcile.test.ts -t "surviving process closes"` after locked setup. Before the fix the copy disappeared on the first pass. After the fix all ten live-process passes and removal after exit passed. All spawned test children are killed and awaited in finally, and fixtures are removed in finally.

Replayed every original planned proof command, including the independent criterion-8 case B did not write. All passed: verify live/dead ownership, batch live/dead/absent ownership, merged/failed worker handling, real -u<N> leaf classification, pane vetoes, original process veto, missing verify record, and build owner-before-copy ordering. After Prettier changed only layout in the fix, reran both entire affected suites on the final committed head:

`check repair-B-final-proofs: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-repair-B-final-proofs-1792101319079-1351219.log`

Command: `bun test tests/reconcile.test.ts tests/batch.test.ts --timeout=30000`, after locked setup. Result: 45 pass, 0 fail, including every planned case and the new regression. Earlier exact-pattern command logs are `check-repair-B-criteria-1-2`, `criteria-3-4`, `criterion-5` through `criterion-9`, and `build-owner` under implementation. Read back all cited kept logs directly because the installed command lacks akrogon log, as recorded above.

The first verify on superseded `d70e8ba` caught formatting. Its test scope `351538d2-eb7c-4941-aca4-81fff5e14f06` was stopped with `akrogon stop-run` after that failure; its exit 143 is incomplete evidence, not a test verdict. Prettier's only change was wrapping targets.set. The fix commit was amended before the final proof run and fresh verify.

No Handed to A items, operator actions, or deferred Nits. No design, plan, documentation, or unrelated code changes.

Final verification: `akrogon verify` on `65aa12b9d8d0b2d7fa895cb5d533dcab4a48802c` is green, receipt `00aed892-2738-4c9e-8f8d-c0e2fc5e528a`. Format 0, tests 0 (857 pass, 0 fail), typecheck 0. Read back all three kept logs:

- format: `implementation/check-format-1792101323320-1388929.log`
- test: `implementation/check-test-1792101439819-1388929.log`
- typecheck: `implementation/check-typecheck-1792101441638-1388929.log`

Worktree clean and diff whitespace check passed. F1 resolved. Ready for merge.

## 2026-10-15 merge

Solo attempt: `6d15b1bb-6b63-4f1a-870f-95d1951d3110`.
Prior reviewed head: `65aa12b9d8d0b2d7fa895cb5d533dcab4a48802c`.
Old base: `dace0f7ae802db734890e43e2860a46a80d1653d`.
Fetched rebase target: `38d7a95722540ea3da8a9de1913d8d88431b4091` (`origin/main`).
Resolved head: `9800d9ef91b721d53511717c9b94f32423ed44a5`.

Resolved conflicts in src/reconcile.ts by retaining main's finished-slice cleanup and imports alongside this leaf's scratch ownership/force logic and procRoot import. README and src/AREA.md retain both descriptions, including main's evidence.ts pointer and cgroup override. No assertion, fixture, or test expectation changed during rebase.

- `check merge-B-rebase: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-merge-B-rebase-1792101477437-2389737.log` (expected source conflict).
- `check merge-B-rebase-continue: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-merge-B-rebase-continue-1792101489326-2443154.log` (documentation conflicts).
- `check merge-B-rebase-finish: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-merge-B-rebase-finish-1792101502279-2482194.log`.
- `check merge-B-range-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-merge-B-range-diff-1792101512267-2503733.log`.

Range-diff command: `git range-diff dace0f7ae802db734890e43e2860a46a80d1653d..65aa12b9d8d0b2d7fa895cb5d533dcab4a48802c origin/main..HEAD`. All eleven commits retained. Only the two conflict-resolved source/docs commits differ; the regression and F1 fix replay unchanged.

Installed-entry retirement helper reported `none`:
`check merge-B-retired-lessons: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/scratch-copy-removal/implementation/check-merge-B-retired-lessons-1792101512145-2503144.log`.

Merge verification on resolved head: `akrogon verify --attempt 6d15b1bb-6b63-4f1a-870f-95d1951d3110` green, merge-scope receipt `c0d9f14f-54c7-4ec2-8b47-318cfafbc836`. Format 0, tests 0 (880 pass, 0 fail), typecheck 0. Kept logs read back using the rebased CLI's log command, since the installed CLI still lacks that command:

- `implementation/check-format-1792101528356-2534624.log`
- `implementation/check-test-1792101633471-2534624.log`
- `implementation/check-typecheck-1792101635266-2534624.log`

`akrogon phase scratch-copy-removal merged --slot B --check --attempt 6d15b1bb-6b63-4f1a-870f-95d1951d3110` returned `ok`. Worktree clean. Gathered worktree-cleanup/ISSUE.md and all six owner leaf briefs before the completion call. No advisory failures or unresolved findings.

Completion returned `moved merged`. Remote read-back (`git ls-remote origin refs/heads/main`) confirms main at `9800d9ef91b721d53511717c9b94f32423ed44a5`; state.yaml confirms phase merged. No issue/epic completion line was printed, so no broadcast was due.

The command also reported: `checkout pending: error: Entry 'README.md' not uptodate. Cannot merge.; 44 behind origin/main; commit or finish the overlapping edit`. The push and leaf merge succeeded; deployment into the registered checkout remains pending its overlapping README edit. That unrelated edit was left intact.
