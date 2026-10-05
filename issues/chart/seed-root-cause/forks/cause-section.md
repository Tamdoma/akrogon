# Cause section

## Question
Q1. How does the seed body carry a suspected cause: a separate labeled section, always present or only when supported, with what required parts?
Q2. Does the one-sentence portability rule ("describe the pattern that failed, not the one file") return?

### Carries
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Closed decision D3 (issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33) banned diagnosis and overlap checks; this chart partly reverses it.
- Skill cap C1 from the closed leaf: under 300 lines, 4k tokens, 20 rule sentences; skill must run with gh only on every harness.
- Depends on: forks/discovery-role.md

## Findings
Full rounds: ../slots/cause-section-{A,B,C,merged,rebuttal-B,rebuttal-C}.md.
- operator · INTAKE.md Expected behavior; discovery-role Taken · cause as labeled unverified context, actionable gap required. (B,C)
- practitioner · Simon Tatham, https://www.chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05 · keep facts and speculation apart · separate section, symptoms untouched. (A,B,C)
- practitioner · John Allspaw, The Infinite Hows, read 2026-10-05 · causes are conditions · plural conditions. (A,C)
- practitioner · Google SRE Effective Troubleshooting, read 2026-10-05 · test against contrary evidence; shared timing is not shared cause · disproof line, pattern no wider than evidence. (A,B)
- better-than-training · skills/seed-issue/SKILL.md:26-47; src/pull.ts:67; git show 507aff5^:skills/seed-issue/SKILL.md:147-155; tamdoma-framework #124-#128 read with gh 2026-10-05 · five fixed sections, body copied whole, old portability rule banned paths report-wide, cause leaked unlabeled into Observation, all case paths were installed copies. (A,B,C)
- C1 budget: about 15 of 20 rule sentences used (C's count, method unrecorded). Door recounts before handoff.
- Rebuttals: B moved to 3a; B fixed bare-Not-provided, 1b cost, copy flag by provenance. C added symptom done-criterion, moved title rule to root-report, costed :26 rewording.

## Taken
Operator 2026-10-05: "1a | 2a | 3a"

- Q1 = 1a. New last section `## Suspected cause` after Urgency, always present. Content is a supported hypothesis, or "no supported hypothesis" plus the evidence needed next. Bare "Not provided" never replaces the gap. Observation holds only what was seen. Reason: facts and guesses never mix, and the section proves the attempt happened.
- Q2 = 2a. Four short template placeholder lines: conditions (main and contributing, several allowed), whose view (reporter, agent or both), files read with installed or vendored copies flagged, what was not inspected or would disprove it. Reason: each line answers a question the fixer would otherwise ask.
- Q3 = 3a. No portability rule sentence. The conditions line reads "the condition or pattern that allowed it, no wider than the evidence shows". Reason: same job at no rule-sentence cost, keeps file evidence.

Binding (carry into leaves):
- Reword `skills/seed-issue/SKILL.md:26` in place: lift "diagnosis", keep "recommended fixes" banned, name six sections. Placeholder text counts against C1 by function; record the counting method before handoff.
- Copy flags come from inspected provenance, not path name alone, and say when the link to destination source is unverified.
- Done-criteria: filing with a cause still fills all five original sections; replay of #124 input puts the checkManifestRule reasoning in Suspected cause, not Observation; reporter suspicion contradicted by inspected evidence; unrelated symptoms from one session; consumer-repo filing flags installed copies.
- Title rule (observation vs cause) moved to root-report.

## C1 counting method (2026-10-05)

Recorded method from the closed leaves: the operator counts once, judging rules by meaning, no counter program (`issues/closed/akrogon-loop/bootstrap/core-skills/plan.md:17`). The closed seed-issue review counted 12 directive sentences plus one dependency sentence (`issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md:43`). Under this fork's binding, each new Suspected cause placeholder line that adds a requirement counts as one rule. Door projection: 12 today, plus about 3 prose rules (trace, search, root line; search failure folds into the related line) and 5 placeholder lines, about 20. The leaf must land under 20 by the operator's count, merging only where meaning stays whole. Lines (68) and tokens (about 1k by bytes/4) are far under cap.

Handoff review 2026-10-05, operator: "1a | 2 no | 3 - yes". Q1 = O1: keep the under-20 cap; the leaf merges rules only where meaning stays whole, and if it still exceeds the cap it stops and reports the count to the operator instead of exceeding it.
