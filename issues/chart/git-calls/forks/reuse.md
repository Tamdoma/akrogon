# Which repeated calls to remove, and how

## Question

Q1. herdr reads inside one akrogon process: where should repeated reads be removed?
- 1a: a per-process read cache at the `herdr()` choke point in src/shell.ts; only named read verbs (`pane list`, `pane get`, `pane process-info`, `tab list`, `workspace list`, `session list`) are cached by argv plus session; any other herdr argv clears the whole cache before it runs; named poll sites that expect outside change are exempt (C).
- 1b: no cache; remove repeats at callers only where one observation step already holds the value, passing it down (B).
- 1c: leave herdr calls as they are and only make the fake cheaper.

Q2. git inside one akrogon process: which facts may be reused?
- 2a: memoize layout and config facts (`rev-parse --git-common-dir`, `--git-path`, `--show-toplevel`, `remote get-url`) per process by cwd and args, successes only, cleared when a `worktree add/remove/move` or `init` passes through `run()`/`command()`; ref facts (HEAD, `--verify`, merge-base, worktree list) stay fresh; plus caller-level duplicate removal where one decision reads the same ref twice (B D2, C D3).
- 2b: caller-level duplicate removal only, no memo.
- Sub-question 2c: fetch at most once per (repo, remote) per process (C D4), or keep today's fetch sites (B).

Q3. Test fakes: bundle `tests/fake-busctl.ts` like the fake herdr (B, C agree); fake-gh and fake-systemctl only if a census shows they matter.

Q4. Split and guard: a committed census harness and a spawn-count ceiling test as leaves (C L1, L6), or measurement only in each leaf's report (B).

### Carries

- Operator 2026-10-25: workflow stays; backend stack replaceable if it improves things without changing the workflow (INTAKE.md).
- Operator 2026-10-26: "o2, consult with both conultants on this, and fix it on autopilot. Do proper testing." O2: "Run the git-calls chart. It cuts the repeated git calls inside akrogon. That speeds up every test and the real tool, not just this one."
- Chart suite-time locks: no per-test timeout raises (O5 "2 no"), no --retry or test.serial, no removing tests; F29 keeps the re-entering test's causal sequence (issues/chart/suite-time/slots/load-tests-rebuttal-B.md).
- C P2 (2026-10-25): akrogon moves refs during a run, so only run-fixed facts may be reused.
- Related: forks/proof.md.

## Findings

Sources: slots/census-A.md, slots/map-A.md, slots/map-B.md, slots/map-C.md.

- Census (A, better-than-training, 2026-10-26): per akrogon run in the failing test about 300 ms wall; fake herdr about 160 ms, git about 32 ms, rest bun start, module load and logic. Full suite: 17.7k fake herdr calls, 29k product git calls, 13k test git calls, 938 fake busctl runs from source.
- Repeat rate (A, better-than-training, 2026-10-26, tests/next.test.ts, per akrogon process): herdr 10,143 calls in 516 processes, 3,354 (33%) exact repeats with no herdr mutation between them (pane process-info 1,428 of 2,290; pane list 1,311 of 2,715; workspace list 387 of 1,246). git from akrogon 11,147 calls, 2,161 (19%) exact repeats with same argv and cwd (git-common-dir 616 of 1,371; rev-parse HEAD 535 of 1,075; --verify 447 of 997; remote get-url 342 of 737). Median 22 herdr calls per process, p90 29. A typical new pane reads `pane process-info` three times: src/scope.ts inOwnScope, adoptShell, then inOwnScope again after placement.
- Unit costs (C, better-than-training, 2026-10-26): fake herdr bundle `pane list` 10.1 ms, compiled 13.1 ms, source 19.3 ms; `run(['git', ...])` 0.53 ms; one fake herdr call costs about 19 git calls. Compiled akrogon only about 10% faster at start and a 91 MB artifact; bytecode bundle of src/akrogon.ts fails (top-level await) (C D7).
- Git alone cannot fix the failing test: deleting every git call saves about 11% of its akrogon time (B F2, C framing).
- Existing reuse precedent: src/shell.ts `sessionLists`, `resolutions` are per-process caches (C D2); several re-reads are deliberate boundaries after fetch, rebase, reset, allocation and before dispatch or cleanup (B F3, E3, E4).
- tests/config.test.ts asserts `commonDirectory` spawns git once per call; that contract changes under 2a (C D3).
- Pitfalls: stale herdr view misroutes a prompt or double-seats (B D3, C P1); stale git layout after own worktree add/remove (C P2); cached non-repo null (C P3); changed CommandError argv in tests (C P4); fetch-once missing an outside push in one run (C P5); counts creeping back (C P7).
- Points where slots differ: Q1 central cache with clear-on-mutation (C) versus caller-level sharing only (B); Q2c fetch once (C) versus not raised (B); Q4 committed harness and ceiling test (C) versus report-only measurement (B).
- Fake call cost (A, better-than-training, 2026-10-26, scratchpad probes, 100 runs each, load 0.05): bare `bun` 2.5 ms; fake herdr bundle `pane list` 9.9 ms; a bundle importing only tests/fake-proc.ts shellPid 6.0 ms; zod-only 3.6 ms. `node:crypto` costs about 3.5 ms per process; `Bun.CryptoHasher('sha256')` gives the same digest (`5f6f0b` for `w1:p1`) at 2.5 ms. tests/fake-proc.ts imports `createHash` only for shellPid.
- Repeat location (A, better-than-training, 2026-10-26, census dup.tsv): product git repeats by cwd are almost all at the registered root: git-common-dir 617, rev-parse HEAD 503, `--verify origin/main` 446, remote get-url 343; worktree cwds 29 HEAD reads.
- Rebuttals (slots/forks-rebuttal-B.md, slots/forks-rebuttal-C.md): B1 `dispatchSlot` sends `agent start` and `agent prompt` through `run(herdrArgv(...))`, outside `herdr()`; B5 `finishPush` in src/phase.ts fetches after a push to see the landing, so fetch-once breaks it; B3 the commonDirectory test uses four distinct cwds; C R1 reuse is about 76 s of 1,186 s suite CPU; C R2 1a alone about 20% of the failing test; C R3 process-info stays valid across adoptShell because inOwnScope reads /proc fresh.

## Taken

A's pick under autopilot, 2026-10-26: `1b 2a 3a 4a` (operator values: removing over adding, simplicity, speed).

- 1b: remove herdr repeats at the caller. A value read once in one step is passed down; the new pane's shell pid is read once (C R3). Each removed re-read names the quantity it proved. Reads right before an action (the pane check before a prompt in dispatchSlot) and polls that expect outside change stay fresh. Rejected 1a: a cache cleared on writes misses `run(herdrArgv(...))` writes (B1) and outside agent changes, so it guards staleness instead of removing it. Rejected 1c: the real tool gains nothing. Standing dissent C R2: 1b removes fewer repeats than 1a; the proof fork's bar judges it.
- 2a: read the registered root's common dir and remote url once per run, successes only; remove a second branch-tip read only inside one decision; fetch sites unchanged. Rejected 2b: keeps about 960 root layout repeats. Rejected fetch-once: breaks finishPush (B5). tests/config.test.ts commonDirectory assertions stay unchanged (B3).
- 3a: tests/fake-proc.ts uses `Bun.CryptoHasher` instead of `node:crypto` (same digest), and the fake busctl is bundled like the fake herdr. Rejected 3b: leaves 3.5 ms in every fake herdr call. fake-gh and fake-systemctl are not in the census and stay as they are.
- 4a: no committed census harness and no broad call-count ceiling. Each removed duplicate is proven by a targeted assertion in the existing test of that behavior, reading the fake's call log inside the test body before fixture cleanup (B6; corrected after leaf review B10, C F2, 2026-10-26). No suite-wide count report: fixture cleanup deletes the logs. Rejected 4b: a count ceiling fails on harmless changes. Standing dissent C R4: the method could be lost; it is kept in slots/census-A.md.
- Binding avoidance: no `pane list`, `tab list` or `workspace list` answer is kept across a herdr write, prompt or wait; no git ref fact is kept; the registered root's common dir and remote url are kept for the run because no akrogon write changes them (worktree writes change worktree metadata, and src has no remote write) (corrected after leaf review B12, 2026-10-26); a pane's shell is kept as its observed (pid, start) identity and a changed start is refused (B8); every removed read is named with what it proved; fake pids and slice names stay byte-identical to the base.
