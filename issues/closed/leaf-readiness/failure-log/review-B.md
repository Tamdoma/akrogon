# Review B: failure-log

Date: 2026-10-02
Phase: check.review (initial, blind)
Base: b2c15ec5d2fe889e158934b084dd93cfeafc9f72
Reviewed head: ad671588f3f8f3c0de3fe3e0b775d60ff19b49ca
Verdict: fix

## F1: Failed announcement logs stale failure, losing persisted delivery

Location: `src/log.ts:31`, through `src/phase.ts:70-83,112-124`.

Realistic source: an operator runs `akrogon phase <slug> failed --slot A --reason <text>`. The real external calls `herdr notification show ...` and, for a leaf with a tab, `herdr tab rename ...` can fail. Notification errors or rename timeouts after the existing retry reach `announceFailed`'s final throw. This is an existing supported integration error path, already exercised by `tests/phase.test.ts`'s `failed announce renames tabs, tolerates missing tabs, and retries herdr calls` scenarios, not malformed state or a direct handcrafted invocation of the logger.

Trace: `announceFailed` saves `{ ...failure, delivery }` at lines 70-71, then throws at line 83. Because `announced = await announceFailed(...)` at line 114 never completes, `commitMove`'s `finally` passes its original `after` to `logMove`. The new field copies that stale failure object.

Consequence today: the committed failed transition appends a log record missing `delivery` even though state contains `delivery: error` on notification failure or `delivery: shown` on exhausted rename failure. Log consumers lose the recorded announcement outcome. The report and plan D1's claim that the persisted delivery always reaches the logger is false on these paths.

Contract hit: brief's requirement that every failed record carry the failure object as written to state, including delivery when present, and criterion 1's equality requirement. Existing error-path tests check state and Herdr calls but never compare log failure to state failure. The new equality test covers only successful announcement.

Verification: ran both existing fixture error modes through the public CLI with `--slot A --reason 'Required permission is missing'`, using `fixture`, `fakeHerdr`, `leaf`, `cli`, and `readState` from this worktree. Both exited 1 after stdout `moved failed`, and appended a failed log record. Outputs:

```json
{"mode":"failNotification","stateFailure":{"cause":"blocked","phase":"implement","slot":"A","reason":"Required permission is missing","delivery":"error"},"logFailure":{"cause":"blocked","phase":"implement","slot":"A","reason":"Required permission is missing"}}
{"mode":"failRename","stateFailure":{"cause":"blocked","phase":"implement","slot":"A","reason":"Required permission is missing","delivery":"shown"},"logFailure":{"cause":"blocked","phase":"implement","slot":"A","reason":"Required permission is missing"}}
```

The notification stderr reports `fixture_notification_failed`. Rename stderr warns of a retry and ultimately reports `timeout`. Fixtures were removed in `finally`; no repository code was changed.

Required repair: ensure the logger receives the persisted failure even when announcement throws, preserving the external error. Add equality assertions to the existing notification-error and exhausted-rename scenarios, show them fail before the fix, and pass afterward.

## Verification and scope

- Read brief, plan, design, implementation report, ponytail guidance, reference index, source area, and the unchanged behavior pages `docs/guide/phases.md` and `docs/guide/state.md`. No documented behavior changed; no AREA.md changed.
- Inspected the full three-file diff and the sole `logMove` caller. Non-failed transitions clear failure before logging. Status validates known fields with a non-strict schema and prints the original line, so the added key is compatible.
- Reused reported evidence at this exact head: changed tests 191 pass / 0 fail, full suite 358 pass / 0 fail, format unchanged, typecheck clean. No code changes since that evidence.
- Reran `bun test tests/phase.test.ts --timeout=30000` for the specific announcement-error concern: 42 pass / 0 fail, 376 assertions. This confirms the existing tests miss F1 rather than reporting a red check.
- No nits or operator actions. Worktree clean before and after review.

## 2026-10-02 check.repair

Repaired F1 from both initial reviews. No remaining Fixes, Handed to A items, or operator actions.

Commits:
- `f376eca` — failing regression tests for notification failure and exhausted tab-rename failure through the public phase CLI.
- `39cb4c0` — `commitMove` supplies persisted state to `logMove` for failed transitions, preserving the original announcement exception. Also finalizes test formatting and marks the parsed log failure optional, matching the record contract.

Red-first proof: `bun test tests/phase.test.ts --test-name-pattern='failed move logs persisted delivery' --timeout=30000` exited 1 before the source change: 0 pass, 2 fail. Equality diffs showed missing `delivery: error` for failNotification and missing `delivery: shown` for failRename. The same command after the fix exited 0: 2 pass, 0 fail, 6 assertions. Both tests still require a nonzero CLI exit, so the external failures remain visible.

Done-criteria proof: `bun test tests/phase.test.ts tests/next.test.ts --timeout=30000` exited 0: 193 pass, 0 fail, 1754 assertions. This includes criterion 1's blocked failure equality, criterion 2's attempts-stop equality, criterion 3's omitted non-failed failure key and status history, plus both F1 error scenarios.

Configured checks:
- `bun run format`: passed. Final formatting produced no unrelated edits.
- `bun run typecheck`: initially caught a test-only mismatch between required `record.failure` and optional state failure. Changed the test record type to optional failure. Rerun exited 0.
- `bun test --timeout=30000`: exited 0, 360 pass, 0 fail, 4166 assertions across 16 files.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exited 0, 193 pass, 0 fail, 1754 assertions across 2 files; base b2c15ec5d2fe889e158934b084dd93cfeafc9f72.

Suite, changed-test and criterion runs exercised the final production code. The only later edits were the test type correction and formatting. Typecheck and both regression tests passed afterward at final head `39cb4c0`. Reviewed the repair diff and confirmed a clean worktree. No merge_checks run. No plan/design edits, temporary helpers, or added dependencies.

## 2026-10-02 merge

Prior reviewed/repaired head and final merge head: `39cb4c0b020af3dc784c7473d08937f9007c2b3f`.
Fetched origin and rebased onto `origin/main` at `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`; branch already up to date, no conflicts. Refreshed config after rebase: AKROGON_BASE remains that target SHA. No outstanding code changes.

Post-rebase checks:
- `bun run format`: exit 0, all files unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 360 pass / 0 fail, 4166 assertions; log `/tmp/akrogon-1000/failure-log-b3db1c100ac8/tmp.5M5j5SxaIW`.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 193 pass / 0 fail, 1754 assertions; log `/tmp/akrogon-1000/failure-log-b3db1c100ac8/tmp.dYBkst9903`.
- No configured merge_checks or advisory commands.

Gathered all five owner briefs under `issues/open/leaf-readiness` before completion: failure-log, seat-input-rules, door-readiness, env-link, readiness-contract.

Push confirmed: `git push origin HEAD:main` exited 0 and fast-forwarded main from `b2c15ec` to `39cb4c0`.

Completion: `akrogon phase failure-log merged --slot B` exited 0 and printed `moved merged`. No `issue complete` or `epic complete` marker, so no broadcast was triggered. Leaf-readiness has other leaves outstanding.
