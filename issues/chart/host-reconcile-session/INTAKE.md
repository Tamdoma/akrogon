# Intake: host-reconcile-session

## Scope

Host-wide reconcile must never stop a live seat's slice because the seat's tab sits in a different herdr session from the invoking process. Destination: akrogon (src/reconcile.ts reconcileHost). Overlaps the handed-off herdr-session leaves (session-routing criterion 6, session-reads criterion 2), which are already emitted, so this arrives as new intake.

## Provenance

- Operator: 2026-10-24 door message (watch-framework agent report, pasted)
- Operator: 2026-10-24 autopilot switch-on

## Source: operator 2026-10-24

New akrogon issue to chart: host-wide reconcile stops live seats of repos whose tabs live in a different herdr session. Observation: at 2026-10-24 15:45:20 CEST every framework seat scope was stopped at once (journalctl --user: "Stopping akrogon-l<hash>-pwAp1H*.scope" for slices l1e8e171fd947, l6778bcddd3a4, l79b40e337ac4, la354bb9538c5, ld184a5b8e657, le1e9beb63230; herdr infra server log ~line 29050 shows each pane exit with SIGHUP and no api close request). All those seats live in the infra herdr session, workspace wA. One second earlier (13:45:19Z) the personal herdr session (lingua-relay leaves) logged an agent.prompt, and the infra session received no request before the stops, so an akrogon next for lingua-relay running in the personal session is the suspected trigger (matched by timing, not proven). Suspected cause: reconcileHost in src/reconcile.ts walks every loaded akrogon-l*.slice across all registered repos, and sliceKeepReason (reconcile.ts:196-212) keeps a slice only if tabLive(live, leaf.state.tab) finds the tab in livePanes() (reconcile.ts:1155, 1193). livePanes comes from `herdr pane list` (src/shell.ts:215), which only lists the calling process's herdr session. A leaf whose tab is in another session therefore reads as dead and its slice is stopped. Impact: 7 framework leaves lost their seats mid-work (a paid run under one seat was killed earlier the same way, grant G18), and it recurs whenever any repo's next runs from another herdr session. Workaround: rerun akrogon next from the owning session. Expected: a slice whose tab cannot be judged from the current session's pane list is kept, not stopped.

## Source: operator 2026-10-24 autopilot switch-on

what do you need from me now. I need you to fix this all on autopilot. I want everything to work normally. Every session and workspace only takes care of its own session and workspace, there should be no care about others, otherwise everything gets chaotic. Use both consultants to figure this out and fix it.

## Source: operator 2026-10-24 route

o1 on autopilot

## Agent findings

- Confirmed in code: reconcileHost (src/reconcile.ts ~1140-1200) holds one `panes` list for the whole host pass, filled once by panesOnce(). Every repo's leaf slice is judged against it by sliceKeepReason (src/reconcile.ts:196-212), whose only tab test is tabLive, a match on `tab_id` in that list. No session or repo tag is involved, so a tab in another session reads as dead and stopSlice runs.
- panes() is `herdr pane list` through herdr() (src/shell.ts:215-217), which follows the inherited HERDR_SOCKET_PATH, so it lists one session.
- Coverage in emitted contracts: session-routing criterion 6 says reconcile tabLive looks up the stored id only in the repo's resolved session. session-reads criterion 2 says an unreadable running session closes nothing whose liveness it could decide. Neither names the host slice-stop path (stopSlice) or a test where one repo's command, run from another session, passes over a second repo's live seats. session-routing is in plan.synthesis (busy A, 16m at 14:15Z), session-reads waits on it.
- Not yet checked: whether the trigger was lingua-relay's next (timing match only), and the earlier G18 kill.
