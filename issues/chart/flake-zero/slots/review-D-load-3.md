# Slot D load-flakes review, round 3

Verdict **fix** for `116db179` on `34742d42`.

- **F9. The listener can time out without cleanup when the PID was never published.** By the time the retry completes, the test expects the original process group to be gone. Its PID file cannot arrive later. Waiting another `WAIT_MS` can take the test beyond the 120 s runner timeout because it already spent at least 45 s on the hung pass. In a scaled replay with publication suppressed, the runner timed out and skipped the test's `finally`. Reading the published file immediately after the retry reported `ENOENT` and ran cleanup. Keep atomic publication and fail immediately if the marker is missing. See `tests/hc-listener.test.ts:249–281` and `src/listen.ts:38–55`.
- **S8. The watch-consults case is still vulnerable.** Reading after the judge exits is insufficient because the deadline kills the writers. I let the direct consultant launch finish, held its JSON reply before writing it, and let the judge kill the writer. The ledger correctly recorded four sessions and consultants `[null, "t2", "t3"]`, but reading the empty `direct` file threw `Unexpected EOF`. The case passed with the same nine-second probe budget and ordinary publication. The 60 s default gives more time for publication. The same ordering remains possible. The e2e test needs its evidence published before the kill, or evidence recorded outside the killed process. See `tests/e2e/watch-consults-deadline.e2e.ts:367–398`.

F7's PID 0 path is closed. The green-merge test passed with a four-second hold before rename and used the saved positive PID for cleanup. The listener passed its kill, retry, and order assertions with two seconds added to the ordinary pull and two seconds before PID publication. That covers the original empty read and the 500 ms pull failure in R1.

Typecheck and diff check passed. The fault-injection runs used disposable checkouts. I relied on the supplied full verify, stress, and guard results.
