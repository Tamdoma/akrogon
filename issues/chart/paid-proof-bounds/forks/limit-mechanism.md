# limit-mechanism

## Question

Is the paid-run limit a written grant rule seats follow, or a counter akrogon enforces (reopens proof-cost 2026-10-10 "no enforced budget")?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Merged notes: slots/limit-mechanism-merged.md. Rebuttals: slots/limit-mechanism-rebuttal-B.md, slots/limit-mechanism-rebuttal-C.md.

- A, B and C all pick a written grant rule with no akrogon counter. Paid model launches, read-only and nested ones included, need a grant before the first call. `bounds` is one total for the leaf's life. Exhaustion stops through the existing blocker path with the criterion still red.
- The fix is a wording change: drop "live-change", "before mutating" and "without asking again" from chart-issues Take and Handoff and from the reuse sentence in plan-issue:35, implement-issue:53, check-issue:35 and merge-issue:33. No code, schema or state change.
- A counter in run-check cannot see nested `claude -p` sessions in framework runners or direct shell calls (src/run-check.ts checkedRun, framework session-trace.ts). `--max-budget-usd` is per run, an estimate, and absent in codex and pi.
- Weak point: seats can still disobey. The only hard stop is provider-side (Anthropic spend limits, or a separate key for proof sessions), outside akrogon. LangChain 2026-06-15 and OpenHands 2026-04-03 use gateway-level budgets for hard fleet limits.
- B: an optional `--max-budget-usd` guard is itself an enforced budget under the proof-cost lock. B: media-range-live ran a third diagnostic pass past its one-rerun bound, so written bounds were not fully obeyed there. C: put the retry rule once in the reuse sentence, not in each retry paragraph.

## Taken

- Operator 2026-10-19: "1a | 2a |".
- 1a: the limit is a written grant rule, with no akrogon counter, schema field or state. Every paid or quota-consuming model launch needs a covering grant before its first call. That includes read-only launches, launches made inside runners, and the door's own charting probes. `bounds` is one total for the leaf's whole life, shared by every seat, pass, probe, retry and repair. A restart, repaired commit, replacement seat or provider reset does not renew it. When the bound is exhausted, the grant is missing or prior use is unknown, the seat takes the existing operator-blocker stop and the criterion stays red. In review, an exhausted bound is recorded under Operator actions while the seat finishes its review (B rebuttal). Wording to change:
  - Delete "live-change", "before mutating" / "before the first mutating proof" and "without asking again" in chart-issues Take, chart-issues Handoff, and the reuse sentence in plan-issue, implement-issue, check-issue and merge-issue.
  - Write the rule that no retry or rerun extends a bound once, in the reuse sentence, not in each retry paragraph (C rebuttal).
  - `proofs[].limits` stays epistemic.
  - The handoff review shows the authorized worst case (sessions per attempt times permitted attempts) beside the one-run estimate. The estimate stays information only.
  - No `--max-budget-usd` guard: it is an enforced budget under the proof-cost lock (B rebuttal).
  - Reason: the grant shape already exists and the defect is wording, so a counter would miss nested sessions and reopen the 2026-10-10 lock.
- 2a: no provider-side hard stop now. Revisit trigger: one proven paid launch past a written bound reopens a provider-side cap or a separate capped key, with that launch as evidence. Accepted cost: a seat that ignores the rule can overspend once.
- Operator correction 2026-10-19, verbatim: "Honestly, I don't even think we should be doing this chart when it comes to the usage. It was just my mistake telling it that it can go off like cray. I can fix this with prompts. I don't want to overcomplicate the system. Do you agree?" A replied that the counting system should go and two wording fixes should stay; the operator answered "Okay, yeah, we can fix that, definitely."
- Shrunk 1a, which replaces the lifetime-counting parts above. Wording only:
  - Delete "reruns" and "without asking again" from the reuse sentence in plan-issue, implement-issue, check-issue and merge-issue.
  - Delete "live-change" and "before mutating" / "before the first mutating proof", so a paid model launch is a billing effect under the existing grant contract.
  - The grant's `bounds` stays the free text the door writes today, for example "at most one rerun after a failure".
  - Dropped: session counting, one lifetime total across seats, launch owners, refunds, recording consumption in pass artifacts, and the handoff worst-case line. 2a stands.
