# Plan: blocked-seat-notice

Slot A synthesis, 2026-11-16. Source: brief.md (four done-criteria), design.md (locked decisions,
blocked-prompts Q2 corrected by final-check B/C). Design wins over brief on one point: `busy_since`
is not set for a blocked seat (design: "the blocked branch takes its own branch before the busy clock;
it sets no busy clock"), so the existing `dialog` test's `busy_since.A` expectation flips to undefined.

## Read-first

- `src/AREA.md` — command surface and non-obvious dispatch patterns.
- `src/next.ts` `observeBusy` (~line 152), `dispatchSlot` finished/missing branch (~line 500), the
  `dispatchLeaf` seat loop (~line 560).
- `src/state.ts` `stateSchema` (~line 100): `busy_since`/`busy_notified` shape to mirror.
- `src/phase.ts` `clearBusyNotices` (line 54), `commitMove` (line 167): the stale-notice block and the
  `cleared` computation the blocked clearing sits beside.
- `src/notice.ts` `noticeId`/`writeNotice`/`noticeState`/`removeNotice`; `src/hc.ts` `screen`
  (`hc read`, plain screen text), `Seen.status` (`{state, kind|null, msg|null}`).
- `tests/next.test.ts`: `holdTurns(f, 'blocked:kind=permission:msg=Allow?')` stand-in status hook
  (line 87), `nextAt` time injection (line 366), busy notice test (line 369), `hcCalls`, `freeTurns`,
  `seatIdle`; `tests/phase.test.ts` busy-clear move test (line 1077); `tests/hc-fixture.ts`
  `noticeFiles`/`blockNotices`.
- `learnings/LESSONS.md`: no lesson changes this plan (no paid launch, no .env, no tmpdir evidence).
- Design stated limit (binding): a seat unblocked by hand and blocked again inside the same turn gets
  no second notice; a blocked-to-working change wakes no pass. Chart doors are not leaf seats.

## Decisions

- D1 — `blocked_notified` state field. `src/state.ts` gains
  `blocked_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({})`
  beside `busy_notified`, same shape and `pending`/`shown` values.
- D2 — Blocked notice identity and body. `noticeId(repo.name, 'blocked', slug, seat)`;
  `attention: true`; title `Blocked leaf: ${repo}/${slug} seat ${seat} (${kind})` where kind is
  `t.status.kind ?? 'unknown'` (a `state=blocked` status without `kind` still names a stable title);
  body is `(await screen(t.session, t.address)).split('\n').slice(-40).join('\n')`.
- D3 — `observeBusy` gains a blocked branch before the busy clock. When `t.status?.state === 'blocked'`:
  if `blocked_notified[seat]` is undefined, write the notice and save `pending`; if `pending` and
  `noticeState` reports the file gone, save `shown`; return without touching the busy notice path.
- D4 — `observeBusy` clears `blocked_notified[seat]` (removing its pending file) on every non-blocked
  status: in the not-working early exit beside the busy clearing, and first in the working branch —
  the design's "cleared with its pending notice removed when the seat leaves blocked", so a working
  seat's stale blocked file never outlives the first pass that sees it. Per design the blocked branch
  sets no busy clock, so `busy_since` is left unset/untouched while blocked (the `dialog` test's
  `busy_since.A` expectation flips to undefined); the busy clock starts on the first pass that sees
  `working`.
- D5 — `dispatchSlot`'s finished-or-missing branch clears `blocked_notified[slot]` and removes its
  pending file before `startSeat` (`startSeat` never passes through `observeBusy`).
- D6 — `commitMove` clears `blocked_notified` and removes pending blocked files on every move, as its
  own step beside `clearBusyNotices` (busy clearing keeps today's merged/failed-only timing). One
  exported helper `clearBlockedNotices(repo, path, state)` in `src/phase.ts`, same shape as
  `clearBusyNotices`; `dispatchSlot` also uses it (it handles a single-slot subset since only that
  slot's field is set there — no: it takes an optional seat). Form:
  `clearBlockedNotices(repo, path, state, seat?: Slot)` clears the given seat or all seats.
- D7 — `docs/reference/state-and-phases.md` gains a `blocked_notified` row beside `busy_notified`.
- D8 — `dispatchLeaf`'s existing seat loop runs `observeBusy` before the merged/failed branches, so
  blocked seats on `merge`-phase leaves also notice; no new call sites needed. The listener already
  wakes `next --wake` on blocked events (`src/listen.ts`); no listener change.

## Interfaces

- `Seen.status`: `{ state: string; kind: string | null; msg: string | null } | null` (`src/hc.ts`).
- `screen(session, address): Promise<string>` = `hc read` stdout (screen text, no scrollback unless
  `--lines`); the body slices its last 40 lines.
- `noticeId(repo.name, 'blocked', slug, seat)` → `akrogon.blocked.<slug>.<seat>.json` under the repo
  session's `akrogon-notices` folder; present = `pending`, removed-by-handler = `shown`.
- `clearBlockedNotices(repo, path, state, seat?: Slot): Promise<State>` — removes `pending` files,
  saves `{ ...state, blocked_notified: <cleared> }`; no-op when nothing is set.

## Units and waves

Every wave holds independent units only (disjoint paths, no shared live resource, no in-wave
dependency). U2 and U3 depend on U1 only because `clearBlockedNotices` compiles against the new
`State.blocked_notified` type; they share no files.

- Wave 1
  - U1 `src/state.ts`: add `blocked_notified` field (D1).
- Wave 2
  - U2 `src/next.ts`: `observeBusy` blocked branch + non-blocked clearing (D2, D3, D4),
    `dispatchSlot` replacement clearing (D5). Prerequisite: U1.
  - U3 `src/phase.ts`: `clearBlockedNotices` helper + `commitMove` call (D6);
    `docs/reference/state-and-phases.md` row (D7). Prerequisite: U1.

## Done-criteria proofs

Tests are committed on this branch before any product code. Commands run through
`akrogon run-check --name <label> -- <cmd>` from the worktree; boundary is the real `akrogon next` /
`akrogon phase` CLI against a live fixture hc core (`hcFixture`), the same boundary the busy tests use.

### C1 — blocked seat gets one attention notice per episode, seat tail as body, no input

- Test: `a blocked leaf seat writes one attention notice per episode, sends it nothing` in
  `tests/next.test.ts` (`holdTurns` reports `state=blocked:kind=permission` as the door-exchange
  fixtures do).
- Observation: after `next` shows the seat blocked, one `<repo>.blocked.dialog.A.json` exists with
  title `Blocked leaf: <repo>/blocked-one seat A (permission)`, `attention: true`, and body equal to
  the last 40 lines of `hc read <address>` at that moment; `blocked_notified.A === 'pending'`; two
  more passes add no second file; `f.core.tasks(addr)` stays length 1 and no `send`/`keys` shim call
  names the address; removing the file then a pass folds `blocked_notified.A` to `shown`.
- Product failure it catches: a blocked seat waits silently for the 60-minute notice, or `send`/`keys`
  types into its prompt.
- Command: `bun test tests/next.test.ts -t 'attention notice per episode'`. Size: ~20 s.
- Rerun trigger: any change to `observeBusy`, notice writing, or the blocked status path.
- Intended red: seat reports blocked, but no blocked branch exists — `blocked_notified` stays `{}` and
  no notice is written; recorded below.
- Conditions checked (each traced from write to use; violation case or traced reason beside it):
  - "one notice per episode" — decision D3's `undefined → write → pending` gate; later passes hit the
    `pending` branch. Case: passes 2 and 3 in the same episode assert one file. Shown red by the same
    run (file count assertion).
  - "no key or text input reaches the seat" — `dispatchSlot` returns before `deliver()` on a
    non-idle/non-done status; the blocked status never reaches `send`. Case: `tasks(addr)` stays 1
    and no send/keys call names the address. Traced: `startSeat` does not run (seat is live), so no
    other input path exists.
  - "body is the screen tail" — the write reads `screen()` at notice time; the seat is held blocked
    and prints nothing else, so the test's live `hc read` equals what the pass saw. Case: byte-equal
    `slice(-40)` assertion.

### C2 — a pass seeing the seat not blocked removes the pending notice and clears the field

- Test: `an unblocked seat's notice is removed and its next blocked episode notices again` in
  `tests/next.test.ts` (same test as C1's continuation or its own; plan: its own test using
  `holdTurns`/`release`/`seatIdle`/`freeTurns`).
- Observation: after release + `seatIdle`, one `next` leaves `blocked_notified === {}` and removes the
  pending file; re-blocking the seat (`holdTurns` + `hc send` task) and a pass writes a fresh
  `Blocked leaf` file.
- Product failure it catches: `blocked_notified` latches forever, so every later blocked episode is
  silent; or a pending file outlives its episode and blocks a new notice id reuse.
- Command: `bun test tests/next.test.ts -t 'unblocked seat'`. Size: ~20 s.
- Rerun trigger: any change to `observeBusy`'s non-blocked clearing.
- Conditions checked:
  - "cleared when a pass sees the live seat not blocked" — cleared in both the working branch and the
    early-exit branch (D4). Case: idle seat clears field and file.
  - "a later blocked episode gets a new notice" — case: re-blocked seat writes a fresh file.
  - Traced gap the design states (no violation): a hand-unblocked-then-reblocked seat inside one turn
    wakes no pass; the field clears only at the next pass. Recorded, not tested.

### C3 — replacement seat and phase moves clear the field

- Test (replacement): `a replaced blocked seat gets a fresh notice` in `tests/next.test.ts`: blocked
  seat noticed, `hc kill` + `hc rm`, `next` replaces it; `blocked_notified` cleared, pending file
  removed, replacement's first blocked turn writes a new file.
- Test (phase move): `phase moves clear the blocked notice field and file` in `tests/phase.test.ts`:
  seed `blocked_notified: { A: 'pending' }` plus a pending `akrogon.blocked.<slug>.A.json`, run
  `akrogon phase <slug> implement --slot A`, expect `blocked_notified: {}` and the file gone.
- Observation (replacement): state `{blocked_notified: {}}` after the replacing pass, notice folder
  holds only the new episode's file. (phase move): final state `blocked_notified: {}`, file gone.
- Product failure it catches: the stale field suppresses the notice a replaced seat needs, or a
  pending file survives the move and is re-adopted by the next episode.
- Commands: `bun test tests/next.test.ts -t 'replaced blocked seat'` and
  `bun test tests/phase.test.ts -t 'blocked notice'`. Size: ~25 s and ~5 s.
- Rerun trigger: any change to `dispatchSlot`'s finished/missing branch or `commitMove`.
- Deliberate break (brief requires): with the clearing lines omitted the replacement test goes red —
  `blocked_notified` stays `'pending'`, no fresh file is written. The plan-pass red below is the same
  absence (no product code exists yet); implement re-verifies fail-before/pass-after.
- Open-for-the-plan answer (design): `count-silent-turns`' `seat_lost` row and this leaf's clearing
  land in the same `dispatchSlot` branch; the second to merge rebases and places both statements in
  the branch, whichever order its diff applies. This leaf's clearing goes first inside the branch,
  before `prepare()`/`startSeat`.

### C4 — a blocked seat gets no 60-minute busy notice; a working seat keeps it

- Test: `a seat blocked over an hour gets no busy notice while a working seat does` in
  `tests/next.test.ts` with `nextAt` time injection: leaf `busy`, seat A held blocked, seat B freed
  through the hold (working); passes at +0, +59, +61 min.
- Observation: at +61 the folder holds exactly `Blocked leaf` (A, attention) + `Busy leaf` (B) —
  no `Busy leaf` for A; `busy_since` holds only `{ B: at(0) }`. The existing busy test
  (`busy seats persist, warn strictly after an hour…`) already proves the working half and stays green.
- Product failure it catches: the blocked branch sharing the busy clock — a seat blocked >60 min gets
  the quiet non-attention busy notice the brief replaces; or `busy_since` set on a blocked sighting.
- Command: `bun test tests/next.test.ts -t 'blocked over an hour'`. Size: ~20 s.
- Rerun trigger: any change to `observeBusy`'s branch order or the STALL_MS gate.
- Condition checked: "60-minute busy notice is not sent while the seat is blocked" — D3 returns before
  the busy write, and D4 never starts the clock while blocked, so a seat observed only blocked can
  never reach the busy branch. Case: the +61 minute pass still shows no `Busy leaf` for A.

### Existing test update

- `next waits on a blocked agent instead of counting attempts or flipping seats` (`tests/next.test.ts`
  line 313): `busy_since.A` flips `toBeDefined() → toBeUndefined()` per D4 (blocked sets no busy
  clock). Trailer source: design.md "it sets no busy clock".

## Affected docs

- `docs/reference/state-and-phases.md` — one row for `blocked_notified`. No agent/skill doc is
  affected: consumers read notices by id and title only.

## Credentials, grants, blockers

- readiness.yaml lists no `inputs`, `produces` or `grants`; the design names no env variables.
  `akrogon status` shows no `Missing:` lines. Nothing operator-only blocks this pass.
- No paid model launches this pass: only free `bun test` runs against fixture cores.

## Red evidence (run through `akrogon run-check`)

All five planned tests red on the unimplemented head (8532a1f7), each red for the missing behavior
the criterion names. Kept logs under `implementation/` in this folder.

- C1 `check c1-notice: 1 implementation/check-c1-notice-1794844770979-754741.log` — expected one
  `Blocked leaf: …/blocked-one seat A (permission)` notice, got `[]`: no blocked branch writes a
  notice today.
- C2 `capture c2-unblocked: implementation/capture-c2-unblocked-8acc4399-1108-4935-b4d9-0e8acbf4e121-out.log`
  (exit 1) — `readState(path).blocked_notified.A` TypeError: the state field does not exist, so no
  clear-or-renotify path can run.
- C3 replacement `capture c3-replaced: implementation/capture-c3-replaced-8e8ca23b-b5d1-458b-b807-991f8b881ae8-out.log`
  (exit 1) — same missing field. Under the deliberate break the brief names (no clear on
  replacement, i.e. today's code) `blocked_notified.A` never reaches `'pending'`, and on the
  implemented head the same test goes red when the replacement-branch clearing is dropped: the stale
  `'pending'` suppresses the fresh notice.
- C3 phase move `capture c3-move: implementation/capture-c3-move-613326aa-db61-43ab-ba8d-eae026007c75-out.log`
  (exit 1) — `akrogon phase move implement --slot A` exits 1: `readState` rejects the seeded
  `blocked_notified` key (strict schema), so clearing never happens.
- C4 `check c4-blocked-hour: 1 implementation/check-c4-blocked-hour-1794844790396-800816.log` —
  expected both `Blocked leaf` titles, got `[]`.
- Existing-test update `check c1-dialog-wait: 1 implementation/check-c1-dialog-wait-1794844802015-843633.log` —
  `busy_since.A` received `"2026-11-16T16:00:01.557Z"`: today's code sets the busy clock on a blocked
  status; the flipped expectation (blocked sets no busy clock) fails until D4 lands.

## Count lines

None — no covered launches this pass (free local test commands only).
