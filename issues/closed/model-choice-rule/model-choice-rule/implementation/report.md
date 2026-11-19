# Report: model-choice-rule

Base 7cecb045ef1311343a2fcaf067f2eb86ed0438f1 (origin/main, unchanged by both refreshes). Committed head b85d09900286782bedaf52c48fb358991cf2cc74. Mode: delegated, three waves of two units (plan.md). Line numbers are at the head unless marked "base".

## Changed files and reasons

| File | Commit | Reason |
|---|---|---|
| skills/chart-issues/assets/standing-design.md | 105d0d7e | W1: new model-choice line after the cheapest-test line; six lines scoped; writer/checker's known-acceptable/unacceptable sentence deleted (U1) |
| skills/lesson-rule.md, skills/learn-issues/SKILL.md, skills/AREA.md, docs/reference/skills.md, docs/use/learn-from-work.md | ccdfb8cf, f1403cdf | W8: Seed files a removal; Sort outcome Removal; every doc restating the outcomes names it (U6; f1403cdf is A's one-line fix of learn-from-work's lesson-rule summary the worker flagged) |
| skills/plan-issue/SKILL.md | 530bed68 | W5: two sentences scoped; the model-choice reading paragraph (U3) |
| skills/chart-issues/assets/questions.md, shapes.md, autopilot.md | 24efcba3 | W2-W4: removers, audit refusal, proof-form lists, autopilot limits (U2) |
| skills/implement-issue/SKILL.md | 91973faf, 12c8897f | W7: fourth exception, reading under Implementation notes, scoped restatements, Standalone and Direct (U5; 12c8897f is A's fix replacing the undefined term "recorded-choice bar" with its content) |
| skills/check-issue/SKILL.md | 5f3d1999, b85d0990 | W6 (U4; b85d0990 is A's fix closing two sentences that could still hand a case or reproduction test to the choice part, found in the whole-file reread for criterion 1) |

12 files, 38 insertions, 31 deletions. No test, script, fixture or schema added or changed. No `Test-Change:` trailer needed.

Worker returns: all six returned green targeted runs (`check u1-links`, `u6-links`, `u2-links`, `u3-links`, `u4-links`, `u4-literals`, `u5-links`, `u5-literals`, all exit 0; logs under `implementation/`). Briefs: `implementation/brief-1.md` to `brief-6.md`.

## Site table (criterion 1)

Every site brief criterion 1 names. "Closed" says why the old path to a proxy no longer works.

| # | Old site (base) | New text (head) | Why the old path is closed |
|---|---|---|---|
| S1 | questions.md:27 round template "Pitfalls avoided: ... or a named operator step with its owner" | questions.md:27 adds "the model's own recorded choice for a quality call naming who judges, on what evidence and where the reason is recorded" and "used only when the operator alone can grant or know the answer" | A round could only remove a quality trap by an operator step or a probe/criterion, which made per-item operator answers and count criteria. The model's recorded choice is now a remover, and operator steps are limited. |
| S2 | questions.md:37 "Known traps are designed out ... a needed operator action is a human-only prerequisite" | questions.md:37 "each by a part of the option, a probe, a done-criterion, the model's own recorded choice for a quality call under standing-design's model-choice line (...) or a named operator step with its owner, used only when the operator alone can grant or know the answer" | Same as S1, in the binding sentence the round rules enforce. |
| S3 | shapes.md:386 audit, refusals list ending at "guessed wall-second or CPU-second cap" | shapes.md:386 "The audit refuses a criterion or design line whose pass rests on a count, share, similarity score, keyword or text match standing in for a model's choice, unless the design cites the operator's words for this outcome, the outside standard or the literal contract that supplies the value, and refuses an operator stop that answers a quality call per item; each refusal names the rewrite ..." | The audit had no refusal for a sourceless count or per-item stop, so both passed to the leaf. Now the handoff is refused with the rewrite named. |
| S4 | shapes.md:267 brief template proof forms "own-test, end-to-end, real-outside-call and live-run" | shapes.md:267 adds "and model-choice ... the model-choice form being the record's function checks plus the reviewing seat's reading under standing-design's model-choice line" | Only test-shaped proof forms existed, so a choice criterion had to be written as something a test could count. Now a criterion can be proven by its record and a reading. |
| S5 | shapes.md:386 audit's restated proof-form list | Same addition at shapes.md:386 | Same as S4, for the audit's own list. |
| S6 | autopilot.md:9 limits sentence ("The door never turns autopilot on ...") | autopilot.md:9 "The door never answers a fork with a count, share, similarity score or text match on model output unless the operator's words for this outcome or an outside standard supply it; its own pick never supplies that source (...), so it takes the model-decides option and parks the chart for no number." | Under autopilot A's own picks set `thin_min_usable_page1`-type numbers and those picks counted as authority. Now A's pick cannot be the source and the door does not park for a number. |
| S7 | standing-design.md (no line) | standing-design.md:11 the model-choice line: one-right-answer list, keep list, "a mechanical rejection always overrides a model approval", proxy forms, proposer names the source, sourceless number is evidence only, record/choice split, drivers advance on product state, record presence or recorded key value | No rule told a seat that a model's quality call is not a script's to decide. This is the single anchor every step clause names. |
| S8 | standing-design.md:8 test-only-as-proof "a consequential negative or edge case is a done-criterion" | standing-design.md:8 "a done-criterion with one right answer" | A consequential case of a model's choice no longer becomes a criterion that a test counts. |
| S9 | standing-design.md:10 cheapest sufficient test | standing-design.md:10 "This covers mechanical behavior and a model choice's record; the choice itself is read, not tested, and never buys a paid call." | "Cheapest test" for a choice used to mean a count or text match, or a paid rerun. Now the choice is read, not tested. |
| S10 | standing-design.md:12 "keep every test that guards a real past regression" | standing-design.md:13 "though a proxy for a model's choice is a false expectation under this line even when added after a past regression" | A proxy added after a failure could be kept as a regression guard. Now it is deletable as a false expectation. |
| S11 | standing-design.md:14 fail-first and deliberate break | standing-design.md:15 "both apply to mechanical behavior and a choice's record, never to the choice itself" | A red-first case per choice condition used to be required. Now red-first applies only to mechanical behavior and the record. |
| S12 | standing-design.md:17 slow-run "no acceptance rule changes" | standing-design.md:18 "(a removal under the implement-issue proxy exception is not an acceptance-rule change)" | A slow-run leaf hit by a proxy could not remove it without counting it as an acceptance change. Now it can. |
| S13 | standing-design.md:18 writer/checker, last sentence "A model-judged such check tests one known-acceptable and one known-unacceptable case" | standing-design.md:19 "Writer and checker of a mechanical rule share ..."; last sentence replaced by "A rule needing a model's judgment has no script checker." | The known-acceptable/unacceptable pair was itself an expected value on a judgment. It is deleted. |
| S14 | plan-issue/SKILL.md:41 command mapping "maps each done-criterion" | :41 "maps each done-criterion's mechanical behavior and a choice's record" | Every criterion needed a command observation, so a choice got a count. Now only the record does. |
| S15 | plan-issue/SKILL.md:45 own tests | :45 "for mechanical behavior and a choice's record" | Same as S14, for the own-tests rule. |
| S16 | plan-issue/SKILL.md:51 per-condition cases (no governing paragraph) | New paragraph at :51 before "Before writing the criterion tests": two-part proof, the choice takes no test/case/deliberate break, plan names the run, record and output paths and what stays unproven, a sourceless proxy in a criterion or design line is read as "the model-choice reading" with function checks kept and no case for the number, not a locked-decision change, a named-source value is never read as a choice | A planner had to write one red-first case per stated condition, including thresholds on model output. The governing paragraph now comes first and closes that path at planning. |
| S17 | implement-issue/SKILL.md:56 "The three exceptions" | :56 "four" plus "A's removal of an existing check, gate, test or driver step that refused this leaf's real output by a proxy for a model's choice ...", keep list inline, report lists every removal, reviewing seat judges, rejected removal is a Fix restoring it | An implementer stuck behind an existing proxy could only fail the leaf or rerun paid captures. Now it removes the proxy with cited output, and the keep list is protected. |
| S18 | implement-issue/SKILL.md:56 restated test rules (consequential case, regression keep, deliberate break) | :56 "with one right answer", "but never a proxy for a model's choice", "(mechanical behavior and a choice's record, never the choice itself)" | The restatement repeated standing-design's old orders. Now it is scoped the same way as S8, S10 and S11. |
| S19 | implement-issue/SKILL.md:52 Implementation notes "a locked decision is never changed there" | :52 "When planning is over, A records a criterion or design line's model-choice reading, as plan-issue's model-choice reading defines it, under plan.md `## Implementation notes`." | A leaf planned under the old text had no place to record the reading after planning. |
| S20 | implement-issue/SKILL.md:36 locked-decision stop | :36 removal and reading "are not changing a locked decision and are no mismatch; a gate or criterion whose value has a named source ... is never removed or read this way" | A proxy in a locked design used to force a `failed` stop. Now it does not, and named sources stay locked. |
| S21 | implement-issue/SKILL.md:75 check.fix "without weakening criteria" | :75 "(recording a model-choice reading and dropping a case for the number is not weakening a criterion)" | Dropping a proxy case in repair used to read as weakening. Now it does not. |
| S22 | implement-issue/SKILL.md:87 Standalone order rule | :87 "That order covers mechanical behavior and a choice's record; the choice itself is recorded in the report." | Tests-first was the only rule, so a choice got a test. |
| S23 | implement-issue/SKILL.md:97 Direct form order rule | :97 "covering mechanical behavior and a choice's record; the choice is recorded in `<chart>/direct/report.md` and read by B under check-issue's rule that a recorded model choice is a Fix only for a named harm" | Same as S22 on the direct route. B's bar is named by its content. |
| S24 | check-issue/SKILL.md:49 Fix paragraph (realistic source and consequence today) | :49 a proxy step in the diff "is a Fix under standing-design's model-choice line with no failed run needed: its realistic source is the model output the leaf produces"; keep list never this Fix; a recorded choice is a Fix only for a contradicted fact, unweighed required input, broken function or function-check breach; a different reading is a Nit; same bar per named harm on a redo | A proxy was a Nit until a paid run failed. Now it is a Fix on sight, while a judgment disagreement cannot open repair. |
| S25 | check-issue/SKILL.md:51 test comparison | :51 "(never the choice part of a model-choice criterion, which the reviewing seat reads on the run `plan.md` names)", "though that never keeps a proxy", "new mechanical behavior or a model choice's record shows one deliberate break", "(except a match on model-written text, a Fix above)"; prose-test sentence unchanged | A missing test on a choice blocked, and a wording match was a Nit. Now the first is excluded and the second is a Fix. |
| S26 | check-issue/SKILL.md:59 "scenarios a done-criterion names always block" | :59 a sourceless proxy scenario "blocks as plan-issue's model-choice reading ..., never as the number, and where `plan.md` records no reading the finding goes to A to record it" | A criterion naming a count made B enforce the count. Now B enforces the reading. |
| S27 | check-issue/SKILL.md:63 reusable-Nit lesson (check.review) | :63 "except a different reading of a recorded model choice, which is never written as a lesson line" | A judgment disagreement would become a lesson, then a checkable seed, then a new proxy. That chain is cut. |
| S28 | check-issue/SKILL.md:79 check.repair exceptions and Handed to A | :79 "and a recorded model choice" joins the exceptions; it goes to A, the writer redoes it with the harm as evidence, a product model is re-recorded only under the fresh-call rule and its grant "with no reproduction test for the choice"; a choice part "never lacks a case" | B could repair a choice by its own taste, or hand A a missing case to write. Now neither happens. |
| S29 | check-issue/SKILL.md:95 reusable-Nit lesson (before merge) | :95 "and any different reading of a recorded model choice, which is never written as a lesson line" | Same as S27, at merge. |
| S30 | lesson-rule.md:6 Seed "A judgment lesson files nothing" | :6 a judgment lesson whose mechanism is a check, gate or stop that refused valid work "gets `/seed-issue` run as a removal naming that check" | A lesson about a bad check had no way out except Checkable, which asked for another detector. |
| S31 | learn-issues/SKILL.md:3 description | :3 "stopped, checkable, removal, transfer or stays ... print seed lines for checkable and removal ones" | The description listed four outcomes. |
| S32 | learn-issues/SKILL.md Sort | new "**Removal**" between Checkable and Transfer; Stays stays the default | Same as S30, at triage. |
| S33 | learn-issues/SKILL.md Apply | new "Removal: print one runnable `/seed-issue` line naming the check to remove and the valid work it refused ... File nothing." | Same as S30, at Apply. |
| S34 | skills/AREA.md learn-issues line; docs/reference/skills.md:53, :79; docs/use/learn-from-work.md:5, :20, outcome list | each names removal | These restated four outcomes, or the Seed rule without the removal seed. |

Whole-file reread result: after U1-U6 landed, A reread every owned file. Two check-issue sentences could still route a case to the choice part: "A criterion whose proof lacks only a case ... goes under `Handed to A`" and the redo of a product-model choice, which could pick up a reproduction test. b85d0990 closes both (S28). The kept sentences that still name a known-good case and a deliberate break are about proof machinery (standing-design.md:10, shapes.md:386 "Missing machinery") and the proof-command equivalence guard (plan-issue :43). All are mechanical and unchanged.

## serp-wireframing walk (criterion 2)

Records: `/home/ivan/Work/infra/tamdoma/framework/issues/` (paths below are relative to it) and the model-judgment chart intake. A spot-checked the lines marked ✓.

| Step | Old outcome and record | Sentence that now changes it |
|---|---|---|
| 1. Fork proposes `thin_min_usable_page1` and a per-page operator answer | `chart/serp-wireframing/forks/evidence.md:44` ✓ K11 "Thin gets its own key (`thin_min_usable_page1`) ... the evidence leaf sets its value from the usable-page counts"; `forks/stops-locks-trust.md:35` ✓ Q1 residue triage "asks the operator per page"; `:60` K3' gate prints `THIN_READ` per page. The per-page stop came from stops-locks-trust, not the evidence fork. | questions.md:27, :37 (S1, S2): the quality trap's remover is the model's own recorded choice, and an operator step only where the operator alone can grant or know. autopilot.md:9 (S6): A's pick never supplies the source for a count on model output, and it takes the model-decides option. Both A-picked options are now off the table. |
| 2. Audit accepts both | `open/serp-wireframing/wireframe-evidence/design.md:129` (K11), `:169-170`, and `wireframe-evidence/brief.md:11` "fewer usable marked competitors in 1-10 than `thin_min_usable_page1` is listed as thin". Peer checks flagged it only for consistency (`slots/forks-fill-check-C.md:9`). | shapes.md:386 (S3): the audit refuses a criterion or design line whose pass rests on a count standing in for a model's choice without operator words, an outside standard or a literal contract (the value came from the leaf's own recordings, none of those), and refuses a per-item quality stop. The handoff is refused with the rewrite named. |
| 3. Plan writes a red-first case per condition | `open/serp-wireframing/wireframe-skill-revamp/plan.md:161` ✓ "Case `[wf-c3]`: the gate fails twice on the same thin input"; `:164` `[wf-c5]` strict threshold; `wireframe-evidence/plan.md:148`. | plan-issue/SKILL.md:51 (S16): the threshold is read as the model-choice reading, keeps its function checks and gets no case for the number. standing-design.md:15 (S11): red-first never applies to the choice. |
| 4. Implement builds a THIN_READ gate | `wireframe-skill-revamp/implementation/brief-2.md:14` gate `prep-evidence` (`scripts/check-prep.ts`); blocked live Buffalo at `implementation/report.md:65` "`THIN_READ /bed-bugs ... usable_page1 2`". | standing-design.md:11 (S7): a number with no named source decides nothing and is only evidence for the model; a gate advances on product state, record presence or the recorded key value. If the gate was already there, implement-issue :56 (S17) lets A remove it with the refused output cited. |
| 5. Capture driver reads the model's wording | `wireframe-skill-revamp/implementation/report.md:68` ✓ "`acceptThin` found no match because this session logged the residue obligation as `THIN_READ /bed-bugs ...` without the `prep-evidence ` prefix"; `chart/serp-wireframing/forks/loose-judgment.md:9` ✓ "F3 The capture driver matched the obligation text 'prep-evidence THIN_READ'". | standing-design.md:11 (S7): a capture driver "never [advances] on model wording". check-issue :49 (S24): such a driver step is a Fix on sight, with no failed run needed. |
| 6. Review calls the over-constraint a Nit | No review record in scope shows this. `wireframe-skill-revamp` never reached review (`state.yaml` phase implement), and `wireframe-evidence/review-A.md:41` has no Fixes, with its Nits on other topics. The step is the old rule's outcome as the model-judgment chart recorded it: `/home/ivan/Work/infra/akrogon/issues/chart/model-judgment/INTAKE.md:63` "check-issue calls over-constraint a Nit until a run fails" and `:94` (B1) citing base check-issue:49-51. | check-issue :49 (S24): Fix on sight, its realistic source being the model output the leaf produces. :51 (S25): a match on model-written text is excepted from the wording-coupling Nit. :59 (S26): B enforces the reading, not the number. |

Facts that differ from the brief's summary:
- The records show that 5 paid cases were used without a recording, and 3 re-recordings were planned (`wireframe-skill-revamp/plan.md:226`, `implementation/report.md:81`). The brief says "3 of 5 paid captures lost".
- Only case 2 failed on the wording match. Case 1 failed on driver flags, case 3 on a product close-path bug, case 4 on missing capture state, and case 5 on a vendor retry (`report.md:65-77`). Cases 1-4 all ran into the THIN_READ path, which the gate created.
- Capture spend was model sessions. DataForSEO cost $0 because the driver uses dummy credentials.

The lookup came from an Explore agent. A checked the ✓ lines. The other cited lines are its findings and are not independently confirmed here.

## Still blocks (criterion 3)

| Case | Kept sentence that still blocks it | Why it is outside the choice part |
|---|---|---|
| Blank required rationale on a recorded choice (`[wf-c3]` after amendment AM7/AM8: "a blank rationale is refused", `wireframe-skill-revamp/plan.md:223-224`) | standing-design.md:11 "nothing required is blank" and "Its record, when it is a product artifact, takes function checks only (... the reason is not blank ...)"; plan-issue :51 "Its record ... takes the cases and tests this section requires: ... the reason is not blank" | The record is not the choice. Its presence and a non-blank reason have one right answer, so the `[wf-c3]` refusal keeps its case and its red-first proof. |
| Spend bound in a grant | standing-design.md:11 "security, spend and destructive effects stay inside their grants"; keep list in check-issue :49, implement-issue :56; lifecycle-rules grant reuse (unchanged) | Spend is a granted bound with a named source, the operator's grant. It is never a Fix under S24 and never removable under S17. |
| Accessibility minimum from an outside standard | standing-design.md:11 "a value sits inside a bound whose source is named (... an outside standard or provider limit ...)"; shapes.md:386 "unless the design cites ... the outside standard"; plan-issue :51 "A value with a named one-right-answer source ... is never read as a choice"; implement-issue :36 "a gate ... whose value has a named source ... is never removed or read this way" | The value comes from the standard, not from a model's choice. |
| Repair-round or retry limit | standing-design.md:11 "process bounds (rounds, waves, retries, timeouts) hold"; keep list "process bounds" in check-issue :49 and implement-issue :56 | Process bounds are mechanical, per the rule-core correction B1. |
| `Handed off <date>` marker command code parses | standing-design.md:11 "text that runs literally (a command, number, fixed reference or a marker command code parses) matches"; keep list "text that runs literally"; check-issue :51's akrogon prose-test exception for literals unchanged | It is a literal contract. Only a match on model-written text that stands in for a choice is a proxy. |

Also kept: "A mechanical rejection always overrides a model approval" (standing-design.md:11), so no model approval can let a refused function check through.

## Removals

This leaf removes no existing check, gate, test or driver step under the fourth exception.

## Criterion proof

| Criterion | Proof | Commit | Result |
|---|---|---|---|
| 1, 2, 3, 5 | Both reviewing seats read this report against the diff. No command, test, case or red-first commit (plan D4, design "Binding plan instruction"). | b85d0990 | For review |
| 4 | `akrogon run-check --name crit4-final -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` | b85d0990 | `check crit4-final: 0 .../implementation/check-crit4-final-1794916673226-2157562.log`, 14 pass, 0 fail |
| Guard (D3 literals) | `akrogon run-check --name literals-final -- bun test tests/run-units.test.ts -t "^skills name"` | b85d0990 | `check literals-final: 0 .../implementation/check-literals-final-1794916673358-2157759.log`, 2 pass |

Earlier criterion 4 runs: `crit4` exit 0 on 12c8897f, and the targeted per-wave runs listed above. The planning-time red is in plan.md.

## Verify

- 12c8897f: `akrogon verify` green, test 1224 pass (`check-test-1794916633473-1879679.log`), wall 62 s.
- b85d0990: `akrogon verify` red, wall 62 s. One test failed: `(fail) dispatch never adopts another session terminal after the repo core changes` (`Expected: 0 Received: 1`), log `/home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/implementation/check-test-1794916742536-2158059.log`. The diff from 12c8897f is two prose clauses in `skills/check-issue/SKILL.md`, so it holds no plausible cause, and the same test passed on 12c8897f.
- Retry of the same `test` command through run-check on b85d0990: green, 1224 pass, 0 fail, wall 65 s. `check test-retry: 0 /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/implementation/check-test-retry-1794916821953-2420186.log`. The `test` check is **inconsistent** on b85d0990 (lifecycle-rules red-check rule), with both logs above.
- b85d0990: the `check.review` move refused with "No green leaf verify receipt". A second `akrogon verify` gave green: test 1224 pass, `check-test-1794916993152-2710493.log`, `verify leaf b85d09900286782bedaf52c48fb358991cf2cc74: green`, wall 61 s.

## Refreshes

Two refreshes, before the first unit and after the last. Both found origin/main at 7cecb045 and moved nothing.

## Known limitations

- `docs/pictures/lessons-flow.svg` still draws four outcomes and leaves out Removal (plan D9). It was not edited.
- docs/use/learn-from-work.md is outside the brief's owned list. It was edited only because the diff made it stale (plan D9).
- The lesson "paid driver step on model text (2026-11-15)" stays in `learnings/LESSONS.md`. Its advice ("give such a rule a fallback ... or let the driver author the input") predates this rule. A prose rule is not a Retire stop, so the line is kept (plan D11).
- The change reaches chart doors and seats only at the next release link. Seats now run the installed old text (design Leaf architecture).
- This leaf was planned, implemented and will be reviewed under the old installed text.

## Unproven (criterion 5)

What stays unproven is whether the next real charts and leaves stop producing proxies: sourceless counts in criteria, per-item quality stops, red-first cases on model choices, gates and drivers on model wording. Only later charts and leaves run under the released text can show it. No measurement is added (design hard limits).

## Unverified criteria

Criteria 1, 2, 3 and 5 are model-choice criteria. They are verified only by the two reviewing seats' reading.
