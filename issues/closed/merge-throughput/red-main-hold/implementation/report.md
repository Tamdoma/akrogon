# Implementation report: red-main-hold

Base: `547063c` (origin/main) · Head: `ec9fe38` · Mode: subagents, 2 waves of 2 workers.

## Changed files and reasons

- `src/hold.ts` (new): per-repo hold record in `held.yaml` under `globalHome()`, mirror of `pause.ts` — `holdSchema`/`Hold` (optional `fix` field reserved for hold-fix-leaf), `readHeld`/`heldFor`/`writeHeld`/`dropHeld` lock-free for callers inside `withLock`, `setHeld`/`clearHeld` under the global lock, `unholdCommand` printing `unheld <repo>` / throwing `No hold on <repo>`, `HoldStateError` naming the file.
- `src/phase.ts`: `phaseCommand` gains `rawRedOnBase`/`rawCommand` with early refusals (`--command` without `--red-on-base`, `--check` + `--red-on-base`, non-`check.fix`, missing `--command`, no batch record); the hold path runs after the stale-attempt check — `git fetch`, `localBase` sha equality, `restoreMembers`/`restoreHolder`, `appendAttempt(..., 'held')`, `batch: undefined` with no `batch_limit` write, `writeHeld` naming sha/command/holder/attempt/`review-B.md` evidence, `held <repo> on <sha>: <command>` print, `committed = true`, and a `notification show` via `herdrCall` that degrades to a JSON warning.
- `src/next.ts`: `mergeTurn` hold guard at the two locked sites — after the fetch/warn block and inside the batch-creation `withLock` after `localBase`; equality outside `issues/`/`learnings/` (`equalOutsideRecordFolders`) prints the held line and returns, a moved main drops the hold and the turn proceeds.
- `src/akrogon.ts`: phase options `'red-on-base'`/`command` passed through, `unhold` case + usage line, `unpause` prints `held <repo> on <sha>: <command>` before `unpausePass`.
- `src/status.ts`: reads `held.yaml` beside `paused.yaml`; board and `--charts` headings show `(held)` / `(paused) (held)`; slug form prints `held: <sha> <command>`.
- `skills/merge-issue/SKILL.md`: Shared-endings red paragraph now judges base first (check-issue:61 run shape referenced, not duplicated), records both runs + cause in `review-B.md`, ends base-red runs with the full `--red-on-base` call, documents refetch/re-judge on refusal; the attempt-top paragraph names the held ending.
- `README.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `src/AREA.md`: `unhold` row, phase flags, hold semantics, hold-vs-pause distinction, one AREA line.
- `tests/hold.test.ts` (new, 10 cases): batch and solo `--red-on-base` happy paths, seven refusal shapes + no-record refusal, `unhold` from root/subfolder/leaf worktree + absent-hold failure, notification-failure degradation, hold blocks `next` at fetched sha, hold survives an issues/-only main advance, real advance clears hold and starts an attempt, `unhold` then `next` dispatches.
- `tests/pause-status.test.ts` (+4 cases): held heading alone/with paused/until unhold on board and `--charts`, `unpause` hold line, slug-form `held:` line, invalid `held.yaml` naming the file.
- `tests/command-reference.test.ts`: contracts extended for the new phase flags and `unhold` (trailer carried).

## Tests run

- `AKROGON_BASE=547063c52e068702aaa9e77117b749e9d1341275 bun test --changed="$AKROGON_BASE" --timeout=30000` — 45 pass, 0 fail after all units landed.
- `bun test --timeout=30000` — 629 pass, 0 fail, 32 files, 48.95s wall.
- `bun run typecheck` — clean.
- `bun run format` — clean; the `src/status.ts` `phaseColor` reflow was pre-existing drift (lesson 2026-10-08) and was reverted; the `command-reference` line wrap our change caused was committed (`ec9fe38`).
- Deliberate breaks recorded by workers: U1 skipped `writeHeld` → 4 of 6 hold tests red; U2 removed the site-1 `return` → the hold-blocks-next test red. Both restored green.

## Done-criteria → evidence

1. Valid `--red-on-base` leaves holder in merge, record cleared, members at saved heads, `held.yaml` entry, one `held` line — `tests/hold.test.ts` batch + solo cases.
2. Stale attempt / wrong sha refused, nothing changes — refusal battery in `tests/hold.test.ts`.
3. Held + unchanged main starts no attempt and prints why — "a hold at the fetched sha blocks next".
4. Main moved outside `issues/`/`learnings/` clears and proceeds; issues-only stays held — "main advance outside record folders clears…" and "survives a main advance confined to record folders".
5. `unhold` clears; absent hold fails naming the repo — `unhold` cases + `tests/pause-status.test.ts` unpause coverage.
6. `status` shows paused and held independently; `unpause` prints the hold — pause-status additions.
7. One `notification show` per hold — fake-herdr `.calls` assertion in the hold cases.
8. Skill and docs — `SKILL.md` red paragraph, README row + contract test, `docs/guide/merge.md`, `next.md`, `cheat.md`.
9. Blocking checks — all green above; no `merge_checks` configured.

## Known limitations

- U1's criterion-1 tests run with the repo paused because `committed = true` fires `mergeWake`; without the guard (not yet landed when they ran) the wake would have rebuilt a batch. Under the shipped guard the unpause path is equivalent: `mergeTurn` prints the held line and returns. The wave-2 tests prove the held-repo wake end to end.
- The race between `mergeTurn`'s site-1 read and `clearHeld` can drop a newer hold; in practice no hold writer can run there (a hold write requires an existing batch record, which a held repo cannot have). Site 2 re-reads under the lock and drops only on real staleness.
- No live-model run, per standing design; the herdr notification shape is proven by the fake's recorded call and the charted proof in `readiness.yaml`.

## Unverified criteria

None.
