# Heavy run slot

## Question
Q1. Should heavy test runs (merge suites, base runs, slow proofs) on one machine take turns through one machine-wide slot, with waiting visible and costing no repair round, released when the process and its children exit?

### Carries
- F3: nothing limits heavy commands across leaves; max_active counts leaves (src/next.ts:276-307).
- Map recommendation (A,B): one host slot to start, enforced where heavy callers run commands, not in next's prompt loop; not lower max_active; not load-average adaptive.

## Findings
Round 1 research, 2026-10-02 (single slot, A):
- better-than-training · repo code · akrogon never runs check commands itself. Seats run `checks`, `merge_checks`, base runs and slow runs through their own shell tools (skills/merge-issue/SKILL.md:37, skills/implement-issue/SKILL.md:38-43, skills/check-issue/SKILL.md:81). `src/shell.ts` runs only akrogon's own git/herdr calls. So a slot must be something the seat's command passes through, not a scheduler inside `next`. Changed: ruled out a dispatch-only gate as the recommendation.
- better-than-training · framework issues/config.yaml:7-14 · `merge_checks.verify: bun run framework:verify`, `checks` are parity, contracts and `hooks:selftest`. In the #53 incident, two of three overlapping heavy runs were A's rerun of a merge_checks sub-stage (`test:cf-workers-deploy`) and its base run, neither a configured command string. Changed: wrapping configured commands alone would miss them.
- better-than-training · util-linux flock(1) 2.42.4 man page, read 2026-10-02 · the lock fd is inherited by children, so the lock holds until every child that inherited it exits; `-o` releases when the main command exits; no `-w` means wait with no clock. Changed: release scope is a real choice (leaked browser holds the slot vs load runs unslotted).
- better-than-training · Buildkite "Controlling concurrency" docs (buildkite.com/docs/pipelines/configure/workflows/controlling-concurrency, read 2026-10-02) · a named concurrency group with a limit, shared across pipelines, queued oldest first, is their standard way to serialize access to a shared resource. Bazel test encyclopedia (bazel.build/reference/test-encyclopedia) · tag `exclusive` = run no other test at the same time, `exclusive-if-local` limits only on the local host. Changed: supports one named, queued, cross-repo slot with a fixed limit of 1.
- practitioner · Node.js core, kvakil, PR nodejs/node#44090 (2022), reviewer aduh95, follow-up #44139 · timeouts correlated by machine and PR came from CPU contention; fix was cutting concurrency, then moving the heavy tests to sequential. Changed: confirms serializing heavy work as the fix class.
- model-knowledge with search · searches for "flaky tests CPU contention parallel shared machine" found only issue threads, which say wall-clock budgets drift under contention and that capacity only hides wall-clock tests. Kept as the challenge, not as advice.
- Precedent · charts leaf-run-stalls and stuck-seat-recovery: operator chose no new clock, poll or watchdog. A blocking lock with no timeout fits.


Operator answers, 2026-10-02 (partial, fork stays open):
> 1a - I'm all for option A, but that doesn't mean I will have to do it manually, right? You are just reating a CLI command that the agent will use. If that is the case, in what phase of the life cycle will this command be used? | 2a | 3a - The cleanup has to happen automatically. | 4 - That depends on the computer. You have to figure out what the computer specs are alive during the runtime and then you can decide how many can be run at once. Also, this is a very strong computer, so please look into it if maybe thats not the core issue. Because I don't think running three or four tests at the same time on this machine is actually causing problems, but you can double check it. I'm not challenging you, I just want to figure out what's true. Consult with slot B |
- Q1: 1a, agent-run, never manual. Phases to state back: implement, check.fix, merge.
- Q2: 2a.
- Q3: 3a plus correction: leftover processes are cleaned up automatically, not left for the operator. Mechanism not yet settled.
- Q4: open. Slot count from live machine capacity, and only after [timeout cause](timeout-cause.md) shows whether load is the cause at all.
- Machine at 2026-10-02 21:56 local: AMD Ryzen 9 9950X3D, 16 cores / 32 threads, 123 GB RAM, load 1.7, PSI cpu/memory/io avg300 0.00.

## Taken
Ruled out 2026-10-02 by [timeout cause](timeout-cause.md) Q2, operator verbatim: "1a | 2a |". The partial answers above (1a, 2a, 3a with automatic cleanup) are superseded: no slot, no `akrogon heavy` command, no leftover-process cleanup under this chart. Reason: #53 was a capture bug fixed in framework 2cb00d537, and no load failure is traced on this host. Reopen only as new intake with a traced load failure.
