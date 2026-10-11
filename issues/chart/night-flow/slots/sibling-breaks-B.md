# Sibling breaks: Slot B blind notes

Read 2026-10-11. These are B's independent recommendations, not settled choices. Only this return file was written. No lifecycle command, repository edit, check run, or peer exchange was performed.

## Measured night bounces

Window: 2026-10-10 21:00 UTC onward. Snapshots: akrogon log through line 761 at 2026-10-11 07:29:23 UTC, framework log through line 2425 at 07:55:31 UTC. This covers the screenshot leaves and their night activity. Earlier daytime reds, including framework fail-fast at 17:59 UTC, are outside this window.

A bounce is a failed merge attempt that sends a leaf into repair or failed. Return time is the phase-log interval from that ending to the next entry into merge, not time to final landing. Attempt duration comes from merge-attempts.jsonl. Times below are UTC.

| Finding | Repo / culprit | Cause | Failed attempt | Bounce → return to merge | Repair interval |
| --- | --- | --- | --- | --- | --- |
| F1 | framework / root-influence | Own change. Its new repo-root refusal broke existing E2E fixtures it had not adapted. | Oct 10 21:55:17–22:04:48, 9.5 min | 22:04:48 → 22:20:36 | 15.8 min |
| F2 | framework / copyfile-install | Own change. Its new relative helper import failed in the existing copied MPA runner. Holder was root-influence, but culprit was copyfile-install. | Oct 11 07:04:11–07:14:57, 10.8 min | 07:14:57 → 07:47:35 | 32.6 min |
| F3 | framework / check-scratch | Sibling integration. root-influence's newly landed repo-root rule rejected the leaf's relocated fixtures. | 07:25:38–07:37:50, 12.2 min | Failed 07:37:50, recovered to check.fix 07:45:26 | No completed return in snapshot |
| F4 | framework / formspark-build-wiring | Mixed. A required dispose member from main plus two lint defects in the leaf. | 07:37:51–07:44:43, 6.9 min | Failed 07:44:43, recovered to check.fix 07:45:26 | No completed return in snapshot |
| F5 | akrogon / leaf-env-file | Merge-resolution mistake plus an inherited logging defect. B fixed the mistaken fixture substitution during merge. The remaining unavailable-Herdr logging failure also reproduced on base in A's diagnostic run. | 06:25:37–06:30:40, 5.0 min | 06:30:40 → 06:47:50 | 17.2 min |

**Five bounces: four framework, one akrogon.** One was sibling-only, one mixed sibling/own, two own-only, and one merge-resolution/inherited-base case. Thus sibling changes contributed to **two of five**. Own leaf changes contributed to **three**, including the mixed case. Assigning the akrogon case to either binary bucket would misstate its recorded cause.

Completed return cycles were approximately **16–33 minutes**, median 17.2 minutes across three observations. Including the initial failed attempt gives 22.2–43.4 minutes before re-entering merge. These are elapsed workflow times, not agent CPU time or guaranteed savings. Framework's three recording-consumers base-red holds are separate from these bounces.

Evidence for F1–F5, all read 2026-10-11, tier better-than-training:

- F1: [root-influence review:93](</home/ivan/Work/infra/tamdoma/framework/issues/open/worktree-isolation/root-influence/review-B.md:93>), seven missed fixture adaptations and culprit ending at lines 123–127.
- F2: [copyfile-install review:299](</home/ivan/Work/infra/tamdoma/framework/issues/open/worktree-isolation/copyfile-install/review-B.md:299>), actual missing-module failure and member ejection.
- F3: [check-scratch review:585](</home/ivan/Work/infra/tamdoma/framework/issues/open/worktree-isolation/check-scratch/review-B.md:585>), 18 selftest failures and cap ending at line 593.
- F4: [formspark-build-wiring review:481](</home/ivan/Work/infra/tamdoma/framework/issues/open/formspark-api/formspark-build-wiring/review-B.md:481>), separate typecheck and lint causes.
- F5: [leaf-env-file review:420](</home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/leaf-env-file/review-B.md:420>) and [report:87](</home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/leaf-env-file/implementation/report.md:87>). The filtered base diagnostic establishes the inherited logging defect, but does not satisfy the whole-command comparison for an S1 base-red ending.
- Timing: [framework merge-attempts:10](</home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl:10>) through line 18, [framework log:2382](</home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:2382>) / 2389 and 2414 / 2424, failures/recoveries 2419–2422. [Akrogon attempts:12](</home/ivan/Work/infra/akrogon/issues/merge-attempts.jsonl:12>) / 13 and [log:751](</home/ivan/Work/infra/akrogon/issues/log.jsonl:751>) / 756.

## Q1: Find integration failures earlier and shorten repair

### 1. Pick, reason, cost

**D1: Finish each pass against current main, and use the existing B repair path for ordinary merge failures.** This is one workflow policy with two necessary changes:

1. A fetches and rebases its clean leaf immediately before the final validation and implement → check.review or check.fix → check.review handoff. Resolve conflicts and run the existing required checks after that refresh. Record the fetched base and handed-off head. Both initial reviewers then inspect the same immutable head. This catches check-scratch's selftest failures and the dispose type error before review when the producers have already landed.
2. If main advances afterward and merge finds a leaf-caused failure, isolate and restore the culprit using the existing batch machinery, then route ordinary fixes to **check.repair**, where B already repairs most findings and can return directly to merge. B refreshes that private branch, repairs, and replays the exact rejected command against the integration being repaired. Existing exceptions go to A through check.fix. Repeated problems still require S2's plan correction.

Reason: move the integration work into the pass already doing validation, and stop sending every small merge defect through A and another review. Fixture setup repairs preserving assertions and ordinary interface/lint fixes fit B's existing repair authority. A repair that changes an expectation, plan or design still follows its existing owner rules.

Cost: one fresh fetch/rebase at handoff, validation after actual integration changes, and more B repair work. No new phase, timer, dependency scanner, or counter. Merge still tests the actual candidate. A pre-review refresh cannot eliminate a later main advance, and these changes cannot promise every repair will be small.

Timing limit: check-scratch entered merge at 01:46 UTC ([framework log:2404](</home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:2404>)), before root-influence landed at 07:25. formspark-build-wiring entered merge at 05:24 ([line 2405](</home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:2405>)), before recording-consumers landed at 07:04. A pre-review refresh would not prevent these exact late integrations. D2 addresses foreseeable unlanded rules, and the shorter B route handles later discoveries.

### 2. Rejected options

- O1: Refresh only before review. Finds some failures earlier but leaves the later race and full A repair cycle.
- O2: Shorten repair only. Saves handoffs but still discovers known incompatibility at merge.
- O3: Rebase every running leaf after every sibling landing. Risks editing a working seat's branch and invalidating paired reviews. Existing pass boundaries provide a safe owner for refresh.
- O4: Raise caps, add a merge counter, serialize every leaf, or weaken guards. Caps are already settled by S2, blanket serialization contradicts independent work, and guard weakening hides the demonstrated defect.

### 3. Evidence

- E1, operator, read 2026-10-11: [INTAKE:281](</home/ivan/Work/infra/akrogon/issues/chart/night-flow/INTAKE.md:281>) asks for systemic fixes and identifies the mixed formspark failure. Earlier supplied words prioritize automation, speed and less complexity. This favors existing phases and safe handoffs.
- E2, practitioner, read 2026-10-11: GitHub engineers Will Smythe and Lawrence Gripper describe operating a queue shipping hundreds of changes daily. It tests combined candidates and removes conflicting changes while re-forming groups. Uber's Tyler French, Mindaugas Rukas and Xiaoyang Tan describe patching reviewed changes onto current main and validating again, with conflicts limiting speculative parallelism. Both support testing the integrated candidate and keeping unrelated work moving. Their accounts establish the integration principle, not authority for agents to repair code. B repair here is a recommendation grounded in this repository's existing policy. [GitHub case study](https://github.blog/engineering/engineering-principles/how-github-uses-merge-queue-to-ship-hundreds-of-changes-every-day/), [Uber case study](https://www.uber.com/kr/en/blog/how-we-halved-go-monorepo-ci-build-time/).
- E3, better-than-training, read 2026-10-11: [routing.ts:31](</home/ivan/Work/infra/akrogon/src/routing.ts:31>) already has check.repair → merge, whereas merge only offers check.fix. [phase.ts:1001](</home/ivan/Work/infra/akrogon/src/phase.ts:1001>) restores members, clears the batch and ejects the culprit, then hardcodes check.fix at line 1025. This is the concrete route to change, rather than allowing commits on a shared applied stack.
- E4, better-than-training, read 2026-10-11: [check-issue:77](</home/ivan/Work/infra/akrogon/skills/check-issue/SKILL.md:77>) defines B's repair exceptions and [line 89](</home/ivan/Work/infra/akrogon/skills/check-issue/SKILL.md:89>) currently restricts rejected merge-command replay to A. D1 must amend that replay restriction. [merge-issue:41](</home/ivan/Work/infra/akrogon/skills/merge-issue/SKILL.md:41>) forbids commits on the applied top, while [line 73](</home/ivan/Work/infra/akrogon/skills/merge-issue/SKILL.md:73>) sends leaf reds to A. [docs/guide/phases.md:13](</home/ivan/Work/infra/akrogon/docs/guide/phases.md:13>) describes the same route. The current instructions and routing must change together.
- E5, better-than-training, read 2026-10-11: [phase.ts:664](</home/ivan/Work/infra/akrogon/src/phase.ts:664>) already reuses tests only for unchanged code/config and conflict-free restacks. [next.ts:1392](</home/ivan/Work/infra/akrogon/src/next.ts:1392>) wakes declared dependents, not all running branches. Neither mechanism supplies a safe pre-review code refresh today.

### 4. Lifetime pitfalls and their removal

- R1: Main moves during review. Keep the review head fixed and retain merge's current-main candidate checks. A later failure uses the short repair route, never stale green evidence.
- R2: Repair corrupts carried branches or loses the sibling change during restoration. Eject through the command before editing, refresh the culprit's own branch onto the recorded integration base/current fetched main, and leave other members eligible. Never commit on an applied stack top.
- R3: Short repair bypasses verification or loops. B records cause, before/after heads and exact replay results, reruns checks invalidated by its changes, and uses existing A exceptions. S2 sends a repeated problem to A's plan correction. S1 continues to own genuine base-red waits.
- R4: Faster routing is claimed without proving the race. The leaf's criteria must exercise an already-landed incompatible producer before handoff, a producer landing after review, a carried-member failure, and an A-only repair. Assert correct ownership, untouched siblings and valid tested heads, not prose spelling. Framework owns its fixture/runner fixes.

### 5. Missing question

Q3: Does the shorter B route cover ordinary own-leaf merge defects as well as sibling incompatibilities? **Recommend yes**, under B's existing exceptions. A mixed failure such as F4 should get one repair pass, without a new cause category deciding its phase. If restricted to sibling failures, that extra routing judgment must be explicitly chosen. A refresh alone cannot satisfy both halves of Q1.

Q4: Does “early” require immediate revalidation of already-reviewed consumers when a producer lands? D1 only promises refresh at an owned handoff. Immediate detection would require additional event-driven validation from the existing merge wake, with a defined cost and ownership, even if it adds no clock. Do not imply D1 supplies that mechanism. Prefer D2's explicit compatibility work for known interactions before adding a general sweep.

## Q2: Name affected siblings in contracts

### 1. Pick, reason, cost

**D2: Yes. Name the producer, affected leaves, actual interface/rule, ownership and compatibility obligation in the existing designs.** The producer adapts existing main callers in its scope. Each consumer owns its new callers and fixtures and verifies the agreed behavior at handoff. For this case, check-scratch's fixtures must align cwd and declared root, and reused AcceptanceConsumer objects must participate in real disposal.

Naming changes implementers' read-first context and required compatibility outcomes. It does not itself suspend a running seat or add blocked-by. Add the existing blocked-by edge only when the consumer cannot implement or prove its outcome without the producer landing. If an adaptation works before and after the rule, keep implementation parallel. Running leaves integrate at their next owned handoff, rather than another seat rewriting their branches.

Cost: a focused caller/consumer inspection and explicit ownership at charting. No complete dependency graph or new schema. Naming known siblings catches foreseeable interactions but cannot discover future callers automatically.

### 2. Rejected options

- O5: Names only. A list without behavior, owner and proof leaves the same incompatibility to be discovered later.
- O6: Automatically block every named sibling. Shared files or exposure to a rule are not necessarily prerequisites. Compatible fixture adaptations can be done in parallel.
- O7: Producer edits every running consumer branch or changes their locked contracts silently. Branch ownership and approved scope remain with the consumer. A required scope change returns to the chart door.

### 3. Evidence

- E6, operator, read 2026-10-11: the screenshot intake at [line 289](</home/ivan/Work/infra/akrogon/issues/chart/night-flow/INTAKE.md:289>) names two different compatibility failures, supporting concrete obligations rather than one generic overlap rule.
- E7, better-than-training, read 2026-10-11: [root-influence brief:18](</home/ivan/Work/infra/tamdoma/framework/issues/open/worktree-isolation/root-influence/brief.md:18>) defines the mismatch refusal. Its [plan:21](</home/ivan/Work/infra/tamdoma/framework/issues/open/worktree-isolation/root-influence/plan.md:21>) limits forced fixture adaptation to two files, yet F1 found seven failures elsewhere. This is a caller-coverage gap, not grounds to weaken the rule.
- E8, better-than-training, read 2026-10-11: [AcceptanceConsumer:140](</home/ivan/Work/infra/tamdoma/framework/.claude/workflow/scripts/lib/context-acceptance-consumer.ts:140>) requires dispose at line 144. Git blame attributes that member to d54c69b72, carried by recording-consumers, which landed in [framework log:2413](</home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:2413>). formspark-build-wiring already names formspark-integration in [state.yaml:6](</home/ivan/Work/infra/tamdoma/framework/issues/open/formspark-api/formspark-build-wiring/state.yaml:6>), but that is not the producer of this disposal requirement. Existing dependency naming did not cover this second interface change.
- E9, better-than-training, read 2026-10-11: [chart-issues:45](</home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md:45>) orders only actual dependencies. [next.ts:1402](</home/ivan/Work/infra/akrogon/src/next.ts:1402>) dispatches declared blocked-by consumers after completion. Use that mechanism where required, without extending it to ordinary overlap.

### 4. Lifetime pitfalls and their removal

- R5: A chart misses an affected caller. Inspect actual exported interfaces, validators and their callers when drafting the producer contract. D1 remains the protection for interactions discovered later.
- R6: Naming creates unnecessary serial work. Require an explanation of why the consumer cannot complete without the producer before adding blocked-by. Prefer adaptations valid on both versions when they satisfy the contract.
- R7: Compatibility is satisfied by a no-op dispose or a weaker guard. Criteria preserve actual lane cleanup/lock release and production mismatch refusal. Both framework outcomes stay with their existing owners.
- R8: Retroactive naming expands a running leaf. An in-scope adaptation updates its plan and proof. Changed locked outcomes, grants or ownership require the door's explicit contract decision, not an automatic branch edit.

### 5. Missing question

Q5: Must the producer preserve compatibility for existing main callers before landing, with each new caller assigned to its consumer? **Recommend yes.** Naming leaves alone does not settle who repairs the caller. The existing-main versus new-consumer ownership split resolves that gap without serializing all siblings.
