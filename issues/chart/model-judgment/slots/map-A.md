# Opening map, slot A (2026-11-17)

Inspected at main 7cecb045: standing-design.md (all), shapes.md (audit, leaf files), questions.md (round shape, pitfalls line), autopilot.md, lesson-rule.md, plan-issue/SKILL.md plan.synthesis, check-issue/SKILL.md verdict paragraphs, implement-issue/SKILL.md test paragraph, learn-issues Sort, lifecycle-rules.md, tests/run-units.test.ts and docs-links.test.ts (pin only literal commands and links). Research: slots/research-A.md R1-R7.

## Where the proxies are born (sites, at main)

- S1 standing-design "A test exists only as the proof of a done-criterion ... a consequential negative or edge case is a done-criterion written at charting": pushes every quality worry into a criterion.
- S2 standing-design "new behavior shows one deliberate break turning its test red": a judgment has no red form.
- S3 standing-design recorded-output line: replay makes a gate costly to remove; a capture driver steering a session through gates reads text (F3).
- S4 standing-design writer/checker line: "A model-judged such check tests one known-acceptable and one known-unacceptable case at target size" — this is an expected value on a judgment; signpost 2a rejects it.
- S5 questions.md "Pitfalls avoided" allows only an option part, a probe, a done-criterion or a named operator step — no "the model weighs it and records why".
- S6 shapes.md audit: accepts any observable criterion; has no refusal for proxy criteria or per-item stops.
- S7 plan-issue per-condition rule ("Each condition a decision can reachably break gets a case ... shown red at planning") and the test-per-criterion rule; "new proof machinery" fail exit could catch a reviewer-read proof.
- S8 check-issue: Fix needs realistic source and consequence today; "wording coupling that does not fail today ... are Nits"; "scenarios a done-criterion names always block"; prose-test rejection limited to "akrogon tests".
- S9 implement-issue repeats S1/S2 verbatim ("A test exists only as ... new behavior shows one deliberate break") and allows test edits only under three exceptions; a proxy removal has no exception.
- S10 autopilot.md "answers it itself by the evidence ... the operator's values": no lens on proxies; A can pick a bound on model output.
- S11 lesson-rule Seed / learn-issues Checkable: a lesson "this check refused valid work" is a judgment lesson and files nothing.

## Forks

K1 Core rule line and its home. Options: (a) one new standing-design line, plus scoping edits to S1, S2, S4; every other file points to it by name; (b) the line in lifecycle-rules.md (seats) and a copy in standing-design (door); (c) a line in each file. Pick (a): standing-design is read by the door and copied into every leaf design that plan, implement and check read, so one home reaches all seats; (b) and (c) are two copies that drift (DRY, the writer/checker lesson itself). Later risk of (a): a seat that skips the design's standing-design interpretation; removed by plan/check pointers naming "the standing-design model-choice line".
K2 The record/choice proof form (signpost 2a) in text. Sub-questions: what the record holds (choice, reason, evidence weighed), where it lives (product output or the leaf report), which function checks it may get (exists, keys valid, reason not blank — never length, keywords or format of the reason), and that the review seat reads the choice on a run the leaf makes anyway. Later risk: a "reason not blank" check grows into reason-quality scripts; removed by naming the closed list of record checks.
K3 Charting surface: questions.md remover list (add "the model's own recorded choice"; an operator step only when the operator alone can grant or know), shapes.md audit refusal (criterion or design line whose pass rests on a count, share, similarity score, keyword or text match standing in for a model's choice, or an operator stop that waives such a gate per item), autopilot.md (A's pick never names a number on model output; signpost 1a). One question: does the audit refuse, or ask the door to rewrite? Pick: refuse with the rewrite named (who judges, on what evidence, where the reason lives).
K4 Plan surface: scope the per-condition, red-first and deliberate-break rules to mechanical conditions; a model-choice criterion gets cases for its record only; state that a reviewer-read recorded run is not new proof machinery. (framework D rebuttal text is a strong draft.)
K5 Review surface: (i) a check, gate, test or driver step in the diff that decides by text match on model output or by a proxy count is a Fix under the standing-design line, no failed run needed — the realistic source is the model output the leaf produces; (ii) a criterion naming such a proxy is a wrong-criterion Fix routed back, not a shield; (iii) reviewer authority on a recorded choice is signpost 3a; (iv) widen "reject akrogon tests of prose/output wording" to every repo. Later risk: B over-applies (i) to real function checks; removed by the keep list being in the same standing-design line.
K6 Existing proxies (signpost 5a): where the permission lives. implement-issue currently allows only three test edits. Options: (a) add a fourth exception: A deletes a test, gate or driver step that refused valid model output by a proxy, own commit, `Test-Change:` trailer citing the refused real output; (b) rely on the existing "correction of one wrong expectation" exception; (c) route to a seed. Pick (a). Intake said implement-issue unchanged; signpost 5a overrides that agent suggestion. Risk: delete-to-green (framework#115); removed by the keep list and B judging each removal against the cited output.
K7 Lessons: lesson-rule Seed and learn-issues Checkable: a lesson whose mechanism is a check that refused valid work is checkable (the check is a fixed artifact) and is seeded as a removal. The cross-repo Transfer in X6: pick Off route — this chart's standing-design line is itself the akrogon home of framework lessons 146/156, so a cross-repo transfer path adds a mechanism for no remaining case.
K8 Leaf split: one leaf (all edits are prose in akrogon skills and together make one consistent rule) versus two (door rules, seat rules). Pick one leaf: the seat edits depend on the standing-design wording, splitting adds a blocked-by and a second review of the same rule.
K9 Proof of this leaf without repeating the mistake. Mechanical: existing `bun test` (docs-links, run-units pin only literal commands) stays green — a repo check that already runs. Judgment: the report holds a site table S1-S11 → new text → why the loop is closed, and B reads it against the intake loops; plus one replay by reading: B traces the serp-wireframing chain (evidence fork count → audit → plan case → driver → review) through the new text and names the step that now stops it. No grep for phrases, no word counts, no paid run.

## Practitioner questions

- Which existing function checks could a seat now wrongly call "proxy" and delete? (keep list must be closed and explicit)
- Does any akrogon command code (src/) decide on model-written text? Inspected: none found in the touched paths; the Test-Change trailer check is a literal path/trailer rule (mechanical, stays).
- How will the operator know it worked? No metric machinery (signposts). The next chart that meets a quality concern is the observation; recorded only.

## Pitfalls

- P1 New rule written as another proxy (e.g. "the reason must be 2+ sentences") — removed by K2's closed list.
- P2 Rule in one file, contradicted by an unedited sibling (implement-issue repeats S1/S2) — removed by K9 site table covering every repeat.
- P3 Delete-to-green — keep list in the standing-design line plus B judging each removal (K6).
- P4 Door skill change reaches doors only at the next release link — stated at handoff review.
- P5 Autopilot narrowing A's picks counts as changing autopilot limits? It lowers, never raises; it goes through a leaf, not a main step, so the operator's watcher and merge see it.

## Contradictions with signposts

- standing-design writer/checker line's known-acceptable/unacceptable pair contradicts 2a.
- check-issue "wording coupling that does not fail today ... are Nits" contradicts 4a/5a for proxies on model output.
- implement-issue "write and edit no test" except three cases contradicts 5a.
- questions.md operator-step remover contradicts 6a (no per-item quality stop).
