# U1 worker report: alarm-rule

Commit: 98e0a7d86d0bf547374207db0ae249afa7354820 (one commit, Test-Change trailer in final block, on top of a75e77ba)

## Changed files and reasons

- src/verify.ts — the new slow rule, all inside existing functions plus two small pure helpers beside decideSlow: schema gains optional slow.accepted_notice (D8); decideSlow normal selection implements the carried normal with lower-median ratchet and rolling reset after accepted (D1, D5b, D6); recovered now needs me eligible, unflagged, and the episode's own last-20 eligible median (>=5 rows) under the pinned-normal flagged bound (D2, D7); accepted keeps the full all-inside window and adds the 14-day age check against the opener row's end (D3); the decision carries sendAccepted (the notice body) out; the locked rewrite finds the latest accepted row and sends/retries merge-slow-accepted in place when uncovered (D4, D5); foldShown gains the parallel accepted_notice fold (D4). Helpers: episodeWindow (shared by decideSlow's recovered window and the caller's retry body) and acceptedBody (single body shape for fresh closes via sendAccepted and in-place retries).
- tests/slow-merge.test.ts — the four named revisions only: recovery test seeds three extra in-episode rows at 3000ms so the episode median sits under the pinned normal (criterion 3); the three accepted cases age the opener 15 days via seedEpisode's end option (criterion 4).

## Authorized corrections beyond the named revisions

Two locked asserts were defective; A authorized both edits after I returned the mismatch with evidence.

- 'the last 20 eligible runs inside the episode close it accepted': its kept expect(noticeFiles(core)).toEqual([]) contradicted the locked rule — under criterion 4 the aged run closes accepted and D4/D5 sends <repo>.merge-slow-accepted.<episode> on that run (T4b requires the same send). Changed to assert the single accepted file: length 1, path containing <f.repo>.merge-slow-accepted.<episode>, title <f.repo> merge slow accepted, attention false.
- 'a failed accepted notice is retried by the next checked run': the planned expect(noticeFiles(core)).toEqual([]) ran while blockNotices had replaced the folder with a plain file, so noticeFiles threw ENOTDIR (readdirSync, hc-fixture.ts:511) before unblock() — unreachable by any product code. Line deleted; the preceding accepted_notice === 'error' assert already proves the failed send.

Evidence: first full run red at exactly those two asserts — implementation/check-u1-slow-merge-1795295707209-1557396.log. Scratch copy with only those two lines removed passed every remaining assert in both tests — implementation/check-u1-scratch-proof-1795295753011-1727718.log.

## Tests run

- akrogon run-check --name u1-slow-merge -- bun test --timeout=30000 --parallel=4 --no-isolate tests/slow-merge.test.ts — 18 pass / 0 fail, 151 expects — check-u1-slow-merge-1795295794501-1846946.log
- akrogon run-check --name u1-typecheck -- bun run typecheck — clean — check-u1-typecheck-1795295799488-1852422.log
- akrogon run-check --name u1-format -- bunx prettier --check src/verify.ts tests/slow-merge.test.ts — clean — check-u1-format-1795295801259-1854338.log

## Known limitations

- In a run whose accepted notice folder fails to resolve (no live session, e.g. mergeEnv tests), the closing row still records accepted_notice: 'error'; the next checked run retries per D4 — intended behavior, not a gap.
- D6's under-5-eligible branch after an accepted close returns undefined (no slow record) per the brief; plan text says the carried normal stands. Unreachable without ledger truncation.

## Unverified criteria

None. All nine planned tests and all nine existing cases pass on the returned commit; typecheck and prettier clean.
