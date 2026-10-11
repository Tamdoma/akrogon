# Plan: seat-retry

Debate is off (`debate: "no"`); this plan is written directly from brief.md and design.md.

## Read first

1. `src/next.ts` `dispatchSlot` — `recordFailure` `>= 3` `commitMove` branch and `unreachable` (`commitMove(repo, leaf, current, 'failed', ...)`) at ~:597-637, session-file reconcile at ~:647-652, relaunch and prompt paths at ~:654-718.
2. `src/state.ts` — `deliveryErrorSchema` :22-29 (`session: string | null`, `offset?`), `attempts` counts.
3. `src/session-file.ts` — `deliveredAfter(file, offset, text)` reads raw bytes from `offset`.
4. `src/shell.ts` — `retryableCodes` :163-171, `herdrError` :172-180; `agent_session` schema :140-143 (`{ kind: 'id'|'path', value }` optional/nullable).
5. `tests/fake-herdr.ts` — `startScript`, `promptScript` (`append` writes to a path-kind session), `failPrompts`; `agent start` assigns a fresh `session-<serial>` every start.
6. `tests/next.test.ts` — dispatch fixtures `dispatchFixture`/`database`/`saveDatabase`/`calls`/`next` :32-61; the delivery-fault block :2907-3395 is where the rewrites and new cases land.
7. `docs/guide/next.md` :133, `docs/guide/limits.md` :36, `docs/guide/problems.md` :18 — the three stale sentences about delivery faults failing the leaf.
8. `learnings/LESSONS.md` — non-JSON herdr stderr already surfaces as `exit <code>` via `herdrError`; the 2026-09-10 lesson's SyntaxError case is already guarded, no change needed.

## Decisions

- **D1 — one record path.** `recordFailure` always `saveState`s the error and increments `attempts[slot]`; the `>= 3` `commitMove('failed')` branch is deleted. `unreachable` is deleted; both failure call sites (`agent start`, `agent prompt`) call `recordFailure` unconditionally. `retryable(...)` no longer routes in `dispatchSlot`; the error code stored in `delivery_error[slot].code` keeps the distinction (`timeout`/`agent_prompt_stalled`/`agent_not_ready` vs `exit <n>`/`boom`). `commitMove` stays imported (used elsewhere in the file).
- **D2 — offset is bound to its session.** The pending-offset reconcile runs only when `pendingOffset !== undefined`, `pane.agent_session` is non-null/undefined, and `pane.agent_session.value === state.delivery_error[slot]!.session`. `session` is `string | null`, so equality also covers a recorded `null` (an id-or-path `value` can never equal `null`, which forces a resend — the brief's "missing session" case). A mismatch or absent session skips `deliveredAfter` and falls through to `agent start` (`pane.agent === null`) or `agent prompt` as today. The successful resend clears the error via `recordDelivery`.
- **D3 — no other dispatch changes.** Relaunch on `pane.agent === null`, per-pane hash naming, the prompt-grace window, `observeBusy`, `recordDelivery`, and the timeout `deliveredAfter` settlement are unchanged. `src/status.ts`, `src/state.ts` schemas, `src/session-file.ts`, `src/shell.ts` need no edits.
- **D4 — doc edits.** `docs/guide/next.md` :133 — delivery faults record the error and attempt count and retry on the next pass; they never move the leaf to `failed`. `docs/guide/limits.md` :36 — replace "count toward failure" with the record-and-retry statement. `docs/guide/problems.md` :18 — drop the delivery sentence; a delivery fault can no longer produce a `failed` leaf (the rest of that paragraph still describes real failure causes).
- **D5 — test placement.** All dispatch cases land in the existing delivery block of `tests/next.test.ts` using `promptScript`/`startScript`; the status extension lands in the existing `delivery errors surface as prompt tokens` test in `tests/status.test.ts`. Outdated failed-move expectations in `tests/next.test.ts` are rewritten in place, not deleted: each rewrite names the same scenario with the new outcome.

## Units

Up to 3 per wave; shared files serialize units.

### Wave 1

- **U1 `src/next.ts` + `tests/next.test.ts`** — owns `src/next.ts` (`dispatchSlot` only: `recordFailure`, `unreachable`, pending-offset reconcile, prompt/start failure calls) and `tests/next.test.ts`. Implements D1/D2. Test rewrites in the same file: the `three consecutive prompt failures`, `stale prompt` fail tail, `resumes interrupted tab creation` fail tail, and the three `unreachable` tests. Depends on nothing; the red tests are already committed.
- **U2 `docs`** — owns `docs/guide/next.md`, `docs/guide/limits.md`, `docs/guide/problems.md` (D4). Disjoint paths from U1; shares wave 1.

`tests/status.test.ts` extension is test-side, already committed at planning; no implementation unit owns it further unless U1's changes break it.

## Doc checklist

- `docs/guide/next.md` — delivery faults record error/count and retry on the next pass; never fail the leaf.
- `docs/guide/limits.md` — same correction, one line.
- `docs/guide/problems.md` — remove the delivery-fault recovery sentence.
- `src/AREA.md` — no change (no new commands or files).
- Agent docs: none affected. `skills/watch-issues/SKILL.md` `failed=<cause>` lines stay correct for non-delivery causes (design, out of scope).

## Criterion → proof map

| # | Criterion | Test / check | Command | Catches | Size | Rerun trigger |
|---|-----------|--------------|---------|---------|------|----------------|
| 1 | Retryable `agent start`/`agent prompt` failure ≥3 passes stays in phase, error + count recorded, next pass retries | `tests/next.test.ts` rewritten `three consecutive prompt failures keep the leaf in phase and retry each pass` (+ stale-prompt and interrupted-tab rewrites); a new start-script case charging 3 passes without failing | `bun test tests/next.test.ts` | restored `>= 3` `commitMove`; missing retry; missing count | ~1-2 min | any `dispatchSlot`/`recordFailure` change |
| 2 | Non-retryable herdr error stays in phase, error recorded, next pass retries | rewritten `a non-retryable prompt code records the error without failing`, `non-JSON prompt stderr ...`, `malformed prompt error JSON ...` | `bun test tests/next.test.ts` | surviving `unreachable`/`commitMove` path | ~1 min | any error-path change in `dispatchSlot` |
| 3 | Successful delivery clears error and resets count | existing `a successful prompt clears delivery_error and resets attempts`, `a retryable agent start failure charges once without prompting, then recovers`, `a record appended after a timeout is recognized by the next pass without resending` (all still passing) | `bun test tests/next.test.ts` | dropped `delivery_error` clear or `attempts` reset in `recordDelivery` | ~1 min | `recordDelivery` change |
| 4 | `status` shows slot + code + count; guide says retry on next pass, never fail | extended `delivery errors surface as prompt tokens` (attempts `A:2` asserted beside `A prompt timeout`) + doc diff (D4) | `bun test tests/status.test.ts` + `git diff docs/` review | lost `A:<n>` or `<seat> prompt <code>` token; stale doc line | ~30 s | `src/status.ts` NOTE change; doc edit |
| 5 | Recorded offset used only while pane session equals recorded session; mismatch resends, neither clears via old text nor skips prompt | new `a session replacement after a timeout resends the prompt instead of settling from the old offset` (matching text in the new file neither clears the error nor suppresses the resend; second scripted failure keeps the error recorded) | `bun test tests/next.test.ts` | missing session comparison; reconcile on mismatched session; lost resend | ~30 s | reconcile block change |

Deliberate break (per standing design): each rewritten/new test is the case whose old outcome the break restores; temporarily re-adding the `>= 3`/`unreachable` `commitMove` and removing the session comparison turns every rewritten and new test red — the implementer does not need a separate break commit since the removed code is the break.

## Verification

- `bun test tests/next.test.ts tests/status.test.ts` — rewritten + new + existing cases green.
- `bun run typecheck` — `unreachable` removal leaves no unused symbols; `retryable` still used (`mergeNotice`).
- `bun run format` — prettier clean.
- Full configured `checks` (`test`, `typecheck`, `format`) at implement end, per repo config.
- `grep -n "commitMove\|unreachable\|retryable" src/next.ts` inside `dispatchSlot` region — no failed-move call remains in the delivery paths.

## Notes for review

- Brief says "three or more passes"; the old threshold disappears entirely (D1) — a leaf in delivery fault can accumulate unbounded `attempts` until a delivery clears it or the operator acts. This is the locked choice (fork S5, "the leaf keeps its phase").
- `status` hides `delivery_error` while the seat is `busy` (existing behavior, `src/status.ts` :120-124); criterion 4's display requirement applies to non-busy seats only.
- No credentials or grants needed: `akrogon status seat-retry` shows no `Missing:` env lines; implementation is offline with fake herdr.
