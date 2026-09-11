# Brief: seat-guards

## What
Dispatch prompts a live idle agent whose session value is absent, treats a `blocked` merger as active, tolerates extra panes in a leaf tab, and does not burn an attempt on a slow agent start.

## Why
`src/next.ts:230` skips the prompt when both `agent_session` and `prompted[slot]` are undefined (reproduced); `:303` lets `recoverMerge` run while a blocked merger sits mid-rebase; `:171` throws on a third pane; `:249` gives `agent start` 5 seconds and consumes an attempt on a cold start (#9).

## Done-criteria
1. `bun test tests/next.test.ts` passes with new cases: (a) an idle agent with `agent_session: null` and no `prompted` value receives the prompt; (b) a `blocked` merge seat prevents `recoverMerge` (no fetch, no clean check); (c) a leaf tab with three panes where the recorded A and B panes are live dispatches normally and the third pane is never prompted; (d) when the recorded A pane is gone and a third unrecorded pane exists, a new split is created and the unrecorded pane is never adopted; (e) `agent start` is invoked with a 30000 ms timeout and `agent prompt --wait` keeps 5000 ms.
2. Existing blocked-agent wait test still passes unchanged.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
