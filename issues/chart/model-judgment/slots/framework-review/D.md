# Systemic: why scripts keep deciding what the model should decide (slot D)

Paths: `AK` = /home/ivan/Work/infra/akrogon/skills, `FW` = /home/ivan/Work/infra/tamdoma/framework, `CH` = FW/issues/chart, `WL` = FW/issues/open/serp-wireframing/wireframe-skill-revamp.
Sources: records only. Two Haiku readers gathered chart and lesson facts. I spot-checked every line cited below except the lesson counts in E7, which are one reader's single pass (low confidence).

## Short answer

Akrogon has four rules that turn every decision, risk and lesson into a script check, and no rule that asks "should a script or a model decide this?". The only thing that pushes back is the operator getting blocked in a real run. That pushback has fired five times since 2026-10-06. Each time it removed named checks and wrote the principle into one chart's fork. It never reached the text that every new chart reads, so the next chart rebuilt the checks.

## Loops

- L1 (R) Proof loop. Lives in chart-issues handoff and plan-issue. A done-criterion must be "an observable result" (`AK/chart-issues/assets/shapes.md:386`). A test exists "only as the proof of a done-criterion" (`standing-design.md:8`). New behavior "shows one deliberate break turning its test red" (`standing-design.md:14`). Plan adds a failing case for each condition, including what must "be refused" (`AK/plan-issue/SKILL.md:51`). A model's quality call has no red or green form. So the seat rewrites it as a count or a string to make it provable. More decisions in a brief means more thresholds.
- L2 (R) Pitfall loop. Lives in chart-issues fork rounds. Each pitfall needs a remover, and the allowed removers are "a part of the option, a probe the door runs before handoff, a done-criterion of the leaf, or a named operator step" (`AK/chart-issues/assets/questions.md:27`). Consultants are asked for pitfalls. Each pitfall becomes a criterion (then L1) or an operator stop. "The model weighs it and records why" is not on the list.
- L3 (R) Lesson loop. Lives in learn-issues and the lesson rule. Only a "Checkable" lesson is seeded, and "A judgment lesson files nothing" (`AK/lesson-rule.md:6`). Checkable means "a command could detect the mechanism as a fixed pattern" (`AK/learn-issues/SKILL.md:21`). "Stays" is the default for judgment calls (`:23`). So a failure leaves the lesson list only by becoming a guard. A lesson that says "this check was too strict" has no exit and no reader.
- L4 (R) Recording loop. Lives in standing design. Each model stage replays output "recorded from one real run" (`standing-design.md:15`). A capture driver must steer a real session through every gate, so a gate that waits for an operator answer forces the driver to read text (F3: `WL/plan.md:44`, `:210`). Recordings also make removal cost a paid re-record, so checks stay (E5).
- L5 (R) Runtime tool loop. Lives in the framework. The only way to hold a unit open at close is a gate-bound checker problem (`CH/serp-wireframing/forks/stops-locks-trust.md:47`). So a quality worry gets written as a script gate with a fixed finding code.
- B1 (B, exists, wrong sensor) Review Fix bar. A Fix needs a "realistic source" and "its consequence today" (`AK/check-issue/SKILL.md:49`). This stops invented defects in code. It also means a check that would block valid model output is only a Nit until a real run fails (E6).
- B2 (B, exists, wrong target) "No vanity tests" (`standing-design.md:7`). It limits tests that prove no criterion. It does not limit criteria, so L1 is untouched.
- B3 (B, exists, slow) Operator blocked in a paid or live run, then a chart removes named checks (H1-H5). Delay is days. The cost of one firing: "about USD 10.70 over 7 attempts" (issue #389). It is the only loop that drains the stock of checks, and it has one sensor: the operator.

## Evidence

- E1 Latest case, origin of F5. Signpost S3: "No usable SERP data stops that page; operator gives another query or records a waiver" (`CH/serp-wireframing/forks/signposts.md:24`). S19 in the same file allows "one operator stop per real build" (`:71`). The per-page THIN_READ answer got in anyway (`stops-locks-trust.md:47`). Loop L2.
- E2 Latest case, origin of F4. The punish floor "at least 5 usable pages" is tagged (A,B,C,D) (`forks/evidence.md:37`). The `thin_min_usable_page1` key came from my own finding: "K11 (D F8)" (`forks/evidence.md:44`). All four seats, me included, answered a quality worry with a count. Loops L1 and L2.
- E3 satellite-check-latitude, 2026-10-24. 15 checks listed as halting model output with no visitor defect: contrast margin above WCAG, full font-stack string compare, a 180-character cap (`CH/satellite-check-latitude/INTAKE.md:186-236`). Stated cause: "Checks were written to pin the deterministic generator's output, then reused unchanged on LLM-written palettes, HTML and copy" (`INTAKE.md:236`).
- E4 Text match on model output, handled three times. 2026-10-16 "`HALT:` text stays failure evidence" (`CH/agent-latitude/forks/admission.md:44`). 2026-10-25 one HALT line removed (mockup-lane-false-stops). 2026-11-04 the regex was anchored, not removed, with the dissent "any match on reply text still lets prose decide" (`CH/halt-prose-match/forks/halt-signal.md:31`).
- E5 Operator stop and count added for a quality call. copy-judgment-convergence, 2026-10-30: "The script counts copy repair rounds ... bound 2 ... stops for an explicit operator decision per residual finding" (`CH/copy-judgment-convergence/forks/judgment-bound.md:39`). Checks kept because removal forces a paid re-record: `CH/satellite-check-latitude/forks/declared-contrast.md:28`, `content-caps.md:27`.
- E6 The same wording lesson filed as a Nit four times. `FW/learnings/history/2026-09-30-resolver-guidance-prose-tests.md` (repeated inside it on 2026-11-04), `2026-10-01-discovery-prose-assertions.md`, `2026-10-08-residue-triage-prose-proof-layout.md`. Each says no current defect was established. Loop B1.
- E7 Lesson stock direction. Of 208 lines in `FW/learnings/LESSONS.md`, about 48 tell the reader to add, tighten or keep a script check and 7 clearly warn against one. All 7 date from 2026-09-30 to 2026-10-17. Line 268 (2026-10-29) moves a model call to "the deterministic floor". Loop L3. Low confidence on the counts.
- E8 Still happening. Open issues #645 (2026-11-16, `check-extracted-entries.js` reports 42 findings on correct ecommerce data) and #647 (2026-11-17, `verify-astro-architecture.js` fails 7 blocking checks on a correct build).
- E9 The principle is written nine times in chart forks and nowhere shared. Examples: `CH/verifier-boundaries/forks/schema-format.md:7`, `CH/halt-prose-match/forks/signposts.md:10`, `CH/writer-checker-rule-source/forks/check-reduction.md:18`. Grep finds zero hits in `AK/**`, `FW/CLAUDE.md`, `FW/.claude/workflow/*.md` and `FW/.claude/skills/_shared`. It exists in the operator's own global CLAUDE.md ("Function over form").

## Earlier framework episodes

- H1 2026-10-06. Operator lens: "scripts check function only, the agent judges form, a form problem is a finding not a HALT" (`CH/verifier-boundaries/forks/schema-format.md:7`). Landed: form verdicts in that chart stopped blocking.
- H2 2026-10-16, agent-latitude. This is the best match for "a while ago". Operator: "I just don't want to make this so deterministic that it always fails. We need some spacing for the agents to figure it out. In the past we had a lot of issues with all these tests that were just blocking progress all the time" (`CH/agent-latitude/INTAKE.md:10`). Decided: thin admission, "Each blocking check states ... the concrete outcome it prevents and one valid variation it must accept" with "no presence check" (`forks/check-retirement.md:32`), a block ledger, "the operator decides every change to what blocks" (`:36`), and a standing review duty. Landed: six leaves on 2026-10-16 (`FW/issues/closed/agent-latitude/`, for example commits 71e0a982f4, c9d2015484, 3fced21228, 419d23279b) plus akrogon#95, which added removal as a lesson Retire exit.
- H3 2026-10-24, issue #389 and satellite-check-latitude. Operator: "only fail when something real breaks ... Do not constrain the LLM so tightly it cannot breathe." (as reported in the agent-filed issue, so possibly not verbatim). Decided: remove named checks, keep the rest, "by removing brittle checks, not by adding rules". "Rejected: a general test sweep (scope)" (`CH/satellite-check-latitude/forks/test-pinning.md:15`). Landed: three leaves (`FW/issues/closed/satellite-check-latitude/`).
- H4 2026-11-04, halt-prose-match. Landed: an anchored matcher. The text match stayed (E4).
- H5 2026-11-11, writer-checker-rule-source. Operator: "Do we even need that many scripts and checkers all over the place? They're just blocking everything all the time." (`forks/check-reduction.md:5`). Decided: "every rule a leaf touches first earns its place" (`:66`), three refusals retired, and a new chart framework-check-review with seven named changes. The keep test was "not asked" because it was treated as a carry from H2 (`:22`).
- H6 Why none of it held:
  - H6a Every fix drained the stock (named checks) and left the inflow (L1, L2, L3) as it was. The principle stayed in each chart's fork (E9). serp-wireframing was charted days after H5 with no line telling its seats about it (E1, E2).
  - H6b The H2 rule asks the wrong question. Any check can say what it prevents. The THIN_READ gate did: "Prevents batch workers from carding a thin read" (`/home/ivan/.akrogon/worktrees/framework/wireframe-skill-revamp/.claude/skills/arch-create-wireframe/verification-gates.json`, gate `prep-evidence`). It names no accepted variation, and nothing asked whether a model should make that call.
  - H6c The H2 rule is judged "by the reviewer", after the build, where over-constraint is a Nit (B1, E6).
  - H6d The H2 review duty has no trigger: "Owner: operator, who asks for each listing or review ... Done when: never" (`CH/agent-latitude/CHART.md:27`). The ledger was read once, on 2026-11-11, after the operator complained again.
  - H6e Under autopilot the door answers "by the evidence" (`AK/chart-issues/assets/autopilot.md:5`). Most picks in H3, H4 and E5 were the door's own. It narrowed or added (anchored regex, bound 2 plus operator stop), because the lens is not in any text it reads.
  - H6f akrogon#95 widened Retire only. Seed and Checkable did not change, so L3 kept running (E7).

## Gaps

- G1 The missing balancing loop: a "who decides" test at the moment a criterion is written. Today nothing in `shapes.md:386` or `standing-design.md` separates "a script can settle this" from "a model was asked to decide this". It should live in akrogon standing design, because that file is read "when preparing leaf designs" (`AK/chart-issues/SKILL.md:19`) for every repo.
- G2 No proof form for a model's call. Standing design has one for a narrow case: "A model-judged such check tests one known-acceptable and one known-unacceptable case at target size and states what stays unproven" (`standing-design.md:18`). It applies only to group-size checks. Without a general form, L1 forces a count.
- G3 The pitfall remover list has no judgment option (L2).
- G4 Review cannot raise over-constraint before a failed run (B1).
- G5 Judgment lessons have no outlet into charting text. Transfer goes only to "the one live review step ... in the same repo" (`AK/lesson-rule.md:9`).
- G6 The operator is the only sensor (B3). G1 and G4 move the sensing to the charting seat and the review seat, which already run on every leaf.

## Fix items

Akrogon holds the rule. The framework gets removals only. No new script, registry, scanner or file.

- X1 akrogon, `AK/chart-issues/assets/standing-design.md`. Current: no such line. Lines 8 and 14 apply to every criterion. Proposed new line: "A script decides only what has one right answer: a file exists, a key, state or reference is valid, a value is inside a granted bound, nothing is blank, text that runs literally matches. What a model is asked to decide (quality, sufficiency, relevance, wording, which items apply) is decided by a model that records its choice and reason. No count, threshold, text match on model output or operator stop stands in for that choice. Its done-criterion is the recorded choice with its reason. Its proof is one recorded real run read by the review seat, and the leaf states what stays unproven. The deliberate-break line does not apply to it." Why: closes G1 and G2, and stops L1 at its source. It reuses the recorded-output rule and the line 18 pattern.
- X2 akrogon, `AK/chart-issues/assets/shapes.md:386`. Current: "the audit refuses a criterion naming a test file, assertion or test count, citing a `merge_checks` command or claiming repo health outside leaf ownership". Proposed: add to that list "or one whose pass depends on a script matching model-written text or on a count standing in for a model's choice (standing design)". Why: the existing handoff audit becomes the place where X1 is applied before any code exists. It also covers autopilot (H6e).
- X3 akrogon, `AK/chart-issues/assets/questions.md:27`. Current remover list as quoted in L2. Proposed: add "or the model's own recorded judgment, when the trap is a quality call", and "an operator step removes a trap only when the operator alone can grant or know the answer". Why: closes G3 and stops per-item operator stops like F5.
- X4 akrogon, `AK/check-issue/SKILL.md:51`. Current: "a missing or bad test blocks only when a done-criterion has no test that would catch its failure, a realistic Fix has no test, or a test mocks the unit under test." Proposed: add "A check, gate or test in the diff that decides pass or fail by matching model-written text, or by a count standing in for a model's choice, is a Fix under the standing-design line. No failed run is needed." Why: closes G4. The same finding was a Nit four times (E6).
- X5 akrogon, `AK/lesson-rule.md:6`. Current: "A judgment lesson files nothing." Proposed: "A judgment lesson files nothing, except a lesson whose mechanism is a check that refused valid work. That lesson is seeded as a removal." Why: gives "too strict" lessons the same exit as "too loose" ones (L3, G5).
- X6 framework, removal. Once X1 lands, retire the lesson lines it replaces through one operator-run learn-issues pass: `FW/learnings/LESSONS.md` lines 146, 148, 156, 172, 178, 214, 243. Review lines 72 and 268, which tell the reader the opposite.
- X7 framework, removal. Send #645, #647 and any check found by X4 to the existing framework-check-review chart. Do not open a second review chart.
- X8 framework, removal. Drop the "Check reviews" standing duty in `CH/agent-latitude/CHART.md:27` after X2 and X4 land. A duty with no trigger gives false cover (H6d).
- X9 No change to plan-issue, implement-issue or merge-issue. They build the criteria they are handed. Fixing the criteria fixes them.

Seeds: one akrogon seed for X1, X2 and X3 together (one rule, three reading points), one for X4, one for X5. One framework seed for X6 to X8.

## Risks

- R1 X1 read too widely could drop a real function check on model output (schema, references, checksums, spend bounds, missing required text). The first sentence of X1 names those as script work.
- R2 X4 could make review a new source of blocks. It is limited to checks in the leaf's own diff that read model-written text or count in place of a model's choice.
- R3 Recordings that exercised a removed gate need re-recording. That is a paid cost per removal, as in loose-judgment L6.

## Leverage point

X1 with X2. The question "script or model?" must be asked where the criterion is written, in the akrogon text every chart reads. Everything downstream (plan, tests, gates, capture drivers, operator stops) is built from the criterion.
