# Plan: session-routing

## Decisions

- D1. All herdr traffic goes through one argv builder in `src/shell.ts`: `herdrArgv(args, {session, exe})` produces `[exe, ...(session ? ['--session', session] : []), ...args]`, `exe` defaulting to `'herdr'` so watch-session can pass `OBSERVE_HERDR`. `herdr(args, schema, opts?)` gains `{session?, exe?, deadlineMs?}`; `command(argv, cwd, stdin?, deadlineMs?)` gains the deadline pass-through (`run` already owns `deadlineMs`). `panes/tabs/workspaces` take an optional session. Raw `['herdr', ...]` spawns in `next.ts` (busy notice, agent start, agent prompt) and `reconcile.ts` (both tab closes) are built by `herdrArgv` and executed by `run`, so the recorded argv (`delivery_error.command`, keep reasons, warnings) is exactly the routed argv.
- D2. Resolution lives in `src/shell.ts` as `repoSession(repo: Repo, opts?: {exe?: string}): Promise<SessionResolution>` where `SessionResolution = {ok: true, session: Session, workspace: {workspace_id: string; label: string}} | {ok: false, reason: string}`. It is memoized per `(repo.name, exe)` for the process — one resolution per repo per invocation, cached refusals included. `session list --json` is fetched once per process per `exe` (schema `{sessions: [{name, running, socket_path, session_dir, default}]}`; the reply is the bare `{sessions}` object, not `{result: ...}`). Every `session list`, `workspace list`, and the second-seat guard's `pane list`/`tab list` runs with a 10 000 ms `deadlineMs`; a deadline counts as unreadable.
- D3. Refusal reasons name: the label searched (`repo.name`), the sessions searched and the sessions skipped as stopped, and for duplicates each session and workspace_id. `repoSession` returns the reason; it never throws. Contexts that can only fail (phase, verify notice, log lookup inside committed moves) throw the reason as a plain `Error`; `next` paths report it once per repo per invocation through `report()`.
- D4. `dispatchLeaf` resolves lazily, just before its first pane read (the busy-observation list at next.ts:718), which is after the merged/failed fast paths but before allocate. Rationale: the "before the first pane or tab list" rule holds, and refusal-style tests that assert zero herdr calls for paused/stopped/pre-resolution rejections keep their meaning. A refused repo reports once and every leaf of that repo returns `'skipped'`. `activeCount` treats a refused repo as `unreadable.length` plus every unfinished leaf (its seats may be live where the pass cannot see), contributing no `max_active` floor so one refused repo cannot starve another.
- D5. `allocate` uses `resolution.workspace.workspace_id` as the `--workspace` target (drops the `workspaces()` label scan — the resolver already found the unique label match). Tab reuse and the recorded-pane close keep only tabs whose `workspace_id` equals the resolved workspace and that have a member pane whose cwd is inside `resolve(worktreeStore(repo), slug)`; a same-id tab elsewhere in the session is not a match. Liveness (`dispatchLeaf` failed-leaf pane lookup, `tabLive`, phase renames) looks up the stored id in the resolved session only.
- D6. Second-seat guard: when `matches.length === 0`, after `ensureWorktree` computes the expected path and before `tab create`, list panes and tabs of every session still marked running in the cached session list (skipped-stopped sessions were never started). A pane with non-null cwd inside the expected worktree whose tab's `workspace_id` is not the repo workspace refuses, naming the session and pane. Any per-session read error or deadline makes the guard refuse. Panes in the repo workspace pass; the tab then creates there.
- D7. `reconcile(repo, leaves, live, failures)` keeps its signature; `live` is the resolved session's panes supplied by `reconcileRepos` via a per-repo resolver (`panesForRepo`), which yields `null` for a refused or unreadable repo — every pane-dependent judgement keeps. `reconcileHost` gains the same `panesForRepo` for leaf-tab judgements; its unowned-filesystem veto uses the union of pane lists across running sessions and counts any unreadable session as `null` (keep). Both raw `tab close` spawns build routed argv through `herdrArgv`.
- D8. `scope.ts`: `inOwnScope(slice, paneId, session)` and `adoptShell(slice, paneId, session)` take the resolved session name; `shellPid` calls `herdr` with it. Callers in `allocate`/`box` pass `resolution.session.name`.
- D9. `src/land.ts` drops the `HERDR_SOCKET_PATH` `--setenv` lines; the land process resolves per repo through `repoSession`, so `mergeWake`/`landedWake`/`mergeNotice` reach the resolved session with a stale socket in the environment.
- D10. `src/verify.ts` `sendMainRedNotice` resolves the repo session; on refusal or stopped session it records `notice: 'error'` through the same locked receipt write — no notice, receipt persists. `src/log.ts` `logMove` resolves and passes the session into its pane lookup; a refused resolution is swallowed like a `CommandError` (diagnostic only). `src/phase.ts` `herdrCall`/`renameTab`/`announceFailed` pass the resolved session; a refused repo surfaces the refusal as the move's error (moves stay committed-first).
- D11. Fake herdr: `tests/fake-herdr.ts` keeps the flat top-level db as the implicit `default` session's store (`{panes, tabs, workspaces, serial, ...}`) so every unmodified fixture resolves the `repo` workspace with no per-test change. A new optional `sessions: {name, running?, socket_path?, session_dir?, default?, delayMs?, panes, tabs, workspaces, serial, ...}` array adds sessions; `running` defaults `true`, `socket_path` defaults to `<db>-<name>.sock`. Routing: `--session <name>` selects (unknown name and `running: false` both fail `server_not_running` on stderr, exit 1); otherwise `HERDR_SOCKET_PATH` selects the session whose `socket_path` matches, else `default`. `session list --json` prints the bare `{sessions: [...]}` reply (plus `delaySessionListMs` and `sessionListError` failure seams). The `.calls` log keeps recording stripped argv so existing assertions stand; raw argv (with `--session`) is appended to a sibling `<db>.calls-raw` log.
- D12. Per-repo refusal containment (design "Open for the plan"): `repoSession` caches the refusal, so `selectLeaves` (already session-free), `paneOwners` (a refused repo contributes no owners), the reconcile repo loop (`live = null`) and `selectLeaves`-style refusals never abort the pass; the report lands once via `report()` and `invocation.skipped` makes the invocation exit non-zero.

## Read first

- `src/shell.ts` — herdr wrapper, schemas, `run` deadline.
- `src/next.ts` — `observeBusy`, `currentPane`, `activeCount`, `allocate`, `dispatchSlot`, `dispatchLeaf`, `paneOwners`, `panesOnce`, `closeMergedTab`/`mergeNotice` callers.
- `src/reconcile.ts` — `closeMergedTab`, `closeTab`, `reconcile`, `reconcileHost`, `reconcileNeedsPanes`.
- `src/phase.ts` — `herdrCall`, `renameTab`, `announceFailed`, `commitMove`/`logMove` call.
- `src/verify.ts` — `sendMainRedNotice`; `src/log.ts` — `logMove`; `src/scope.ts` — `shellPid`/`inOwnScope`/`adoptShell`; `src/land.ts` — `launchLand`.
- `tests/fake-herdr.ts`, `tests/helpers.ts`, `tests/next.test.ts` (dispatch fixture + calls/prompts helpers), `tests/green-merge.test.ts` (land harness), `tests/verify.test.ts` (receipt seeding), `tests/batch-dispatch.test.ts` (merge-notice shape).
- Design record: `issues/chart/herdr-session/forks/operation-proofs.md` (P1-P7 real herdr behavior).

## Interfaces

- `shell.ts`: `type Session = {name, running, socket_path, session_dir, default}`; `type SessionResolution` (D2); `repoSession(repo, {exe?}?)`; `herdrArgv(args, {session?, exe?})`; `herdr(args, schema, {session?, exe?, deadlineMs?}?)`; `panes(session?)`, `tabs(session?)`, `workspaces(session?)`; `command(argv, cwd?, stdin?, deadlineMs?)`.
- `scope.ts`: `inOwnScope(slice, paneId, session)`, `adoptShell(slice, paneId, session)`.
- `reconcile.ts`: `closeMergedTab(repo, leaf, live)` resolves internally; `closeTab` builds routed argv.
- `next.ts`: `panesForRepo(repo, invocation)` helper feeding reconcile.

## Checklist

### Wave 1

- U1 `tests/fake-herdr.ts` + `tests/session-routing.test.ts` (new) + `tests/helpers.ts` if a sessions seeder lands there. Fake sessions + criterion tests (T1-T8 below). No shared test resources; prerequisite for every later unit's verification.

### Wave 2

- U2 `src/shell.ts` — argv builder, session schema/resolver/cache, deadline plumbing, `panes/tabs/workspaces` session param. Prerequisite for all consumers; owns the file alone.

### Wave 3 (U2 + U1 landed; units are disjoint)

- U3 `src/next.ts` + `src/scope.ts` — resolution in dispatch, allocate/guard/reuse rules, dispatchSlot, notices, hook paths, `panesForRepo`, `activeCount`. Owns `tests/next.test.ts` call-shape updates (`calls` filter, routed-argv assertion at :137) and `tests/pause-next.test.ts`/`tests/seat-containment.test.ts` wrapper scripts.
- U4 `src/reconcile.ts` — routed closes, `reconcileHost` per-repo panes + all-session veto union. Owns `tests/reconcile.test.ts`/`tests/leaf-slices.test.ts` call-shape updates if any.
- U5 `src/phase.ts` + `src/log.ts` + `src/verify.ts` + `src/land.ts` — session into rename/notice/log lookup, verify notice refusal path, drop socket forwarding. Owns `tests/green-merge.test.ts` (argv update), `tests/phase.test.ts`/`tests/status.test.ts`/`tests/state.test.ts` argv assertions, `tests/batch-dispatch.test.ts` calls filter.

Any commit touching an existing test file carries `Test-Change: <path> <source and reason>`; the new test file and fake get trailers in the commit that adds them.

## Criterion proofs

Proof command for every criterion: `akrogon run-check --name <label> -- bun test tests/session-routing.test.ts` (and the named sibling file where listed). Each maps the brief's observation to the fixture boundary: fake-herdr session stores + `.calls-raw` are the real boundary; state before/after is the seeded db and leaf `state.yaml`; the product failure caught is an unrouted or misrouted herdr call.

| # | Test | Command | Size | Rerun trigger |
|---|------|---------|------|---------------|
| 1 | `routes seats into the session holding the repo workspace` | `akrogon run-check --name session-routing-c1 -- bun test tests/session-routing.test.ts -t 'routes seats'` | seconds | edits to shell.ts resolver or next.ts dispatch |
| 2 | `refuses missing and duplicate repo workspaces` | `akrogon run-check --name session-routing-c2 -- bun test tests/session-routing.test.ts -t 'refuses missing'` | seconds | resolver or refusal-message edits |
| 3 | `skips stopped and dead sessions, fails discovery reads on deadline` | `akrogon run-check --name session-routing-c3 -- bun test tests/session-routing.test.ts -t 'skips stopped'` | seconds (fake delay is killed at 10s deadline) | resolver/deadline edits |
| 4 | `routes agent start, prompt, busy notice and reconcile closes` | `akrogon run-check --name session-routing-c4 -- bun test tests/session-routing.test.ts -t 'routes agent'` | seconds | argv builder or next/reconcile edits |
| 5 | `second-seat guard refuses panes in the worktree outside the repo workspace` | `akrogon run-check --name session-routing-c5 -- bun test tests/session-routing.test.ts -t 'second-seat'` | seconds | guard edits |
| 6 | `tab reuse, pane close and liveness stay in the resolved session` | `akrogon run-check --name session-routing-c6 -- bun test tests/session-routing.test.ts -t 'tab reuse'` | seconds | allocate/reconcile edits |
| 7 | `land unit drops HERDR_SOCKET_PATH and its calls route` | `akrogon run-check --name session-routing-c7 -- bun test tests/session-routing.test.ts -t 'land unit'` | minutes (green-merge-shaped run) | land.ts edits |
| 8 | `renames and notices go to the resolved session; stopped session suppresses the notice` | `akrogon run-check --name session-routing-c8 -- bun test tests/session-routing.test.ts -t 'renames and notices'` | minutes (verify run) | phase/verify/log edits |

Red evidence: `akrogon run-check --name session-routing -- bun test tests/session-routing.test.ts` exited 1 with all 14 tests failing — `check session-routing: 1 issues/open/herdr-session/session-routing/implementation/check-session-routing-1792851824120-3154965.log`. Today the product never sends `--session`, so routing tests fail on unrouted calls or session-unaware resolution; refusal tests fail because no refusal exists.

## Open limitation carried

`tab_closed` owner matching keeps its stored-id comparison; origin attribution arrives in session-reads per the chart's deferral.

## Docs

One line each: `src/AREA.md` (shell wraps herdr calls with the repo-resolved `--session`; discovery carries a 10 s deadline), `tests/AREA.md` (fake-herdr sessions + `.calls-raw`), `docs/reference/state-and-phases.md` (delivery `command` is the routed argv). No skills or other human docs are affected.
