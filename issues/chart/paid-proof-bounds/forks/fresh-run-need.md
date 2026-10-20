# fresh-run-need

## Question

When must a proof pay for a fresh live run instead of reusing the last real run's saved output?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md
- Operator 2026-10-19, verbatim: "One thing is, during my initial prompting and charting, I told it to use clawed P because that's where the framework is being run inside of clawed code. aybe I shouldn't have done it in the first place. I just want to make sure that we don't spend so many tokens on these tests."

## Findings

Merged notes: slots/fresh-run-need-merged.md. Rebuttals: slots/fresh-run-need-rebuttal-B.md, slots/fresh-run-need-rebuttal-C.md.

- A, B and C: no new mechanism. standing-design already says model stages replay saved real output, deterministic code runs real, and a fresh call is needed only on a model-facing change, a missing or unreliable recording, or a whole-run property (standing-design lines 10, 15, 16). The rule is scoped to chain triggers and does not reach plan, implement and check rerun triggers.
- Framework plans turned "one full replay" into a restart-on-failure loop (hub-child-links plan.md:52,61; replay-cases plan.md:51,53). Reports show each run found one deterministic defect, and fixes were provable on saved artifacts (C, and B for the deterministic ones). Replay-cases' final layout fix was proven on run-19's saved dist.
- Fix sites: standing-design lines 15 and 16, plan-issue plan synthesis, implement-issue implement-end and check.fix rerun sentences, check-issue check.repair, and a shapes.md preflight refusal of full-replay criteria that do not name a whole-run property.
- Scope: future contracts only. Locked criteria in open leaves stand until the operator amends them (B,C). The framework checker requires a full receipt at current HEAD (B).
- Committing recorded output is test input. Building replay support is machinery and needs a prerequisite leaf (C rebuttal).

## Taken

- Operator 2026-10-19: "1a | 2a |".
- 1a: one recorded-output rule for every proof. Model and outside stages replay output saved from one real run, kept durably with provenance and never hand-patched. Deterministic stages, consumers and checks run real on the current head. A fresh paid call happens only when:
  - a model-facing input changed (prompt, instructions or templates, model pin, settings, input data, tool or provider contract, output contract);
  - the recording is missing or unreliable; or
  - the criterion's named property is fresh-start, order, live interaction or whole-run behavior. In that case it is the smallest fresh affected interaction, not automatically a whole run (B rebuttal).

  An unknown input is investigated, never a silent reuse; then a grant-covered fresh call or the blocker stop. A missing recording never falls back to a paid call on its own. Committing recorded output is test input, while building replay support is machinery and goes to a prerequisite leaf. Wording sites:
  - standing-design chain bullet (widen the replay sentence to every multi-stage proof) and slow/live bullet (rerun under the recorded-output rule; narrow the restart and final-commit clauses for model stages);
  - plan-issue plan synthesis (the rerun trigger names the model-facing input set, the recording and the real consumers; "head changed" alone is invalid for a paid stage);
  - implement-issue implement-end and check.fix rerun sentences, and check-issue check.repair (replay through real consumers first; pay fresh only when the rule requires it and the grant covers it);
  - shapes.md preflight, which refuses a fresh or full-replay criterion that does not name the property only such a run proves.

  No code. Applies to future contracts only.
- 2a: open framework leaves are not swept. A locked fresh or full-replay criterion stands until the operator amends it. Under limit-mechanism 1a such a leaf has no covering grant, so its next paid launch stops as an operator blocker, and the operator then grants runs or amends that leaf's criterion.
- Reason: the rule already exists and only failed to reach rerun decisions. About 35 paid full runs in two leaves mostly re-tested deterministic fixes.
