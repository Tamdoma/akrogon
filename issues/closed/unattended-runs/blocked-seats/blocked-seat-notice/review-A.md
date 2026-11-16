# Review A: blocked-seat-notice (check.review)

Base `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`, reviewed head `1ba11ba5041eb13ba9c405fe121dbe6023c8910b`.
Diff: src/state.ts, src/next.ts, src/phase.ts, docs/reference/state-and-phases.md, tests/{next,phase,session-routing}.test.ts.

## Verdict: nits

## Criteria trace

- C1 (one attention notice per episode, screen-tail body, no input): `observeBusy` blocked branch
  writes `Blocked leaf: <repo>/<slug> seat <S> (<kind>)` with `attention: true` and the last-40-lines
  body when `blocked_notified[seat]` is undefined, folds `pending`→`shown` when the file is gone,
  and `dispatchSlot` still returns before `deliver()` on a non-idle/non-done status. Proof: the four
  new tests in tests/next.test.ts plus `check proofs-blocked: 0` and `akrogon verify` green on
  `1ba11ba5` (1193 tests). The `hcCalls` no-send/no-keys assertion covers the input clause.
- C2 (clear on non-blocked): first statement of `observeBusy` clears `blocked_notified[seat]` and
  removes its pending file on any non-blocked status, including `working` — matches the design's
  corrected wording ("cleared … when the seat leaves blocked"). Proof: `unblocked seat` test.
- C3 (replacement + every move): `dispatchSlot` clears before `startSeat` in the
  finished-or-missing branch; `commitMove` runs `clearBlockedNotices(repo, leaf.path, recorded)`
  unconditionally beside `clearBusyNotices` — the design's "its own step, not a change to when busy
  notices clear". Proofs: `replaced blocked seat` and the phase-move test.
- C4 (no busy notice while blocked; working keeps it): the blocked branch returns before the busy
  clock, so `busy_since` stays unset during blocked; the busy test suite still passes
  (`busy-regress` green), and the three stale blocked-as-busy expectations were corrected with
  cited trailers.
- Plan checklist: all eight decisions land; the `seat_lost` ordering answer is recorded;
  `docs/reference/state-and-phases.md` row present and accurate against the code.

## AREA.md / docs check

`src/AREA.md`, `tests/AREA.md` name no `busy_*`/`blocked_*` fields or per-kind notices — no stale
pointer introduced; no path the changed doc row names is missing (fields verified in
`src/state.ts`). `docs/use/*`, `docs/reference/{commands,limits}.md` hold no busy-notice claim the
behavior change contradicts. One documented-behavior line added, accurate.

## Findings

### N1 (nit): a pending blocked notice plus a dead repo session blocks every phase move

`clearBlockedNotices` awaits `repoNotices(repo)` whenever a `pending` entry exists, and `commitMove`
now calls it on every move — so `akrogon phase <slug> <anything>` throws the space-resolution error
before `saveState` when the session holding the repo is gone. Reproduction: seed
`blocked_notified: {A: 'pending'}` + pending file, stop the session, run `phase` — move refuses with
`no running session holds it`. Deferred: `clearBusyNotices` already throws identically on merged/
failed moves (established contract, and the failed-leaf stale-removal block does the same), so this
is a consistent widening, not a new failure class; the operator's recovery (restart the session,
retry the move — state is untouched on throw) works. Promotes to a Fix if a real case shows an
operator blocked with no clear recovery, or if the sibling `clearBusyNotices` behavior is ruled a
defect elsewhere.

### N2 (nit): `watch-issues` `notified=` reads only `busy_notified`

`skills/watch-issues/scripts/observe.ts` lists seats with `busy_notified` set; a seat holding only a
pending blocked notice shows no `notified=` mark. Deferred: the design names consumers as reading
notices "by id and title only", so the field display is out of this leaf's scope; the watcher's
`A=<addr>/blocked` status field already surfaces the blocked seat. Promotes if watch-issues needs
notice-pending parity for blocked.

## Checks

No red checks with unknown cause met; no covered launches this pass; run-check recovery not needed.
