This round decides when several leaves must share one test of their combined flow, who keeps it current, and which inputs may be saved recordings. The cheapest-sufficient-proof rule is already settled. The end-to-end artifact rule stays, and no time budget or new lifecycle gate is added.

Path key: `AK` = `/home/ivan/Work/infra/akrogon`. `FW` = `/home/ivan/Work/infra/tamdoma/framework`. `FN` = `FW/issues/open/satellite-network-simplify/satellite-foundation/fixture-network`. `RUN` = `FW/.claude/workspaces/seo/satellite-network/test/run-fixture-network.ts`.

### 1 · Should each leaf connect its changed step to the shared flow test before it can merge?

The first fixture leaf already told later leaves to replace saved steps with real code (`FN/brief.md:4,42`). Some steps now run real producers, but content and build still copy saved files (`RUN:604-653,568-580`). For example, the build leaf could pass its own tests while the shared test keeps checking yesterday's saved HTML.

Research: **operator** · `FN/brief.md:21-24,42` and `FN/design.md:68`, read 2026-09-29 · the original contract required growth, but left the later owners' obligations outside that first leaf's control · put the obligation in each affected leaf. **Better-than-training** · `RUN:285-290,568-580,648-668` and `AK/skills/chart-issues/assets/shapes.md:148,170`, inspected 2026-09-29 · copying recorded output can bypass changed code even when the command passes · require evidence of the actual connection, not just a green result.

- **1a (recommended)** Yes. Reuse a suitable command, or make the smallest shared flow test part of the earliest relevant leaf. Each affected leaf names the step it adds or updates and passes its real output into the next real consumer and its checks. Its done-criteria name the command and the remaining recorded parts. When a later step does not exist yet, name its future owner in that owner's contract. Keep the command in the repository's blocking checks, directly or through an existing suite. This makes each owner close its own gap before merging.
- **1b** Require only separate tests in each leaf, then connect them in a final proof leaf. This costs less at the start, but leaves mismatches between steps to the final run.

Pitfalls: Do not create a separate foundation leaf if an existing command or the first feature leaf can do the job. Do not accept a changed label from “recorded” to “real” as proof: `RUN:668` labels review real, while `RUN:399-428` supplies passing judgments. It proves some record-handling code, not the quality judgment.

Apply 1a in **chart-issues** and **shapes**: the handoff audit checks each affected leaf's owner, connection and command. Existing merge instructions already run every blocking check after rebase (`AK/skills/merge-issue/SKILL.md:33-45`), so no new merge procedure is needed. Clarify the “no fixtures” shorthand in `AK/skills/implement-issue/ponytail.md:30` to allow small recorded inputs explicitly required by the design. Keep its preference for minimal checks and reuse. The user-visible E2E requirement remains separate and unchanged (`standing-design.md:9`).

### 2 · Should this rule apply whenever one leaf's work feeds another leaf's part of the same flow?

Use the actual dependency, not the folder name. For example, one leaf writes page data and another renders those pages, so their shared flow needs a connected test. A keyboard shortcut and an unrelated billing fix do not need one just because they share an epic (`AK/skills/chart-issues/SKILL.md:41`, `assets/shapes.md:118`).

Research: **better-than-training** · the charting lines above, inspected 2026-09-29 · the factory already orders work by real dependencies · use the same test for this rule's scope. **Practitioner** · Toby Clemson, a Thoughtworks developer with large distributed-system experience, [Testing Strategies in a Microservice Architecture](https://martinfowler.com/articles/microservice-testing/fallback.html), read 2026-09-29 · separate component tests do not prove that components cooperate to deliver a complete result · this supports applying the rule to connected behavior, regardless of issue layout.

- **2a (recommended)** Yes. Apply it when a chart splits one working flow across leaves and one part consumes another's data, events or state. The chart names the connection and which leaves affect it. Unrelated leaves stay outside it. A shared command may run several small connected cases. This covers two-step flows without turning every epic into a large test project.
- **2b** Apply it only when the chart explicitly calls the work a pipeline. This is simpler to label, but the same producer/consumer risk can escape under a different name.

Pitfalls: Sharing a file, library or epic is not enough by itself. Do not order independent work merely to make a test sequence tidy. Use only actual prerequisites, as `shapes.md:118` already requires.

### 3 · Should routine tests replay only expensive or external work, while running our own changed code and checks for real?

A saved model response can let real preparation, assembly and validation run cheaply. Saving the whole content folder instead skips those steps (`RUN:285-290,648-650`). The fixture design also allows invented model outputs, and the runner creates fixed audit scores and passing reviews (`FN/design.md:154`, `RUN:146-169,399-428`), so “recorded” does not currently guarantee a real source.

Research: **operator** · the fixture design and runner above, read 2026-09-29 · an apparently complete flow can contain invented success evidence · distinguish real recordings from authored test cases and state what each proves. **Practitioner** · Martin Fowler, [Contract Test](https://martinfowler.com/bliki/ContractTest.html), read 2026-09-29 · saved substitutes can drift from external services, and separate checks against the real service should follow that service's changes · add a reason to refresh recordings even when local code is unchanged.

- **3a (recommended)** Yes. Run our own producers, consumers and checks for real. Replay costly model or external responses where that still proves the selected behavior. Positive recordings used to stand in for a producer name their source, relevant version or revision, capture inputs and how to capture them again. Keep small authored negative and edge cases, clearly identified. A live probe is required when the changed behavior itself needs it, or when the recording's compatibility is no longer established. Name that trigger and its owner in the design. For example, test a CSS fix on real rendered pages using saved prose, but test a changed writing instruction with a real writing session.
- **3b** Run model and external steps live in every shared check. This gives fresher integration evidence, but repeats paid or slow work even when only local code changed.
- **3c** Keep schema-valid invented positive outputs. This is easy to maintain, but shows only that consumers accept the invented data. It does not show that the producer can supply it.

Pitfalls: A recording must not replace the behavior being tested. Real browser behavior still needs real browser evidence, and auth must never be mocked (`AK/skills/chart-issues/assets/standing-design.md:3,9`). A capture date alone does not prove freshness. Keep skipped checks explicit. This does not add a scheduled test service or relax charting's existing external-operation proof rule (`AK/skills/chart-issues/SKILL.md:53`).

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check

Clemson supports a small connected flow test, while Fowler explains why external-service proof may need a different schedule from local changes. Together they support a cheap routine command plus named live checks where needed. Clemson also suggests time budgets and deleting lower-value E2E tests. Those recommendations do not apply here because the operator has locked no numeric budget and no removed checks. Recording all positive substitutes is stricter than either source requires. The local history of invented outputs is the reason for that choice, not a claim of universal practice.

Two map statements need narrowing. The shared test was partly grown: `RUN:604-643` runs real producers, so “never grown” overstates the gap. Also, this runner already records per-step durations (`RUN:710-715`). Those fields do not establish the live replay's costs, but should be reused rather than duplicated if measurements are needed. This inspection read code and contracts. It did not run the framework tests or establish whether every earlier leaf fulfilled its proof.
