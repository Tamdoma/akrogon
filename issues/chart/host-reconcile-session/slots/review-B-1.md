# Direct review B

Verdict: **fix**

Base: `0ed00de652e571bd54481244c1b6aed1f000c176`  
Reviewed head: `ecdb305f737f150ea0aee8cf27091d5cff522788`

Reviewed `forks/scope-rule.md` Taken 1-6 as the chart contract, `direct/plan.md`, `direct/report.md`, the complete base-to-head diff, affected callers, and `docs/use/park-pause-stop.md`. No separate draft brief/design exists in this chart. The documented local cleanup behavior remains consistent with the intended change. Code worktree was clean and at the supplied head. No code changes or commits made.

## Fixes

### F1. Failed workspace discovery still authorizes destructive cleanup

Source: a normal `akrogon next --all` or real `tab_closed` hook when `herdr workspace list` fails, while a subsequent `pane list` succeeds. Separate CLI reads can fail independently. Taken 2 explicitly requires a failed workspace list to count as absent for every repo, skipping its cleanup.

`src/next.ts:1303-1305` converts the discovery error to null. In `reconcileRepos`, null bypasses the exclusion and adds the repo to `acting` (`src/next.ts:1323-1325`). Although per-repo cleanup receives null panes, host cleanup receives the original `panesOnce` (`src/next.ts:1332`), successfully reads the invoking session, and stops the matched busy slice when its tab is missing (`src/reconcile.ts:1196-1207`). The slice can belong to a seat in another session. The hook path is worse: null also bypasses its exclusion (`src/next.ts:1448-1449`), and per-repo cleanup immediately receives successful panes (`src/next.ts:1453-1456`).

Representative CLI reproduction used the existing release-any-phase fixture: a stopped unfinished leaf with a recorded tab absent from the invoking pane list and a busy fake systemd slice. A temporary herdr wrapper failed only `workspace list` and delegated all other calls to the existing fake. Both `next --all` and `next` with a `tab_closed` event issued `systemctl stop` for that slice. The hook even exited 0. This proves the named unknown-workspace outcome fails, without requiring a production incident or changing the deferred duplicate-label policy.

Required repair: a failed ownership read must exclude the repo from both destructive reconcile paths and the host acting set, as Taken 2 says. Add regression coverage for both entry paths. Passing null only to per-repo pane checks does not enforce that contract, especially for finished leaves without a recorded tab (`src/reconcile.ts:206-211`). The report's final “Limits” bullet about host judgment describes this contract violation, not an accepted limit.

### F2. Taken 6 is not fully proven

The contract explicitly requires a merged leaf with no workspace to retain its **worktree, temp, tab and slice**, another repo's **worktree-store directory** to survive, a tab visible in another workspace to keep its resources, and a paused repo to remain untouched by another repo's pass (`forks/scope-rule.md`, Taken 6).

The new absent-workspace test has an unfinished stopped leaf with no worktree or live tab and checks only slice/temp retention (`tests/release-any-phase.test.ts:216-239`). The changed host test adds foreign busy/empty slices and a foreign temp directory, but no foreign worktree-store assertion (`tests/release-any-phase.test.ts:405-474`). The plan explicitly omits the cross-workspace and paused outcomes as unchanged behavior, without identifying existing tests that establish those specified outcomes. Existing cleanup coverage does not supply these missing ownership scenarios.

Provide the missing outcome proofs through the existing fake/CLI fixtures, or identify existing tests that would fail for each specified regression. The chart's claim that Taken 6 is proven is currently unsupported. F1 additionally demonstrates why successful full-suite execution alone does not establish the ownership contract.

## Verification evidence

- Read back through `akrogon log`: `direct/check-red-first-1792851932454-3249910.log` shows both changed scenarios failing before the product fix. `direct/check-targeted-1792851966503-3264988.log` shows 27 passing targeted tests.
- Read back the final-head full check evidence: `direct/check-test-1792853167775-846851.log` ends with **1114 pass, 0 fail**. The corresponding format and typecheck logs (`check-format-1792852980773-846851.log`, `check-typecheck-1792853172395-846851.log`) are green. The full suite ran after the final code change. No redundant full-suite rerun was needed.
- Focused review reproduction on the reviewed head: `check review-B-hook-ownership: 1 /home/ivan/Work/infra/akrogon/issues/chart/host-reconcile-session/direct/check-review-B-hook-ownership-1792853318124-1523314.log`. Read back with `akrogon log`. Both workspace-read-error cases failed their no-stop assertion, each recording `stopped: true`. This red has a direct cause in the reviewed diff, so no unrelated-failure retry or known-red procedure applies.
- Earlier exploratory run: `check review-B-ownership: 1 /home/ivan/Work/infra/akrogon/issues/chart/host-reconcile-session/direct/check-review-B-ownership-1792853285831-1484695.log`. Its workspace-error case failed. Its closed-record/workspace-absent case passed and is not a finding.
- `git diff --check <base> <head>` passed. Temporary reproduction files were removed after their results were retained in the holder logs.

## Test-Change trailers

`1a580b0a63b7a495b66bd6041bf17e2e7d4933f0` contains one trailer for `tests/release-any-phase.test.ts`, citing the operator's workspace-isolation rule in `INTAKE.md`. Accepted: that rule contradicts the previous expectation that a repo-local pass stops another repo's busy matched slice. The new assertions preserve the existing run-record and live-tab veto checks. The other two commits contain no Test-Change trailers and change no tests.

No nits or operator actions.
