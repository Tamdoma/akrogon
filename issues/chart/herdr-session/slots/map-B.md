# Seat B independent territory map

Date: 2026-10-24. Destination: akrogon. Read no other seat's map. Recommendations below are B's, not operator decisions. No repository writes or live mutations were made.

## Verified territory

- F1: The reported routing mechanism is present. `src/shell.ts:202-205` runs bare `herdr`; `src/shell.ts:99-103` supplies the credential environment, with no explicit session argument. `src/next.ts:407-408` finds the first matching workspace only in that connection. A read-only call to the actual `workspaces()` helper under the report's mdconsultingny socket returned that session's workspaces and no framework workspace. This verifies the mechanism, not the historical paid run or Claude spare-process explanation.
- F2: Live routing can be explicit without changing the parent's environment. Installed herdr is 0.9.1. `HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/mdconsultingny/herdr.sock herdr --session infra workspace list` returned infra, including framework/wA and akrogon/w8. Bare per-session listings put formspark-proof at w8 in mdconsultingny. Thus workspace IDs demonstrably collide between servers. Herdr's versioned CLI documentation says workspace, tab and pane IDs belong to one server [E2]. Tab/pane collision risk is documented, not demonstrated by this workspace probe.
- F3: The flaw extends beyond creation. Allocation can close recorded pane IDs before finding the workspace (`src/next.ts:373-408`). State stores unqualified tab/pane IDs (`src/state.ts:96-100`). Hook ownership compares bare tab IDs across registered repos (`src/next.ts:1429-1435`). Global active count uses one connection for all repos (`src/next.ts:353-366`). These are correctness consequences of the same missing session identity.
- F4: Fixing only the typed wrapper misses raw calls. Reconciliation directly invokes tab close (`src/reconcile.ts:383-387,666-668`). Detached land copies the inherited socket (`src/land.ts:33-35`). Watch reads one ambient agent list and indexes it by bare pane (`skills/watch-issues/scripts/observe.ts:85-88,196-205,246-257`). Chart helpers also spawn bare herdr (`skills/chart-issues/scripts/peer-ask.ts:35-49`). `src/turn.ts` was inspected and has no direct herdr call.
- F5: The installed session list supports structured discovery: `herdr session list --json` returned names, running booleans and socket paths. Running: infra, mdconsultingny, personal. Stopped: default, netreachconsulting. Framework currently exists only in infra among the three running sessions. This does not prove the full original incident, nor what stopped sessions' restored workspaces contain.

Evidence tiers and dates:

- E1, operator: mirrored report `issues/seeds/117-akrogon-next-places-seats-in-whichever.md`, Observation, Expected behavior and Suspected cause, dated 2026-10-24. The expected behavior already asks for repo workspace discovery and refusal on missing/ambiguous labels. Historical PID attribution, paid run G9 and manual cleanup remain report evidence, not independently verified facts.
- E2, better-than-training: Herdr official v0.9.1 CLI reference, consulted 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/cli-reference.mdx . Relevant sections: Saved SSH machines (server-local IDs), Sessions (`list --json`), Workspaces, Environment variables (`HERDR_SESSION`, low-level `HERDR_SOCKET_PATH`), and plugin env authority. Live installed help and read-only probes corroborate syntax and explicit flag precedence.
- E3, better-than-training: Herdr official v0.9.1 Persistence and remote access, Named sessions, consulted 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/persistence-remote.mdx . Each named session owns separate panes, tabs, workspaces, sockets and runtime state.
- E4, better-than-training: repository paths and line references in each fork, inspected 2026-10-24. Grounding index, src area and active lessons were consulted. No named outside practitioner was supplied or interviewed. Recommendations are engineering judgments derived from E1-E4, not practitioner testimony. The current stable index advertises 0.9.5, so versioned 0.9.1 docs were used for installed behavior.

## Material forks

### Q1: What identifies the repo's workspace?

Options: discover its exact registered repo label across sessions, add configured session/workspace binding, or retain ambient/caller context.

Pick: discover across running local sessions and require exactly one exact-label match, counting duplicates within one session too. This follows E1 and removes dependence on stale shell context. Resolve before allocation effects, including recorded-pane closure and worktree/environment preparation (`src/next.ts:373-408`). Cost: a structured session boundary schema and extra read calls per inventory pass. Diagnostic refusal should name candidate session/workspace pairs or the failed inventory, not suggest creating a replacement workspace.

Reject configured binding for the initial fix: `src/config.ts:38-65` has no such setting, it creates another maintained mapping, and it changes the report's ambiguity contract. It becomes relevant only if the operator intentionally wants duplicate repo labels. Reject ambient pane/socket, UI focus, parent-PID guessing and first match: stale context is the verified failure, and first match cannot prove uniqueness.

Evidence: E1 operator and E2-E4 better-than-training, 2026-10-24; `src/config.ts:38-65`, `src/shell.ts:173,202-223`, `src/next.ts:407-408`.

Pitfall removed: silently selecting a hidden duplicate. Require uniqueness and explicit targeting, never automatic workspace creation. Practitioner question: does “across sessions” mean running local servers only, or saved stopped sessions too? Q2 must settle that definition.

### Q2: What does a stopped or unreadable session mean?

Options: inspect running sessions only and distinguish failed reads, start stopped sessions to inspect them, or skip all failed reads as empty inventories.

Pick: running sessions define live placement; never launch stopped servers during discovery. A running server whose inventory fails prevents proof of uniqueness, so refuse the affected placement with its error. Cost: a broken unrelated running session can hold placement until repaired. If global capacity cannot be established, preserve conservative admission rather than treating unseen seats as zero (`src/next.ts:353-366`).

Reject starting stopped sessions: it expands a read into server/session activity and can restore panes; E3 distinguishes saved restore from detach. Reject swallowing failed inventories: no match and unknown match are different states. Reject a cached result as permanent truth: workspace rename/closure or session restart can invalidate it. A bounded per-pass inventory is sufficient; no background registry is implied.

Evidence: E2-E3 and live session JSON, better-than-training, 2026-10-24; `src/next.ts:353-366,1346-1354`. The scope of stopped-session ambiguity needs an operator answer, not an assumed interpretation of E1.

Pitfall removed: hidden restoration or false uniqueness during a disconnect. No human-only prerequisite exists unless the operator requires restoring a stopped session before selection.

### Q3: How do commands identify existing seats after discovery, restart or workspace movement?

Options: carry session with the live placement and saved seat address, rediscover by label and trust old IDs, or use aggregate bare IDs.

Pick: make the address include session and workspace/tab/pane identity, pass that target explicitly to live calls, and record enough session identity for later commands and detached land. Validate old state against the resolved workspace and expected worktree before adopting it. Existing unqualified records must be adopted only when ownership is proved uniquely; otherwise stop with a repair instruction. Never silently abandon a still-live seat and start a second paid one. Cost: state compatibility handling and a defined refusal/recovery path when workspace placement changes. The exact state shape is a design decision, not a demand for a separate new registry.

Reject label rediscovery followed by trusting old IDs: the label can move to another session while old IDs still refer to live unrelated objects. Reject aggregate unqualified inventories: IDs are server-local. Reject automatic migration/closure of the incident's old seats: the report alone does not identify safe current targets.

Evidence: E1 operator, E2-E4 better-than-training, 2026-10-24; `src/state.ts:96-103`, `src/next.ts:373-399,428-433`, `src/land.ts:33-35`, and F2's observed workspace-ID collision.

Pitfalls removed: double launch, foreign pane closure and stale land targeting. Operator question: when a live leaf is found outside the chosen repo workspace, should the command refuse for manual repair or explicitly migrate it? Pick refusal. Migration would need its own approved target and live proof.

### Q4: Which callers share repo routing, and which need caller routing?

Options: fix allocation only, globally rewrite the ambient socket, or separate explicit repo targets from explicit caller targets.

Pick: cover every repository lifecycle effect and observation that consumes the same IDs: allocation, prompting, scope process lookup, phase rename/notices, diagnostic log lookup, reconcile closes, land, and watch. Resolve repo context at their boundaries and retain it through helpers. Chart peer helpers need an explicitly identified door/pane session, because their supplied A pane is their operational target; their root argument alone does not prove that the door sits in that repo's workspace. Installation/integration commands must be classified separately, not blindly retargeted by cwd. Cost: caller audit and plumbing through existing helpers, including raw calls bypassing shell.herdr.

Reject allocation-only: the next phase or cleanup can still target the wrong session. Reject process-global environment switching: multi-repo sweeps, hooks and host reconciliation already share an invocation and cached pane list (`src/next.ts:1346-1354,1412-1428`), so one mutable target is not a sufficient contract. Reject forcing every chart peer into the repo workspace: that can redirect a supplied peer pane ID.

Evidence: E2-E4 better-than-training, 2026-10-24; `src/scope.ts:121-127`, `src/phase.ts:61-99`, `src/reconcile.ts:383-387,666-668`, `src/land.ts:17-46`, `src/log.ts:36-46`, watch and peer references in F4; `src/install.ts:136-137`, `src/self-update.ts:284-289`.

Pitfall removed: a partial fix passing launch tests while later commands operate elsewhere. Practitioner question: should this issue include chart caller-context hardening, or record that separate outcome independently? Lifecycle and watch routing belong together; arbitrary peer discovery is not automatically in scope.

### Q5: How do multi-repo hooks, capacity and cleanup use inventories?

Options: one session's bare list, concatenate all session lists, or retain session identity in inventories and owner lookup.

Pick: session-qualified inventories and owner comparisons, with per-repo views for lifecycle actions and an explicitly complete host view where cross-repo capacity or cleanup needs it. Hook origin must be tied to its emitting server before its pane/tab ID can select an owner. Unavailable required inventory stays unknown and must not prove a tab absent. Cost: adapt the shared lazy inventory and hook contract, not just the per-repo workspace finder.

Reject one list: active seats elsewhere disappear from capacity and cleanup decisions. Reject unqualified concatenation: duplicate IDs can select another repo or create false “multiple owners” errors. Reject allowing a failed inventory to become empty: reconciliation already distinguishes unavailable from absent for failed-leaf cleanup (`src/reconcile.ts:760-770`); preserve that protection.

Evidence: E2-E4 better-than-training, 2026-10-24; `src/next.ts:353-366,1325-1334,1346-1354,1429-1465`, `src/reconcile.ts:689-705,760-770`, `skills/watch-issues/scripts/observe.ts:196-205`.

Pitfall removed: wrong hook ownership, undercounted paid work and unsafe cleanup based on an incomplete view. Fog: prove how the installed plugin supplies session origin, especially a tab-closed event whose pane has already disappeared. Managed env authority is documented by E2, but actual hook provenance has not been captured here.

### Q6: What evidence closes the issue, and how should work split?

Options: code-only unit checks, a session-aware fake plus reversible installed-CLI proofs, or paid end-to-end launches in existing workspaces.

Pick: one integrated lifecycle outcome, tested with a multi-session fake and installed-CLI proofs. The fake currently loads one database from FAKE_HERDR and parses argv without a global-session boundary (`tests/fake-herdr.ts:56-85`, `tests/helpers.ts:134-153`). Extend that existing seam to model independent servers and colliding IDs. Test stale socket/session/pane context, missing/duplicate labels, unreadable running session, legacy state, hooks from another server, cross-session capacity and cleanup refusal. Assert behavior and side effects, not exact error prose. Live proof should use throwaway targets and ordinary unmetered shell processes if creation/process-info/closure needs demonstration.

Reject current single-session fake alone: it cannot expose cross-session collisions. Reject paid agent launches for a routing proof: CLI routing and ordinary process placement can establish the required property without model work. Reject arbitrary serial leaves by file ownership: these changes share one correctness contract. If chart-peer hardening becomes a second independently checkable outcome under Q4, chart it separately rather than blocking the lifecycle fix on unrelated peer behavior.

Evidence: E4 better-than-training, 2026-10-24; fake references above; `learnings/LESSONS.md:9` records the value of concrete execution over reading, and the explanatory-assertion lesson dated 2026-10-01 supports functional checks.

Pitfall removed: tests pass while all calls still hit one server. Cost: fixture changes plus a small live proof; no new agent orchestration framework.

## Proof calls already performed

P1: Installed identity was the current local OS user ivan, binary `herdr` from PATH, version 0.9.1, on 2026-10-24. Commands: `herdr --version`, `herdr --help`, `herdr session list`, `herdr session list --json`, and `herdr --session <name> workspace list` for infra, mdconsultingny and personal. Inputs were existing session names read from the list. All succeeded. No resources created; no cleanup needed. Limits: read paths only, no stopped-session restore or mutation behavior proven.

P2: `HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/mdconsultingny/herdr.sock herdr --session infra workspace list` succeeded and returned infra. This proves explicit global flag precedence over that stale socket on installed 0.9.1. It does not prove every other selector combination or child/service inheritance.

P3: With that same socket override, `bun -e 'import {workspaces} from "./src/shell.ts"; console.log(JSON.stringify(await workspaces()))'` returned mdconsultingny workspaces. This exercised the actual source helper. Its subprocess capture cleans its temporary files through `src/shell.ts:55-64`. No repo files or live resources changed. It does not reproduce akrogon next or historical paid work.

## Fog and handoff prerequisites

- G1: Define stopped-session ambiguity and unavailable-session policy through Q2. Current discovery proves only running local sessions; remote machine support is not established as required by this intake.
- G2: Finalize Q3's legacy-state and moved-workspace contract. Do not infer that the incident's wrong seat/tab has already been cleaned. No current incident repair is authorized by this consultant brief.
- G3: Capture actual hook origin and settle Q4's chart-peer versus repo-target distinction before leaf design. A generic wrapper change cannot answer either automatically.
- G4: Before handoff, A must prove the exact chosen external selector form, including HERDR_SESSION combined with stale HERDR_SOCKET_PATH if that form is named. P2 covers `--session`, not an env-only implementation. Any new live operation named in contracts, including pane process-info or detached service environment propagation, needs the matching proof. Use disposable targets, declared ownership and authenticated absence read-back after cleanup. No live creation, agent start, pane close or service launch was performed by B.
- G5: No credentials or human-only prerequisite is currently demonstrated. If testing requires a fixture server, live mutations or retained incident resources, A must obtain the required scoped grant and record cleanup before those proofs. Human owner for any unresolved incident seat cleanup is the operator, with exact targets still pending verification; that cleanup is not silently part of this fix.
