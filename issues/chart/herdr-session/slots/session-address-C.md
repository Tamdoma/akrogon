# Fork notes, seat C: session-address

Blind notes, written without A's draft, the fork's Findings, or another seat's notes. All evidence dated 2026-10-24.

## Q1. Discover by workspace label, or declare a per-repo setting?

### Pick

Discover: enumerate running sessions, the unique session holding a workspace whose label exactly equals the registered repo name is that repo's session.

Reason: the label-equals-name convention is already the address allocate uses (`src/next.ts:407`), so discovery extends an existing fact instead of adding a second one that can disagree with it. The operator's stated expected behavior is find-regardless-of-session plus visible refusal (INTAKE Scope). A declared setting also has no clean home: per-repo config is read from the committed `issues/config.yaml` in each checkout (`src/config.ts:225`), but a herdr session name is host-local operator layout that should not travel with the repo; the host-local global config holds repos as a flat name-to-path record (`src/config.ts:29`), so a per-repo session there means changing that record's shape. Discovery needs none of that.

Cost: the label stops being a display nicety and becomes the address, case included. A workspace rename or a case slip (registered `Himne` has no workspace in any running session today) turns into a refusal until the operator relabels. Resolution costs one `session list --json` plus one `workspace list` per running session, so it must be cached per pass, not per leaf.

### Rejected

- Declared per-repo setting in `issues/config.yaml`: puts machine layout in version control, touches a strict schema plus init and config printing for every repo, and akrogon must still validate that the labeled workspace actually exists and is running in the declared session, which is most of discovery anyway. Its one real gain, killing label ambiguity by construction, only matters if same-label workspaces in two sessions become a working style; today no registered repo name appears in two sessions.
- Declared in the global config instead: right file locality, wrong shape. The `repos:` value changes from a path string to an object, a breaking change to the operator's live `~/.akrogon/config.yaml`, to store a fact discoverable in one call.
- Address by the workspace's saved cwd: herdr does keep an `identity_cwd` per workspace, but only inside its private `session.json` snapshot; the `workspace list` API output exposes no cwd field (live probe). Reading another tool's versioned snapshot file as an address book is more fragile than the label.
- Keep the ambient session and validate only: does not meet the intake scope.

### Evidence

- operator · INTAKE Scope and seed Expected behavior, 2026-10-24 · find the repo's workspace regardless of inherited session, refuse visibly when missing or ambiguous.
- practitioner · my live probes, 2026-10-24 · `herdr session list --json` gives name, running flag, socket path per session on installed herdr 0.9.1; registered repos' workspaces span infra, mdconsultingny, and personal; `Himne` has none; `herdr workspace list` rows carry label and workspace_id but no cwd; `~/.config/herdr/sessions/infra/session.json` does carry `identity_cwd` per workspace.
- better-than-training · this repo, read 2026-10-24 · `src/next.ts:407-408` label match and refusal; `src/config.ts:29` global repos record; `src/config.ts:219-225` per-repo config from `issues/config.yaml`.

### Pitfalls

- Q1-P1 Same label in two running sessions has no right answer under discovery. Removed by: refusal naming the sessions (the stopped-and-ambiguous fork's territory), never a tie-break by ambient env or focus.
- Q1-P2 A repo registered under a name the operator never used as a workspace label refuses on every pass, which in a multi-repo pass could be read as breakage of other repos. Removed by: per-repo scoped refusal that names the exact label searched (also stopped-and-ambiguous Q2).
- Q1-P3 Discovery on every herdr call would multiply process spawns on hook-driven passes. Removed by: resolve once per repo per invocation and pass the session down, in the same once-per-pass spirit as the existing lazy pane list (`src/next.ts:1347-1356`).

### Question the fork does not ask

Who is allowed to create the workspace when discovery finds none? The fork assumes operator-created workspaces. If akrogon ever creates one, it needs a session-choice rule that neither option in Q1 supplies.

## Q2. Record the session in leaf state, or derive it each pass?

### Consumer trace (who relies on stored tab and pane ids today)

- `src/state.ts:96,100`: state stores `tab` and `pane.A/B` as bare strings in a strict object. No session, no workspace id.
- Allocate (`src/next.ts:373-388`): recorded pane ids are filtered against the live pane list; a recorded pane found outside its scope is closed (`src/next.ts:383`). Tab match accepts `tab_id === state.tab` alone, or slug label plus a pane whose cwd is in the leaf worktree (`src/next.ts:395-402`). Recorded A and B are then looked up among the tab's members (`src/next.ts:432-434`).
- Dispatch (`src/next.ts:525,584`): `pane get` on the recorded pane id; a missing pane throws. Busy observation (`src/next.ts:722`) finds by id and silently skips when absent. Capacity and failed-leaf liveness match on `tab_id` (`src/next.ts:360,733-735`).
- Hook ownership: `ownsPane` (`src/next.ts:159`) accepts a stored pane id or a pane cwd inside the worktree. The `tab_closed` route matches owners by `state.tab === event.data.tab_id` only, no cwd arm, and throws on multiple owners (`src/next.ts:1432-1435`). The merged-tab close gate compares the hook pane to `state.pane.B` (`src/next.ts:1487`).
- Reconcile: `tabLive` (`src/reconcile.ts:255`) is the single test behind slice stopping (`src/reconcile.ts:206-212`), failed and old-root worktree removal (`src/reconcile.ts:765,787`), leftover tab close (`src/reconcile.ts:720-723`), and `closeMergedTab` (`src/reconcile.ts:384-388`). `broadcastInProgress` checks `state.pane.B` status (`src/reconcile.ts:190`). All of these already distinguish a null pane list (keep) from an empty one.
- Phase: `renameTab` on the stored tab for failed and recovery renames (`src/phase.ts:61-81,106-108`, `src/phase.ts:162` via grep); `tab_not_found` is tolerated as a warning, every other error throws. This produced the seed's first visible symptom.
- Land: reads no tab or pane ids itself. It forwards the ambient socket into the land unit (`src/land.ts:33-35`) and then re-enters the consumers above through `mergeWake` and `landedWake` (`src/land.ts:80,104`), in a process with no pane of its own (`src/land.ts:16`). Land is therefore a consumer at one remove, and the one most exposed to a stale forwarded address.

### Pick

Derive each pass from the repo's workspace (Q1 discovery). Stored ids are read as scoped to the derived session, and allocate's label-plus-cwd re-match is the repair path when they stop matching.

Reason, by scenario:

- Workspace moves session: a move between herdr servers means the workspace is recreated on the new server; its tabs and panes there are new objects. Under derivation, allocate finds no recorded panes in the new session, the label-plus-cwd arm either rebinds an existing tab or allocate creates one and saves fresh ids (`src/next.ts:423-453` region of the save sequence). The leaf self-heals. Under a recorded session, every consumer stays pinned to the old session: allocate looks for the workspace there and refuses forever, `pane get` and renames miss, and the only exits are hand-editing state.yaml or adding a disagreement rule for when discovery may overrule the record. That rule is derivation with extra state.
- Session restarts (same name, server stop and start): herdr restores layout from `session.json` with new shells in saved directories, processes gone (herdr session-state docs, below). The workspace id is persisted in that file, but tabs and panes are stored without their public ids (structure probe below), so stored tab and pane ids may or may not reappear. The name in a recorded-session design survives trivially and buys nothing: under both options the rebind is allocate's label-plus-cwd arm, and restored panes come back in their saved cwds, which is exactly what that arm matches. Derivation loses nothing in the restart case and wins the move case.
- Poisoned state from the actual incident (ids written for the wrong session) self-heals under derivation by the same re-match. Under recording, the poison would have been written with the wrong session name attached and would be defended by it.

Cost: no consumer may touch a stored id before its repo's session is resolved, so resolved session context has to thread through allocate, dispatch, reconcile, phase, and the land process instead of the current ambient default. Two bare-id matches become correctness-critical and must be scoped or cwd-checked: allocate's `tab_id` arm (`src/next.ts:395`) and the `tab_closed` owner match (`src/next.ts:1432`). Leaves that never allocate again (merged, failed) keep dead ids in state; reconcile consults them through `tabLive` and gets false, which is the safe answer only while the unavailable-versus-empty discipline holds.

### Rejected

- Record the session name in state at allocate: gains precise event attribution (a `tab_closed` from another session with a colliding id could be rejected against the record) and a stable target while a workspace is temporarily unlabeled. It pays with a strict-schema field, a first-pass derivation to fill it for existing leaves (so the discovery machinery is built anyway), a permanent second source of truth, and a hard failure with no self-heal on workspace move until state is hand-edited. Its attribution gain is also available under derivation by scoping the match to the derived session plus cwd.
- Search every running session for a stored id wherever it is used: pane and tab ids repeat across servers (`w8` exists in two sessions today), and destructive consumers act on the match (pane close `src/next.ts:383`, tab closes `src/reconcile.ts:387,720`). A same-id foreign pane would be adopted or closed. This turns a scoping question into a collision hunt at every call site.

### Evidence

- better-than-training · this repo, read and grepped 2026-10-24 · every consumer line in the trace above; `src/state.ts:96,100` bare id storage; `src/phase.ts:68-81` only `tab_not_found` tolerated; `src/reconcile.ts:206-212,761-765` null list keeps, empty list permits destructive action.
- better-than-training · herdr session-state docs v0.9.5, fetched 2026-10-24 (installed herdr is 0.9.1, so treat as near but not exact) · on server restart processes are gone, "Herdr restores the saved session shape: workspaces, tabs, panes, cwd", and panes come back as new shells in saved directories.
- practitioner · my probes, 2026-10-24 · `~/.config/herdr/sessions/infra/session.json` persists workspace `id` (`w8`) but stores tabs with keys `custom_name,layout,panes,zoomed,focused,root_pane` and panes keyed by number, with no public tab or pane ids; whether public ids regenerate identically across a restart is therefore unproven, and I did not restart a live session to test it.
- practitioner · my probes, 2026-10-24 · workspace id `w8` exists in both infra and mdconsultingny now, so id collision across sessions is present, not hypothetical.

### Pitfalls

- Q2-P1 Under derivation, a stored id can collide with an unrelated live id in the derived session, and allocate's `tab_id` arm and the recorded-pane scope close (`src/next.ts:374-383`) would act on a foreign tab or pane. Removed by: requiring the cwd corroboration the second match arm already uses before adopting or closing anything matched by bare id.
- Q2-P2 While a session is stopped for restart, derivation finds no workspace. If any consumer reads that as an empty pane list rather than unavailable, `tabLive` goes false and reconcile can stop the leaf slice and remove worktrees under seats that return on restart (`src/reconcile.ts:206-212,765`). Removed by: resolution failure maps to the existing null-list keep behavior, never to an empty list. This is shared ground with the cross-session-reads fork, but Q2's answer creates the exposure.
- Q2-P3 The `tab_closed` route has no cwd arm and throws on multiple owners (`src/next.ts:1432-1435`). Under derivation, two leaves in different repos could hold the same tab id string for different sessions, and a close event in one session matches both. Removed by: scoping owner matching to leaves whose repo derives to the session the event came from, which requires naming the event's session (see unasked question).
- Q2-P4 A recorded pane id reaching dispatch before allocate re-runs throws out of `pane get` (`src/next.ts:584`) instead of degrading like busy observation does (`src/next.ts:722`). After a move or restart that means a thrown pass where a re-match would have healed. Removed by: dispatch paths always run allocate's re-match first, or treat pane-not-found in the derived session as a re-allocate signal rather than a pass failure.
- Q2-P5 Phase renames tolerate `tab_not_found` but throw on connection failure to a stopped session (`src/phase.ts:68-81`). Under either option a phase move during a restart can fail on the rename after the move's real work. Removed by: nothing in Q2 alone; the call-coverage fork decides how pinned calls to an unavailable session fail.

### Questions the fork does not ask

- How does a hook pass know which session its event came from? The `tab_closed` payload consumed at `src/next.ts:1432` carries a tab id and no session. Derivation needs the event's session named, most plausibly by matching the server-injected socket against `session list --json` socket paths, and neither Q1 nor Q2 as worded covers event addressing.
- When stored ids stop matching, who rewrites or clears them outside allocate? Merged and failed leaves never allocate again, so under derivation their dead ids sit in state while reconcile keeps consulting them. Is silent staleness acceptable forever, or does some pass stamp them dead?
- What is the resolution's lifetime: once per invocation, or may a long pass re-resolve? If the operator moves a workspace mid-pass, half the pass acting in each session is a state neither option describes.
