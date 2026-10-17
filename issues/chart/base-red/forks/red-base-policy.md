# Red base policy

## Question
Q1. When a leaf's check is red, a retry on the same head is red again, and nothing in the leaf's diff explains it, what should happen?
- Options on the table: (a) keep today's rule, the leaf repairs or stops `failed` on its own; (b) one shared incident: a fresh run of the base proves the red is on main, affected leaves wait instead of failing, one notice, one repair owner, they resume on fresh green evidence; (c) known reds pass: a unit that also fails on the base is ignored and the leaf continues, merge included (Chromium CQ style, the flow dc2e2b0 deleted).

### Carries
- Locks: no classifier model API (chart jev-classifier). Only the operator flips autopilot; no new timers or polling (chart autopilot).
- dc2e2b0 (2026-10-14) "Replace base-run with akrogon verify and gate routes to main on its receipts" deleted compare, red-record and --red-on-base.
- Related: issues/closed/red-base-wait/ (the earlier known-red contracts), slots/map-merged.md.
- Operator corrections: none yet.

## Findings
Merged notes: slots/red-base-policy-merged.md (A: red-base-policy-A.md, B: red-base-policy-B.md). B rebuttal: slots/red-base-policy-rebuttal-B.md.
- History: 2026-10-10 operator chose "a pre-merge leaf never stops, waits or fails because main is red", known reds pass including merge, and foreclosed failed+cause, typed wait state, held phase and repo freeze (issues/chart/red-base-wait/forks/waiting-leaf.md:41-51, merge-gate.md:14-25). 2026-10-14 direct commits (0706551..c00246d, dc2e2b0, ac50164) replaced it with green-only receipt gates at check.review, check.repair to merge, merged --check and direct landing (src/phase.ts:291,:295, src/verify.ts:78), with no recorded reason. That replacement brought back the per-leaf stops. (A,B)
- Options presented: (1a) leaf continues, landing waits [A, reshaped after merge]; (1b) shared incident, affected leaf waits at the gate [A,B blind picks]; (1c) known reds pass, landing included [10-10 design]; (1d) keep today.
- 1a is a new policy that changes both earlier ones, not a reconciliation (B F1). Landing waits for a green run of the candidate itself, not of main, so a repair candidate can land while main is red (B F2). Pre-merge known-red acceptance must cover check.review and check.repair to merge, or a leaf in repair sticks (B F3). Matching base failures need causal diff review, every failure accounted for, and the leaf's own done-criteria stay blocking (B F4).
- A: because landing stays green-only, pre-merge comparison can be per command (same check command red on a fresh run of the exact base, seat finds no cause in the diff) rather than the deleted per-test engine; a leaf's own break hidden under the base red is caught at landing.

## Taken
