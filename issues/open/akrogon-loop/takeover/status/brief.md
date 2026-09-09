# Brief: status

Chart skill version: 4

## What

Add `akrogon status`: read `state.yaml` under `issues/open` of every repo in the global `repos` list plus each `issues/log.jsonl`, print failed leaves and unreadable repos first, then the full tree repo → epic → issue → leaf, one row per leaf (phase, slots in `done` for this phase, attempts per slot, fix round, verdict word when present, the `tab` field, blocked-by, minutes since the leaf's last log line for this phase or "unavailable"), exit non-zero when any repo was unreadable and never print an all-clear over a partial scan. Add `akrogon status <slug>`: one leaf's state, its last log lines, the path `<leaf>/plan.md` where the diagnosis paragraph lives. Add to `akrogon next`: when the resolved leaf is `failed`, run `herdr notification show` and dispatch nothing. No `hand_built` marker, no stuck verdict, no prose read, no broadcast record. Takeover exercise: the loop must be seen through one `check.fix` round. If the first review returns `fix` on its own, nothing is added. If it returns `ready`, the operator writes one real finding into `review-A.md` and runs `akrogon phase status check.fix --slot A --verdict fix` by hand once; from there the loop finishes without the operator.

## Why

The operator wants one glance across repos and a nudge on failure without a watcher (# Status View). Small, read-only and self-contained, it is the leaf on which the takeover is proven (# Bootstrap, handoff 2-A).

## Done-criteria

1. `akrogon status` on a fixture tree with one failed leaf prints that leaf first and exits zero; with one unreadable repo it names the repo first and exits non-zero (test).
2. Each leaf row shows phase, done slots, attempts per slot, fix round, verdict, tab, blocked-by and minutes-in-phase from the last log line whose `slug` and `to` match the current phase, or "unavailable" when none exists (test on the fixture).
3. `akrogon status <slug>` prints the leaf's state, its last log lines and `<leaf>/plan.md` (test).
4. `akrogon next` on a `failed` leaf runs `herdr notification show` and dispatches nothing; on any other phase it runs no notification (test with herdr substituted).
5. Takeover proof, verified by the operator from `issues/log.jsonl` and `review-A.md` after `merged`, not by check-issue: the leaf reached `merged` with no operator action after `akrogon next status` other than the one hand-moved `check.fix` described in What, and that round ran a real repair and an A-only re-check.
