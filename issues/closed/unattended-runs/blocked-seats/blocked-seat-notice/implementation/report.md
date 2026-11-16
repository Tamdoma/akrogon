# Report: blocked-seat-notice (implement, slot A)

## Commits

Base before implement refresh: `8532a1f7`; refreshed onto `f7748167` (rebase clean, prior head
`0b02dfb1` → `ae47694b`), then onto `7cee541d` after it landed mid-pass. Committed head:
`1ba11ba5`.

- `e084e914` state: add `blocked_notified` per-seat field to stateSchema (worker U1, commit
  `52d4854f` in worktree u1, picked clean).
- `521c8c65` test: relax move test stdout to `toContain` — phaseWake prints the new seat's address
  (`t1`) after `moved implement`; real CLI output cited in the trailer.
- `b25a080b` next: blocked branch + clearings (worker U2, `0af03073` in u2, picked clean).
- `f27bc49a` phase: `clearBlockedNotices` + `commitMove` clearing on every move; doc row (worker U3,
  `a787092c` in u3, picked clean).
- `9cb4aa58` style: prettier-wrap the blocked branch in `observeBusy` (verify format finding).
- `1ba11ba5` test: flip three stale busy-clock expectations for blocked seats.

## Changed files and reasons

- `src/state.ts` — `blocked_notified: {A?,B?}` default `{}` (D1).
- `src/next.ts` — `observeBusy`: non-blocked statuses call `clearBlockedNotices(repo, path, state,
  seat)` first; `blocked` status writes one `attention` notice `Blocked leaf: <repo>/<slug> seat
  <S> (<kind>)` with the last-40-screen-lines body when the field is undefined, folds `pending`→`shown`
  when the file is gone, and returns before any `busy_since`/`busy_notified` write (D2–D4).
  `dispatchSlot` clears `blocked_notified[slot]` before `startSeat` in the finished/missing branch
  (D5).
- `src/phase.ts` — `clearBlockedNotices(repo, path, state, seat?)` beside `clearBusyNotices`;
  `commitMove` runs it (whole field) on every move so it feeds `after` (D6).
- `docs/reference/state-and-phases.md` — `blocked_notified` row (D7).
- `tests/next.test.ts`, `tests/phase.test.ts`, `tests/session-routing.test.ts` — planned criterion
  tests plus expectation corrections named above.

## Worker returns (delegated run, config `subagents`)

- U1 `brief-1.md` → sa-1 "Aragorn": commit `52d4854f`, `bun run typecheck` exit 0. Picked clean.
- U2 `brief-2.md` → sa-2 "Legolas": commit `0af03073`; typecheck red only on the not-yet-landed
  `clearBlockedNotices` export (expected, resolved when U3 landed). Picked clean.
- U3 `brief-3.md` → sa-3 "Frodo": commit `a787092c`; typecheck pass; returned one mismatch — the
  planned phase-move test asserted full-stdout equality but `phaseWake` prints the started seat's
  address. Resolved by A's expectation correction (`521c8c65`), trailer cites the real output.

No paid launches: workers ran only free `bun`/`git` commands. Count lines: none required (no grant
entries, no covered operations).

## Proof results (each command, commit, result)

All through `akrogon run-check`; logs kept under `implementation/` in this folder.

- C1 `bun test tests/next.test.ts -t 'attention notice per episode'` — red at `8532a1f7` era head
  (`check c1-notice`), green after `9cb4aa58` inside `check proofs-blocked: 0` (5 tests incl. C2, C3
  replacement, C4, dialog update) — log
  `implementation/check-proofs-blocked-1794845247946-1272446.log`.
- C2 `bun test tests/next.test.ts -t 'unblocked seat'` — red at planning (`capture c2-unblocked`),
  green in `check proofs-blocked: 0`.
- C3a `bun test tests/next.test.ts -t 'replaced blocked seat'` — red at planning
  (`capture c3-replaced`), green in `check proofs-blocked: 0`.
- C3b `bun test tests/phase.test.ts -t 'blocked notice field'` — red at planning
  (`capture c3-move`), green: `check c3-move-green: 0
  implementation/check-c3-move-green-1794845250709-1290589.log`.
- C4 `bun test tests/next.test.ts -t 'blocked over an hour'` — red at planning
  (`check c4-blocked-hour`), green in `check proofs-blocked: 0`.
- Busy-clock regression: `check busy-regress: 0
  implementation/check-busy-regress-1794845254538-1292538.log`.
- `akrogon verify` on `f27bc49a`: red — `format` exit 1 (prettier on `src/next.ts`); fixed by
  `9cb4aa58`. Rerun on `9cb4aa58`: `test` red — three stale blocked-as-busy expectations
  (session-routing routed2; blocked merge seat B; blocked non-merge seat); corrected in `1ba11ba5`
  under the expectation-correction exception, each with a `Test-Change` trailer citing design/brief.
- `akrogon verify` on `1ba11ba5`: green — `verify leaf
  1ba11ba5041eb13ba9c405fe121dbe6023c8910b: green` (1193 tests, 83 files, ~57 s;
  `check-test-1794845454283-1871335.log`).

Wall time: verify ~1 min each run; targeted `bun test` runs seconds; no minutes-or-unknown proofs.

## Deliberate break (brief, criterion 3 replacement case)

The replacement test's red state is the no-clear-on-replacement break itself: today's `dispatchSlot`
records nothing on replace, so `blocked_notified.A` never reaches `pending` for the replacement's
episode (recorded red `capture c3-replaced`). Green on `1ba11ba5`.

## Known limitations / unverified criteria

- Design's stated limit stands: a seat hand-unblocked and re-blocked inside one turn gets no second
  notice until the next pass (no wake on blocked→working).
- `kind` absent on a blocked status renders as `(unknown)` in the title (recorded in plan D2).
- No unverified criteria: all four done-criteria have green proofs on the committed head, and the
  whole `checks` set is green via `akrogon verify`.
- The `seat_lost` ordering note (plan C3 open item): `count-silent-turns` has not merged; its
  clearing goes first in `dispatchSlot`'s finished/missing branch as planned.

## check.fix (2026-11-16, fix_rounds 1)

Prior reviewed base/head: `7cee541d` / `1ba11ba5`. Handed-off base/head: `7cee541d` /
`f7084a24` (branch already on origin/main tip; refresh no-op). Repairs from B's `Handed to A`
entries in review-B.md.

- F2 — commit `f7084a24`: `tests/phase.test.ts` asserts `readState(path).blocked_notified` equals
  `{}` exactly (the `toMatchObject({…:{}})` matcher accepted retained `pending`/`shown`). Rerun
  `bun test tests/phase.test.ts -t 'blocked notice'` through run-check:
  `check f2-move-proof: 0 implementation/check-f2-move-proof-1794845764885-2424657.log`.
- F1 — deliberate-break evidence corrected: with the `clearBlockedNotices` call temporarily removed
  from `dispatchSlot`'s replacement branch, `bun test tests/next.test.ts -t 'replaced blocked seat'`
  goes red at the post-replacement assertion: expected `blocked_notified` `{}`, received
  `{"A":"pending"}` (`check f1-break-red: 1
  implementation/check-f1-break-red-1794845770714-2425558.log`). Line restored byte-identical
  (uncommitted; `git status` clean), rerun green: `check f1-restore-green: 0
  implementation/check-f1-restore-green-1794845775317-2427199.log`. This replaces the earlier
  deliberate-break paragraph, which had cited the missing-field planning red.
