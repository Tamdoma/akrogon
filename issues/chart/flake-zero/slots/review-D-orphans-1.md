# Slot D flock-orphans review, round 1

**Verdict: fix** for `be39608a` on `e9158fe0`.

- **F1. The first durable-capture test can still orphan the same loop.** At `tests/durable-capture.test.ts:120`, teardown writes `release-durable` and cleans the fixture. I held the payload after it announced readiness and let it check for release only after cleanup. The test passed, but both `flock` and its shell were still running one second after Bun exited, before the enclosing service stopped. Make the blocking loops in both capture files run only while the fixture directory exists and the release file is absent. This handles every use of those helpers and lets the patch drop the new PID writer and waits. The same replay left no processes with the directory check.
- **N1. Minor, but it hides the startup failure.** When the inner payload exited before publishing its marker, both tests reported `pid-inner` ENOENT from cleanup. With the directory check and the new PID reads removed, both reported the original readiness timeout.

The rebase preserved the patch. Listing before the kill fixes the original reparenting order, and the dead exit sweep can go. On the reviewed head, 21 boxed tests passed. Another 25 focused test runs passed with no surviving poll loop in the service before teardown under ordinary timing. Five focused cases passed with the proposed capture change in a disposable worktree. I did not rerun full verify or the guards.
