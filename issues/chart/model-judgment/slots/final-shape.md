# Proposed final shape, all seven forks (autopilot picks 2026-11-17)

Round: forks rule-core, proof-form, review, existing-proxies, charting, lessons, split-proof, each A's pick 1a. Substance is binding; exact wording is the implementer's within it. Changes from the merged notes are marked [changed].

## W1 standing-design.md (rule-core)

New line, placed after the "cheapest sufficient test" line:

- A script decides only what has one right answer: a file, key, state or reference exists and is valid, nothing required is blank, a value sits inside a bound whose source is named (the operator's words for this outcome, an outside standard or provider limit, a schema or literal contract), text that runs literally (a command, number, fixed reference or a marker command code parses) matches, and security, spend and destructive effects stay inside their grants; a mechanical rejection always overrides a model approval. What a model is asked to decide (quality, sufficiency, relevance, similarity, wording, intent, which items apply and the like) is the model's choice: the model doing the work makes it and records the choice, its reason and the evidence it weighed in an artifact the work already writes, and no count, share, similarity score, keyword or output-text match, or per-item operator stop stands in for it. Whoever proposes a script check names its one-right-answer source; without one the call is the model's, and under autopilot the door's own pick never supplies that source. A number with no named source decides nothing; a script may compute it and hand it to the model as evidence. [changed: no "named default"] A model-choice done-criterion says who decides, on what evidence and where the choice and reason are recorded; its record takes function checks only (it exists, keys and states are valid, references resolve, the reason is not blank, never the reason's length, words or format), and the choice itself takes no test, case or deliberate break holding an expected value: the review seat reads it on a run the leaf makes anyway or a recording it already has, a choice never buys a paid call by itself, and the leaf states what stays unproven. A capture driver or gate advances on product state or the record's presence, never on model wording.

Scoping edits:
- "A test exists only as the proof ...": the consequential negative or edge case written as a criterion is one with one right answer; a model's choice follows the line above.
- "A bug fix shows its test failing before ...": fail-first and deliberate break apply to mechanical behavior and a choice's record, never to the choice itself.
- "Writer and checker share one rule definition ...": scoped to mechanical rules; the last sentence (model-judged check with one known-acceptable and one known-unacceptable case) is deleted; a rule needing a model's judgment has no script checker and follows the line above.

## W2 questions.md (charting)

- Round template "Pitfalls avoided" and the "Known traps ..." sentence: removers are a part of the option, a probe, a done-criterion, the model's own recorded choice for a quality call (naming who judges, on what evidence and where the reason is recorded), or a named operator step with its owner, used only when the operator alone can grant or know the answer.

## W3 shapes.md audit paragraph (charting)

- Beside the "guessed wall-second or CPU-second cap" refusal: the audit refuses a criterion or design line whose pass rests on a count, share, similarity score, keyword or text match standing in for a model's choice, unless the design cites the operator words for this outcome, outside standard or literal contract that supplies the value, and refuses an operator stop that answers a quality call per item; the refusal names the rewrite under the standing-design line: who decides, on what evidence, where the choice and reason are recorded.

## W4 autopilot.md limits sentence (charting)

- The door never answers a fork with a count, share, similarity score or text match on model output; its pick never supplies the named source the standing-design line asks for, so it takes the model-decides option and parks the chart for no number.

## W5 plan-issue `## plan.synthesis` (proof-form)

New paragraph before "Before writing the criterion tests":
- A model-choice criterion (the standing-design line) is proven in two parts. Its record takes the cases and tests this section requires: it exists, keys and states are valid, references resolve, the reason is not blank. The choice takes none: no test, case or deliberate break holds an expected value for what the model chose or wrote; `plan.md` names instead the run the leaf makes anyway or the recording it already has, the paths of the record and outputs the review seat reads, and what stays unproven, and this is not new proof machinery. A criterion that decides a model's choice by a count, share, similarity score or text match with no named source is read in this form: the planner records that reading beside the criterion in `plan.md`, keeps its function checks and plans no case for the number. A criterion whose value has a named one-right-answer source is never read as a choice.

## W6 check-issue (review)

- check.review Fix paragraph, added: a check, gate, test or driver step in the diff that decides pass, fail or the next step by model-written text, or by a count, share or similarity score standing in for a model's choice without a named source, is a Fix under the standing-design line with no failed run needed; its realistic source is the model output the leaf produces, and the Fix names the choice it replaced; keep-list function checks are never this Fix. A recorded model choice is a Fix only when B names a fact its recorded evidence contradicts, a required input it did not weigh, a broken function or a keep-list breach; a different reading is a Nit that opens no repair.
- Test comparison: "a done-criterion has no test that would catch its failure" excludes the choice part of a model-choice criterion, which B reads on the named run.
- "scenarios a done-criterion names always block": a sourceless proxy for a model's choice blocks as the plan's recorded reading, judged by B, not as the number.
- Both reusable-Nit lesson sentences (check.review "Before a verdict that is not fix" and check.repair "Before its move to merge"): except a different reading of a recorded model choice.
- check.repair exceptions B does not repair: add a recorded model choice; it goes to A, who has the writer redo it once with the named harm as new evidence; for a product model that means changing its instructions and re-recording only under the recorded-output fresh-call rule and its grant.
- No widening of the akrogon prose-test sentence. [changed: dropped from merged notes per B]

## W7 implement-issue `## implement` (existing-proxies)

- Fourth exception: A removes an existing check, gate, test or driver step that refused this leaf's real output by a proxy for a model's choice (the standing-design line), in its own commit whose message cites the refused output, with the `Test-Change:` trailer for a test file; keep-list function checks are never removed this way, whatever the reason they were added; B judges each removal, and a rejected removal is a Fix that restores it.
- The restated "new behavior shows one deliberate break" applies to mechanical behavior and a choice's record.

## W8 lesson-rule.md and learn-issues (lessons)

- skills/lesson-rule.md Seed: "A judgment lesson files nothing" gains: except a lesson whose mechanism is a check, gate or stop that refused valid work, which gets `/seed-issue` run as a removal naming that check.
- learn-issues Sort: new outcome Removal (the mechanism is a check, gate or stop that refused valid work and is still reachable); Apply prints one `/seed-issue` line naming the check to remove. Checkable and Transfer unchanged.

## W9 leaf and proof (split-proof)

- One leaf in akrogon, slug `model-choice-rule`, under issue `model-choice-rule`. Done-criteria: (1) a seat reading only its own step section knows what to do with a model's choice at that step (chart round, audit, autopilot pick, plan, implement, review, repair, lesson, sort), shown by the report's site table and walk-throughs (serp-wireframing six steps; a kept blank-rationale check and spend bound still blocking; a kept outside-standard threshold), judged by both review seats; (2) the repo's existing checks pass; (3) the report states what stays unproven (behavior on the next real chart).
