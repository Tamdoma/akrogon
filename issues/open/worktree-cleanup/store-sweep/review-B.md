# Review B: store-sweep

Date: 2026-10-16. Phase: check.review. Verdict: fix.
Base: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307.
Reviewed head: 0ab2552078bbafb7cf9bb4c7a2cc2c52706d6625.
Initial blind review. No peer review read. Debate is disabled, so positions-B.md and rebuttal-B.md do not exist. No code changes or commits.

## Evidence

- `check review-b-diff: 0 implementation/check-review-b-diff-1792104775935-3266460.log` records the product diff.
- `check review-b-scenarios: 0 implementation/check-review-b-scenarios-1792104813815-3288649.log` records the probe source and observed outcomes. Exit zero means the observation script completed, not that the criteria passed.
- `check review-b-running: 0 implementation/check-review-b-running-1792104833543-3298663.log` repeats those observations and adds the finished/live-tab case. Read back with `akrogon log` using the absolute leaf-prefixed path. All probes use disposable existing fixtures, isolate HOME and both temp roots, and clean fixtures and explicitly owned child PIDs.
- `check review-b-proof-context: 0 implementation/check-review-b-proof-context-1792104791992-3278207.log` includes the single-command listing of paths named by changed `src/AREA.md`. Every listed path exists. Read back with `akrogon log`.
- Current-head verify receipt `a8a108d8-7b22-45c8-8ff3-488400136bb8` records format, test and typecheck exit 0. Read back absolute leaf log paths for `check-format-1792104627059-2857863.log`, `check-test-1792104739702-2857863.log`, and `check-typecheck-1792104741739-2857863.log`. Test log: 901 pass, 0 fail. No checks rerun because current evidence exists and code was unchanged.
- Implementation's combined sweep-tests command covers the planned files. It does not demonstrate that each planned filtered command was replayed. In particular the planned C6 filter `vetoes` matches no current test title. Current full-suite evidence covers the actual process/pane test, but misses the failures below. The busy-slice case keeps a live tab during its only occupied assertion, so the tab guard masks the slice guard. C1 checks dangling symlinks with existsSync, which cannot detect their survival.

## Fixes

### F1. Dangling symlinks are skipped and hidden

`src/reconcile.ts:624` skips a candidate when existsSync returns false, which is exactly what it returns for a dangling symlink. Host leaf-temp enumeration similarly skips statSync-undefined entries at line 987. Report pruning and leftovers existence checks also hide these surviving links.

Source/outcome: criterion 1 explicitly requires deletion of dangling symlinks in both store and legacy root. Probe `dangling` creates that exact candidate and runs reconcile on a zero-leaf fixture. lstatSync reports it still present and reconcile returns empty removed/kept arrays. This fails criterion 1 today. Use entry-aware existence checks through enumeration, pruning and display. Correct the planned symlink assertion to detect the directory entry itself, with this criterion as its source.

### F2. Leaf-owned deletion bypasses the process veto

`src/reconcile.ts:693-708` drops a finished leaf's unregistered `<slug>-*` entry after pane checks without checking pidsInside. The leaf-temp removal at lines 782-805 also calls drop without that veto. The common drop helper validates deletion results but has no safety checks.

Source/outcome: criterion 6 explicitly requires retaining any candidate containing a same-user process cwd/open file, including processes outside the leaf slice. Probe `leaf-process` runs a real sleep process with cwd inside `done-old` for a merged leaf with no tab. Reconcile deletes that directory while the child remains live, reporting it removed with no keep. This fails criterion 6 and plan D5. Route these deletions through the common safety decision while retaining the explicit dead-owner-run exception.

### F3. Parent cleanup ignores live descendant owner records

`src/reconcile.ts:949-950,973-989` recursively deletes retired/unregistered host temp parents without inspecting descendant run or batch owner records. Pane/process location is not proof that an owner record is dead.

Source/outcome: criterion 4 says a live-owner run stays in every case, including when its enclosing folder would otherwise go. Probe `host-owner` seeds an unregistered-repo temp parent with a run whose owner is the live probe process, located outside that tree. reconcileHost deletes the parent and live run. This directly fails criterion 4. Apply owner protection before every recursive parent deletion, including the retired root and store parents.

### F4. Repository activity is inferred from phase instead of live tabs/slices

`src/reconcile.ts:581` defines repoRunning as any unfinished leaf. Plan D3 and the design define it as a live tab or slice with a running unit, across all leaf records.

Source/outcome: criterion 3 protects unowned entries while any leaf runs, including a merged seat finishing its final turn. Probe `finished-tab` supplies a merged leaf with its recorded live working pane outside the candidate. Its unowned store directory is deleted. Conversely `idle-leaf` has a queued plan.synthesis record with no tab or slice, and its junk is kept indefinitely, contradicting criterion 1's no-running-leaf outcome. Compute activity from the agreed tab/slice evidence, including finished records.

### F5. Dead-pid temporary files bypass unavailable-pane protection

`src/reconcile.ts:725-729` calls drop directly for `<file>.<pid>.tmp`, bypassing the unavailable pane and process checks.

Source/outcome: criterion 6 permits only dead-owner run dirs to be deleted when pane inventory is unavailable. Probe `unavailable-tmp` passes live=null with an unregistered writer.4194303.tmp in the store. Reconcile deletes it and reports it removed. The exception applies to run dirs, not atomic-write files. Require the shared vetoes after proving the writer dead.

### F6. Most newly kept candidates omit what clears them

`src/reconcile.ts` passes no clears value for new pane/process keeps (e.g. lines 590,594,599,701,705,928,932,937), unmanaged worktrees, invalid owner records and delete failures. Making the field optional for backward compatibility does not fulfill the new-write contract.

Source/outcome: criterion 8 explicitly requires each kept item to carry its reason and what clears it in the report. A real pane-in-use or process-in-use candidate generates only path/reason at these branches. The existing report tests parse a schema that strips clears and never assert it, so they cannot catch this missing required outcome. Populate actionable clearing conditions for new keeps and prove the report contract at the reconcile boundary.

### F7. The test suite can delete the user's real retired root

`tests/isolation.ts` and `tests/helpers.ts` isolate HOME and AKROGON_LEAF_TEMP_ROOT but never set AKROGON_RETIRED_TEMP_ROOT by default. Most reconcile/next tests therefore exercise `src/reconcile.ts:949-950` against real `/tmp/akr-<uid>`. Only the dedicated host test overrides it.

Real source: `bun test` through the required verify command. implementation/report.md explicitly records that U1's test runs deleted the real `/tmp/akr-1000`. This is confirmed by the fixture environment and retiredLeafTempRoot's default, not a hypothetical input. It violates the binding design's retired-root override requirement that tests never touch the real root and its isolated-fixture contract. Set the override in the shared isolation/CLI environment and cover subprocess fixtures. Do not treat deleting the user's real files during tests as expected behavior.

## Test-Change trailers

All trailers in base..HEAD, in log order:

```text
Test-Change: tests/reconcile.test.ts formatting only, no expectation changes.
Test-Change: tests/run-permit.test.ts run.lock pattern gains a reconcile.ts exemption citing the design's retired-lock line; every other pattern and file still scanned.
Test-Change: tests/reconcile.test.ts expected-sweep surface unchanged — repoTempDir helper computes the repo-hash dir under leafTempRoot(f); lost-leaf seeds a dead tab so 'next --all' exits 0 (src/next.ts:786 guard).
Test-Change: tests/leaf-slices.test.ts busy-temp resolves its temp under leafTempRoot(f) with leafTemp's own hashing; expectations unchanged.
Test-Change: tests/reconcile.test.ts brief criteria 1,3-7,9,10: new unowned/leaf-owned/veto/report cases; 'unknown directory', 'sweeps unused registered variants' and pane-inventory expectations updated to the brief's keep rules.
Test-Change: tests/leaf-slices.test.ts brief criterion 2 and the slice-holds-temp rule: new host-step and finished-temp cases.
Test-Change: tests/status.test.ts design corrections: the plain-status kept-lines case becomes the leftovers case.
Test-Change: tests/command-reference.test.ts leftovers command contract added; no existing expectation changed.
```

Judgment: the planned criterion additions and revised unknown-worktree/unowned cleanup expectations have the cited brief sources. The fixture-path/dead-tab corrections preserve the intended outcomes. The retired-run.lock guard exemption is justified by the binding exact-name cleanup requirement. The formatting commit preserves expectations. The command-reference trailer names a file absent from the final diff because the command landed on the refreshed base. The status-test changes extend the upstream leftovers contract and use the binding host-block correction. No unsupported existing expectation change found. F1 identifies the planned test expectation that needs correction by A under the test-proof rules.

## Documentation

Opened the live behavior page docs/guide/next.md, README and docs/reference-index.md before judging the sweep. The guide now describes host filesystem leftovers under host. The changed AREA paths all exist. Its older claim that status prints kept reports is stale, but the live guide and command behavior point to leftovers, so no additional blocking documentation finding is raised.

## Operator actions

None. No credentials or live external mutations required.

## Verdict

fix. F1-F7 require repair. No separate Nits retained. The current green suite does not establish these required safety outcomes.


## check.repair — 2026-10-16

Started at reviewed head 0ab2552078bbafb7cf9bb4c7a2cc2c52706d6625. Repair head 7518cc6b76deefcec75509ca12379c9b6b572e67. No brief or design edits. No grants, credentials or external live actions were needed. Existing isolated repo fixtures and tracked child processes were cleaned in finally blocks. No temporary scripts created during this repair.

### Repairs

| Finding | Reproduction commits | Product/fixture commits | Result |
|---|---|---|---|
| F1 | 04f431f | 618c72e | lstat-based entry checks remove dangling links and preserve visible kept links in reports/leftovers. Original planned assertion correction remains for A. |
| F2 | 3fe2a47, 47a83a9 | 78788b4, fc39de9 | Shared pane/process decision guards filesystem removals. Every Git worktree removal also checks surviving processes. Reproduction covers unregistered leaf entries, leaf temps and recorded registered failed worktrees. |
| F3 | 3613d0b, 6da55db | f37448e, 163ac62 | Recursive owner inspection guards parent deletion in both filesystem sweeps and Git worktree removal. Live batch records remain authoritative even when their copy is present. Young/invalid run-owner states remain protected. |
| F4 | 3efaf88, 38d746f | d12ff4c, 7518cc6 | Repo activity comes from live recorded tabs or loaded occupied slices that this pass did not stop. A queued record alone does not retain unowned junk. An active occupied slice also protects its leaf temp with no tab. |
| F5 | 6deaa6d | 68630b7 | Dead-writer atomic files use pane/process vetoes. The dead-owner run exception remains unchanged. |
| F6 | b27492d | 3f99071 | Both keep writers require a clearing condition at every call. Read compatibility with old reports remains optional. |
| F7 | d88f00d | 04fe611 | Suite, CLI and fake command environments set isolated retired-root overrides. Explicit fixture overrides still win. |

Each finding has one reproduction test in tests/store-sweep-safety.test.ts, shown red before its behavior fix and green afterward. Test commits carry Test-Change trailers citing the finding and criterion/source. Final formatting of previously added reproduction code is included in 3f99071, fc39de9 and 7518cc6 without expectation changes.

Root audit: the original F2/F3 repair covered the new filesystem delete path but not removeWorktree. Searching all rmSync/git-worktree-remove sites found this shared Git path. The F3 reproduction was extended to a registered verify copy with a live descendant run and shown red/green. The F2 reproduction was extended to an actual registered failed-leaf worktree with an open-file target and shown red/green. The remaining unconditional filesystem call is the explicitly required dead-owner-run removal. All other new filesystem removals use dropChecked or the host equivalent. Extending F4’s same reproduction to assert leaf-temp survival then exposed a phase guard that applied the occupied-slice veto only to finished leaves. Removing that guard repairs active-slice temp retention too, with an additional red/green pair.

### Verification evidence

These are the run-check result lines. Each listed log was read back with akrogon log. A red reproduction is expected evidence of the bug. Final regression run: 7 pass, 0 fail, 42 assertions.

- `check repair-f7-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f7-red-1792104932381-3384664.log`
- `check repair-f7-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f7-green-1792104939339-3387830.log`
- `check repair-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f1-red-1792104958380-3420096.log`
- `check repair-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f1-green-1792104966664-3442574.log`
- `check repair-f2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f2-red-1792104986598-3475550.log`
- `check repair-f2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f2-green-1792105002461-3487302.log`
- `check repair-f3-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f3-red-1792105027894-3516664.log`
- `check repair-f3-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f3-green-1792105042022-3527293.log`
- `check repair-f4-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f4-red-1792105066509-3546380.log`
- `check repair-f4-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f4-green-1792105073064-3550966.log`
- `check repair-f5-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f5-red-1792105080302-3555540.log`
- `check repair-f5-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f5-green-1792105084501-3558312.log`
- `check repair-f6-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f6-red-1792105108932-3575437.log`
- `check repair-f6-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f6-green-1792105127542-3586847.log`
- `check repair-f3-registered-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f3-registered-red-1792105197693-3790085.log`
- `check repair-f3-registered-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f3-registered-green-1792105216286-3883959.log`
- `check repair-f2-registered-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f2-registered-red-1792105229550-3914146.log`
- `check repair-f2-registered-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f2-registered-green-1792105245036-3959719.log`
- `check repair-final-regressions: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-final-regressions-1792105370713-162594.log`
- `check sweep-c1: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c1-1792105380006-212841.log`
- `check sweep-c2: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c2-1792105380044-212843.log`
- `check sweep-c3: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c3-1792105380832-212840.log`
- `check sweep-c4: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c4-1792105380540-212839.log`
- `check sweep-c5: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c5-1792105380494-212845.log`
- `check sweep-c6: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c6-1792105379836-212846.log`
- `check sweep-c7: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c7-1792105379836-212849.log`
- `check sweep-c8: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c8-1792105380006-212853.log`
- `check sweep-c9: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c9-1792105379986-212851.log`
- `check sweep-c10: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c10-1792105379983-212852.log`
- `check sweep-c2b: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-sweep-c2b-1792105380212-212855.log`
- `check repair-c6-boundary: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-c6-boundary-1792105380540-212857.log`
- `check repair-c7-boundary: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-c7-boundary-1792105379986-212865.log`

Planned commands C1-C5, C8-C10 and C2b passed on 7518cc6. C6 and C7 fail because their literal plan filters match zero test names. This is deterministic and caused by this leaf's proof-command/test-name mismatch, so the unrelated-red retry rule does not apply. The existing actual boundary cases pass under repair-c6-boundary and repair-c7-boundary. These specific results establish the exercised outcomes but do not erase the two failing planned commands.

A previous full verify passed on 3f99071 with 908 tests, format and typecheck. That receipt predates the registered-path extensions and is superseded by the final-head verification recorded below.

### Handed to A

- F1 test-expectation correction: in tests/reconcile.test.ts, replace the planned C1 existsSync assertion for old-link with an entry-aware check. The skill reserves correction of an existing test expectation for A. Product behavior is repaired and the separate F1 reproduction passes.
- Criterion 6/C2b missing proof case: tests/leaf-slices.test.ts currently keeps the tab live during the occupied-slice assertion. Existing fake-systemctl and cgroup fixtures can run the missing gone-tab, retained-busy-slice case without new machinery. Add that case so the slice condition cannot be masked by the tab guard.
- Criteria 6 and 7 proof recording: the exact plan commands use filters vetoes and unmanaged worktree, which match no tests. Use the existing bun runner with actual matching titles (unowned entries stay while and unknown registered worktrees), reconcile the plan commands, and record current successful planned runs. No new runner is required.

No operator actions remain. No separate reusable Nits retained by B. Peer N3's live batch-owner mechanism is covered by F3's repair.

- `check repair-f4-temp-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f4-temp-red-1792105350816-134522.log`

- `check repair-f4-temp-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-f4-temp-green-1792105358816-143598.log`

- `check repair-saved-tree: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-repair-saved-tree-1792105389795-254212.log`


### Final verification and handoff

`akrogon verify` on committed head 7518cc6b76deefcec75509ca12379c9b6b572e67 completed green: setup, format, test and typecheck all exit 0. Tests: 908 pass, 0 fail, 9286 assertions across 54 files. This is after the latest source, test and shared fixture changes. No merge_checks were run.

- `verify setup: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-setup-1792105369310-156509.log`
- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-format-1792105371320-156509.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-test-1792105481409-156509.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/implementation/check-typecheck-1792105483313-156509.log`

All final verify logs were read back with akrogon log. The final saved-tree check records a clean worktree and git diff --check success. All F1-F7 behavior/fixture repairs are committed. The Handed to A items above remain, so the requested next phase is check.fix, not merge.

Handoff citation guard: the first check.fix request was rejected because tests/helpers.ts was not in the final trailer block of the F7 commit (two separate -m trailer paragraphs). Empty citation commit 8e6eaaf45140b8d3d500d704cf8ad9887b45b789 supplies that exact final-block citation. Its tree is unchanged from verified 7518cc6 (a5546ac8ddd888fa42d41e8bb2aa158650e23aba), so the green receipt still covers the implementation. Final branch head: 8e6eaaf45140b8d3d500d704cf8ad9887b45b789.
