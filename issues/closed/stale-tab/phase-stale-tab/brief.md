# Brief: phase-stale-tab

## What
In `src/phase.ts`, both tab renames (`announceFailed` when entering `failed`, `commitMove` when leaving `failed`) treat a herdr failure whose structured code is `tab_not_found` as an absent tab: print one structured warning and continue. `akrogon phase` then exits 0 when every other step succeeded. Every other herdr error, a notification failure and a log append failure still fail as today.

## Why
Tamdoma/akrogon#55: `akrogon phase emdash-offer-join check.fix` saved the move, then exited 1 because the recorded tab `wA:t8N` had been closed (`tab_not_found`). The chained `akrogon next` did not run, although a separate `akrogon next` later worked and opened a new tab.

## Done-criteria
All in `tests/phase.test.ts`, against `tests/fake-herdr.ts` (which already answers `tab_not_found` for an unknown tab):
1. Leaving `failed` with a recorded tab that herdr does not have: exit 0, phase saved, move appended to `issues/log.jsonl`, exactly one `tab rename` call (no retry), stderr holds one JSON warning whose parsed fields are the slug, the herdr command, `code: "tab_not_found"` and herdr's `message`, and `state.tab` is unchanged.
2. Entering `failed` with a recorded tab that herdr does not have: exit 0, notification shown, `failure.delivery` is `shown`, the same warning, move appended to the log.
3. Entering `failed` with a failing notification and a recorded tab that herdr does not have: non-zero exit carrying the notification error, `failure.delivery` is `error`.
4. A rename failure with any other code keeps today's handling: retryable codes are retried once by `herdrCall`, the rest are not, and both exit non-zero. The existing `failRename` (`timeout`) tests pass unchanged.
5. The configured `checks` (`bun run format`, `bun run typecheck`, `bun test --timeout=30000`) pass.
