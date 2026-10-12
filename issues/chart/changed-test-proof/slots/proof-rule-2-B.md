# Blind notes B: proof-rule round 2

Evidence date: 2026-10-11. Repo paths are relative to akrogon. `framework/` means `/home/ivan/Work/infra/tamdoma/framework/`.

## Q4 — Smallest run count

1. **Pick, reason, cost:** If a rule remains, use existing verification for new tests and two completed representative runs after repairing a test exposed by an integrated failure. Two is the smallest repetition that checks whether the repaired version can produce different outcomes. It is a minimum effort policy, not a statistically sufficient stability claim. At the brief's estimate, two runs cost about 8–10 minutes total. Existing verification can count if it covers the current test/helper and required overlap.
2. **Rejected:** One post-repair run repeats the admission pattern that triggered #86. A universal floor adds work before any observed instability. Planner-set counts add another judgment without supplying a known failure rate. Larger fixed counts have no demonstrated sufficient threshold here.
3. **Evidence:** Better-than-training: framework review records an added-case standalone pass and reused earlier load proof (`framework/issues/closed/merge-flow/probe-waits/review-B.md:137-144`), then a green integrated merge at the rewritten revision (`:239-245`). Primary docs: [Bun test](https://bun.sh/docs/test), read 2026-10-11, distinguishes repetitions from retries that can report later success as passing. Neither source establishes an adequate statistical count.
4. **Pitfalls removed:** Do not promise two catches all flakes. Count only runs reaching the current case under the selected conditions. Preserve failures rather than selecting the last two green runs. Any repair restarts proof for the affected case.
5. **Missing question:** Can the already-required rejected-command replay count as the first run? My answer: yes, if its version, conditions and completed result qualify. Require only the missing second execution.

## Q6 — Should this rule exist?

1. **Pick, reason, cost:** Choose the reviewer-only version. Reject stale proof and require the second representative run after an integrated failure. The trigger was #86's evidence mismatch and later failure, not proof that all new risky tests need repeated campaigns. This narrows the change to the demonstrated review/repair gap. Cost: one extra qualifying repair run and clearer evidence review.
2. **Rejected:** The broader rule changes testing for every newly classified risky test and can stop leaves when no small composition exists. One case does not establish that cost is justified. No change leaves the observed stale-evidence judgment unaddressed, even though framework patched this test.
3. **Evidence:** Better-than-training: `skills/implement-issue/SKILL.md:65,80,86` already requires verification and rejected-command replay. `skills/check-issue/SKILL.md:55` already checks planned-test execution. The concrete mismatch is in the review cited above. Scope reopening is explicitly authorized by Q6.
4. **Pitfalls removed:** Keep existing check scheduling, unrelated-red handling, citation rules and consumer selection ownership. Describe this as evidence review plus bounded repair verification, not a new universal stability gate.
5. **Missing question:** None beyond whether Q6 replaces the broader partial choices.
