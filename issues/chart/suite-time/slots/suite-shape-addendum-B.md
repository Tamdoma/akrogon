# Suite shape addendum: slot B

2026-10-25. Own position under the operator correction. No repository implementation edits. No other consultant notes read. No whole-suite run in this addendum.

## Q1: systemic choice

### Pick, reason and cost

D6. My runner choice does not change: keep Bun and do not enable file parallelism yet. My implementation recommendation broadens beyond the timing trims. Test prebuilding the existing fake Herdr once per suite, alongside the agreed O1a/O1b/O1c group. It removes repeated loading and parsing of the fake's dependency graph without replacing its behavior or changing the workflow.

The evidence points below the test runner. A runner replacement leaves thousands of fake CLI launches, repeated Git fixtures, per-command file capture and deliberate deadlines in place. The Bun runtime itself starts cheaply in the small probe. Loading the fake and its dependencies costs much more.

Prebuilding is a candidate with measured local benefit, not proof of the full-suite target. In a temporary copy, the unchanged named-target test passed in both modes. Prebuilding cut its wall time from 34.78 s to 27.83 s, a 19.99% reduction before build cost. Child CPU fell from 46.42 s to 34.35 s, a 26.02% reduction. Building took 0.045 s. This is not a 20% full-suite result.

Keep the timing trims. The bytecode peer-wait file still took 22.74 s and used 197.12 CPU-seconds. Its original sampled run took 23.03 s and used 200.97 CPU-seconds. Those runs were not a controlled pair. Faster polling can simply fit more iterations inside the same real budget. Prebuilding does not remove that wait.

Cost: one build in the existing test preload and use of the built fake at eleven symlink sites across ten fixture files. The preload makes an eleventh touched file. Source stays the single maintained fake. Fresh output belongs in the existing suite scratch directory. No persistent cache, new runtime, service or dependency is needed.

### Rejected options

O10. Replace only bun:test with another runner: reject now. The measured parent runner used little sampled CPU. The expensive work ran below it. Changing assertion and scheduling libraries would leave that work in place and require porting Bun-specific test and isolation code.

O11. Replace the Bun runtime or rewrite the backend now: reject without comparative evidence. Existing code uses Bun.spawn, Bun.file, Bun.YAML and bun:ffi. A replacement might reduce some costs, but there is no measured replacement here that preserves subprocess, cleanup and timing behavior. The smaller bytecode change already improves the same fake source.

O12. Enable parallel files as the main fix: reject on the prior full-run evidence. It was 17.02% faster with two failures. More scheduling overlap does not remove repeated work. The operator correction permits revisiting it after its failures are understood.

O13. Build a persistent fake daemon: reject as the first step. It could avoid process startup and repeated database parsing, but adds IPC, lifecycle and shared-state isolation. Prebuilding is smaller and keeps one command invocation per observation.

O14. Cache or copy a Git seed as the first optimization: defer. tests/helpers.ts reconstructs a repository and bare origin with eight Git commands per fixture. Reusing an immutable seed could remove that construction class. Each fixture must still own its mutable repository and remote, with correct origin paths. The current measurements do not establish Git as the leading CPU cost.

O15. Remove file capture or replace Git CLI calls with a library now: reject without a focused proof. src/shell.ts uses file capture to avoid lost EOF/data from pipes under load. Removing it needs a passing regression for that failure. A Git library must preserve real worktree, locking and Git-config behavior. Neither change has a measured benefit in this consultation.

### Evidence: tier, source and date

F9. operator, 2026-10-25: the correction opens the backend stack while preserving leaf phases, seats, checks, verify and merge. The existing whole-suite wall target remains. It does not require a stack replacement.

F10. better-than-training, source and targeted runs, 2026-10-25: the named-target test constructs eighteen complete Git fixtures and makes twenty-one next CLI invocations, including the three worktree setup dispatches. The helper repeatedly initializes, configures, commits and pushes fresh local repositories. Each next invocation then performs real Git and fake Herdr calls.

F11. better-than-training, 10 ms /proc sampling plus child resource accounting, 2026-10-25: the named-target run took 41.25 s wall and 54.47 CPU-seconds. Samples observed at least 898 fake Herdr processes, 161 Git processes and 16 akrogon CLI processes. Sampled CPU included 22.00 s in fake Herdr and 0.20 s in the test parent.

F12. better-than-training, same method, 2026-10-25: peer-wait passed 37 tests in 23.03 s wall and used 200.97 CPU-seconds. Samples observed at least 3683 fake Herdr processes. Their sampled CPU total was 86.01 s, versus 0.16 s sampled in the test parent. These are lower bounds from samples. Short-lived processes and final CPU ticks can be missed. They are not a complete CPU allocation or a whole-suite profile.

F13. better-than-training, inspected code, 2026-10-25: fake-herdr.ts loads Zod and schemas from src/shell.ts, constructs its schemas, reads and validates its JSON database, logs calls, writes state and exits on each command. Idle/done agent waits can return immediately. Repeated polling therefore reloads this program inside real budget waits. Working waits already sleep for the requested timeout when no scripted entry overrides them.

F14. better-than-training, inspected code, 2026-10-25: each spawnFiles call creates a scratch directory and two capture files. finishCaptured reads both files and removes the directory after exit. This adds filesystem work per external command. The measurements include that cost but do not isolate its share. No syscall profiler was available.

F15. better-than-training, twenty sequential invocations per command, 2026-10-25:

| Work | Wall total | Child CPU total |
| --- | --- | --- |
| Empty Bun process | 0.039 s | 0.031 s |
| Bun importing src/shell.ts | 0.435 s | 0.550 s |
| Source fake Herdr pane list | 0.549 s | 0.743 s |
| Bundled bytecode fake pane list | 0.314 s | 0.380 s |

The fake build bundled 98 modules. The fixed-count bytecode probe used about 49% less CPU. The comparison includes schema initialization, JSON and file work, not just module loading.

F16. better-than-training, temporary-copy functional runs, 2026-10-25: source and bytecode versions both passed the named-target test with all 48 expects. The bytecode fake also passed all 37 peer-wait tests with 173 expects. Only the fake target changed in that copy. Production source and test assertions were unchanged.

Wall time goes into two different mechanisms: real deadline/budget waits and serial chains of fixture construction, CLI launches and external calls. CPU goes heavily into the repeatedly launched child tools in the measured hotspots. The earlier serial-per-file runner makes each file's longest path contribute to whole-suite wall time. Splitting one serial test overlaps work. Prebuilding reduces work per fake invocation. Shorter fixture budgets reduce how long polling continues. These effects cannot be added as independent percentages.

### Pitfalls and what removes them

R8. A faster fake can increase polling count before the same deadline. Keep O1a and verify both wall time and CPU. Do not claim that the microbenchmark's CPU ratio applies to peer-wait or the whole suite.

R9. A build can become a stale second source of behavior. Rebuild from the current fake source into the fresh suite scratch directory every run. Let a failed build fail the test run. Add no source fallback or persistent cache.

R10. Bundling may change module or executable behavior outside the exercised branches. Keep one source and all existing fake protocol/error assertions. Run the fake's affected consumers before a paired full-suite acceptance run. The current two targeted consumers are evidence, not complete coverage.

R11. Fixture reuse can leak mutable refs, state or remotes. If pursued, copy an immutable seed into private directories and keep each writable remote private. Share no live fixture between concurrent tests.

R12. Host activity and sampling overhead affect timings. The /proc runs included a Python sampler whose CPU is excluded from child totals but still loads the host. The temporary-copy comparison was sequential and uninstrumented. It was one pair on a shared host, not a repeated benchmark. Do not turn its ratio into a suite prediction.

### Question missing from the fork

Q5. Should the leaf trial the prebuilt fake alongside the already grouped timing reductions, with admission still based on at least 20% faster green whole-suite runs? It changes the mechanism under the tests, not the workflow. If it fails that proof, the local CPU gain alone does not meet this chart's wall-time target.

## Q2: location and worker count

### Pick, reason and cost

D7. Put the fake build and its scratch path in the existing isolation preload. Have the shared fixture helper and direct fake users symlink the same built executable. Keep one file worker and the existing within-file concurrency of 20. Keep checks, verify and merge commands as they are.

This reaches ordinary repository bun test calls through the existing bunfig preload, including configured checks and the package script. It avoids two diverging launch commands. The compiled fake retains its Bun shebang and uses the installed Bun. The CLI build was measured successfully. No assumption about an uninspected Bun.build API is needed for the design.

The existing scratch cleanup already owns generated artifacts. Use it. The design adds no separate cache-cleanup system. Its build cost must be included in acceptance timings.

### Rejected options

O16. Put the build only in checks.test or package.json: reject. Raw bun test calls would bypass it, or the fixture helper would need a fallback. The existing preload is the common entry point.

O17. Check generated JavaScript or bytecode into the repository: reject. That creates stale output and version maintenance. Fresh scratch output avoids both.

O18. Pick a larger file-worker count from CPU count: reject. The prior run failed at two workers. Per-file concurrency and overlapping suites multiply the subprocess load.

### Evidence: tier, source and date

F17. better-than-training, current configuration and fixture search, 2026-10-25: bunfig.toml already preloads tests/isolation.ts and enables concurrentTestGlob. There are eleven direct fake-herdr.ts symlink sites: the shared helper and peer-wait, peer-restart, peer-ask, peer-create, install (twice), door-reset, self-update, park and shell tests.

F18. better-than-training, installed CLI and artifact, 2026-10-25: Bun 1.4.4 build help exposes --target=bun and --bytecode. Building the fake into an output directory succeeded. The emitted JavaScript retained `#!/usr/bin/env bun` and executable mode 755. Scratch symlinks to it worked in both targeted consumers.

### Pitfalls and what removes them

R13. Building separately in every fixture recreates repeated work. Build once in the currently shared preload, export its path and reuse that artifact. Per-fixture mutable database files remain private.

R14. Future isolated or parallel files may evaluate the preload again. Reassess build frequency if the runner mode changes. D7 keeps the current mode and needs no new worker configuration.

### Question missing from the fork

Q6. Is the added test build step acceptable if its measured cost is included and all existing test entry points retain the same commands? This is the concrete tooling change supported here. No runner or production-runtime replacement has equivalent evidence yet.

## Command record

All test runs below were targeted. No whole-suite loads were added. All CPU totals use child user plus system time. Time from the measurement Python process is excluded.

1. C1. `bun test --timeout=30000 tests/next.test.ts -t 'named target equivalence'`: repository run, exit 0, 1 pass, 245 filtered, 48 expects, 41.25 s wall, 54.47 CPU-seconds. Sampled child groups are F11. End load 36.80 / 19.87 / 17.06.
2. C2. `bun test --timeout=30000 tests/peer-wait.test.ts`: repository run, exit 0, 37 pass, 173 expects, 23.03 s wall, 200.97 CPU-seconds. Sampled groups are F12. End load 41.28 / 22.04 / 17.84.
3. C3. `bun --eval ''`, `bun --eval 'await import("./src/shell.ts")'` and `bun tests/fake-herdr.ts pane list`: twenty invocations each, all exit 0, with a private FAKE_HERDR database for the fake. Results are F15.
4. C4. `bun build ./tests/fake-herdr.ts --target=bun --bytecode --outfile=<scratch>/fake-herdr.js`: exit 1 on both attempts. Error: cannot write multiple output files without an output directory. The first Python harness also exited 1 after propagating this error.
5. C5. `bun build ./tests/fake-herdr.ts --target=bun --bytecode --outdir=<scratch>/bytecode`: exit 0, 0.045 s, 98 modules, emitted JS and bytecode. `bun <scratch>/bytecode/fake-herdr.js pane list`: twenty invocations, all exit 0, results in F15.
6. C6. The C1 command in the temporary copy with the source fake: exit 0, 1 pass, 48 expects, 34.78 s wall, 46.42 CPU-seconds. Repeated after changing only the fake symlink to the built artifact: exit 0, 1 pass, 48 expects, 27.83 s wall, 34.35 CPU-seconds.
7. C7. The C2 command in that copy with the built fake: exit 0, 37 pass, 173 expects, 22.74 s wall, 197.12 CPU-seconds.
8. C8. `cat` read the addendum brief. `rg -n`, `sed -n`, `head` and `tail` located and read the permitted fixture, shell and dispatch code. `bun build --help` filtered by `rg` confirmed CLI options. These inspections exited 0. `command -v strace` found no executable. `command -v time` found the shell time command. No syscall trace was run.
9. C9. Python performed /proc sampling, child resource accounting, temporary-copy setup, log summaries, artifact inspection and ratio calculation. Successful harnesses exited 0 and retained individual child exits above. Python wrote and verified this return file and removed this consultation's temporary copy, generated bytecode, fixture database and measurement logs.

Recommendation: keep the agreed timing reductions and trial prebuilding the existing fake. The measured cost sits mainly below the test runner. Replacing the runner is not the supported first move.
