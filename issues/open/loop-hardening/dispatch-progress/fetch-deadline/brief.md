# Brief: fetch-deadline

## What
The `git fetch` in `recoverMerge` cannot hang dispatch: the subprocess is killed after a fixed 60 second deadline and the failure surfaces as a `CommandError` naming the deadline.

## Why
`src/phase.ts:139` fetches inside the repo and global locks with no timeout, so a hung remote stalls every dispatch on the machine (#14).

## Done-criteria
1. `bun test tests/phase.test.ts` (or `tests/next.test.ts`) passes with a case where the fetch command is a script that sleeps past a test-injected short deadline: the call throws within the deadline, the child is no longer running, and the lock is released (a following command acquires it).
2. A fetch that returns before the deadline behaves as before, including the existing single retry.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
