# Merged map: akrogon slow phases

## Measured
- `bun test` is 80-84 s; `tests/next.test.ts` is 64-66 s of it (148 tests, about 0.4 s each, no single slow test). format 0.7 s, typecheck 1.1 s. (A,B,C)
- `bun test --concurrent`: 9.7 s, 351 pass, 2 fail, both in `tests/shell.test.ts` (shared console mock). `--parallel` alone: 63 s. One run each. (C)
- The suite uses one core (109 s CPU for 80 s wall on 32 cores) and slows to 110-160 s when leaves overlap. (C)
- `test_changed` (`bun test --changed`) selects nearly everything because next.test.ts imports most of src: 81.85 s vs 83.40 s full in leaf-temp-dir merge, run back to back, 165 s total. (A,B)
- Implement since 09-25 (old pi setup, 454 min): workers 57%, parent model/orchestration 26%, parent checks 16%; checks including worker checks about 23%. (B; C 59/27/14)
- Current Claude seat implement (2 leaves only): checks 66% of pass time. (C)
- Merge (119 min): check runs 62%. One full suite sets the floor of every merge. (B; C 63% before the swap)
- Four merge test commands were killed by a 120 s tool timeout and restarted, about 8 min lost. (B)
- Small leaves still use workers: `implement: subagents` (`issues/config.yaml:6`) and one unit still gets a worker (`skills/implement-issue/SKILL.md:49`). realistic-review-bar (20-line prose) spent 21 of 30 min in a worker, though 11 min of that was required fresh-agent acceptance proof. (B,C)

## Forks, in order
1. suite-speed: make the suite run in about 10 s with `--concurrent` (shell.test.ts kept serial), after repeated runs prove no flakes; or split next.test.ts and use `--parallel`; or leave it. Reshapes 3 and 4. (A,B,C want a speedup; C and A favor concurrent, B wants an isolation audit and a small concurrency bound first)
2. small-leaf mode: inline implementation for small akrogon leaves vs workers always. B recommends inline now; C waits for 5-10 Claude-seat leaves. Note: `issues/config.yaml` is an operator edit on main, a leaf cannot change it.
3. duplicate changed-tests gate: drop `test_changed` from `checks` when the full suite runs anyway (B); irrelevant after fork 1 (C). Operator config edit.
4. check lifetime: stop killing 120 s test commands (B); irrelevant after fork 1 (C).

## Practitioners and docs (read 2026-10-02)
- Bun docs, test configuration and parallel pages: `concurrentTestGlob` migrates a suite to concurrent gradually; `--parallel` isolates per file.
- hydrozoa PR 768 (2026-09-28): skip tests on a tree that already passed, safe failure mode. Off route under the check-reruns lock.
- Anthropic, multi-agent research system (2025-06-13): most coding tasks have little real parallelism, multi-agent uses about 15x tokens. Anthropic harness design (2026-03-24): simplify one component at a time and check quality.
- LangChain deep agents harness post: max reasoning scored lower than high because of timeouts.

## Pitfalls
- Concurrent tests with shared mocks or process globals flake; timing asserts like `tests/shell.test.ts:28` (1500 ms) may flake under load. (B,C)
- Speed must land in `bunfig.toml` or test files so every seat and worker gets it without skill edits (`bunfig.toml:1-2`). (C)
- More cores per run means more contention with `max_active: 12`; gain under load is smaller than 8x. (C)
- Keep criterion proof, real CLI/git fixtures and every configured check (check-reruns lock). (B)
