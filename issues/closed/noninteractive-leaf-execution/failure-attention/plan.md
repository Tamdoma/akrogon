# Plan: failure-attention

A move to `failed` announces itself at the transition: `herdr notification show "<repo>/<slug> failed" --body "<cause>: <reason>" --sound request`, the returned reason persisted as `failure.delivery`, then `herdr tab rename <tab> "<slug> failed"` when the leaf has a tab. A move out of `failed` renames the tab back to `<slug>`. Each herdr call is tried once and retried once on a retryable herdr error; a final failure leaves the committed move and recorded delivery standing, still attempts the other call, and exits non-zero with the last herdr error. The redispatch "Failed leaf" notification and `failed_notified` leave the runtime.

Debate is off (`debate: "no"`); this plan synthesizes the brief and locked design directly.

## Decisions

- D1: The announce lives in `commitMove` (src/phase.ts), inside the existing `try` whose `finally` runs `logMove`. `saveState(after)` commits the move first; then for `to === 'failed'`: notification show, a second `saveState` persisting `failure.delivery`, then `tab rename` when `after.tab` is set. For `recorded.phase === 'failed'` (any move out): `tab rename` back to `after.slug` when `after.tab` is set. Placing the block in `try` means `logMove` still runs when a herdr call fails, and the herdr error propagates after it.
- D2: Notification title is `${repo.name}/${after.slug} failed`; body is `${failure.cause}: ${failure.reason}`; sound is `request`. `failure.delivery` is the response `reason` (`shown`, `disabled`, `rate_limited`, `no_foreground_client`, `busy`) or the literal `error` when the notification fails finally. The delivery save happens before the rename is attempted, so a rename failure cannot lose it.
- D3: Each herdr call is attempted once and retried once only when the thrown `CommandError.result` satisfies `retryable` (the existing code list). The retry logs `console.warn` with structured fields (`warning`, `slug`, `command`, `code`, `stderr`). A non-retryable or second failure is caught, the other call is still attempted, and the last error is rethrown after both calls and both saves — the command exits non-zero while `failed` and `delivery` stand. Non-`CommandError` throws (malformed herdr stdout) are not retried.
- D4: `retryable`, `retryableCodes` and `herdrErrorSchema` move from `src/next.ts` to `src/shell.ts` (the shared module the design names); `next.ts` imports `retryable` from there. `phase.ts` wraps `herdr()` in a local attempt/retry helper.
- D5: In `dispatchLeaf` (src/next.ts) the `state.phase === 'failed'` branch drops the `failed_notified` notification block entirely and just returns `'waiting'` — repeated `next` runs against a failed leaf issue no herdr calls.
- D6: `stateSchema` (src/state.ts) drops `failed_notified`; `readState` adds it to the stripped legacy keys alongside `priority` and `slot`, so legacy records still parse while `stateSchema.parse` rejects the key directly. `failureSchema.delivery` already exists (`z.string().optional()`); no schema change needed for it.
- D7: `tests/fake-herdr.ts` gains `tab rename <id> <label>` (updates the stored tab label, returns `{ tab }`) and `notification show` returns `{ shown: true, reason: 'shown' }` after validating `--body` and `--sound` via `flag()`. New failure flags: `failNotificationOnce` (fails once with `fixture_notification_failed`, then succeeds) and `failRename` (fails every call with retryable code `timeout`). Existing `failNotification` stays permanent and non-retryable.
- D8: `tests/helpers.ts` gains `fakeHerdr(f)` mirroring `fakeGh`: symlinks `fake-herdr.ts` as `herdr` in a fixture bin dir, seeds the db, returns `{ db, env }`. `next.test.ts` `dispatchFixture` and `status.test.ts` `fakeHerdr` adopt it; `phase.test.ts` failed-move tests pass `fakeHerdr(f).env` to `cli` so no test hits the real herdr.

## Interfaces

- `herdr(['notification', 'show', title, '--body', body, '--sound', 'request'], z.object({ shown: z.boolean(), reason: z.string() }))` → `{ shown, reason }`; the helper already unwraps `result` (src/shell.ts).
- `herdr(['tab', 'rename', tab, label], z.object({ tab: z.object({ label: z.string() }) }))` → measured envelope `result.tab.label`.
- `retryable(result: Result): boolean` — exported from `src/shell.ts`; consumes `CommandError.result`.
- `commitMove(repo, leaf, recorded, to, slot, failure?)` — signature unchanged; returns the state including `failure.delivery` when announced.
- Fake db flags: `failNotification: boolean` (permanent, non-retryable), `failNotificationOnce: boolean`, `failRename: boolean` (permanent, retryable `timeout`).

## Read first

- `src/phase.ts` — `commitMove` try/finally shape; the announce block lands inside it.
- `src/shell.ts` — `herdr()`, `command()`, `CommandError.result`; new home of `retryable`.
- `src/next.ts` — `dispatchLeaf` failed branch (lines ~485-490), `retryable`/`retryableCodes`/`herdrErrorSchema` definitions to move, `dispatchSlot` attempts-cap `commitMove` call (announces automatically).
- `src/state.ts` — `stateSchema.failed_notified`, `readState` legacy-key filter, `failureSchema.delivery`.
- `tests/fake-herdr.ts` — `result()`/`failure()`/`flag()` helpers and the `failNotification` pattern to extend.
- `tests/helpers.ts` — `fakeGh` as the `fakeHerdr` model; `cli` env parameter.
- `tests/phase.test.ts` — `stop from implement on dirty worktree` (leaf with `tab`), `stops land in failed`, `fix cap records attempts failure` (all move to `failed` and need the fake env); the race test's `failed_notified` fixture/assertions to drop.
- `tests/next.test.ts` — `dispatchFixture`, `calls()`, the `failed delivery retries` test to rewrite, three `failed_notified: true` `saveState` fixtures to clean.
- `tests/state.test.ts` — legacy-key strip loops and the canonical-state assertion.
- `tests/status.test.ts` — local `fakeHerdr` to replace with the shared helper.
- `learnings/LESSONS.md` — review-by-reading lesson: verify by running the CLI, not by reading.

## Ordered checklist

1. `src/shell.ts` — move `herdrErrorSchema`, `retryableCodes`, `retryable` in from `src/next.ts`; export `retryable` (D4). Criterion: `bun run typecheck` clean after step 4 updates the import.
2. `src/state.ts` — remove `failed_notified` from `stateSchema`; add it to the `readState` strip filter (D6). Criterion: a legacy state containing `failed_notified` round-trips through `readState`; `stateSchema.parse` rejects the key.
3. `src/phase.ts` — `commitMove` announce block and the attempt/retry helper (D1, D2, D3). Criterion: the phase.test.ts scenarios below pass.
4. `src/next.ts` — delete the `failed_notified` block in `dispatchLeaf` (D5); delete the moved retryable definitions and import `retryable` from `./shell` (D4).
5. `tests/fake-herdr.ts` — `tab rename`, notification `{ shown, reason }` with `--body`/`--sound` validation, `failNotificationOnce`, `failRename` (D7).
6. `tests/helpers.ts` — shared `fakeHerdr(f)` (D8).
7. `tests/next.test.ts` + `tests/status.test.ts` — adopt `fakeHerdr`; drop `failed_notified` fixtures/assertions; rewrite the `failed delivery retries` test (D5).
8. `tests/phase.test.ts` — drop `failed_notified` from the race test; pass the fake env to failed-move tests; add the scenarios below.

## Acceptance criteria (tests to add/update)

1. `phase <slug> failed --reason x` on a leaf with `tab` seeded in the fake db records exactly one `notification show` call carrying `--sound request` and `--body 'blocked: x'`, one `tab rename` to `<slug> failed`, and `failure.delivery === 'shown'` (done-criterion 1).
2. `phase <slug> implement` from `failed` records a `tab rename` back to `<slug>`; with `failRename` set the move still stands, two rename calls are recorded, and the command exits non-zero with the herdr error in stderr (done-criterion 2).
3. A failed move on a leaf without `tab` records the notification and zero `tab rename` calls (done-criterion 3).
4. `failNotification` with rename succeeding persists `delivery: 'error'` and the renamed tab; `failRename` with notification succeeding persists `delivery: 'shown'`; both leave the leaf `failed` and exit non-zero with the last herdr error (done-criterion 4).
5. `failNotificationOnce` records two `notification show` calls, persists `delivery: 'shown'` and exits zero — the bounded retry succeeds.
6. No runtime reference to `failed_notified` remains; a legacy `state.yaml` containing it parses via `readState`; the `dispatchLeaf` "Failed leaf" block is gone and repeated `next` runs against a failed leaf record zero `notification` calls (done-criterion 5 — rewrite of the existing `failed delivery retries` test).
7. Existing tests updated: the race test loses `failed_notified` fixture/assertions; the three `saveState` fixtures in `next.test.ts` lose `failed_notified: true`; `state.test.ts` adds `failed_notified` to the legacy-key cases and drops it from the canonical assertion.

## Verification

- `bun test` — full suite green, including rewritten failed-delivery and legacy-key tests.
- `bun run typecheck` — clean (`failed_notified` removal forces every stale reference to surface).
- `bun run format` — applied to touched files.
- Manual smoke (review-by-running, per learnings): in a `tests/helpers.ts` fixture with `fakeHerdr`, run `phase <slug> failed --reason blocked`, confirm `.calls` shows the notification and rename and `state.yaml` shows `delivery: shown`; run `phase <slug> implement` and confirm the rename-back call.

## Known limitations

- Herdr cannot reach the operator off-device: `no_foreground_client` and `busy` are recorded as the delivery outcome, not escalated (accepted in the locked design).
- When the herdr announce fails and the `logMove` append in `finally` also fails, the log error is the one raised — `finally` semantics; the committed move and `delivery` still stand.
- `docs/guide/in-practice.html` still says a failed leaf "shows a herdr notification"; the statement stays true (the notification now fires at the transition), no edit needed.

## Operator actions

None. The design names no credential variables; `~/.config/akrogon/env` needs no additions.
