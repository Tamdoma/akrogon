# Brief: completion-dependents

## What
When `akrogon next` sees a leaf complete (targeted run, `tab_closed` hook, pane hook), it dispatches only the leaves in that leaf's repo whose `blocked-by` names the completed slug. It no longer sweeps every registered repo. The guide states the new rule.

## Why
Tamdoma/akrogon#29: `akrogon next peer-c-role` in akrogon completed, and the global sweep started four framework leaves that were implemented, merged, pushed and announced on Discord without the operator starting them. Every later completion swept again.

## Done-criteria
1. `src/next.ts` completion sites (today `:672`, `:697`, `:706`) no longer call `sweepAll`. Each dispatches only same-repo leaves whose `blocked-by` includes the completed slug, through the existing `dispatchLeaf` checks (dependencies, capacity, hand_built, failed).
2. New test in `tests/next.test.ts`: two registered repos. Repo X has leaf `first` and a ready unrelated leaf `loose`. Repo Y has a ready leaf. After `first` merges and each completion path runs (targeted `next first`, `tab_closed` hook, pane hook), neither `loose` nor the repo-Y leaf has a tab or attempts, and `first`'s dependent does get a tab.
3. New negative test: a dependent that also names a second unmerged leaf stays unallocated after the first blocker completes.
4. Existing dependent-chaining tests (`a closed tab hook from a merged leaf sweeps and starts the next leaf`, `merged phase closes tab on typed next and starts the dependent`) still pass. Rename a test title only if it now misdescribes the behavior.
5. `docs/guide/limits.md` and `docs/guide/next.md` state that a completion starts only its dependents in the same repo, and that other leaves start only through a manual `akrogon next`. No guide line still says later sweeps pick up other open leaves after a completion. Do not edit the startup sentence in `next.md` (owned by startup-resume).
6. `bun run format`, `bun run typecheck` and `bun test` pass.

## Credentials
None.
