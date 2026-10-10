# Bounce counting

## Question
Q1. Which merge bounces count toward `fix_rounds`: every post-hold bounce, or only ones judged the leaf's own?

### Carries
- Depends on red-main-hold landing first (A,B,C).
- Cap and increment: src/phase.ts:151, 302. B-only re-review when rounds > 0: src/routing.ts:54.

## Findings
- Every post-hold bounce, mechanical (C): conflicts never reach check.fix (src/next.ts:1152-1181).
- Attributable only (B): base, infra and batch failures must not spend a leaf's budget.

## Taken
Operator 2026-10-10, verbatim: "1a |"

- Q1 1a: every `merge -> check.fix` counts toward `fix_rounds` (src/phase.ts:151) and the cap applies to that origin (src/phase.ts:302); B-only re-review follows from src/routing.ts:54. Lands after red-main-hold. Existing counts unchanged. Reason: mechanical, no judgment to drift. Foreclosed: 1b B-judged attribution, 1c separate counter.
