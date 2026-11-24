# Brief: orphan test processes (L5, flock-orphans 51a58e44)

Operator rule: less code is better code. Prefer removing the cause over adding a guard.

Facts (helper report, worktree /home/ivan/.akrogon/worktrees/akrogon/flock-orphans):
1. 72 orphan `flock -s <fixture>/.lock sh -c '<poll a release file>'` processes. Each sh loop forks `sleep 0.05` 20 times a second, forever, because its suite root is gone. 70 came from direct `bun test` runs in an agent terminal.
2. Sources: run-permit "killed holder or waiter" (56), "stop-run cancels a waiting run" (4), nested `inner` tests in abandoned-capture and durable-capture (2 per suite run).
3. Why the tests miss them: tests/fake-systemd-run.sh runs a scope's payload in place with no guard. killTree (tests/helpers.ts:141-150) kills the root first, then lists the dead pid's children, which have already moved to the subreaper. The inner tests write release-inner and call f.clean() at once, so the loop can miss the file.
4. tests/isolation.ts makes the worker a subreaper and sweeps descendants in process.on('exit'), which bun test never runs. That sweep is dead code.
5. Product code cannot leak these: a real run's payload sits in a scope with a guard (src/run-check.ts:419-440).
6. Boxed runs (`bun run test`, bdc34423, and verify's own service) already kill every leftover when the run ends. Direct `bun test` is still allowed when no user bus or another env var is needed.

Options:
- O1 (helper's commit, +52 -16): a new preload tests/sweep-preload.ts with afterAll(sweepSuite), so every test file's end sweeps all descendants. Repeated passes up to 10 s. Delete the dead exit handler. A regression test in isolation.test.ts runs nested bun test and checks no child survives.
- O2: fix the sources only. killTree lists descendants before it kills the root (or kills the process group). The inner tests wait for the payload to exit before f.clean(). Delete the dead exit handler. Rely on boxing for anything else.
- O3: delete the dead exit handler only, and rely on boxing. Leaks inside one run last until that run ends.

Question: which option, given less code and no leaking or flaky tests? Is there a simpler native option?

Answer briefly with a recommendation and its main risk in slots/sweep-B.md or sweep-C.md.
