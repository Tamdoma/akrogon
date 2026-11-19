# Intake: model-judgment

## Scope

Destination: the akrogon lifecycle rule texts (chart-issues assets, plan-issue, check-issue, lesson rule, learn-issues) so that a script decides only what has one right answer and a model's quality call is decided and recorded by the model and judged by the reviewing seat. Grouping proposed after the map.

## Provenance

- GitHub: Tamdoma/akrogon#140
- Operator: door message 2026-11-17 (t126, /chart-issues arguments)

## Source: Tamdoma/akrogon#140

# Lifecycle turns model quality calls into script thresholds, text matches and operator stops; no step asks whether a script or the model should decide

Source: Tamdoma/akrogon#140
URL: https://github.com/Tamdoma/akrogon/issues/140

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Leaves built through akrogon keep shipping deterministic checks that make decisions the model was asked to make. They pass or fail on a count, a share, a similarity limit or a match on model-written text, or they add an operator stop for each item. Those checks block valid model output, break when wording changes, and force paid re-recordings.

The operator has asked for relief from this five times:
- 2026-10-06, framework chart verifier-boundaries: "scripts check function only, the agent judges form, a form problem is a finding not a HALT" (`issues/chart/verifier-boundaries/forks/schema-format.md:7`).
- 2026-10-16, framework chart agent-latitude: "I just don't want to make this so deterministic that it always fails. We need some spacing for the agents to figure it out. In the past we had a lot of issues with all these tests that were just blocking progress all the time" (`issues/chart/agent-latitude/INTAKE.md:10`).
- 2026-10-24, Tamdoma/tamdoma-framework#389 and chart satellite-check-latitude: about USD 10.70 over 7 paid attempts lost to checks no visitor could see. Stated cause: "Checks were written to pin the deterministic generator's output, then reused unchanged on LLM-written palettes, HTML and copy" (`issues/chart/satellite-check-latitude/INTAKE.md:236`).
- 2026-11-11, chart writer-checker-rule-source: "Do we even need that many scripts and checkers all over the place? They're just blocking everything all the time." (`forks/check-reduction.md:5`).
- 2026-11-17, latest case, serp-wireframing / wireframe-skill-revamp:
  - F3: a capture driver advanced by matching the model's obligation wording 'prep-evidence THIN_READ'.
  - F4: count rules stood in for quality calls: a read is thin below `thin_min_usable_page1`, a topic is banned when punished on more than half of a stem's pages, a long-excerpt match is refused, and a hero `heading_directive` is refused.
  - F5: a blocking prep gate asked the operator "good enough" for each page.
  - Four paid Buffalo capture attempts ran through the THIN_READ path before the gate was removed.

Operator, 2026-11-17 (relayed by the watch terminal): "There should be no slop checks and tests." and "Everything that the model needs to decide should be loose, and not suffocated by endless tests."

Operator, 2026-11-17, in the door: "I don't want the deterministic code to suffocate agent decisions. This is not supposed to happen because the tests will never pass that way, or at least they will suffocate the flow." and "The intent is to never suffocate the agentic workflow with tests that go against the probabilistic nature of the agent."

Open framework instances of the same class: Tamdoma/tamdoma-framework#645 and #647.

## Location

The akrogon lifecycle rules that every chart, plan and review reads:
- `skills/chart-issues/assets/standing-design.md`
- `skills/chart-issues/assets/shapes.md` (handoff audit)
- `skills/chart-issues/assets/questions.md` (pitfall removers)
- `skills/plan-issue/SKILL.md`
- `skills/check-issue/SKILL.md`
- `skills/chart-issues/lesson-rule.md`
- `skills/learn-issues/SKILL.md`

## Reproduction

The pattern appears in every chart where a quality concern meets the rules below. Latest trace:
1. Chart fork rounds ask for a remover for each pitfall.
2. A count gets proposed, for example `thin_min_usable_page1` (`issues/chart/serp-wireframing/forks/evidence.md:37,44`, tagged by all four seats). A per-page operator answer also gets proposed (`forks/stops-locks-trust.md:47`).
3. The handoff audit accepts both as observable done-criteria.
4. plan-issue writes a red-first case for each condition.
5. implement-issue builds a script gate and a capture driver that reads text.
6. check-issue calls over-constraint a Nit until a run fails.

## Expected behavior

A script decides only what has one right answer. What a model is asked to decide is decided by the model, recorded with its reason, and judged by the reviewing seat. No count, threshold, text match on model output or operator stop stands in for that decision. This holds from charting onward, under autopilot too, with no new script, registry, ledger or scanner. A scanner for "slop checks" would be the same pattern one level up.

## Urgency

High and recurring. Each recurrence costs paid recordings, stalled leaves and repair rounds. Every earlier fix drained the checks that already existed and left the rules that create new ones unchanged, so new charts rebuild the pattern within days. Workaround: the operator notices after a real run is blocked and asks for the named checks to be removed (loop B3 below). That workaround has a delay of days.

## Suspected cause

Supported hypothesis from a blind review by four seats (door A and consultants B, C, D, 2026-11-17). All four agree on the core points.

Reinforcing loops that create these checks:
- **L1 Proof ratchet.**
  - `shapes.md:386`: a done-criterion must be an observable result.
  - `standing-design.md:8`: a test exists only as the proof of a criterion.
  - `standing-design.md:14`: new behavior shows one deliberate break turning its test red.
  - `plan-issue/SKILL.md:51-53`: every condition a decision can break gets a case.
  - A model's quality call has no red or green form, so seats rewrite it as a count or a string to make it provable.
- **L2 Pitfall remover list.** `questions.md:27` allows only an option part, a door probe, a done-criterion or a named operator step. "The model weighs it and records why" is not an allowed remover, so pitfalls become criteria (feeding L1) or per-item operator stops (F5).
- **L3 Writer/checker mirroring.** `standing-design.md:18` says writer and checker share one rule. A nuanced rule is flattened into the most mechanical form both can apply the same way.
- **L4 Recording replay.** `standing-design.md:15`: a capture driver must steer a real session through every gate, so it reads text when a gate waits for an answer (F3). Removing a gate then costs a paid re-record, so gates stay.
- **L5 Lesson-to-guard.**
  - `lesson-rule.md:6`: "A judgment lesson files nothing."
  - `learn-issues/SKILL.md:21`: only a lesson detectable as a fixed pattern is seeded.
  - A lesson saying "this check was too strict" has no exit.
  - Framework `learnings/LESSONS.md` lines 146 and 156 say "judge meaning, check literal paths". They have gained new cases (history files 2026-09-30, 2026-10-01, 2026-10-08, repeated on 2026-11-04 and 2026-11-14) and never an Applied line. Transfer goes only to a review step in the same repo, so a framework lesson cannot reach the akrogon chart or plan text that produces the checks.

Balancing loops that are present but too weak:
- **B1** `check-issue/SKILL.md:49-51`. A Fix needs a realistic source and a consequence today, so a check that would block valid model output is a Nit until a run fails. The prose-test rejection covers only akrogon tests. `:59` says scenarios a done-criterion names always block, so B must enforce a proxy once the brief names it.
- **B2** "No vanity tests" (`standing-design.md:7`) limits tests, not criteria.
- **B3** The operator is the only sensor. Every earlier fix is scoped to the surface that hurt:
  - satellite-check-latitude removed named checks, and its test-pinning fork records "Rejected: a general test sweep (scope)".
  - agent-latitude added a block ledger and an operator-triggered review with "Done when: never". The ledger does not see leaf-owned gates, planned tests or capture drivers.
  - halt-prose-match anchored a regex instead of removing the text match.
  - The principle is written in about nine chart forks and in no akrogon or framework rule file.
- **Autopilot.** `autopilot.md:5` answers "by the evidence". The lens is not in any text the door reads, so under autopilot the door narrows or adds checks (anchored regex; bound 2 plus an operator stop in copy-judgment-convergence).

Main condition: no point in charting, planning or review classifies an outcome as mechanical (one right answer) or as a judgment. There is also no proof form for a recorded model judgment, so L1 forces a proxy.

Proposed rule text, for the planner to judge. All of it goes into existing files:
- **X1 `standing-design.md` (main leverage point, read when every leaf design is prepared).** Add: "A script decides only what has one right answer: a file exists, a key, state or reference is valid, a value is inside a granted bound, nothing is blank, text that runs literally matches, security, spend and destructive effects. What a model is asked to decide (quality, sufficiency, relevance, similarity, wording, intent, which items apply) is decided by the model doing the work, which records its choice, its reason and the evidence it weighed. No count, share, similarity score, keyword or output-text match, or operator stop stands in for that choice, unless an operator-named literal contract defines the value itself. Its done-criterion is the recorded choice with its reason. Its proof is one recorded real run whose outputs the review seat reads, and the leaf states what stays unproven. The deliberate-break line does not apply to it." Scope the line 18 writer/checker sentence to mechanical rules and drop its narrow model-judged known-acceptable/unacceptable clause, or fold it into the new line.
- **X2 `shapes.md:386` handoff audit.** Add to the existing refusal list: refuse a criterion or design line whose pass depends on a script matching model-written text, or on a count, share or similarity score standing in for a model's choice. Refuse an operator stop whose only job is to waive such a gate per item. The design instead names who judges, on what evidence, and where the reason is recorded. This is where X1 is applied before code exists, including under autopilot.
- **X3 `questions.md:27`.** Add "the model's own recorded judgment" as a remover when the trap is a quality call. Add: "an operator step removes a trap only when the operator alone can grant or know the answer."
- **X4 `plan-issue/SKILL.md:51-53`.** Scope the per-condition and red-first cases to mechanical conditions. A judgment criterion gets no script case: its plan entry names the recorded run, the outputs the reviewer judges and the reason the brief records. Slot D disagrees with this item and holds that fixing criteria is enough. B and C say plan-issue's per-condition rule fires even on loose criteria. The door sides with B and C.
- **X5 `check-issue/SKILL.md:51,59`.** A check, gate, test or capture-driver step in the diff that decides pass, fail or a next step by matching model-written text, or by a count standing in for a model's choice, is a Fix under the standing-design line. No failed run is needed. A criterion-named scenario of this kind is a wrong-criterion Fix routed back, not a shield. Extend the prose-test rejection from akrogon tests to consumer repos.
- **X6 `lesson-rule.md:6` and `learn-issues/SKILL.md` Sort.** A lesson whose mechanism is a check that refused valid work is seeded as a removal. A judgment lesson whose live step is an akrogon skill may be sorted Transfer with that skill file as its destination, across repos.

Exclusions:
- No new script, ledger, registry or scanner.
- implement-issue and merge-issue are unchanged. They build and land what they are handed.
- Real function checks on model output stay: schema, references, checksums, spend bounds, a required record that is absent, security, accessibility minimums.

Whose view: agent (four-seat blind review), with the operator's own words quoted above.

Files read:
- Akrogon skills at main: `chart-issues/assets/{standing-design,shapes,questions,autopilot}.md`, `chart-issues/lesson-rule.md`, `plan-issue/SKILL.md`, `check-issue/SKILL.md`, `learn-issues/SKILL.md`.
- Framework charts: `verifier-boundaries`, `agent-latitude` (including `slots/map-merged.md` loops R1 to R5), `satellite-check-latitude`, `halt-prose-match`, `writer-checker-rule-source`, `copy-judgment-convergence`, `serp-wireframing`.
- Framework `learnings/LESSONS.md` and `learnings/history/`, and `issues/closed/agent-latitude/new-rules-pilot/implementation/labels-new.md:223,231`. The pilot's loosened rules still produced 11 form-only rounds against 6, with 8 from one deterministic log-facts check. Friction moved to the next deterministic surface.
- Seat files are kept at the door's scratchpad and are not in either repo.

Not inspected or would disprove:
- No controlled count of all framework checks by kind. Slot D's lesson count of about 48 "add or keep a check" lines against 7 "avoid" lines is one reader's single pass, low confidence.
- A chart since 2026-11-11 that met a quality concern and did not produce a proxy would weaken L1 and L2.

Related reports:
- Tamdoma/tamdoma-framework#389, closed. The same class on satellite surfaces. Its fix removed named checks only.
- Tamdoma/akrogon#95, closed. It widened lesson Retire only. Seed and Checkable did not change.
- Tamdoma/tamdoma-framework#645, #647, open. Current instances.
- Tamdoma/tamdoma-framework#115. Tests pinned to incidental details; "agents learn to re-record instead of judging".
- Searched Tamdoma/akrogon and Tamdoma/tamdoma-framework, all states: the author's issues from the last 2 days (limit 30), and the keywords "model judgment check" and "deterministic judgment" (limit 8). None covers the lifecycle rule.

## Source: operator 2026-11-17 door message

I just pulled a very important issue. Look into it, and if you need more info, get it from the framework space c-framework slot A agent. We need to fix this on a systemic level. You can generally follow the rules, but I want you to consult with consultant slot B, which will be Claude Code and Model Fable 5.2 High Effort. Also, use a consultant C slot which will be Pi default model inside of it. Full autopilot mode, even the signposts. Think about it as a systems engineer who is very smart at making a distinction between the agentic part of the system, which is probabilistic, and then the deterministic part, which is there to create guardrails. The problem arises when these two clash consistently and when deterministic systems take over the tasks of the probabilistic part of the system. This is something we don't want. We don't want to be creating not necessary tests that are probably not going to work. This is a very important upgrade and change. It will make merging much easier. We also want to go in the direction of where the AI models are going, so only slight guardrails to keep them on track. Do some research on it, especially recently from September to this month in 2026. How the models have improved, especially the ones that we are using most of the time, and how they don't need to be babysat as before. We still need testing, but only for the most important crucial stuff.

## Agent findings

Opening map 2026-11-17 by A, B, C (slots/map-A.md, map-B.md, map-C.md; merged in slots/forks-merged.md). The report's sites hold at main 7cecb045, with these additions:
- implement-issue `## implement` restates standing-design's test lines (test-only-as-proof, deliberate break) and allows test edits only under three exceptions, so a rule fixed only in standing-design is contradicted by a sibling (A,B,C).
- check-issue `## check.repair`: B's repair is accepted only by a planned proof B did not write, which no model choice has (B).
- `skills/chart-issues/lesson-rule.md` links to `skills/lesson-rule.md`; edits go in the target (B).
- Framework door facts (slots/info-framework.md): proxies in serp-wireframing were born at fork and final-shape steps after a signpost already said "the model decides"; 3 of 5 paid captures tied to the THIN_READ gate and driver; topic-theme-fit and ia-revamp kept model judgment where the operator named it.
- Tests pinning skill text (tests/run-units.test.ts, tests/docs-links.test.ts) pin only literal commands and links: unaffected.
