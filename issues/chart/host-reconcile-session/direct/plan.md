# Direct plan: host-reconcile-session

Spec: ../forks/scope-rule.md Taken 1-6.

## Units (serial, inline)
1. Tests first (tests/release-any-phase.test.ts):
   - Change the host-step test: the other repo's vanished-tab busy slice is now kept by a pass for `repo` (operator rule, INTAKE), plus an empty other-repo slice kept and the other repo's leaf temp kept.
   - New test: `repo`'s workspace absent from the session's workspace list; an unfinished leaf with a vanished tab and busy slice keeps its slice and temp.
2. Code:
   - src/next.ts: `sessionRepos()` reads `herdr workspace list` once per pass (failed list = none). reconcileRepos reconciles only repos in that set and passes them to reconcileHost as the acting set; the tab_closed hook does the same for its owner.
   - src/reconcile.ts: reconcileHost takes the acting set; a leaf-matched slice of a repo outside it is kept with its own reason. Inventory and skip sets still use every registered repo.
3. Checks: targeted tests, then `akrogon verify --holder <chart>/direct`.

Not covered by new tests (unchanged behavior): a tab visible in another workspace keeps (tabLive matches the whole session's panes); paused repos are outside the acting set of another repo's pass.
