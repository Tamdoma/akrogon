# Plan: merge-seat-cap

Synthesis from `brief.md` and `design.md` (forks/waiting-seats.md Taken 1 and 3, signpost 6a). No `Open for the plan:` items in the design.

## Decisions

- D1: `activeCount` (`src/next.ts`) excludes phase `merge` in its `unfinished` predicate. The predicate is shared by both the live-session branch (`leaf && live.has(slug)`) and the refused-session branch (`unfinished` filter plus `seated`), and by `seated` itself, so one edit covers every counting arm. Phases `check.repair`, `implement` and every other unfinished phase keep counting; `unknown` and `unreadable` terms unchanged. Design Taken 1.
- D2: `waitReasonSchema` (`src/timing.ts`) gains the literal `capacity`, inserted before `none`. It is the only wait-reason schema: `park.ts`'s direct `appendTiming` writers stay in the enum and are untouched.
- D3: `waitOrder` (`src/timing-report.ts`) appends `capacity` after `merge_turn`, so `capacity` renders as its own `wait capacity <dur>` kind in slug and cohort reports. No other reader of `WaitKind` exists (`reasonAt` and `waitTotals` are reason-agnostic maps).
- D4: `dispatchLeaf`'s `allocate === null` branch ends with `end('capacity')` instead of `end('none')` (`src/next.ts`). `recordWait`'s open-wait dedup keeps exactly one `capacity` row across repeated refusals and closes it on the first subsequent `none` end — unchanged machinery, no new writer. `broadcastPass` gets no `recordWait` call (design Taken 3); a stray row there would need a new call site visible in the diff.
- D5: The `seatCommand` capacity error and the `max_active` prose in `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md` say the limit counts leaves outside merge (seated merge waiters do not count). `docs/reference/files.md` adds `capacity` to the `wait <reason>` list.
- D6 (note for review): design Taken 1 also names `skills/init-akrogon/` for `max_active` prose, but `grep -rni 'active|leaves run|at once' skills/init-akrogon/` finds no such text there; there is nothing to update in that surface.

## Read first

- `src/next.ts` — `activeCount` (~line 369), `seated`, `allocate` (~line 400), `dispatchLeaf`'s `end` helper and `allocated === null` (~line 645 and ~line 761), `broadcastPass` (~line 1054), `seatCommand` error (~line 1171).
- `src/timing.ts` — `waitReasonSchema` (line 22), `recordWait` dedup (line 116).
- `src/timing-report.ts` — `WaitKind`, `waitOrder` (line 26), `waitTotals`, `visitLines`, `memberLine`.
- `tests/next.test.ts` — `hcFixture`, `holdTurns`, `liveTabs`, `otherRepo`, `configure`, `holding` (helpers.ts line 304), existing capacity tests (~line 716, ~line 739, ~line 1622) covering `unreadable`/`unknown` arms.
- `tests/timing.test.ts`, `tests/timing-report.test.ts` — ledger writers and `akrogon timing` report cases.
- `docs/reference/config.md` line 27, `docs/reference/limits.md` line 11, `docs/use/run-work.md` line 52, `docs/reference/files.md` line 79.
- `learnings/LESSONS.md` — run-check `TMPDIR` notes (evidence paths under the run root are removed); no paid or live launch in this leaf.

## Interfaces

- New wait reason literal: `capacity` (joins `'prerequisite' | 'parked' | 'merge_turn' | 'none'`).
- `recordWait(repo, slug, 'capacity')` is reached only through `dispatchLeaf`'s `end()`; no new call signature.
- Ledger compatibility: `capacity` rows fail to parse under an older akrogon (recorded consequence, design "Consumers of changed state"); pre-change rows stay valid under this change.
- No `Missing:` env names (`readiness.yaml` inputs/produces empty; `akrogon status` shows none). No grants, no paid launches: count lines — none written.

## File/criterion checklist and waves

| Wave | Unit | Owned paths | Shared resource | Lands after |
| ---- | ---- | ----------- | --------------- | ----------- |
| 1 | U1 predicate and wait reason | `src/next.ts` (`unfinished` predicate, `end('capacity')`, seatCommand error text), `src/timing.ts` (`waitReasonSchema`), `src/timing-report.ts` (`waitOrder`) | none | — |
| 1 | U2 doc text | `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, `docs/reference/files.md` | none | — |

U1 and U2 own disjoint paths and share no test resource, so they share wave 1 (2 units, under the 3-unit cap). Criterion 3's text is read by the reviewing seat.

Planned tests, committed as d49b7bb8 before product code:

- tests/next.test.ts `a leaf waiting in merge does not count toward max_active while check.repair and implement do` — criterion 1, live-session branch: seats `waiter`, moves it to `merge`, dispatches `fresh` past `max_active: 1`; then flips `waiter` to `check.repair` and `implement` and asserts a new leaf is refused both times.
- tests/next.test.ts `a leaf waiting in merge does not count toward max_active when its repo session is refused` — criterion 1, refused-session branch: `waiter` in repo `g` holds a recorded tab with `g`'s core stopped; `f`'s `fresh` dispatches, then `waiter` at `check.repair` refuses `queued`.
- tests/timing.test.ts `capacity waits: a refused dispatch records one capacity wait that closes on dispatch` — criterion 2: two refused dispatches write exactly `['capacity']`; after raising `max_active` and dispatching, the open wait closes without a `none` row (prompt already closes the wait record).
- tests/timing-report.test.ts `slug report: a capacity wait lists under its own kind beside the existing reasons` — criterion 2: a ledger holding old reasons plus one `capacity` row parses and reports `  wait capacity 15m` next to `  wait parked 5m`.

Criterion 3 (doc and error text): no code proof; the reviewing seat reads `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, the `No free seat capacity` error in `src/next.ts`, and the `wait <reason>` line in `docs/reference/files.md`.

## Verification

| Criterion | Proof command | Boundary | Before/after | Failure caught | Size | Rerun trigger |
| --------- | ------------- | -------- | ------------ | -------------- | ---- | ------------- |
| 1 | `akrogon run-check --name cap-count -- bun test tests/next.test.ts --timeout=30000 -t "waiting in merge does not count"` | real hc core, real `next` CLI | before: merge waiter counts, `fresh` refused; after: `fresh` seated until `waiter` leaves merge | merge leaves still reserving seats, or check.repair/implement wrongly freed | minutes | `src/next.ts` `activeCount`, `seated`, `allocate` |
| 2 | `akrogon run-check --name cap-wait -- bun test tests/timing.test.ts --timeout=30000 -t "capacity waits"` | real `next` CLI + `issues/timings.jsonl` | before: refusal writes no row; after: exactly one `capacity` row, closed on dispatch | missing row, `none` written, duplicate rows | seconds | `dispatchLeaf` end site, `recordWait` |
| 2 | `akrogon run-check --name cap-report -- bun test tests/timing-report.test.ts --timeout=30000 -t "a capacity wait lists under its own kind"` | `akrogon timing` CLI on a fixture ledger | before: `capacity` row fails parse, report empty; after: `wait capacity 15m` beside old kinds | capacity unlisted or old rows unparsed | seconds | `waitReasonSchema`, `waitOrder`, report readers |
| 3 | reviewing seat reads the named text | docs + error string | before: text says running leaves; after: says leaves outside merge | prose still claims merge waiters count | seconds | doc or error-text edits |

Red evidence at planning (kept logs, `akrogon log <path>`):

- Baseline (unmodified code): `check plan-capacity-count: 1` — `liveTabs` got `["waiter"]` not `["fresh","waiter"]`; refused-branch case similarly got `[]`. `check plan-capacity-wait: 1` — wait reasons `[]` not `["capacity"]`. `check plan-capacity-report: 1` — `lines[0]` `""` not `implement #0 30m` (schema rejects `capacity`, whole read falls to warn/empty).
- Condition case, decision D1 arms "check.repair/implement stay counted": temporary edit `unfinished = phase === 'plan.synthesis'` shown red — `check plan-break-exclude2: 1` — `queued` worktree allocated in both live and refused branches. Reverted.
- Condition case, decision D4 "one wait row per open capacity wait": temporary edit writing `capacity` through `appendTiming` bypassing `recordWait` dedup shown red — `check plan-break-dedup: 1` — reasons `["capacity","capacity"]`. Reverted.
- Condition case, decision D3 "capacity lists under its own kind": temporary edit adding `capacity` to `waitReasonSchema` without `waitOrder` shown red — `check plan-break-noorder: 1` — report holds `wait parked 5m` but no `wait capacity 15m`. Reverted.
- Condition "ledgers written before this change parse": temporary edit dropping `parked` from `waitReasonSchema` shown red — `check plan-break-oldrows: 1` — report empty on a parked row. Reverted.

Other checked conditions and traced reasons:

- `unknown`/`unreadable` terms unchanged (D1 can reach them only through `unfinished`): the predicate change cannot alter `inventory.unknown.length > 0 ? max_active` or `unreadable` additions; existing tests tests/next.test.ts `unreadable state reserves its capacity` (~line 716), `one unreadable leaf blocks all capacity` (~line 739) and `unknown directory population reserves all new capacity` (~line 1622) cover those arms unchanged.
- `broadcastPass` writes no wait row (D4, design Taken 3): `recordWait`/`appendTiming` callers audited — the only wait writers are `dispatchLeaf`'s `end()`, `mergeTurn`'s `merge_turn` (line 947) and `park.ts`'s park/unpark rows; the leaf adds no call site in `broadcastPass`, and the timing.test.ts exact `['capacity']` assertion would catch a `capacity` row anywhere it can be observed.
- Red-exit exemption: `allocate` returns early for a leaf with a live seat before the count (`if (!live && ...)`) — untouched by D1, so a merge leaf re-prompting its own seats is unaffected.
- No ordering needed versus leaf merge-red-exit: a merge-phase seat can keep working for the holder (at most one per repo), the accepted overshoot.

Doc checklist: `docs/reference/config.md` (`max_active` row), `docs/reference/limits.md` (limit bullet), `docs/use/run-work.md` (`max_active` paragraph), `docs/reference/files.md` (`wait <reason>` list). `skills/init-akrogon/` holds no `max_active` text (see D6); no other agent or human doc is affected — `docs/reference/commands.md` carries no `next`/`seat` capacity text, `docs/pictures/dispatch-order.svg` says only "up to max_active at once", and `docs/use/park-pause-stop.md` defers to the limit without describing the count.
