# Merged territory map 2026-09-19 (A merged; tags (A) (B) (both))

Two destinations in akrogon, one in pi-extensions. #20 item 2 is #18, shipped in c9e31af/c8dac2a (both).

## Class 1 · An execution seat opens a human conversation instead of ending its attempt (#19; #20 items 3, 4, 7)
- (both) Root: pi's global promptGuidelines tell every session to ask for any decision (README "Default interaction policy"); the extension emits `herdr:blocked`; akrogon counts `blocked` as busy (src/next.ts:169-173). The blocked event reaches dispatch (only `working` returns early, :604-607) and dispatch waits.
- (B) `implement -> failed` is not a legal move (src/routing.ts:26-38; src/phase.ts:106-108). Failure today only comes from three exhausted attempts, and dispatchSlot returns for blocked panes before the cap (:369-385). "The skill calls phase failed" is not implementable without a CLI change.
- (B) Existing test permits a blocked inactive peer while the other seat runs (tests/next.test.ts:1565-1596). Ending on blocked must apply to the required seat of the current phase only.
- (both) skills/implement-issue/SKILL.md:39 says tell the operator and wait; contradicts the 2026-09-19 rule.
- (both) Elegant option: charting is interactive, execution is not. Remove the question tool from execution seats at the tool (pi-extensions contract from akrogon's launch context), and akrogon ends the attempt on a required-seat `blocked` event with a reason-bearing terminal outcome, preserving the worktree. No clock.
- (A) Recommend reuse of `failed` with a reason field over a new state. (B) same, provided reason and interrupted phase are retained and recovery is supported.
- Locks carried: no clocks, polls, watchdogs (seat-stall-detection); stall notifier retained (stall-notifier-removal).

## Class 2 · Blocked and final states never become accurate, pushed operator state (#19; #20 items 3, 6)
- (both) All alerts are `herdr notification show` (:199, :477), in-app only. The 60-minute notice runs only on a later observation.
- (both) commitMove spreads prior state, so merged keeps busy_since (src/phase.ts:26-41); next skips observation for merged (:468-477); status prints from busy_since (src/status.ts:87-100).
- (A) Discord webhook transport exists (broadcast.discord.webhook_env, src/config.ts:46; skills/broadcast-issue). (B) Its contract is team completion broadcasts, not private failures; decide the target explicitly, and a 200 does not prove the operator saw it. Missing config must be loud.
- (both) Elegant option: one owner for the terminal transition and its notification; failure is visible in status and pushed on the event. Merged clears live seat fields (busy_since, busy_notified, prompted) but keeps pane/tab/worktree for cleanup (:509-515). Old merged records are rendered terminal-aware, not migrated (B).
- (A) Merge classes 1 and 2 into one chart: the destination is one observable outcome, a seat that cannot proceed becomes a visible pushed failure within one event, and the shared stop/reason interface is settled once (B K8).

## Class 3 · Execution admits requirements it has not proven (#20 items 1, 5; #19 preflight)
- (both) ensureWorktree uses target(repo) with no readiness check (src/next.ts:241-250; src/config.ts:111-116); fails per leaf on a fresh repo.
- (both) chart-issues Take names credentials but nothing requires write proof; GET-only probes passed. (B) The consumer probe script proves custom field and calendar writes only; events.write is never proven (probe-ghl-scopes.ts:32-33), it logs failures without throwing and deletes a hardcoded field. Not a generic recipe.
- (both) Elegant option: chart handoff is the attended admission boundary: usable git base and operation-level write proof recorded in the chart before any leaf state is written; next keeps a narrow refusal at the runtime use boundary. Consumer owns service-specific probes. Chart drafting itself needs no git base (B).
- Forks: refuse vs bootstrap an empty remote (B K1, recommend refuse); where checked (B K2, handoff plus runtime); proof shape (B K3, operation-level proof, hold handoff when no safe proof exists, never GET-only).

## Off route
- herdr answer/read API for blocked panes (#20 item 4). Herdr upstream, not needed to make execution noninteractive (both).
- Consumer repairs: boulevard GHL scopes, the pending session, the watchdog (both).
- pi-extensions execution capability switch: separate registered repo, charted there once the akrogon contract names the interface (both).
