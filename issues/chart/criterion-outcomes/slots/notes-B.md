# Slot B: proof-command-owner

## Pick, reason and cost

D1. Done-criteria lock the observable outcome, including its boundary, scenarios and required evidence strength. `plan.md` owns the executable proof command. A owns corrections to that mapping during synthesis, implementation and check.fix. B identifies a bad mapping during blind review and hands a mapping correction to A from check.repair. B does not edit the locked brief or silently substitute a passing command. A records the old command, why it was wrong, the replacement, its unchanged outcome coverage and the resulting evidence. No operator stop is needed for that correction.

This uses the existing plan and repair path rather than adding a criterion-amendment mechanism. Cost: B's discovery can require the existing handoff to A and repair review. The small skill change must explicitly include proof-command corrections in that handoff because today's check.repair rule otherwise tells B to repair command Fixes while forbidding edits to the plan's mapping.

D2. Prefer the destination's existing runner semantics when choosing or correcting a command. Preserve relevant timeout, environment, preload, isolation and scope. For #105, changing a shared-process invocation to the established isolated runner can correct the observation method without changing the required hook behavior. This is a judgment about coverage, not a rule that any green command is equivalent.

D3. For an existing brief containing a literal proof command, A may move that proof prescription into the plan only when the observable outcome is already unambiguous and unchanged. Record the interpretation explicitly. If the command itself specifies required product behavior, or removing it leaves the outcome undefined, it remains binding and needs the operator to change. This prevents the new rule from solving only future charts while giving agents no authority to invent acceptance criteria.

## Rejected options

O1. Keep exact proof commands locked and require operator amendments. Reject: preserves the #105 failure class despite the outcome remaining achievable.

O2. Let known-red satisfy an unproven done-outcome. Reject: identical base failures explain attribution, not successful acceptance. Existing configured-check comparison stays separate from the proof of each owned outcome.

O3. Run every criterion command on base before handoff and require green. Reject: new behavior deliberately needs red-before evidence, and new test files can first exist during planning. This also duplicates the planner's ownership of concrete proof selection.

O4. Allow either seat to rewrite any proof mapping whenever another command passes. Reject: creates conflicting plan authority and permits reduced coverage. Keeping A as the mapping owner follows the current restriction on B's plan edits and uses the existing correction path.

O5. Add a command registry, proof schema or command-equivalence matcher. Reject: no inspected code needs another stored representation. Runner equivalence and outcome coverage require judgment.

## Evidence

All inspected on 2026-10-19 at repository HEAD `96a96979d15bc355115a70f409ec297a9fa81587`. No external calls or reproduction of the reported framework incident were performed.

F1. Operator-placed evidence: `issues/chart/criterion-outcomes/INTAKE.md`, source Tamdoma/akrogon#105, reports the same nine base/head failures and success with the repository's `--isolate` runner. Treat the incident as reported evidence, not independently reproduced. The carry explicitly prefers removing redundancy before adding mechanisms.

F2. Primary process source: `skills/chart-issues/assets/shapes.md:353`, section “Preflight and validation”, already requires observable results and refuses named test files, assertions and counts. The opening map's “#105 criterion red at base” section identifies that the reported contract violated this rule. Tighten ownership at its existing source rather than add another command lock.

F3. Primary process source: `skills/plan-issue/SKILL.md:61-69`, section “plan.synthesis”, already maps each criterion to its boundary, state change, caught failure and command, requires existing runner machinery, and records deliberate red-first proof. This is the natural home for the command.

F4. Primary process source: `skills/implement-issue/SKILL.md:36-40`, section “Shared context”, distinguishes locked-decision stops from red proofs but does not clearly authorize correcting a wrong proof invocation before declaring unsuitable machinery. Section “check.fix”, especially `:84`, already authorizes A to correct plan decisions within the locked brief/design. `skills/check-issue/SKILL.md:81`, section “check.repair”, restricts B to appending a missing required step and changing no other plan text. That is the concrete ownership conflict to resolve.

F5. Primary process and code: `skills/check-issue/SKILL.md:63,69`, section “check.review”, distinguishes outcome scenarios from named tests and keeps blind review free of commits. `src/verify.ts:54-62,123-140,257-264` builds receipts from configured checks and compares their failing tests. `src/phase.ts:334-339` gates review/merge transitions with those receipts. These functions do not prove arbitrary plan outcomes. No receipt bypass or general known-red expansion is needed for command correction.

F6. Local case evidence: `learnings/history/2026-10-16-review-test-command-equivalence.md` records the same class for timeout semantics: the ad-hoc command timed out while the configured runner passed without product changes. Its learning supports D2 and explicitly rejects weakening required checks.

## Pitfalls and what removes them

R1. Choosing green by omitting the failing scenario. Remove through the criterion-to-boundary mapping, explicit coverage justification and review of replacement evidence. An outcome still red remains blocking.

R2. Confusing the invocation under test with the invocation used to run tests. Remove by preserving exact syntax when syntax is itself accepted product behavior. A required CLI flag or shared-process property cannot be replaced as mere proof plumbing.

R3. Treating any base-red proof as exempt. Remove by requiring positive evidence for the unchanged outcome, even when configured checks separately qualify for known-red treatment. If no valid proof exists within ownership, existing stops still apply.

R4. Discovering a runner typo and immediately declaring missing machinery. Remove by checking the existing destination runner first and correcting invocation semantics before applying the missing-machinery stop. Do not create new machinery under this authority.

R5. A corrected command widens paid/live actions, identity, targets or cleanup. Remove by retaining grant limits. A command correction supplies no new authorization.

R6. Leaving old stop wording that still calls every wrong proof a locked decision. Remove by making the same outcome-versus-proof distinction at chart audit, synthesis, implementation, blind review, repair handoff and merge return. Replace the ambiguous “wrong unit of done-criteria” language at these existing points rather than stack a separate policy on top.

## Question missing from this fork

Q1. Does the approved outcome itself require exact invocation semantics, such as running these components together in one process? If yes, that semantic constraint stays locked. If no, runner flags belong to the plan. For #105 the intake reports an isolation mismatch, but does not independently establish the full original outcome wording. The implementation must not assume that every legacy command is safely removable.
