# Map C: #63 and #69

Paths relative to /home/ivan/Work/infra/akrogon unless absolute. Framework = /home/ivan/Work/infra/tamdoma/framework.

## #63 Merge gate passed in the worktree, main red on a clean checkout

### Cause: real, now traced

- The leaf's own commit introduced the dependency on untracked folders: framework `0c5d1d7cb` ("feat(agent-content-extraction): U6 spine stages 6, 7, 11, 12", ancestor of `2ccc39534`) added the copies into `tmp/src/data/_approved/services` and `tmp/src/pages/services` (composition-spine.test.ts:1450,1453 at `2ccc39534`). The scaffold `.claude/hooks/tests/fixtures/composition-spine/stage11-site/src` tracks only components, layouts and utils (`git ls-files`), and those two folders have no git history at all. The fix `264cc2f5b` adds two `mkdirSync` calls.
- So the seat created the empty folders on disk in its worktree while building the test, the test passed there, and the merge gate ran in that same worktree (skills/merge-issue/SKILL.md:41,51: checks run on `HEAD` in the worktree). A clean checkout had no folders.
- Why nothing caught it: git does not track or report empty directories. `git status --porcelain` is empty, so the command's dirty check before moving the worktree to the stack top (src/batch.ts:82-89) passes, and the gate sees a tree that differs from the commit.
- Mechanism class: disk state in the leaf worktree that is not in the commit. Three kinds: empty directories (this case), untracked files (already refused by batch.ts:82), ignored files such as `.temp/` and `node_modules` (framework .gitignore:5; 6 of 8 framework worktrees hold `.temp/` today). Only the first kind is evidenced.

### Fork F63. Where does hidden worktree state get removed before the gate?

- O1 (pick): the command runs `git clean -fd` in the holder's worktree at the point it hands the merge turn to B (src/next.ts mergeTurn, where the batch is created, about :1017-1031), after the existing dirty check. With `status --porcelain` empty, the only things `-fd` can delete are empty untracked directories, so the step is safe by construction and covers both top and solo modes in one site. No `-x`, so ignored `.env` (a symlink, verified ignored by linkEnv, src/next.ts:306-314), `node_modules` and `.temp/` stay. Cost: one git call per merge turn. Proof: a fail-first test with an empty folder in a worktree showing the gate tree equals the commit tree after the step.
- O2: refuse the turn when `git clean -nd` prints anything. Same detection, but turns a self-healing case into a bounce for the seat to fix by hand. Rejected: more operator steps for the same safety.
- O3: fresh disposable checkout for the gate (foreclosed as first-package Q3 3b; stays rejected here on new grounds): framework gates need `node_modules` and `.temp/` recordings, and INFRA bounces from missing worktree `node_modules` already exist (#207, 3 of 34). A fresh checkout per gate pays an install per attempt on the serial slot.
- O4: also `-x` to remove ignored files. Rejected: deletes `node_modules` and recorded `.temp/` proofs, trading one rare bounce class for a certain one.
- What O1 could invite later: a seat that relies on an empty folder for a non-test reason loses it at merge, which is the same failure a clean clone gives, so it surfaces earlier, not later. Ignored-file leftovers remain uncovered; no case is evidenced, so no step now.

### Conflicts with open work
mergeTurn in src/next.ts is being edited by batch-limit-repo (:1017-1020) and merge-attempt-records (:1031). The #63 leaf should be blocked-by both, or place the call in src/batch.ts `move()` after `reset --keep` (:87) for top mode plus a skill line for solo mode. One code site is better; take the dependency.

## #69 Heavy check runs share one host with no concurrency limit

### Cause: unproven; the evidence I could measure does not support it

- Host: 32 cores, 123 GB RAM, `max_active: 20` (akrogon config). Admission counts leaves, not processes (src/next.ts:331-341, :361-362).
- Proxy measurement 2026-10-10 from framework issues/log.jsonl, 2026-10-07 to 10-09 12:00 UTC: distinct leaves with a phase transition in the 30 minutes before each event. 46 merge bounces: mean 4.0 (min 1, max 8). 55 merges: mean 3.6 (min 1, max 7). The five load-flake bounces #207 names sit at 2, 6, 6, 5 and 2 (candidate-binding-check 11:16, lens-review-hub-publish 12:40, apply-change-routes 15:03, hot-suite-concurrency 19:20, declared-surfaces-contrast 20:44). Two of five happened at the quietest activity seen. The proxy is activity, not CPU, so this weakens the load hypothesis without disproving it.
- The gate itself is the heaviest load on the host: `framework:verify:core` runs six lanes with `bun run --parallel` (framework package.json:162), and #208 shows those lanes race each other inside one tree. An admission limit in akrogon cannot change that.
- The named flake classes read as test defects with known fixes: a 5 s timeout, a deploy EPIPE with no retry, a nested `bun test --isolate` zombie. Fowler, "Eradicating Non-Determinism in Tests" (2011, https://martinfowler.com/articles/nonDeterminism.html, tier practitioner): resource leaks, fixed waits and async timing are the usual sources, and the fix is in the test. Listfield, Google Testing Blog, "Where do our flaky tests come from?" (2017, https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html, tier practitioner): flake rate tracks the test's own size and resource use far more than the machine it runs on.

### Fork F69. What, if anything, does akrogon change?

- O1 (pick): no akrogon capacity code. Two parts. (a) The flake classes go to the framework destination (chart framework-test-scope, leaf gate fork) as test fixes: timeouts, EPIPE retry, isolate zombie. (b) One merge-issue skill line: B records `/proc/loadavg` and the count of running `bun` processes at gate start and end in `review-B.md`. Cost: two shell lines per gate. This is the traced load evidence test-runs asked for, produced by the turn that suffers the flake, without a new component. It closes #69 as intake: the report's own "would disprove" (flakes at low load) is answered by the first ten records.
- O2: load-based admission. `akrogon next` starts no new seat while 1-minute loadavg divided by cores exceeds a repo or global `max_load` (default off), checked at src/next.ts:361 beside `max_active`. One config key, one read of `/proc/loadavg`, a balancing loop that caps peak load without counting processes. Ready as a one-line follow-up when O1(b) shows load at the failing gates. Not now: with no traced link it only lowers throughput, which is the documented downside of the current workaround (seed §Urgency).
- O3: count a live merge attempt as N seats in activeCount (src/next.ts:341). Rejected: does not stop seats already running checks, which is the claimed mechanism.
- O4: heavy-run slot or queue (test-runs Off route). Rejected: new component and state, and the gate's own six lanes stay unlimited by it.
- What O1 could invite: nothing in akrogon; the risk is that the framework fixes are slow to land while #69 stays "closed". Keep it open on GitHub until O1(b) has records, then close with the data or move to O2.

## One destination or two

Two reports, two destinations, one akrogon chart.
- #63: akrogon command (O1 above). One small leaf.
- #69: framework for the fixes (framework-test-scope), akrogon for one skill line (merge-issue). The skill line is a second small leaf in the same akrogon chart, or a line added to the #63 leaf since both touch the merge turn. They share no code.

## Pitfalls and what removes each

- P1 `git clean -fdx` or a bare clean on a dirty tree deletes seat work or `node_modules`. Removed by: O1 runs `-fd` only after the existing empty-status check (src/batch.ts:82), so only empty directories can go.
- P2 Solo mode: B rebases after the command's clean, and a rebase that deletes files leaves no empty directories (git removes them), so the single site holds. Removed by: the fail-first test covers a solo-shaped worktree too.
- P3 #63 leaf edits the same mergeTurn lines as two in-progress leaves. Removed by: blocked-by batch-limit-repo and merge-attempt-records.
- P4 O1(b) loadavg lines are prose evidence (#48 class: check evidence is prose, not records). Removed by: when merge-attempt-records lands, propose a `load` field on its line as a follow-up; until then the review-B.md lines are enough to decide O2.
- P5 Counting #69's flakes as "load" repeats the #53 mistake (capture bug read as load; test-runs timeout-cause). Removed by: each framework flake fix names its mechanism, and O1(b) data is read per gate, not in aggregate.

## Questions the reports do not ask

- Q1 Did the agent-content-extraction seat create the empty folders by hand or by running a generator in the fixture? Not needed for O1, but it tells whether a brief rule ("tests build their own scratch") would have prevented the class at write time.
- Q2 Is the framework 5 s test timeout a single constant? If so one framework leaf covers three of the five named flakes.
- Q3 Should the `load` field be in the merge-attempt-records line schema now, while that leaf is open, instead of a follow-up? That leaf owns the schema; asking it costs one line and avoids a second schema change.
