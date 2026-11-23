# Slot D review, flaky-wait, round 5

Verdict ready

- Previous head `7d247f0bd6eb95244c47434b6191084f1960262f`
- Head `e1e257159a45c537de16c1c322067cbee5832698`

**F6 fixed.** While the timer is stopped, the test releases the hold, waits for the held call to continue and the watcher to become idle or done, then samples the backlog after at least two more boundaries (`tests/watch-timer.test.ts:1156–1180`).

In disposable checkouts, the watcher was idle at resume in all four probes. The unmodified timer sent due 3 for backlog 3 at normal speed and due 6 for backlog 6 with a 10-second delay after release. With `working = busy` at `skills/watch-issues/scripts/timer.ts:166`, the next due was 2 in both cases and the backlog assertion failed both times.

All 22 tests in `tests/watch-timer.test.ts` and `tests/durable-capture.test.ts` passed with `--timeout=120000 --max-concurrency=5`. `git diff --check 7d247f0b..e1e25715` passed.
