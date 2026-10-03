# Round 3 · B · automatic criterion correction

The proposed manual return would stop a leaf during planning, implementation or repair, not automatically reopen the chart. Replace it with authority to correct proof requirements while preserving the operator's required behavior. Apply the bar before handoff, let A record justified proof corrections, and have B independently judge them before merge. This is a proposal, not today's lifecycle behavior.

Read 2026-10-03. Blind: no round3-A* read. Carries accepted in intake: boundary default with units for tricky logic, reasoned/batch-aware pruning preserving regressions, and fail-before/pass-after or one deliberate break without a mutation-score quota. No repository edits or transitions performed.

## Where the return would happen today

| Ref | Phase and existing rule | Cost of sending it back |
|---|---|---|
| F1 | **plan.positions / plan.synthesis:** `skills/plan-issue/SKILL.md:29` forbids asking questions or waiting; physical blockers use `failed`. Lines 37 and 65 say design wins a brief conflict and locked scope is not reopened. Lines 61-63 require proof of every criterion. | The proposed “ask the chart owner” path is not implemented here. A missing justification is not automatically a physical blocker under line 29. A new manual-return rule would add a stop before code, correction by the owner and redispatch. A brief/design conflict alone currently gets a note and planning continues. |
| F2 | **implement / check.fix:** `skills/implement-issue/SKILL.md:34,36,75` stops a fix needing a locked decision changed, or an unfulfilled criterion outside available repair/ownership. It forbids weakening criteria/tests. | A criterion discovered late can waste implementation and proof runs before `akrogon phase <slug> failed --reason ... --slot A`. There is no automatic charter revision or resume. |
| F3 | **check.review → check.repair → check.fix:** `skills/check-issue/SKILL.md:55` makes named scenarios and failed checks blocking. Lines 71 and 85 send plan/design changes from B to A and count that handoff against the repair cap; A then encounters implement:34/75. | An unsupported requirement can cause a repair handoff and eventually a failed stop, rather than a harmless Nit. Downgrading only B's verdict does not remove A's earlier proof obligation. |
| F4 | **failed:** `src/phase.ts:180-183` rejects seat recovery with `--slot`; `src/next.ts:600` waits. `src/routing.ts:27-49` contains no chart-return phase. `docs/guide/phases.md:63-76` documents operator recovery without `--slot`, followed by `akrogon next`. | The cost includes human correction/recovery and waiting, not merely another agent pass. No measured duration supports a minutes estimate. Do not automate this by having a seat omit its slot and impersonate operator recovery. |

## Recommended automatic handling

- **D1 · Before handoff, chart A and its named peer separate required behavior from the chosen proof.** Every required outcome has a realistic break path and justified expectation source. Consumer contracts, safety requirements, explicit exclusions and grants remain binding. Proof details such as file count, private call order or a temp-path prefix are revisable. Resolve genuinely missing product intent at this attended door, before dispatch.
- **D2 · At plan.synthesis, A checks every criterion against that bar before deriving tests.** It may remove a false, obsolete or duplicated proof demand, or replace/narrow its scenario, only while preserving all required behavior. Record the original criterion, source, reason and replacement/remaining proof in plan.md. A missing source starts a search of the brief, design and real consumer contract, not automatic deletion. Do not edit the original brief/design to erase the record.
- **D3 · During implementation, late proof defects take the same recorded correction route.** A repairs the invalid assertion within the granted owned surfaces, preserves meaningful regression checks and reruns affected proofs/checks. Example: remove the unsupported TMPDIR prefix ban, keep containment and 0700. A consumer-required scenario does not become optional because its test is red, slow or hard to satisfy.
- **D4 · At check.review, B independently compares corrections with the original brief/design and live contracts.** It accepts justified proof corrections or returns a concrete preservation defect through the existing automatic B/A repair routes. The bad original proof demand is nonbinding once justified, but a lost required outcome is a Fix. This is not blanket permission to label failed tests Nits.
- **D5 · Align all stages with that authority.** Add the bounded proof-correction exception to plan:63/65, implement:34/36/57/75 and check:51/55/71/81; review and merge use the recorded corrected proof obligations. An invalid assertion inside a blocking suite must be repaired/removed under the authorized rule so the command actually passes. Never ignore its exit status or invoke failed solely to obtain criterion-quality approval. Mechanical checks validate state/evidence presence, not exact prose or criterion quality.

Evidence: `skills/chart-issues/assets/shapes.md:250-252` already checks contract ownership and has peers review drafts before handoff; `src/phase.ts:254-259` rejects issue-file edits on the code branch, so correction records belong in the authoritative leaf folder. `issues/closed/long-implement/proof-order/implementation/report.md:3,8` and commit `2dd1106554851d48ef7c15a4aade9074deea96dc` establish the TMPDIR example. These are instruction/contract changes to propose, not evidence that the automatic exception already exists.

## Proposed operator round

This choice removes the manual return for bad proof requirements while keeping your requested behavior fixed. The chart defines the outcome before handoff, A corrects a deficient proof requirement with evidence, and B checks that correction against the original contract.

### 1 · Who should correct a bad criterion after handoff?

The current `failed` path requires operator recovery. Giving the implementing seat unrestricted power to narrow criteria would remove that wait but also let it shrink its own task. The recommended authority changes proof requirements, not the operator's outcomes, and uses existing review/repair phases.

Research: operator · round3-intake.md, read 2026-10-03 · you reject manual returns. Better-than-training · plan:29/65, implement:34/75, check:55/71 and src/phase.ts:180-183, inspected 2026-10-03 · existing locks and failed recovery require the coordinated exception above. Practitioner · [Paul Stack, 2026-09-23](https://stack72.dev/your-agent-written-tests-arent-real-tests/) · verification requires constraints outside the implementation loop. [Bill Echlin, 2026-08-11](https://www.testmanagement.com/blog/2026/08/ai-written-tests-evidence/) · unchanged intent and known-broken behavior distinguish valid correction from learning a defect as correct.

- **1a (recommended)** Apply the bar at the door, authorize A's recorded proof corrections at plan.synthesis and later discovery, and require B's independent preservation check before merge. Required behavior and grants stay fixed. This corrects missed bad criteria without returning to you or creating a new lifecycle phase.
- **1b** Validate only at the chart door and freeze all criteria afterward. This is simpler and catches mistakes earliest, but a missed bad criterion still triggers today's failed/manual-recovery path, so it does not fully satisfy your correction.
- **1c** Let check.review downgrade unsupported criterion demands to Nits without changing planning/implementation obligations. This avoids some review repairs, but leaves A blocked earlier and cannot make a red blocking command pass.
- **1d** Let A freely drop/narrow criteria whenever it records a reason. This removes handoffs but allows the implementation's author to redefine success without an independent check.

Pitfalls: distinguish unsupported proof detail from missing product intent. Never derive the desired outcome from the candidate implementation. Narrowing a scenario must preserve consequential reachable paths. A correction rejected by B must be repaired automatically, not converted into a request for operator approval. Existing repair limits still bound actual implementation defects; this proposal does not silently remove those limits.

Reply `1a`, or a free-text answer.

### Challenge check

Stack's strongest protection is an independently owned constraint, not a second agent agreeing with the first. Keep the original operator outcome/contract available to B and require actual failure-detection evidence under the already taken rule. “No manual criterion return” can be achieved for proof corrections with this explicit authority; it cannot honestly mean agents may invent missing intent, expand live permissions or guarantee every defective implementation eventually passes. Those are different problems from correcting an unsupported test demand.
