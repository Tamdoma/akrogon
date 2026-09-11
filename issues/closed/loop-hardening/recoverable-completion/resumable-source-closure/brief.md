# Brief: resumable-source-closure

## What
Completion closes GitHub sources before any folder moves and per owning issue: when every leaf of an issue is merged, the sources present in every leaf of that issue and in no sibling issue are closed; the rest close when the epic moves. A failed closure leaves the owner in `issues/open` with merged leaves and the next sweep retries. `issue complete` prints only after that issue's closures succeed. `next --all` runs the completion sweep before merged-worktree cleanup, and cleanup skips merged leaves still under `issues/open`.

## Why
`completeOwner` renames first and retries never (#5, reproduced), prints `issue complete` before closure can fail so merge-issue broadcasts on a false line, and `next --all` removes the worktree whose HEAD the closure comment needs (#13).

## Done-criteria
1. `bun test tests/phase.test.ts` passes with new cases using the fake gh: (a) closure failure leaves the owner folder in open, exit nonzero, no `issue complete` printed, and a later `akrogon next <slug>` retries and then moves the folder; (b) in an epic with two issues sharing one source and each holding one private source, completing the first issue closes only its private source and prints `issue complete <issue>`; completing the second closes its private source and the shared one and moves the epic; (c) a single issue under open closes all its sources then moves; (d) already CLOSED sources are skipped without a close call.
2. `bun test tests/next.test.ts` passes with a case where `next --all` completes a merged leaf whose closure previously failed before any `git worktree remove` runs, and never removes the worktree of a merged leaf still under open.
3. Existing test `completion reports each` is updated to the new ordering rather than deleted; `tests/phase.test.ts:251-330` retry behaviour is replaced by the new retry-on-sweep expectation.
4. `bun run format`, `bun run typecheck`, `bun test` pass.
