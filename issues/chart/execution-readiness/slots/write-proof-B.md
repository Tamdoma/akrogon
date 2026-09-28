# Write proof: independent operator round B

This round settles what evidence must exist before a leaf is written and who obtains it. I recommend operation-level proof during the attended chart pass, with handoff held when proof is missing. The operator correction extends this to every external command or API named by a leaf contract, including reads and launch flags.

Research date: 2026-09-28. Read-only research only. No credentials were opened, provider calls executed, probes repaired or leaf states written. The installed chart-issues skill and all three assets matched their repository copies byte-for-byte when inspected.

## Findings

- **F1 · The operator requires measured integration assumptions before execution.** Intake requires proof before leaf state and reports that GET-only charting missed `locations/customFields.write` (`issues/chart/execution-readiness/INTAKE.md:4`, `:12-15`). The supplied correction is binding context: “These things need quick prototypes to make sure nothing's missing with the API.” It widens coverage beyond write scopes. Tier: operator. Effect: inventory actual operations, not just credentials or scope names.
- **F2 · Today's credential rule stops at availability.** The skill requires briefs to list credential variable names, their purpose and where to obtain them. Missing values in the consumer's gitignored `.env` are named so the operator fills them before dispatch (`skills/chart-issues/SKILL.md:53`, same installed path `/home/ivan/.claude/skills/chart-issues/SKILL.md:53`). It does not require successful calls with those credentials. Standing design rejects mocked auth and hardcoded secrets, and puts secrets in the consumer `.env` (`skills/chart-issues/assets/standing-design.md:3-11`). Tier: current source. Effect: move required credential availability early enough to prove the operations before handoff, not merely before dispatch.
- **F3 · Mandatory proof needs an explicit distinction from optional experiments.** `questions.md:52-54` offers a smallest experiment for a named uncertainty, requires an explicit choice, permits settling without measurement, retains findings and discards scratch code. The main skill also calls prototypes optional (`skills/chart-issues/SKILL.md:51`). Tier: current source. Effect: optional exploration can remain optional, but refusing a required proof must hold or narrow the handoff, never count as passing it. Existing session authorization should be honored rather than repeatedly requested (`skills/chart-issues/SKILL.md:57`, `assets/shapes.md:168`).
- **F4 · Current handoff audit has no operation-proof requirement.** It checks destinations, ownership, slugs, dependencies, settled forks and Fog, then contract quality and prerequisites (`skills/chart-issues/assets/shapes.md:164-168`). It writes files and runs status afterward (`:170`). Tier: current source. Effect: require the charting agent to assess complete operation evidence before those writes. Do not teach the locked read-only Git `akrogon preflight` service-specific mutations. The taken Git decision establishes that command's pre-write role (`issues/chart/execution-readiness/forks/git-base.md:22-24`).
- **F5 · The supplied GHL probe is useful evidence of intended calls, not a trustworthy pass gate.** It uses `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID`, with API version `2021-07-28` (`/home/ivan/Work/personal/MDConsultingNY/boulevard-automation/scripts/probe-ghl-scopes.ts:7-14`). It POSTs and DELETEs fields and calendars (`:18-30`), but events receive GET only (`:32-33`). HTTP failures and cleanup failures are printed without rejection (`:10-16`, `:19-30`). It also deletes a hardcoded field unrelated to the current create result (`:34-35`). Tier: operator-placed code. Effect: read actual results per operation, require cleanup evidence, and never rerun this script blindly. Consumer repair remains off route.
- **F6 · Historical measurements show the wider scope.** At `648b6eb^:issues/chart/noninteractive-leaf-execution/forks/ask-tool-availability.md:36-37`, the chart records a pi launch with `--exclude-tools request_user_input` and a control run. It explicitly separates tool-list evidence from unmeasured prompt-guideline behavior. At `648b6eb^:issues/chart/noninteractive-leaf-execution/forks/push-notification.md:34-36`, notification result shape and tab rename/readback/restore/close were measured. Tier: historical operator-requested measurements, not a fresh rerun. Effect: inspect the behavior a contract relies on, including output shape and cleanup. Neither help text nor an exit code alone proves it.

## Outside practitioners and primary evidence

**P1 · Toby Clemson, Thoughtworks distributed-systems developer.** His experience spans projects on four continents. His contract-testing guidance assigns consumers tests of the external behavior they actually use, including request/response expectations. This supports consumer-owned, small probes, not a generic akrogon API catalogue. [Testing Strategies in a Microservice Architecture](https://martinfowler.com/articles/microservice-testing/fallback.html), read 2026-09-28.

**P2 · Rosanne Ussery, Development Engineer III at Slack.** Her platform guidance maps scopes to methods, distinguishes user and bot identity, and recommends auditing feature-to-scope use before release. This supports recording the acting identity and minimum required scopes, not asking for broad access to make a probe pass. It does not claim that a scope list proves payload compatibility. [Less is more: a Slack approach to scopes](https://slack.dev/least-privilege-a-slack-approach-to-scopes/), 2026-05-19, read 2026-09-28.

**P3 · Pact maintainers.** Their deployment check uses verification results for specific consumer/provider versions and the target environment. This supports evidence tied to the actual contract and environment. It does not establish production-token permissions merely because a contract test passed elsewhere. [Can I Deploy](https://docs.pact.io/pact_broker/can_i_deploy), read 2026-09-28.

These sources agree on checking the consumer's actual needs and preserving context. They address different failure types: interface compatibility and access grants. My synthesis is to record both in one operation inventory. Their advice does not establish that every provider requires a real mutation: provider-native validation can safely prove specific properties, but its documented limits matter.

**P4 · Provider validation is narrower than “everything will work.”** AWS EC2 `RunInstances` documents `DryRunOperation` as permission success and `UnauthorizedOperation` as failure without executing the operation. AWS separately warns that IAM policy simulator results can differ from the live environment. These are primary provider sources, not interchangeable proof mechanisms. [EC2 RunInstances](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RunInstances.html), [IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html), read 2026-09-28.

**P5 · Token introspection is not an operation test.** RFC 7662 reports token activity and optional scope/identity metadata. Inference: this helps identify a credential, but does not execute a leaf's endpoint, validate its required response fields or exercise resource-specific behavior. [RFC 7662 §2.2](https://www.rfc-editor.org/rfc/rfc7662.html#section-2.2), read 2026-09-28.

## Q1 · What counts as proof for every external operation a leaf contract names?

The GHL report shows why “the token works” is too broad. Proof must match the method or command, required arguments/payload and response behavior, acting credential identity, target account/location and relevant API or CLI version. A successful read is evidence for that read only.

Research: operator tier, `INTAKE.md:12-15` and probe `:18-33`, plus P1–P2, read 2026-09-28. These distinguish available credentials from verified operations and shape the recommended evidence boundary.

- **A (recommended): Require a safe operation-level probe and recorded evidence before handoff.** For writes, use disposable resources and verified cleanup or a provider-native equivalent under Q3. For reads/commands, invoke the actual relevant behavior. If a safe sufficient probe is unavailable, hold the affected handoff and name what must change. This catches missing permissions and unsupported API assumptions while the operator is present.
- **B: Accept scope lists, documentation, token introspection or operator assurance and defer real verification.** This is cheaper during charting but allows the exact unproven operation to reach a seat. It contradicts the supplied destination.

The chart record should contain the consuming leaf/contract requirement, operation and representative inputs, environment/identity reference without secrets, API/CLI version, execution date, expected result, observed status and relevant response/effect, cleanup result, and the evidence's limits. One result may cover multiple leaves using the same operation and context. An agent judges sufficiency. No exact wording template or service-specific schema is needed.

Pitfalls: A successful POST does not prove PUT or DELETE even if they share a scope. Cleanup is itself an operation requiring permission. Creation followed by deletion does not undo messages, billing or other triggered effects. Use isolated targets and inspect those effects before calling a probe reversible. A sandbox identity alone cannot prove a different production identity.

## Q2 · Does A obtain the proof during charting, or does a probe leaf do it?

A owns the attended interview and recording today (`skills/chart-issues/SKILL.md:49`). A probe leaf would put the uncertain external access into an execution seat, even if downstream implementation leaves wait for it.

Research: operator tier, `INTAKE.md:4`, and current source, `questions.md:52-54` and `shapes.md:170`, read 2026-09-28. The required evidence must precede leaf state, so it belongs to the chart pass.

- **A (recommended): A runs the consumer-owned probes during charting and records the results.** Resolve credential grants with the operator there. Honor existing authorization, and obtain missing authorization for concrete probe effects when necessary. Peers review the evidence. This places the uncertainty before the execution boundary.
- **B: Create a probe leaf first.** This moves work into the lifecycle but violates the rule that an unproven operation never reaches a seat. Choosing it would explicitly change the destination.

Pitfalls: Do not silently convert the current optional-measurement rule into mandatory, unapproved mutations. Make the distinction explicit: exploration may be declined, required proof cannot be waived into success. The operator may decline a probe, but then the affected handoff stays held or its scope changes. Preserve measured findings and reproducible invocation details when discarding chart-created scratch code, as required by `questions.md:54`. Existing consumer scripts are not scratch files to delete.

## Q3 · New material question: can provider-native dry-run or validation count instead of a real mutation?

Some providers expose the exact authorization check without committing a write. Others validate only syntax, or simulate policies without exercising the live resource context. Requiring a real mutation in all cases adds unnecessary effects, while accepting any endpoint named “validate” weakens proof.

Research: primary provider tier, P4, and token-standard evidence P5, read 2026-09-28. AWS documents exactly what its dry-run proves and warns separately about simulation differences. This makes equivalence a question about guarantees, not endpoint names.

- **A (recommended): Accept a provider-native equivalent only for the properties it documents and demonstrates under the intended identity and resource context.** Record its limitations. Permission-only success proves permission, not response shape or downstream behavior. Obtain separate evidence for remaining contract assumptions or keep handoff held. Prefer a sufficient no-mutation check when available.
- **B: Require a real reversible operation every time.** This simplifies the rule but rejects useful provider guarantees and may force a hold even where the relevant authorization can be proved safely without a mutation.

Pitfalls: A dry-run's expected nonzero/error result can be success evidence, as EC2 illustrates. Conversely, HTTP 200 or CLI exit 0 can wrap a semantic failure. Do not use mocks, token introspection or a generic IAM simulator as an automatic substitute for the operation.

Reply `1-A 2-A 3-A`, or give numbered free-text choices.

## Concrete scenario: GHL #20

**S1 · Before handoff.** A inventories custom-field creation/deletion, calendar creation/deletion and each event operation the planned leaf actually requires. It resolves `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` for the intended location. Those inputs come from the supplied script (`:7-8`), while the need to prove rather than merely list them comes from the intake (`:12-15`). No secret values belong in the chart.

**S2 · A failure holds the handoff.** A failed custom-field POST is recorded with its actual status/body and request context. It is not treated as permission success because other GETs work. The operator supplies the missing grant, then A repeats the relevant safe probe. The report says the missing grant was `locations/customFields.write` (`INTAKE.md:12`). This round does not invent an HTTP status for the historical failure.

**S3 · The reported evidence has a gap.** Intake says the reversible probe confirmed all three scopes (`INTAKE.md:12`). The provided script only exercises event GET (`probe-ghl-scopes.ts:32-33`). HighLevel maps GET events to `calendars/events.readonly`, while appointment POST/PUT and event DELETE belong to `calendars/events.write`. Therefore this script cannot substantiate the claimed event-write proof. [HighLevel scope-to-method table](https://github.com/GoHighLevel/highlevel-api-docs/blob/main/docs/oauth/Scopes.md). Additional historical evidence may exist, but it was not supplied here.

**S4 · Completion requires each needed operation.** After the reported field/calendar POST 201 results, A verifies the relevant outputs and successful cleanup, then safely probes the event methods actually required. An event create result alone would not prove update. If notification-free, isolated testing or an adequate provider validation route cannot be established, the affected handoff remains held. The supplied script's hardcoded deletion and non-failing HTTP handling must not become the accepted proof mechanism (`:10-16`, `:18-35`). Fixing that consumer script is outside this fork.

This scenario is an evidence audit, not a new GHL run. The historical claims remain attributed to the operator and are limited by the code actually supplied.

## Challenge check

Proof is bounded evidence, not a guarantee of future service availability. Reuse it only for the same relevant operation, identity, environment and contract. Recheck affected evidence if those change before handoff. Do not add clocks, polling or expiry machinery. Changes after handoff cannot be ruled out by a chart-time test.

The main remaining choice is Q3: how much provider-native validation can prove. Neither practitioner guidance nor the operator's broad prototype instruction justifies claiming an untested response or side effect. Missing evidence stays visible and holds handoff. Akrogon owns the generic charting rule, consumers own their probes, and the taken Git preflight remains a separate read-only check.
