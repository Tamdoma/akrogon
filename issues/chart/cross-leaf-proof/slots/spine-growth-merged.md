# spine-growth, merged round

Evidence (A,B,C): plan-script brief.md:40 and design-tokens brief.md:36 had a criterion to swap their step to real and did. content-batch and satellite-build had none; the spine still copies recorded content and a recorded Astro build (run-fixture-network.ts:648,653) and has no prep/finalize/verify step. Every leaf already kept `test:satellite-fixture-network` green (e.g. satellite-build brief.md:73) and merge runs all checks (merge-issue/SKILL.md:33). So keep-green alone did not help: a green spine that skips your stage proves nothing about it. (B,C; A agrees) fixture-network design.md:154 let the implementer hand-author model outputs to the consumer schema; #1 was exactly that (A,B,C). The runner labels review "real" while supplying passing judgments (RUN:399-428,668), so a label is not proof (B). The runner already records per-step durations (RUN:710-715) (B).

### 1 · Must each leaf that adds or changes a pipeline stage plug that stage into one shared end-to-end test?
- 1a (recommended) (A,B,C) The chart names the spine command and a stage table: each stage has an owning leaf with a done-criterion that puts its stage in the spine (real for scripts, recorded-from-real for model or outside services) and deletes what it replaces. Reuse an existing command or make the spine part of the earliest relevant leaf rather than a separate foundation leaf (B); where a stage leaf needs the spine first, it is written into blocked-by (C). The handoff audit refuses a stage-owning leaf without that criterion (A,B,C). The spine runs in the consumer's blocking checks; merge already runs them (A,B,C).
- 1b keep-green only: what the framework already did. (A,B,C)
- 1c the rule without the audit check: reinterpreted per leaf (standing-design.md:13). (A,C)

### 2 · Which charts does it apply to?
- 2a (recommended) (A,B,C) When one leaf's output (data, events or state) is consumed at runtime by code another leaf owns (B wording, A,C agree). Not file overlap, shared library or same epic alone. The chart names the chain.
- 2b only charts with a final proof leaf (C) / labelled "pipeline" (B): misses chains under other names.

### 3 · What runs real in the spine and where do saved outputs come from?
- 3a (recommended) (A,B,C) Own scripts, consumers and checks run real. Model and outside-service stages replay output recorded from one real run, never hand-authored, with producer, revision or date, and the capture command named (B,C). Re-record, never hand-patch (C). A leaf that changes a model prompt, model, settings or output shape, or an outside call, runs one real call and re-records; that is the live probe, not a live run per merge (A,B,C). Small hand-written negative and edge inputs stay allowed (A,B,C).
- 3b hand-written, schema-checked: #1. 3c live sessions every merge: hours per merge.

Pitfalls: a stage labelled real that fakes its judgment is not real (B). ponytail.md:30 "no frameworks, no fixtures" covers the one tiny self-check; say so so seats don't refuse recordings. Disagreement D5: B edits ponytail.md:30; A,C put one clause in the standing line and leave ponytail alone. Spine stays small fixed input so it is a seconds-or-minutes test (C). #16 scale defects belong to review-rules, not the spine (C).

Practitioners: Freeman and Pryce walking skeleton (C); Toby Clemson, microservice testing, component tests don't prove cooperation (B); Martin Fowler Contract Test and Self Initializing Fake, record from real and check the copy with a separate real call (B,C); Ian Robinson consumer-driven contracts (C).
