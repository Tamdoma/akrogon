# Seat B blind notes: stopped-and-ambiguous

2026-10-24. Locks accepted: discover running sessions by exact registered repo key, store no session in leaf state, resolve once per repo per invocation, ownership corroboration and second-seat guard as recorded in session-address Taken. No request to reopen those choices. Read no Findings or other seat's notes for this fork. The brief's corrupted inline command/version text was resolved by inspecting current HEAD, c5cf7be720018c65ef36344d8f5c61a246a9449c.

## Q1. Stopped sessions, duplicate labels and unreadable running sessions

### Pick, reason and cost

Skip sessions reported stopped by the initial session list. Never start or restore them during discovery. Count exact-label workspace objects across all successfully read running sessions, including multiple objects in one session. Zero matches refuses as missing; two or more refuse as ambiguous, with candidate session/workspace IDs. An unreadable running session makes uniqueness unknown and refuses, even when another session returned one match. Failure to list sessions also means unknown, not zero running sessions.

If a session stops between listing and a later workspace/pane/API call, preserve that failed read or action and refuse the affected work. Do not repeat discovery to silently select a different session within the invocation. The locked fixed target already determines this behavior. Cost: an unreadable running server can block every repo whose discovery needs the complete view. That is an evidence limitation, not permission to select the visible match.

Himne is a separate operator layout action already identified by the lock. The missing label does not authorize automatic creation or registry renaming. Its session placement remains a human choice.

### Rejected options

- O1: Include saved stopped-session workspaces or attach stopped sessions to discover them. The lock explicitly selects running sessions. Attaching can restore processes and run plugin startup hooks, changing what began as a lookup.
- O2: Ignore a failed running-session read, or downgrade it to an empty list. Neither absence nor uniqueness is established by that error.
- O3: Accept the first match, prefer the caller's session, or count matching sessions instead of workspaces. A single session may contain several matching labels, so the latter also misses ambiguity.
- O4: Auto-create or auto-rename a workspace when missing/ambiguous. This changes operator layout and can conceal the wrong-session defect instead of refusing it.

### Evidence and stopped-call proof

- Operator tier, 2026-10-24: session-address Taken fixes running-session discovery, exact labels, visible zero/multiple refusal, no automatic workspace creation, and no mid-pass retarget.
- Better-than-training tier, 2026-10-24: inspected official Herdr v0.9.1 tag, commit 8544776216a8d28088db59a5344ea21ee2d05d2b, from local repo `/home/ivan/Work/infra/herdrdev/herdr`. Its checkout is another revision, so the evidence below comes from `git show v0.9.1:<path>`, not checkout files.
- At that tag, `src/main.rs:515-546` configures selectors then dispatches CLI commands; `finish_cli` at :486-497 exits handled CLI/error paths. `src/session.rs:29-94,475-483` processes --session by selecting environment context without server creation. `src/cli/workspace.rs:33-40` and `src/cli/runtime.rs:16-20` route workspace list to the API. `src/cli.rs:769-787` connects/pings and sends, and :824-849 maps missing/refused sockets to server_not_running. `src/api/client.rs:96-97` connects to the socket without launching a server. Thus an API command against a stopped session fails; the broad help text “use or create” does not mean these API calls launch servers.
- Better-than-training tier, actual read-only proof, 2026-10-24, installed herdr 0.9.1, local user ivan: verified netreachconsulting was stopped using `herdr session list --json`, ran `herdr --session netreachconsulting workspace list`, then read the session list again. Exit 1, empty stdout, JSON stderr code server_not_running naming that session's socket. Running was false both before and after. No resources created, no cleanup required. This proves the installed stopped-server read path, not an artificially timed shutdown or a mutating action.
- Duplicate labels are permitted by the v0.9.1 implementation. `src/app/api/workspaces.rs:39-85` creates a workspace then applies the requested label directly; :104-130 renames an existing workspace without a uniqueness comparison. `src/workspace.rs:1002-1004` simply assigns custom_name. Workspace creation pushes a new object in `src/app/creation.rs:126-160`; it does not deduplicate by label. This is source evidence, not a live duplicate-label experiment.
- Official versioned CLI reference, consulted earlier in this session on 2026-10-24: https://raw.githubusercontent.com/herdrdev/herdr/v0.9.1/docs/next/website/src/content/docs/cli-reference.mdx , Sessions and Workspaces, documents the named-session API commands. No named practitioner supplied an additional policy; the recommendation is B's judgment from operator intent and code.

### Pitfalls and removal

- R1: A stopped session is accidentally restored by using attach/bare launch as a retry. Remove it by keeping discovery to API reads and surfacing server_not_running. No new fallback or server-start code is required.
- R2: A concurrent session exit yields a false missing/unique result. Remove it by retaining failed-read status and the locked target. No second scan is allowed to redefine the chosen destination mid-pass.
- R3: Duplicate labels inside one server escape detection. Remove it by counting workspace rows, retaining both workspace IDs, rather than using find() or a map keyed only by label.
- R4: A probe starts the production dispatcher. `plugin/herdr-plugin.toml:8-12` has startup pull --all and next --resume. Do not attach or restart an existing session to prove this failure mode.

### Question the fork does not ask

Q3: What is the operator's Himne session choice? It is not inferred here. Creating that workspace needs a concrete session and source cwd, then an exact-label read-back. Initial-list snapshots are not a global concurrency lock: a session newly started after the snapshot is outside that inventory until the next invocation. If stronger continuous uniqueness is required, that is a new contract and proof requirement, not something the initial list guarantees.

## Q2. Does a refusal stop one repo or the whole pass?

### Pick, reason and cost

Pick per-repo refusal with a visible nonzero overall result, while independently resolvable repos continue. Within the refused repo, skip further dispatch, pane effects and repo reconciliation that require its unresolved target. Do not let the subsequent merge pass reopen the same refused path. Reuse the cached resolution/refusal for that invocation, as required by the lock. This is error propagation, not a fallback to another session or a success-shaped skip.

Cost: every entry path needs the same boundary, not just allocate's existing leaf catch. A failure shared by all repo resolutions, such as an unreadable required running-session inventory, may make all those repos refuse. “Per repo” does not make incomplete global capacity or cleanup inventory safe. Continue independent operations only where their own required evidence is complete; cross-session-reads must preserve unknown keep-vetoes. Already committed phase, Git or self-update effects are not rolled back by a later routing refusal.

### Rejected options

- O5: Abort the whole pass on a repo-specific missing/duplicate label. It needlessly prevents unrelated repos with provable destinations from progressing.
- O6: Catch only in dispatchLeaf and call the job done. Other paths throw outside that catch, and later reconcile/merge work still runs after a dispatch skip.
- O7: Log a refusal and report success. The operator and hook logs must expose the incomplete pass; nextCommand already has a final skipped-to-exit-1 mechanism.

### Current propagation, with throw paths

Source is current akrogon c5cf7be72001, inspected 2026-10-24. A refusal does not yet have a dedicated repo-wide routing state.

| Path | What happens today |
| --- | --- |
| Allocation inside dispatch | allocate throws missing workspace at `src/next.ts:407-408`; dispatchLeaf catches Error at :794-797, report writes structured stderr and marks skipped, then returns skipped. sweep continues its leaf loop (:848-850). sweepAll continues its repo loops (:801-812). Thus an allocation refusal generally does not abort the multi-repo pass. |
| After that skipped dispatch | nextCommand still marks the repo touched and calls reconcileRepos (:1398-1399,1403-1410,1427-1428). It subsequently calls mergePass for every touched repo (:1500-1505). report (:111-117) records/deduplicates errors; it is not an execution guard. Therefore “caught and reported” does not stop subsequent work for the affected repo. |
| Reconcile | reconcileRepos catches an Error from each repo's reconcile (:1310-1319) and continues. But reconcileHost at :1322 is outside that per-repo catch. A propagated host-step error rejects the surrounding locked callback and nextCommand, preventing later merge processing and the final skipped exit statement. Its actual error behavior depends on which host operation failed; not every host error necessarily escapes. |
| Pane hooks | paneOwners is awaited directly at :1464, and multiple owners throws at :1465. Its panes() read at :1330 is also outside dispatchLeaf's catch. A resolution refusal inserted there without a boundary aborts the hook invocation. Zero owners returns from the locked callback (:1466). After an owner dispatch, closeMergedTab errors are caught at :1493-1495, and touched-repo merge errors are caught at :1501-1505. |
| Closed-tab hook | Owner collision throws at :1435 outside a local catch. Reconcile and reconcileHost in that branch are caught at :1439-1450, but dispatch still follows at :1452-1460. Thus reporting the reconcile error does not stop that owner dispatch. Closed-hook origin qualification remains cross-session-reads work. |
| --resume startup | Each active repo is swept in sequence (:1413-1426), then reconciled (:1428). dispatchLeaf Errors are contained, but a new resolver thrown outside it, or an uncaught host reconciliation error, aborts this loop/pass. |
| Completion result | If nextCommand reaches :1509 and report marked skipped, process.exitCode becomes 1. An uncaught rejected call also fails, but skips this normal finalization. `plugin/next.sh:2-3` uses set -eu and exec akrogon next, so it does not absorb the exit. |
| Related wakes | mergeWake catches and reports at :1163-1170, and landedWake separately catches at :1178-1184. They do not use nextCommand's final exit-code statement. Keep their existing committed-work semantics, but do not assume a report there produces a CLI nonzero result automatically. |

`next --all` is not always a host-wide pass: currentRepo narrows it when invoked inside a registered repo (`src/next.ts:1400-1410`). This matters for plugin startup cwd and for a meaningful multi-repo test.

### Evidence

- Better-than-training tier, 2026-10-24: the exact current-source functions and catch/throw locations in the table, including report, dispatchLeaf, sweep, sweepAll, reconcileRepos, nextCommand, mergeWake and landedWake. Plugin hooks are declared at `plugin/herdr-plugin.toml:14-28`; startup at :8-12. The wrapper forwards errors unchanged (`plugin/next.sh:2-3`).
- Operator tier, 2026-10-24: the locked no-retarget rule and the intake's requirement for visible refusal. No operator choice on per-repo continuation is assumed before this round.

### Pitfalls and removal

- R5: One bad repo prevents safe work elsewhere. Remove it by handling repo-resolution refusal at each per-repo orchestration boundary and aggregating failure for the invocation.
- R6: A failed dispatch is followed by unsafe reconcile/merge work for the same repo. Remove it with one cached refused resolution respected by every consumer. The existing skipped set only deduplicates reporting; do not misrepresent it as a repo stop.
- R7: Missing global visibility gets converted into safe-to-delete evidence. Retain null/unknown inventories and existing keep-vetoes rather than substituting []. A scoped repo refusal cannot waive a host cleanup dependency.

### Question the fork does not ask

Q4: Which failures invalidate shared visibility versus just one repo's target? A duplicate label for A can leave B resolvable. A failed workspace read in any required running session makes uniqueness unproved for every repo needing that discovery. A failed pane read can invalidate second-seat guards/global counts even when workspace resolution succeeded. Preserve those distinct dependencies in cross-session-reads.

## Remaining live proofs and side effects

No session or workspace was created, started, stopped, renamed or closed for these notes. The stopped-API read proof above already covers its narrow installed behavior.

- P1: Duplicate-label acceptance is established from versioned source, but an installed mutation proof would require two disposable workspaces in an isolated fixture session, created with the same throwaway label and --no-focus, a list showing both IDs, and closure/read-back of only those created IDs. Workspace creation launches shell panes and writes saved session state; closure can emit tab/pane events. Do not run this in a production linked session. It does not require paid agent launches.
- P2: A deterministic list-then-stop race can first be covered by the existing fake-herdr seam. A live proof requires a disposable server: list it running, stop only that owned fixture, call workspace list with the same selector and observe server_not_running, verify stopped status and remove fixture state through the proven cleanup route. Starting a fixture may run installed startup hooks, so isolation must exclude production akrogon plugin activation and its access to real AKROGON_HOME/repos before the first start. Inspect and prove that isolation mechanism rather than guessing a config flag. No such mutating proof is authorized or performed here.
- P3: Per-repo continuation should be proven in isolated registered test repos with session-aware fake herdr: one repo missing/ambiguous, another valid, valid dispatch observed, no refused-repo follow-on effects, and nonzero aggregate exit. Include --resume, hook error boundaries and host-unknown cleanup vetoes. This can verify application behavior without a production hook event or paid seat.
