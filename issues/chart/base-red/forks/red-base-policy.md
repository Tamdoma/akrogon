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
- C joined at autopilot switch-on (red-base-policy-C.md): picks known reds pass in reduced form inside `akrogon verify` using the existing failing-unit extraction (src/flaky.ts:10), no wait, no resume, no incident record; rejects the hybrid because holding only at merge moves the pileup into the serialized merge queue (#67), and rejects shared wait as the most machinery and against 10-10. B rebuttal 2 (red-base-policy-rebuttal-2-B.md): completion inside a runner is not proven by command exit, receipts need a comparison contract, known-red is a throughput choice not equal protection, notice identity must include the command, costs retained. C rebuttal (red-base-policy-rebuttal-C.md) accepts those as boundaries, keeps runner completeness with the seat reading both logs, and notes done-criteria proofs are outside verify so they stay blocking by structure. Merged addendum "Open (C)" parentheticals are A's answers (C D1).
- dc2e2b0 was authored by the operator on 2026-10-14 with no chart record of the reason (A searched changed-test-proof, night-flow, check-evidence, merge-green-rate).

## Taken
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Round recommendation was 1a (leaf continues, landing waits); A picked the reduced known-reds-pass option C proposed after the round was first shown.

Decision: a red that is also red on the exact base passes the verify gates; nothing waits, nothing is marked `failed` for a base red, and nothing resumes.
- Trigger: only after the same-head retry stays red and the seat judges no cause in the diff (skills/implement-issue/SKILL.md:40, skills/check-issue/SKILL.md:69, skills/merge-issue/SKILL.md:77 judgment gates stay).
- `akrogon verify` runs the exact base fresh, never reusing a receipt on the base side: `$AKROGON_BASE` for a leaf, the stack target for merge, the default-branch tip the attempt rebased on for direct.
- It passes only when every nonzero head command yields a non-empty set of failing units from the existing extraction, every head unit is red on the base, and both runs completed with setup 0. A command with no extractable units (typecheck, format) or an empty set blocks, as does an incomplete, timed-out or setup-failed run on either side (B F1, C D2).
- The seat reads both logs and judges runner completeness and causal fit; that judgment is recorded in the report or review, as `inconsistent` is today (C D2, D3).
- `requireGreenReceipt` accepts such a linked head+base pair wherever it accepts a green receipt: check.review move, check.repair to merge, merge --check, direct-guards. One rule for lifecycle and direct (B F3 earlier, C).
- Done-criteria proofs are outside verify and stay blocking (10-10 boundary).
- The seat-skill sentence "every commit on the default branch passed verify, so a red with no cause in the diff is never handed off as a base defect" is replaced by this rule.
Reason: the operator's own words on 2026-10-10 ("I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main?") are the strongest operator-tier evidence on this exact question; dc2e2b0 reversed the policy with no recorded reason while deleting 3242 lines, and this form keeps that deletion (no base-run verb, no red-record file, no seat comparison records). It removes the wait state, the resume step and the per-leaf `failed` stops, the fewest moving parts of the options that solve the reported toil. Holding at merge (1a) would move the pileup into the merge queue, the #67 pattern.
Accepted costs and limits: one fresh base run per affected leaf while main is red; a new break inside an already-red unit can land unseen; main stays red until the operator charts the repair from a notice. This delivers no run-once detection and no assigned repair owner, a scope difference from the intake wording (B F5, C D6).
Rejected: 1a hybrid (merge-queue pileup, landing freeze while main is red); 1b shared wait (most machinery, 10-10 foreclosed wait states, stale-clear race class); 1d today (three incidents in 10 days, manual moves); restoring the deleted trio (C).
Standing dissent: B's blind pick was 1b; B holds that known-red continuation is a throughput choice with weaker detection, not equal protection (rebuttal-2 F3).
