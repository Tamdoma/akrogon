# Opening map B: Jev in akrogon

Independent map, read 2026-10-17. Repository inspected at f7baddc9e5f1c2fb3fc57244db4f6ea31c98a82f. No other opening maps read. Only this return file written.

## Position

D1 Keep Jev out of the running system for now. I found plausible semantic classification tasks, but no demonstrated standalone LLM turn or substantial code that it can remove. Most judgments happen inside turns that must still inspect evidence, write reasons or act. Adding a classifier there adds a call without removing the turn.
D2 If exploration continues, first measure one existing workload and compare unchanged behavior, deterministic rules and Jev on the same recorded cases. Intake matching is the least disruptive candidate. This is a proposed measurement, not authorization to implement it.
D3 Preserve the existing authority boundaries. Neither a probability nor a task label authorizes direct landing or starts autopilot.

## Verified model facts

F1 TypeSafe now lists `jev-1.14.0`, available October 14, alongside `jev-1.13.0`. Its alias table still maps `jev-latest` to 1.13.0 and `jev-preview` to 1.14.0. Both cost $0.042/M input tokens, output free. Default limits are 64k per request AND 32k per question. Pin the exact evaluated version. [E3]
F2 Choice returns a label and probabilities, Score a rubric position, Noul a yes probability. Noul has no separate confidence. Questions in a batch are independent, not a reasoning chain. Typed output prevents invalid labels, not wrong decisions. [E4]
F3 TypeSafe itself documents weak counting, date comparisons, multi-hop reasoning, distracting context and adversarial-input resistance for 1.13. It recommends code for exact calculations. Do not assume the 1.14 preview fixes these without measurement. [E5]
F4 inovex measured roughly 300 ms and found inconsistent related answers and calibration uncertainty on its data. Akita measured 97.6% on his compact benchmark, not akrogon's decisions. Neither establishes quality or end-to-end speed here. [E6,E7]

## Candidate decision points

Daily volumes and existing per-decision costs are unmeasured. The quantities below are workload formulas or bounds, not claimed traffic. A lifecycle phase count does not reveal how many embedded judgments occurred. Existing harness billing may be subscription-based, so tokens saved need not reduce the bill.

Every Jev candidate adds the same baseline: a TypeSafe key, paid hosted network call, vendor dependency and outage/rate-limit failure domain, response validation, versioned questions and evaluation upkeep. The brief reports no TypeSafe key. I did not inspect credentials or make inference calls.

| Candidate | Current decider and evidence | Daily volume / current cost | What Jev could remove and adds beyond baseline | Does a rule beat both? |
| --- | --- | --- | --- | --- |
| C1 Direct vs lifecycle | A judges eligibility and recommends, operator chooses. `skills/chart-issues/SKILL.md:89`, `:93`, `:99`. | One route choice per settled chart. Unknown charts/day and marginal tokens. Evidence gathering and handoff already require A. | Could label apparent simplicity, but removes no proven turn, review or guard. Adds another interpretation of scope and risk. | Yes for explicit exclusions once facts exist. No for establishing hidden dependencies, scope or suitability. Keep those with the inspecting agent. |
| C2 Autopilot vs attended | Operator switches the door, supplies work and consultants. `issues/chart/autopilot/forks/boundary.md:33`, `:36`, `forks/switch.md:18`, `:22`. | One switch per authorized start/resume/change. Rate and cost unknown. No standalone classifier turn today. | A suitability suggestion could save some reading, but cannot replace consent. Adds a new intake/routing process that the autopilot chart expressly leaves unassigned. | Yes for enforcing recorded mode, handed scope and session boundaries. Human intent is not a model score. |
| C3 Semantic overlap among incoming reports and existing work | Chart agent compares outcomes, confirms scope and ownership. Exact identities already skipped. `skills/chart-issues/SKILL.md:33`, `:35`, `:73`. | For n new reports and m candidate records, up to n×m pair judgments/day before filtering. n and m unmeasured. Today part of chart reading. | Could remove repeated first-pass pair comparisons by proposing matches. Cannot prove delivered work or close a report. Adds a miss-rate problem and labelled comparison cases. | Yes for exact issue identity, path and provenance. Semantic equivalence needs judgment. Best measurement candidate only if repeated comparison cost is material. |
| C4 Failed leaf: needs operator vs recoverable | Watch agent interprets reason and owner, then applies bounded recovery rules. `skills/watch-issues/SKILL.md:40`, `:41`. | At most 72 scheduled observations per continuously watched day per repo, plus initial/manual checks. Failure judgments scale with failed leaves and repeat unchanged reasons. Actual volume/cost unknown. | Could replace interpretation of a short reason, not recovery history, owner resolution or notification writing. Adds costly false-recovery risk and stale-state handling. | Structured failure facts would beat inference if the producer already knows them. That would require a separately scoped change, not a Jev justification. |
| C5 Busy seat: normal progress vs loop/outside-brief work | Watch agent compares brief with log tail and visible output. `skills/watch-issues/SKILL.md:42`; `scripts/log-tail.ts:415`, `:486`. | Up to 72 scheduled checks × average busy seats/day, plus initial/manual checks. Each check already runs in an agent turn. Cost unmeasured. | Could label an ambiguous trace. Cannot remove log normalization, contextual review or the corrective prompt. Adds a false-stop risk and export of session content. | Yes for exact command hashes, repeated errors and edit undo pairs. No for whether a changing investigation serves the brief. Jev's counting weakness argues against replacing exact evidence. |
| C6 Fix vs Nit / review verdict | Review agent traces realistic input, consequence and criterion and runs evidence. `skills/check-issue/SKILL.md:51`, `:53`, `:55`. | Findings per review × reviews/day, plus repair rounds. Unknown. Most cost is investigation and testing. | A label could replace only the final small choice. No defect discovery, proof, explanation or test execution disappears. Adds pressure to treat a plausible label as proof. | Rules cover failed checks and legal verdict values, not defect causality. Keep review judgment. |
| C7 Lifecycle routing and flaky detection | Code maps phase/slots and detects red→green on identical tree+command. `src/routing.ts:27`, `:53`; `src/flaky.ts:24`. | Per phase/dispatch and verify history scan. Rates unknown, local execution with zero model spend. | Nothing beneficial removed. Jev would replace exact logic with uncertain remote inference. `src/flaky.ts:19` extracts arbitrary test names, which a fixed-label classifier cannot return. | Yes. Retain code. A runner-format parsing problem should be solved at that format boundary. |

C4/C5 are possible research topics outside the handed autopilot scope. Existing watch fires are already agent turns. Preventing those turns from starting would require changing the trigger architecture, not inserting a cheap tool inside the current turn. New timers, daemons and polling are already off route (`issues/chart/autopilot/CHART.md:25`).

## The operator's examples

F5 Direct vs lifecycle is partly an eligibility test and partly an informed choice. Example: a one-line edit requiring an outside-account proof is ineligible regardless of how confidently Jev says “small.” A settled local fix with no exclusion still needs operator route authorization, B review and verification. Classifying the initial note cannot establish the later contract's eligibility.
F6 Autopilot vs not currently means operator authority over a named batch, not an inferred property of a ticket. Within that authority, A answers all questions and approvals still wait. Under autopilot, direct is forbidden (`issues/chart/autopilot/forks/loopholes.md:19`). A future classifier recommending which incoming reports to offer the operator is a new outcome, not part of implementing the already-charted mode.
F7 Jev cannot replace A's autopilot choices wholesale. A must research a fork, compare options, apply operator values, retain reasons and handle new evidence. Jev can choose among prepared labels but cannot perform or explain that research. Its benefit would have to exceed the cost of preparing those labels and checking its choice.

## Material forks, in order

Q1 Is there a measurable repeated decision to remove? Identify the exact existing turn, prompt passage or code, daily frequency, elapsed time and billed cost. If no meaningful saving exists, settle on O1 do nothing. Practitioner challenge: are we comparing against a whole LLM request that akrogon never makes? [E6,E7]
Q2 What output is wanted: advisory facts/match candidates, or authority to route/recover? Prefer advisory C3 if measurement is justified. Action-taking C1/C2 would reopen operator locks, and C4/C5 would widen scope. Practitioner challenge: can a deterministic fact eliminate the model entirely? [E7]
Q3 What quality loss, if any, is acceptable? The intake says none. Compare errors by consequence against current behavior and a rule baseline, including missing context, ambiguous cases, malicious reports, changed policy and reversed label order. Agreement with a past agent is not ground truth. Operator-adjudicated outcomes are needed for disputed cases. [E5,E6]
Q4 Can enough work bypass the expensive step? Record review/abstention fraction and complete workflow time, not just API latency. An advisory result reviewed from scratch might save nothing. A sample with zero observed mistakes cannot prove equal quality on future cases. [E6,E7]
Q5 If a useful replacement is proven, who owns the key, exported data scope, error path and upgrades? Pin version, retain sufficient non-secret decision evidence, and re-evaluate model/rubric changes. No silent fallback or new retry daemon. API failure is a visible failed operation, with bounded external-API retries under existing policy. [E3,E5]

## Options and lifetime pitfalls

O1 Do nothing now, recommended. Removes no existing code but adds no dependency. Cost: possible small savings remain undiscovered. Revisit when repeated workload and its cost are demonstrated.
O2 One bounded offline comparison of C3 against real, redacted historical cases, if the operator chooses it. No dispatch/closure effect. Cost: labels, key provisioning and experiment time. Keep measured findings and discard scratch code under `skills/chart-issues/assets/questions.md:56`.
O3 Integrate Jev into routing or watching now, rejected. No measured removable work, new network failure domain, and likely duplication of agent judgment. Running it locally through an open substitute exchanges vendor/network concerns for model-serving and hardware maintenance, which is also unjustified here.

R1 Confidence can become accidental authority. Keep eligibility, approval and state-transition enforcement independent of model output. A high score never creates a grant.
R2 A cheap request can make the overall process slower. Include state preparation, network/retries, review and rework in the comparison. Name the deleted work before building an integration.
R3 Categories and pinned versions can age. Re-evaluate after rubric/model changes and on new kinds of intake. Do not convert successful old examples into permanent thresholds.
R4 Several plausible labels can contradict each other. Do not turn independent answers into a multi-step proof. Exact policy composition belongs in code, dependent investigation remains with the agent.
R5 Session logs can contain private material and injected instructions. C5 needs a deliberate minimal export boundary. Adding an agent just to sanitize/classify logs may erase its savings.
R6 Duplicate detection can lose work. Advisory matching must preserve unmatched/uncertain reports. Closing or suppressing a report still needs proof of matching scope and ownership.

## Evidence register

All sources read 2026-10-17. Repository citations refer to the inspected f7baddc checkout. The installed `/home/ivan/.claude/skills/chart-issues/SKILL.md` resolved to that release and matched the repository file.

E1 operator: verbatim intake in `/home/ivan/.claude/jobs/6a0d8d81/tmp/chart/map-brief.md`. Simpler, cheaper and faster without loss of quality, current system satisfactory. No requirement to ship an integration.
E2 operator / better-than-training: autopilot `CHART.md`, six fork files and `issues/open/autopilot/autopilot-mode/brief.md:4`; boundary and switch locks cited above. Mode is being implemented, not assumed deployed. Also read `docs/reference-index.md`, `src/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`. Lessons describe observed failures, not new mandates.
E3 better-than-training: TypeSafe [Models](https://docs.typesafe.ai/models), current IDs, pricing, context limits, aliases and rate limits. Provider specification, not measured akrogon performance.
E4 better-than-training: TypeSafe [Primitives](https://docs.typesafe.ai/primitives), typed shapes, independent questions and bounded judgments.
E5 better-than-training: TypeSafe [Jev 1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13), concrete failure modes and code/model division.
E6 practitioner: Nicolas Werner and Ivan Herreros Alonso, inovex [own experiments](https://www.inovex.de/de/blog/typesafe-ai-jev-im-test-wie-gut-ist-das-neue-modell-fuer-ki-klassifikation/), published 2026-09-29. Related-answer inconsistency, roughly 300 ms observed latency, task-specific calibration needed, strongest fit in large streams of independent classifications.
E7 practitioner: Fabio Akita [own benchmark](https://akitaonrails.com/en/2026/10/10/which-jev-like-ai-decision-classifier-model-is-best/), published 2026-10-10. Jev 97.6% on compact cases, aggregate accuracy can hide critical mistakes, structured facts support rules in code. Alternative-model scores are not akrogon results.
E8 better-than-training: TypeSafe [launch announcement](https://typesafe.ai/blog/introducing-system-one-models-and-jev), product introduction. Marketing speed comparisons do not establish saved harness time.
E9 model-knowledge / inference: candidate rankings, workload formulas and recommendation are my deductions from E1–E8. No measured daily classification volume, marginal harness cost, Jev accuracy on akrogon or live inference proof is available from this pass.

Recommendation: keep the production design unchanged. Continue only if one bounded measurement can name existing work Jev would actually remove.
