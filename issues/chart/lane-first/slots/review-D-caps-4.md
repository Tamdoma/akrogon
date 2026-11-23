# Slot D review, one test cap, round 4

Verdict fix

- Base `0383d6008b79a38dfebed59d671ab09dbd22b205`
- Head `75889e954662e7867cf763f09be86b8ed5a64ab7`

F1 and F2 withdrawn as regressions. Round 3 supplied the 120-second flag to both revisions. The actual base runner has a 30-second limit, so its cleanup at 40 seconds in those probes was outside its configured budget. For those two waits, base allows about 25 seconds before the wait starts and head allows about 30.

1. F3. The queued-run arrival-order test can now leave three live children when Bun moves on (`tests/run-permit.test.ts:288–306`, `:323–326`). The base test allowed 75 seconds and each of its waits allowed 20. I delayed the holder's ready marker and the first waiter's launch by 16 seconds each, then withheld the next waiter's diagnostic from the test. Both revisions cleared the first two waits in 32.2 seconds. Base rejected the third wait at 52.2 seconds, ran `finally`, and had zero live children in `afterEach`. Head gave the third wait a fresh 90 seconds. At Bun's 120-second cutoff there were three live children in `afterEach`, and `finally` had yet to run. One deadline captured inside this test's callback can bound its sequential waits without sharing state across concurrent tests.

The comparison used the original 30-second CLI flag on base and the 120-second flag on head, using `--max-concurrency=5 --parallel=1 --no-isolate` on both. All three unmodified tests passed on head with `--timeout=120000 --max-concurrency=5`. Round 3 ran all 772 tests in the 34 changed files on this same patch. The live config already uses 120 seconds. Its tracked copy follows the separate issue sync workflow.
