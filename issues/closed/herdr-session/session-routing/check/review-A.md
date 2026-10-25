# Review A — session-routing

- Base: `origin/main` `7b007be5` (post-rebase)
- Reviewed head: `0c21547` (tree `27acbf41`, same tree as `61d2b52`)
- Verdict: **ready**

## Verification evidence

- `akrogon verify` green on head tree: run `4bf29e7e`, log `check-test-1792864696141-3737264.log` (1130 tests); receipt covers `0c21547` (identical tree to run head `61d2b52`).
- Own re-run of the criterion suite: `akrogon run-check --name check-review-session-routing -- bun test tests/session-routing.test.ts --timeout=30000` → 14 pass / 0 fail; `check check-review-session-routing: 0 implementation/check-check-review-session-routing-1792865045303-323982.log`.
- Report's criterion proofs spot-checked against cited logs; final runs all exit 0. Earlier red runs are documented fail-before evidence, not current state.

## Design decisions checked

- D1 argv order: `herdrArgv` puts `--session <name>` before the subcommand; every herdr call site routes through it.
- D2 discovery: `session list --json` once per exe per process, `workspace list` per running session under `DISCOVERY_DEADLINE_MS` (10 s), deadline hit counts as unreadable.
- D3 refusals: duplicates, unreadable sessions, no running holder and session-list failure each refuse with searched/skipped-stopped/unreadable/duplicates named; invocation-scope failures report once across repos (`sessionRefusals` key `*`).
- D4 dispatch: lazy resolution in `dispatchLeaf`; paused/merged/wait-listed leaves cost no session list; refusal skips the leaf after reporting once; `activeCount` counts a refused repo's unfinished leaves, never `max_active`.
- D5 allocation: tab reuse/member/close scoped to the resolved `workspace_id`; second-seat guard scans all running sessions before `tab create`, skips dead reads, fails loud on unreadable ones.
- D6 reconcile: recorded tab close only inside the repo workspace with a member pane in the leaf worktree; refused/dead session keeps the worktree; `reconcileHost` judges leaf slices per repo via `panesForRepo` while the filesystem veto keeps the cross-session `allSessionPanes` union; superseded `sessionRepos` gate dropped.
- D7 elsewhere: `HERDR_SOCKET_PATH` no longer forwarded to the land unit; `renameTab`, `announceFailed`, `mergeNotice`, `sendMainRedNotice` resolve and route; `delivery_error.command` and warnings record the routed argv.

## AREA.md path check

`src/AREA.md`, `tests/AREA.md` lines verified against live tree (files named exist); `docs/reference-index.md` and `docs/reference/state-and-phases.md` updated lines match implemented behavior (`--session` routing, routed argv in `delivery_error.command`).

## Findings

No Fixes. Three observations below the Fix bar (no consequence today):

- `dispatchSlot` resolves eagerly even when the slot is already recorded done; resolution is memoized, so the cost is one map lookup.
- `logMove` pane lookup yields no pane record on session refusal; same diagnostic loss as unreachable herdr, which the code already tolerated.
- `panesForRepo` accepts an unused `invocation` parameter (signature symmetry with the old `panesOnce` call sites).
