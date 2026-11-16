# Brief 2 (unit U2): blocked branch and clearings in `src/next.ts`

Worktree: /home/ivan/.akrogon/worktrees/akrogon/blocked-seat-notice-u2

## 1. Goal

Implement plan decisions D2–D5 in `src/next.ts`: a leaf seat whose hc status is `blocked` gets one
attention notice per blocked episode; a non-blocked status clears `blocked_notified` and removes a
pending file; a finished-or-missing seat clears the field before `startSeat`; the busy clock is
never set while blocked.

## 2. Acceptance criteria

1. `observeBusy` (`src/next.ts`, ~line 152): when `t.status?.state === 'blocked'`, write
   `noticeId(repo.name, 'blocked', state.slug, seat)` with `attention: true`, title
   `Blocked leaf: ${state.repo}/${state.slug} seat ${seat} (${kind})` where `kind` is
   `t.status.kind ?? 'unknown'`, and body `(await screen(t.session, t.address)).split('\n').slice(-40).join('\n')`,
   but only when `blocked_notified[seat]` is undefined; when it is `'pending'` and
   `noticeState` reports the file gone, save `'shown'`; either way return before the busy clock
   (`busy_since` is never set on a blocked sighting, `busy_notified` never written).
2. A non-blocked status clears `blocked_notified[seat]` and removes a pending blocked file: inside
   the existing not-working early exit beside the busy clearing, and first in the working branch —
   `clearBlockedNotices(repo, leafPath, <current state>, seat)` once, before either status path
   continues. The field's own removal must not fire for a seat with nothing recorded.
3. `dispatchSlot`'s `seat === undefined || seat.state === 'finished'` branch calls
   `clearBlockedNotices(repo, leaf.path, readState(leaf.path), slot)` before `prepare()`/`startSeat`.
4. `src/state.ts`'s `State.blocked_notified` (`{A?,B?}` strings, default `{}`) is the field used;
   `clearBlockedNotices` is imported from `./phase` — it lands on the lane alongside this unit
   (signature: `clearBlockedNotices(repo, path, state, seat?: Slot): Promise<State>`; with `seat`,
   clears only that seat's entry and pending file; without, all seats).
5. The planned tests already on the branch pass under A's later run; if one is red on this code,
   return a mismatch — you write and edit no test.

## 3. Read-first list

- `src/next.ts` `observeBusy` (~line 152) — the busy write/pending/shown/clearing structure to mirror.
- `src/next.ts` `dispatchSlot` (~line 500) — the finished/missing replacement branch.
- `src/phase.ts` `clearBusyNotices` (line 54) — the helper the sibling unit mirrors for blocked.
- `src/notice.ts` — `noticeId`/`writeNotice`/`noticeState`/`removeNotice` semantics.
- `src/hc.ts` `screen` and `Seen.status` (`{state, kind|null, msg|null}`).
- `tests/next.test.ts` the blocked tests (~lines 435–560) — the contract your code satisfies.

## 4. Change list and needed interfaces

- `src/next.ts` only.
- New import: add `clearBlockedNotices` to the existing `from './phase'` import.
- `observeBusy` signature unchanged; it returns `{ state, notified }` as today — a written blocked
  notice returns `notified: true` like the busy write.
- Order inside `observeBusy` (D4): clear `blocked_notified[seat]` first when
  `t.status?.state !== 'blocked'` (one `clearBlockedNotices(repo, leafPath, <state>, seat)` call on
  the incoming state); then the existing early exit; then, for `blocked`, the write/shown branch
  returning before any `busy_since` write; then the working path as today.

## 5. Do-not, reasons and exceptions

- Do not edit tests or `src/phase.ts`/`src/state.ts`/docs — other units own them. Exception: none.
- Do not set `busy_since` for a blocked seat — the design says the blocked branch sets no busy clock,
  and a planned test asserts `busy_since` stays empty. Exception: none.
- Do not send keys or text to a blocked seat — `dispatchSlot` already returns before `deliver()` on a
  non-idle/non-done status; keep it that way. Exception: none.
- Return a mismatch with evidence rather than changing scope or an interface; a revised brief from A
  authorizes a change.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Make the `observeBusy` edits (criteria 1–2), then the `dispatchSlot` edit (criterion 3).
3. `bun run typecheck` — note: `State.blocked_notified` and `clearBlockedNotices` come from the lane's
   other commits; if typecheck fails only because this worktree lacks them, say so in the report
   rather than stubbing them.
4. Commit on this branch.

Advisory: 1 file, under 10 turns.

## 7. Commands

- `bun run typecheck` — report the result; the planned `bun test` runs belong to A.

## 8. Done-when, evidence and report

Commit the edits, then return the commit id and the four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
