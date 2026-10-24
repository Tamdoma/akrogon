# Direct re-check B, round 1

Verdict: **fix**, for verification only. F1 and F2 from review-B-1 are resolved. No new product defect found in the repair diff.

Original base: `0ed00de652e571bd54481244c1b6aed1f000c176`  
Prior reviewed head: `ecdb305f737f150ea0aee8cf27091d5cff522788`  
Repaired head: `736067bf474d6f86b3fecb55227c8ef3ac03d940`

Scope: only `ecdb305f..736067bf`, checked against review-B-1, `forks/scope-rule.md` Taken 1-6, `direct/plan.md`, and `direct/report.md` Repair round 1. No rebase occurred. Worktree remained clean at the supplied head. No code or test edits, commits, phase changes, or live herdr calls made by this review. No documented behavior changed in this repair.

## Prior findings

- **F1 resolved.** `sessionRepos()` now returns an empty set on discovery failure (`src/next.ts:1303-1304`). Both `reconcileRepos` and `tab_closed` exclude the repo before destructive reconciliation (`src/next.ts:1321,1445`). The excluded repo does not enter the host acting set. The new CLI regression exercises both entry paths with a failed workspace read and a successful pane read (`tests/release-any-phase.test.ts:264-288`). Read-back of `direct/check-red-first-2-1792853504883-1736670.log` shows the new case failing before the product repair. It passes in the targeted repaired run and in this review's full-head run.
- **F2 resolved.** The added merged-leaf case checks worktree/temp preservation and absence of a slice stop when the workspace is missing (`tests/release-any-phase.test.ts:241-260`). Its whole-reconcile exclusion also prevents tab closes. The host test now checks another repo's worktree-store directory as well as its temp and busy/empty slices (`tests/release-any-phase.test.ts:485-486,511-524`). For the remaining unchanged behavior, accept the report's existing-proof mapping: the live-tab tests exercise the session-wide id veto, whose inputs have no workspace restriction (`src/reconcile.ts:255-257`), and the non-acting-repo test covers the class containing a paused foreign repo. No additional paused-specific branch was introduced. The deliberate-break log shows all three ownership-gate scenarios turning red when that gate is removed.

## Remaining blocker

### F3. Required full verification remains red and the base comparison does not clear it

The repair report's first full check had 1115 pass and one merge-queue timeout. Its filtered retry passed, but did not repeat the full configured test command. I reran the configured checks through:

```sh
akrogon verify --holder /home/ivan/Work/infra/akrogon/issues/chart/host-reconcile-session/direct
```

Exit **1**, at the repaired head: **993 pass, 123 fail** across 66 files. Most failures were timeouts. One status test expected `0h 23m` and received `0h 22m`. Format and typecheck passed. Machine load was observed around 80 during this run. I found no plausible product cause in the repair diff, so followed the required persistent-red procedure:

```sh
akrogon verify --holder /home/ivan/Work/infra/akrogon/issues/chart/host-reconcile-session/direct --known-red
```

Exit **1**, `verify known-red 736067bf474d6f86b3fecb55227c8ef3ac03d940: fail`. It reused the completed red head run and tested a fresh checkout of merge-base `0ed00de652e571bd54481244c1b6aed1f000c176`: **1098 pass, 15 fail**, all 15 timeouts. Both runners executed real named tests. The base failures do not cover all 123 head failures, so the comparison cannot clear the required check. This is a verification blocker, not evidence that these unrelated tests need product changes in this chart.

Next action for the door: obtain passing configured verification on the unchanged repaired head when machine conditions permit, or a successful known-red comparison whose logs support the result. Do not land from the focused retry alone. No new source-code repair is requested by this finding.

## Evidence read back with akrogon log

- `direct/check-targeted4-1792853539769-1771265.log`: 39 pass across the three affected test files, including close-pack and both ownership regressions.
- `direct/check-deliberate-break-1792853548304-1811859.log`: three ownership cases fail after removal of the gate.
- `direct/check-test-1792853883008-1833122.log` and `direct/check-retry-merge-queue-1792853898112-2425191.log`: original full-run timeout and focused green retry, respectively. Retain as inconsistent evidence.
- `direct/check-test-1792854591018-2589169.log`: this review's full-head retry, 993 pass / 123 fail. The merged-worktree, failed-workspace-list, and host-slice ownership cases all pass in this run.
- `direct/check-test-1792854949110-3888382.log`: fresh base comparison, 1098 pass / 15 fail.
- This review's format logs `check-format-1792853974207-2589169.log`, `check-format-1792854619918-3888382.log`, and typecheck logs `check-typecheck-1792854597269-2589169.log`, `check-typecheck-1792854955178-3888382.log` passed.
- Repair-range `git diff --check` passed. Verification processes completed before this review returned.

## Test-Change trailers

`c9b20f193f8e4fd9ba16b3a864743713089af72b` has three trailers. Accepted: `tests/release-any-phase.test.ts` adds F1/F2 proof without weakening assertions. `tests/fake-herdr.ts` adds only the failure seam needed for F1. `tests/close-pack.test.ts` supplies the fake owning session to its two cleanup passes, preserving the existing publish-refusal assertions under the chart's workspace-ownership contract. `736067bf` changes no test files and has no Test-Change trailer. No runner configuration, test filtering, or timeout changes were introduced by the repair.

No nits or operator-only actions.
