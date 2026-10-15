# Review B: finished-leaf-processes

Base: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`
Reviewed head: `32f0b13193d873f43c46a645b5884b272789b174`
Verdict: **fix**

Initial blind review. Debate is off, so no positions/rebuttal artifacts are expected. No peer review was read. No code was changed or committed.

## Fixes

### F1: Host inventory uses only the repos selected for this pass

Location: `src/next.ts:1338`, callers at `1415`, `1426`, `1444`, and `1537`; `src/reconcile.ts:609-649`.

Real source: an operator runs `akrogon next --all` inside one registered repo, targeted `next`, or unpause while another registered repo has a loaded slice and a recorded live tab. `reconcileRepos` passes only its selected repos to `reconcileHost`, but that function lists slices across the whole user manager. A slice belonging to an omitted repo is incorrectly classified as having no leaf record. Its tab is never checked. If empty, it is stopped despite the live tab. Empty slices with live tabs are reachable when panes have exited or restored panes are outside their original scopes, a state the existing next guide explicitly describes. `--resume` similarly omits paused repos from the ownership map.

Consequence today: a repo-local pass stops another repo's known, protected slice. This violates brief criterion 2 (live tab protects its slice), criterion 5's requirement that unmatched slices actually match no leaf record, and plan D1/D4's all-registered-repo ownership mapping.

Boundary proof: two temporary registered repos, a closed merged leaf in the other repo, its tab present in fake-herdr, and its loaded empty slice in fake-systemctl. Run the real CLI `next --all` from the first repo. Exit 0, but the log contains `show akrogon-l517adc8cc3b5.slice ...` followed by `stop akrogon-l517adc8cc3b5.slice`; the unit database becomes empty. The same probe confirms a closed owner's `tab_closed` hook does reach cleanup, so that suspected gap is not a finding.

Evidence: `check review-B-scenarios: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-review-B-scenarios-1792099670533-2062871.log`.

Repair: build ownership against all registered repos independently of the per-repo sweep selection. Do not classify a known but unselected repo's slice as unowned. Add a regression at the CLI boundary with two registered repos and the live-tab protection case.

### F2: A run admitted during a pass is absent from the cached protection set

Location: `src/reconcile.ts:323-333` and `613-649`, with admission at `src/admission.ts:128-168` and the real caller at `src/run-check.ts:181-210`.

Real source: a shell outside any tab starts `akrogon run-check --leaf <finished-leaf> -- <command>` or verify while `next` is reconciling finished slices. `runCheck` accepts the explicit leaf without a phase restriction, and `withAdmission` writes its live record independently of next's global lock. Reconcile snapshots `liveRuns()` once, then awaits systemctl stops, pane reads, or cgroup queries. A run admitted during any of those awaits is missing from the snapshot when its slice is stopped later.

Consequence today: reconcile can terminate a currently admitted check even though its live record names the slice. This violates brief criterion 2. The same stale snapshot occurs in both the per-repo and host loops. Re-reading once before stop alone still leaves an admission/stop race.

Controlled interleaving proof: use the existing temporary repo, leaf fixtures and fake-systemctl boundary. Pause the first finished leaf's stop, register the second leaf through the real `withAdmission`, then allow reconcile to continue. The second slice is stopped while `liveRuns()` still returns its live record. Output: `{"liveRecordDuringStop":true,"secondSliceStopped":true}`. The production entry trace above establishes the real concurrent source; the probe controls only its scheduling.

Evidence: `check review-B-admission-race: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-review-B-admission-race-1792099708934-2235539.log`.

Repair: coordinate admission and the eligibility-check/stop operation so a live run cannot appear between the decision and the stop. Cover a run admitted after the pass has begun, in addition to the existing already-live-record case.

## Verification and contracts

- The recorded verify receipt for `5aac9f18dcbf6eb9f80eb973ffd6b34213247d95` has tree `b89e6eea2662e3ce02d5e8e24ba672b7a8c0440b`, identical to the reviewed head. Setup, format, test and typecheck exited 0. The current full-suite evidence reports 859 pass, 0 fail, including all nine leaf-slices cases. No changed code, helper or fixture follows that verified tree. No planned check was skipped, filtered or disabled. The recorded full-suite run is sufficient, so it was not repeated.
- Read back the format, test and typecheck logs: `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-format-1792099429604-636394.log`; `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-test-1792099559116-636394.log`; `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-typecheck-1792099561765-636394.log`.
- `akrogon log <path>` was attempted but the installed CLI rejects `log` with its Usage error. Logs were therefore read directly through retained run-check commands. No failed product check was dismissed.
- Both new probes ran after the configured locked setup. They used temporary fixtures and fake systemctl only, cleaned by fixture teardown. No live units or outside resources were created by these probes.
- Reviewed README and `docs/guide/next.md` against the changed behavior, plus the reference index and both changed AREA files. Each AREA's named paths was listed for existence in one shell command. Missing `issues/config.yaml`, `issues/timings.jsonl`, `issues/verify-runs.jsonl`, and `issues/merge-attempts.jsonl` are runtime state/config in the registered checkout, absent from this sparse worktree. These pre-existing references are not dead source pointers introduced by this leaf. All named source/test/doc paths exist. F1/F2 are the concrete mismatches with the documented safety rules.
- Boundary listing and verification read-back: `check review-B-boundaries: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-review-B-boundaries-1792099640156-1850033.log`. Final probe read-back, line locations, clean status and unchanged head: `check review-B-final-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-review-B-final-evidence-1792099716358-2266239.log`.

## Test-Change trailers

All trailers in base..HEAD, judged under `src/test-files.ts`:

- `be8561d`: `tests/leaf-slices.test.ts` cites the post-plan control leaf, own-slice candidate seeding, cwd/env/pid escaping and polling repairs. Compared with the planning test commit: these make the intended boundary scenarios execute and preserve their required outcomes. Accepted.
- `be8561d`: `tests/fake-systemctl.ts` cites prefix/suffix glob matching and executable mode. These implement the systemctl command seam used by the planned cases. Accepted.
- `a16265e`: `tests/leaf-stop.test.ts` cites the newly legitimate list-units/reset-failed calls on its fake. Filtering the helper to stop calls preserves every stop expectation and matches the new reconcile integration. Accepted.
- `32f0b13`: `tests/AREA.md` cites the new leaf-slices test index line. The path matches the rule because it is under tests, but this is an index addition rather than a changed test expectation. Accepted.

No Nits or operator actions. F1 and F2 need repair and regression coverage.

## 2026-10-15 check.repair

Repair input: both initial reviews of `32f0b13193d873f43c46a645b5884b272789b174`. Repaired head: `0dfcedc`. No prior repair round, handoff, operator action or remaining Nit.

### B-F1 repaired: complete host ownership map

- Reproduction commit `2c97934`; fix commit `d0e624b`. `reconcileRepos` supplies all registered repos to the host step independently of its selected per-repo sweep. Its targeted, current-repo `--all`, `--resume` and unpause callers all use this shared path; `tab_closed` already supplied all registered repos.
- One added CLI regression creates two registered repos and verifies that a pass from the first preserves the second's empty slice with a live tab. No existing expectation changed.
- Red: `check repair-B-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-B-F1-red-1792099907287-3253135.log`.
- Green: `check repair-B-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-B-F1-green-1792099915044-3282066.log`.

### A-F1 repaired: uncertain ownership does not abort the host step

- Reproduction commit `7a4e003`; fix commit `47821da`. The host step records each repo's leaf-inventory error and retains unmatched slices whenever ownership is incomplete, while still resetting failed run units. Successfully mapped leaves retain their normal rules. This avoids A's suggested unsafe empty-inventory fallback, which would reproduce B-F1 for a renamed repo with a live tab.
- The CLI regression reproduces a foreign leaf after a repo rename. The command still reports the existing foreign-record error and exits 1, but it now completes failed-unit cleanup and records why it retained the uncertain slice. The fix removes the new host-step abort, not the pre-existing inventory error reporting.
- Red: `check repair-A-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-A-F1-red-1792099940091-3409420.log`.
- Green: `check repair-A-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-A-F1-green-1792099940691-3412838.log`.

### B-F2 repaired: admission and stopping share a per-slice lock

- Reproduction commit `a3e4f14`; fix commit `0dfcedc`. Reuses `withLock` for a stable lock under `<globalHome>/runs/locks/<slice>`. Admission holds it only while publishing the live record. Reconcile holds the same lock while rereading live records and completing `systemctl stop`. The command runs outside the admission lock, so checks still run concurrently. A new admission either precedes the locked safety check and protects its slice, or waits until the stop completes before starting its run.
- All three reconcile stop sites use the shared `stopSlice`, covering per-repo finished leaves, host finished leaves and unmatched empty slices. Manual `akrogon stop` remains its separate explicitly requested stop operation.
- One added CLI regression holds the first slice's systemctl stop, starts an actual `run-check --leaf <closed-leaf>` from the outside shell, waits for its payload to begin, then releases cleanup and verifies that the new run's slice receives no stop. The run is released and awaited in teardown; no process-pattern stopping is used.
- Red: `check repair-B-F2-red: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-B-F2-red-1792100028961-3737652.log`.
- Green: `check repair-B-F2-green: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-B-F2-green-1792100040957-3773087.log`.

### Current criterion proof

On committed head `0dfcedc`, ran the planned `akrogon run-check --name repair-criteria -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile" && bun test --timeout=30000 tests/leaf-slices.test.ts'`: 12 pass, 0 fail. This reruns all nine original criterion cases written during planning by A, plus the three reproduction tests written by B. All changed-input criteria have current proof, including real systemd stops, live admission protection, own-slice protection, merged completion and failed-unit clearing.

Evidence: `check repair-criteria: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-criteria-1792100054760-3806357.log`.

Read back each cited reproduction and criterion log through `run-check`, since this installed CLI lacks `akrogon log`: `check repair-evidence-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-evidence-readback-1792100079284-3937245.log`.

Initial test-construction attempts are not proof: one stdin-fed edit did not execute under run-check and matched zero tests; the admission test initially used the old open-leaf path after sweep had moved the owner to closed. Both were corrected before the successful bug reproductions cited above. No original planned test or expectation was altered.

All fixtures use the existing temp repo/env and fake systemctl seams. The nine planned real-systemd proofs replay the plan's user-manager commands and finally cleanup. No external service, credential or widened live action was required. The existing documented cleanup behavior remains the same; the fixes enforce its safety guarantees.

### Final verification

`akrogon verify` on `0dfcedc217967ae4a97935a6cf3b9957bad30054`: green. Setup 0, format 0, test 0 (862 pass, 0 fail across 50 files), typecheck 0. No merge_checks were run. Worktree clean and `git diff --check` passed.

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-format-1792100061805-3827557.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-test-1792100175154-3827557.log`
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-typecheck-1792100177097-3827557.log`

Read-back and final clean-head evidence: `check repair-verify-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-verify-readback-1792100188107-236917.log`.

All three Fixes are repaired. Nothing is handed to A. Ready for merge.

## 2026-10-15 merge, attempt 492b888c-bd5e-4b76-a566-2717591eced5

Solo rebase from prior reviewed/repaired head `0dfcedc217967ae4a97935a6cf3b9957bad30054`, old base `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`, onto fetched `origin/main` at `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07`. Resolved head: `8b8515ff597dfc42039244b35da694a818e03c3c`.

The only conflict was `src/AREA.md`: kept main's new evidence-reader entry and this leaf's scope/reconcile descriptions. Verified that every source pointer in those entries exists. No test expectation or runtime code was changed during resolution.

Computed `git range-diff 0a80ab91e9388e60ce148f500fa92eb9859e1aeb..0dfcedc217967ae4a97935a6cf3b9957bad30054 fa0f4c261532b1b2ba32e9984f3f38d5897c6e07..8b8515ff597dfc42039244b35da694a818e03c3c`: all ten commits correspond; only the AREA conflict context differs. Worktree clean, `git diff --check` green.

Evidence: `check merge-rebase: 1 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-rebase-1792100219607-319832.log` (expected index conflict), `check merge-rebase-continue: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-rebase-continue-1792100232860-350216.log`, and `check merge-range-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-range-diff-1792100241230-379975.log`.

Installed-helper retired-lesson re-removal returned `none`: `check merge-lessons: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-lessons-1792100241093-379745.log`.

Merge verification: `akrogon verify --attempt 492b888c-bd5e-4b76-a566-2717591eced5` on `8b8515ff597dfc42039244b35da694a818e03c3c` is green. Setup 0, format 0, test 0 (869 pass, 0 fail across 51 files), typecheck 0. No advisory or merge-check commands are configured.

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-format-1792100254878-409789.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-test-1792100367809-409789.log`
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-typecheck-1792100369888-409789.log`

Read-back and clean-head evidence: `check merge-verify-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-verify-readback-1792100396127-1265401.log`. `akrogon log` is still unavailable in the installed command, so logs were read through run-check. Range-diff and lesson logs were also read back in `check merge-log-readback: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-log-readback-1792100272905-508658.log`.

`akrogon phase finished-leaf-processes merged --slot B --check --attempt 492b888c-bd5e-4b76-a566-2717591eced5` returned `ok`. Gathered all six owner briefs under worktree-cleanup before the final merged call.

Final merged call exited 0 and printed `moved merged`. Confirmed `origin/main` is exactly tested head `8b8515ff597dfc42039244b35da694a818e03c3c`, leaf state is `merged`, and this worktree is clean: `check merge-final-state: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-merge-final-state-1792100421023-1355145.log` (read back).

The command also reported: `checkout pending: error: Entry 'README.md' not uptodate. Cannot merge.; 23 behind origin/main; commit or finish the overlapping edit`. The push and leaf merge completed; updating the registered checkout remains blocked by its existing overlapping edit. No unrelated edit was changed. No issue/epic completion line was printed, so no broadcast was due.
