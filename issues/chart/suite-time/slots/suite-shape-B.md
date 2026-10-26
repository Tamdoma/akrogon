# Suite shape: blind notes from slot B

2026-10-25. Own position. No implementation edits. Only this return file was written in the repository.

## Q1: how to reach 20%

### Pick, reason and cost

D1. Keep the grouped test reductions first: O1a, O1b and O1c. Do not enable file parallelism in this leaf on the evidence below. A two-worker full run was only 17.02% faster and introduced two failures. It fails both the speed target and the green-suite requirement.

D2. O1a should shorten fixture budgets, including both waits in the carried-exchange test. Keep the signal, status, exchange and outcome assertions. Do not change production idle grace. O1b should make the three owners by three working directories into nine separate tests. Keep all fixtures, comparisons and cleanup. Leave within-file concurrency at 20.

D3. O1c needs a demonstrated subprocess test boundary before it is promised. Both deadline cases must shrink to reduce file wall time. Keep proof that an actual deadline kills discovery and refuses dispatch. Do not add a production environment setting merely to speed tests. If no small boundary preserves that proof, bring that obstacle back to the operator. Do not silently drop the grouped part or weaken the 20% target.

Cost: O1a and O1b change two test files. O1c is unresolved and may need a test harness around the subprocess entry. The combined saving remains an estimate. This read-only consultation did not produce or measure an optimized suite.

### Rejected options

O1. Plain bounded file parallelism now: rejected. The measured command failed two tests and missed 20% even before accounting for those failures.

O2. Trims plus parallelism now: rejected. It adds runner compatibility and contention work before proving that the agreed test reductions are insufficient. Do not add its estimated saving to the trim estimate. They overlap.

O3. Unbounded `--parallel`: rejected. This host has 32 logical CPUs. Each worker can run 20 concurrent tests, so the default could permit roughly 640 test bodies at once within one suite. A two-worker run already exposed a short fixture-budget failure.

O4. `--parallel=2 --no-isolate` as an approved solution: not established. Small probes passed in both modes. There was no whole-suite measurement of this variant, so they prove neither its speed nor its reliability.

O5. Raising per-test timeouts or moving checks to merge: rejected. They are off route. A larger test timeout also does not repair an internal 300 ms collection budget.

### Evidence: tier, source and date

F1. operator, 2026-10-25: INTAKE.md groups O1a/O1b/O1c and requires at least 20% off whole-suite wall time with coverage preserved. The suite-speed fork, Taken and Proof of 3b, records the older runner decision. Check-scheduling, Taken, preserves when checks run. Neither lock authorizes skipping tests.

F2. better-than-training, live code, 2026-10-25: tests/peer-wait.test.ts supplies thirteen literal `11` budgets. Its carried-exchange test spends two of them before checking the completed original turn. The 300 ms last-status test is a separate existing short-budget case.

F3. better-than-training, live code, 2026-10-25: tests/next.test.ts still loops nine named-target cases serially. It currently has an explicit 60000 ms timeout. The opening map's claim that this test currently sits against 30000 ms is stale.

F4. better-than-training, live code, 2026-10-25: src/shell.ts fixes discovery at 10000 ms. tests/session-routing.test.ts has both a delayed session-discovery fixture and a pane-list wrapper that sleeps 12 seconds. The latter asserts `deadline 10000ms exceeded`.

F5. better-than-training, measurements on this host, 2026-10-25: baseline passed 1167 tests across 69 files in 200.96 seconds. Two workers ran all 1167 tests in 166.76 seconds, with 1165 pass and 2 fail. The ratio is 17.02% faster. The baseline's 20% threshold is 160.77 seconds. Run details follow below.

F6. better-than-training, failed-run output, 2026-10-25: `budget keeps the last status herdr returned` expected `working` and received null after 541.19 ms. `suite env is redirected: HOME, leaf-temp root, tmpdir and store resolve under the suite scratch` expected homedir under `/tmp/akrogon-suite-fKzOvZ` but received `/tmp/akrogon-suite-McTIBq/home`. These are different failure classes. The exact cause of the native environment mismatch was not isolated.

### Pitfalls and what removes them

R1. A shortened budget can expire before observing the intended branch. Keep branch-specific assertions and prove the fake was reached. Measure under overlapping runs before choosing the new fixture budget. Do not assume that replacing every 11 with 0.3 is safe.

R2. Shortening only the easy peer-wait cases leaves the double-wait case setting file wall time. Include that case and compare measured file wall time.

R3. Nine separate named-target fixtures can add contention. Retain the existing concurrency limit and require every case to pass. Keep the current explicit timeout unless changing it is independently needed.

R4. Parallel isolation changes how the preload is evaluated. tests/isolation.ts uses both process.env and libc setenv, plus process-wide subreaper and exit cleanup. Preserve its isolation assertions. The failed homedir assertion must be explained before adopting an isolated runner. The small probes below did not reproduce it.

R5. Shared host load can distort the comparison. Record whole-suite load, timing, counts and overlaps. Require paired green before/after runs for acceptance. One red parallel run is not a valid optimized result.

### Question missing from the fork

Q3. If the grouped trims cannot safely prove 20%, should the operator reopen the mechanism or keep investigating that group? Decide that explicitly rather than quietly adding runner changes or weakening the target.

## Q2: setting location and worker count

### Pick, reason and cost

D4. With D1, add no file-worker setting. Keep the current bunfig within-file concurrency and put the speed change in tests, so configured checks, package-script calls and raw `bun test` all benefit.

D5. If file parallelism is reopened, start with an explicit two-worker experimental cap. The smallest shared command is package.json `test`, with checks.test calling that script. Preserve the configured 30000 ms timeout. This costs two configuration edits, but raw `bun test` still bypasses that script. It does not satisfy a literal promise that every caller gets file parallelism.

### Rejected options

O6. checks.test alone: misses package-script and raw callers.

O7. package.json alone: the current checks.test directly invokes Bun, so it bypasses the script.

O8. A guessed bunfig parallel key: the permitted docs and installed help document a CLI flag, not a bunfig setting. Do not invent a silent configuration key.

O9. Starting worker processes from test files or the isolation preload: adds runner logic and cleanup responsibilities. Test-file changes can shorten work without becoming a test launcher.

### Evidence: tier, source and date

F7. better-than-training, live configuration, 2026-10-25: checks.test is `bun test --timeout=30000`; package.json test is `bun test`; bunfig sets root, isolation preload and concurrentTestGlob. tests/isolation.ts does not call setDefaultTimeout. The older fork's preload timeout description is not the current implementation.

F8. better-than-training, Bun team primary documentation and installed Bun 1.4.4 help, 2026-10-25: `--parallel=N` runs file workers and implies isolate. `--no-isolate` retains a worker's global/module state across files. The existing concurrentTestGlob controls concurrency within files. Source: https://bun.com/docs/test/parallel .

### Pitfalls and what removes them

R6. A script change can be described as universal while existing raw commands still bypass it. Either keep the optimization inside tests, as D4 does, or explicitly define and migrate the canonical entry point before claiming universal adoption.

R7. Worker count multiplies concurrent tests and overlapping suites. Use an explicit bound, then prove it under relevant overlap. CPU count alone is not a safe worker choice for subprocess-heavy tests.

### Question missing from the fork

Q4. Does “every caller” include unchanged raw `bun test` commands? If yes, a package-script-only solution cannot meet that condition with the documented controls inspected here.

## Commands and measurements

All commands ran from /home/ivan/Work/infra/akrogon. Wall time includes process exit and cleanup. Loads below are 1/5/15-minute averages.

| Command | Result | Wall | Load before | Load after |
| --- | --- | --- | --- | --- |
| `bun test --timeout=30000` | exit 0, 1167 pass, 0 fail, 69 files, 11714 expects | 200.96 s | 19.34 / 37.04 / 19.81 | 23.99 / 27.38 / 19.05 |
| `bun test --timeout=30000 --parallel=2` | exit 1, 1165 pass, 2 fail, 69 files, 11708 expects | 166.76 s | 19.21 / 26.15 / 18.78 | 45.13 / 43.44 / 27.17 |
| `bun test --timeout=30000 --parallel=2 tests/check-names.test.ts tests/isolation.test.ts tests/test-files.test.ts` | exit 0, 5 pass, 0 fail, 3 files | 0.253 s | targeted probe | targeted probe |
| `bun test --timeout=30000 --parallel=2 --no-isolate tests/check-names.test.ts tests/isolation.test.ts tests/test-files.test.ts` | exit 0, 5 pass, 0 fail, 3 files | 0.255 s | targeted probe | targeted probe |

Baseline: 19:26:15–19:29:36 UTC. Parallel: 19:29:48–19:32:34 UTC. The host was shared. A separate `bun test --timeout=30000 tests/next.test.ts` process was observed near the baseline's end and may also have overlapped the parallel start. No other whole-suite process was observed in those samples. That does not rule out overlap between samples or other host work. These are single runs, not a controlled repeated benchmark. The probes do not establish a whole-suite fix.

Inspection command record, repeated invocations grouped: `cat` read the brief, intake, allowed maps/debates, prior suite-speed decision, check-scheduling decision, config, bunfig, package.json, isolation preload and src/test-files.ts. `sed -n` extracted Chart issues Shared context/Open, questions Blind peer exchange/Research, the fork Question/Carries, and the cited test/source bodies. `rg -n` located headings, budgets, deadlines, runner options and callers. `rg --files` inventoried the permitted tests/src/check-reruns trees. These commands exited 0. `bun --version` returned 1.4.4. `bun test --help` and its option-filtered form exited 0. `ps -eo ...` with `rg`/`head`, and Python process samples, established the overlap limits above and exited 0. Python timing harnesses, log inspections and ratio calculation exited 0, while preserving the individual test exits in the table. The web open of the permitted Bun page succeeded. Python wrote and verified this return file and removed this consultation's temporary measurement logs.

Recommendation: trim the agreed tests first. File parallelism has not met either acceptance condition in this consultation.
