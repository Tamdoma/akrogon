# How is the charted debate decision honored?

## Question
Q3 · Keep the `debate` key and have dispatch refuse a `debate: yes` leaf sitting at `plan.synthesis` without positions files, or drop the key and rely on the chart skill writing the right phase?

### Carries
- Operator round 1 (2026-09-14), verbatim: "3 - we need to make sure the debate decision during charting is honored, this is very important."
- Lock: a leaf branch carries code only; any migration of `issues/**/state.yaml` is an operator step on main.
- Lock: `state.yaml` is the only truth; phase is the only signal. The log is diagnostic and no gate reads it.
- Related: L5 changes the chart handoff template so the phase line is derived from the debate answer instead of a sample value.

## Findings
- src/state.ts:19 is the only reader today. The start phase is what actually runs the debate (`plan.positions`) or skips it (`plan.synthesis`).
- Framework evidence, checked 2026-09-14 in issues/log.jsonl: `browser-core-launch` and `objective-coverage-line` (both charted 2026-09-13) carry `debate: "yes"` and their first log record is plan.synthesis to implement, so the debate never ran. `handoff-contract-slim` carries `debate: "yes"` and did debate (plan.positions to plan.rebuttal to plan.synthesis on 2026-09-12); its positions and rebuttal files are missing from the closed folder, a separate loss. So the key transcribed the operator's answer correctly in all three; the phase was wrong in two.
- Cause of the wrong phase: skills/chart-issues/assets/shapes.md:152 shows `phase: plan.synthesis` as a sample value and :160 states the rule in prose; the skill replaced the debate value and kept the sample phase.
- Under A the gate lives in `dispatchLeaf` before allocation: `debate === 'yes'`, `phase === 'plan.synthesis'`, and `positions-A.md` or `positions-B.md` missing from the leaf folder throws, which the existing catch reports as skipped with exit 1 before any seat starts. Recovery is editing the undispatched leaf's `phase` to `plan.positions`. About four lines plus one test. A legitimate debate leaf reaches plan.synthesis only after both positions files were written, so the check does not misfire.
- Under B nothing in the command can check the decision because the only record of it is the phase itself. The attended handoff review is the sole check, and it missed the two leaves above.
- If A, the key stays in the schema and every template, no migration, and the guide lines about it stay. If B, the migration and template deletions from round 1 apply.

## Taken
Operator answer (2026-09-14): `3a`, following the round 1 requirement "we need to make sure the debate decision during charting is honored, this is very important." The `debate` key stays. Dispatch refuses a `debate: yes` leaf at `plan.synthesis` that lacks `positions-A.md` or `positions-B.md`, reports the fix (set `phase: plan.positions`) and exits 1 before any seat starts. Reason: the key is the record of the operator's decision and the command checks the phase against it. Foreclosed: dropping the key with the state migration; the template and guide lines about the key stay. L5 fixes the chart template so the phase line is derived from the answer.
