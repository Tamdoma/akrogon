This round decides how a proof leaf handles failures without repeating work that still has valid evidence. It separates fixing code, reusing earlier results, collecting failures and choosing final proof. The settled test-selection and shared-flow rules stay unchanged.

Paths: `AK` = `/home/ivan/Work/infra/akrogon`. `LR` = `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-network-simplify/satellite-route/live-replay`. Local evidence and linked sources were read on 2026-09-29. The live files have changed since the opening map, so the report line numbers below are current to this inspection.

### 1 · May the proof leaf fix a defect in an earlier leaf's code when the intended behavior is already settled?

The original design sent every discovered defect back to its owner. The operator later allowed repairs in the proof branch (`LR/design.md:41,49`). For example, correcting the renderer's missing mobile stacking rule implements the existing requirement, while changing which layouts count as different changes the requirement (`LR/implementation/report.md:28,39-44`).

Research: **operator** · the design and report above · separate repair leaves delayed the proof, but some fixes needed explicit decisions · allow bounded repairs without giving the implementer authority to redefine success. **Better-than-training** · `AK/skills/implement-issue/worker-protocol.md:21-25` already makes B repair integration failures between workers, while `SKILL.md:37,53` preserves locked decisions · extend repair ownership through the charted contract.

- **1a (recommended)** Yes. The chart gives the proof leaf ownership of code repairs needed to meet its existing criteria, including defects in merged upstream code. Each repair gets a fail-first check, updates the shared flow test where needed, and receives normal review. It must preserve locked decisions, acceptance rules and unrelated behavior. This avoids a new lifecycle for a correction whose intended result is already clear.
- **1b** Always send such defects to a separate owner leaf. This keeps narrower branches but repeats planning and handoff even for straightforward repairs.

Pitfalls: Bound this by behavior and scope, not a line count or the word “small.” A new feature, unrelated cleanup or changed acceptance rule is outside the grant. Record a locked conflict for review instead of rewriting the contract or asking a lifecycle question (`AK/skills/implement-issue/SKILL.md:31,37`). Charting owns any new leaf. The new framework calibration override at `LR/design.md:43` is specific operator authority, not a general permission to weaken checks.

### 2 · May debugging restart from the earliest affected step instead of the beginning?

A renderer-only fix need not regenerate unchanged prose. But a newer gate once required `chrome.json` that an older run never produced, so the old tree could not support that gate (`LR/implementation/report.md:95-104`). Restarting only the last failed step would miss that dependency.

Research: **operator** · the old-tree/new-gate example above · earlier output can become invalid after a change · resume from the earliest affected step. **Practitioner and primary documentation** · Jenkins maintainers Jesse Glick and Andrew Bayer's [stage-restart work](https://issues.jenkins.io/browse/JENKINS-45455), plus [Running Pipelines](https://www.jenkins.io/doc/book/pipeline/running-pipelines/#restart-from-a-stage) · Jenkins preserves the original source information, parameters and saved files · reuse needs identified inputs, and Jenkins restart alone does not justify mixing revisions.

- **2a (recommended)** Yes, when the report names the old run, changed code, relevant dependencies and settings, retained inputs and artifacts, and why those retained results still apply. Rerun the earliest affected step and every affected consumer after it. If validity cannot be established, regenerate from the last trustworthy boundary, or from the start if none exists. This saves only work whose result still counts.
- **2b** Always restart debugging from the beginning. This avoids the reuse decision but repeats unchanged expensive work after each local fix.

Pitfalls: Existing files are not proof of valid files. Record which revision each reused result came from. Preserve failed logs and account for partially completed writes before retrying. Do not repeat a purchase or other external mutation merely because its reply was lost. Use the consumer's existing recovery behavior. These rules do not skip required full-suite or blocking checks (`AK/skills/implement-issue/SKILL.md:45-47`).

### 3 · Should a proof run report all failures it can still check correctly?

One review pass found both mobile overflow and layout clashes (`LR/implementation/report.md:786`). By contrast, the receipt checker was planned to return only its first failure (`LR/plan.md:29`). Two independent problems can be reported together, but a missing build leaves nothing valid for a browser to inspect.

Research: **operator** · the report and plan above · useful failures can be collected together · continue independent checks and identify blocked ones. **Better-than-training** · Buildkite's [Promise job failure](https://buildkite.com/docs/pipelines/configure/promise-job-failure), from its pipeline implementation team · remaining tests can run while the build is already failing · collecting more evidence need not turn failure into success. The practitioner searches found no stronger case establishing how far this particular pipeline can continue safely.

- **3a (recommended)** Yes. Report failures as they appear and run every remaining check whose required inputs are valid. List checks that could not run and why. Finish unsuccessfully if a required check failed or remained blocked. This finds more defects per pass without hiding any.
- **3b** Stop the entire run at the first failure. This saves work after that point, but may require another run to discover an independent problem already present.

Pitfalls: “All failures” means all currently checkable failures, not defects behind missing prerequisites. Continue test observations, not release actions past a failed gate. The factory supplies the design rule. It does not need a new generic pipeline runner or a catch-all error handler.

### 4 · May a diagnostic run use temporary substitute data to look past a known failure?

A rehearsal inserted a missing link, then found a separate author-shape defect (`LR/implementation/report.md:774-776`). That helped locate problems. It did not prove that the real writer would produce the inserted link.

Research: **operator** · those rehearsals and `LR/implementation/report.md:798-804` · temporary substitutions exposed later faults while formal proof remained incomplete · permit diagnosis but keep its results separate from acceptance. This is a recommendation from the inspected case, not a claim that external pipeline tools guarantee its validity.

- **4a (recommended)** Yes, in an isolated diagnostic copy. Name each substitute and what it bypasses. Mark its downstream results diagnostic only. After the real fix, rerun every affected stage and check using real output before claiming acceptance. This lets the agent investigate later stages while the known defect remains unresolved.
- **4b** No substitutes. Continue only on valid real output and fix each blocking producer first. This is simpler to track but can delay discovery of later faults.

Pitfalls: Never copy diagnostic artifacts into final proof, forge a passed gate or overwrite the original evidence. A new finding under substitute data must be reproduced on valid inputs before it becomes an acceptance blocker. This permission does not change the settled ban on hand-patching positive recordings used by the routine shared test.

### 5 · May final proof combine valid earlier results with rerun stages, or must it always start clean?

The original brief required one uninterrupted run at one revision (`LR/brief.md:35-36`). The operator later allowed a resumed proof (`LR/design.md:42`). For example, a CSS fix may reuse unchanged content, but proving that a fresh checkout boots correctly requires actually starting from a fresh checkout.

Research: **operator** · those conflicting proof requirements · the acceptance contract must choose what the run needs to establish · prefer reuse only where every criterion still holds. **Better-than-training** · Jenkins' [restart documentation](https://www.jenkins.io/doc/book/pipeline/running-pipelines/#restart-from-a-stage) preserves original inputs · it supports restarting a fixed run, not claiming an old result tested changed code. The clean-run triggers below are an inference from that limit and the local contracts.

- **5a (recommended)** Accept combined evidence when the design permits it and the reuse argument in question 2 shows that every criterion still holds. Require a clean run when fresh-start behavior, uninterrupted ordering or whole-run interactions are themselves under test, or when no trustworthy restart boundary remains. The chart states this before handoff. This makes a full restart serve a named proof requirement.
- **5b** Always require one clean final run after debugging. This gives one simple run history, but repeats stages even when their earlier results remain sufficient.

Pitfalls: A resumed run does not inherently weaken proof. If it leaves a required property unproven, listing a “weakened invariant” does not make it pass. Only explicit operator authority may change that requirement. Keep true source revisions and artifact identities instead of relabeling old evidence as final HEAD. Missing evidence remains a material review issue (`AK/skills/check-issue/SKILL.md:41,47`).

Reply `1a 2a 3a 4a 5a`, or a numbered free-text answer.

Challenge check

The hard part is proving which earlier results remain valid. If explaining reuse costs more than a short clean run, the settled cheapest-sufficient-proof rule favors the clean run. Jenkins supports restarting with preserved inputs, and Buildkite supports collecting more results while retaining failure. Neither establishes that arbitrary results from different revisions form valid proof. The local design must establish that link. Diagnostic substitutions add bookkeeping, so question 4 keeps a simpler alternative explicit. No automatic retries-until-green, new lifecycle states, relaxed checks or edits to ponytail are proposed.

Charting and shapes own repair scope and final-proof requirements. Planning names the restart boundary and required evidence. Implementation records repairs and reused results in its existing report. Review judges that evidence under the current rerun rules. `AK/skills/chart-issues/assets/shapes.md:148,168-170` keeps contract ownership at handoff, and work under `issues/` remains an operator step.
