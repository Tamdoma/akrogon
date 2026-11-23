# Slot D review, one test cap, round 2

Verdict `fix`

Base `0383d6008b79a38dfebed59d671ab09dbd22b205`  
Head `25799c4d45a79775ad3af3834b207d40e774b383`

`WAIT_MS` gives each wait 28 seconds from when it starts. Bun gives the entire test 30 seconds. Setup or an earlier wait can consume the two-second cleanup margin. The existing idle-gap test, for example, sleeps 6.5 seconds before reaching its next wait (`tests/watch-timer.test.ts:1068`, `:1073`).

- **F1 still open · `tests/budget.test.ts:45–49`, `:439–446`.** I withheld the same lock marker as round one and delayed the waiting CLI launch by 2.6 seconds to exercise slow setup. Head reached Bun's 30-second timeout while both subprocesses were still asleep. The poll ran six more times over the next 120 ms in `afterEach`. Base rejected the wait, reaped both subprocesses and stopped polling before `afterEach`.
- **F2 still open · `tests/notices.test.ts:21–28`, `:41–42`.** I withheld the final rename notification after adding 2.6 seconds of setup before watcher registration. Head reached Bun's timeout with the watched directory still present and the watcher still open. Base removed the directory before `afterEach`.

## Verification

The same fault probes on head without the setup delay reached their helper bounds at about 28 seconds and cleaned up before Bun's timeout. Both delayed probes used `--parallel=1 --no-isolate`.

`bun test --timeout=30000 --max-concurrency=5 tests/budget.test.ts tests/notices.test.ts tests/door-reset.test.ts tests/hc-listener.test.ts` passed all 46 tests. `git diff --check` passed.
