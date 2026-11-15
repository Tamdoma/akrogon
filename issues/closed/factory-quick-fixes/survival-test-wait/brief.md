# Brief: survival-test-wait

## What

The proof named "a verify pass survives its caller being SIGKILLed mid-check and finishes like an uninterrupted run" judges the pass only after that pass's own service has exited. It waits for the service with the bounded wait the same test file already uses for other passes, naming the service by the run id in the pass's receipt, and then checks everything it checks today. No product code changes: a pass still publishes its receipt before it removes its checkout.

## Why

The proof flips: `akrogon flaky` lists 5 flips, the latest on 2026-11-08, and the kept red logs of 2026-11-03, 2026-11-04 and 2026-11-08 show the same thing each time: the receipt already has its `end`, and the pass's checkout still exists a moment later. A pass writes its receipt and then removes its checkout, and the proof looks as soon as the receipt is complete. The earlier decision verify-lifetime (Taken point 4) already says a waiter waits for the pass service to exit, because cleanup follows the receipt. Each false red costs a retry and a diagnosis (issues/chart/factory-wins/forks/contracts.md, Findings; issues/chart/factory-wins/slots/map-B.md, M3).

## Done-criteria

1. With checkout removal slowed by a scratch delay that is not committed, the proof is red at the base, showing the checkout still present after the receipt is complete, and green at the head. The report records both runs.
2. The proof still catches a real failure: with a scratch change, not committed, that leaves the checkout in place after the pass ends, the proof is red at the head.
3. A pass whose service never exits fails the proof through the bounded wait, naming the service it waited for, and does not run to the test's own time cap.
4. Without any scratch change the proof is green at the head, and it still shows what it showed before: the pass finishes after its caller is killed, the check ran to its end, its log is kept, and the checkout is gone.
