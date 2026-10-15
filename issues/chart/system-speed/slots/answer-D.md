# Answer D: whole-system speed

Read 2026-10-15. Numbers are the brief's M1-M9 unless a path is given. Sources at the end (S1-S10).

## Q1 The constraint

F1. The system is not resource-bound (M3: 5.6 active of 24 slots, load 2-4), so the constraint is a policy, not a machine. Goldratt's first step is to find where work waits (S1). Work waits in three places: for a prerequisite (plan.synthesis 5.43 h mean), for a check (70% of implement and check.fix wall, M6), and for a re-review after a Fix (M5).

F2. A's three loops are right, the ranking is wrong. The check-wait loop sits inside every other loop: implement 2.89 h and check.fix 1.55 h are mostly check wait (M6), and the prerequisite wait is the prerequisite's own review-repair-fix-merge tail (M4: dependents start a median 0.6 h after the prerequisite merges, 5 h after it passed review). That tail is 0.41 + 0.47 + 1.55 + 0.56 = 3.0 h mean (M2) and is itself mostly check wait. So the check wait is the constraint; the dependency loop is an amplifier of it, and rework is the loop that multiplies how many checks run (1.9 review visits, 1.0 fix visit, 44-50% red runs, M5, M7).

F3. Arithmetic. Check wall since 10-12: 90 x 16 + 108 x 7.4 + 86 x 2.4 + 129 x 0.4 = about 2,500 min, 1.0 h per leaf. Polling adds half a sleep per run on average: 413 runs x 4.5 min = 31 h, 0.74 h per leaf. A red run (44-50%) repeats both. Per leaf that is roughly 1.7 h of direct check wait plus the same amount inside its prerequisite's tail, against a 9.0 h median lead time (M1).

F4. What would change this view: if M6's 70% was measured only on check.fix visits, or if the sleep share of implement wall were under 30%, the rework loop would rank first. If max chain depth were 1 rather than 3 (M4), the dependency amplifier would matter less than I state.

## Q2 One change per loop

L1 Check-wait: make a check run end the seat's turn instead of being polled. Today `akrogon verify` blocks in-process (src/verify.ts:108-200, awaits each command at :166-173) while the pi shell tool caps a command at 600 s (~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts:1-8), so the skill prescribes a nohup run and a wait on its exit (skills/implement-issue/SKILL.md:45) and the pi tool text says "poll its log", which is the 540-590 s sleeps A measured (M6). Change: `akrogon verify` detaches, records the run (it already writes issues/verify-runs.jsonl at start and end, verify.ts:143-190), and when the run ends akrogon prompts the seat's pane with the result line, the way the merge turn already prompts the next holder without a manual `akrogon next` (docs/guide/merge.md:5). The seat writes nothing while a run is live. Gain: the 70% sleeping share of 66 h over 8 visits (M6) goes to zero wall and zero tokens; implement 2.89 h -> about 1.0 h, check.fix 1.55 h -> about 0.6 h, and the prerequisite tail shrinks by the same 1.9 h. Removes: the nohup/poll paragraph at implement-issue:45 and the 121 tool timeouts. Adds: one wake path in src/next.ts next to the merge wake. Breaks later: a seat that starts a second run before the first ends; refuse it with the run id (verify-runs already has `end`).

L2 Rework: move the two mechanical finding classes out of review. (a) proof missing 18 and (f) required result missing 7 are 25 of 76 first-round Fixes (M5), and both are visible to a program: the move into check.review already refuses without a green leaf receipt (dba0c5c); extend the same guard to refuse when a done-criterion in plan.md has no proof record in report.md. Then B's first review sees only (b)-(e). Second, lift the test-expectation ban (Q4). Gain: 25/76 findings never reach B; 9 of 30 A round trips vanish, so check.fix visits per leaf fall from 1.0 toward 0.7 and review visits from 1.9 toward 1.5: about 0.6 h per leaf and the same again on each prerequisite tail. Removes: the hand-to-A reason "test-expectation correction" at skills/check-issue/SKILL.md:79. Adds: one move guard. Breaks later: criteria whose proof is a human judgment need a proof-free marker in plan.md, or the guard blocks them.

L3 Dependency: truer edges and interface-first prerequisites, not stacked branches (Q3). M4: 9 of 25 edges on the longest waits are shared-file or shared-spine-test edges, which chart-issues already forbids (skills/chart-issues/SKILL.md:45 "only an actual dependency orders work, never file overlap"; assets/shapes.md:142). For the 16 real consumption edges, shapes.md:289 already says the consumed output "could merge with its own proof" as a prerequisite leaf; make that the default: the producer's interface (types, schema, fixture) is its own one-hour leaf, dependents block on it, not on the product leaf. Gain: 9/25 edges go to zero wait; the other 16 wait for a small leaf's lead time (about 2 h at today's phase times) instead of a full leaf's 9 h, so plan.synthesis 5.43 h -> roughly 1.5-2 h mean. Removes: nothing; it enforces two sentences that exist. Breaks later: an interface leaf whose contract changes during the product leaf's repair, which is the same risk stacking has, but confined to a contract file.

L4 Failures and infra: an infra fault must not move a leaf to `failed`. M8: 6 gh auth and 5 memory-admission failures are 11 of 21; the admission gate is gone, gh auth is a credential helper problem. Keep `failed` for leaf causes only: a push or fetch error reports its cause and leaves the phase unchanged (merge.md:28 already says push errors are reported with their cause). Gain: 0.41 h x 0.6 visits = 0.25 h per leaf plus the review re-entry each failed move costs. Removes: the failure route for infra in src/phase.ts (the cause strings at :268,:277). Breaks later: a genuinely stuck leaf needs the operator to notice; `akrogon status` already lists it.

L5 Merge: batching is approved; do not add to it. With L1-L3 the merge is 0.56 h of a 9 h lead time, and the rerun share there is the full suite in check.fix (M7: 31 full verifies outside merge since 10-14 12:00), which dba0c5c's narrowest-command rule already targets. Nothing more.

## Q3 Stacked branches

F5. Not here. Stacking (Meta Sapling S4, Graphite S5) stacks a change on the author's own earlier change, and the author rebases the stack when the base moves. Here the base would be another leaf's branch that is still moving: nearly every first review ends in Fix (M5: 47 review->repair, 31 repair->fix), so a dependent started after check.review would rebase onto a base that changes in about two of three cases, and the dependent's own tests would have been written against the pre-fix interface. Cursor's swarm dropped both an integrator role and task locks because waiting on them "slowed twenty agents to the throughput of two or three" (S6); Anthropic's 16-agent compiler run had frequent merge conflicts and needed CI enforcement after regressions (S7). Both ran one branch with no stacking. GitHub's merge queue removed conflicting PRs from groups automatically rather than ordering them (S8). The simpler way is L3: shrink what a dependent waits for (an interface leaf) and delete edges that are not consumption. Dispatch is gated on `merged` (src/turn.ts:11-20, src/next.ts:784-800), and nothing in state.ts carries a non-default base (state.ts:52-53 only on the batch record), so stacking would also be the largest code change on this list.

## Q4 Rework

F6. First-pass yield near 0% is the industry number for agent work too: LinearB's 8.1 M PR set shows agent PRs merge within 30 days 32.7% of the time against 84.4% for unassisted ones (S9). What raises yield without a step: make the proof rule a move guard (L2), because a third of findings are missing proofs that the implementer could have seen, and a guard is not a ceremony, it is a refusal with a line to fix.

F7. B correcting a test expectation: yes, when the brief or design states the behavior verbatim. The guard that keeps tests from weakening already exists: a changed test file needs a `Test-Change: <path> <source and reason>` trailer or the next move refuses (docs/guide/merge.md:11); require the trailer to quote the design line. A correction with no design sentence to quote stays with A. This removes 9 of 30 hand-offs (M5) and the rule at check-issue:79 that forbids it, and adds one clause to the trailer rule. Risk: B matching a test to the code instead of the design; the trailer quote makes that visible at merge, and `akrogon flaky` plus the merge verify still catch a weakened test that lets a regression through.

## Q5 Check wait

F8. Simplest is L1, a run shape where no agent is awake during a check. A `--wait` flag cannot work: the tool cap is 600 s and a verify is 6-15 min (M7), so the agent would time out and poll anyway. Shorter sleeps only burn tokens. The event already exists (verify-runs `end`); only the prompt on it is missing.

F9. test_changed's 16 min median: the script no longer exists (framework package.json has no test_changed; the selector was deleted on 10-14 with 946 s median against 500 s for the full run, scope-consult D2). Its cost was the selector plus serially run selected lanes with stale maps; the remaining long leaf-scope runs are full verifies run outside merge (M7, 31 since 10-14 12:00), which D10 and the narrowest-command rule already forbid. Google's 2026 presubmit paper says the same about selectors: testing global dependencies before every commit is infeasible, so they rank and budget rather than map (S10). Do not rebuild a map.

## Ranked top 3

1. L1 event-driven check completion: about 1.9 h per leaf direct plus the same inside every prerequisite tail; removes the polling rule and tool timeouts.
2. L2 proof guard plus B corrects stated expectations: about 0.6 h per leaf and fewer review visits; removes one prohibition.
3. L3 truer edges and interface-first prerequisites: plan.synthesis 5.4 h -> about 2 h for chained leaves; enforces two existing sentences.
Expected: mean lead time 9.8 h -> about 5 h (implement 1.0, fix 0.6, prerequisite 2, review 0.4, repair 0.5, merge 0.4 with batching). Reinertsen's rule is to watch queue size, not cycle time (Q14, S2): the sensor to keep is leaves waiting per phase from log.jsonl, sampled as M3 was.

## Would not do

W1 Raise max_active or add seats: WIP is 5.6 of 24 (M3), nothing is capacity-bound.
W2 Stacked branches on a moving prerequisite (F5).
W3 Rebuild a test-selection map (F9, S10).
W4 Shorter poll sleeps or a longer tool timeout: same wait, more tokens, same timeouts.
W5 Skip or shorten review for small leaves: (b) code defects tests missed is the largest finding class (33/76) and only review catches it before merge.
W6 Bigger leaves to cut per-leaf overhead: Reinertsen's batch-size U-curve (S2); the fixed cost per leaf is what L1 and L2 remove.

## Sources
S1 Goldratt, The Goal / Theory of Constraints, five focusing steps; model knowledge, no stronger source searched for.
S2 Reinertsen, Principles of Product Development Flow, via ardalis.com/principles-of-product-development-flow-book-review (Q14 "Don't control cycle time, control queue size"; E6 U-curve), read 2026-10-15.
S3 Little's law: lead time = WIP / throughput; 5.6 active / (42 leaves / 60 h) = 8 h, matching M1. Model knowledge.
S4 Meta, "Sapling: source control that's user-friendly and scalable", engineering.fb.com 2022-11-15, read 2026-10-15.
S5 Graphite, "the first stack-aware merge queue", graphite.com/blog, vendor page, read 2026-10-15; Pragmatic Engineer "Stacked diffs" (Graphite-affiliated author, paywalled).
S6 Wilson Lin (Cursor), "Scaling long-running autonomous coding", cursor.com/blog/scaling-agents, 2026-01-14, practitioner.
S7 Nicholas Carlini (Anthropic), "Building a C compiler with a team of parallel Claudes", anthropic.com/engineering/building-c-compiler, 2026-02-05, practitioner.
S8 Smythe and Gripper (GitHub), "How GitHub uses merge queue to ship hundreds of changes every day", github.blog, 2024-03-06, practitioner.
S9 LinearB, "AI in software development: what the 2026 data shows", linearb.io/library, 2026, vendor data (8.1 M PRs), correlational.
S10 Mehnaz et al. (Google), "Regression Test Selection at Scale", research.google/pubs, 2026 (2,000-test budget, 0.9% of cost, catches 40% of failing commits), primary.
Searches that found nothing stronger: first-hand 2025-2026 write-ups of merge-queue problems with stacks (only vendor pages); a Google TAP presubmit description beyond abstracts; a standardized first-pass-yield metric for agent PRs.
