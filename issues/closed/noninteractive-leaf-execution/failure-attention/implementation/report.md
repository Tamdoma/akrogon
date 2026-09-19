# Implementation report: failure-attention

Base: `f91cea968ac46f5a30119e4ce03eac611cc66abd` (AKROGON_BASE)
Head: `3c946f8ab91939d6ca542002575dad1ea8ba579b` — `failure-attention: announce failed transitions via herdr notification and tab rename`

## Changed files and reasons

- `src/shell.ts` — `herdrErrorSchema`, `retryableCodes`, `retryable` moved here verbatim from `src/next.ts` and `retryable` exported (D4).
- `src/next.ts` — moved definitions deleted, `retryable` imported from `./shell` (D4); `dispatchLeaf` failed branch reduced to `return 'waiting'`, "Failed leaf" notification block deleted (D5).
- `src/phase.ts` — `herdrCall` (attempt once, retry once on `retryable(CommandError.result)` with a structured warning), `announceFailed` (notification show → persist `failure.delivery` → tab rename; last error rethrown after both calls), `commitMove` wiring inside the existing `try` so `logMove` still runs in `finally`; rename-back to `<slug>` on moves out of `failed` (D1–D3); `failed_notified: false` reset line removed (D6).
- `src/state.ts` — `failed_notified` dropped from `stateSchema`; `readState` strips it as a legacy key (D6).
- `tests/fake-herdr.ts` — `tab rename` (updates stored label, `tab_not_found`/`timeout` failures), notification returns `{ shown: true, reason: 'shown' }` with `--body`/`--sound` validation, `failNotificationOnce`, `failRename` (D7).
- `tests/helpers.ts` — shared `fakeHerdr(f)` mirroring `fakeGh` (D8).
- `tests/phase.test.ts` — `herdrCalls` reader; fake env on every move to `failed`; exact argv and `delivery` assertions; new `failed announce renames tabs, tolerates missing tabs, and retries herdr calls` test covering criteria 2–5.
- `tests/next.test.ts` — `failed delivery retries` rewritten as `failed leaves never notify on dispatch`; `failed_notified` removed from three `saveState` fixtures and the redispatch assertions; stale-misses `failure` expectation gained `delivery: 'shown'`.
- `tests/state.test.ts` — `failed_notified` added to strict-rejection and lazy-migration legacy cases; removed from canonical and `supported` fixtures.
- `tests/status.test.ts` — local `fakeHerdr` replaced by the shared helper (D8).

## Commands run

- `bun run typecheck` — clean.
- `bun test` — 244 pass, 0 fail, 3067 expect() calls, 12 files, 53.71s.
- `bun run format` — no changes.
- Worker changed-tests: `AKROGON_BASE=f91cea9... bun test --changed` — 240 pass, 0 fail after brief 2 (brief 1 left one expected red: stale-misses fixture missing `delivery`, fixed in brief 2).
- Red evidence (brief 1, before `src/phase.ts`): new announce assertions failed with `[]` calls and missing `delivery`; green after.

## Worker returns

- `implementation/report-brief-1.md` — announce machinery; criteria 1–7 verified including dispatch-path announce (`notification show repo/retry failed --body 'attempts: attempts exhausted' --sound request`, `tab rename w1:t1 'retry failed'`).
- `implementation/report-brief-2.md` — `failed_notified` retirement; typecheck-driven reference sweep; one-line `src/phase.ts` touch (reset line removal) required by the no-write rule.

## Known limitations

- Fake `notification show` accepts the old title-only shape so `observeBusy` busy notifications keep working; the new announce always sends `--body`/`--sound` and the fake validates them when present.
- `failNotificationOnce` fails with retryable `timeout` (not `fixture_notification_failed`) so the retry-success criterion is observable.
- When the announce fails and `logMove` also fails, the `logMove` error is the one raised (`finally` semantics); the committed move and `delivery` still stand — recorded in plan.md known limitations.
- `grep failed_notified src/` has one match: the `readState` legacy-strip filter itself, which is required.

## Unverified criteria

None. All plan acceptance criteria verified by the suite above.

## Repair: check.fix round 1 (review-A F1)

Finding: `tests/next.test.ts` `dispatchFixture` inlined the herdr fake setup instead of adopting shared `fakeHerdr(f)` (plan checklist step 7).

- Before: `3c946f8` (reviewed head). After: `8889e62` — `dispatchFixture` is `{ ...f, ...fakeHerdr(f) }`.
- `fakeHerdr` adjusted to match the replaced fixture exactly: bin dir `f.home/bin` (tests drop fake `flock`/`git` there) and seed includes `prompts`/`starts` (`database()` raw-parses the db without schema defaults).
- Verification: `bun test` 244 pass / 0 fail; `bun run typecheck` clean; `bun run format` no-op. Intermediate runs caught the two divergences (18 then 9 failures) before the corrected helper.
