# Territory map, slot B

Read in full: INTAKE.md, forks/signposts.md, info-framework.md, framework-review/D-rebuttal.md, `standing-design.md`, `lesson-rule.md`, `skills/AREA.md`. Read by section: `shapes.md` (Leaf files, Preflight and validation), `questions.md` (round shape), `plan-issue` (plan.synthesis), `check-issue` (check.review, check.repair), `learn-issues` (Sort, Apply), `autopilot.md`, `lifecycle-rules.md` (Red check). By search only: `implement-issue`, `chart-issues/SKILL.md`. framework-review B, C and D came through a Haiku extract that I did not spot-check. Not opened: merge-issue, seed-issue, watch-issues, `src/`.

Codes: K forks, Q practitioner questions, T pitfalls, C contradictions, P proof.

## 1. Material forks

**K1. Where does the definition live?**
- K1a (pick) One line in `standing-design.md`. Each step file gets one short clause that names that line and says only what the seat does at that step (refuse, plan no case, call it a Fix).
- K1b Restate the full rule in every file.
- K1c Put it in `skills/lifecycle-rules.md`.
- Why: one home cannot drift. K1b rebuilds loop L3 inside the rules and adds the most words. K1c misses the chart door, which reads standing-design and not lifecycle-rules.
- Later risk of K1a: a seat that reads only its own section never opens the definition. So each step clause must work alone for its one action.

**K2. How is a criterion marked as a model's choice?**
- K2a (pick) By its wording, written at charting: who decides, on what evidence, where the choice and reason are recorded. The planner may not re-label a one-right-answer criterion as a choice.
- K2b A tag or field on each criterion.
- K2c No mark. Each seat classifies again.
- Why: K2b is a new schema field and the first thing a script would key on. K2c lets the planner drop a real test by calling it "a judgment". That is the same failure in the other direction.
- Later risk of K2a: the door's wording decides everything downstream, so the audit sentence (C5) is the control point.

**K3. Which choices need a record, and where does it sit?**
- K3a (pick) Only a choice that a done-criterion or a next step depends on. It sits in the artifact the work already writes: the product's own output for a product model, the seat's existing record file for a lifecycle seat. No shared shape across leaves.
- K3b Every model choice gets a record.
- K3c One fixed record shape for all leaves.
- Why: K3b swaps count checks for paperwork. K3c is a schema that invites a validator and flattens the record the way L3 flattened rules.
- Later risk of K3a: "reason not blank" passes with one empty word. Accepted cost. The review seat reads the reason. No script checks its length or words.

**K4. Which numbers may still sit on model output?**
- K4a (pick) By source only. A script enforces a number when an outside system enforces it (an API limit, a schema) or the operator's own words name it, and the criterion cites that source. Any other number goes to the model as a named default with its source, and the model may leave it with a recorded reason.
- K4b A fixed list of allowed kinds.
- K4c No numbers at all.
- Why: K4a matches signpost 1a and gives old thresholds a place to go instead of a fight. The framework already did this once (ia-revamp signposts S5, in info-framework section 2). K4c would hit spend, round and wave bounds, which are real guardrails.
- Later risk of K4a: seats mine old intakes for any number the operator once said. The citation must be to words about this outcome, and the review seat reads it.

**K5. Review wording, and who repairs a judgment Fix?**
- K5a (pick) One clause inside the existing Fix paragraph of check.review: a recorded choice is a Fix only when the seat names a fact the recorded evidence contradicts, a required input not weighed, a broken function or a keep-list breach. The writer seat redoes the choice once with that harm as new evidence. A new check in the diff that decides by a count or text match on model output is a Fix on sight.
- K5b A new verdict type or a new paragraph.
- K5c No change, because "an argument grounded only in B's position is a Nit" is already there.
- Why: the existing sentence covers most of 3a, so K5a is small. K5c leaves C8 and C9 standing.
- Later risk: if B repairs a judgment Fix itself, the reviewer's taste replaces the writer's and check.repair has no proof to accept it by (C9). For a product model, redoing a choice means changing its instructions and a paid re-record under the existing fresh-call rule. So 3a's narrow bar is also the spend control.

**K6. A seat mid-leaf hits an existing check, not named in its brief, that refuses its valid output. What may it do?**
- K6a (pick) A fourth exception in implement-issue: remove it in its own commit with the existing `Test-Change` trailer citing the refused real output. The same sentence names the keep list as never removable. The review seat judges each removal.
- K6b Only the planner may plan a removal. A later find ends the pass `failed`.
- K6c No change.
- Why: signpost 5a says "in its branch". implement-issue allows no test edit outside three exceptions (C10), so 5a cannot happen without this. The trailer and its phase guard already exist, so no new machinery.
- Later risk: delete to get green. Also a clash with "keep every test that guards a real past regression" (C7). The rule must say the keep list is defined by what a check tests, not by why it was added.

**K7. An in-flight brief names a proxy as a done-criterion. What is "routed back"?**
- K7a (pick) The seat reads that criterion in record and choice form, keeps its function checks, does not enforce the count or match, and writes the reading in its report. The review seat judges the reading. The brief text is not edited. This applies only after a real run refused valid output.
- K7b The pass ends `failed` with a wrong-criterion reason and the door re-charts.
- K7c Stretch the plan-issue proof-command rule to cover it.
- Why: no route for a wrong criterion exists today (C8, C10). K7b is an operator stop per leaf, which signpost 6a rules out. K7c bends a rule about commands into a rule about results.
- Later risk of K7a: "the brief is locked" weakens. The on-hit trigger limits it. Without that trigger every number in every old brief becomes suspect on sight.

**K8. Lessons.**
- K8a (pick) Two edits. Seed: a lesson whose mechanism is a check, gate or stop that refused valid work files a removal report. Transfer: the target widens from "review step" to the step where the model makes the choice, same repo, operator approval unchanged. No cross-repo transfer.
- K8b Add cross-repo Transfer (intake X6).
- K8c Leave lessons for a later chart.
- Why: the Home clause in `lesson-rule.md` already sends a lesson about akrogon's skills to akrogon's `learnings/`. Cross-repo transfer is a new write path the rules do not need.
- Later risk: check.review tells B to record each reusable Nit as a lesson. Under 3a more taste Nits appear. They must not become lesson lines, or L5 refills from review.

**K9. The door's own picks under autopilot.**
- K9a (pick) One clause in the limits sentence of `autopilot.md`: the door never answers a fork with a count, share or text match on model output. It takes the model-decides option and does not park for a number.
- K9b The door parks the chart for the operator to name a number.
- K9c No change. The handoff audit catches it.
- Why: the audit comes after the forks. In serp-wireframing the proxies were made at the fork step even though the signposts said the model decides (info-framework section 5). K9b turns a quality call into an operator wait.

**K10. Leaf split.**
- K10a (pick) Two leaves. Leaf 1 carries the whole chain together: standing-design, the shapes audit, questions, autopilot, plan-issue, check-issue, implement-issue. Leaf 2 carries `skills/lesson-rule.md` and learn-issues, with no blocked-by.
- K10b One leaf per file.
- K10c One leaf.
- Why: a half-landed chain does harm. With the audit changed and plan-issue not, a record-and-choice criterion ends the plan pass `failed` for "new proof machinery". Lessons are a separate loop, provable alone, and droppable.

## 2. Practitioner questions

- Q1. When does the rule bind? Consumer doors read the installed copy under `~/.akrogon/current/skills`. How does a landed change reach it, and what happens to a leaf planned under the old text and reviewed under the new?
- Q2. Does the review seat have the record in hand? check.review launches nothing. So the report must name the path of the record and of the run output.
- Q3. Writer and reviewer are often different vendors' models. Is a taste gap between them a Nit every time, also when the reviewer is the stronger model?
- Q4. Who says the refused output was valid? The seat that wants green is judging its own removal.
- Q5. With no measurement machinery, how will anyone know the proxies stopped? The operator stays the only sensor unless a named person reads the next two framework handoffs.
- Q6. Does a leaf that edits autopilot's own limits need the operator's eye? `autopilot.md` holds a step on main or a lesson write that changes its limits. A leaf is neither, and the intent is the same.
- Q7. Does 4a reach akrogon's own command code that parses seat-written files (markers like `Handed off`, headings like `## Taken`)? I read those as fixed references that run literally, so they stay. The line should say so.
- Q8. Each rule paragraph is one long line. Do the unattended-runs and prompt-stalls charts touch the same lines?

## 3. Pitfalls and what removes each

- T1. The lens becomes an escape from proof ("it is a judgment, no test"). Removed by K2a, an option part.
- T2. Seats delete checks to get green. Removed by K6a: keep list in the same sentence, real output cited, own commit, review reads each removal.
- T3. The reason record turns into ceremony or gets format checks. Removed by K3a plus the K5a on-sight Fix, which covers a script that scores the reason text.
- T4. Blocks move from scripts to review rounds (the pilot's 11 form-only rounds). Removed by K5a.
- T5. Taste Nits become lessons, then guards. Removed by a clause in check.review or the lesson rule that a different reading of a recorded choice is never a lesson (K8).
- T6. Half-landed rules fail valid plans. Removed by K10a.
- T7. The rule is over-applied to real bounds: spend, rounds, outside limits. Removed by K4a naming them as mechanical in the same line.
- T8. "The model will judge it" becomes the lazy remover for every pitfall. Removed by wording in `questions.md`: that remover names who judges, on what evidence and where the reason is recorded.
- T9. Merge conflicts on shared long lines (Q8). Removed by a door probe before handoff that lists open work on the same files, and by adding new sentences as their own lines.
- T10. The installed copy lags (Q1). Removed by a door probe of how installed skills update. If it needs the operator, it is a named operator step.
- T11. The old-brief reading spreads to every numeric criterion. Removed by the on-hit trigger in K7a.
- T12. Nobody notices a relapse (Q5). No option removes it. It is the cost of "no measurement machinery". One operator step softens it: read the next framework handoff that meets a quality concern.

## 4. Contradictions between the live rule files and the signposts

- C1. `standing-design.md`, "Writer and checker share one rule definition": its last sentence asks a model-judged check for one known-acceptable and one known-unacceptable case. That is option 2c, which signpost 2 rejects.
- C2. `standing-design.md`, "A bug fix shows its test failing before": every new behavior needs a deliberate break. No exception for the choice part (2a).
- C3. `standing-design.md`, recorded-output line: it never mentions capture drivers. Nothing forbids a capture command that advances by matching model wording (4a). A gap, not a clash.
- C4. `questions.md`, round shape: "Pitfalls avoided" and the "Known traps" sentence allow four removers. None is the model's recorded judgment, and an operator step has no limit (2a, 6a). The same paragraph already says a trap nothing removes is the cost of its option, which supports accepting some traps.
- C5. `shapes.md`, Preflight and validation, audit paragraph: no refusal for a count or text match on model output, or for a per-item operator stop (1a, 6a). It already refuses "a guessed wall-second or CPU-second cap", so a guessed quality number fits the same list.
- C6. `plan-issue`, plan.synthesis, four places: each criterion maps to "the command that observes it", the plan proves criteria "with the leaf's own tests and `checks`" and fails the pass for new proof machinery, each breakable condition "gets a case", and A "writes a test for each done-criterion" shown red. All four bind the choice part (2a).
- C7. `check-issue`, check.review, "Compare tests with acceptance criteria": a criterion with no test blocks (2a). "Wording coupling that does not fail today" is a Nit (1a wants a new proxy to be a Fix on sight). The prose-test rejection covers akrogon tests only (4a). "Tests guarding real past regressions stay" has no exception for a guard that is itself a proxy (5a).
- C8. `check-issue`, check.review, "Failed `checks` commands always block": scenarios a criterion names always block. Signpost 5a says a proxy criterion is not enforced.
- C9. `check-issue`, check.repair: "B's repair is accepted only by a planned proof B did not write". No such proof exists for a choice (2a, 3a).
- C10. `implement-issue`, implement and check.fix: seats "write and edit no test" outside three exceptions, check.fix repairs "without weakening criteria or failing tests", and a criterion that cannot be shown ends the pass `failed`. Signpost 5a needs a removal in the branch and a non-enforced criterion. The intake's exclusion "implement-issue unchanged" conflicts with signpost 5.
- C11. `skills/lesson-rule.md`, Seed and Transfer, and `learn-issues`, Sort: "A judgment lesson files nothing", transfer only to a review step in the same repo, Stays as the default. Signpost 5 steers "lesson seeding as removal". The Retire clause also rewards a "running mechanical guard" as an exit.
- C12. `autopilot.md`, first paragraph and limits sentence: the door answers "by the evidence" with no limit on naming a number on model output (1a, 4a).
- Note: the intake's `skills/chart-issues/lesson-rule.md` is a link to `skills/lesson-rule.md`. The edit goes in the target.

## 5. Proving the leaves without the same mistake

- P1. Split each leaf's criteria the way the rule does. Mechanical part, by commands already in `checks`: links resolve, the `shapes.md` readiness example still parses, named paths exist. Nothing new is written for it.
- P2. Choice part: no test holds an expected wording. A grep for the new sentence is a text match on seat-written prose, which check.review already rejects for akrogon tests.
- P3. The criterion states a result a reader can observe. Example: "A seat that reads only plan.synthesis knows that the choice part of a model-choice criterion gets no case and no test, and what the plan names instead." The review seat reads the changed lines against the chart's binding decisions and names any decision with no home.
- P4. Evidence the review seat reads, written by the implementing seat in its report: two walk-throughs by reading. First, the six-step serp-wireframing trace from the intake's Reproduction, naming for each step the new sentence that changes the outcome. Second, one real function check (the blank-rationale refusal `[wf-c3]`, a spend bound) walked through the new text to show it still blocks. No script holds the expected answer, so this is not option 2c.
- P5. The leaf states what stays unproven: behavior on the next real chart. That is read at first real use (T12), never asked of the leaf.
- P6. Do not write a word cap or a "net shorter" count as a criterion. "Short" is the review seat's reading.
- Precedent in the repo: `tests/docs-links.test.ts` pins only command literals in skill text and says "Ordering and phrasing are judgment, not mechanics."

## Outside research (read 2026-11-17, search summaries only, pages not opened)

- futureagi.com "deterministic vs llm judge evals 2026" and qaskills.sh: run cheap deterministic checks first and keep model judges for what code cannot grade. Code graders are brittle to valid alternatives. Supports the keep list plus K5a.
- faros.ai "Why AI coding agents actually fail": about 4,000 failures across six models. The largest group came from over-literal reading of harness lines such as "DO NOT MODIFY: Tests". Supports T7 and exact wording in K6a.
- philschmid.de "The importance of Agent Harness in 2026" and second-hand reports of an Anthropic long-running-harness post (March 2026): harness parts encode guesses about what a model cannot do, and the method is to remove one part and see if it still matters. Supports 5a.
- I found nothing dated September to November 2026. The capability-change part of the brief is not covered by me.
