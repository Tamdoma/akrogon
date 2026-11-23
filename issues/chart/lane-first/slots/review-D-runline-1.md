# Slot D review, run line

Verdict `fix`

Base `0383d6008b79a38dfebed59d671ab09dbd22b205`  
Head `30d757da94313d890653675ceef1c372972eb484`

- **F1 · `src/status.ts:398`.** The row presents elapsed time as time in the displayed state. `since` is set when the run queues and preserved when it starts and ends (`src/admission.ts:198`, `:285`, `:298`). A check that waited 20 minutes immediately shows `running … for 0h 20m` when it starts. That counts waiting time as execution time. The prior table called this value `AGE`.
- **F2 · `src/status.ts:822` and `:935`.** The title promises one run at a time per repo, but a land can start beside an already-running full check. The existing admission scenario at `tests/run-permit.test.ts:873` starts both, then adds a waiter. `lineRuns` includes both records, so the same repo can show two `running` rows under the new title.
- **F3 · `src/status.ts:385–388`.** The numbered list keeps the prior arrival ordering even when a land changes admission order. In the same admission scenario, an unrelated earlier waiter displays as `waiting 1`, and the land's own later waiter as `waiting 2`. The scheduler admits the land's waiter first (`src/admission.ts:181–191`), so the displayed numbers identify the wrong command as next.

## Verification

`bun test --timeout=30000 --max-concurrency=5 tests/status.test.ts tests/status-json.test.ts` passed all 51 tests. `git diff --check` passed.

The JSON envelope still carries `run` as text or null. I found no table parser in the current checkout or the checked Herdr setup code. The former Tasks mod passed `env.run` through as display text (`8c26bfb7^:herdr-app/tasks/model.js:141`).
