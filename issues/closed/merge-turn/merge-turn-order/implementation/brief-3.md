# Brief: merge-turn-order unit U3 — status TURN column

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u3

## 1. Goal

Implement plan decision D8: `akrogon status` names the merge-turn holder and each waiting leaf's place.

Depends on U1 (landed): `src/turn.ts` exports `mergeQueue`/`QueueEntry`/`eligibility`, `src/log.ts` exports `readLog`/`LogRecord`/`logSchema` (already imported by `status.ts` after U1's move).

## 2. Acceptance criteria

- AC1 The leaf table gains a `TURN` column after `NOTE` (last column). For a `merge`-phase leaf: `holder` on the queue's first entry, the 1-based place number on other entries, each suffixed ` no merge record` when `QueueEntry.noRecord` is true. Ineligible `merge` leaves and all non-`merge` leaves get an empty cell.
- AC2 Queue computation uses `mergeQueue(global, leaves, scan.log)` where `leaves` includes closed-area leaves for dependency resolution: `allLeaves` throws on duplicate slugs which `status` must not inherit, so scan the closed area with `leavesUnder(resolve(repo.root, 'issues/closed'), that path)` inside `scanRepo`'s existing try (a corrupt closed area marks the repo unreadable, same as open) and merge with open leaves.
- AC3 `cells`/`rows`/`widths`/`stacked`/`render` handle the extra column; `BLOCKED BY`+`NOTE` keep their wrap/split budget, adjusted for the new column width (fix the hardcoded budget arithmetic in `widths`).
- AC4 No change to the single-slug `akrogon status <slug>` path.
- AC5 `bun run typecheck` and the changed-tests command pass.

## 3. Read-first

- `src/status.ts` whole file (`scanRepo` ~62–113, `header`/`cells`/`rows` ~115–141, `widths`/`stacked`/`render` ~200–245), `src/turn.ts`, `src/state.ts` (`leavesUnder`), `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `Scan` ok-variant gains `queue: QueueEntry[]`.
- `scanRepo`: after building `leaves`, build `closed: Leaf[]` via `leavesUnder(closedRoot, closedRoot)` guarded by `existsSync`, then `const queue = mergeQueue(global, [...leaves, ...closed], readLog(repo.root))` — note `readLog` is already called in the return expression; hoist it into a local so `path` bookkeeping stays correct and it is read once.
- `header` becomes `['LEAF', 'PHASE', 'AGE', 'BLOCKED BY', 'NOTE', 'TURN']`.
- `cells(leaf, log, now, indent)` gains the queue (or a `Map<string, QueueEntry>` built once per scan — prefer the Map) and appends the TURN cell per AC1.
- `widths`: budget subtraction grows by the TURN column width plus its 2-space separator; keep `BLOCKED BY`/`NOTE` as the flex columns. `stacked`/`render`: TURN is a plain non-wrapping column, printed under `turn` label in stacked mode like others.

## 5. Do-not

- Do not add a column before NOTE: the width logic is tuned to the current column positions, and trailing keeps the diff small.
- Do not show the column in `status <slug>` single-leaf output (AC4).
- Do not mark ineligible leaves with text like `ineligible` — the row is simply empty; BLOCKED BY and `Missing:` lines already carry the reasons.
- Do not change rendering behavior for repos with no merge leaves (column will be all-empty; acceptable and honest) — exception is a revised brief.

Reasons restated: place and holder text are exactly what criterion 2 requires; anything more invents UI.

## 6. Ordered steps

1. `bun install`; `git log --oneline -1`.
2. Read `src/status.ts` and `src/turn.ts`.
3. Make the scan/columns changes.
4. `bun run typecheck`; run the changed-tests command; eyeball output by hand if cheap (`bun src/akrogon.ts status` won't see fixture leaves — skip manual run).
5. Commit as one commit, e.g. `status: TURN column naming merge holder and places`.

Advisory size: 1 file, under 15 turns.

## 7. Commands

- `bun run typecheck`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC5 hold and the commit exists. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
