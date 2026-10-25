# Report: session-routing

## Changed files and reasons

- `src/shell.ts` (db4f086f → 775d088e): `herdrArgv` builder, `session` schema, `repoSession` resolver memoized per `(repo.name, exe)` (cached refusals), `session list --json` cached once per process per exe, `DISCOVERY_DEADLINE_MS` (10 s) on every discovery read, `herdr()`/`command()` deadline pass-through, `panes`/`tabs`/`workspaces` take an optional session, `listSessions`.
- `src/next.ts` (0564a281): every call site routed through `repoSession`; raw agent start/prompt/busy-notice spawns run `herdrArgv` argv so `delivery_error.command` records the routed argv; `dispatchLeaf` resolves lazily before its first pane read; `allocate` uses the resolved `workspace_id`, tab reuse and recorded-pane close require workspace membership plus a member pane inside the expected worktree; `secondSeat` scans every running session under the deadline; `activeCount` counts a refused repo as its unfinished leaves.
- `src/reconcile.ts` (709ada33, 18292d79): both tab closes build routed argv; `closeMergedTab` and `closeTab` close a recorded tab only when it is in the resolved workspace AND has a member pane inside the leaf's expected worktree (design's acting-use rule; an untagged or cwd-foreign tab is not the leaf's seat); `reconcileHost` regains main's `acting` gate and gains a memoized `panesForRepo` so leaf-tab judgements read the owning repo's session while the filesystem veto keeps the cross-session union; `paneOwners` skips a session that dies between resolve and pane list.
- `src/phase.ts`, `src/log.ts`, `src/verify.ts`, `src/land.ts` (9c9f74aa): renames, notices, log pane lookups and the main-red notice carry the resolved session; a stopped/refused session suppresses the notice and the receipt still persists; `land` drops the `HERDR_SOCKET_PATH` `--setenv` and resolves per repo.
- `src/scope.ts` (0564a281): `inOwnScope`/`adoptShell`/`shellPid` take the resolved session name.
- `tests/fake-herdr.ts` (7742fe3d, d5703235): `sessions[]` stores, `--session` routing, `session list --json`, `sessionListError`/`delaySessionListMs`/`readError`/`deadRead` seams, `.calls-raw` sibling log; flat top-level db stays the implicit `default` session. Rebase merged with main's `failWorkspaceList` seam (now read from the per-session store `dbS`).
- `tests/session-routing.test.ts` (7742fe3d): new; 14 criterion tests.
- `tests/next.test.ts`, `tests/helpers.ts` (03bef701, 39a78f4e, 6ae30617): fixtures updated to routed argv; call-log helpers strip `--session` discovery prefixes.
- `tests/pause-next.test.ts` (3454ecbf, 18292d79, bf6c4a64): race-B wrapper skips `--session`; the deferred-cleanup fixture's seeded tab got `workspace_id: 'w1'` and a member pane inside the leaf worktree so it remains a closable seat under the membership rule.
- `tests/release-any-phase.test.ts` (cda19c7d): keep reason `'repo not reconciled by this pass'` → `'pane list unavailable'` because resolution refusal, not the acting set, now keeps a repo whose workspace exists in no running session.
- `tests/seat-containment.test.ts` (3454ecbf): observer wrapper skips `--session` before matching `pane process-info`.
- `tests/phase.test.ts`, `tests/green-merge.test.ts`, `tests/batch-dispatch.test.ts`, `tests/reconcile.test.ts` (9c9f74aa, d5703235, 6ae30617): argv assertions updated to the routed argv; merged-leaf fixture tab tagged `workspace_id`.
- `src/AREA.md`, `tests/AREA.md`, `docs/reference-index.md`, `docs/reference/state-and-phases.md` (plan's doc lines + `61d2b525`): resolver description and routed `delivery_error.command`.

## Implementation notes added to plan.md

- `reconcileHost` keeps `acting` + gains `panesForRepo`; closes enforce workspace membership AND member-pane-cwd inside the leaf's expected worktree; untagged tabs are out of scope (D5 strict equality); the earlier "untagged tabs stay in scope" relaxation was reverted because it closed foreign tabs (red: `leaf-slices` 'a finished leaf with a live tab keeps its slice').
- Rebasing onto origin/main surfaced `sessionRepos` (an invoking-session `workspace list` gate for reconcile and `tab_closed`). It was removed in the rebase resolution: `repoSession` subsumes it, and keeping it would skip repos invisible to the invoking session — the bug this leaf fixes.

## Refresh

- Fetched `origin`, rebased `session-routing` onto `origin/main` `7b007be5`. Prior base `20455420`, prior head `d29bdaee`; new base `7b007be5`, new head `61d2b52`. Conflicts: `tests/fake-herdr.ts` (kept both: per-session stores + main's `failWorkspaceList`), `src/next.ts` (kept `acting`, dropped `sessionRepos` calls and definition — superseded by `repoSession`), `src/reconcile.ts` (kept new comment block).

## Proof results

Proof commands recorded below run on head `61d2b52` (post-rebase). Two plan filters named stale test titles and were corrected under the proof-command rule: `-t 'skips stopped'` matched nothing → `--test-name-pattern 'listed-stopped|past the deadline|failed session list'`; `-t 'routes agent'` matched nothing → `'agent start|reconcile tab close'`; `-t 'renames and notices'` matched nothing → `'phase renames|merge notice|stopped repo session'`; c2's single filter widened to cover the --all half (`'refuses missing|refused repo reports'`). Commands, results:

| # | Command | Commit | Result |
|---|---------|--------|--------|
| 1 | `akrogon run-check --name session-routing-c1 -- bun test tests/session-routing.test.ts --test-name-pattern 'routes seats'` | 61d2b52 | `check session-routing-c1: 0 implementation/check-session-routing-c1-1792861592677-2138303.log` (1 test, ~1 s) |
| 2 | `akrogon run-check --name session-routing-c2 -- bun test tests/session-routing.test.ts --test-name-pattern 'refuses missing|refused repo reports'` | 61d2b52 | `check session-routing-c2: 0 implementation/check-session-routing-c2-1792861593841-2139367.log` (2 tests) |
| 3 | `akrogon run-check --name session-routing-c3 -- bun test tests/session-routing.test.ts --test-name-pattern 'listed-stopped|past the deadline|failed session list'` | 61d2b52 | `check session-routing-c3: 0 implementation/check-session-routing-c3-1792861605836-2142043.log` (3 tests, ~10 s deadline test) |
| 4 | `akrogon run-check --name session-routing-c4 -- bun test tests/session-routing.test.ts --test-name-pattern 'agent start|reconcile tab close'` | 61d2b52 | `check session-routing-c4: 0 implementation/check-session-routing-c4-1792861607922-2147102.log` (2 tests) |
| 5 | `akrogon run-check --name session-routing-c5 -- bun test tests/session-routing.test.ts --test-name-pattern 'second-seat'` | 61d2b52 | `check session-routing-c5: 0 implementation/check-session-routing-c5-1792861610840-2150692.log` |
| 6 | `akrogon run-check --name session-routing-c6 -- bun test tests/session-routing.test.ts --test-name-pattern 'tab reuse'` | 61d2b52 | `check session-routing-c6: 0 implementation/check-session-routing-c6-1792861611726-2151436.log` |
| 7 | `akrogon run-check --name session-routing-c7 -- bun test tests/session-routing.test.ts --test-name-pattern 'land unit'` | 61d2b52 | `check session-routing-c7: 0 implementation/check-session-routing-c7-1792861611988-2152391.log` |
| 8 | `akrogon run-check --name session-routing-c8 -- bun test tests/session-routing.test.ts --test-name-pattern 'phase renames|merge notice|stopped repo session'` | 61d2b52 | `check session-routing-c8: 0 implementation/check-session-routing-c8-1792861613255-2152650.log` (3 tests) |

## Checks (akrogon verify)

- `akrogon verify` on `bf6c4a64`: green — `verify test: 0 implementation/check-test-1792862505424-3760738.log` (1130 tests, 205.59 s), `verify typecheck: 0 ...-1792862508922`, format 0. 
- `akrogon verify` on head `61d2b52`: green — `verify test: 0 implementation/check-test-1792864696141-3737264.log` (1130 tests, 226.90 s), `verify typecheck: 0 ...-1792864700996`, format 0, receipt run `4bf29e7e`. Head is now `0c21547`, an empty trailer-citation commit on the same tree, so the receipt covers it.
- Earlier `akrogon verify` runs on `61d2b52` were red on load-sensitive flakes with no cause in this diff:
  - run `7c52e493`: `status` 'overview reads multiple repos' — `TIME` '0h 23m' expected, got '0h 22m'. Mechanism: the fixture writes event timestamps in `log()` then the prompt timestamp in `timings()` from separate `Date.now()` calls, so `clock` floors `23m − δ` to 22 whenever the two calls cross a millisecond boundary. Flaky on origin/main too (reproduced standalone on origin/main content: `check` red on the same expectation).
  - run `a5dbe62d`: same status flake.
  - run `64abee39`: `next.test.ts` merge-queue tests timed out at their 15 s/60 s limits under host load average ~30; the same tests pass standalone in seconds (e.g. 'a leaf re-entering merge' 5.25 s; 'named target equivalence' 32 s standalone vs 60 s cap).
- `akrogon verify --known-red` on `61d2b52`: head run `318a65f5` (red: overview only), base run `ff792d90` at merge-base `20455420` green (1116 pass); second base run `2fa95313` red on seven merge-queue timeouts but not `overview`, so no covering pair — verdict `fail` both times. Causal-fit judgement: `overview` has no cause in this diff (status paths untouched; failure reproduced on origin/main content in `/tmp/sr-main-check`), and the base ran it green once; the merge-queue timeouts are load flakes present identically on the base run.
- Retried reds: leaf-slices 'live tab' (red → green after the reconcile fix), status 'overview' standalone green on this head, merge-queue tests standalone green. In-suite runs keep drawing fresh flakes from the same load-sensitive pool.

## Known limitations

- `tab_closed` owner matching keeps stored-id comparison (carried from the plan; session-reads leaf owns it).
- Deleted in-progress debug leftovers found uncommitted (`DBG_SLICE` prints in `src/reconcile.ts`, `tests/leaf-slices.test.ts`) — they were never part of any commit's intent.
- The final commit `0c21547` is an empty trailer-only commit (allowed by the rule) carrying contiguous `Test-Change:` citations; several earlier commits had blank-line-separated trailers that git's trailer parser ignores, so `requireTestChangeCitations`/`requireFrozenCitations` could not see them.

## Phase result

`akrogon phase session-routing check.review --slot A` → `moved check.review`.

## check.fix — 2026-10-24 (slot A, round 1)

B's check.repair repaired product fixes F1-F3 (head `d7c11af`) and handed two test-scope items to A; B's verify on `d7c11af` was red on the stale `empty` expectation plus two load-sensitive timeouts.

### Repairs

- **F2 expectation correction** (`b63aac6`): `tests/next.test.ts` 'allocation handles an empty tab' — the repaired allocator rejects a recorded tab with no worktree member and creates a replacement, so the old `exit 1`/no-panes expectation contradicted criterion 6. Now asserts exit 0, `allocated.tab` differs, the orphaned tab stays open and no `tab close` targets it; interrupted/recreated cases unchanged. Red before: `check fix-a-empty-before: 1 implementation/check-fix-a-empty-before-1792866696492-2302171.log`; green after: `check fix-a-empty-after: 0 implementation/check-fix-a-empty-after-1792866707624-2313036.log` (all three edges).
- **F4 missing criterion cases** (`a95d728`, amended to `e0a57bd` for a prettier wrap):
  - Criterion 7: 'land wake calls reach the resolved session under a stale parent socket' — green-merge-shaped run: `land` exits 0 with `HERDR_SOCKET_PATH` set to the foreign session, and the wake's merged-tab close lands in the resolved session `main` while `other` gets no mutations. Deliberate break (drop `--session` on `closeMergedTab`'s `tab close`) goes red: `check fix-a-land-wake-break: 1 implementation/check-fix-a-land-wake-break-1792866882049-2417039.log`.
  - Criterion 8: 'the main-red notice reaches the running session holding the repo workspace' — `verify --known-red` with the repo workspace in running session `held` records `"notice":"shown"` on the receipt and the `main red` `notification show` lands in `held`. Deliberate break (drop `--session` on `sendMainRedNotice`) goes red: `check fix-a-mainred-break: 1 implementation/check-fix-a-mainred-break-1792866885648-2419122.log`.
- Full criterion suite green on the committed head: `check fix-a-session-routing: 0 implementation/check-fix-a-session-routing-1792866898436-2420359.log` (19 pass) — plus `check fix-a-land-wake: 0 implementation/check-fix-a-land-wake-1792866870765-2412378.log` for the land case alone.

### Verification

- `akrogon verify` on `e0a57bd`: **green** — format 0 (`check-format-1792867536651-2935136.log`), `verify test: 0 implementation/check-test-1792867546726-2935136.log` (1135 tests, 358.60 s), `verify typecheck: 0 ...-1792867553970`; run `0cbbce73`. The two timeouts B saw on `d7c11af` (`merge queues behind`, `named target equivalence`) passed in this run — same load-sensitive flake pool recorded above, no cause in this diff.
- A first verify on pre-amend `a95d728` was red on `format` only (prettier wrap in the new cases); the amend fixes it, same tree content plus formatting.

### Phase result

`akrogon phase session-routing check.review --slot A` → moved check.review.
