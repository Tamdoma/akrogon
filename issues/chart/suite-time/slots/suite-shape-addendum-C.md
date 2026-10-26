# Slot C addendum: suite-shape under the systemic correction

Date: 2026-10-25. This addendum re-answers Q1 and Q2 with the stack open and the workflow fixed. All measurements are single-file or small targeted runs on this shared host, bun 1.4.4. Load was high for much of this work (the other consultant was running suites), so wall times here compare shapes, not absolute seconds. My earlier notes are in suite-shape-C.md.

## Where the time actually goes

The suite is not one program doing work. It is layers of processes:

- Layer 1: one `bun test` process, 69 files one after another, up to 20 tests at once inside a file.
- Layer 2: tests spawn the real CLI as `bun src/akrogon.ts ...` through the `cli()` helper in tests/helpers.ts. There are 976 spawn call sites in the test files, and loops make the runtime count higher.
- Layer 3: each CLI run spawns git, herdr, and shell helpers per question it asks. In tests, herdr, gh, and systemctl are fakes, but each fake is still a fresh bun process (tests/fake-herdr.ts starts with `#!/usr/bin/env bun`).
- Layer 4: fixtures and flows create and delete whole git repos, bare remotes, and worktrees per test, under /tmp.

Cost classes, in the order I now rank them:

- K1 CPU in the process tree. tests/next.test.ts alone: 69.8 s wall, 470 s user CPU, 164 s sys CPU (one run, load about 7 at start). tests/phase.test.ts: 2.2 s wall against 28.9 s total CPU, of which 8.1 s sys. Sys time is process creation and file churn. This class is why wall time responds to more cores and why a busy host hurts so much.
- K2 Same small questions asked as fresh processes, over and over. A logging git wrapper counted 3057 git spawns in tests/phase.test.ts (67 tests): 390 `git rev-parse --git-common-dir`, 319 `git rev-parse HEAD`, 126 `git diff`, 108 `git diff --shortstat`, 108 `git diff --name-only`, 110 `git merge-base`. src/ has 167 git call sites. Most of these come from akrogon itself, not from test setup.
- K3 Deliberate waits. The peer-wait 11-second budgets and the two 10-second discovery waits. Wall time with near-zero CPU. The trim work (O1a, O1c) is the only thing that removes these.
- K4 Serial file order. 69 files run one after another, so one file's wall time is suite wall time. The slowest file also sets the floor under any file-parallel run.
- K5 Startup per spawned bun process. Measured medians, 10 runs each: empty bun 2.6 ms, `bun src/akrogon.ts --help` 21.1 ms, `bun tests/fake-herdr.ts` 18.6 ms, `git --version` 0.3 ms (load about 3.5). Real but small per call. It adds up only through K2's count.
- K6 Fixture setup. `fixture()` in tests/helpers.ts runs 8 git spawns in a row (init, two config, add, commit, bare init, remote add, push). Measured median 13.8 ms per call over 10 calls, and there are 436 call sites. Under the git wrapper, tests/status.test.ts showed 42 fixtures times 8 spawns equals 336 of its 497 git spawns. Noticeable, not dominant.
- Not a cost class: disk. /tmp is tmpfs on this host, so fixture churn is RAM speed already. The test runner itself is also not a class: the work sits in the spawned tree, not in bun test.

## Q1: trim, parallel, or both — systemic answer

### Pick

My pick does not change. Both: trim first (O1a, O1b, O1c), then `--parallel=4 --no-isolate` in the `test` check. Same order, same three-stage measurement as my first notes.

One addition, as a follow-up and not part of this fork's target: a spawn-count reduction pass in src/. Akrogon asks git the same questions many times in one run (K2). Resolving per-repo facts once per CLI run and combining the three diff variants into fewer calls would cut CPU in the suite and in real use. I do not claim a percentage for it. It needs a per-command spawn count before it can carry any target.

Reason the pick stands under the correction. No stack change I tested or priced removes K1 to K4 better than the current pick. Parallel is the only lever that uses idle cores against K1 and K4 today. Trim is the only lever that removes K3. The classes a stack change could touch (K5, part of K2) are either small per call or unmeasured.

Cost. Unchanged from my first notes, plus one risk I state plainly now: parallel does not cut total CPU at all. If the fleet later runs more suites at once, K1 and K2 become the binding cost and the parallel gain shrinks. That is a reason to do the follow-up, not a reason to swap this fork's pick.

### Rejected options

- Replace the runner (for example Vitest or node's test runner). Rejected. The cost is in the spawned tree under the tests, not in bun test. A new runner still spawns the same CLI, git, and fakes, and would need the same file-parallel choice. It also breaks bun-only test code (Bun.YAML, Bun.spawn, the FFI calls in tests/isolation.ts) for no measured gain.
- Compile akrogon and the fakes with `bun build --compile` and spawn the binaries. Rejected on measurement. Under the same load (about 34), compiled akrogon `--help` median 31.6 ms against 30.4 ms from source; compiled fake-herdr 18.6 ms against 30.7 ms from source, with overlapping ranges. Each binary is 87 MB. No cost class is removed: the bun runtime and module evaluation run either way. I deleted both test binaries.
- Rewrite the CLI in a compiled language such as Go. Rejected for this fork. It would cut K5 startup from about 21 ms to a few ms per spawn and lower per-process CPU, but git and herdr spawns (K2) and the waits (K3) stay. The price is rewriting 43 source files, 11155 lines, plus the skills scripts, with behavior risk across the whole workflow. The measured classes do not justify it against a 20% suite target.
- Call the CLI in-process from tests instead of spawning it. Rejected. It removes K5 and part of K1, but the process boundary is part of what these tests prove: exit codes, env handling, signals, orphan sweeping in tests/isolation.ts. In-process calls also leak module and env state between tests. That trades coverage for speed, which this fork forbids.
- A long-lived akrogon daemon that tests and seats talk to. Rejected here. It would remove startup and repeated state scans, but it adds a stateful service under a workflow built on stateless CLI calls, with new stale-state and lifecycle failure modes. Nothing measured says the suite needs it to hit 20%.
- Cheaper fixtures: build one template repo and copy or clone it per test. Rejected as a main lever on measurement. `fixture()` costs a 13.8 ms median. Even removing most of it saves single-digit seconds of CPU across the suite, and a template copy risks shared git state between tests. Fine as cleanup someday; it carries no target.
- Giving akrogon a test-only herdr transport (for example a socket to a fake held by the test process) to kill the per-call bun fake. Rejected for now, same shape as the O1c seam risk: production code grows a path only tests use, and I have no count of fake-herdr calls per suite to price it. It becomes interesting only if a spawn count shows fakes near the top.
- Trim only, or parallel only. Still rejected, for the reasons in my first notes.

### Evidence

- E1 (measured here, 2026-10-25) Process-tree shape: `time bun test --timeout=30000 tests/next.test.ts` gave 69.8 s wall, 470 s user, 164 s sys, load 7.24 before and 37.41 after. `tests/phase.test.ts` gave 2.2 s wall, 20.9 s user, 8.1 s sys, load 3.38 before.
- E2 (measured here, 2026-10-25) Git wrapper count: `PATH=/tmp/addC-bin:$PATH bun test --timeout=30000 tests/phase.test.ts` logged 3057 git spawns with the top entries listed in K2. Same method on tests/status.test.ts logged 497 spawns, 156 of them `rev-parse --git-common-dir` and 336 from fixture setup. Wrapper and logs deleted after counting.
- E3 (measured here, 2026-10-25) Startup medians in K5, 10 runs each, load about 3.5. One real `cli(status)` call against a fixture: 64 ms median over 5 calls; `cli(next)`: 72 ms. Both errored on my hand-built leaf, so they price startup plus early work only, not a full dispatch.
- E4 (measured here, 2026-10-25) Compiled-binary check in the rejected list: `bun build --compile` on src/akrogon.ts and tests/fake-herdr.ts, startup compared back to back under load about 34. Binaries deleted.
- E5 (code read here, 2026-10-25) tests/helpers.ts: `fixture()` runs 8 serial git commands; `cli()` spawns `[process.execPath, entry, ...args]` with a per-fixture env. tests/fake-herdr.ts, fake-gh.ts, fake-systemctl.ts all run under bun shebangs and two of them import zod. src/config.ts `commonDirectory` spawns `git rev-parse --git-common-dir` per call, and src/next.ts calls it per repo and per path.
- E6 (from my first notes, 2026-10-25) Quiet-host pair: 198.3 s serial against 86.3 s with `--parallel=4 --no-isolate`, same test and expect() counts. That is the wall-time basis of the pick. Nothing in this addendum replaces it.

### Pitfalls

- P1 Counting spawns is not measuring cost. K2's counts are real, but a git spawn costs about 0.3 ms at minimum and more with repo work. Removing half the spawns may save far less than half the time. Removed by: price any spawn-reduction work with a before and after CPU total (`time` user plus sys) on the same files, not with spawn counts alone.
- P2 Caching git answers inside one CLI run can go stale. Akrogon writes state and moves git refs during a run, so a cached HEAD or common-dir can be wrong by the end. Removed by: cache only facts that cannot change during the run (common-dir per repo path), and keep fresh reads for refs that the run itself moves.
- P3 Chasing K1 with more parallelism has a ceiling on a shared host. CPU total does not drop, so other leaves pay. Removed by: keep the worker cap at 4 and the load-case proof from my first notes; treat any later worker increase as a new decision with fleet-level numbers.
- P4 A stack swap done for the suite can quietly change the product. A daemon, a test-only transport, or in-process calls all change what production runs. Removed by: keep this fork to test files plus the check command string, and let any src/ change justify itself on real CLI runs, not only on suite time.

### Questions the fork does not ask

- X1 What is the full-suite spawn census: how many git, akrogon, herdr-fake, and shell processes does one whole `test` check create, and what share of user and sys CPU does each kind take? I have it for git in two files only. That census is the price tag for every systemic option above, and it is cheap to collect with wrappers like E2.
- X2 Does the operator want the follow-up spawn-reduction pass in src/ charted now, while the counts are fresh, or only if this fork misses its target? It helps real CLI speed too, but it is product-code work with no measured percentage yet.
- X3 My first notes asked whether the 20% is judged quiet or under fleet load. The systemic view sharpens it: under load, K1 CPU is the wall. Is there a fleet-level budget, such as total CPU per verify, that this suite should also report?

## Q2: where the parallel setting lives, and how many workers — systemic answer

### Pick

Unchanged. `checks.test` in issues/config.yaml: `bun test --timeout=30000 --parallel=4 --no-isolate`. Four workers.

The systemic view adds one supporting fact: the check string is the one place that defines the whole process tree the suite is measured on. Every stack option I rejected would also have landed as a change to what that string ultimately runs, or to code under it. Keeping the setting on the measured command keeps proof and product behavior tied together.

### Rejected options

- Same rejected homes as my first notes: bunfig.toml (no key exists; an unknown key is silently ignored), package.json script (verify does not flow through it), test files or preload (process layout is already fixed by then), default worker count of one per core.
- A wrapper script or new runner binary that owns the parallel setting. Rejected. It adds a process and a file to own one flag, and the check string would still have to name it. The string in issues/config.yaml already is the owned place.
- Setting workers from core count at runtime (for example a shell expression in the check string). Rejected. The check string runs through akrogon's own quoting and receipt matching; a computed string makes receipts and repro harder for a gain no measurement here supports. Four is measured on the host that runs the fleet.

### Evidence

- E7 (code read here, 2026-10-25) Same live surface as my first notes: issues/config.yaml carries the timeout, package.json does not, bunfig.toml carries root, preload, and concurrentTestGlob only.
- E8 (measured here, 2026-10-25) The per-file CPU shape in E1 supports a low worker cap: one file already spreads to about 9 to 13 times its wall time in CPU with within-file concurrency. Four files at once can fill this 32-core host without help from other leaves.

### Pitfalls

- P5 Worker count and within-file concurrency multiply. Four workers times 20 concurrent tests times their spawned children is the real process count. Under fleet load that is what hit test timeouts in my first notes. Removed by: the same load-case proof, and by not raising workers without re-running it.
- P6 If a later fork does the src/ spawn-reduction pass, the right worker count may change, since each file would carry less CPU. Removed by: re-measure C5's shape after that work instead of assuming 4 stays right.

### Questions the fork does not ask

- X4 Should the check string also record a `--timings` file so parallel starts slow files first? Asked in my first notes; still open. The systemic view does not change it.

## Bottom line

The correction widens the search, and the search comes back with the same pick. No runner swap, compile step, or rewrite removes a cost class that trim plus capped parallel leave behind, at anything near this fork's price. The one real class my pick leaves is K2, repeated process-per-question calls inside akrogon itself. That is product work with its own proof burden, worth a follow-up census (X1), not a change to this fork's answer.
