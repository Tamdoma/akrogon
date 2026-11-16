# Brief 3 (unit U3): `clearBlockedNotices` helper, `commitMove` clearing, doc row

Worktree: /home/ivan/.akrogon/worktrees/akrogon/blocked-seat-notice-u3

## 1. Goal

Implement plan decisions D6–D7: every phase move clears `blocked_notified` and removes pending
blocked notice files, through a helper beside `clearBusyNotices`; `docs/reference/state-and-phases.md`
documents the field.

## 2. Acceptance criteria

1. `src/phase.ts` gains an exported `clearBlockedNotices(repo, path, state, seat?: Slot): Promise<State>`
   beside `clearBusyNotices` (line 54), mirroring it: no-op when nothing is set for the addressed
   seat(s); removes `noticeId(repo.name, 'blocked', state.slug, seat)` files whose entry is
   `'pending'`; saves `{ ...state, blocked_notified: <cleared> }` — with `seat`, only that entry
   becomes `undefined`; without, the whole field becomes `{}`.
2. `commitMove` (line 167) runs `clearBlockedNotices(repo, leaf.path, recorded)` — no seat — on every
   move, as its own step beside where `clearBusyNotices` runs; the cleared state feeds `after` (i.e.
   compute `cleared` from the blocked-cleared recorded state). Busy clearing keeps today's
   merged/failed-only timing; nothing else in `commitMove` changes.
3. `docs/reference/state-and-phases.md` gains a `blocked_notified` row beside `busy_notified`:
   `pending` once the blocked-seat notice file is written, `shown` once it is gone; the seat leaving
   blocked, that seat's replacement or any phase move removes the file. Written by `akrogon next` and
   `akrogon phase`.
4. `src/state.ts`'s `State.blocked_notified` (`{A?,B?}` strings, default `{}`) is the field used —
   it lands on the lane alongside this unit.
5. `bun run typecheck` passes; the planned test `a phase move clears the blocked notice field and
   removes its pending file` in `tests/phase.test.ts` (~line 1279) is the contract — it is A's to run;
   if red on correct code, return a mismatch. You write and edit no test.

## 3. Read-first list

- `src/phase.ts` `clearBusyNotices` (line 54) and `commitMove` (line 167) — copy the helper's shape;
  note `stale`/`cleared`/`after` ordering.
- `src/notice.ts` — `noticeId`, `removeNotice`.
- `docs/reference/state-and-phases.md` (~line 84) — the `busy_notified` row to mirror.
- `tests/phase.test.ts` the new blocked-clearing test — read for the contract, do not edit.

## 4. Change list and needed interfaces

- `src/phase.ts`: new exported helper + one `clearBlockedNotices` call in `commitMove`.
- `docs/reference/state-and-phases.md`: one table row.
- `Slot` is already imported in `src/phase.ts` (`requiredSlots`, `Phase`, `Slot`).

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/state.ts` or tests — other units own them. Exception: none.
- Do not change when busy notices clear — `clearBusyNotices` keeps its exact call sites; the blocked
  clearing is separate and runs on every move. Exception: none.
- Return a mismatch with evidence rather than changing scope; a revised brief from A authorizes it.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Add `clearBlockedNotices` after `clearBusyNotices`.
3. Wire it into `commitMove` (criterion 2).
4. Add the doc row.
5. `bun run typecheck` — note: `State.blocked_notified` lands via the lane's other commit; if
   typecheck fails only on that, report it rather than stubbing.
6. Commit on this branch.

Advisory: 2 files, under 10 turns.

## 7. Commands

- `bun run typecheck` — report the result; the planned `bun test` runs belong to A.

## 8. Done-when, evidence and report

Commit the edits, then return the commit id and the four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
