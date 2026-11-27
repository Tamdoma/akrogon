# Map, slot A: fresh-worktree-setup

## Where things stand (inspected 2026-11-25, main 64681915)

- `src/next.ts:ensureWorktree` creates a missing leaf worktree through `createSparseWorktree` (`git worktree add --no-checkout`, sparse-checkout `/*` `!/issues/`, `git checkout`), writes the leaf `.env` and saves `state.worktree`. No `setup` runs.
- `src/next.ts:allocate` calls `ensureWorktree` for every dispatch and the start verb. `nextCommand` holds the home `.lock` around the whole dispatch sweep (`withLock(resolve(globalHome(), '.lock'), ...)`), so anything added inside allocate or dispatch runs under that lock and blocks every other akrogon command (phase calls from seats included) while it runs.
- `src/config.ts:setupCommand` is the only place `setup` runs: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup> && akrogon guard own-modules && sh -c <cmd>`, used by `withSetup` (every configured check through run-check) and by verify's setup step (`src/verify.ts`, `setupCommand(repo.config, 'true')`). The install lock is per repo (git common dir), shared by every worktree.
- `src/guard.ts` `own-modules` fails with "missing own node_modules ... set setup in issues/config.yaml" when `package.json` exists and `node_modules` does not.
- Seats start in `src/seat.ts:startSeat` (systemd scope, akrogon env, harness argv) with a 60 s start proof.

## Observation O1 (free, 2026-11-25, bun 1.4.5)

`git worktree add --detach <scratch> origin/main` in the akrogon repo, then `bun install --frozen-lockfile --backend=copyfile` twice. Result: fresh install "9 packages installed [6.00ms]" (warm bun cache), second run "no changes [0.00ms]", node_modules 48M. Cleanup: `git worktree remove --force`, path gone. Limits: warm cache only; the framework case in the lesson took 1.88 s for 804 packages; a cold cache or network failure is not measured.

## Forks

F1. When does setup run?
- a. Before every seat start in that worktree (idempotent; covers creation, a rebase or restack that changed the lockfile, a deleted node_modules, and worktrees created before the fix). Cost: one install call per seat start, milliseconds to seconds when nothing changed.
- b. Only when akrogon creates the worktree. Leaves worktrees created before the fix and lockfile changes after a rebase uncovered, so the lesson does not retire on every path.
- c. Creation plus every akrogon rebase site. More call sites to keep in sync; a new rebase site reopens the gap.
- A's pick: a. It removes the failure class at the one point where it hurts (a seat about to work).

F2. Where does it run relative to the home lock and the seat?
- a. In akrogon, right before the seat launch, under the dispatch lock. Simple and loud; a slow or hung install blocks all akrogon commands for its duration, so it needs a time bound.
- b. Inside the seat's own launch (`sh -c '<setup> && exec <harness>'` in the scope). Off the home lock, but a slow install races the 60 s start proof and a failure looks like a harness that exited.
- c. Outside the lock, before dispatch takes it. Needs a second pass structure and re-checks after the lock; more moving parts.
- A's pick: a, with a bound. Installs measured in milliseconds to seconds, and checks already run the same install under the same per-repo install lock.

F3. What does a failed or timed-out setup do?
- a. The seat does not start; the leaf's dispatch reports the error with the exit code and the setup output path, other leaves continue, the next pass retries. Matches how a red check is loud today.
- b. Start the seat anyway and warn. The seat then hits the same hook failure; this is the bug.
- A's pick: a.

F4. Which command and env?
- a. Reuse `setupCommand`'s install part (install lock, `setup`, `akrogon guard own-modules`) so checks and seats share one definition, run in the worktree with the env the seat gets.
- b. A separate dispatch-only command. Two copies drift.
- A's pick: a.

## Pitfalls

- P1. Holding the home lock through a network install hang: removed by a time bound on the call (value open: no named source yet).
- P2. A repo without `setup`: nothing runs; `own-modules` still refuses a repo with package.json and no node_modules (today's check behavior).
- P3. Consultant and direct terminals (`src/seat.ts:launch`) are not leaf seats; out of scope.
- P4. Lesson retirement: only F1a stops it on every seat path, so only F1a lets the leaf remove the LESSONS line and append `Applied`.

## Proof

Own test at the real boundary: a temp git repo registered in a fixture home with `setup` writing a marker (or creating node_modules), a leaf dispatched through the real allocate path with a fake hc; the seat start sees the marker. Deliberate break: remove the setup call, test red. A failing setup refuses the seat start and names the output path.

## Questions not settled by the intake

- The time bound's value and source.
- Whether merge's batch worktree or verify copies need anything (verify already runs setup).
