# Chart grouping

## Question
Q1. Does chart-issues group imported seeds by suspected cause and related links, verifying the cause and asking before one completion owner takes them?
Q2. Do a seed's related links pull the linked seeds into intake when the door opens with a note about one symptom?

### Carries
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Closed decision D3 (issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33) banned diagnosis and overlap checks; this chart partly reverses it.
- Skill cap C1 from the closed leaf: under 300 lines, 4k tokens, 20 rule sentences; skill must run with gh only on every harness.
- chart-issues/SKILL.md:31 import trigger; shapes.md:244-246 completion owner.

## Findings
Full rounds: ../slots/chart-grouping-{A,B,C,merged,rebuttal-B,rebuttal-C}.md.
- better-than-training · skills/chart-issues/SKILL.md:27,31,33,41,47,69; assets/shapes.md:58-62,244-246 · verbatim source vs agent findings, file:line claims, multi-identity owner, partial match stays open, show-then-confirm at :69, door writes to GitHub only to close. (A,B,C)
- better-than-training · issues/closed/akrogon-loop/doors/chart-issues/plan.md:24-26, brief.md:15 · cap under 300 lines, 4k tokens, 20 substantive rules judged semantically; no moving workflow into references to evade it; shapes holds intake identity as a short paragraph. SKILL.md is 92 lines, 2,331 words (~3.8k tokens chars/4, C). (A,B,C)
- practitioner · Google SRE Effective Troubleshooting and Postmortem Culture, read 2026-10-05 · correlated failures can differ in cause; causes are plural. (A,B,C)
- better-than-training · ITIL problem management (secondary) · incident closes on its own restoration. (A,C)
- better-than-training · #124-#128 bodies · #124 links nothing, later ones link back; embedded causal claims in #124, #126, #128. (B,C)
- Rebuttals: #128 contradiction resolved by C's coverage test (own Expected behavior and Reproduction; links are context) with B's explicit confirmation record; B: extract embedded claims from old seeds, place by responsibility, one-hop qualifier; C: one short outcome paragraph per question, no step list.
- Off route candidate (C): correcting a seed's wrong hypothesis on GitHub; the door writes to GitHub only to close.

## Taken
Operator correction 2026-10-05 (verbatim): "The chart issues skill has the consolidation process, look it up, so we don't double the work."
Operator 2026-10-05: "1a"

- Q1 = 1a (reshaped round). No change to chart-issues. Existing consolidation carries grouping: drain import (SKILL.md:31), territory map (:37), split proposal (:41), file:line verification (:47), destination seed comparison with operator confirmation (:69), one owner with many identities, full match closes, partial stays open, conflicts shown (shapes.md:244-246). Suspected cause and Related lines reach the door inside the verbatim seed body (src/pull.ts:67). Reason: no duplicate rule, chart-issues stays under its cap.
- Q2 (linked seeds on a one-symptom note) is covered by the same answer: the :69 comparison surfaces them.

Accepted costs:
- Nothing explicitly marks Related lines as match evidence; relies on door judgment.
- With a note about one symptom, related seeds surface at the :69 checkpoints (destination selection and before handoff review), not at open, so forks may need reshaping. (C final check G1)

Final-shape check: B no objection; C no objection, with record edits R1 (discovery-role door done-criterion has no owner) and R2 (INTAKE scope wording), applied 2026-10-05.
