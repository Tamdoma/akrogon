# Map C, chart git-calls, 2026-10-26

## Framing (numbers that order everything)

- Failing test, quiet host: 14 akrogon runs, 4,187 ms summed. Inside: herdr 190 calls / 2,224 ms, git 323 calls / 447 ms, residual about 1,500 ms (bun start, module load, own fs work). Deleting every git call saves about 11%. A git-only chart cannot close a 15 s cap failure that needs roughly 3x headroom under load. (better-than-training: census-A, 2026-10-26)
- Unit costs measured today in a scratch worktree (removed after): `run(['git','rev-parse','--git-common-dir'])` 0.53 ms, fake herdr bundle `pane list` 10.1 ms, fake herdr from source 19.3 ms, fake herdr compiled 13.1 ms. One fake herdr call costs about 19 git calls. Order forks by ms saved per `next`, not by call count. (better-than-training: C scratch, 2026-10-26)
- Full suite baseline: wall 60.9 s, user 806.5 s, sys 380.1 s; fake herdr 17,729 calls / 491.9 s summed wall, git from akrogon 29,119 / 116.3 s, git from tests 13,270 / 70.9 s, fake busctl 938 / 33.8 s. (better-than-training: census-A, 2026-10-26)

## Forks

### D1. What to cut first: herdr calls in product code

- Pick: cut repeated herdr reads inside one akrogon process first, git fixed-facts second, fake-tool cost third. Reason: herdr is about half the wall of a test `next` and about 30 spawns per prod `next` (real herdr about 2 ms each, so prod gains less but still gains). Cost: touches the read paths of `next` dispatch, where a stale view can misroute a prompt (P1).
- Rejected: git-first (max about 11% of the failing test, see framing). Fake-first (test-only, destination requires the real tool to speed up too; operator O2 words, INTAKE.md 2026-10-26).
- Evidence: better-than-training census-A 2026-10-26; operator INTAKE.md 2026-10-25/26.

### D2. Herdr read reuse shape

- Pick: cache herdr reads in `src/shell.ts` at the `herdr()` choke point. Whitelist read verbs (`pane list`, `pane get`, `pane process-info`, `tab list`, `workspace list`, `session list`); cache by argv plus session. Any non-whitelisted argv clears the whole read cache before running. This follows the existing precedent in the same file: `sessionLists` and `resolutions` are already per-process caches. `pane process-info` (3,741 calls suite-wide, from `src/scope.ts` `shellPid`) is a read of a pid that is fixed while the pane lives, and `scope.ts` already guards pid reuse with the `/proc` start-time field.
- Cost: one central change, no signature threading through the 1,802-line `src/next.ts`. New risk class is stale reads (P1), removed by the default-clear rule: an unlisted future verb clears, never caches.
- Rejected: threading an explicit snapshot object through `next.ts`/`phase.ts`/`scope.ts` call sites (same semantics, much bigger diff). Parallelizing the serial per-session loops in `sessionPanes`/`resolveSession` (saves wall on a quiet host, saves zero CPU, adds contention exactly when two suites make the host CPU-bound; destination is CPU).
- Evidence: practitioner (C code read of `src/shell.ts`, `src/scope.ts`, `src/next.ts` read sites, 2026-10-26); better-than-training census-A herdr subcommand counts 2026-10-26.

### D3. Which git facts may be resolved once per process

- Pick: split git calls into two classes and treat them differently.
  - Layout and config facts, fixed unless a worktree is added, removed or moved: `rev-parse --git-common-dir` (4,337), `--git-dir`, `--git-path <lock>` (1,090 for `akrogon-base-runs.lock` alone), `--show-toplevel`, `remote get-url` (1,268). Memoize per process keyed by cwd (plus name where relevant). Cache successes only, never failures and never the non-repo null (P3). Clear the layout cache when a `git worktree add/remove/move` or `git init` argv passes through `run()`/`command()` in `src/shell.ts`, the choke point all product git calls use.
  - Ref facts, which akrogon itself moves during a run: `rev-parse HEAD` (2,772), `--verify` (1,949), `symbolic-ref`, `merge-base`, `worktree list --porcelain` (1,658). No process memo. Only remove exact duplicate reads at one decision point by reusing the local variable already fetched.
- Cost: `tests/config.test.ts:98` currently asserts `commonDirectory` "spawns git once per call"; that contract becomes once per distinct cwd per process. `currentRepo` (`src/config.ts`) and the repo match loop in `src/next.ts` call `commonDirectory` once per registered repo per resolution, so the memo pays there first.
- Rejected: reading `.git`/`commondir` files from the filesystem instead of spawning (after memoizing it saves only the first call per distinct cwd per run, and adds a git-layout parser that must handle `GIT_DIR`/`GIT_COMMON_DIR`, `--separate-git-dir`, submodules and linked worktrees; a parser miss means wrong repo identity or wrong lock path). Reading refs from loose/packed ref files (same class of risk, and refs move mid-run anyway). A cross-process disk cache (stale repo identity across worktree delete/recreate, multi-process races). A long-lived `git cat-file --batch` helper (saves at most about 30 ms per `next`, adds process lifecycle and sync error handling).
- Evidence: better-than-training census-A 2026-10-26; practitioner (C code read `src/config.ts` `commonDirectory`/`currentRepo`, `src/reconcile.ts` `--git-path` sites, 2026-10-26); operator lock in INTAKE.md via C P2 (akrogon moves refs during a run, 2026-10-25).

### D4. `git fetch` once per process

- Pick: fetch at most once per (repo, remote) per process. `src/next.ts` fetches at two sites, one of them per merge holder, so one `next --all` over several merge leaves fetches several times (1,181 suite-wide). In prod fetch is the only network call in the hot path, so per call it is the most expensive git spawn there; in tests the remote is a local file path and cheap.
- Cost/risk: an external push during one run is seen one run later (P5). Own pushes update the local remote-tracking ref themselves (model-knowledge: git push semantics), so fetch-after-own-push is not needed for that ref.
- Rejected: a time-based fetch stamp shared across processes (merge batches built on a stale base across runs; correctness then depends on receipt checks catching it every time).
- Evidence: practitioner (C code read `src/next.ts` fetch sites, 2026-10-26); better-than-training census-A 2026-10-26; model-knowledge for push ref update.

### D5. The `.env` safety trio in `writeLeafEnv`

- Pick: keep git as the oracle, memoize results per worktree and per repo root within the process. `src/next.ts` runs `ls-files --error-unmatch .env` plus `check-ignore -q .env` in the worktree and again at the root on every worktree ensure (1,383 `check-ignore` suite-wide).
- Rejected: parsing `.gitignore` ourselves (ignore semantics include negations, directory patterns, `.git/info/exclude` and global excludes; this check guards against writing secrets into a tracked or non-ignored path, so a reimplementation bug is a secret leak, not a slowdown).
- Open sub-question for A, not decided here: the trio runs before the `if (live) return false` short-circuit, so it throws even when nothing will be written. If that throw for live worktrees is intended safety behavior, keep the order and only memoize. If it is incidental, moving the trio after the short-circuit is a bigger saving. (practitioner: C code read, 2026-10-26)

### D6. Fake tool cost in tests

- Pick: bytecode-bundle `tests/fake-busctl.ts` the same way `tests/isolation.ts` already bundles the fake herdr (938 calls, currently from source through a symlink in `tests/helpers.ts` `fakeHerdr()`). Leave the fake herdr binary form as is until D2 cuts its call count.
- Rejected: `bun build --compile` for the fake herdr. Measured today: compiled 13.1 ms per `pane list`, bundle 10.1 ms, source 19.3 ms. Compiled is slower than the current bundle. (better-than-training: C scratch, 2026-10-26)
- Rejected: a persistent fake herdr daemon (the file-db CLI is the interface akrogon actually exercises against real herdr; a daemon adds socket and lifecycle cleanup to test isolation and stops testing the real call shape).
- Note: `fake-gh.ts` and `fake-systemctl.ts` also run from source and were not shimmed in census-A (Q2).

### D7. akrogon startup cost in tests: leave it alone for now

- Pick: do not bundle or compile akrogon itself for `cli()` runs in this chart. Measured today on bun 1.4.4: the bytecode bundle path used for the fake herdr fails for `src/akrogon.ts` (top-level await at its line 10; ESM bytecode requires `--compile`), and a compiled binary runs `--help` at 18.4 ms versus 20.4 ms from source, about 10%, for a 91 MB artifact built per test worker. Tests would also stop exercising the exact shipped entry (dynamic per-verb imports, `fakeAkrogon` symlink in `tests/helpers.ts`). Revisit only if the residual profile (Q4) shows module load dominates after D2 to D4.
- Also measured dead: file capture in `spawnFiles` costs nothing worth removing (`run(['true'])` 0.21 ms versus `Bun.spawnSync(['true'])` 0.19 ms). Do not reopen pipe capture; the comment in `src/shell.ts` records Bun pipes losing EOF under load.
- Evidence: better-than-training (C scratch measurements, 2026-10-26); practitioner (C code read `src/shell.ts`, `tests/helpers.ts`, 2026-10-26).

### D8. Test-side git (13,270 calls, 70.9 s summed)

- Pick: defer. `fixture()` in `tests/helpers.ts` runs 8 serial git commands per fixture. The zero-risk trims (identity via `GIT_AUTHOR_*`/`GIT_COMMITTER_*` env instead of two `git config` spawns) can ride along with any leaf touching helpers. A per-worker template repo copied per fixture is a bigger saving but risks fixture cross-talk through copied `.git` admin files and absolute remote paths in copied config, and it does nothing for prod. Take it only if L2 to L4 miss the CPU target.
- Evidence: practitioner (C code read `tests/helpers.ts`, 2026-10-26); better-than-training census-A 2026-10-26.

## Pitfalls and what removes each

- P1. Stale herdr view sends a prompt to a closed or busy pane, or double-seats a leaf. Removers: cache only whitelisted reads; every other herdr argv clears first (own mutations at `src/next.ts` re-read sites after close/create therefore stay correct); cache lives only for one CLI process. Remaining audit in the leaf: find read sites that poll external state in a loop expecting change (agent wait/status paths) and exempt them from the cache by name. A leaf test must flip a pane status through the fake script mid-run and show the exempt sites still see it.
- P2. Stale git layout after akrogon itself adds or removes a worktree at the same path. Remover: clear the layout cache on `worktree add/remove/move` and `init` argv at the `run()` choke point. Leaf must grep `src/` for git spawns that bypass `run()`/`command()` (`Bun.spawnSync`, `sh -c` strings such as the setup flock string in `src/config.ts`) and confirm none of them mutate worktrees.
- P3. Cached non-repo null breaks a flow that creates the repo in the same process (init). Remover: cache successes only; null and thrown failures always re-run git.
- P4. Batched or renamed git argv changes `CommandError` JSON that tests assert on. Remover: no argv batching in this chart; memoization returns identical values and first-call errors keep today's argv and cwd.
- P5. Fetch-once builds a merge batch on a base that moved during the run. Bound: one process only. The leaf must show, not assume, that a stale `built_on` ends in a rebase or recheck rather than a wrong landing (verify receipts are keyed by sha and tree; point at the exact check).
- P6. Bundling fake-busctl adds a per-worker build in `tests/isolation.ts` preload (tens of ms, measured for the herdr bundle class of build) and a second symlink target change in `fakeHerdr()`. Remover: copy the `fakeHerdrBin` pattern exactly, build failure throws at preload like the existing one.
- P7. Counts creep back as new call sites land. Remover: L6 ceiling test with headroom (max herdr and git spawns for one `next` on a small fixture, counted through a PATH shim), updated deliberately when a feature legitimately adds a call. Exact-count assertions would break on any feature work; ceilings do not.
- P8. The load proof passes by luck on a quiet moment. Remover: V3 protocol fixes pair count, records starting load, and reports the test's durations, not only pass/fail.

## Questions the chart does not yet ask

- Q1. Per single `next` or `phase` process, how many git and herdr calls are exact duplicates (same argv, same cwd/session)? Census-A aggregates the whole suite. Memoization saves only duplicates, so this number sizes D2 and D3 before either is built. If duplicates are under about a third, the pick changes from caching to deleting read sites.
- Q2. What else spawns that census-A did not shim: `fake-gh`, `fake-systemctl`, `sh`, `flock`, `systemd-run`, and product busctl calls from `src/scope.ts`? Sys CPU was 380 s; the shimmed kinds may not explain all of it.
- Q3. How long does the longest prod `next --all` run? That sets the real staleness window for D2 and D4.
- Q4. What is the residual about 110 ms per `cli()` run in the failing test made of: bun start, `allLeaves` state scans, YAML and zod work? If fs scans dominate, this chart's ceiling is lower than the census suggests.
- Q5. Does any single process depend on fetch, then own push, then a second fetch seeing a new tip? Does any flow depend on the `writeLeafEnv` trio throwing for live worktrees (D5)? Both are read-site audits, cheap to settle before building.
- Q6. For the destination's before/after CPU claim, what is the prod benchmark: a scripted `next`/`phase` sequence on a scratch registered repo with the shim from L1?
- Q7. How much of the 30 herdr plus 25 git per `next` is repo-wide discovery that scales with leaf and session count, rather than per-selected-leaf work? If most is discovery, the fork after this chart is algorithmic, not per-call.

## Proposed leaves

- L1. Census harness, no behavior change: committed shim script that counts spawns per akrogon invocation (grouped argv plus cwd, caller-tagged) for the failing test and for one scripted prod-like `next`. Answers Q1 and Q2, reproduces census-A within tolerance, and produces the baseline every later leaf is measured against. Gate for L2 to L4 sizing.
- L2. Herdr read cache in `src/shell.ts` per D2, including the poll-site exemption audit (P1) and stale-read tests. Independent of L3.
- L3. Git layout/config memo plus fetch-once per D3 and D4, including the `run()` choke-point clearing (P2, P3), the bypass grep, and the updated `commonDirectory` contract test. Independent of L2; both can run in parallel after L1.
- L4. Fake-busctl bytecode bundle per D6 (plus fake-gh/fake-systemctl only if L1 counts justify). Independent, small.
- L5 (conditional). Fixture git trims per D8, only if the CPU target is missed after L2 to L4.
- L6. Spawn-count ceiling test plus the before/after CPU and load report (V1 to V3). Last.

## Done criteria and proof ("proper testing")

- V1. Counts: L1 harness on the failing test shows herdr and git spawns per akrogon run before and after. A sets the numeric targets from Q1's duplicate rate (my suggested floor: at least 50% fewer herdr calls and 40% fewer git calls inside that test's akrogon runs).
- V2. CPU: full suite under `/usr/bin/time`, user plus sys, three runs median, same host and same command as census-A (`bun test --timeout=30000 --parallel=4 --no-isolate` via the repo's test check). Baseline 806.5 + 380.1 s. Suggested floor: at least 25% cut in user plus sys, wall reported alongside.
- V3. Load proof: two full suites started at the same time, at least 5 pairs (10 suites), zero failures anywhere, starting host load recorded per pair, and the re-entering test's duration reported per run with the slowest at or under 10 s (two-thirds of its cap). At the current roughly 1-in-4 failure rate, 10 clean suites by luck alone is about 0.75^10, roughly 6%, so this is evidence, not a coin flip.
- V4. Correctness: full suite green once on a quiet host; new tests prove a mutating herdr call clears cached reads, exempt poll sites see mid-run status flips, worktree add/remove clears layout facts, and a non-repo cwd is never served a cached null (init flow covered by its existing tests staying green).
- V5. No workflow change: diff contains no timeout, retry or serial changes and no edit to the re-entering test's body (grep the diff to show it); CLI behavior on fixture scenarios is covered by the unchanged existing tests.
- V6. Prod spot check: L1 harness counts for one scripted `next` sequence on a scratch registered repo, before and after, so the destination's "akrogon's own commands" half has numbers, not only the suite half.

Bottom line: git is the named chart but only about a tenth of the failing test's cost. The fix that closes the 15 s failure is fewer herdr reads per `next` (D2), with git layout memoization and fetch-once (D3, D4) as the second lever and the busctl bundle (D6) as a cheap third. Measure duplicates first (L1/Q1); if duplicates are rare, caching is the wrong tool and read sites must be deleted instead.
