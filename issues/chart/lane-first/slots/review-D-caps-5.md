# Slot D review, one test cap, round 5

Verdict ready

- Previous reviewed head `75889e954662e7867cf763f09be86b8ed5a64ab7`, rebased as `f922acfc43e46a8f8b5d0338b5f5ea09fdf281e3`
- Head `f23184985e49905782465fceb0806c49eafd9d60`

1. F3 fixed. The arrival-order test now shares one 90-second deadline across the holder and waiter checks (`tests/run-permit.test.ts:291–308`). The deadline starts after `fixture()` and before any child launches. In the round 4 replay, the first two stages finished at 32.2 seconds and the missing diagnostic triggered the wait error at 90.1 seconds. The test entered `finally` with about 30 seconds left before Bun's cutoff. One child was still exiting when `afterEach` began. By the next sample 25 ms later, Bun had reaped all three direct children with `SIGKILL`, and no descendant was running. The repo's original base also reached its own wait error and reaped all three children in this probe.

All 23 tests in `tests/run-permit.test.ts` passed with `--timeout=120000 --max-concurrency=5`. The fault replays ran in temporary checkouts with `--parallel=1 --no-isolate`. `git diff --check` passed.
