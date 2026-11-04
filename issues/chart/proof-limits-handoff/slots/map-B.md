# Territory map: proof-limits-handoff, slot B

Independent opening map. Recommendations below are consultant views, not decisions or an execution plan. Repository paths are relative to `/home/ivan/Work/infra/akrogon`. Framework paths are relative to `/home/ivan/Work/infra/tamdoma/framework`.

## Findings

- F1. The missing property was explicit, not hidden. Framework `issues/chart/about-titles/forks/title-source.md`, “Proof 2026-11-03: recorder launch (grant-draft-2, session 1 of 9)”, records a failed verify, excludes acceptance from its limits, and assigns the missing copy cycle to the recorder leaf. The closed leaf's `readiness.yaml`, `proofs`, carries that same exclusion. Its `brief.md`, “Done-criteria”, requires real acceptance. An operation was exercised, but the contract relied on behavior it did not establish.
- F2. A successful process exit can also hide this gap. Framework `issues/closed/about-titles/fixture-weave-recorder/review-B.md`, “F2. Baseline residue bypasses the required copy judgment”, shows an exit-0 recording with zero copy-judgment sessions. “F1. Capture the baseline before any session” shows the supposed baseline measured after writing. Proof must establish the relevant property, including its timing and consumers, rather than merely complete a call.
- F3. Existing mechanisms already cover structure and inputs. `src/readiness.ts`, `proofSchema` and `gaps`, requires nonblank proof fields but checks only missing env/file inputs. `skills/chart-issues/assets/shapes.md`, “Preflight and validation”, already assigns prose quality to the agent audit. No new parser, schema field or command refusal is needed to compare the recorded result and limits with a criterion.

## Material forks

### Q1. Which promise must the door establish before handing off work that changes behavior?

- O1. Keep proving each named external operation only. Cheap, but F1 remains possible whenever downstream acceptance is excluded.
- O2. Establish the key existing assumption the proposed criterion depends on, through its real consumer, while leaving the requested implementation to the leaf. Recommended under locks 3a and 4a. This covers failed calls, partial calls and misleading successful exits without requiring the finished product before handoff. The boundary between a prerequisite assumption and the new behavior must be explicit.
- O3. Require every final criterion to pass before handoff. This makes new implementation impossible to hand off and invites scratch implementations that duplicate the eventual leaf.

Grounding: `skills/chart-issues/SKILL.md`, “Take” operation-proof paragraph and “Handoff” contract audit; `standing-design.md`, “Standing design lines”, cheapest sufficient proof and prerequisite machinery rules; F1–F2. Low confidence: the general rule cannot mechanically identify which assumption is decisive. That remains an agent judgment exposed at review.

### Q2. What makes the one small approved test sufficient?

- O4. Count a paid launch or provider validation as success. It controls spend but can stop before the relevant consumer, repeating the missing-copy-judgment failure.
- O5. Choose one representative case that reaches the promised boundary with the relevant identity, inputs and settings, and record both the observed property and remaining limits. Recommended. Existing recorded outputs can support unchanged stages under standing design. A passing sample still leaves variability and other cases unproven.
- O6. Keep paying until broad confidence or a clean full run. This expands charting cost and encourages treating approval for one test as approval for a campaign.

Grounding: `SKILL.md`, “Take”, setting-specific proof and grant rules; `standing-design.md`, “Standing design lines”, recorded-output and smallest-fresh-interaction rules; framework recorder report, “Renewed check.repair proof (B, 2026-11-03)”. Practitioner issue: a small test can contain several nested paid sessions. Lock 3a does not itself set their approved count or cost, and grant accounting belongs to #126.

### Q3. What happens when the decisive property remains unproven?

- O7. Preserve the full promise and hold whenever the probe is declined or insufficient. This follows today's Take wording but contradicts lock 3a and can park work whose smaller scope is already supported.
- O8. Remove the unsupported promise from the proposed contract and make the remaining observable outcome and lost scope visible at review. Recommended under 3a. If that removes the chart's useful outcome, return that material scope choice instead of calling a vacuous contract ready. New paid approval remains the operator's even under autopilot.
- O9. Show a warning and retain the unproven promise. This transfers the same design decision and paid discovery to the leaf. Lock 2b concerns exceeding an approved run bound, not permission to claim an unproven property.

Grounding: `SKILL.md`, “Take”, “Handoff” scope narrowing, and “Autopilot” operator-only approvals; `issues/chart/round-drawings/forks/signposts.md`, “Taken”. Under autopilot A can choose ordinary scope within the locks, but cannot supply the paid-test approval itself.

### Q4. Where should the rule live so it survives the port without adding parts?

- O10. Extend the existing Take proof rule and have the existing handoff audit apply it, using current proof records. Recommended under 1c, 4a and 6a. Any necessary shape or standing-design clarification must agree with that single rule rather than create independent policy copies.
- O11. Add criterion IDs, a coverage schema, a linter or a command gate. This adds maintenance and migrations, cannot judge semantic sufficiency from prose, and violates 1c.

Grounding: `SKILL.md`, “Take” and “Handoff”; `shapes.md`, “readiness.yaml” and “Preflight and validation”; `src/readiness.ts`, `proofSchema` and `gaps`. `issues/chart/herdr-app/INTAKE.md`, “What I want” and “How I picture it”, replaces orchestration helpers while retaining skill briefs. `~/.config/herdr-app/AGENTS.md`, “Two programs”, separates the app from hc. Proof reasoning has no dependency on either terminal interface.

## Practitioner questions

- Q5. What exact observation would establish the assumption, and does the chosen command reach that observation rather than an earlier gate? The original recorder proof stopped at `VERIFY_COPY_VERDICT_MISSING`. Grounding: framework `title-source.md`, recorder-launch proof.
- Q6. Does acceptance inspect unchanged data, a baseline captured before mutation, and every required judgment? Otherwise the chart may approve a rule whose ownership is impossible to satisfy. Grounding: framework `review-B.md`, F1, F2 and “Renewed invocation 2: copy judgment exposes existing unnamed-unit debt”.
- Q7. Does an existing recording still match the model inputs, pin, settings and consumer contract? Reuse should follow the existing validity rule rather than trigger another paid run by default. Grounding: `standing-design.md`, “Standing design lines”, recorded-output rule.
- Q8. Is the missing capability product work or proof machinery? New machinery already has a prerequisite-leaf rule. Grounding: `SKILL.md`, “Handoff”, and `shapes.md`, “Preflight and validation”. This chart should not create a second readiness system for that case.

## Conflicts and lifetime pitfalls

- R1. Direct conflict: Take says “scope is not narrowed” when no safe sufficient probe exists and holds a declined required probe. Lock 3a requires cutting an unapproved promise to what is proven. Handoff already allows narrowing, so changing one paragraph alone risks leaving contradictory instructions. Grounding: the named Take paragraph, “Handoff”, and signposts “Taken”.
- R2. Approval and bounds must stay distinct. Take's grant rule requires new approval for larger effects, while Autopilot forbids A raising a bound. Lock 2b allows a paid run past a bound with a warning. #126 owns that reconciliation. A proof-gap rule must neither restore a hard count stop nor treat the warning as authority for a different paid operation. Grounding: Take grant paragraph, “Autopilot”, and signposts “Taken”.
- R3. Limits remain useful even after a successful sample. One observed pass is not every-case reliability, and an exit code is not the property. Do not demand empty limits or match fixed phrases in them. Grounding: `proofSchema`; `shapes.md`, “readiness.yaml”; framework `review-B.md`, F2; `standing-design.md`, model-judged target-size proof rule.
- R4. Apply to new handoffs only. The example leaf is closed and its final criterion was amended before acceptance. Do not rewrite its historical proof or repair framework recordings. Grounding: signposts 5a; framework report, “Accepted scoped proof (B, 2026-11-04)”. Installed `~/.claude/skills/chart-issues` currently resolves into `~/.akrogon/releases/9ee76bf68893076a541de83626390e65d07bc2bf/skills/chart-issues`; changing the repository source alone does not change a running door's loaded instructions.

## Confidence and split

High confidence in the recorded proof/criterion mismatch and the rule conflicts. Low confidence that one small test would have exposed every later policy choice. The reviewed records establish failures and the final scoped acceptance, not that the original operator was unaware of the limits. I have not inspected the original handoff-review text.

Propose one leaf in akrogon for the written proof-to-promise rule and its existing handoff references. These surfaces express one decision and can be reviewed together. Keep grant counting in #126, presentation in #125, and terminal orchestration in herdr-app. No command changes, new files for proof machinery, open-leaf migration or framework repair are needed for this scope.
