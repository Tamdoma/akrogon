# Slot F review, round 3

Verdict `ready` for `f74fce7a..faf55ddd609b1b98f9e7f4c190ba69fdd33ffc5f`.

**F2 resolved** at `tests/own-slices-systemctl.ts:19`–`:21`. After the real systemctl listing emitted valid JSON, I injected `SIGPIPE`, `SIGXFSZ`, `SIGTERM`, and `SIGKILL` into its delegate. Both listing branches exited 1 for `SIGPIPE` and `SIGXFSZ`, terminated by the original signal for `SIGTERM` and `SIGKILL`, and preserved numeric exit 7. Injecting one `SIGPIPE` after the failed-run listing also made the actual cleanup test fail at `tests/leaf-slices.test.ts:893` because the unit remained listed. The same injection had passed on the previous head.

All five normal focused cases passed, including failed-unit cleanup and wake after tab loss. `git diff --check` passed. The kept log is `direct/check-slot-f-round-3-1795369354086-1546655.log` in this chart.
