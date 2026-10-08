# Eligibility: blind slot B notes

Research read 2026-10-08. No other slot's eligibility notes were read. The container 1a decision is binding. These are recommendations, not operator answers.

## Q1. Which jobs may the door offer as direct, and which are refused outright?

### Pick, reason and cost

Pick conceptual eligibility with explicit hard boundaries: one small, self-contained outcome in one registered destination, settled scope and criteria, all required gates completed, A available to implement and B available to review. Record the reason it qualifies. Refuse direct when the job needs multiple independently delivered outcomes, still-open product decisions, missing prerequisites or permissions, or waiting on an unfinished lifecycle leaf. Respect the taken prohibition on issues/ code diffs.

Do not categorically refuse an otherwise eligible job merely because readiness names inputs or a scoped grant. These records express requirements, not proof that requirements are missing. A configured file, existing credential, or small already-authorized API correction can fit one self-contained job. The door must run the existing readiness presence check before execution and again before any dependent operation where circumstances may have changed, and carry the existing grant/proof/cleanup rules into implementation and review. Cost: the direct protocol needs explicit gate entry points because status/next will not enforce them automatically. That cost exists under the chosen container regardless of how the eligible set is named.

For produces, distinguish a new output needed by another unfinished job from an incidental output consumed entirely within this job. Recommend refusing work that needs cross-job producer/dependency coordination. Do not add a categorical ban on every produce record based only on the absence of state.yaml. A broader “no live operations or new credentials in direct” policy is a valid simpler product choice, but its reason is deliberately reduced scope, not impossibility of presence checking.

### Rejected options and reasons

- Reject automatic eligibility from “would be one leaf.” One outcome may still contain slow proofs or operational coordination that defeats the purpose of the small attended path.
- Reject blanket refusal of inputs/grants/produces justified by “no presence gate without state.” The repository already provides a state-independent presence check, and inputs can already be present.
- Reject file-count, line-count, or estimated-minute eligibility thresholds. They misclassify small risky changes and larger mechanical changes. Judge the outcome and the concrete implementation/review burden.
- Reject offering direct while waiting on an unfinished blocked-by dependency. Keep that work in the lifecycle that owns dependency scheduling. An already-delivered prerequisite is evidence, not an unfinished dependency requiring dispatch.

### Evidence: tier, source, date

- operator: issues/chart/direct-mode/INTAKE.md:4-12, 2026-10-08. The request keeps all gating and asks for smaller work without multiple issues/leaves. It does not request a ban on credentials or live operations.
- operator: issues/chart/direct-mode/forks/container.md:19-23, 2026-10-08. Work lives in the chart, manual phase guards are binding, no issues/ branch diffs, and cleanup precedes Closed.
- better-than-training: src/readiness.ts:87-120, 2026-10-08. readReadiness reads only readiness.yaml; gaps takes GlobalConfig and Readiness, resolves input holders, and reports absent/empty env or file inputs. Neither requires State or state.yaml.
- better-than-training: skills/chart-issues/SKILL.md:77-83, 2026-10-08. Explicit draft-folder presence check works before state.yaml exists. Status cannot see drafts, but that is not the absence of a presence checker.
- better-than-training: skills/chart-issues/SKILL.md:55,57-65, 2026-10-08. Decisions, proofs, prerequisites, grants, fixture cleanup and secret-saving rules are substantive gates.
- practitioner: Google engineering team, [Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html), inspected earlier this session on 2026-10-08. Uses self-contained conceptual scope and reviewer judgment. This supports judgment over a numeric threshold, not weakening required gates.

### Pitfalls and what removes each

- Missing requirements discovered during coding: completed prerequisites, readiness gaps check and proof results before execution remove this trap. A missing need holds the item instead of silently choosing direct.
- “All gating” quietly disappears on the no-leaf route: put readiness and scoped grants with the chart-held contract and reuse existing check functions. Each actor must check the applicable grant before mutation and retain cleanup evidence.
- An authorized small operation grows into a different operation: bind identity, target, operation, effects and bounds in the existing grant. Anything outside them stops for renewed authorization under the existing rule.
- One-item wording hides dependent work: assess independently delivered outcomes and unfinished prerequisites. Lifecycle handles those jobs.
- Reviewer unavailable: direct is not offered without B. No self-review replacement.

### Missing questions

Does the operator want a deliberate first-version restriction to code-only work, even when a live operation's gates are fully satisfied? Present that as a scope tradeoff separately from whether state-independent checks exist. If allowed, how is a produces consumer reference expressed for this no-leaf job? Resolve that artifact contract before offering such work. Landing, repair bounds and growth remain in their existing separate forks.

## Q2. Does the repo setting only allow the door to offer direct per chart, or does it authorize direct by default for eligible jobs?

### Pick, reason and cost

Pick a setting that enables the offer, defaults disabled, and leaves the route to a concrete per-chart operator choice. At the attended end-of-chart review, A recommends direct or lifecycle using the eligibility reasons. Honor an explicit choice already supplied in the session rather than asking twice. Cost: when no applicable choice exists, one route answer remains necessary. Include it with the existing final review rather than adding an extra review round.

### Rejected options and reasons

- Reject interpreting “enabled” as automatic authorization by implication. Intake says enable and advise, but does not settle automatic execution. The existing door distinguishes review/recommendation from authorization.
- Reject automatic direct as an unavoidable consequence of repo config. It can be a valid standing policy only if the operator explicitly chooses that semantics now. Even then, it cannot expand live-change grants or settle remaining product decisions.
- Reject changing implement:inline to mean direct. It already controls workers within implementation, independently of the chart's route.

### Evidence: tier, source, date

- operator: issues/chart/direct-mode/INTAKE.md:12, 2026-10-08. Opt-in repo setting and end-of-chart advice are explicit. Default authorization semantics are not.
- better-than-training: skills/chart-issues/SKILL.md:69, 2026-10-08. Attended review recognizes concrete authorization already given.
- better-than-training: skills/chart-issues/assets/questions.md:31, 2026-10-08. Recommendations and silence cannot supply an operator answer.
- better-than-training: src/config.ts:38-60,164-169,263-269, 2026-10-08. Repository schema is strict, consuming repos read issues/config.yaml, and effective config prints repo settings. Implement's existing field concerns subagents/inline.
- better-than-training: skills/implement-issue/SKILL.md:53-55, 2026-10-08. Inline controls A versus worker execution, not chart handoff.

### Pitfalls and what removes each

- Recommendation accidentally starts implementation: record an explicit route choice before creating or editing the execution branch.
- Repeated permission requests despite authorization: reuse a concrete applicable choice already in the session.
- Settings change reshapes an active job: record the route with the chart-held contract. A changed default controls future choices, not an already-approved job.
- Enabled becomes live-mutation authority: keep route choice separate from the existing scoped grant requirements.

### Missing questions

No additional question is needed for the recommended allow-offer semantics. If the operator picks default authorization instead, ask whether that policy includes landing and which actions it authorizes. The separate landing fork still determines who pushes.
