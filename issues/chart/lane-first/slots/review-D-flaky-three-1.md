# Slot D review, flaky-three, round 1

Verdict fix

- Base `c4cf74a73b4ebdfea87f1af1d570b01059cdb193`
- Head `a6d28cbe38cc344881e0b66126a185cde6724773`

**F1. Five single-wait tests can read `wait.code` before it is published.** The new writer closes `wait.tmp` and renames it to `wait.code` (`tests/door-exchange.test.ts:48–52`). The shared `exchange()` reader still waits for the foreground to leave `hc wait` and then reads `wait.code` immediately (`:176–182`). That condition can hold before the rename. I inserted a one-second delay before the rename in a disposable checkout. The blocked-consultant test failed with `ENOENT` at line 180. Waiting for `wait.code` with `appears()` made the same probe pass. Use that file wait in the shared reader as well as in the re-armed test.

The re-armed test now waits for the second wait's argv before releasing the blocker and waits for `wait2.code` before reading the result (`tests/door-exchange.test.ts:250–268`). With a one-second gap before wait 2, base failed opening `wait2.code` and head passed. I also gated the second client before it could connect while keeping its foreground argv visible. The blocker reached `blocked` first, and the second wait still returned that unseen child status.

The core cleanup fix works. In the timer-start test, `discard()` removed the second core's socket while the matching server PID stayed alive. `stop()` removed the socket and the server exited (`tests/watch-timer.test.ts:414–424`, `tests/hc-fixture.ts:343–357`). I stopped the probe's leaked process after observing it.

All 23 tests in the two touched files passed unmodified with `--timeout=120000 --max-concurrency=5`. `git diff --check c4cf74a7..a6d28cbe` passed.
