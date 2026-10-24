# Direct report: host-reconcile-session

Base 0ed00de652e571bd54481244c1b6aed1f000c176, head ecdb305f737f150ea0aee8cf27091d5cff522788.

## Commits
- 1a580b0a test(reconcile): tests first, Test-Change trailer citing the operator rule.
- 7bcb0c38 fix(reconcile): acting set into reconcileHost; reconcileRepos and the tab_closed hook act only on repos whose workspace is in the invoking herdr session.
- ecdb305f fix(reconcile): workspace list read lazily, only when a repo has tabs to judge; a failed list falls back to the existing unknown-pane keep.

## Changed files
- src/reconcile.ts: reconcileHost takes `acting`; a leaf-matched slice that no keep rule saves is kept with reason `repo not reconciled by this pass` when its repo is outside `acting`. Inventory and skip sets unchanged (all registered repos).
- src/next.ts: `sessionRepos()` (workspace labels of the invoking session, null on failure). reconcileRepos skips a repo whose tabs need judging when its workspace is absent; passes null panes when the list failed; passes the reconciled set to reconcileHost. tab_closed hook returns when the owner repo's workspace is absent and passes the owner as `acting`.
- tests/release-any-phase.test.ts: host-step test now expects another repo's vanished-tab and empty slices plus its temp kept; new case for a repo whose workspace is absent.

## Proof
- Red first on 1a580b0a: check-red-first-1792851932454-3249910.log, both cases red (slice stopped).
- Targeted after fix: check-targeted-1792851966503-3264988.log, 27 pass.
- First verify on 7bcb0c38 red: 20 fails. Cause in diff: 8 tests assert no herdr calls and saw the new `workspace list`; close-pack expected a kept report. Fixed in ecdb305f. The rest were timeouts under load average 40-79 (check-retry-1792852660154-896.log, different set each run).
- `akrogon verify --holder` on ecdb305f: green, 1114 pass, format, typecheck green (check-test-1792853167775-846851.log).

## Limits
- One workspace per repo label across sessions assumed; duplicates are session-routing criterion 2.
- Busy leftovers of a repo nobody runs wait for that repo's own pass.
- If the workspace list fails but the pane list succeeds, the host step still judges acting repos against the invoking session's panes (both calls use the same socket).
- tab_closed bare tab-id owner match stays with session-reads criterion 5.

## Repair round 1 (review B-1 F1/F2, C-1 F1/F2)
- c9b20f19 tests then 736067bf fix: a failed workspace list now counts as absent on the typed pass and the tab_closed hook, so the repo is neither reconciled nor acting. The earlier null-pane fallback and its Limits bullet are gone.
- close-pack test now runs its reconcile passes against the fake herdr session (it previously called whatever real herdr was on PATH), Test-Change trailer.
- New proofs: failed workspace list (typed pass + tab_closed hook) red first (check-red-first-2-1792853504883-1736670.log); merged leaf of an absent workspace keeps worktree, temp and slice; other repo's worktree-store dir kept by the host-step test.
- Deliberate break (gate removed in both paths): all 3 new cases red (check-deliberate-break-1792853548304-1811859.log).
- Taken 6 items covered by existing behavior, not new cases: a tab visible in another workspace keeps, because tabLive matches tab_id over the whole session pane list (unchanged src/reconcile.ts tabLive; live-tab keeps in tests/release-any-phase.test.ts host-step and tests/leaf-slices.test.ts "a finished leaf with a live tab keeps its slice"). A paused repo cannot enter another repo's acting set, since acting holds only repos the pass reconciled; the host-step test proves a non-acting repo is untouched.
- Verify on 736067bf: 1115 pass, 1 fail "a leaf re-entering merge queues behind the two leaves stamped earlier" (15 s timeout, load 32-53). Retry green: check-retry-merge-queue-1792853898112-2425191.log. Marked inconsistent; same test timed out in earlier runs on other heads.
