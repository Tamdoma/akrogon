# Independent opening map B

Read 2026-10-11. Repository paths below are relative to `/home/ivan/Work/infra/akrogon`. `framework/` means `/home/ivan/Work/infra/tamdoma/framework/`. This map does not read A's map or change repository files. Picks are proposals, not operator decisions.

## Destination

Akrogon should require evidence that a newly added or repaired timing-sensitive test exercised its intended failure and relevant execution conditions on the current test revision before its owning leaf lands. Framework owns the test command and realistic execution conditions. No finite number of green runs guarantees that the test cannot fail later.

## Evidence that changes the question

- F1: The citation guard checks presence, not execution or stability. It selects modified, deleted and type-changed test paths, excluding additions (`src/phase.ts:511-520`). The separate frozen guard includes added tests outside the planning record and changes to recorded paths (`src/phase.ts:547-580`). Ordinary and batch transitions invoke those guards (`src/phase.ts:385-387`, `636-642`). Keeping citation authority separate from execution evidence preserves its existing purpose.
- F2: The premise “only one green run” is incomplete. The earlier B review records 20 green playback runs under the full core lane, then a full-file green run for an added case at d32e5ccc3 (`framework/issues/closed/merge-flow/probe-waits/review-B.md:137-144`). That added case later failed in the real merge gate (`:162-173`), was rewritten, and the reviewed merge ultimately landed 349c15739 (`:243-245`). **Limit:** I inspected the review record, not every one of its 20 original logs. Those earlier runs cannot establish stability of the later rewritten case.
- F3: The later failure is confirmed as a 15,000 ms CDP evaluation timeout in that case (`framework/issues/closed/merge-flow/parallel-selftest/implementation/merge-verify-run9-playback-flake.log:9743-9749`). At 349c15739 the helper awaited 100 sleeps of 100 ms inside one evaluation, with up to six outer rounds (`framework/.claude/hooks/tests/playback-probe.test.ts@349c15739:115-134`). Current code instead checks a 5,000 ms wall-clock deadline between awaited timers (`framework/.claude/skills/test-audit-design-impeccable/kit/scripts/lib/playback-probe.test.ts:121-143`). **Low confidence:** CPU pressure, hidden-page throttling and their relative contributions were not measured in the failed run. A deadline checked after a sleep cannot prevent a single delayed wakeup from overrunning an external timeout.
- F4: The two effective configurations differ materially. Akrogon's `checks.test_changed` runs Bun affected-test selection (`issues/config.yaml:7-11`). Framework's command with that name runs parity and contracts, not changed browser tests (`framework/issues/config.yaml:8-17`). Framework separately runs hooks selftests and its merge verify gate. Its current playback command runs two files, while verify core runs that command alongside other stages (`framework/package.json:159,165`). Both `akrogon config` calls succeeded on 2026-10-11 and confirmed these commands through the generated run-check wrappers. A command name alone is not coverage evidence.
- F5: The live rules already distinguish attribution from unexplained red. Unattributed failures receive one retry, then a comparable base run if still red. A green retry is recorded as `inconsistent`; a leaf's own criterion cannot become `known-red` (`skills/implement-issue/SKILL.md:38`, `skills/merge-issue/SKILL.md:75`, `docs/guide/merge.md:31`). Thus “add retries” would duplicate a mechanism and could hide the new instability. Merge executes configured checks in seats, while `merged --check` validates the tested top and citations (`skills/merge-issue/SKILL.md:41-45`).

## Material forks

### D1: What is this chart actually delivering?

O1: A generic fixed repeat count for every changed test. Easy to describe, but repeated quiet runs miss an environment-dependent failure and multiply costs for fixtures, snapshots and expensive integration tests. The built-in test predicate includes those non-executable paths (`src/test-files.ts:1-25`).

O2: Evidence tied to the current changed test and its relevant execution conditions, with framework supplying selection and execution. **Pick O2.** It directly addresses F2 and F4 and leaves runner knowledge with its owner. Risk: agent judgment could become a vague “looks stable” statement. Remove that by requiring commands, revisions, observed results and the reason those conditions exercise the suspected mechanism, not exact prose.

O3: Only fix framework's timer helper. This removes the concrete fragile wait more directly, but does not fulfill the generic admission outcome in the intake (`issues/seeds/86-a-changed-test-that-fails-under-load.md:33-34`). Framework already patched this case (F3). Keep the general workflow question here, and route concrete runner repairs there.

### D2: What triggers extra evidence?

O1: Only existing test files requiring citations. Small scope, but additions can introduce the same defect and the concrete case was an added regression (`framework/issues/closed/merge-flow/probe-waits/review-B.md:133-144`).

O2: Every executable changed or added test. Broad and mechanically discoverable, but selection cannot be equated with the citation predicate, which includes fixtures and deletions (F1, `src/test-files.ts:1-25`).

O3: New or changed tests whose real browser, process, timing or shared-resource behavior makes one isolated pass inadequate, plus every repaired test exposed by a red integrated run. **Pick O3**, subject to the operator choosing whether universal coverage is required. B must judge the trigger from the diff and real execution path. Risk: missed classification. Universal targeted repetitions are an alternative if the operator accepts their cost and framework can select the actual executable units. Do not change the locked citation path rule or require citations for all new files as a side effect.

### D3: What evidence proves enough, and when does it expire?

O1: N same-process repeats. Cheapest, but may retain state and cannot reproduce suite interactions or a different resource envelope.

O2: Fresh command runs under representative integration conditions, paired with a demonstrated failure of the test's intended behavior. **Pick O2 as the proof model.** Require evidence for the latest test/helper revision and material runner conditions. An added case or wait rewrite invalidates earlier stability evidence for that case even if product code is unchanged (F2). Reuse unchanged evidence when its inputs and conditions remain relevant, consistent with `skills/implement-issue/SKILL.md:65,86`.

O3: Artificial CPU stress or mandatory complete gate loops. Could expose some failures, but adds an untraced workload and can create different failures. Current scheduling reserves merge_checks for merge, except replay of a rejected merge command (`skills/plan-issue/SKILL.md:63`, `issues/chart/check-reruns/forks/check-scheduling.md:22-24`). Do not silently reopen that lock.

**Open quantity:** no inspected source establishes an adequate N or measured workload for this case. Do not invent 3, 10 or 100 as a safety threshold. If the operator wants a fixed sample, settle its cost and detection limits explicitly. Repetition measures observed behavior, not guaranteed stability.

### D4: What happens when the new evidence shows inconsistent results?

O1: Retry until green or use Bun `--retry`. Fast landing, but converts an observed failure into an accepted result.

O2: Quarantine or skip the new test. Removes the immediate gate disruption, but can remove proof of a required behavior and creates ongoing ownership work.

O3: Repair the newly introduced reachable defect on its owning leaf, preserving failure logs. **Pick O3.** Existing unattributed retry/base comparisons still handle unrelated red, but cannot excuse this leaf's own criterion (F5). A green retry alone is inadequate admission evidence for a newly changed test whose instability is attributed to that change. Risk: confusing runner defects with product defects. Require cause evidence and comparable base conditions rather than blaming a changed filename automatically.

### D5: Agent workflow obligation or new command gate?

O1: Add the narrow evidence obligation to planning, implementation/repair and B review. **Pick O1 initially.** Those stages already select criterion proof, run changed tests and review sources (`skills/plan-issue/SKILL.md:61-69`, `skills/implement-issue/SKILL.md:57,65,86`, `skills/check-issue/SKILL.md:53-55`). It adds no universal runner or second scheduling system. Risk: evidence can be omitted or misunderstood. B must explicitly check applicability and whether results cover the latest change.

O2: Make phase moves mechanically require stability records. Stronger omission detection, but requires a settled command, scope, revision and result contract before implementation. The current phase guard cannot infer runner coverage from `Test-Change` text (F1, F4). If chosen, validate functional record facts, not wording, and cover batches and restacks as well as single leaves (`skills/merge-issue/SKILL.md:43-49`). This is a larger outcome than inserting a repeat flag. Do not treat citation text as a machine-verifiable stability certificate.

## Practitioner questions and outside evidence

All sources read 2026-10-11.

- Q1: Are we detecting a new flaky result or masking it? John Micco, Google's test infrastructure team, [Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html?hl=de_AT), published 2016-05-27, describes reruns, change attribution and quarantine. He warns that retries encourage ignoring instability and quarantine can hide real races. This supports D4. It does not supply a repeat count for this repository.
- Q2: What exactly does the chosen runner repeat? [Bun test documentation](https://bun.sh/docs/test) describes `--rerun-each`, `--randomize` and reproducible `--seed`; `--retry` may report a later success as passing. Local Bun is 1.4.2, verified with `bun --version`; its help calls rerun-each a file repeat, while the current web docs describe each test. Before choosing that flag, probe the installed version's lifecycle hooks, isolation and failure aggregation on disposable fixtures. No behavioral probe was run in this read-only opening map.
- Q3: Does the real failure depend on shared state, time, or environment? [pytest maintainers' flaky-test guidance](https://docs.pytest.org/en/stable/explanation/flaky.html) identifies uncontrolled state, test ordering and timing assertions as causes. Use this as investigation guidance, not a prescription for Python tooling here. Compare actual commands, runner scope and resource sharing before choosing repeated standalone runs (F4).
- Q4: Can browser timers overrun the CDP budget despite a short intended delay? Chrome team member Jake Archibald's [Heavy throttling of chained JS timers beginning in Chrome 88](https://developer.chrome.com/blog/timer-throttling-in-chrome-88), published 2021-01-05, documents conditional throttling of hidden-page chained timers. This makes the proposed mechanism plausible, but does not establish the conditions in the recorded failed run. Instrument visibility and elapsed evaluation time if the cause decision needs proof.
- Q5: What does a green sample justify? Ask whether it covered the newly changed case, current helper, actual suite composition and relevant contention. The earlier 20-run review evidence makes this a revision/scope question first (F2), not evidence that 20 is insufficient for this exact rewrite.

## Pitfalls and their removal

- R1: Promise “cannot fail later.” Remove it with an observable admission requirement and stated measurement limits. A later failure is not proof that a finite sampling obligation was bypassed.
- R2: Treat a citation or `test_changed` key as execution proof. Require the concrete selected unit and command, preserving source authority separately (F1, F4).
- R3: Reuse old stability runs after a case or wait rewrite. Bind evidence to the changed test/helper inputs and rerun the affected proof when those inputs change (F2, D3).
- R4: Replace iteration counts with a deadline and call the timer problem impossible. A suspended page can miss the deadline check. Framework must assess its evaluation boundary and cleanup behavior. The existing patch alone does not prove this whole failure class is removed (F3, Q4).
- R5: Repeat whole merge gates before every review. Keep the scheduling lock and let framework provide the smallest relevant command. Explicitly reopen a fork if no smaller proof can exercise the real source (D3).
- R6: Call any failing base run conclusive. The existing completed/comparable-run rule remains necessary; current rules stop incomplete base verification without claiming a base defect (`skills/implement-issue/SKILL.md:38`).

## Off route and existing locks

- A1: No citation syntax or path-rule redesign. Preserve 10a, 11a and 12a (`issues/chart/agent-test-rules/forks/test-change-check.md:24-27`). This work concerns proof quality beyond citation presence.
- A2: No heavy-run slot, lower max_active, capacity limit or extra PSI system. Heavy-run gating was ruled out without traced load (`issues/chart/test-runs/forks/heavy-run-slot.md:30`). PSI recording and named framework-flake ownership are already assigned (`issues/chart/merge-load-flakes/forks/flake-cause.md:23-26`). This incident confirms a timeout, not its load cause.
- A3: No framework affected-test selector or release-gate implementation in akrogon. Those open forks belong to framework (`issues/chart/framework-test-scope/CHART.md:3-11`). D1-D3 must fit that boundary, or expose a real dependency rather than invent another selector.
- A4: No automatic quarantine service, post-merge monitoring project or cleanup/refactoring. These add separate ongoing outcomes. A quarantine decision would first need an owner, retained criterion proof and an exit condition (D4, Q1).
- A5: No resetting the existing check schedule. Leaves still run every checks command, merge_checks still run at merge, and the existing rejected-command replay exception remains (`issues/chart/check-reruns/forks/check-scheduling.md:22-24`, `skills/plan-issue/SKILL.md:63`).

## Remaining fog before a contract

Settle D1 first, then D2 and D3. The chart cannot hand off a generic “stability gate” while the consumer's executable-test coverage, representative conditions, evidence invalidation and failure ending are unspecified. Exact load attribution and the adequacy of 58df9333c remain unmeasured. No repository edits, test executions, lifecycle moves or external mutations were performed for this map.
