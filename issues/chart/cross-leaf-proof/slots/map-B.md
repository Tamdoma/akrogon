# Territory map B

## Destination

Akrogon produces leaf contracts and plans that choose the smallest test which proves the changed behavior, catch producer/consumer defects before final integration, and reuse valid evidence without hiding untested work. Preserve the mandatory end-to-end artifact for user-visible flows. This is a factory change, not a repair of framework live-replay.

Evidence notation: `AK` = `/home/ivan/Work/infra/akrogon`. `EP` = `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-network-simplify`. `LR` = `EP/satellite-route/live-replay`. All citations are inspected local file lines, read 2026-09-29. AK HEAD and local origin/main both resolve to `ea43b14eaa195c168d078b291eefd2fc3c5f4586`. No remote freshness claim.

## Findings that change the map

- **F1: A1 partly existed already.** `EP/satellite-foundation/fixture-network/brief.md:4,18,21-24,42` specifies a first pipeline fixture, real producers into consumers, a blocking command, and replacement of recorded steps by later leaves. Repeating “spine first” alone cannot fix this case. Its design explicitly permits implementer-authored model outputs and skips browser/tool-dependent checks (`design.md:152-154`). The missing pool gate is concrete: `LR/implementation/report.md:613-628`.
- **F2: The report's shorthand overstates the evidence.** The run history includes harness defects and rehearsals discovering several failures, not literally 17 separate multi-hour runs for 17 product defects (`LR/implementation/report.md:695-722`). The content and review contracts already required live sessions (`EP/satellite-content/content-batch/brief.md:35`, `EP/satellite-render/satellite-review/brief.md:43`). This inspection does not establish whether all those earlier proofs were fulfilled adequately.
- **F3: Scope and proof locks amplified each defect.** The original design excluded fixing anything found and required one revision (`LR/design.md:48,119`). Overrides allowed in-branch fixes, resumption, then dropped the full restart (`LR/design.md:41-42`). The leaf remains `implement` (`LR/state.yaml:2-3`). No measured stage-duration breakdown supports a numerical speedup promise.

## Material forks

These are recommendations, not settled operator answers. Take Q1 first because it changes the remaining test requirements.

### Q1 — What must justify an expensive test instead of a smaller proof?

**Recommend:** charting fixes the proof boundary and required live behavior. Planning maps each criterion to the cheapest sufficient command, existing evidence, expected cost, and rerun trigger. A larger run needs a named property smaller tests cannot prove. Keep one real end-to-end artifact for each affected user-visible flow, using existing commands where sufficient. Do not interpret that requirement as regenerating an entire network for every renderer fix.

**Evidence and home:** standing design already requires E2E but says nothing about total pipeline breadth (`AK/skills/chart-issues/assets/standing-design.md:7-9`). Planning owns concrete verification (`AK/skills/plan-issue/SKILL.md:55-57`). Implement and review already discourage unchanged reruns (`implement-issue/SKILL.md:25,39,45-47`, `check-issue/SKILL.md:49`). Put scope decisions in **chart-issues/shapes**, the general minimum-proof principle in **standing design**, test selection in **plan-issue**, execution evidence in **implement-issue**, and verification adequacy in **check-issue**. Keep configured blocking checks intact. **No routing code change.**

### Q2 — A1: Must every epic begin with an entirely live spine, or must each pipeline change join the existing integration proof?

**Recommend:** apply to genuinely coupled pipelines. Establish the smallest executable route early, then require every changed deterministic producer to feed its actual consumers and gates before its leaf merges. Name the owner of each replacement and remaining recorded boundary. Use real captured outputs for expensive model/external boundaries, with live probes where their behavior is itself changed. Independent leaves need no artificial ordering.

**Evidence and home:** F1 shows a spine without complete gate coverage. `AK/skills/chart-issues/assets/shapes.md:118,148,170` already supports real dependencies and matching cross-leaf owners. Put ownership and evolving coverage in **chart-issues/shapes**, commands in **plan-issue**, and evidence checks in **check-issue**. Existing **merge-issue** runs every configured check after rebase (`SKILL.md:33-45`), so prefer the existing consumer test command over another merge mechanism. An all-live subscription run before every merge risks recreating the delay.

### Q3 — A2: Which failures can one pass collect, and when may a run resume?

**Recommend:** collect all independently evaluable failures on valid artifacts, then fail the command. If an upstream failure prevents downstream evaluation, mark those checks blocked, not passed. Never manufacture valid input merely to continue. Permit reuse only with a stated dependency argument covering changed code, inputs, configuration and artifact provenance. Rerun the affected stage and dependent consumers. A diagnostic stand-in is never acceptance evidence.

**Evidence and home:** first-failure checker behavior is explicit in `LR/plan.md:29`. The review already collected 28 findings together (`LR/implementation/report.md:46-53`), while old output/new gate skew invalidated reuse (`:74-83`). Decide the acceptance/resume boundary in **chart-issues**, specify stage dependencies in **plan-issue**, and record reused versus fresh evidence in **implement-issue/check-issue**. Aggregation itself belongs in a **consumer runner**, not `AK/src/routing.ts:26-43`, which routes lifecycle seats. Do not create a generic runner in akrogon for this report.

### Q4 — A3: Must every fixture be captured, including deliberately invalid cases?

**Recommend:** require provenance and a regeneration command for positive fixtures standing in for another producer. Prefer executing deterministic producers directly. Keep small authored negative/edge cases, clearly distinguished from recorded compatibility evidence. A consumer schema alone cannot establish that a fixture resembles producer output.

**Evidence and home:** authored records are explicitly allowed at `EP/satellite-foundation/fixture-network/design.md:154`. Missing provenance fields concealed real shape mismatches (`LR/implementation/report.md:543-588`). Put fixture source/ownership in **chart-issues/shapes**, capture or generation choices in **plan-issue**, actual provenance in **implement-issue**, and producer compatibility review in **check-issue**. Avoid a second mandatory manifest when Git and the existing report already identify source and revision.

### Q5 — A4: Should separate writer/checker implementations automatically block review?

**Recommend:** share deterministic domain rules where duplication can drift. Preserve independent assertions about observable output. Block a concrete contract or maintainability defect, not every independent checker. Agent instructions and a semantic reviewer cannot always import one function.

**Evidence and home:** prep and verify rebuilt different allowlists (`LR/implementation/report.md:277-285`). Conversely, token-pair correctness did not prove real button contrast (`:253-260`). Ownership belongs in **chart-issues**, shared-rule choices in **plan-issue**, and the targeted review question in **check-issue**. Retain its concrete Fix threshold (`AK/skills/check-issue/SKILL.md:41-45`). No universal code-deduplication detector.

### Q6 — A5: Does one passing generated sample prove a new check is achievable?

**Recommend:** require a real passing producer-to-checker example plus a failing example. Where capacity depends on scale, state the bound and test its boundary. For judgment checks, include a real accepted and rejected case under the same instructions and rubric. One lucky pass is not capacity proof. Resolve a stricter quality requirement before handoff if the generator cannot satisfy it.

**Evidence and home:** two hero and two column choices cannot satisfy pairwise uniqueness of each slot across four sites (`LR/implementation/report.md:194-219`). Short-label uniqueness was absent from worker guidance (`:242-251`). The capacity contract belongs in **chart-issues/design**, proof selection in **plan-issue**, execution in **implement-issue**, and adequacy in **check-issue**. Actual capacity checks belong in the consumer's producer/checker code. This does not justify weakening a failed rule during implementation.

### Q7 — Who owns small integration defects discovered during proof?

**Recommend:** chart integration leaves with authority to repair bounded defects needed for their existing acceptance, with a local regression test and normal review. New behavior or changed design stays an operator decision. This prevents routine defects needing a fresh lifecycle while keeping scope explicit.

**Evidence and home:** original exclusion and overrides at `LR/design.md:41-48`. **Chart-issues** must establish ownership before handoff because **implement-issue** cannot amend locked decisions (`SKILL.md:37`) and lifecycle seats ask no questions (`:31`). No new phase or permission flag is evidenced.

## Practitioner questions

- **P1:** Which observed defect needs the full system, and which can be caught at one boundary? Mike Wacker, Google testing practitioner, argues for focused integration tests when they detect the same defect: [Google Testing Blog](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html). This supports Q1 without removing the standing E2E minimum.
- **P2:** What unique confidence does each additional test buy? Ham Vocke, Thoughtworks developer and continuous-delivery consultant, recommends fast early stages and removing duplicate coverage: [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html#AvoidTestDuplication). Ask this of both fixture and live proof, not only unit tests.
- **P3:** Which failures escaped the fast gate, and how will their next occurrence fail there? Dave Farley's deployment-pipeline experience recommends moving common late failures into commit tests while keeping broader acceptance gates: [The Deployment Pipeline, pp. 4–5](https://continuousdelivery.com/wp-content/uploads/2010/01/The-Deployment-Pipeline-by-Dave-Farley-2007.pdf). His staged approach challenges mandatory expensive acceptance before every check-in. Here, retain current blocking checks and make their routine proof small.

Sources read 2026-09-29. They agree on early, useful feedback. They do not establish safe reuse rules for this particular subscription pipeline. Q3's provenance requirement is a recommendation from the inspected skew, not an attributed practitioner prescription.

## Pitfalls

- **R1:** More prose repeating existing requirements can leave the same gap. Review actual producer-to-gate coverage and identify what remains recorded. F1 is the concrete counterexample.
- **R2:** Shared writer/checker code can share a defect. Keep independent behavioral expectations and browser measurements, as Q5 requires.
- **R3:** “Collect every failure” cannot cross missing prerequisites. “Resume” cannot relabel old evidence as a new complete run. Q3 must preserve both distinctions.
- **R4:** Mechanical tests of skill wording would test format, not agent judgment. `AK/skills/check-issue/SKILL.md:45` already rejects them. Validate these changes by having an agent apply the revised guidance to concrete supplied cases and inspect the resulting test choices.

## Fog

No sharp runtime target yet: stage durations, repeated generation cost and earlier leaf proof compliance are unmeasured. If a numerical target or automated invalidation engine is wanted, that needs separate evidence and scope. Neither is needed to settle the skill changes above. `AK/learnings/LESSONS.md:3` and the framework history treat lessons as observations, so one incident cannot establish a universal test budget.

## Off route

Exclude framework fixes, replay execution, altered quality thresholds, deployment, generic orchestration/caching, new lifecycle phases, and automatic enforcement of prose quality. The requested output is guidance in akrogon. `AK/src/routing.ts:26-43` already provides the necessary lifecycle. Existing leaf contracts under `issues/` are operator-owned, not implementation work (`AK/skills/chart-issues/assets/shapes.md:168`).

## Proposed split

One destination and one issue, preferably two leaves after the forks settle:

- **S1, fast resolution:** bounded proof selection and execution, covering Q1/Q3/Q7 across charting, standing design, planning, implementation and review. Accept by examining small renderer-fix and staged-pipeline examples for sufficient proof, explicit reuse limits and unchanged blocking requirements.
- **S2, independent once choices settle:** producer/consumer compatibility and achievable checks, covering Q2/Q4/Q5/Q6. Accept by examining real-output mismatch, missing gate, duplicated allowlist and impossible-capacity examples for early detection and named ownership.

These outcomes share files but need no implementation ordering. Do not split A1–A5 into five process leaves. Keep merge behavior and routing unchanged unless a later fork demonstrates a concrete gap they own.
