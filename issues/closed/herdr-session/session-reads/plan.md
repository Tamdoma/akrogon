# Plan: session-reads

## Decisions

- D1. `src/shell.ts` gains `sessionPanes(exe?): Promise<{session: string; pane: Pane}[] | null>` — one tagged pane union over every session the cached `session list` marks running. A session whose read dies `server_not_running` is skipped as stopped (resolution's rule); any other read error or `DISCOVERY_DEADLINE_MS` hit makes the whole union `null` (unreadable). `allSessionPanes(exe?)` becomes a projection of it (`found.map(entry => entry.pane)`), keeping its exported name and `null` semantics for the host veto; the dead-session skip makes its union consistent with `resolveSession`/`secondSeat` (same rule, stated limit). Fresh per call: only the session list is process-cached, pane lists re-read every call, which is what criterion 3's within-pass freshness needs.
- D2. `activeCount` (src/next.ts) reads `sessionPanes()` once per call instead of `panesForRepo`. Union `null` returns `global.max_active` outright — an unreadable running session means no repo's seat count is provable, so nothing launches (criterion 1 second clause). A leaf counts active when unfinished and either a pane tagged with the repo's resolved session matches `state.tab`, or any pane in the union has cwd inside `state.worktree`. Tag scoping keeps same-id tabs in other sessions from permanently counting a leaf (workspace ids like `w1` recur across sessions). A repo with refused resolution still contributes `unreadable + unfinished`, never the `max_active` floor (session-routing D4 unchanged).
- D3. `reconcile(repo, leaves, live, union = live, failures?)` (src/reconcile.ts): `live` stays the resolved session's panes and alone feeds `tabLive`, `seatTabs`/`closeTab` membership, `broadcastInProgress`, `sliceKeepReason` and `repoRunning`. `union` (cross-session, `null` when any running session is unreadable) feeds every cwd veto — `livePaneInside`, `foreignPaneInside`, `dropChecked`, `dropUnowned` callers — and each pane-dependent removal site adds `union === null` to its existing `live === null` keep. `mergedWorktree`/failed-leaf branches keep the whole entry (`pane union unavailable`) when `union === null`, so a recorded tab is closed only when no session's liveness evidence is missing (criterion 2's "closes nothing it could not check"). Retired-lock and leaf-temp drops gate on `union !== null` where they gate on `live !== null` today. Signature order keeps `live` third so the two direct test callers (`reconcile.test.ts`, `store-sweep-safety.test.ts`) keep meaning; `union = live` default is backward compatible.
- D4. `reconcileRepos` (src/next.ts) passes both views: `live` from `panesForRepo` and `union` from `hostPanesOnce()` (the lazy `allSessionPanes` union), each only when `reconcileNeedsPanes` is true, else `[]`. The `tab_closed` branch's inline `reconcile` call gets the same. `reconcileHost` already takes the union for filesystem vetoes and per-repo panes for tab judgements — unchanged. `closeMergedTab` is unchanged: it re-resolves and re-lists the resolved session itself; its `live` pre-check keeps `panesForRepo`.
- D5. `hookEventSchema` keeps `workspace_id`: every event variant's `data` gains `workspace_id: z.string()`. Parse happens before the `pane_agent_status_changed` 'working' early return, so all four event types carry it.
- D6. Hook origin gate (src/next.ts `nextCommand`): when `event !== undefined`, the emitting session is the `listSessions()` entry with `socket_path === process.env.HERDR_SOCKET_PATH` and `running`. `sessions === null` reports once at invocation scope (exit 1). No match → one `console.error` JSON line naming the socket, then return 0 — an unknown origin is a filter outcome, not a skipped repo. New helper `hookScope(repo): {ok:true; session: ResolvedSession} | {ok:false; why: string}`: resolution refused → `{ok:false}` reported via `resolveFor`-equivalent (counts as skipped, exit 1); emitting session ≠ resolved session or `event.data.workspace_id !== resolved.workspace.workspace_id` → `{ok:false, why}` logged via `console.error` JSON, not counted. `tab_closed` scans `state.tab === event.data.tab_id` only inside gated repos; pane events run `paneOwners` only inside gated repos.
- D7. Ids come from the event: `hookPane` is deleted as an env read; the pane-events branch uses `event.data.pane_id` (narrows `paneOwners`, the `pane.B` close-merged-tab gate). `HERDR_PANE_ID` is never read in `next.ts` — manual scope stays cwd/explicit-target only (criterion 6 holds structurally; the env id was already unreachable without an event).
- D8. `src/log.ts` `logMove`: `paneId` is `slot === null ? undefined : before.pane[slot]` — the `process.env.HERDR_PANE_ID` fallback is deleted. No-slot moves record `session: null` unconditionally; slotted moves attribute only from the recorded pane found in the resolved session (criterion 7).

## Read first

- `src/shell.ts` — `sessionPanes`/`allSessionPanes`, `listSessions`, `Session` schema, `DISCOVERY_DEADLINE_MS`.
- `src/next.ts` — `activeCount`, `panesForRepo`, `resolveQuiet`/`resolveFor`, `hookEventSchema`, `paneOwners`, the `tab_closed` and pane-hook branches of `nextCommand`, `reconcileRepos`.
- `src/reconcile.ts` — `reconcile` veto sites (`livePaneInside`, `foreignPaneInside`, `tabLive`, `dropChecked`, `mergedWorktree`, retired-lock/leaf-temp drops), `closeMergedTab`, `reconcileHost`.
- `src/log.ts` — `logMove` pane selection.
- `tests/fake-herdr.ts` — per-session stores, `session list --json`, `HERDR_SOCKET_PATH` selection, `paneListStdout`/`readError`/`deadRead`/`delayMs` failure seams, `.calls-raw`.
- `tests/session-routing.test.ts` — multi-session fixture shape (`session()`, `toSession()`, `socket()`, `saveDatabase()`), to mirror in the new test file.
- `tests/next.test.ts`, `tests/pause-next.test.ts`, `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts` — existing hook invocations that need `HERDR_SOCKET_PATH` (and `workspace_id` where absent) after the gate lands.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeHerdr`, `storeDir`.

## Interfaces

- `shell.ts`: `sessionPanes(exe?: string): Promise<{session: string; pane: Pane}[] | null>`; `allSessionPanes` keeps `Pane[] | null` by projecting it.
- `reconcile.ts`: `reconcile(repo, leaves, live: Pane[] | null, union: Pane[] | null = live, failures?)`.
- `next.ts`: `hookScope(repo, event, emitting, invocation)` internal helper; `paneOwners(global, invocation, event.data.pane_id)` unchanged signature; `sessionPanes` consumed by `activeCount` and `hostPanesOnce` (via `allSessionPanes`).

## Checklist

### Wave 1

- U1 `src/shell.ts` — `sessionPanes`, `allSessionPanes` projection, dead-session skip. No shared test resource.
- U2 `src/log.ts` — drop the `HERDR_PANE_ID` fallback in `logMove`. No shared test resource.
- U3 `src/reconcile.ts` — `union` parameter and veto routing. No shared test resource.

### Wave 2

- U4 `src/next.ts` — `hookEventSchema` `workspace_id`, origin gate + `hookScope`, event-sourced pane id, `activeCount` union read, `reconcileRepos`/`tab_closed` union pass. Owns `tests/next.test.ts` updates (hook invocations gain `HERDR_SOCKET_PATH`, event payloads gain `workspace_id`). Lands after U1 (imports `sessionPanes`) and U3 (calls the new `reconcile` signature).
- U5 `tests/pause-next.test.ts`, `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts` — same env/schema updates as U4's next.test.ts edits. Disjoint files from U4 and each other; shares wave 2 only because its updates assume the U4 schema/gate shape. (`sessionPanes`/`hookScope` are U4's; U5 can land in wave 1 in practice — it edits only test payloads — but keeping it in wave 2 avoids asserting test edits against an unlanded gate.)

Wave-1 units own disjoint paths and share no resource. U4 waits on U1+U3. U5 may move to wave 1 if the implementer prefers; order shown is the safe one.

## Criterion proofs

New file `tests/session-reads.test.ts` (committed on the leaf branch before product code). One proof command per criterion, all through `akrogon run-check`; each test maps the done-criterion's observation onto the fake-herdr boundary: multi-session db + `HERDR_SOCKET_PATH` are the real inputs, leaf `state.yaml` and the fake db are state before/after, `.calls-raw` and `db.panes/tabs/prompts` show which session acted.

| # | Test (tests/session-reads.test.ts) | Command | Size | Rerun trigger |
|---|------|---------|------|---------------|
| 1 | `capacity counts a seat living in another session` (leaf `held` state.tab `w9:tA`, pane cwd in its worktree, both in session `held`; `max_active` 1; leaf `waiting` gets no tab) and `unreadable session blocks launches` (foreign session `paneListStdout` garbage; no tab created) | `akrogon run-check --name session-reads-c1 -- bun test tests/session-reads.test.ts -t 'capacity counts'` | seconds | activeCount/sessionPanes edits |
| 2 | `a foreign-session pane inside a merged leaf's worktree keeps it` (done worktree + pane cwd inside in `other`; kept, not removed) plus `same-id tab in a foreign session does not keep` (no pane inside; recorded tab id collides in `other`; worktree removed, recorded tab cleared) and `unreadable foreign session keeps tab and worktree` (`paneListStdout` garbage on `other`) | `akrogon run-check --name session-reads-c2 -- bun test tests/session-reads.test.ts -t 'foreign-session pane'` | seconds | reconcile veto routing |
| 3 | `a fresh pane read sees the seat created earlier in the pass` (two-leaf sweep, `max_active` 1: first allocates, second waits) and `a leaf whose recorded tab is closed reallocates instead of counting` | `akrogon run-check --name session-reads-c3 -- bun test tests/session-reads.test.ts -t 'fresh pane read'` | seconds | inventory freshness edits |
| 4 | `hook origin gate`: `tab_closed` with matching socket+workspace acts (dependent starts); socket missing or pointing at another session, or `workspace_id` mismatch → no action, stderr names why, exit 0 | `akrogon run-check --name session-reads-c4 -- bun test tests/session-reads.test.ts -t 'hook origin'` | seconds | gate edits |
| 5 | `pane event ids come from the event, not HERDR_PANE_ID` (event `pane_exited` for seat A while env names a foreign pane → leaf A's pass runs; and mismatch socket/workspace → nothing, prompts stay 0) | `akrogon run-check --name session-reads-c5 -- bun test tests/session-reads.test.ts -t 'event, not HERDR_PANE_ID'` | seconds | hookPane removal, gate edits |
| 6 | `manual next ignores HERDR_PANE_ID` (run `next <slug>` for leaf X with env naming leaf Y's pane: X dispatches, Y untouched) | `akrogon run-check --name session-reads-c6 -- bun test tests/session-reads.test.ts -t 'ignores HERDR_PANE_ID'` | seconds | manual-scope edits |
| 7 | `log session is null for slot-less moves and comes from the slot's pane otherwise` (no-slot `phase` move with `HERDR_PANE_ID` = a live sessioned pane → `session: null`; `--slot A` move with env pointing at pane B → pane A's session) | `akrogon run-check --name session-reads-c7 -- bun test tests/session-reads.test.ts -t 'log session'` | seconds | log.ts edits |

Red evidence: `akrogon run-check --name session-reads-red2 -- bun test tests/session-reads.test.ts` exited 1, 5 fail / 2 pass — `check session-reads-red2: 1 issues/open/herdr-session/session-reads/implementation/check-session-reads-red2-1792869504714-1860251.log`. Failing: C1 (allocated `w1:t1` past `max_active` with a foreign-session seat), C2 (`kept-by-pane` worktree removed under a foreign pane cwd), C4 (no origin gate: no stderr, dependent dispatched), C5 (env pane attribution reprompted past `prompts=1`), C7 (recorded `sess-b` from the env pane instead of `sess-a`). Passing-by-structure: C3 and C6 hold under today's own-session reads; they stand as regression guards against the wrong fix (memoized or untagged union, env-pane attribution in manual runs).

Existing coverage: `tests/session-routing.test.ts` already proves acting calls stay in the resolved session (criterion 2's closeMergedTab/mergedWorktree allowance clause and criterion 5's "same acting checks" clause); this leaf's tests add only the unreadable/foreign-session and origin-gating halves.

## Docs

- `src/AREA.md` — one line: reconcile takes resolved-session tab views and a cross-session cwd union; hooks gate on socket/workspace; log session attribution.
- `tests/AREA.md` — one line: `tests/session-reads.test.ts` covers cross-session counting/vetoes and hook origin gating.
- No skills, README or other human docs are affected (hook payloads documented nowhere; `docs/reference/state-and-phases.md` field list doesn't enumerate `session`).

## Open limitations

- A busy seat in a foreign session is only detectable via pane cwd inside the leaf worktree (same limit as `inWorktree` in `activeCount` today and the second-seat guard's cwd check in session-address). A seat whose cwd leaves the worktree is invisible to capacity.
- A hook carrying a *stale but internally consistent* env (socket of a still-running session + matching workspace_id) still passes the gate; the gate proves origin, not freshness.

## Notes

- Debate is off (`debate: "no"`); this plan is written directly from brief/design. No `positions-*`/`rebuttal-*` artifacts exist or are needed.
- `debate`-phase note for implementers: several tests in `tests/next.test.ts` carry `HERDR_PLUGIN_EVENT_JSON` without `HERDR_SOCKET_PATH` or `workspace_id`; the gate makes them no-ops — U4/U5 must update them to keep their asserted behavior.
