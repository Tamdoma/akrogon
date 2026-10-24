# Seat B leaf draft review

Disagreements only. Paths below are relative to the reviewed draft root. No draft edited, herdr mutation made or akrogon command run.

## F1. delivery_error is required for operations that do not record delivery errors

Evidence: session-routing/brief.md:16 says a failure of agent start, prompt, busy notice or either tab close populates delivery_error.command. Only dispatchSlot's recordFailure writes that field (`src/next.ts:546-569,627,667`). Busy notices throw through command; reconcile's closeTab records a kept-resource error (`src/reconcile.ts:666-675`). The coverage lock explicitly preserves those paths' existing return/error behavior.

Replace criterion 4 with:

> Agent start, agent prompt, the busy notice and both reconcile tab closes run with the resolved `--session`. Agent start and prompt delivery failures record the exact executed argv in delivery_error.command. Busy-notice and tab-close failures preserve their existing error or kept-resource behavior, with any recorded command identifying the routed argv.

## F2. The log criterion names a field the product does not store

Evidence: session-reads/brief.md:19 requires a log line to record a null pane. `src/log.ts:9-22,46-61` stores native agent `session`, not a pane field. The Taken rule makes the diagnostic candidate null, not a new serialized pane field.

Replace criterion 7 with:

> A log move with no slot records `session: null` even when HERDR_PANE_ID is set. With a slot, diagnostic native-session attribution comes from that slot's validated pane in the resolved session, without an environment-pane override.

## F3. “Keeps a tab whose pane is live” forbids legitimate existing cleanup

Evidence: session-reads/brief.md:14 promises to keep every tab with a live pane in any session. Existing closeMergedTab intentionally closes a live completed tab (`src/reconcile.ts:383-387`); mergedWorktree also closes eligible live tabs (:694-699). Session-routing owns preserving those validated closes. Cross-session-reads locks conservative keep-vetoes, not a ban on all live-tab cleanup.

Replace criterion 2 with:

> Reconcile evaluates its existing keep-vetoes using all session-tagged inventory. A foreign live pane in the worktree remains a veto even when its tab ID equals the recorded tab ID in another session. An unreadable required inventory cannot prove absence or authorize affected cleanup. Existing eligible tab closes remain allowed only after session-routing's acting-use checks.

## F4. Hook proof input uses a transport the command does not read

Evidence: session-reads/design.md:67 says to drive hook invocations with event JSON on stdin. `src/next.ts:1339-1340` reads HERDR_PLUGIN_EVENT_JSON when no explicit input is supplied. The actual plugin wrapper executes akrogon next without stdin parsing.

Replace that paragraph's first two sentences with:

> Proofs use tests/fake-herdr.ts as extended by session-routing (multi-session state and `session list --json`). Drive hook invocations with no explicit target, event JSON in HERDR_PLUGIN_EVENT_JSON and the chosen server-origin socket in HERDR_SOCKET_PATH, matching the existing plugin boundary.

## F5. Existing global capacity is not an open planning choice

Evidence: session-reads/design.md:74 labels whether capacity is per repo or global “Open for the plan,” while also saying it stays as today. `src/next.ts:353-366,400-402` counts all registered repos against global.max_active. The lock changes visibility, not this admission policy.

Replace the whole line with:

> - Capacity policy is unchanged: activeCount counts qualifying leaves across registered repos against global.max_active. This leaf changes session visibility and qualified identity, preserving existing phase exclusions and conservative handling of incomplete repo inventories.

## F6. The producer does not own the binary-override promise its consumer needs

Evidence: watch-session/brief.md:15 requires OBSERVE_HERDR to reach discovery and every observer call. Its design :54 excludes src changes and :64 leaves override propagation to its plan. session-routing owns the shared resolver but does not explicitly promise an executable override. The current shell helper hardcodes `herdr` (`src/shell.ts:203`). A watch implementer cannot satisfy this requirement if the delivered resolver still hardcodes it, and cannot edit the producer's excluded surface.

Add this literal interface to session-routing/design.md:

> - The shared resolver and argv builder accept a caller-supplied herdr executable and use it for every session, workspace and other herdr call they perform. Normal lifecycle callers use `herdr`. This interface is delivered here for watch-session, which passes OBSERVE_HERDR without implementing another resolver.

Replace watch-session/design.md's Open-for-the-plan line with:

> - Pass OBSERVE_HERDR through session-routing's delivered executable-override interface for discovery and observer agent reads. The shared resolver remains the only repo-session resolver.

## F7. log.ts needs a transport owner before the attribution leaf can start

Evidence: session-routing/design.md:71 omits src/log.ts from ownership, while :74 says its panes() call “inherits routing.” The shared helper is changing to require session context, and `src/log.ts:40` currently calls panes() with none. logMove already has the repo argument, so this needs a minimal call-site adaptation in L1. L2 owns attribution changes and is blocked by L1; it cannot repair a compile or stale-transport gap required to complete L1's every-caller promise.

Add to session-routing/design.md's owned surfaces:

> src/log.ts, limited to adapting its existing pane lookup to the resolved repo session and the changed shared transport interface. Slot selection and null-attribution behavior remain owned by session-reads.

Replace its consumers line's log.ts clause with:

> log.ts panes() receives explicit resolved-session context in this leaf; session-reads subsequently changes actor selection and attribution.

## F8. Hook ownership must compare session as well as workspace ID explicitly

Evidence: session-reads/brief.md:5 and criterion 4 require workspace_id equality but do not explicitly require the emitting session to equal the repo's resolved session. Workspace IDs demonstrably repeat across servers (w8 in infra and mdconsultingny, established in the chart's opening evidence). Matching the event socket to some listed session plus a bare workspace ID still admits a foreign event. Current owner matching is already bare-ID-based (`src/next.ts:1429-1435`), so this cannot be left implicit in the replacement contract.

Replace criterion 4 with:

> A hook acts for a repo only when its injected socket identifies the repo's resolved session and its event workspace_id equals that repo's resolved workspace ID. IDs come from the event, regardless of inherited HERDR_PANE_ID. An unknown origin, a different emitting session even with the same workspace/tab/pane IDs, or a different workspace takes no action for that repo and logs why.

In the What paragraph, replace “and it acts only when the event's workspace_id equals the repo workspace's id” with:

> and it acts only when both the emitting session and event workspace_id equal the repo's resolved session/workspace pair
