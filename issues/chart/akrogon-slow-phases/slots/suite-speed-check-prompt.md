# Shape check: suite speed (late mechanism change)

Read only `issues/chart/akrogon-slow-phases/forks/suite-speed.md` and this file. Edit no repo file except your return file. Ask no questions.

Operator took 1a: concurrent tests, max concurrency 8, configured in `bunfig.toml`; the two shell.test.ts shared-console tests stay serial. Then 2a: 10-run measurement.

Measured 2026-10-02, bun 1.4.2, 32 cores, scratch worktree at fd1b175 with `test(` -> `test.serial(` at tests/shell.test.ts:10 and :42:
- `bun test --concurrent --max-concurrency=8`: 10/10 runs 353 pass, 15.0-15.8 s.
- bunfig `[test] concurrentTestGlob = "**/*.test.ts"` + plain `bun test` (bun default limit 20): 10/10 runs 353 pass, 10.2-10.8 s.
- bunfig glob + `bun test --max-concurrency=8`: 2/2 pass, 14.8 s. The flag applies on top of the glob.
- bunfig has no limit key. The bun 1.4.2 binary's bunfig [test] parser knows preload, onlyFailures, junit, coverage*, randomize, rerunEach, retry, concurrentTestGlob, pathIgnorePatterns. `maxConcurrency = 8` in bunfig was silently ignored (10.4 s).
- Load, 4 suites at once: limit 20, 2 rounds = 8 suites, 1 failure: next.test.ts:1571 "unknown directory population reserves all new capacity but allows existing tabs" hit bun's 5000 ms default per-test timeout (0.57 s when serial). Limit 8, 3 rounds = 12 suites, 0 failures. Wall time under load about 28-29 s for both limits.

A's proposed final shape:
- `bunfig.toml` gets `concurrentTestGlob = "**/*.test.ts"` so every plain `bun test` (seats, workers, ad hoc) runs concurrent at bun's default 20.
- tests/shell.test.ts:10 and :42 become `test.serial`.
- The configured gate keeps the limit: `issues/config.yaml` checks.test becomes `bun test --max-concurrency=8`. That is an operator edit on main, since leaves cannot touch issues/.
- Alternative the operator may pick: no limit anywhere (simplest, 10 s, one timeout seen in 8 loaded suites).

Write `issues/chart/akrogon-slow-phases/slots/suite-speed-check-<your slot>.md`: either "agree" or disagreements only, each with evidence (file:line, command output, doc). Max 12 lines.
