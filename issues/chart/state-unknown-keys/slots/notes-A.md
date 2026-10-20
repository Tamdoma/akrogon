# Notes A: unknown-keys

Code at akrogon HEAD abfee125, live trees read 2026-10-19.

## Pick
Keep strict parsing; build one shared inventory in `src/state.ts` that returns readable leaves plus one entry per unreadable leaf (path, error), and make every walker read it. Delete the 4-key skip list in `readState` after removing the only live legacy keys (two closed akrogon leaves carry `priority: n`) as a one-time step on main.
Reason: the bug is not strictness, it is that six separate walks each decide alone what a bad file does. `allLeaves` throws (so `findLeaf`, `run-check`, `config`, `verify`, `phase` fail repo-wide), `status` `scanRepo` fails the whole repo, `next` `discover` already isolates per leaf. One inventory removes the duplicated walks and gives one rule. Strict stays the writer check: a seat's stray key is reported on that leaf, not silently dropped.
Cost: every walker changes to the shared function; consumers that today get a throw must decide what an unreadable leaf means (owned for cleanup and capacity, never dispatched, never a merge holder). Bigger diff than strip.

## Rejected
- Strip unknown keys (plain `z.object`): fixes only the extended case, not an unreadable or invalid known value (`phase: typo` still fails every command). The next `saveState` silently deletes the seat's `notes`, and a misspelled optional key (`worktre:`) is dropped instead of reported. Removes the skip list but leaves the six walks.
- `passthrough` / keep unknown keys: same coverage gap as strip, and `State` stops being the full file contract.
- Prevent seats from writing `state.yaml` (hook or permission) alone: the operator or any tool can still write a bad file; the repo-wide stop stays.

## Evidence (tier: code, live tree, 2026-10-19)
- `src/state.ts` `readState`: skip list for `priority`, `slot`, `failed_notified`, `solo`; strict `stateSchema`; rethrows a ZodError naming the file. `allLeaves` throws on first bad leaf, duplicate slug or repo mismatch. `findLeaf` uses `allLeaves`.
- Separate walks: `src/next.ts` `discover` (per-leaf catch, `unreadable += 1`), `src/status.ts` `scanRepo` own `walk` (whole repo `ok: false`), `src/reconcile.ts` slug collection (`knownSlugs`), `src/park.ts`, `src/stop.ts`, `src/timing-report.ts` all call `leavesUnder` directly.
- Live legacy keys: 2 of 223 akrogon states (`issues/closed/akrogon-loop/bootstrap/{command,core-skills}`, `priority: n`); 0 in the other 10 registered repos (821 states).
- `tests/state.test.ts` pins strict rejection of legacy and unknown keys on purpose.

## Pitfalls
- An unreadable leaf must still count as owned so reconcile does not remove its worktree or tab, and still hold a capacity slot (as `discover` does today). Removed by the shared inventory carrying unreadable paths, not dropping them.
- A command addressing the bad leaf itself must still fail loudly naming the file. Removed by `findLeaf` throwing the stored error for that slug only.
- Duplicate slug and repo mismatch: whole-repo throws today in `allLeaves`; the inventory must decide if they also isolate. Keep repo mismatch per leaf like `discover` (`foreign`).
- Deleting the skip list before editing the two closed files makes those leaves unreadable. Removed by the one-time main edit first.

## Question the fork does not ask
- Should the seat be stopped from writing `state.yaml` at all (contributing condition in #102), or is a loud per-leaf failure enough?
