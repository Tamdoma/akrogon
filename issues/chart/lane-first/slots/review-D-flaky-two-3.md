# Slot D review, flaky-two, round 3

Verdict ready

- Previous head `587e19097713f02035262955296e70f3b545add0`
- Head `e744adb78920606244857db94c5752aeeffc3dd8`

**F3 fixed.** A scan follows only accepting sockets. A named socket that refuses connections is probed outside the scan queue (`src/listen.ts:146–175`). In an isolated runtime, changing a stale socket's mode left its real hc core stopped past the probe deadline. In a separate run, a socket bound for 450 ms before calling `listen()` received no event subscription while refusing. It was followed once it accepted and triggered one catch-up resume, with no further directory changes. A live session also subscribed while a stale socket was still being probed.

All 10 tests in `tests/hc-listener.test.ts` passed with `--timeout=120000 --max-concurrency=5`. `git diff --check 587e1909..e744adb7` passed.
