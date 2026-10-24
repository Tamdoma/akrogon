# Map C: host-reconcile-session

## 1. Cause: confirmed

- F1. `reconcileHost` judges every loaded `akrogon-l*.slice` from every registered repo against one pane list for the whole pass (`src/reconcile.ts:1144-1162,1188-1201`). A leaf-matched slice stops when `sliceKeepReason` returns null (`src/reconcile.ts:1194-1201`).
- F2. For a leaf with a recorded tab, the only liveness keep is `tabLive(live, leaf.state.tab)`, a bare `tab_id` match in that list (`src/reconcile.ts:206-211,255-257`). Absent tab means null, then `stopSlice` runs `systemctl stop` under the admission lock, rechecking only live run records (`src/reconcile.ts:214-221`).
- F3. The list comes from `panes()` = `herdr pane list` with no `--session`, so it follows the inherited socket and lists one session (`src/shell.ts:202-216`; shared once per pass at `src/next.ts:1349-1355`). A tab in another session is absent, so F2 reads it dead. This matches the INTAKE observation. The suspected lingua-relay trigger stays unproven (timing only, INTAKE Agent findings), but no proof of trigger is needed: any caller below can do it.
- F4. Leaf-matched slices get no process check. Busy slices stop on a vanished tab by design (`src/reconcile.ts:510-512`; `tests/release-any-phase.test.ts:421-422`). Only unmatched slices in the host step are kept for "process inside" (`src/reconcile.ts:1227-1231`, process scan at `src/reconcile.ts:155-180`).

### Caller paths to `reconcileHost` (only importer: `src/next.ts:72`)

1. `nextCommand` with a selection dispatches, then `reconcileRepos([selection.repo])` (`src/next.ts:1399`), which always ends with `reconcileHost(all registered repos, null, panesOnce)` (`src/next.ts:1322`). One repo's `next` therefore judges every repo's slices. This is the reported shape.
2. `next --all` via `reconcileRepos(registered)` or `reconcileRepos([current])` (`src/next.ts:1406,1410`), same host call.
3. `next --resume` via `reconcileRepos(active)` (`src/next.ts:1428`). The host call still receives all registered repos, paused included (`src/next.ts:1322`).
4. `tab_closed` hook: per-owner `reconcile` then direct `reconcileHost(all, live, panesOnce)` (`src/next.ts:1440-1447`), reached only when exactly one owner exists and its repo is unpaused (`src/next.ts:1429-1438`).
5. `unpausePass` via `reconcileRepos([repo], …)` with its own `panes().catch(() => null)` (`src/next.ts:1526`).
6. Non-caller: the hook-pane path dispatches and calls `closeMergedTab` only, no reconcile (`src/next.ts:1463-1492`).

### Other steps judging liveness from the same one-session list

- Host filesystem sweep inside `reconcileHost`: `dropPath` vetoes deletion only on `livePaneInside(view, path)` from the same list (`src/reconcile.ts:1250-1259`), but `/proc` process and owner checks behind it are session-independent (`src/reconcile.ts:1260-1275`). Lower severity than the slice stop.
- Per-repo `reconcile`, fed the same shared `panesOnce` (`src/next.ts:1311-1316`): its own slice loop calls the same `sliceKeepReason`/`stopSlice` (`src/reconcile.ts:520-531`), so a pass run from a foreign session can stop the target repo's own seats too, not just other repos via the host step. Worktree, temp and unowned-entry removal also key on `tabLive`/`livePaneInside`/`foreignPaneInside` (`src/reconcile.ts:694-704,765,787,905,952,984,1079`), partly backstopped by process checks (`src/reconcile.ts:540-548,1090-1096`) and by `repoRunning`'s process arm (`src/reconcile.ts:839-853`).
- `broadcastInProgress` reads pane B's status from the same list and feeds the slice keep (`src/reconcile.ts:183-193,207`): a broadcast seat in another session can read as not busy.
- `closeMergedTab` (`src/reconcile.ts:383-389`, callers `src/next.ts:1181,1492`) acts only if the tab is found, so a foreign session fails safe (no close), except a same-id tab in the invoking session could be closed wrongly. Herdr ids are per server (session-routing brief, Why).
- Outside reconcile but same pattern, already owned by the herdr-session leaves: `activeCount` counts all repos against one `panes()` (`src/next.ts:353-370`, session-reads criterion 1) and `paneOwners` (`src/next.ts:1330`, session-reads criterion 4).

## 2. Forks

### K1. Interim fix now, or fold into session-routing

- O1. Fold in only. Routing resolves each repo's session and scopes `tabLive` to it (session-routing criterion 6). Breaks/invites: routing is still in plan.synthesis and session-reads waits on it (INTAKE), so every cross-session `next` keeps killing seats, paid runs included, until it lands. Also risks the host call keeping its single-list signature if criterion 6 is read as per-repo only (see section 4).
- O2. Interim guard in `sliceKeepReason`, covering both callers (`src/reconcile.ts:520,1194`): an absent tab no longer proves death by itself (see K2/K3 for the exact rule). Breaks/invites: dead tabbed slices stop later or only when empty, so leftovers accumulate visibly in the kept report (`src/reconcile.ts:1355`) until routing lands. Must be removed or subsumed by routing, or two "cannot judge" rules will disagree.
- O3. Interim host-only guard: `reconcileHost` never stops leaf-matched slices, per-repo step unchanged. Breaks/invites: leaves caller path 1's per-repo stop (`src/reconcile.ts:525`) able to kill the invoked repo's seats when run from a foreign session. It fixes the reported cross-repo case only.

### K2. What "cannot be judged" means

- O1. Tab absent from the invoking session = unjudgeable. The only definition available before discovery exists. Breaks/invites: in any multi-session setup, tab absence never stops a slice, so cleanup depends on K4. Safe, leaks until routing.
- O2. Tab absent from the repo's resolved session = dead (routing's binding: scoped-only lookup in the resolved session, session-routing design session-address Q2; session-reads criterion 2 says a same-id tab elsewhere does not keep). Breaks/invites: a seat placed in the wrong session before routing (the #117 shape in session-routing's Why) or a workspace moved between sessions records a tab the resolved session cannot see, and its slice still stops. Needs a corroborating veto (pane cwd inside the worktree, any session) or acceptance that legacy misplaced seats are out of scope.
- O3. No running session holds it = dead, judged on a tagged union. Breaks/invites: bare-id union matching false-keeps on id collisions across servers, so a union veto needs session tagging plus cwd corroboration, which is session-reads machinery, not an interim fix.
- O4. Any running session unreadable = unjudgeable for what it could decide (session-reads criterion 2's wording). Breaks/invites: under O2 an unreadable unrelated session decides nothing for this repo, under O3 it decides everything, so one wedged session can freeze slice cleanup host-wide. The fork must name which sessions can decide a given slice. Existing safe shape to reuse: a failed list is `null` and keeps (`src/next.ts:1352`, `src/reconcile.ts:208`), never an empty list.

### K3. Live process, no visible tab: may the slice stop?

- O1. Yes, current rule for leaf-matched slices (F4). Keeps leftover killing: processes leaked after a tab closes die. Breaks/invites: any false tab-death verdict (wrong session today, misplaced legacy seat under K2-O2) kills real work. This is the bug's blast radius.
- O2. Never: add `sliceHasProcess` as a keep in `sliceKeepReason`, matching the unmatched-slice rule (`src/reconcile.ts:1227`). Removes the failure class even if session logic errs again. Breaks/invites: leaked processes in a slice become immortal until a manual stop, reversing `tests/release-any-phase.test.ts:421-422`; an unreadable cgroup also reads as occupied (`src/reconcile.ts:155-180`), so a systemd read failure freezes slice cleanup.
- O3. Only when tab death is proven in the correct session (K2-O2/O3) may a busy slice stop; while unjudgeable, busy keeps and empty stops. Preserves leftover killing after routing and is safe before it. Breaks/invites: two stop rules keyed on judgeability, so the "proven" state must be one explicit value, not inferred separately at `src/reconcile.ts:520` and `src/reconcile.ts:1194`.

### K4. How leftovers still get cleaned under a keep

- O1. A later pass in the owning (or resolved) session proves the tab gone and stops it. This is today's workaround in INTAKE. Breaks/invites: repos nobody runs `next` for accumulate slices indefinitely.
- O2. Empty-slice stop without tab proof: an unjudgeable leaf slice with no process in its cgroup stops, extending the unmatched rule (`src/reconcile.ts:1227-1231`) to leaf-matched ones. Stopping an empty slice kills nothing. Breaks/invites: none for live work; a slice between process exit and a new run starting could be stopped, but `stopSlice` rechecks live run records under the admission lock (`src/reconcile.ts:214-219`).
- O3. Explicit manual stop only (separate path in `src/stop.ts:51`). Breaks/invites: cleanup becomes operator toil and stale slices pile up silently unless the kept reason is distinct and visible.

## 3. Pitfalls and tests

- P1. Empty list vs unavailable list. `reconcileRepos` passes `[]` when panes are not needed (`src/next.ts:1314`), and an empty list means "tab dead" to `sliceKeepReason`. Any fix that maps "wrong or unknown session" to `[]` instead of the existing `null`-keep (`src/reconcile.ts:208`) reproduces the bug.
- P2. Finished leaves with no recorded tab stop today without any pane fetch (`src/reconcile.ts:205-211,1193`). A fix keyed only on tab absence must not keep these forever; K4-O2 is what still cleans them.
- P3. The shared list is fetched once per pass (`src/next.ts:1349-1355`). Per-repo resolved lists change that cost and caching shape; a fix must not reintroduce one list keyed by the first repo judged.
- P4. Kept reasons are the only visibility into accumulation (`src/reconcile.ts:1196,1355`). A new keep needs its own reason text, not "live tab".

Tests (harness already exists: two-repo host isolation at `tests/release-any-phase.test.ts:379-422`, fake systemctl there and in `tests/leaf-slices.test.ts:415-440`):

- T1. Reported case: `next` for repo A; repo B has an unfinished tabbed leaf with a busy slice and its tab absent from the pane list. Expect no `stop` for B's slice in the systemctl log. Control in the same test: B leaf with absent tab and empty slice still stops (K4-O2), so cleanup is proven not disabled.
- T2. Same shape through the per-repo path: run the pass for B itself with B's tab absent and slice busy. Expect no stop. Catches a host-only fix (K1-O3).
- T3. Pane list unavailable for the host step with a second repo present: no slice of the other repo stops. Extends `tests/leaf-slices.test.ts:415` (single repo, per-repo path) to `reconcileHost`.
- T4. Deliberate break: drop the new keep; T1 and T2 must go red.

Fake-herdr support: an interim fix (K1-O2 with K3-O3 pre-routing semantics) needs none beyond today's fake, whose `pane list` returns one session's panes (`tests/fake-herdr.ts:153-159`) plus the existing fake-systemctl busy/empty slice control. Any K2-O2/O3 test needs the session support session-routing already requires of the fake (`--session`, per-session state, `session list --json`; session-routing brief, What) plus a per-session scripted failure, which today's single-db scripted failures (`tests/fake-herdr.ts:100-112`) cannot express.

## 4. Coverage in the emitted herdr-session contracts, and the gap

Covered: session-routing criterion 6 scopes reconcile `tabLive` to the repo's resolved session, and its design lists `src/reconcile.ts` scoped liveness as owned (session-routing design, Leaf architecture). Criteria 2-3 make zero/duplicate/unreadable resolution a visible per-repo refusal, and the design's stopped-and-ambiguous Q2 requires the host reconcile step to contain a per-repo refusal instead of aborting, with the mechanism left open for the plan (session-routing design, Open for the plan). Session-reads criterion 2 adds: worktree keep from any session, tab live only in the resolved session, and an unreadable session "closes nothing whose liveness that session could decide".

Gap: neither brief names `stopSlice`, systemd slices, or the host step's leaf-matched stop rule. Session-reads criterion 2 says "closes", which in both briefs means tab closes (`closeMergedTab`, `mergedWorktree`). Nothing asserts that a refused or unreadable repo's slices survive the host step, that a busy slice with a proven-gone tab may stop (K3), or that one repo's `next` run from another session leaves a second repo's live seats running. Criterion 6 fixes the cause only if the implementer changes `reconcileHost`'s single-list signature (`src/reconcile.ts:1144-1147`) to per-repo lists; as written it can be satisfied inside per-repo `reconcile` while the host stop at `src/reconcile.ts:1199` stays single-session. And nothing covers the period before routing lands (K1), during which the bug is live on every cross-session pass.

Most important: F2 plus K1. Until a slice can only stop on a tab death proven in the right session, or on an empty cgroup, any `next` from any session can kill every seat in every other session.
