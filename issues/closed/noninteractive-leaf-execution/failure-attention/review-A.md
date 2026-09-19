# Review A: failure-attention

Base: `f91cea968ac46f5a30119e4ce03eac611cc66abd`
Reviewed head: `3c946f8ab91939d6ca542002575dad1ea8ba579b`

## Verification evidence

- `bun run typecheck` — clean (run by reviewer).
- `bun run format` — no changes (run by reviewer).
- `bun test` — 244 pass, 0 fail, 3067 expect() calls, 12 files (run by reviewer).
- Diff inspected in full: `src/{phase,shell,state,next}.ts`, `tests/{fake-herdr,helpers,next.test,phase.test,state.test,status.test}.ts`.
- No `AREA.md` files in the diff; the area-path check does not apply.
- `grep failed_notified src/` — only the `readState` legacy-strip filter, as required.
- All three `commitMove` callers pass `failure` when `to === 'failed'`; `failureSchema.parse` in `announceFailed` is safe.
- Acceptance criteria 1–7 each have a concrete test assertion: exact argv for notification/rename, `delivery` persistence, rename-back on move-out, missing-tab tolerance, both partial-failure paths, bounded retry success, zero dispatch notifications, legacy-key strip.

## Findings

### Fix

- F1 — `tests/next.test.ts` `dispatchFixture` (lines 12–19) still inlines the herdr fake setup (`mkdirSync` bin dir, `symlinkSync` fake-herdr.ts, seed db, build env) instead of adopting the shared `fakeHerdr(f)` helper added in `tests/helpers.ts`. Plan D8 and checklist step 7 name `dispatchFixture` as an adopter; `status.test.ts` adopted it, `next.test.ts` did not. The duplicated setup has already diverged (it seeds `prompts`/`starts` explicitly; the helper relies on schema defaults). Done criterion: checklist step 7. Fix is `{ ...f, ...fakeHerdr(f) }`.

### Nits

None.

### Observations (not findings)

- `failNotificationOnce` fails with `timeout` rather than the `fixture_notification_failed` named in D7. Justified: the planned code is non-retryable, which would make criterion 5 (retry succeeds) untestable. Report documents this.
- `commitMove` passes `announced` to `logMove`, but `logMove` records no `failure`/`delivery` fields, so the choice is immaterial today.
- `herdrCall` warning logs `error.result.code` (process exit code) per D3's literal field list; the herdr error code lives in `result.stderr` which is also logged.

## Verdict

`fix` — F1 is a plan-checklist deviation and a concrete duplicated-logic defect.

## Re-check after check.fix (head `8889e62`)

Repair diff inspected: `tests/helpers.ts`, `tests/next.test.ts` only.

- F1 confirmed resolved: `dispatchFixture` is now `return { ...f, ...fakeHerdr(f) }`; the shared helper's bin dir was renamed `herdr-bin` → `bin` and seeds `{ panes: [], tabs: [], serial: 0 }` with `prompts`/`starts` covered by schema defaults.
- No collision: `fakeGh` uses `gh-bin`; no test calls `fakeHerdr` twice on one fixture; `park.test.ts` keeps its own local `fakeHerdr` (pre-existing, untouched).
- `bun run typecheck` clean, `bun run format` unchanged, `bun test` 244 pass / 0 fail (rerun by reviewer).
- No defect introduced by the repair.

Verdict: `ready`.

## Merge evidence

- Rebase target: `origin/main` = `b35ed0427eccdd05c29efd2e8fdca00167e3dc70` (one new upstream commit `skills-never-ask`); clean rebase, no conflicts.
- Prior reviewed head `8889e62` → rebased head `b198be9`.
- `bun run format` — unchanged. `bun run typecheck` — clean. `bun test` — 244 pass / 0 fail. `bun test --changed=$AKROGON_BASE` — 240 pass / 0 fail.
