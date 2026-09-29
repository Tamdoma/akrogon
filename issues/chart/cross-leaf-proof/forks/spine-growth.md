# Spine growth

## Question
Q4. Where does the note go that the spine's recordings are not the "no fixtures" self-check in ponytail.md:30: one clause in the standing line, or an edit to ponytail.md?

Q1. When a chart splits a pipeline across leaves, must one runnable spine command exist early, and must each pipeline leaf's done-criteria swap its stage from recorded to real (or re-record its fixture from the real producer) and keep the spine green?
Q2. What counts as a pipeline chart that triggers this rule?
Q3. Which stages stay recorded-from-real in the routine spine, and when is a live probe required instead?

### Carries
- Map M2, pitfalls R1-R3, ponytail.md:30 "no frameworks, no fixtures" possible conflict (C).
- B2: live probe stays where model or external behavior itself changed.

## Findings
Independent rounds: slots/spine-growth-A.md, -B.md, -C.md. Merged: slots/spine-growth-merged.md. Rebuttals: -rebuttal-B.md, -rebuttal-C.md.

- better-than-training · framework briefs, run-fixture-network.ts, read 2026-09-29 · plan-script brief.md:40 and design-tokens brief.md:36 carried a swap criterion and swapped; content-batch and satellite-build had none, and the spine still copies recorded content and a recorded Astro build (:648,653) with no prep/finalize/verify step (A,C; B verified partial growth). Leaves already listed the spine command in their checks (e.g. satellite-build brief.md:73) (C). So keep-green alone did not catch the gap.
- fixture-network design.md:154 lets the implementer hand-author model outputs to the consumer schema (A,B,C). #1 pool-smell rejection was on such data (A,C).
- The runner labels review real while supplying passing judgments (RUN:399-428,668): a label is not proof (B). It already records per-step durations (RUN:710-715) (B).
- practitioner · Freeman and Pryce, GOOS ch.10 walking skeleton, https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html (C) · Toby Clemson, https://martinfowler.com/articles/microservice-testing/ (B) · Martin Fowler Contract Test, https://martinfowler.com/bliki/ContractTest.html (B,C), Self Initializing Fake, https://martinfowler.com/bliki/SelfInitializingFake.html (C) · Ian Robinson consumer-driven contracts (C), read 2026-09-29 · build a thin real path early and grow it; record substitutes from real calls and check them with a separate real call.
- Consensus 1a 2a 3a. Rebuttal changes: trigger covers build and test flows, not only runtime (B1); a live probe runs the changed behavior through its consumer and checks and names the property it proves, and an outside change that makes a recording unreliable also triggers re-recording (B2); delete only obsolete stand-ins (B3); no runtime promised from input size (B4).
- Disagreement D5: B edits ponytail.md:30 at the source; A,C add one clause to the standing line and leave ponytail.md alone. ponytail.md:34 says it also governs the separate ponytail repo, so an edit touches shared text.

## Taken

Partial answer, operator 2026-09-29: "1a | 2a | 3a | 4 - why does it say no fixtures? Ponytail is really important, it's a file that dictates clean code."
Q1 = 1a, Q2 = 2a, Q3 = 3a (with rebuttal changes above). Q4 open: operator asked why ponytail says no fixtures.
Q4 re-research: ponytail.md:30 "no frameworks, no fixtures" qualifies only the ONE smallest check that non-trivial logic leaves behind. The same line lists "anything explicitly requested" under "Not lazy about". A spine required by a leaf's done-criteria is explicitly requested, so ponytail already exempts it. New option 4c: change nothing.

## Taken
Operator 2026-09-29: "1a | 2a | 3a | 4 - why does it say no fixtures? Ponytail is really important, it's a file that dictates clean code." then "4c". Peer final check B, C: none.

Q1 = 1a. When a chain exists, the chart names the spine command and a stage table: each stage has an owning leaf whose done-criterion puts that stage in the spine (scripts real, model and outside services recorded-from-real) and deletes obsolete stand-ins. Reuse an existing command or make the spine part of the earliest relevant leaf; a stage leaf needing the spine first gets it in blocked-by. The handoff audit refuses a stage-owning leaf without that criterion. The spine runs in the consumer's blocking checks. A stage labelled real that fakes its result does not count.
Reason: keep-green alone let two stage leaves skip the spine.
Foreclosed: 1b keep-green only; 1c rule without the audit check.

Q2 = 2a. Applies when one leaf's output (data, files, state or build input) is consumed by code another leaf owns. The chart names the chain. File overlap or shared epic alone does not trigger it.
Reason: matches the actual producer-consumer risk.
Foreclosed: 2b only charts with a final proof leaf.

Q3 = 3a. Own scripts, consumers and checks run real. Model and outside-service stages replay output recorded from one real run, with source, revision or date and capture command named; re-record, never hand-patch. A leaf changing a prompt, model, settings, output shape or outside call runs one real call through its consumer and checks, names the property it proves and re-records; an outside change that makes a recording unreliable also triggers re-recording. Hand-written negative and edge inputs stay allowed. No live model run per merge.
Reason: hand-authored stand-ins hid producer mismatches (#1); live runs per merge cost hours.
Foreclosed: 3b hand-written positive outputs; 3c live sessions every merge.

Q4 = 4c. No clause and no ponytail.md edit. ponytail.md:30 "no frameworks, no fixtures" governs only the one smallest self-check, and the same line keeps "anything explicitly requested"; the spine is required by done-criteria.
Reason: ponytail already covers it; the operator keeps ponytail unchanged.
Foreclosed: 4a extra clause; 4b ponytail edit.
