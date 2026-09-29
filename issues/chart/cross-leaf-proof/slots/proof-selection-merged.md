# proof-selection, merged round

### 1 · Should every done-criterion be proven by the cheapest sufficient test that catches its failure, and which skills carry that rule?

No skill ties a test to its cost today. The chart writes criteria as "concrete check executable inside this leaf's ownership" (shapes.md:132), plan-issue writes "concrete verification" (plan-issue/SKILL.md:55), check-issue compares tests with criteria (check-issue/SKILL.md:45). Example: live-replay #15, one CSS rule that never stacks at 360px, was found in an hour-long rehearsal (report.md:232-240). A renderer test at 360px finds it in seconds. (A,B,C)

Research: better-than-training · the skill lines above, inspected 2026-09-29 · no cost rule exists · the rule extends existing stages instead of adding a gate. (A,B,C) practitioner · Mike Wacker, Google Testing Blog 2015; Ham Vocke, Practical Test Pyramid; Dave Farley, deployment pipeline · push each check to the smallest test that catches it, keep user-level acceptance · supports "cheapest sufficient", keeps the E2E lock. (A,B,C) Adrian Sutton (LMAX) counters that E2E works when fast (C). Bazel test sizes declare cost per test (C).

- **1a (recommended)** (A,B,C) One standing-design line beside the unchanged E2E lock: "Each done-criterion is proven by the cheapest sufficient test that catches its failure. A slow or live run names the property no smaller test proves." Charting applies it when writing criteria, so no criterion demands a slow run a smaller test covers (B,C). Plan synthesis maps each criterion to a command, the failure it catches, a size (seconds, minutes, hours) and its rerun trigger; one command may cover several criteria (A,B,C). The implementation report records measured wall time for slow commands (B,C). Review makes a Fix only when a failure the leaf's own code can cause is caught only by a slow run although a smaller test was practical; a cost preference is a Nit; rerun rules stay as today (B,C; A agrees).
- **1b** Plan-issue only. The chart writes criteria first, and a plan cannot shrink a locked live criterion (plan-issue/SKILL.md:33). (A,B,C)
- **1c** No rule. Repeats the live-replay case. (A,B,C)

Pitfalls: "cheapest" must not slide into mocks or skipping E2E; the auth, unit-under-test and user-visible E2E rules stay (A,B,C). When the behavior under test is itself a model session or external call, a real invocation can be the cheapest sufficient test (B). Validate the wording by applying it to the live-replay case, not by testing prose (B,C).

### 2 · Should verification carry a numeric time budget?

No stage durations are recorded (report.md:691-722), so no number has evidence behind it. (A,B,C)

Research: practitioner · Farley: commit stage under 5 min, acceptance under 1 h, set empirically · reference point only (B,C). better-than-training · Bazel size timeouts came from measured fleets (C). Search for a budget for agent-run proof leaves found nothing stronger (C).

- **2a (recommended)** (A,B,C) No number now. Size in the plan and measured wall time in the report create the data for a later budget.
- **2b** A number now. Unmeasured caps either block needed live proof or get waived routinely. (A,B,C)

## Map corrections applied from rebuttals
- Destination: "earlier detection and fewer reruns", not "one or two runs" (B1).
- Spine fork: routine spine uses recorded-from-real outputs; a live probe stays where the model or external behavior itself changed (B2).
- Review fork: no mandatory review reruns; capacity needs a stated bound and boundary test (B3).
- Proof-leaf fork: reuse needs an argument naming which code, inputs, config and artifacts stay valid; the bound on in-branch fixes is its own question (B4, C2).
- D4 resolved (B,C). D1 narrowed to whether stand-ins may feed later stages in diagnostic runs (C4).
- Pitfall added: ponytail.md:30 "no frameworks, no fixtures" may be read against the spine (C3).
- Sutton attributed to C (B5).
