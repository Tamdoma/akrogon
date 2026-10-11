# Review B

Date: 2026-10-11. Phase: check.review. Verdict: **fix**.
Base: `64f27d0e3c4ae254a6aafd49ea393033dc677606`.
Reviewed head: `46952bfdf63564cb489c28608903f1ec2ed8cba8`.
Debate is disabled, so no positions-B/rebuttal-B inputs exist. Initial review was blind. No code or tests were edited and no commits were made.

## Fixes

### F1. Store sweep deletes worktrees occupied by live panes

Location: `src/reconcile.ts:126-142,340-387`; `src/next.ts:1496`.
Realistic source: seat-made variant checkouts such as the `-v0`/`-u7`/`-u5` checkouts explicitly identified by design.md Migration Q-d. An operator or agent has a Herdr pane with cwd in such a registered store checkout. The store-directory inventory sends it to the generic candidate branch, which calls `removeWorktree` without checking `livePaneInside` or unavailable pane inventory. In addition, `reconcileNeedsPanes` only inspects leaf records, so a repo with an active stored leaf and a variant incorrectly passes `[]` without requesting panes.
Consequence today: `next --all` removes the clean, reachable checkout under the running pane, discards its ignored local contents, and reports no keep reason. This is also possible when a genuine pane inventory was fetched for another leaf, because generic candidates never consult it.
Criterion: brief DC2 (any worktree with a live pane inside must be kept and reported), DC6 for base-run candidates, plan D1/D6/D7 and the design's migration 2a safety contract.
Evidence: `implementation/review-B-probes.log` runs real Git worktrees and the existing Herdr seam through the actual CLI: `live variant exists after all pass false`, `variant pane remains true`, kept report contains only the active holder. Trace is the actual documented variant-checkout source to the candidate deletion, not merely an arbitrary call to an internal helper.
Required repair: apply pane availability/liveness protection to every removable worktree candidate, and obtain pane inventory whenever those candidates require it. Add the smallest CLI regression covering the variant path and unavailable panes.

### F2. Finished-leaf scratch deletion removes a live base-run root

Location: `src/reconcile.ts:401-408`; real producer `src/base-run.ts:138-151,171-176`.
Realistic source: the actual `akrogon base-run` command creates `leafTemp(repo, slug)/run-*`, writes its own live PID and boot ID to `.owner`, and runs a child with TMPDIR pointing at that directory. The operator can move the leaf to failed while the run is still executing. A closed tab is also compatible with a surviving process. `next --all` recursively removes the entire failed/merged scratch directory before inspecting its child owner records.
Consequence today: a running check loses its temporary files and fails. The live base checkout remains protected by its base-run record, while the same run's scratch is deleted.
Criterion: brief DC3 (a live process's run root is kept), design Outputs running-attempt exclusion, plan D8 owner rules.
Evidence: the probe starts the actual base-run CLI with a three-second child, waits for the child to expose its actual TMPDIR, changes the leaf to failed, and runs `next --all`. Log: `actual base-run root exists before pass true`, `actual running base-run root exists after pass false`, base-run exit/status `1` from `test -d "$TMPDIR"`. The earlier live-PID probe independently shows the same deletion. Fixtures and processes completed and were cleaned.
Required repair: inspect child ownership before removing a finished leaf's parent scratch directory. Live or unverifiable owners must survive and be reported. Add a regression using the real running-attempt boundary.

### F3. Normal targeted next passes skip reconciliation

Location: `src/next.ts:1553-1570`.
Realistic source: the documented `akrogon next <slug>` dispatch command. With a named selection, `reconcileNow` starts false and becomes true only for a non-failed `skipped` outcome. Successful dispatch, waiting on existing seats, completed leaves, and folder selections therefore skip the reconciler.
Consequence today: ordinary named dispatch passes leave clean unused variant checkouts and dead run roots untouched and do not refresh the status report. Cleanup depends on a separate untargeted sweep. This contradicts the requested per-pass lifecycle and the new README claim.
Contract: brief What and design migration 2a explicitly require reconciliation in every pass; plan D2 explicitly includes single-leaf passes.
Evidence: CLI probe creates an unused clean registered `holder-v1` checkout and runs `next holder` successfully. Log: `unused clean variant exists after typed pass true`. The following all-pass sweep removes candidates. Code trace confirms reconciliation is absent from the normal targeted branch.
Required repair: reconcile the selected repository on ordinary targeted and folder passes without conditioning it on a dispatch error. Add a CLI regression for successful named dispatch.

### F4. Explicit worktree_root disables old-location migration

Location: `src/reconcile.ts:140,310-315`.
Realistic source: operator config supplies `worktree_root` for the destination store, while an active leaf still records its clean old `issues/worktrees/<slug>` path. Configured store roots are an existing supported contract in `src/config.ts:250-254` and the chart explicitly reserves the operator's worktree_root configuration steps. The reconciler labels any outside-store active record unmanaged whenever the config key exists, even when that record is inside the old managed root.
Consequence today: dispatch continually rejects the old path with `Worktree path mismatch`; reconciliation never clears it, so the next dispatch cannot recreate the leaf at the configured store. A config key equal to the default store path is enough to trigger this failure.
Criterion: brief DC4 and design Migration 1a, which require clean old in-repo worktrees to migrate. Neither exempts configured destination stores.
Evidence: actual CLI probe configures `worktree_root` to the default-equivalent absolute store, creates the old managed checkout, records it on an active leaf, then runs targeted and all passes. Both exit `1` with path mismatch; `old configured-root worktree exists true record unchanged true`; report reason `unmanaged worktree`.
Required repair: decide old-root migration from the recorded path and safety rules, independently of whether the destination store was configured. Add the configured-store case to the migration regression.

## Verification

- Read brief, design, plan, report and ponytail guidance before reviewing the full diff. Inspected all changed source and test files, every Test-Change trailer and the existing test-file matcher. Followed README, reference index, source/test area pages and the unchanged guide pages describing cleanup.
- Concrete CLI probes: temporary script under the seat TMPDIR, actual isolated registered Git repos, existing fake Herdr contract, actual base-run process. Exit 0 for the probe orchestrator. Full results saved in `implementation/review-B-probes.log`; the expected failing base-run exits 1. No live operator resources were mutated.
- Existing implementation evidence: format and typecheck wrapped logs exit 0; changed-test wrapped log ends 760 pass, 0 fail. Report records the planned focused command with 248 pass and full suite with 774 pass plus no new akrogon-* debris. No planned test or runner was filtered or disabled by this diff. Fixture registration changes preserve existing assertions.
- Review additionally runs the missing wrapped full-suite proof through `akrogon run-check --name test -- sh -c 'akrogon guard ancestors && akrogon guard own-modules && bun test --timeout=30000'`; result appended below.
- DC1, DC2 ordinary leaf dirty/rebase/unreachable/pane cases, DC3 active-leaf owner cases, DC4 default-store migration/refusals, DC5 sparse cleanup, DC6 ordinary base cleanup and DC7 have existing passing evidence. That evidence misses F1-F4. DC2's mid-merge marker path is implemented but lacks its named outcome test. Repair should cover that required refusal outcome too.
- AREA path listing from repository root found every named source/test/skill/index path. `issues/` and `issues/config.yaml` are absent only in this sparse worktree and present in the registered checkout. `issues/base-runs.jsonl` is runtime-created by base-run, not a dead source pointer. No dead-pointer Fix.

## Test-Change trailers

Range: `origin/main..HEAD` (same three leaf commits as base..HEAD).

- `41813c7`: `tests/next.test.ts` cites the merged/failed removal rules. Changed assertions match brief DC1/DC2 and plan D11.
- `41813c7`: `tests/batch-merge.test.ts`, `tests/chart-usage.test.ts`, `tests/hold.test.ts`, `tests/install.test.ts`, `tests/merge-attempts.test.ts`, `tests/pause-status.test.ts`, `tests/pause.test.ts`, `tests/peer-wait.test.ts`, `tests/shell.test.ts` each cite exit-time temp cleanup. These only register existing temporary directories, preserve assertions, and implement DC7's requested cleanup.
- `41813c7`: `tests/helpers.ts` cites the DC7 fixture registry. Accepted against DC7 and plan D10.
- `46952bf`: `tests/AREA.md` cites the new reconciler-test area entry. Accepted against plan U5. The matcher treats the tests directory's doc as a test path, but no expectation changed.
- No existing regression assertion was deleted without a cited brief outcome.

## Nits

N1. `docs/guide/merge.md:55` still says worktree/branch cleanup waits for the issue folder to move; `docs/guide/limits.md:10` says only manual/startup sweeps remove them. The new tab_closed reconciler and partial-issue cleanup contradict those statements. Deferred because no concrete unsafe operator action was established from these guide claims; promote to Fix if an actual documented workflow depends on retention. README correctly describes the intended new policy, although F3 prevents its every-pass claim from being true today.

## Operator actions

None.

### Wrapped full-suite result

Review run completed with exit 0: 774 pass, 0 fail, 7953 assertions, 40 files, 88.21 seconds. Log: `implementation/check-test-1791711728261-1828558.log`. All existing tests are green despite the four CLI-reproduced defects. No base comparison is needed because no required check failed.

Temporary probe script and directories were removed after saving the evidence. Reviewed head remained unchanged and Git status was clean before handoff.

Phase result: `akrogon phase worktree-reconciler check.repair --slot B --verdict fix` returned `recorded`. B's fix verdict is saved; the command is waiting for the other initial review and has not confirmed a phase move.
