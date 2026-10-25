# Report: session-reads

## Base and head

- Base: `842c85cf` (origin/main; refreshed mid-pass — the branch was created at `e0a57bd7`, `origin/main` advanced during implementation, and the leaf branch was rebased; prior head `a86bfbb`-equivalent stack, new head `fb1dc3d`)
- Head: `fb1dc3de97095943f57d6a49439186481e9a3f04`
- Mode: delegated (wave 1: U1, U2, U3 in parallel; wave 2: U4, U5 in parallel)

## Changed files and reasons

- `src/shell.ts` — `sessionPanes(exe?)`: session-tagged pane union over running sessions; `server_not_running` skips a session, any other read error, a `DISCOVERY_DEADLINE_MS` hit or a failed session list yields `null`. The liveness probe is `herdr(['workspace','list'], …, {deadlineMs: DISCOVERY_DEADLINE_MS})` — a plain `workspaces()` call carries no deadline (A fix `2a3a6ba1` on U4's probe). D1.
- `src/next.ts` — `allSessionPanes` projects `sessionPanes` (U1); `hookEventSchema` requires `workspace_id` on all four variants; `nextCommand` resolves the emitting session from `HERDR_SOCKET_PATH` against `listSessions` (`session list failed` → exit 1, `unknown origin` → logged + exit 0); `hookScope` gates per repo (refusal → `report()` once; session/workspace mismatch → `console.error` line, exit 0); `paneOwners`/`tab_closed` take the gated path; hook pane id comes from `event.data.pane_id` and the `HERDR_PANE_ID` env read is deleted; `activeCount` reads the tagged union (`null` → `max_active`; leaf active = unfinished + own-session tab match or union cwd inside the worktree; refused repo keeps `unreadable + unfinished`); both `reconcile` callers pass `live` + `union` (`hostPanesOnce`) per `reconcileNeedsPanes`. D2, D4–D7.
- `src/reconcile.ts` — `reconcile(repo, leaves, live, union = live, failures?)`: `live` drives tab judgements (`tabLive`, `seatTabs`/`closeTab`, `broadcastInProgress`, `sliceKeepReason`, `repoRunning`); `union` drives every cwd/presence veto (`livePaneInside`, `foreignPaneInside`, `dropChecked` chains, retired-lock and leaf-temp drops); `union === null` keeps pane-dependent entries with reason `pane union unavailable`. D3.
- `src/log.ts` — `logMove` pane id is `slot === null ? undefined : before.pane[slot]`; the `HERDR_PANE_ID` fallback is gone. D8.
- `tests/session-reads.test.ts` — 7 criterion tests, committed red-first at `b0ef83f8` (before product code).
- `tests/next.test.ts`, `tests/pause-next.test.ts`, `tests/keep-rule.test.ts`, `tests/leaf-stop.test.ts`, `tests/release-any-phase.test.ts` — hook invocations carry `HERDR_SOCKET_PATH` and `workspace_id`; two wrong `workspace_id` payloads corrected `w2`→`w1`; `Test-Change:` trailers on each.
- `src/AREA.md`, `tests/AREA.md` — one-line notes for the union/gating behavior and the new suite.

## Wave deviations (recorded, both accepted)

- U3: `union` as the 4th `reconcile` param broke the two positional `failures` callers in `next.ts`; approved minimal edit passing `live, live` so the unit landed compilable; U4 rewired the real union. (worker question → O1)
- U4 flagged its own `src/shell.ts` edit: `sessionPanes` probes `workspace list` before `pane list` so a dead-but-listed session is skipped without a pane call — required to keep session-routing's committed `toSession('ghost')` no-pane-calls assertion true. Accepted; A additionally bounded the probe with `DISCOVERY_DEADLINE_MS` after review.

## Commands run

- `akrogon run-check --name session-reads-red2 -- bun test tests/session-reads.test.ts` → exit 1, 5 fail / 2 pass — `check-session-reads-red2-1792869504714-1860251.log` (red evidence on `b0ef83f8`; C1, C2, C4, C5, C7 red; C3, C6 structural).
- Worker targeted checks: `u1-routing` 0 (19 pass), `u2-log` 0 (4 pass), `u3-reconcile-serial` 0 (55 pass; parallel run flaked on 5s timeouts under host load ~150, reproduced identically on unmodified HEAD — environmental), `u4-next` 0 (266 pass, 59s), `u5-suites` 0 (47 pass, 18.5s, `--timeout 60000`).
- `akrogon run-check --name session-reads-proof -- bun test --timeout=60000 tests/session-reads.test.ts` → 0, 7 pass — `check-session-reads-proof-1792876300861-84898.log` (head `2a3a6ba1`-equivalent pre-docs head).
- `akrogon run-check --name session-reads-proof-plain -- bun test tests/session-reads.test.ts` → 0, 7 pass — `check-session-reads-proof-plain-1792876332075-142234.log`.
- `akrogon run-check --name typecheck -- sh -c '…bun run typecheck'` → 0 — `check-typecheck-1792876384726-228635.log`.
- `akrogon run-check --name format -- sh -c '…prettier --check src tests skills/chart-issues/scripts'` → first run 1 (`tests/pause-next.test.ts` unformatted — U5's edit; fixed at `fb1dc3d`), rerun 0 — `check-format-1792876402444-250920.log`.
- `akrogon verify` on `fb1dc3d` → green: format 0, test 0 (1142 pass, 204s), typecheck 0 — receipt `verify leaf fb1dc3de…: green`.

## Criterion proofs

| # | Proof | Commit | Result |
|---|-------|--------|--------|
| 1 | `capacity counts a seat living in another session and an unreadable session blocks launches` | fb1dc3d | pass |
| 2 | `foreign-session panes and unreadable sessions veto reconcile removal` | fb1dc3d | pass |
| 3 | `a fresh pane read sees the seat created earlier in the pass and ignores a closed tab` | fb1dc3d | pass |
| 4 | `a tab_closed hook acts only for a matching socket and workspace` | fb1dc3d | pass |
| 5 | `a pane event acts on the event pane only inside the matching session and workspace` | fb1dc3d | pass |
| 6 | `a manual next ignores an inherited HERDR_PANE_ID` | fb1dc3d | pass |
| 7 | `log session is null without a slot and comes from the slot pane otherwise` | fb1dc3d | pass |

All via `akrogon run-check --name session-reads-proof-plain -- bun test tests/session-reads.test.ts`, exit 0, log above.

## Known limitations

- A foreign-session seat is detectable only by pane cwd inside the leaf worktree; a seat whose cwd leaves the worktree is invisible to capacity (carried from plan).
- A stale-but-consistent hook env (real socket + matching workspace_id) still passes the gate; it proves origin, not freshness (carried from plan).
- The criterion suite is timeout-sensitive under heavy host load (LA >100); green runs cited are exact-command runs.

## Unverified criteria

None.
