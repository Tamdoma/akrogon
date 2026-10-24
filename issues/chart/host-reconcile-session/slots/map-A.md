# Map A: host-reconcile-session

## Cause (confirmed in code)
- Two stop sites judge a leaf slice by tab presence in one session's pane list:
  - per-repo reconcile slice step, src/reconcile.ts:507-531 (sliceKeepReason then stopSlice at :525).
  - reconcileHost leaf-matched branch, src/reconcile.ts:1190-1201 (stopSlice at :1199).
- sliceKeepReason (src/reconcile.ts:196-212): tabLive is a bare tab_id match (src/reconcile.ts tabLive), list from panes() = `herdr pane list` on the inherited socket (src/shell.ts:215-217).
- The matched branch never asks sliceHasProcess (src/reconcile.ts:177-181). The unmatched branch does (src/reconcile.ts:1227-1230). So a slice with a running agent inside is stopped when its tab is not in the caller's session.
- Entry paths: reconcileRepos ends with reconcileHost over all registered repos (src/next.ts:1322), from next at src/next.ts:1399,1406,1410,1428; and the plugin hook path src/next.ts:1440-1447 runs reconcile for the completing repo then reconcileHost for all repos. Hooks fire in every herdr session, so any session's event can sweep every repo.
- reconcileHost ignores repo pause (isPaused is only checked in reconcileRepos at src/next.ts:1308 for the per-repo step), so pausing a repo does not protect its slices.
- Per-repo step can hit the same bug when `akrogon next` walks all registered repos (src/next.ts:1406,1428) from a session that does not hold that repo's tabs.

## Forks
- F1 timing: interim fix now vs fold into session-routing.
  - Interim: small, stops kills today. Invites: session-routing rebase on src/reconcile.ts; two definitions of "live" if not unified later.
  - Fold: one change. Invites: kills continue until it lands; session-routing is a large leaf in plan.synthesis.
- F2 keep rule for a leaf-matched slice:
  - O1 keep while the slice holds a process unless the tab is proven gone in the repo's own session. Breaks: leftover agent processes of a closed tab survive until a pass can see that session (today: until run from the owning session).
  - O2 keep when the tab is absent from the caller's session (treat absence as unknown). Same leftover cost, but also keeps empty slices, which are harmless to stop.
  - O3 read every running session (`herdr session list` + `--session`) and keep if the tab exists in any. This is session-reads' mechanism and needs session-routing's discovery first.
- F3 scope of fix: both stop sites (per-repo :525 and host :1199) or host only. Host-only leaves the `next` all-repos walk exposed.
- F4 leftover cleanup: who kills a truly orphaned slice after the fix. Today the point of the slice step is "killing leftovers" (comment src/reconcile.ts:508-511).

## Pitfalls and tests
- A test needs fake-herdr panes that omit a tab while the slice holds a process; tests/fake-herdr.ts has one store today, so a "tab absent here" case is simulated by the pane list alone, no session support required for O1/O2.
- Regression test: matched slice, tab absent from pane list, process inside → kept with a reason; same with no process → stopped (keeps leftover cleanup for empty slices).

## Coverage gap vs emitted contracts
- session-routing criterion 6 and session-reads criterion 2 cover liveness lookup in the resolved session and unknown-keeps. Neither names stopSlice, the host branch, the hook entry path, or the process-inside guard. A planner could make reconcileHost per-repo-session and still stop a slice when the repo's session is the wrong one or unreadable without a test proving it.
