# Design: fewer-repeat-calls

## Binding decisions, verbatim

### Reuse (issues/chart/git-calls/forks/reuse.md, Taken)

A's pick under autopilot, 2026-10-26: `1b 2a 3a 4a` (operator values: removing over adding, simplicity, speed).

- 1b: remove herdr repeats at the caller. A value read once in one step is passed down; the new pane's shell pid is read once (C R3). Each removed re-read names the quantity it proved. Reads right before an action (the pane check before a prompt in dispatchSlot) and polls that expect outside change stay fresh. Rejected 1a: a cache cleared on writes misses `run(herdrArgv(...))` writes (B1) and outside agent changes, so it guards staleness instead of removing it. Rejected 1c: the real tool gains nothing. Standing dissent C R2: 1b removes fewer repeats than 1a; the proof fork's bar judges it.
- 2a: read the registered root's common dir and remote url once per run, successes only; remove a second branch-tip read only inside one decision; fetch sites unchanged. Rejected 2b: keeps about 960 root layout repeats. Rejected fetch-once: breaks finishPush (B5). tests/config.test.ts commonDirectory assertions stay unchanged (B3).
- 3a: tests/fake-proc.ts uses `Bun.CryptoHasher` instead of `node:crypto` (same digest), and the fake busctl is bundled like the fake herdr. Rejected 3b: leaves 3.5 ms in every fake herdr call. fake-gh and fake-systemctl are not in the census and stay as they are.
- 4a: no committed census harness and no broad call-count ceiling. Each removed duplicate is proven by a targeted assertion in the existing test of that behavior, reading the fake's call log inside the test body before fixture cleanup (B6; corrected after leaf review B10, C F2, 2026-10-26). No suite-wide count report: fixture cleanup deletes the logs. Rejected 4b: a count ceiling fails on harmless changes. Standing dissent C R4: the method could be lost; it is kept in slots/census-A.md.
- Binding avoidance: no `pane list`, `tab list` or `workspace list` answer is kept across a herdr write, prompt or wait; no git ref fact is kept; the registered root's common dir and remote url are kept for the run because no akrogon write changes them (worktree writes change worktree metadata, and src has no remote write) (corrected after leaf review B12, 2026-10-26); a pane's shell is kept as its observed (pid, start) identity and a changed start is refused (B8); every removed read is named with what it proved; fake pids and slice names stay byte-identical to the base.

### Proof (issues/chart/git-calls/forks/proof.md, Taken)

A's pick under autopilot, 2026-10-26: `1a 2a 3a` (operator values: function over form, speed).

- 1a: in one session, alternate 10 two-at-once pairs on the fix head with 10 on the base, recording start load per pair. The head has more fully passing copies than the base, and the re-entering test's slowest duration on the head is below the base's in the same session. Every suite result kept. Amended by the operator 2026-10-26 (O2, replacing "all 20 head copies green"): batches c5r, c5r2 and c5r3 showed two copies at once failing on both revisions on this 32-core host (c5r2: head 12 of 20 copies green, base 0 of 20; per-test 15 s caps under start load 10-75), so all-green is not reachable by this leaf; a complete batch already run on the current head counts. Rejected 1b: no same-session evidence that the host was loaded enough. Rejected 1c: about 24% luck at 5 pairs. Standing dissent B7: wants 20 busy pairs; answered by 20 head copies plus base pairs.
- 2a: three at once recorded only, fail counts for head and base. Rejected 2b: the operator accepted three at once red under O1 (issues/chart/suite-time/forks/suite-shape.md) and named the two-at-once fail. Standing dissent B7: three-suite bar.
- 3a: three alternating solo full-suite runs each; head median user plus sys below the base median, spread reported. Call counts are proven per removed read under Reuse 4a, not as a suite total (corrected after leaf review B10, C F2, 2026-10-26). Rejected 3b: guessed cap refused by shapes.md and withdrawn by C.

### Locks carried from chart suite-time

- No per-test timeout raises (operator "2 no"), no `--retry` or `test.serial`, no removing tests.
- F29: the re-entering merge test keeps its causal sequence (issues/chart/suite-time/slots/load-tests-rebuttal-B.md).
- The workflow stays the same; the backend may change only where the workflow does not (operator 2026-10-25, issues/chart/git-calls/INTAKE.md).

## Standing design

/home/ivan/.akrogon/releases/e48585a5d197b50114cafa685a759367dab89973/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: no auth, secrets, browser or model stage is involved. Criteria 1 to 3 are proven at the real CLI boundary by targeted assertions in the existing tests of each behavior (scope checks and adoption in tests/seat-containment.test.ts, dispatch observation in tests/next.test.ts, `commonDirectory` in tests/config.test.ts), reading the fake herdr `.calls` log or git's observable spawns inside the test body before fixture cleanup (A,B,C). These are the done-criteria's own proofs, not a broad call-count ceiling (Reuse 4a), and each changed existing test file carries its `Test-Change:` trailer. A test that today asserts a removed read is corrected with a cited criterion, never deleted wholesale. Criteria 4 to 6 are cost criteria against a base measured on the same host with before and after recorded, with no wall-second or CPU-second cap. Criterion 5 runs the repo-wide `test` check because the property is whole-suite run time under a second suite's load. Its proof invokes the existing runner and builds nothing (A,C): each pair is one `akrogon run-check` of a shell line that starts the configured `test` command in two checkouts with `&` and `wait`. The seat repeats it per pair, and start load comes from `uptime`. Base checkouts are worktrees at the base prepared with the configured `setup` command (`bun install --frozen-lockfile`) under the implement-issue setup lock (C F5).

## Leaf architecture

Owned surfaces:

- src/scope.ts: `shellPid`, `shell`, `adoptShell`, `inOwnScope`. A pane's shell is read once as `Shell` (pid, start). `adoptShell` and the post-adoption checks take that identity instead of reading herdr. `inOwnScope` reads /proc start and cgroup fresh and refuses a start that differs from the identity, so a recycled pid is never adopted or accepted (A,B).
- src/next.ts: the recorded-pane scope check in dispatch before boxing (it closes a pane reported outside) and `box`, both reading the shell identity once and passing it (A,C). Also the observation readers that call `panes`, `tabs` and `workspaces` from src/shell.ts, and the repeated `git rev-parse --git-common-dir` reads at the registered root.
- src/shell.ts: `panes`, `tabs`, `workspaces` and `herdr` keep their behavior, and no cache is added at `herdr()` (Reuse 1b).
- src/config.ts `commonDirectory` and its root comparisons, and the root remote url reads in src/preflight.ts and src/pull.ts: the registered root's common dir and remote url are read once per run, successes only.
- Any src module where one decision reads the same branch tip (`rev-parse HEAD`, `rev-parse --verify`) twice with no git write between (A,C).
- tests/fake-proc.ts `shellPid` and `expectedSlice`: `Bun.CryptoHasher('sha256')` replaces `createHash`, and the `node:crypto` import is removed. `expectedSlice` must keep matching product `leafSlice` in src/scope.ts, which stays on `node:crypto` (A,B,C).
- tests/isolation.ts and tests/helpers.ts: the fake busctl gets a per-worker bytecode bundle built the way `fakeHerdrBin` is, and `fakeHerdr()` links `busctl` to it.
- tests/seat-containment.test.ts, tests/next.test.ts and tests/config.test.ts: targeted assertions for criteria 1 to 3 only (A,B,C).

Consumers of changed state:

- `dispatchSlot` and the prompt path in src/next.ts read `currentPane` right before `agent start` and `agent prompt`. Those reads stay fresh (criterion 2).
- The recorded-pane scope check in dispatch closes a pane it finds outside its scope. It keeps that behavior with the identity read once (C F3).
- `finishPush` in src/phase.ts fetches after a push to see whether it landed. Fetch sites are unchanged (Reuse 2a, B5).
- Worktree writes in src/next.ts `ensureWorktree` and `createSparseWorktree` change worktree metadata only. The root identity stays valid across them (B12).
- tests/config.test.ts `commonDirectory` calls over four distinct cwds keep spawning git once each, and their failure messages keep the cwd (B3, B11).
- Tests that expect fake shell pids import `shellPid` from tests/fake-proc.ts, so they cannot detect a digest change. Criterion 4's recorded base comparison covers that (C F1). The slice name is cross-checked against product `leafSlice` by existing tests.
- `box` in src/next.ts throws when a pane is unreadable or still outside its scope after the 5 s adoption deadline. That condition and its error text stay.

Report duties: the implementation report records three-at-once fail counts for head and base (Proof 2a, C F4), every removed read with the quantity it proved and the earlier read that now supplies it (Reuse 1b), and criterion 5's per-pair start load and durations.

Exclusions: fake-gh and fake-systemctl stay as they are. akrogon's own source is not bundled or compiled, because a bytecode bundle of src/akrogon.ts fails on top-level await (C D7). There is no fetch-once, no central herdr cache, and no change to test timeouts, retries, serial marks or the test count.

Open for the plan: which `panes`, `tabs` and `workspaces` callers in one `akrogon next` pass repeat an answer with no herdr write, prompt or wait between them, and how each earlier answer reaches the later reader. Census: per process across tests/next.test.ts, 1,311 of 2,715 pane list calls and 387 of 1,246 workspace list calls repeat.

Open for the plan: where the once-per-run root identity lives, given src/config.ts already resolves registered repos and src/next.ts compares common dirs per root, and which callers read the root remote url more than once. Census: 343 repeats, all at the registered root.

Open for the plan: which branch-tip reads repeat inside one decision. Census: 503 `rev-parse HEAD` and 446 `--verify` repeats at the root per process, most of them across decisions that must stay fresh.

Open for the plan: how the re-entering test's duration is read from the runner output for criterion 5, and the measurement command for criterion 4's per-call times.
