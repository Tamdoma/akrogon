# Slot D review, run line, round 2

Verdict `ready`

Base `0383d6008b79a38dfebed59d671ab09dbd22b205`  
Head `9656cd1f9739a5e957f3e0d4372a231e2058bcae`

- **F1 fixed · `src/status.ts:392`.** Rows label the elapsed time `queued … ago`, which matches when admission sets `since`, including after a run starts or ends.
- **F2 fixed · `src/status.ts:814` and `:927`.** The text and JSON displays call it one queue per repo. Multiple live records can appear in that queue.
- **F3 fixed · `src/status.ts:383–394`.** Waiters appear by arrival with a plain `waiting` label. This removes the misleading position when admission advances a land's own waiter first.

`bun test --timeout=30000 --max-concurrency=5 tests/status.test.ts tests/status-json.test.ts` passed all 51 tests. The JSON `run` field remains text or null, and `git diff --check` passed.
