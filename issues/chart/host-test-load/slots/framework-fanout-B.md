# Slot B: framework-fanout

Blind read-only notes, 2026-10-13. No peer fan-out notes read, framework edits made or suites launched.

## 1. Pick and cost
**D1: Defer a framework fan-out chart until measured evidence requires it.** Complete the already required rerun with the taken permit/containment and exact slice policy first. The 239-second successful single run changes my earlier “necessary complement” position, which preceded that completed measurement and the aggregate ceiling decision.
**D2: Do not select browser or branch counts now.** If the rerun materially worsens wall time or introduces browser timeouts, follow ceiling-values Taken: remove the quota and reopen that fork. Use its evidence to decide whether a separate framework chart is needed. Do not silently reduce fan-out to preserve the quota or promise that fan-out will never need attention.
Cost: accept the current internal concurrency, with no exact browser/task-count bound. Avoid a second scheduler and another repo change until the required proof identifies a defect. CPUQuota limits aggregate CPU time, not browser count, runnable tasks or dedicated cores. Desktop usability under the exact policy remains unproven.

## 2. Rejected options
**O1: Open and implement pool caps now.** The single-run measurement passed with no core dumps or surviving browsers. Its peak counts alone do not identify harmful concurrency, a safe pool size or an improvement in completion time.
**O2: Serialize core branches or all site captures by default.** This trades parallel work for longer waits and may reach existing timeouts. The capture source explicitly records subprocess overhead as its reason for parallelism. Treat that comment as a design rationale, not a measured serial benchmark.
**O3: Decide “never”.** A quota can expose timeouts, memory pressure can change with more seats, and CPU/memory limits do not constrain every resource. Revisit on a reproducible problem rather than ruling out consumer-level control permanently.

## 3. Evidence, tier and date
**E1, inspected primary source, 2026-10-13:** registered root is `/home/ivan/Work/infra/tamdoma/framework` (`config.yaml:19` in akrogon), HEAD `d09a6f323f6fd3d36db9597d9adc1625ebd13cc5`, matching measurement 2. Its `package.json:167` runs eight core branches with --parallel and --no-exit-on-error. The brief's line 165 is now bun:verify-pin. [Bun's primary CLI documentation](https://bun.sh/docs/runtime) confirms parallel script execution.
**E2, inspected primary source:** framework `.claude/skills/dev-render-satellite/test/site-nav-e2e-run.ts:42-44,550-563` launches ten isolated capture browsers through Promise.all and closes each in finally. Its interaction stage shares one Playwright browser across concurrent site contexts (`638,644-653,703-704`).
**E3, inspected primary source:** framework `.claude/skills/dev-render-satellite/test/site-nav-e2e.test.ts:30-34,81` has a 780000 ms child timeout and 800000 ms test timeout. `package.json:199` also includes --parallel=4 on the renderer test command. A core-branch limit would not directly establish a global browser-instance limit across these nested layers.
**E4, operator:** `forks/limit-boundary.md:45-52` records 239 s, 409 Chrome processes, 6138 tasks, reported 15.9 GB, roughly 8.3 average CPUs, no core dumps and complete browser cleanup. `forks/ceiling-values.md`, Taken, selects weight 20, quota 1600%, high/max 64G/96G and no swap, conditional on a rerun that has not yet been recorded as passed.

## 4. Pitfalls and what removes each
**R1: Treat 409 Chrome processes as 409 browser instances or load 40 as forty CPUs consumed.** Preserve the measured units and inspect actual launch/context concurrency before proposing counts. Neither number alone proves that fewer launches would finish sooner.
**R2: Defer consumer work and accidentally waive the ceiling proof.** Keep the exact-policy suite rerun mandatory before handoff, checking wall time, failures, throttling, memory and cleanup. Compare the same revision and capture browser-specific timeout evidence. A failed proof reopens the taken ceiling choice.
**R3: A later cap weakens coverage or breaks cleanup/timeouts.** Any future framework chart must preserve all ten sites, capture states, interaction assertions and finally cleanup, then demonstrate correctness and timing under the real budget. Measure a targeted concurrency change before selecting its value. Existing selector-breadth work remains with its current owner.

## 5. Missing questions
**Q2: What wall-time change counts as “materially worse” for the pending quota rerun?** The Taken condition needs an operator acceptance threshold or explicit judgment on the measured result before a leaf treats the policy as proven.
**Q3: Must framework have a browser-instance limit independent of akrogon, including manual unboxed runs?** That is a different promise from this chart's boxed resource/admission boundary. If required, it justifies its own framework chart even when the quota rerun passes.
