# Slot D review, one test cap, round 3

Verdict fix

- Base `0383d6008b79a38dfebed59d671ab09dbd22b205`
- Head `75889e954662e7867cf763f09be86b8ed5a64ab7`

The 120-second limit gives cleanup room in both original probes with 25 seconds of setup. The inner 90-second budget still starts when each wait begins (`tests/helpers.ts:22`). With 35 seconds already spent, a hung wait runs into Bun's limit five seconds before its own timer can reject.

1. F1 remains open at `tests/budget.test.ts:439–460`. I delayed the waiting CLI launch by 35 seconds and withheld the lock marker. The base poll rejected and reaped the lock holder at about 40 seconds. On head, both children were still running at 119.5 seconds. Bun timed out at 120 seconds before the test's cleanup ran. The standalone probe's exit sweep then removed both processes.
2. F2 remains open at `tests/notices.test.ts:21–28` and `:41–42`. I delayed watcher registration by 35 seconds and withheld the final rename event. Base removed the directory at about 40 seconds and had zero inotify watches in `afterEach`. Head hit Bun's timeout with the directory and one inotify watch still present in `afterEach`.

Use the time remaining from a deadline set at test entry for these waits and kill timers so that setup time counts against the inner budget.

All 772 tests passed across the 34 changed test files with `bun test --timeout=120000 --max-concurrency=5`. Both 25-second probes reached their own timeout and cleaned up at about 115 seconds. Probe edits were confined to temporary checkouts. The named commit and the rebased worktree head `f922acfc` have identical patches. `git diff --check` passed.

The registered checkout's live `issues/config.yaml:9` uses 120 seconds. The copy committed at the reviewed SHA still uses 30 seconds. The direct test run supplied the 120-second flag explicitly.
