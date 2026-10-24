# Seat B blind notes: session-address

2026-10-24. Read only the permitted intake, Question/Carries sections and source evidence. No Findings, A draft, merged map or other seat's notes were read. The two-chart split is locked; no other choice is treated as taken.

## Q1. Discovery or declared per-repo setting?

### Pick, reason and cost

Pick discovery across running local sessions by exact workspace label equal to the registered repo name, requiring one match. This directly implements the intake's expected behavior without adding a maintained session mapping. Resolve a typed session/workspace target before consuming recorded pane/tab IDs, not merely before creating a new tab. Allocation currently closes recorded panes before workspace lookup (`src/next.ts:373-408`).

Cost: structured session-list parsing, workspace inventories and failure handling. Reuse a bounded inventory within an operation rather than scanning for each individual pane action. Missing, duplicate and unavailable inventories must have distinct results; their detailed policy belongs to stopped-and-ambiguous. Exact label matching is an identity contract explicitly supplied by the intake, not a prose-format check.

### Rejected options

- O1: Declared per-repo session setting. It adds config and an operator-maintained second mapping for a relationship already visible in herdr. `src/config.ts:38-65` has no current herdr placement setting. It also needs a policy for labels duplicated outside the declared session. If the operator wants intentional duplicates with an authoritative configured binding, that changes the intake's ambiguity contract and should be an explicit decision.
- O2: Ambient socket, HERDR_SESSION, pane environment or focused UI. The reported stale parent environment is the failure input. Trusting another inherited selector cannot establish the repo's destination.
- O3: Prefer the ambient session, then search others, or take the first label match. Either can silently select one of multiple repo workspaces. Search completeness is required to prove uniqueness.

### Evidence

- Operator tier, 2026-10-24: INTAKE.md, Scope and source Expected behavior require workspace discovery independent of inherited HERDR_SOCKET_PATH, with visible refusal for missing/ambiguous matches. Historical paid-run and Claude-spare details remain report claims.
- Better-than-training tier, source inspected 2026-10-24: `src/shell.ts:173,202-223` exposes only a session-local workspace list, and `src/next.ts:407-408` uses its first label match. `src/config.ts:38-65` contains no declared placement binding.
- Better-than-training tier, live proof from B's opening map, 2026-10-24, installed herdr 0.9.1, OS user ivan: `herdr session list --json` returned session names, running flags and sockets. Setting the mdconsultingny socket while running `herdr --session infra workspace list` returned infra. The actual akrogon workspaces() helper under the stale socket returned mdconsultingny. These were read-only calls, with no live fixtures or cleanup required. They prove current selector behavior, not full dispatch.
- Better-than-training tier, official Herdr v0.9.1 CLI reference, consulted 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/cli-reference.mdx , Sessions, Workspaces and Environment variables. It documents session list JSON and named-session selection. No external practitioner opinion was supplied or solicited; the recommendation is B's inference from these surfaces.

### Pitfalls and removal

- R1: Resolving the correct workspace after earlier wrong-session effects. Remove it by establishing the explicit destination before allocation's first recorded-ID use, busy observation and other live effects. `src/next.ts:719-723` observes stored pane IDs before allocate, so moving only line 407 is insufficient.
- R2: Session-specific selection works for creation while later helpers inherit the stale socket again. Remove it by carrying the resolved target through the call chain. The existing global flag precedence proof covers `--session`; an env-only implementation needs its own proof.
- R3: A setting gets added just to avoid discovery error cases. It cannot remove server outages or stale stored IDs. Keep those states explicit under the existing discovery contract.

### Question the fork does not ask

Q3: Does discovery establish a target for the entire operation, with a mismatch causing refusal, or may a later read silently retarget after workspace movement? Pick the former. Every individual call still may fail if the server disappears; this does not justify a new cross-server locking mechanism. Stopped/unreadable sessions and per-repo continuation stay in their related fork.

## Q2. Record session in leaf state or derive it each pass?

### Pick, reason and cost

Pick a saved session discriminator alongside the saved tab/pane IDs. It records the origin of those IDs, not an override of current repo workspace discovery. Discover the desired repo placement each pass. Before a saved ID can authorize observation, prompting, rename or close, its stored session must agree with that target and its live object must belong to the selected workspace. A mismatch refuses with both locations; it does not overwrite the old address or close the old seat.

The crucial distinction is between the repo's current desired destination and an existing leaf's recorded address. Deriving the first cannot reconstruct the second once the workspace has moved. A session name is enough for server namespace discrimination only to the extent the chosen herdr contract proves it. Do not infer process continuity or a boot identity from it.

Cost: one state schema extension and reader compatibility, explicit target plumbing, and a repair path for legacy or moved state. Bind session and IDs in the same saved state update. Do not introduce a separate address registry. For new leaves with no IDs, discover normally. For old state without a session, adopt only after uniquely proving the recorded objects' workspace/worktree ownership across the relevant live inventories, otherwise refuse for repair. A bare ID match alone is not that proof. Keep the detailed adoption predicate in the leaf design rather than allowing the implementer to guess it.

### Rejected option and concrete consumer trace

Reject deriving a session each pass and applying existing IDs in that session. It is simpler only if those IDs never outlive workspace placement. Current consumers do not have that guarantee. Derivation can be made safe by refusing all unproved IDs and finding their original session through additional inventory/provenance checks, but that is effectively reconstructing the saved address repeatedly. It also has no original-session discriminator for a closed-tab hook after the object disappears.

The table describes the change each option needs. “Saved” means the recommended address plus validation, not a magic safety guarantee from adding a field.

| Consumer | Workspace moves from session X to session Y: derive only | Workspace moves: saved session | Same session restarts: both options |
| --- | --- | --- | --- |
| State (`src/state.ts:96-103`) | Existing tab/pane strings are reinterpreted in Y. Their origin X is lost. | Retain X, compare with discovered Y and refuse. Rebinding must replace the related address deliberately. | Session name may stay the same. Neither option proves that a pane's previous process survived. Persisted IDs are locators, not process identity. |
| Allocation and dispatch (`src/next.ts:373-399,428-434,719-723`) | A colliding pane can feed busy observation or scope lookup/closure. A colliding tab satisfies the stored-ID arm without worktree evidence. If no old tab appears in Y, a new tab can be created while X still has a seat. | Reject the X/Y mismatch before these reads and effects. On agreement, constrain stored IDs to the resolved workspace and retain existing scope/agent checks. | Missing restored objects require explicit recovery/reallocation, not foreign-object adoption. Restored objects may have new shell/agent processes. Existing scope checks remain necessary; saved session adds no exemption. |
| Hook ownership (`src/next.ts:159-160,1325-1334,1429-1435,1463-1465`) | Reinterpreting old IDs under Y can select the wrong leaf or create false multiple owners. A tab-close event has no remaining live tab to prove origin. | Match event origin session together with recorded tab/pane identity. A late X event must not become permission to launch in Y. Desired-placement mismatch still refuses effects. | An outstanding pre-restart event or wait is not proven current by matching the session name. Tie hook handling to established origin and current ownership; do not invent an epoch unless the actual hook contract requires one. |
| Reconcile (`src/reconcile.ts:183-211,251-256,383-387,689-705,760-770`) | X's live tab can disappear from the chosen view, affecting slice keep-vetoes. A Y ID collision can keep or close an unrelated tab. Existing filesystem/process vetoes reduce some consequences but do not repair addressing. | Qualify recorded-tab and broadcast-seat comparisons by X; refuse mismatch for actions. Keep a complete cross-session view for filesystem live-pane vetoes. Never turn an unavailable X inventory into an empty view. | An unavailable server remains unknown. On a healthy restored server, inspect actual live panes and existing process/scope checks. Neither a stored session nor restored layout proves a process was preserved. |
| Phase (`src/phase.ts:61-78,82-108,128-174`) | Rename or failure notice can target Y while the leaf's tab remains in X. A colliding ID can rename the wrong tab; tab-not-found is currently warned and skipped. | Use the validated recorded address for the recorded tab, with no silent reroute when discovery says Y. Repository notices need the resolved repo context, not the inherited socket. | If the tab did not restore, preserve the existing committed-move semantics and report follow-up failure accurately. If it restored, validate the live address. Do not roll back a phase already committed merely because a notification fails. |
| Detached land (`src/land.ts:17-46,68-80,83-116`) | Deriving at child start avoids the inherited socket only if every child path does it. A workspace move while verification runs can make later mergeWake/landedWake reinterpret old IDs in Y. | Re-read leaf address and compare current placement before pane effects in wake paths. Copying a resolved socket once is insufficient for long-running child work. Keep the Git attempt claim separate from herdr address validity. | The child can outlive the herdr server. Reconnect/re-resolve at wake, validate current address and existing attempt claim. Do not repeat Git landing just because a pane follow-up failed. |

Also reject “save the session and always trust it.” That would continue acting in X after the only repo workspace is in Y, violating the intake's workspace rule. The recommended mismatch refusal is what reconciles address provenance with desired placement.

### Evidence

- Better-than-training tier, inspected 2026-10-24: consumer paths and lines in the table. Allocation accepts a stored tab ID independently of its worktree-matching alternative (`src/next.ts:393-398`). ownsPane likewise accepts a recorded bare pane independently of cwd (`src/next.ts:159-160`). State has no session discriminator today.
- Better-than-training tier, official Herdr v0.9.1 CLI reference, consulted 2026-10-24, Saved SSH machines: workspace, tab and pane identifiers belong to one server. B's earlier live lists showed workspace w8 in both infra and mdconsultingny. This demonstrates workspace collision, not an observed tab/pane collision.
- Better-than-training tier, official Herdr v0.9.1 Session state and restore, consulted 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/session-state.mdx , What survives, Snapshot restore and Native agent session restore. Restart restores layout but replaces original processes; eligible agents can resume through integration references. This documentation does not establish an exact public-ID continuity guarantee. No server was restarted for these notes.
- Operator tier, 2026-10-24: intake records an old real tab in infra and a wrong-session spawned seat. Its historical targets are not verified as still present; no cleanup is implied by this recommendation.

### Pitfalls and removal

- R4: Saved session is mistaken for a permanent repo binding. Remove it with the explicit comparison to current unique workspace discovery and refusal on mismatch.
- R5: Restart is mistaken for preserved execution. Remove it by retaining existing live agent, native session and scope checks. A saved address is a namespace locator. Exact restore-ID behavior needs an isolated proof if the leaf relies on it.
- R6: An upgrade silently drops legacy live seats and launches replacements. Remove it with unique ownership proof before adoption and a clear refusal when proof is missing. Do not reset prompted, attempts or delivery state merely because a new session field is absent.
- R7: Hooks and cleanup consume IDs before allocation repairs state. Remove it by applying the address contract at their own boundaries. Scope confinement already handles its process boundary; do not duplicate its checks to solve session routing.
- R8: A routing failure after phase commit or Git landing causes the entire operation to replay. Preserve commitMove's committed-error behavior (`src/phase.ts:155-185`) and land's existing attempt guards, while reporting the failed follow-up. Address repair must not invent rollback or exactly-once Git behavior.

### Questions the fork does not ask

Q4: What exact repair is permitted when the recorded session differs from discovered placement? Pick visible refusal and operator-directed recovery, with no automatic migration, killing, or replacement paid seat in this scope.

Q5: What establishes legacy address ownership and closed-hook origin when no live pane remains? Settle the permitted evidence explicitly before handoff. The cross-session-reads fork owns inherited HERDR_PANE_ID trust and origin qualification; this fork must not assume that ambient socket plus pane ID is reliable provenance.

Q6: Is restart recovery required to preserve public IDs, or only to refuse/recover safely when they change? Pick safe recovery. Do not add boot-generation state unless an inspected provider contract or concrete scenario requires it. If stable restored IDs become a criterion, A needs a disposable session restart proof with cleanup. These notes authorize no server restart, model launch, pane closure or state migration.
