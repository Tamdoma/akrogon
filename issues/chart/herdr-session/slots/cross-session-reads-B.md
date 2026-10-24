# Seat B blind notes: cross-session-reads

2026-10-24. Read only permitted context and source, not this fork's Findings, A draft or other seats' notes. Session-address Taken and sa-proposed-shape are accepted locks. In particular, the operator chose to skip a listed-running session when its read returns server_not_running; my earlier objection is not reopened here. No herdr mutation performed.

## Q1. Capacity, reconcile and hook ownership across sessions

### Pick, reason and cost

Use session-qualified inventory rows and explicit completeness, with two views derived from the same observations: the resolved repo session/workspace for recorded-ID operations, and all relevant running sessions for host-path occupancy and global capacity. Retain session identity when joining pane to tab to workspace. Never flatten into maps keyed only by pane_id or tab_id.

This adds no session field to leaf state. Session identity belongs to the current inventory and resolved target. Cost: adapt the shared panesOnce assumption, carry a session key through joins, and expose incomplete reads distinctly from successful empty lists. Reuse bounded per-invocation inventories, updating the affected view after this invocation creates/closes objects, as allocation already refreshes after closure (`src/next.ts:387`). A cached pre-launch global count must not permit subsequent launches beyond max_active.

Capacity: preserve the existing count policy of active non-merged/non-failed leaves once each, not once per pane. Its recorded-tab arm uses only that repo's resolved session; its worktree-cwd arm searches all sessions so an old misplaced seat still occupies capacity. Do not demand acting-use worktree corroboration for a conservative recorded-tab liveness observation: that would weaken the locked keep/count semantics. Preserve existing unknown/unreadable leaf and registry admission behavior. An unreadable required pane inventory makes global admission unproved; do not count unseen leaves as inactive. Existing seats can still be observed or allowed to finish where their own evidence suffices. Null-cwd panes remain the expressly accepted limit of path matching.

Reconcile: recorded tabLive and broadcast-seat checks use the repo's resolved session, retaining the locked no-cwd keep-veto. Host-path livePaneInside searches every session. foreignPaneInside must treat the leaf's own tab as the pair (resolved session, stored tab ID); a same-ID tab in a different session is foreign, even if its pane sits exactly at the worktree root. A successful positive occupancy observation may keep a resource without a complete global inventory. A negative result cannot authorize removal unless all required views are complete. Tab closes are acting uses: require the accepted tab's resolved-workspace membership and member cwd evidence, then target its session explicitly. Keep unresolved repos' pane effects refused while preserving conservative keep-only operations.

Hooks: capture origin context before retargeting any herdr command. For a directly server-launched event hook, match its injected HERDR_SOCKET_PATH to a session-list socket and use the parsed event's workspace_id and pane_id/tab_id. Retain workspace_id in the boundary schema; the current hookEventSchema drops it. Resolve candidate repos and compare the emitting session and workspace against each candidate's resolved placement before matching stored IDs. A different-session same ID is not an owner. Multiple qualifying owners refuse visibly; no owner means no wake. This runs within the locked per-repo refusal boundaries, not as an uncontained global throw.

For tab_closed, the tuple (emitting session, event workspace_id, closed tab_id) selects a possible recorded owner despite the missing live tab. It authorizes a wake/reconcile decision, not a close of another live tab or reuse of uncorroborated pane IDs. Subsequent effects must independently pass the existing acting-use and second-seat guards. The same distinction is needed for pane_closed/pane_exited when no live pane remains. State explicitly whether this event-only wake is an exception to the live corroboration rule for ownsPane; otherwise the implementation must either guess or lose closed-object wakeups. Never use the focused pane or ambient pane variable as a substitute for the event target.

### Rejected options

- O1: One ambient pane list for every repo. It hides seats and occupancy in other servers and changes global capacity/cleanup conclusions with the caller's stale environment.
- O2: Concatenate lists then join bare IDs. Different servers can reuse identifiers. In particular, foreignPaneInside's current bare-tab exclusion can mistake a foreign same-ID tab for the leaf's own tab.
- O3: Treat every pane as a capacity unit, or change phase exclusions. This changes the product's existing admission policy rather than fixing session visibility.
- O4: Filter conservative keep/count observations by the acting-use cwd predicate. The operator explicitly locked a broader veto. A failure to prove ownership can prevent action without proving absence.
- O5: Convert failed reads into [] or silently use only responding sessions. Follow the specific server_not_running skip rule, but preserve other errors/deadlines as unknown and block dependent admissions/removals.
- O6: Infer a closed object's owner from its bare stored ID, current focused pane or plugin cwd. The object is gone, IDs are server-local, and plugin cwd is its plugin root.

### Evidence, tier and date

- Operator tier, 2026-10-24: session-address Taken defines no saved session, separate scoped-only versus acting uses, second-seat scanning across sessions, and deferred tab_closed handling. sa-proposed-shape fixes skip-on-server_not_running, per-repo refusal, 10-second discovery deadlines and no new notifications.
- Better-than-training tier, akrogon source inspected 2026-10-24: activeCount (`src/next.ts:353-366`) currently lists one session, counts leaves by recorded tab OR worktree cwd, and conservatively counts unknown registries/leaf inventory. allocate refreshes after closure (:373-388). Shared one-session panesOnce is :1346-1354. Hook schema :75-98 parses event IDs but omits workspace_id; paneOwners :1325-1334 and ownsPane :159-160 compare bare IDs. Closed-tab ownership :1429-1435 has no emitting-session qualification today.
- Better-than-training tier, akrogon reconcile source inspected 2026-10-24: `src/reconcile.ts:183-211` implements broadcast and slice liveness vetoes; :245-256 implements path occupancy and bare-tab comparisons. closeMergedTab :383-387 uses a direct unqualified CLI close. Repo cleanup :689-705 and :760-770 preserves unavailable inventory, checks foreign occupancy and conditionally removes worktrees. Host live inventory consumers include :1193 and :1251. Existing filesystem/process vetoes remain useful but cannot repair cross-session joins.
- Better-than-training tier, official Herdr v0.9.1 source read via git show at tag commit 8544776216a8d28088db59a5344ea21ee2d05d2b in `/home/ivan/Work/infra/herdrdev/herdr`, inspected 2026-10-24: `src/app/api/plugins/runtime.rs:38-46` supplies the server socket and context, :61-72 supplies event JSON and optional workspace/tab/pane IDs, :121-128 applies env to the spawned command, :218-267 builds event-specific context before launch. `src/api/mod.rs:20` names the socket variable HERDR_SOCKET_PATH. This is source-level evidence for direct plugin invocation, not a proof about arbitrary descendants or the upstream background-job pool.
- Better-than-training tier, that Herdr tag's `src/app/api/plugins/context.rs:100-108` sets workspace_id and tab_id for TabClosed from the event, leaving focused_pane_id absent. PaneClosed :148-155 sets its event pane ID. PaneExited and PaneAgentStatusChanged :166-186 can fall back to workspace context when the pane is unavailable, so the event payload remains the reliable target. `src/plugin_command.rs:5-9` sets plugin-root cwd; `src/noninteractive_process.rs:4-7` uses Command::new rather than clearing the inherited environment. These sources do not guarantee that an absent optional pane env variable is erased.
- Better-than-training tier, official v0.9.1 CLI reference, consulted earlier 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/cli-reference.mdx , Saved SSH machines, documents server-local workspace/tab/pane IDs. B's earlier live workspace lists demonstrated w8 in two sessions. No named practitioner was supplied; these policy recommendations are B's inferences.

### Pitfalls and removal

- R1: A global bare-ID index merges unrelated objects. Remove it with qualified keys and session-local joins before any state comparison.
- R2: Same tab ID in another session suppresses a foreign-pane keep-veto. Remove it by including session identity in the own-tab exception, not by strengthening or deleting the existing path veto.
- R3: Successful resolution is mistaken for complete global pane visibility. Track the dependencies separately. A readable workspace list cannot prove a readable pane list or safe global absence.
- R4: A closed-tab hook inherits some unrelated HERDR_PANE_ID. Ignore that variable for event target selection. Use the actual event tuple and the directly injected origin socket.
- R5: New tab creation is admitted repeatedly from a stale cached count. Update observed occupancy after mutations or recompute the relevant view within the locked pass. Keep the existing global lock and current admission policy rather than adding a second scheduler.
- R6: An old-session event causes new paid work after repo placement moved. Require emitting session/workspace to match resolved placement before scheduling that owner, then independently apply the second-seat guard before replacement.

### Questions the fork does not ask

Q3: Will the operator accept event-qualified wake matching for closed panes as well as closed tabs, with live actions still separately corroborated? The fork must say this explicitly because live membership cannot be checked after closure.

Q4: When a listed-running server returns server_not_running during pane discovery, does the operator's stopped-session exception apply to that inventory too? State one consistent rule alongside its limits. Do not silently use the exception for arbitrary permission/protocol/deadline errors. A server may restart under the same name later; the locked fixed snapshot is not continuous global uniqueness proof.

## Q2. When is inherited HERDR_PANE_ID trusted for attribution?

### Pick, reason and cost

Never trust an arbitrary inherited HERDR_PANE_ID as owner identity or as diagnostic session attribution by itself. For a direct parsed plugin event, prefer the event target, qualified by proven server origin and its event workspace. Plugin env is a transport from the emitting server, not a universal validation of every inherited pane variable.

For a manual next invocation with no event and no explicit selection, an inherited pane may be a caller hint only after its origin session and live tab/workspace/worktree membership establish exactly one owner under the locked acting-use contract. A bare socket/pane pair can be stale together; matching them to a real pane does not prove the caller runs there. Prefer resolving the repo from its actual cwd and explicit CLI target. If the no-event pane-based wake behavior must remain, require it to agree with that established repo/worktree scope, or refuse attribution instead of reaching another repo through a stale hint.

For logMove, the requested slot and its recorded before.pane[slot] should determine the candidate, validated against the resolved session/workspace and expected worktree before reading its agent_session. Do not let an ambient pane override that slot. When slot is null, record diagnostic session null unless an explicitly validated actor exists; a command-owned land should not inherit a seat attribution. Missing/unreachable diagnostic context remains null under the existing committed-move behavior. Its log field session means native coding-agent session, not herdr session; do not silently change the field's meaning.

Cost: remove ambient precedence in logMove and distinguish direct event context, manual selection and diagnostic actor at entry boundaries. No new log/state field is required for this recommendation.

### Rejected options

- O7: Trust HERDR_ENV=1 or pane ID presence. Both can be inherited by the stale background process described in the intake.
- O8: Trust a valid socket plus existing pane ID in any session. The stale pair can correctly identify a different live pane. Existence is not caller provenance.
- O9: Trust HERDR_PANE_ID for every plugin event. The injection is optional and TabClosed has no focused_pane_id. Pane status/exit context can fall back to a workspace's current pane rather than preserve the event target.
- O10: Make missing diagnostic attribution block or undo a committed phase move. The current log design explicitly treats this session as diagnostic; preserve that behavior while preventing false attribution.

### Evidence, tier and date

- Operator tier, intake Observation, 2026-10-24: the background job carried a mutually consistent socket/pane pair from an unrelated session. The historical process-pool explanation is unverified, but the failure input is exactly why existence alone is insufficient.
- Better-than-training tier, 2026-10-24: `src/next.ts:1338-1345` parses a plugin event but selects hookPane from the environment; :1463-1465 performs the no-input owner route. `src/log.ts:36-46` gives inherited HERDR_PANE_ID priority over the requested slot's stored pane, then reads native agent_session into the diagnostic session field. `src/land.ts:16-17` explicitly describes a seat-free service, reinforcing that a pane is not a universal actor.
- Better-than-training tier, Herdr v0.9.1 source and direct-plugin boundary references under Q1. No live hook was generated here, since doing so can trigger akrogon dispatch. Source shows server env injection; it does not attest background-job env refresh.

### Pitfalls and removal

- R7: A phase log credits an unrelated native agent session because a stale env variable won over slot state. Remove that precedence and require the current slot's live ownership evidence.
- R8: A direct plugin source guarantee gets generalized to ordinary processes. Capture the event boundary once and keep manual selection tied to actual cwd/explicit target. Do not treat marker-variable presence as authentication.
- R9: Attribution repair changes lifecycle success semantics. Keep null diagnostic attribution where no actor is proved; report independent routing failures according to the locked refusal policy without replaying committed work.

### Question the fork does not ask

Q5: Does no-event `akrogon next` need the ambient pane-owner route when its cwd cannot establish a registered repo/worktree? Pick no cross-repo action from that hint alone. Preserve the operator's explicit target and --resume behavior instead of allowing stale caller metadata to select another repo.

## Verification and proof limits

The stopped-and-ambiguous final-check return is `no change`: src/shell.ts run has deadlineMs at :93-121 and retryCommand forwards it at :130-135. Current herdr()/command() do not expose that argument, so implementation must deliberately route discovery through the existing deadline-capable entry. A timeout throws from run before retryCommand's normal nonzero-result retry branch; no claim of a second timeout attempt is implied.

Use the session-aware existing fake for colliding tab/pane IDs, partial inventories, foreign same-ID root panes, native session log attribution, closed events without pane env, event/ambient target disagreement and refreshed capacity after one launch. A live direct-hook env proof, if named in the leaf contract, needs an isolated disposable plugin/session with production startup dispatch excluded, sanitized output limited to these context fields, and verified cleanup. It must not print arbitrary process environment or launch paid agents. No hook activation or mutation was performed by B.
