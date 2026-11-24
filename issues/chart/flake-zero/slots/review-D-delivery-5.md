# Slot D delivery-flakes round 5

Verdict **fix**. Reviewed `1ec3af9f` on `14774a0e`.

- **F11 · fails in normal use.** The loop checks the deadline after `await until`, so a slow trust or send call can delay the timeout and a late rejection can replace it. In a `startConsultant` replay with a 150 ms proof budget and a trust reply held 450 ms, main returned unconfirmed at 160 ms whether the reply later succeeded or failed. This head returned unconfirmed at 469 ms after a successful reply and threw `HcError('unavailable')` at 468 ms after a failed one. Both head runs made zero sends. Let the wait settle at its deadline and keep late predicate results or errors from changing that outcome. See `src/hc.ts:558–586` and `src/seat.ts:146–177,210–243`.
- **F12 · minor.** The fixture test checks the address in a marker written before the lookup's stdout reaches the fixture. It then samples predicate calls after a 500 ms sleep. With the settlement guard removed, the test failed with one extra call, as expected. With the guard still removed and stdout delayed 3 s after writing the correct marker, the test passed. Synchronize with the fixture processing the reply so the assertion covers a late successful lookup. See `tests/hc-identity.test.ts:465–468,486–497`.

The F8 replay made no post-deadline send. The F9 replay returned `null` at 50 ms with zero predicate calls when the snapshot was held 240 ms. Both new regressions failed with the corresponding `79ce1b28` code restored. F10's missing-result case is covered by the new address assertion. F12 concerns when the fixture processes that result.

Typecheck, diff check and 38 focused tests passed. The verify log records 1,425 suite passes and 60 repeat passes. I did not rerun the reported 192-copy stress run.
