This round decides how an epic keeps one real end-to-end test run working from early on, so leaves that do not fit together fail at the leaf that broke them, not at the last leaf. It comes now because proof-selection is settled: each check uses the cheapest sufficient test. The spine is that cheapest test for "do the stages fit together". The framework epic already had a spine, the fixture network. The problem was that some leaves never plugged their stage into it.

### 1 · When an epic splits a pipeline across leaves, must each leaf plug its stage into one shared end-to-end test?

A spine is one command that runs every stage in order on a small fixed input. In the framework, `bun run test:satellite-fixture-network` is that command. It lists each stage as either "real" (the actual script runs) or "recorded" (saved output is copied in) (`run-fixture-network.ts:604-693`). Its design said later leaves "change only their own step entries" (`fixture-network/design.md:68`). That is permission, not a duty.

What happened:
- Two leaves were required to plug in and did: plan-script ("persona, sitemap, schema, link and slot steps run real", `plan-script/brief.md:40`) and design-tokens (`design-tokens/brief.md:36`).
- Two leaves were not: content-batch added prep, finalize and verify stages that never entered the spine, and satellite-build's new renderer is a script, but the spine still copies a recorded Astro build (`run-fixture-network.ts:653`, `execBuild` at `:568-570`).
- Every one of these leaves already had to keep the spine green. Their briefs list `bun run test:satellite-fixture-network` (for example `satellite-build/brief.md:73`), and merge runs every `checks` command (`skills/merge-issue/SKILL.md:33`).

So "keep it green" alone did not help. A green spine that skips your stage proves nothing about your stage. Defects #2/#3 (plan fields rejected by content-prep) sat exactly on a gap between a stage that was plugged in and one that was not.

Example: under the rule, satellite-build's brief would say "the spine's build step runs the new renderer for real, and the recorded Astro build is deleted." Then #13, #15 and #17 (renderer CSS) could have failed there, days before live-replay.

Research: better-than-training · framework briefs and `run-fixture-network.ts`, inspected 2026-09-29 · the plugged-in leaves are the ones with a swap criterion, and keep-green was already universal · this changed the recommendation from "keep the spine green" to "plug your stage in". practitioner · Steve Freeman and Nat Pryce, *Growing Object-Oriented Software, Guided by Tests*, ch. 10, https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html · build the thinnest real end-to-end slice first, then grow each feature through it · supports "spine early, grown by each leaf". Current akrogon has no such rule: `skills/chart-issues/SKILL.md:41` and `assets/shapes.md:118` order leaves only by real dependency, and `assets/standing-design.md:9` requires an end-to-end test only for a leaf's own user-visible flow.

- **1a (recommended)** Add one standing-design line and one handoff-audit check. The line: "In a pipeline epic, one spine command runs every stage in order. The leaf that owns it lands first. Every leaf that adds, replaces or changes a stage has a done-criterion that puts that stage in the spine, real for a script and recorded-from-real for a model or outside service (question 3), and deletes what it replaces." The audit (`shapes.md:170`) refuses a handoff where a stage-owning leaf has no such criterion. This wins because it closes the gap that actually happened, and a check at handoff cannot be reinterpreted away later.
- **1b** Only require keeping the spine green. Cost: this is what the framework already did, and it did not catch the gap.
- **1c** The line without the handoff check. Cost: standing-design lines are rewritten per leaf (`standing-design.md:13`). The swap intent was already written once (`fixture-network/brief.md:4`, criterion 10) and still got dropped.

Pitfalls: the spine leaf becomes a real dependency of every stage leaf. That fits "only an actual dependency orders work" (`chart-issues/SKILL.md:41`), but the chart must write it into `blocked-by`, not leave it implied. `skills/implement-issue/ponytail.md:30` says the self-check left behind uses "no frameworks, no fixtures". That is about a single tiny self-check, not the spine. The standing line should say so in a few words, or a seat may refuse recorded outputs.

### 2 · Which epics does this apply to?

The rule costs one extra leaf and one criterion per stage leaf. It should apply only where stages hand data to each other. Today the door already writes "cross-leaf claims" that name an owner (`shapes.md:148`), so it already sees when one leaf's output is another leaf's input.

Example: satellite-network-simplify applies, since plan output feeds content-prep, which feeds the renderer, which feeds the audit. An epic of three separate bug fixes in unrelated commands does not.

Research: better-than-training · `shapes.md:148` and `chart-issues/SKILL.md:41`, inspected 2026-09-29 · the door already records producer-to-consumer claims · this made the trigger a fact the door already has, not a new judgment. model-knowledge · no practitioner source defines a trigger for "pipeline" · search for practitioner guidance on when to require a walking skeleton found only the general advice to build one at project start (2026-09-29).

- **2a (recommended)** The rule applies when at least two leaves in one chart form a chain, where one leaf's output file or data is read by code another leaf writes. The door names the chain in CHART.md's destination, and the handoff review shows it. This wins because it uses a fact the door already records and skips unrelated work.
- **2b** Apply it to every epic with a final proof or replay leaf. Cost: a proof leaf is a symptom, not the cause. A chain without a proof leaf would still break late.
- **2c** Apply it only when the operator says so at the door. Cost: this adds a question to every chart, and the default could be forgotten.

Pitfalls: a chain can be long but cheap to run. Keep the spine on small fixed inputs (four sites, not a real network) so it stays a seconds-or-minutes test, per the taken proof-selection rule.

### 3 · Which stages run real in the spine, which use saved output, and where does saved output come from?

A script (plan, renderer, audit) is cheap and exact, so it can always run real. A model session or an outside service (web search, domain purchase, deploy) is slow, costly or non-repeatable, so the spine copies saved output instead. In the framework the saved model output was written by hand: "fixture data the implementer authors to the consumers' schemas" (`fixture-network/design.md:154`). Hand-written output passed every schema but did not look like real output. Defect #1 (pool-smell rejected the fixture observations) is exactly this. The fix leaf replaced them with one real session's output (`pool-smell-freeze/brief.md:26`).

Example: content-batch would run one real writing session on the fixture sites, save its pages as the spine's recorded content step, and name the session and date. When a later leaf changes the writer's prompt or output shape, that leaf runs one real session again and replaces the saved pages.

Research: practitioner · Martin Fowler, "Contract Test", https://martinfowler.com/bliki/ContractTest.html, and "Self Initializing Fake", https://martinfowler.com/bliki/SelfInitializingFake.html, read 2026-09-29 · test against a saved copy of the real service's answers, record that copy from a real call, and run a real call separately to check that the copy still matches · this is the exact split between routine spine and live probe. practitioner · Ian Robinson, "Consumer-Driven Contracts", https://www.martinfowler.com/articles/consumerDrivenContracts.html · the consumer's expectations are checked against the producer's real output · supports recorded-from-real over hand-authored. Taken proof-selection: "a real model or external call can be the cheapest sufficient test when that behavior is under test."

- **3a (recommended)** Scripts always run real. Model and outside-service stages replay saved output recorded from one real run, not written by hand, with the producer and date named next to it. A leaf that changes a model's prompt, model, settings or output shape (or an outside call) runs one real call and re-records. That call is the live probe, and there is no live run on every merge. Small hand-written negative and edge-case inputs stay allowed, since they test rejection, not fit. This wins because the spine stays fast and its saved data looks like the real thing.
- **3b** Keep hand-written saved output, checked only against schemas. Cost: it passes schemas but misses real-output quirks, which is defect #1.
- **3c** Run real model sessions in the spine. Cost: hours per merge, which moves the live-replay delay to every leaf.

Pitfalls: saved output goes stale when the upstream script changes shape. The spine catches that, because the real script now feeds a consumer whose saved input no longer matches, but only if the leaf re-records rather than hand-patching the file. Say "re-record, never patch" in the line. Recording costs one real session per changed producer, so it belongs in that leaf's credential and prerequisite list (`chart-issues/SKILL.md:55`).

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- A practitioner could say a spine on four fixed sites misses scale defects, like #16's pigeonhole (2 hero modules across 4 sites). True. That belongs to the review-rules fork (a new check ships with a real passing example at target scale), not the spine.
- Wacker's view (Google Testing Blog, 2015) is that end-to-end suites grow slow and flaky. 3a keeps model and outside stages recorded, so the spine stays a script-speed test, and 2a limits it to chained epics.
- Someone could argue the handoff check in 1a is prose policing. It checks function, whether a stage-owning leaf has a criterion that puts its stage in the spine, not wording. That matches the operator's function-over-form rule.
- Open to the proof-leaf-policy fork: with a grown spine, the final live replay should prove only what recorded stages cannot (real sessions end to end). That fork decides how it runs.
