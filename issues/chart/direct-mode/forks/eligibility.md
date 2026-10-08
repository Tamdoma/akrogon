# Eligibility and setting

## Question
Q1. Which jobs may the door offer as direct, and which are refused outright?
Q2. Does the repo setting only allow the door to offer direct per chart, or does it authorize direct by default for eligible jobs?

### Carries
- forks/container.md: 1a, no leaf record; chart folder holds the work.

## Findings

- Notes: slots/eligibility-A.md, eligibility-B.md, eligibility-C.md; merged slots/eligibility-merged.md; rebuttals slots/eligibility-rebuttal-B.md, eligibility-rebuttal-C.md.
- Q1 agreed (A,B,C): one bounded outcome, no unfinished dependency, no pending human prerequisite, B named; no size thresholds. B: smallness and decomposition are door judgment, not a leaf count.
- Q1 disagreement: refuse inputs/grants/produces/retained and live-run criteria (A,C) vs allow with carried gates (B). C concedes `inputs` only: `gaps()` checks inputs alone (src/readiness.ts:103-121), nothing for grants/produces/retained.
- Q2 agreed (A,B,C): boolean in repoSchema default false; true lets the door offer direct with a recommendation; operator picks per chart; explicit session authorization counts (B,C). B: very small lifecycle items keep skipping debate; ask direct vs lifecycle only.
- Research: better-than-training, src/readiness.ts:87-121, chart-issues/SKILL.md:57-83, implement-issue/SKILL.md:45-59, check-issue/SKILL.md:31-33, src/config.ts:38-60, read 2026-10-08. Practitioner (B): Google Small CLs, read 2026-10-08.

## Taken
Operator 2026-10-08: `1a | 2a |`

Q1 1a: code only. Direct is not offered when the draft needs any `inputs`, `grants`, `produces` or `retained`, or a done-criterion needs a live run or outside call during implementation. Also required: one bounded outcome with no unfinished dependency (door judgment), no pending human prerequisite, B named. Door may still recommend lifecycle for a risky small job.
Reason: every leaf-only safety mechanism becomes unnecessary; widening to inputs later is non-breaking.
Foreclosed: 1b code plus inputs; 1c everything with carried gates.

Q2 2a: offer only. Boolean repo setting, default off. When on and eligible, the handoff review asks direct or lifecycle with the door's recommendation; explicit session authorization counts as the answer; debate stays as today for lifecycle work. The chosen route is recorded in the chart; a later setting change does not alter an approved job.
Foreclosed: 2b automatic direct.
