# Fix bar

## Question
Q1. What evidence must a reviewer give before a reproducible defect blocks as a Fix?

Q2. Do failed checks and explicitly listed done-criteria still block even when the input looks unusual?

### Carries
- Operator: "It's good, but it finds details that will almost never be used in production, and we need to compromise on that a bit so the leafs move faster."
- Seed wanted rule: a defect needing input no real build or real user would plausibly produce is a Nit, recorded as a deferred follow-up.

## Findings
Research: practitioner · Google eng-practices review standard https://google.github.io/eng-practices/review/reviewer/standard.html and GitLab code review guidelines https://docs.gitlab.com/development/code_review/, read 2026-09-30 · both separate required repairs from optional polish and protect forward progress, neither sets a probability threshold, Google still expects edge-case review · supports a reviewer-named path over "any reproducible input" and over "only observed production input". Code: `skills/check-issue/SKILL.md:35,37,41,43,47,53`.

Q1 options:
- 1a Realistic path, reviewer's burden. Each Fix names where the input comes from: a supported build, real user action or content, a real integration, or untrusted input an attacker can send. A code trace or representative real output is enough, no production incident needed. A handcrafted reproduction alone is not a path. Without one it is a Nit with the missing evidence stated. (A,B)
- 1b Observed only. Blocks only on input seen in production or a real build. Misses new-feature and security defects. (A,B reject)
- 1c Unchanged. Every valid reproduction blocks. (A,B reject)

Q2 options:
- 2a Failed `checks` commands and scenarios a done-criterion explicitly names still block. Broad promises such as "only references normalize" need Q1's path for a newly invented counterexample. Maintainability Fixes need a concrete current consequence. (A,B)
- 2b Any broken promise blocks. Keeps the reported loop, since broad parser promises cover everything. (A,B reject)
- 2c Even failed checks or named criteria downgrade when judged unlikely. Conflicts with the blocking-checks contract. (A,B reject)

Pitfalls: attacker input is uncommon but real, so rarity alone cannot downgrade a security, data-loss or concurrency defect. Lines 35, 37 and 47 have their own automatic-Fix wording and must follow the same bar, and so must re-check at line 53. (A,B)

Under 1a + 2a, framework F12 and F17 become Nits on their recorded evidence, since neither names a producer. (B, A agrees)

## Taken
