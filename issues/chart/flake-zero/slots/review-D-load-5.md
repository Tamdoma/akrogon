# Slot D load-flakes review, round 5

Verdict **fix** for `0ce0a196` on `34742d42`.

- **F11. An empty PID marker now passes the listener's worker-exit check.** The writer runs `mv` even if its `echo` failed. An empty published file becomes PID 0 through `Number('')`. `procFile(0, 'stat')` returns `null`, which the assertion treats as a worker that exited. I limited only the PID writer to zero bytes and ignored its file-size signal. The case passed with an empty marker. Parsing a positive integer before the single `procFile` read made the same replay fail. Keep the one-read fix and validate the PID before probing it. See `tests/hc-listener.test.ts:249–252,275–278` and `tests/hc-fixture.ts:59–70`.

**F10 is closed.** The shared schema is unchanged. The test checks the refused request and compares the seated and direct addresses from the launch evidence in the required order. My held-reply replay passed with the direct launch recorded and its reply file empty. With the same hold and the judge returning the addresses in the wrong order, the assertion failed at the exact address comparison. These replays used a private session and fake agents.

**F9 remains closed.** The listener reads the PID file once after retry, so a missing marker still fails immediately. All 10 listener tests passed with the standard deadline. Typecheck and diff check passed. I relied on the supplied full verify and guard results.
