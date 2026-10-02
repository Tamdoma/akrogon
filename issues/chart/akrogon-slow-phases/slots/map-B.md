# Akrogon slow phases: independent map B

Implementation is mostly worker/model work, while merge is mostly test execution and waiting for test exits. Speed up those two parts separately. Keep the settled proof obligations. A check-record runner, fewer required proofs and a change to reviewer repair ownership are outside this map.

## Measurement and limits

**F1. Complete phase census.** From September 25 through the last logged event on October 1, akrogon has 32 implementation intervals across 30 leaves, totaling **454.27 minutes**, and 30 merge intervals totaling **118.91 minutes**. The two extra implementation intervals are failed recovery for wave-table and proof-order. All 62 intervals have readable parent sessions. Twenty-eight implementation intervals and 18 merge intervals use Pi records, four implementation intervals use Claude records, and 12 merge intervals use Codex records. The log's actual session paths include Pi, despite the prompt naming Claude and Codex locations. Evidence: `issues/log.jsonl:281-420` and the session references below.

**F2. Exclusive parent-pass accounting.** Times below sum to phase residence. Parallel intervals are unioned, not summed. A blocking worker launch is included with worker waiting. Claude background workers are timed from launch to completion notification. Codex background check handles are followed through polling and continuation cells.

| Activity, minutes | Implement | Share | Merge | Share |
| --- | ---: | ---: | ---: | ---: |
| Parent check-command execution/wait envelopes | 73.15 | 16.1% | 73.54 | 61.8% |
| Worker activity/wait envelopes | 259.63 | 57.2% | 0 | 0% |
| Other parent tool calls outside those envelopes | 0.30 | 0.1% | 2.73 | 2.3% |
| Phase-entry to matching pass prompt | 2.43 | 0.5% | 3.78 | 3.2% |
| Remaining model/orchestration/unresolved time | 118.77 | 26.1% | 38.87 | 32.7% |
| Total | 454.27 | 100% | 118.91 | 100% |

These are activity envelopes, not a CPU profile. Shell blocks can include a cherry-pick, result formatting or status inspection alongside checks. An asynchronous command's observed exit can arrive after its physical completion, and parent reasoning can overlap it. The residual includes inference, API latency, reading between calls and any unrecorded idle time. It cannot honestly be labeled pure model runtime. Prompt latency is identifiable waiting, not evidence of an operator delay. There is no defensible transcript-wide split of inference from provider queuing.

Within the Pi workers, reconstructed check-command envelopes occupy about **31.00 minutes** when unioned per parent phase. That is already inside the worker row. Thus parent plus worker check envelopes occupy roughly **104 minutes, or 23% of implementation residence**, rather than most implementation time. Worker/model coordination remains the larger implementation target. Fifty-eight distinct Pi worker transcripts were inspected. The brief wave-table Claude workers overlap for about 23 seconds, also already included above.

**F3. Commands are cheap individually except tests.** Current `akrogon config` resolves format, full tests, typecheck and changed tests under `checks`, with no `merge_checks`. `issues/config.yaml:6-11` sets delegated implementation and the four commands. `package.json` maps format to `prettier --write src tests` and typecheck to `tsc --noEmit`.

A command-body census found approximately the following command starts. Counts include failed attempts, red/green runs and repeated checks, not just successful final gates. Quoted shell loops and constructed commands limit exact invocation counting, so these are not cost measurements.

| Command | Implement parent | Pi workers | Merge parent |
| --- | ---: | ---: | ---: |
| Full `bun test` | 33 | 6 | 35 |
| `bun test --changed=...` | 50 | 79 | 34 |
| Named-file/name-filter test expressions | 13 | 33 | 0 |
| `bun run format` | 38 | 0 | 35 |
| `bun run typecheck` | 38 | 7 | 33 |

The sum of command runtimes is not phase wall time when commands overlap. Reports and help queries were excluded from this census. Worker tests are not charged a second time to parent wall time.

On October 2, Bun **1.4.2**, a temporary copy of tracked files, with its own TMPDIR and the existing dependency tree linked for imports, produced these single-run measurements:

| Command | Wall seconds | Result |
| --- | ---: | --- |
| `bun run typecheck` | 1.174 | Exit 0 |
| `bun run format` | 0.668 | Exit 0 |
| `bun test` | 84.403 | Exit 0, 353 pass, 0 fail, 15 files |

The temporary copy and its fixture directories were removed. These observations are recorded here because no benchmark artifact was retained. No repository or leaf was changed. This is one baseline run, not a controlled comparison of execution modes or parallelism.

**F4. The suite's concentration matters.** The scratch run's per-test timings attribute **66.44 seconds** to `tests/next.test.ts`, about **79%** of the 84.40-second suite. An archived merge run independently shows 65.98 of 83.40 seconds there. `tests/phase.test.ts` accounts for about 6.2 seconds, and all other files together account for roughly 11 seconds. File-only parallelism therefore has an optimistic lower bound near the 66-second next file, before contention and overhead. It cannot deliver a several-fold speedup by itself.

Evidence: `issues/closed/leaf-temp/leaf-temp-dir/implementation/merge-test.log:1-405`, including its final 83.40-second summary at line 405. The changed run executed 346 tests across 13 files in **81.85 seconds**, versus full 353 tests across 15 files in **83.40 seconds** (`merge-test-changed.log:392-395`). Changed selection saved just 1.55 seconds in this case. Running both serially cost **165.25 seconds** in test runtime alone.

Fixtures are substantial integration work, not cheap assertions: each fixture initializes a working repository and a bare remote, configures identity, commits and pushes (`tests/helpers.ts:14-26`). CLI scenarios spawn the actual Bun command (`tests/helpers.ts:38-60`). Avoid replacing these boundaries with mocks merely to make the number smaller.

## Concrete slow passes and evidence

Session paths below are literal evidence sources. P denotes a Pi parent, C a Codex parent. Session files can contain earlier planning/review turns, so measurements are clipped to the phase's log entry/exit.

- **S1:** `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-base-preflight--/2026-09-28T14-56-48-987Z_01a0e884-bf5b-75b3-9780-f145c8ea66ec.jsonl`.
- **S2:** `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-base-preflight--/2026-09-28T14-56-45-654Z_01a0e884-b256-760c-a3e9-9ed95d094990.jsonl`.
- **S3:** `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-worker-path--/2026-09-28T15-52-32-452Z_01a0e8b7-c3c4-74c7-9c08-65ad69e9def0.jsonl`.
- **S4:** `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-round-labels--/2026-09-28T17-36-42-391Z_01a0e917-2197-76bb-a48b-9c59fc5a639f.jsonl`.
- **S5:** `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-realistic-review-bar--/2026-09-30T16-28-37-177Z_01a0f325-83b9-74df-bdf4-b33af9eab6ed.jsonl`.
- **S6:** `/home/ivan/.codex/sessions/2026/10/01/rollout-2026-10-01T12-54-58-01a0f71a-686f-78f3-baed-41898dbbe358.jsonl`.

**F5. Large implementation time is not equivalent to slow checks.** Base-preflight took 45.29 minutes: 31.89 in workers, 6.17 in parent check blocks and 7.21 in parent residual. Its two worker waits were 10.18 and 21.71 minutes (S1:84-85,104-105). Parent changed-test runs after landing took 107.71 and 131.90 seconds, followed by a full 127.04-second run (S1:90-91,110-111,123-124). Those picks changed the integrated tree, so their reruns are not all redundant.

Realistic-review-bar took 30.22 minutes, including 21.12 in worker activity and just 1.33 in parent checks. Four fresh-agent classification runs took about **10.97 minutes** of waiting (S5:106-119). They were explicit acceptance proof, not unnecessary worker overhead: `issues/closed/review-bar/realistic-review-bar/brief.md:21` requires the independent classification, and `implementation/report.md:35-42` records three rule clarifications before the final passing classification. Do not count their whole duration as removable merely because the implementation is prose.

**F6. Four merge commands were killed and restarted.** The parent sessions show 120-second tool timeouts in worker-path, base-preflight, chart-destination-intake and round-labels. That is about **eight minutes of killed command residence**, followed by fresh attempts. These are whole-command tool limits, not Bun's default per-test timeout.

- Worker-path: timeout, then successful changed tests in 119.89 seconds (S3:66-73).
- Base-preflight: timeout, then changed tests in 136.46 seconds and full tests in 135.70 seconds (S2:165-170).
- Round-labels: timeout, then full tests in 154.83 seconds (S4:52-55). Its earlier implementation full run took 156.11 seconds.
- Chart-destination-intake: timeout at lines 52-53 of its merge session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-chart-destination-intake--/2026-09-28T17-17-03-336Z_01a0e905-23e7-7062-b6aa-d1f69783060d.jsonl`.

Eight minutes is measured lost attempt time, not a guarantee that changing timeouts saves exactly eight minutes under today's workload. Contention and harness versions differ across runs.

**F7. Async waiting can hide in apparent model gaps.** Leaf-temp merge launches full tests, polls them, then runs changed tests. Bun reports 83.40 and 81.85 seconds, while launch-to-observed-exit envelopes are about 86.25 and 89.09 seconds (S6:289-333,340-389). Treating only the initial one-second tool returns as command runtime would incorrectly assign nearly all this time to the model. Conversely, charging an entire async envelope to checks does not prove the parent was idle for that entire period.

## Material forks

1. **Q1, implementation mode.** Keep delegated implementation for every akrogon leaf, or use the existing inline mode for this repository? Recommend inline as the default candidate for akrogon's mostly small local changes, measured against comparable completed tasks before claiming a percentage saving. `src/config.ts:34` already supports it. Today's rule creates a brief and delegates even one unit (`skills/implement-issue/SKILL.md:49`, `brief-template.md:5`), then installs, commits, picks, checks and removes worker trees (`worker-protocol.md:11`). Inline removes those transfers and duplicate worker context reads. The 259.63 worker minutes are not all removable: workers perform necessary coding, tests and acceptance proof. Retain fresh-agent criterion proofs, and do not infer that a different current model would reproduce the historical timing.
2. **Q2, check command lifetime.** Keep short killing tool limits, or run known minute-scale checks with a sufficient bounded deadline and await their actual exit? Recommend the latter. Never restart a still-running check merely because a tool yields or its log is quiet. Four recorded restarts make this a concrete scheduling defect. A several-minute whole-command deadline accommodates the observed 160-second runs, while still allowing a genuine hang to fail. This is an akrogon skill/command-invocation change, not a global rewrite of Pi or a check-record runner. Preserve the exit code and complete failure log.
3. **Q3, suite execution cost.** Optimize fixture setup, introduce selective concurrency, or both? Recommend profiling and selective bounded concurrency in the next suite, with fixture isolation verified first. File-only parallelism leaves its 66-second dominant file mostly intact. Evaluate a small concurrency bound before changing the configured command. Keep real CLI/git/herdr-boundary scenarios and semantic assertions. There is no measured concurrency speedup in this round and no justification for globally enabling every test concurrently.
4. **Q4, duplicate final test selection.** Should changed tests remain a separate configured final gate as well as work-landing proof when the same final tree must also run full tests? Recommend removing the redundant final-gate entry if its property is entirely covered by full tests, while retaining changed tests for workers, landed changes and relevant consumers. This is an explicit check-list decision, not permission to skip a configured command. Today `issues/config.yaml:9,11` schedules both. Keep every remaining configured check at implement/repair and merge, as locked. Workers still need a concrete changed or targeted command (`brief-template.md:37-39`). Do not introduce a new config field or evidence-cache system. The leaf-temp case offers an 81.85-second serial duplicate, not a universal saving per leaf.

Q1 and Q2 are answerable without changing test semantics. Q3 needs a performance/isolation probe before committing to a command. Q4 needs agreement on what the separate changed gate proves. These can become independent akrogon leaves once settled. No ordering dependency exists merely because several edit a skill or config file.

## Practitioner and tool research

Sources read **2026-10-02**:

- **E1, Prithvi Rajasekaran, Anthropic, March 24, 2026.** [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) describes orchestration/reset overhead and simplifying a harness one component at a time while checking quality. This supports testing an inline implementation path against the current worker structure. It does not support deleting independent acceptance proof or predicting an akrogon speedup from a different application experiment.
- **E2, Bun primary documentation and installed Bun 1.4.2 help.** [Test runner](https://bun.com/docs/test) documents file/name filtering, per-test timeouts and concurrent tests. [Parallel and isolated execution](https://bun.com/docs/test/parallel) is linked from that page. Local `bun test --help` confirms `--parallel`, `--isolate`, `--concurrent` and `--max-concurrency` exist in the installed version. File parallelism isolates globals per file. Within-file concurrency requires auditing shared state. The repository's per-fixture folders make concurrency worth probing, but do not establish safety for every test. The docs also describe quieter agent output, which reduces transcript noise rather than the 66 seconds of actual next tests.

No source supplies a measured speedup for this repository. The concrete recommendations rely on its transcripts and the scratch baseline. A Google test-size article search was attempted, but the full page fetch was blocked. It is not used as evidence.

## Pitfalls

- **R1, proof weakening.** The check-reruns lock requires criterion proof, changed tests/consumers and every `checks` command after implement/repair, with `merge_checks` only at merge (`issues/chart/check-reruns/forks/check-scheduling.md`, Taken Q2). `skills/implement-issue/SKILL.md:59` and `skills/merge-issue/SKILL.md:35` are the operative locations. Do not silently omit full tests on prose leaves or merge because another seat already ran them. Q4 changes configuration explicitly rather than bypassing it.
- **R2, shared resources and global mocks.** Fixture setup has real subprocesses and Git state. `tests/shell.test.ts:17,44` spies on the shared console, and `tests/helpers.ts:14-36` establishes and removes fixture state. Running all tests concurrently without an isolation audit can race mocks or cleanup. Avoid sharing one mutable fixture between cases as a speed shortcut.
- **R3, environment-dependent proof.** Wave-table and proof-order stopped and recovered after a TMPDIR-sensitive base failure (`issues/log.jsonl:409-416`). The current isolation test is at `tests/next.test.ts:3530-3571`. Benchmark with the real leaf environment, preserve fixture temp isolation and distinguish environment repair from a failing product change. A run with TMPDIR removed is not interchangeable with the required leaf run.
- **R4, wrong-head reuse.** Merge refreshes the base after rebase and reruns configured checks. Non-fast-forward recovery repeats fetch/rebase/checks (`skills/merge-issue/SKILL.md:35,45-47`). Preserve that. A worker result before its siblings land does not prove the final integrated tree (`worker-protocol.md:11`). Do not recover time by treating different heads as the same evidence.
- **R5, hidden proof cost.** Fresh-agent acceptance tests can dominate prose implementation, as F5 shows. Inline is not a waiver of those criteria. Worker wait time includes real work and is not a savings estimate. Reopening those criteria or the reviewer-repair choice would exceed this map.

## Per-leaf phase accounting

Minutes. Parent checks use F2 envelopes. The implementation remainder includes parent model/orchestration, other tools and dispatch waiting. The merge remainder includes all non-check time. Recovered implementation intervals are combined for the same leaf. Log references include intervening review/repair events, whose time is excluded here.

| Leaf | Log lines | Implement | Parent checks | Workers | Implement remainder | Merge | Merge checks | Merge remainder |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| peer-c-role | 281–286 | 7.77 | 1.09 | 3.63 | 3.05 | 1.91 | 1.07 | 0.84 |
| completion-dependents | 287–291 | 19.27 | 1.22 | 13.71 | 4.34 | 3.05 | 2.21 | 0.84 |
| startup-resume | 288–294 | 33.44 | 1.21 | 24.44 | 7.79 | 2.35 | 1.27 | 1.08 |
| idle-tab-close | 295–298 | 25.49 | 1.56 | 19.60 | 4.33 | 4.07 | 2.85 | 1.23 |
| parallel-chunks | 299–302 | 13.69 | 1.68 | 7.59 | 4.42 | 2.80 | 1.67 | 1.13 |
| busy-age-label | 303–306 | 6.72 | 1.90 | 1.44 | 3.38 | 2.35 | 1.91 | 0.44 |
| owner-defect-stop | 307–314 | 16.24 | 1.99 | 10.90 | 3.35 | 6.71 | 4.06 | 2.64 |
| create-peer-panes | 308–313 | 19.22 | 2.00 | 14.96 | 2.25 | 2.95 | 2.04 | 0.91 |
| operation-proof | 315–321 | 8.24 | 2.01 | 1.91 | 4.32 | 2.65 | 1.94 | 0.71 |
| base-preflight | 320–328 | 45.29 | 6.17 | 31.89 | 7.22 | 9.42 | 6.55 | 2.87 |
| worker-path | 322–327 | 18.73 | 5.98 | 5.00 | 7.75 | 8.10 | 6.57 | 1.52 |
| chart-destination-intake | 329–337 | 10.21 | 2.57 | 2.31 | 5.32 | 10.36 | 7.30 | 3.07 |
| pull-all-repos | 330–335 | 14.28 | 2.47 | 3.98 | 7.83 | 4.16 | 2.58 | 1.57 |
| round-labels | 336–340 | 5.52 | 2.63 | 1.09 | 1.79 | 5.60 | 4.62 | 0.99 |
| init-lessons-union | 341–347 | 6.97 | 1.25 | 3.41 | 2.30 | 2.08 | 1.25 | 0.83 |
| unreadable-capacity | 342–352 | 16.65 | 3.09 | 10.73 | 2.82 | 2.98 | 2.15 | 0.84 |
| keep-chart-in-place | 343–350 | 10.96 | 1.50 | 5.91 | 3.55 | 2.53 | 1.32 | 1.21 |
| proof-rules | 353–356 | 12.16 | 1.46 | 6.96 | 3.74 | 2.43 | 1.54 | 0.89 |
| role-swap | 357–360 | 43.56 | 5.44 | 28.88 | 9.25 | 4.69 | 2.40 | 2.29 |
| epic-broadcast-once | 361–366 | 10.43 | 1.70 | 4.33 | 4.40 | 4.54 | 1.66 | 2.88 |
| realistic-review-bar | 367–372 | 30.22 | 1.33 | 21.12 | 7.76 | 2.67 | 1.35 | 1.32 |
| guarded-peer-wait | 373–376 | 5.29 | 1.43 | 1.49 | 2.37 | 2.87 | 1.47 | 1.40 |
| chart-audit-rules | 377–383 | 3.51 | 1.30 | 0.98 | 1.22 | 2.34 | 1.35 | 0.99 |
| failed-stop-guard | 378–388 | 8.02 | 1.56 | 3.72 | 2.74 | 2.61 | 1.26 | 1.35 |
| seat-exit-rules | 379–386 | 4.66 | 1.38 | 1.73 | 1.55 | 2.57 | 1.26 | 1.31 |
| check-scheduling | 389–392 | 6.89 | 1.32 | 2.18 | 3.40 | 2.46 | 1.34 | 1.13 |
| base-red-exit | 397–403 | 9.94 | 1.35 | 6.05 | 2.54 | 3.29 | 1.33 | 1.95 |
| leaf-temp-dir | 398–408 | 27.18 | 3.91 | 19.30 | 3.97 | 5.33 | 2.95 | 2.38 |
| wave-table | 409–419 | 5.73 | 3.77 | 0.38 | 1.59 | 3.01 | 1.39 | 1.62 |
| proof-order | 410–420 | 8.00 | 6.85 | 0.00 | 1.15 | 6.03 | 2.88 | 3.14 |

## Recommended destination

Keep one chart at akrogon. Start with the existing inline-versus-delegated implementation choice and reliable check lifetimes, because worker activity dominates implement and killed/restarted checks are proven waste. In parallel, settle whether the separate changed-test final gate adds any property beyond full tests, then profile and probe selective concurrency in `tests/next.test.ts`. Retain criterion proof, real integration scenarios, every configured check, post-rebase checks and the reviewer-repair decisions. Use comparable pass time and unchanged acceptance outcomes to judge the cuts, not a promise to remove all worker minutes.
