# proof-leaf-policy, slot A

Evidence: live-replay design.md:48 excluded fixing found defects (owning leaf reopens); design.md:119 and brief.md:36 forbade source edits after the run's commit; the 2026-09-29 overrides (design.md:41-42) allowed in-branch fixes, resume and finally dropped the clean rerun. implement-issue/SKILL.md:31 seats never ask; :37 a locked decision is never changed in implementation notes. The plan's checker halts at the first failure (plan.md D7).

Q1 in-branch fixes: 1a yes, bounded by "no locked decision changes and no new user-visible behavior". Each fix lands in the owning code with a fail-first test and is reviewed with the proof leaf. A defect past the bound ends the pass with `failed` and a named reason, as today. Reason: M1, each defect cost a full lifecycle. Alternative 1b reopen owner leaf: days. 1c diff-size cap: arbitrary, and a one-line fix can still change a locked decision.

Q2 resume: 2a yes. A run may reuse a finished stage when the stage's code, inputs, config and upstream artifacts are unchanged since it ran; changed stages and everything downstream rerun. The report names what was reused and why. Reason: the build-system rule (rebuild what changed and its dependents). Pitfall: old-tree/new-gate skew (report.md:74-83).

Q3 collect-all: 3a yes for failures that can be judged on valid inputs; downstream checks after a failed stage are marked blocked, not passed. Stand-ins may feed later stages only in a diagnostic run and never count as acceptance. Reason: rehearsals found several defects per pass (report.md:707-722).

Q4 final evidence: 4a a final run where every stage either ran at final HEAD or is proven unchanged since it ran (same reuse rule as Q2). That is as strong as a clean run and costs only the changed part. 4b one clean from-scratch run: strongest story, repeats hours for no new proof. 4c resumed run with a list of waived invariants (what the operator did): weaker, because waivers replace proof.
