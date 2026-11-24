# Slot D load-flakes review

Verdict **fix** for `c303e829` on `1f563e7d`.

- **F1 · fails in normal use.** The serial tests share their timer spy with the runner's global. Their `finally` restores it on ordinary failures, but Bun skips the suspended test's cleanup when the runner timeout fires. In a two-file replay using the exact helper, the first test timed out and the next file still saw the spy. Its ordinary `setTimeout(resolve, 1, 42)` returned `undefined` because the wrapper drops callback arguments. Keep the interception inside a bounded child, or restore it from a runner cleanup hook and forward the full timer arguments. See `tests/shell.test.ts:12–20,49–76`. [Bun test runner](https://bun.sh/docs/test)
- **F2 · minor.** No other current literal uses 4,127 ms, and neither `Bun.sleep` nor native spawn timeouts reached the JS spy in a replay. The delay is still a collision key for any JS timer. I added one timer at that delay. The readiness count stayed wrong and the held process was still alive after the spies were restored. Bound the wait for the killed attempt, and clear held timers and stop the attempt on failure. See `tests/shell.test.ts:15–28,52–76`.

For the deadline cases, a private child using the existing `spawnCaptured` pattern can hold its own JS timer, poll the PID marker with real `Bun.sleep`, then fire the deadline. I checked this with a 500 ms delayed attempt. This removes shared globals and the need to pick a unique delay. The ordinary retry case can use a real `WAIT_MS` deadline because its assertions cover command outcomes. The standalone cases already cover actual timer cancellation.

All seven shell tests, typecheck and diff check passed. With a 500 ms delay, the two new deadline cases passed and the old cases failed. Removing `clearTimeout` and shortening only the probe's outer watchdog made both standalone cases exit 143. The supplied verify log shows 1,428 suite passes and 35 repeat passes. I did not rerun the 72-copy stress run.
