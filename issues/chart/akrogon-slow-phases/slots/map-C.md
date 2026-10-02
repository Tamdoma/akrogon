# Opening map, slot C: akrogon slow phases

Blind round, 2026-10-02. Sources: `issues/log.jsonl`, seat transcripts (pi, codex, Claude), worker transcripts, and one timed run of each check on a scratch copy of HEAD `fd1b175` outside the repo.

Method: each pass is the log window from phase entry to phase exit. Inside the window, the gap before a model message counts as model time and the gap before a tool result counts as that tool's time. Bash commands are sorted by what they run.

## 1. Measurement

### Implement (old setup: pi seat with pi workers, 28 passes, 442 min, 09-25 to 10-01)

| Code | Where the time went | Minutes | Share |
| --- | --- | --- | --- |
| M1 | Waiting on workers | 259.3 | 58.7% |
| M2 | Main seat model time | 119.4 | 27.0% |
| M3 | Main seat test and check commands | about 62 | 14% |
| M4 | git, `akrogon phase`, other | under 2 | under 1% |

- F1. Inside the workers (47 worker sessions, 212 min): 90% is model time (1156 model turns, median 4.6 s, 52 min in turns longer than 60 s). About 21 min (10%) is `bun test --changed` runs and waits on them. Workers ran no full suite.
- F2. Main seat checks: 31 commands held a full `bun test` (20 alone, median 77 s, max 123 s. 11 combined with typecheck or format, median 113 to 146 s). `bun test --changed` ran 41 times, median 0 s, but 5 runs took 76 to 132 s, as long as the full suite.
- F3. Small leaves still pay the worker cost. realistic-review-bar was a 20-line prose diff and spent 21.1 of 30.2 min waiting on a worker. leaf-temp-dir spent 19.3 of 27.2 min, base-preflight 31.9 of 45.3, role-swap 28.9 of 43.6.
- F4. Adding F1 to the table: about 80% of implement wall time is model time (seat plus workers) and about 20% is test and check runs.

### Implement (current setup: Claude seat, 2 leaves, 4 passes, 15.9 min, 10-01)

- F5. Checks are 66% of the time: the combined format, typecheck, changed tests and full suite command took 7.5 min over 4 runs (80 to 145 s each), and single test file runs took 3.1 min (one `tests/next.test.ts` run was 122 s). Model time was 2.8 min (18%). No worker wait shows in these windows. Two leaves is a small sample.

### Merge

| Code | Setup | Passes | Total | Checks | Model | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| M5 | pi seat, before 09-29 | 18 | 81 min | about 63% | 27.7% | Full `bun test` alone is 32.4 min (40.1%), 20 runs, median 112 s, max 160 s |
| M6 | codex seat, after 09-29 | 12 | 42.4 min | runs in background | 74.5% by gap | 2.3 to 6.0 min per merge |

- F6. Before the swap, several merges ran the full suite two or three times (chart-destination-intake 160 s + 151 s + 120 s, round-labels 155 s + 120 s, owner-defect-stop 123 s + 117 s). Some ran `--changed` at about 120 s and then the full suite.
- F7. Codex starts `bun test` in the background and keeps working, so the gap method books the wait as model time. The timeline of two merges shows the pattern: one full suite of about 80 s sets the floor. A 2.3 to 3.3 min merge is one suite run plus about 1 to 2 min of model work. proof-order took 6.0 min because main moved during its checks and it rebased and checked again.
- F8. First review by codex (15 passes, 97 min) is 99% model time. Review runs almost no checks.

### The checks themselves (scratch copy, 32 cores, bun 1.4.2)

| Code | Command | Wall time |
| --- | --- | --- |
| C1 | `bun run format` | 0.8 s |
| C2 | `bun run typecheck` | 1.1 s |
| C3 | `bun test` (353 tests, 15 files) | 79.8 s |
| C4 | `bun test --parallel` | 63.0 s, all pass |
| C5 | `bun test --concurrent` | 9.7 s, 351 pass, 2 fail |
| C6 | `bun test --parallel --concurrent` | 7.7 s, same 2 fail |

- F9. One file is the suite. `tests/next.test.ts` takes 64.4 s of 81.6 s (148 tests, average 424 ms, only 2 tests over 1 s). `tests/phase.test.ts` is next at 5.9 s. No single slow test exists. The cost is many tests run one after another, each starting many subprocesses.
- F10. The suite uses one core. CPU time was 109 s for 80 s of wall time on 32 cores.
- F11. The suite slows when leaves overlap. Full runs took 72 to 82 s on quiet days and 110 to 160 s on the afternoon of 09-28 when several leaves ran at once.
- F12. The 2 failures under `--concurrent` are both in `tests/shell.test.ts` (lines 10 and 42). They count calls on a shared warning mock, so they need to stay serial. Every other test passed concurrently because each makes its own temp repo.

## 2. Forks

- K1 suite-speed. Run the suite concurrently. Options: (a) concurrent for all files with the two shell tests kept serial, about 80 s to about 10 s. (b) only split `next.test.ts` into several files and use `--parallel`, which keeps tests serial inside a file and gains less. (c) leave it.
- K2 small-leaf mode. Who implements a small leaf? Options: (a) keep one worker per unit always. (b) inline when the plan has one unit or one wave of small units. (c) operator sets `implement: inline` for the repo. The old data says worker wait was 59% of implement. The current Claude setup has too little data to confirm it still is.
- K3 check reuse. May a seat skip a check whose inputs did not change? Options: (a) merge skips the full suite when the rebase was a no-op or the rebased tree equals a tree that already passed. (b) no reuse across seats, as today. This touches the check-reruns lock, which put a check-record runner off route.
- K4 changed-tests fallback. `bun test --changed` sometimes runs nearly everything (F2), and the full suite then runs again right after. Options: (a) when `--changed` selected every file, count it as the full run. (b) drop the separate changed-tests step at implement end, since the full suite follows anyway. K1 makes this fork nearly irrelevant.
- K5 measurement. The split in this map took transcript parsing. Options: (a) seats record check wall time in the report as the skill already asks, and nothing more. (b) the log gains a per-pass check time field.

## 3. Practitioner research

All read 2026-10-02.

- S1. Bun docs, test configuration. https://bun.com/docs/test/configuration (no page date). `concurrentTestGlob` makes matching files run "as if you passed the `--concurrent` flag". The docs suggest using it "to migrate a test suite to concurrent execution gradually, or to run one kind of test (say, integration tests) concurrently while the rest stay sequential". The local `bun test --help` for 1.4.2 lists `--concurrent`, `--max-concurrency` (default 20) and `--parallel` (one worker process per file).
- S2. hydrozoa PR 768, 2026-09-28. https://github.com/cardano-hydrozoa/hydrozoa/pull/768. A passing run records a marker for the git tree it tested. A later merge-queue or push run on the same tree skips tests. A lone PR's queue run dropped from 16 min to about 1 min. A failed lookup "reads as untested and runs everything. That costs time, not coverage". This is the K3a pattern with a safe failure mode.
- S3. LangChain, "Improving Deep Agents with harness engineering" (page date not captured). https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering. The harness forces a verification pass before exit and injects time budget warnings because "agents are famously bad at time estimation". Running at the highest reasoning level scored 53.9% against 63.6% at high, due to timeouts. Relevant to F4: model time is the larger cost, and more reasoning is not free.
- S4. Anthropic, "How we built our multi-agent research system", 2025-06-13. https://www.anthropic.com/engineering/multi-agent-research-system. "Most coding tasks involve fewer truly parallelizable tasks than research." Multi-agent systems use about 15 times the tokens of chat. Supports K2b: workers pay off for parallel work, not for one small unit.
- Searches for write-ups on agent harness check scheduling (who runs checks, how often) found issue threads only, nothing stronger than S2 and S3.

## 4. Pitfalls

- P1. Merge reruns everything by rule. `skills/merge-issue/SKILL.md:35` says to run every `checks` command after the rebase. Reuse is allowed only inside the merge pass (`skills/merge-issue/SKILL.md:47`). Implement end runs the same commands on the same code (`skills/implement-issue/SKILL.md:59`). Each leaf pays the suite at least twice, and again after each repair (`skills/implement-issue/SKILL.md:75`).
- P2. One unit still gets a worker. `skills/implement-issue/SKILL.md:49` says "one unit included", and the default is `subagents` (`src/config.ts:34`, `issues/config.yaml:6`).
- P3. Concurrent tests need isolated state. The fixture gives each test its own temp repo and home (`tests/helpers.ts:14-37`), which is why 351 pass. `tests/shell.test.ts:10` and `:42` share a mock and fail. Timing asserts like the 1500 ms bound at `tests/shell.test.ts:28` can turn flaky under load. I ran each concurrent variant once. It needs repeated runs before it becomes the default.
- P4. The check record is off route. `issues/chart/check-reruns/CHART.md` put a check-record runner off route, and `akrogon phase` runs no checks itself (`src/phase.ts:216` only refuses a dirty worktree). K3a would rest on B's own comparison of trees unless that lock is reopened.
- P5. Checks inside the phase command would block everyone. `akrogon phase` holds one global lock for the whole move (`src/phase.ts:283`). An 80 s suite inside it would stall every leaf in every repo. A 10 s suite makes this less bad but does not remove it.
- P6. `bunfig.toml:1-2` sets only the test root. The `checks` list calls plain `bun test`, so a speed change must go in `bunfig.toml` or the test files to reach every seat and worker without skill edits.
- P7. The worker numbers come from the old setup (pi workers on `swe-2-max` and `muse-spark-1.3-contributor`). Slot A is now Claude. A decision on K2 from old data alone could fix a problem that has already changed.
- P8. Suite time grows with overlap (F11) and `max_active` is 12. A serial 80 s suite under load reached 160 s. A concurrent suite uses more cores per run, so overlapping leaves will contend more. The gain under load will be smaller than 8 times.

## 5. Recommended destination

The akrogon full suite runs in about 10 seconds: tests run concurrently by `bunfig.toml`, the two shared-mock tests in `tests/shell.test.ts` stay serial, and the result holds over repeated runs and with several leaves active. This one change cuts the largest measured cost at merge (40% of old merge time, and the 80 s floor of every current merge), the largest cost in the current Claude implement passes (66%), and makes the rerun rules in the check-reruns lock cheap enough to keep as they are, so no check record or reuse rule is needed. Small-leaf inline mode (K2) is the second candidate, held until 5 to 10 more Claude-seat leaves show whether worker wait is still most of implement. Check reuse (K3), the changed-tests fallback (K4) and a log field (K5) go off route, since a 10 s suite removes most of what they would save.
