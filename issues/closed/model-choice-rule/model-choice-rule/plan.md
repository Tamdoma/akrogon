# Plan: model-choice-rule

Base: main 7cecb045 (`AKROGON_BASE` 7cecb045ef1311343a2fcaf067f2eb86ed0438f1). Worktree: /home/ivan/.akrogon/worktrees/akrogon/model-choice-rule. Planner: A (claude-opus-5-5), 2026-11-17.

The product is prose in eleven rule files. Criteria 1, 2, 3 and 5 are model-choice criteria, read by both reviewing seats from `implementation/report.md` against the diff. Criterion 4 is mechanical and proven by two existing tests. The leaf adds no test, script or fixture, so there is no test commit before product code.

## Decisions

- D1. One anchor line. W1's new line goes into `skills/chart-issues/assets/standing-design.md` right after the "Each done-criterion is proven by the cheapest sufficient test" line. Every other file names it in plain text as "standing-design's model-choice line", never as a Markdown link, because `tests/docs-links.test.ts` refuses a relative link leaving its skill folder. Each step clause still works alone for its own action and names the function-check keep list inline (schema and valid keys, references, a blank required record, spend, security and process bounds, text that runs literally).
- D2. Edits are added sentences or clauses inside the paragraph the design's final shape names (W1 to W8). No neighbouring rule is rewritten. Exact wording is the implementer's within the final shape.
- D3. Literals pinned by `tests/run-units.test.ts` stay: in `skills/check-issue/SKILL.md` `<chart>/direct`, `akrogon stop-run`, `pkill -f`; in `skills/implement-issue/SKILL.md` `--holder <chart>/direct`, `akrogon stop-run`, `pkill -f`, and the line holding both "standalone" and "outside" stays one line. `docs-links.test.ts`'s "lesson write sites link the shared lesson rule" also stays true: no `[lesson rule](lesson-rule.md)` link is removed.
- D4. Proof split. Criterion 4 has a command. Criteria 1, 2, 3 and 5 have observation = both reviewing seats reading `implementation/report.md` against the diff, command = none, no test, case, grep, sweep or red-first commit (design "Current interpretation" and "Binding plan instruction"; check-issue rejects akrogon tests of prose wording). Under check.review's "a done-criterion has no test that would catch its failure", the missing test for these four criteria is this recorded design decision, not a gap. The form to avoid is issues/closed/early-needs/needs-sheet-at-signposts/plan.md ("Criterion proofs", "Red records").
- D5. `implementation/report.md` is the reviewed artifact for criteria 1, 2, 3 and 5. A writes it after the last unit, from the landed diff, with these sections: `## Site table` (criterion 1), `## serp-wireframing walk` (criterion 2), `## Still blocks` (criterion 3), `## Removals` (W7's list; this leaf removes no check, so it states none), `## Unproven` (criterion 5), plus the implement-issue report contents. The report is written by A, never by a worker, because each part reads across the whole diff.
- D6. Site table shape: one row per site, columns old site (file and paragraph, base line), new text (quoted clause or sentence), why the old path to a proxy is closed. Rows cover every site brief criterion 1 lists: the chart round's removers (questions.md "Pitfalls avoided" template and "Known traps" sentence), the handoff audit and its two proof-form lists (shapes.md), autopilot's limits sentence, the standing-design new line plus the six scoped lines (test-only-as-proof, cheapest-sufficient-test, delete-false-expectation/regression-guard, fail-first and deliberate break, slow-run, writer/checker), plan.synthesis (command-mapping, own-tests, new paragraph), implement (fourth exception, restated test rules, Implementation notes reading, locked-decision clause), check.fix, Standalone and the Direct form, check.review (Fix paragraph, test comparison, "scenarios a done-criterion names", reusable-Nit sentence) and check.repair (Handed to A, reusable-Nit sentence), the lesson rule's Seed clause, learn-issues' description, Sort and Apply, and the docs that restate the Sort outcomes (skills/AREA.md, docs/reference/skills.md lines 53 and 79, and docs/use/learn-from-work.md per D9).
- D7. serp-wireframing walk: six steps, each with the old outcome, its source record and the new sentence (file and quoted clause) that changes it. Steps: (1) evidence fork proposing `thin_min_usable_page1` and a per-page operator answer; (2) the handoff audit accepting both; (3) plan writing a red-first case per condition; (4) implement building a THIN_READ gate; (5) a capture driver reading the model's wording; (6) review calling the over-constraint a Nit. Source records: /home/ivan/Work/infra/tamdoma/framework/issues/chart/serp-wireframing/forks/evidence.md, .../forks/loose-judgment.md, /home/ivan/Work/infra/tamdoma/framework/issues/open/serp-wireframing/wireframe-evidence/{brief,design,plan}.md, its implementation/report.md and review files, and /home/ivan/Work/infra/tamdoma/framework/issues/open/serp-wireframing/wireframe-skill-revamp/ for the capture driver. The walk cites what those records show and states any step the records do not show as not found, never invented.
- D8. Still-blocks walk: five cases, each traced to the kept sentence that still blocks it and the new sentence that keeps it outside the choice part: a blank required rationale on a recorded choice (`[wf-c3]`), a spend bound in a grant, an accessibility minimum from an outside standard, a repair-round or retry limit, and the `Handed off <date>` marker command code parses.
- D9. `docs/use/learn-from-work.md` restates the four Sort outcomes (line 5 image alt text and the outcome list near line 41) and is outside the brief's owned list. implement-issue requires updating every doc the diff makes stale, and lesson 2026-09-11-stale-rule-in-docs records this exact miss, so U6 adds Removal there too. Note for review: this widens the owned list by one doc for staleness only. `docs/pictures/lessons-flow.svg` draws four outcome boxes; it is not edited and the report lists it under known limitations as a stale picture.
- D10. learn-issues' footer keeps its form: Removal's printed seed lines count inside "printed <n> seed lines". Removal is its own Sort outcome; Checkable and Transfer text is unchanged.
- D11. The lesson line "paid driver step on model text (2026-11-15)" in `learnings/LESSONS.md` is related: under the new text a driver advances on product state, record presence or a recorded key value. This leaf does not retire it, because a prose rule is not a Retire stop on every reachable path, and does not edit `learnings/`.
- D12. Open for the plan: the design has none.
- D13. Consumers: the change reaches chart doors and seats only at the next release link (design Leaf architecture). The report states it.

## Brief and design notes

- Brief criterion 1 lists "the two docs that restate the Sort outcomes"; a third, docs/use/learn-from-work.md, exists (D9). No other brief/design conflict.
- No credential is named by the design. `akrogon status model-choice-rule` prints no `Missing:` line.
- No grant, live run, paid call or model call. No count lines.

## Read first

- skills/AREA.md, docs/reference-index.md, docs/reference/skills.md, docs/use/learn-from-work.md.
- The leaf's design.md "Final shape" W1 to W8 (the substance each file carries) and "Leaf architecture" (consumers and exclusions).
- Chart forks: /home/ivan/Work/infra/akrogon/issues/chart/model-judgment/forks/{rule-core,proof-form,review,existing-proxies,charting,lessons,split-proof}.md and slots/final-check-B.md, slots/final-check-C.md for the reasons behind each correction.
- serp-wireframing records listed in D7.
- issues/closed/early-needs/needs-sheet-at-signposts/plan.md as the form to avoid (D4).
- tests/docs-links.test.ts, tests/chart-shapes.test.ts, tests/run-units.test.ts lines 683-719 (D3).
- Lessons as history, not rules: learnings/history/2026-09-11-stale-rule-in-docs.md (grep docs for a changed rule), 2026-09-14-ambiguous-prose-after-rename.md (sweep for the old term, not only the path), 2026-10-01-failed-stop-guard-wording.md, 2026-11-15-paid-driver-step-on-model-text.md.

## Interfaces

- "standing-design's model-choice line": the anchor every clause names (D1).
- plan-issue's model-choice reading: the planner records it beside the criterion in plan.md; after planning, A records it under plan.md `## Implementation notes`. implement-issue and check-issue name this reading by that description.
- check-issue `Handed to A` gains "a recorded model choice" as a Fix B does not repair.
- learn-issues Sort outcome `Removal`, used by lesson-rule.md Seed.

## Waves

Config `implement: subagents`. Not serial-solo: waves 1 to 3 each hold two units.

Wave 1
- U1 standing-design (W1). Owns `skills/chart-issues/assets/standing-design.md`. Shared test resource: none. Needs: none.
- U6 lessons and docs (W8, D9, D10). Owns `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md`, `skills/AREA.md`, `docs/reference/skills.md`, `docs/use/learn-from-work.md`. Shared test resource: none. Needs: none. AREA.md stays at most 40 lines with its four sections.

Wave 2
- U2 chart door (W2, W3, W4). Owns `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/assets/autopilot.md`. Shared test resource: none. Needs: U1, because each clause states the boundary terms of the landed line. shapes.md's `### readiness.yaml` block is not edited.
- U3 plan-issue (W5). Owns `skills/plan-issue/SKILL.md`. Shared test resource: none. Needs: U1.

Wave 3
- U4 check-issue (W6). Owns `skills/check-issue/SKILL.md`. Shared test resource: none. Needs: U1, U3, because its "plan's recorded reading" clauses name U3's landed reading.
- U5 implement-issue (W7). Owns `skills/implement-issue/SKILL.md`. Shared test resource: none. Needs: U1, U3, for the same reason.

After wave 3: A writes `implementation/report.md` (D5 to D8) and runs the verification below.

## Checklist

- [ ] standing-design.md: new line; scoped test-only-as-proof, cheapest-sufficient-test, regression-guard, fail-first/deliberate-break, slow-run lines; writer/checker scoped and its last sentence deleted (U1).
- [ ] questions.md: removers include the model's recorded choice; operator step only for what the operator alone can grant or know (U2).
- [ ] shapes.md: audit refusal of sourceless proxies and per-item quality stops, naming the rewrite; both proof-form lists gain the model-choice form (U2).
- [ ] autopilot.md: limits sentence (U2).
- [ ] plan-issue SKILL.md: command-mapping and own-tests sentences scoped; new paragraph before "Before writing the criterion tests" (U3).
- [ ] check-issue SKILL.md: Fix paragraph, test comparison, scenarios clause, both reusable-Nit sentences, check.repair Handed to A (U4).
- [ ] implement-issue SKILL.md: fourth exception, Implementation notes reading, check.fix not-weakening clause, restated test rules scoped, locked-decision clause, Standalone and Direct form (U5).
- [ ] lesson-rule.md Seed; learn-issues description, Sort Removal, Apply (U6).
- [ ] Docs: skills/AREA.md learn-issues line; docs/reference/skills.md lines 53 and 79; docs/use/learn-from-work.md alt text and outcome list (U6). No other agent or human doc is affected; `docs/pictures/lessons-flow.svg` stays stale and is reported (D9).
- [ ] implementation/report.md with site table, walk, still-blocks, removals, unproven (A).

## Criteria and observations

### Criterion 1: every rule site states its handling, no sentence still orders a proxy

- Observation: both reviewing seats read `implementation/report.md` `## Site table` against the diff (D6). Command: none. No test, case or red-first commit (D4).
- Boundary: the eleven owned files plus docs/use/learn-from-work.md at the leaf head. Before: base text at 7cecb045. After: each listed site carries its clause.
- Failure it catches: a sibling restatement that still orders a test, case, deliberate break, operator stop or proxy for the choice part.
- Size: minutes (reading). Rerun trigger: any later commit touching an owned file.
- Conditions checked: "no sentence left still orders ... the choice part" is a reading over the whole owned text. Decision D1/D2 adds clauses without rewriting neighbours, so a restatement elsewhere can survive; the site table rows cover every place brief criterion 1 names, and lesson 2026-09-14 (sweep for the old term) is why A rereads each owned file whole before writing the table. Traced reason no case: a case would be a text match on seat-written prose, the pattern this leaf removes (design Current interpretation).

### Criterion 2: the serp-wireframing chain is stopped

- Observation: both reviewing seats read `## serp-wireframing walk` (D7). Command: none.
- Failure it catches: a step whose outcome the new text does not change.
- Size: minutes. Rerun trigger: a commit changing a sentence the walk cites.
- Condition: each of the six steps names a sentence. Traced reason no case: same as criterion 1.

### Criterion 3: function checks still block

- Observation: both reviewing seats read `## Still blocks` (D8). Command: none.
- Failure it catches: new text whose wording lets a keep-list check be read as a choice or removed under W7's exception.
- Size: minutes. Rerun trigger: a commit changing the keep list in any clause.
- Condition: the keep list is named inline in each step clause (D1); the walk traces each of the five cases. Traced reason no case: same as criterion 1.

### Criterion 4: links resolve and the readiness example parses

- Command: `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts`, run through `akrogon run-check --name crit4 -- <cmd>` on the leaf head after the configured `setup`. Both tests exist at `AKROGON_BASE`; no new test.
- Boundary: the repo's Markdown link checker over README, docs and skills, and `readinessSchema` over shapes.md's `### readiness.yaml` block.
- Before: green at base. After: green on the leaf head.
- Failure it catches: a broken link or anchor added by an edit, a link leaving its skill folder (D1), a lesson write site losing its lesson-rule link (D3), or a readiness example that no longer parses.
- Size: seconds. Rerun trigger: any commit touching a Markdown file under README.md, docs/ or skills/, or shapes.md.
- Conditions checked, each with its case shown red at planning by a temporary edit discarded before any commit:
  - Links in changed files resolve. Decision at risk: D1/D2 add text that may carry links. Case: "README, docs and skill links resolve to files and anchors". Temporary edit: appended `[missing](missing-file.md)` to standing-design.md.
  - Readiness example parses. Decision at risk: U2 edits shapes.md near the example. Cases: "shapes.md readiness.yaml example parses against readinessSchema", "draft readiness.yaml gaps without state.yaml". Temporary edit: first `kind: env` changed to `kind: not-a-kind` in shapes.md.
  - Red output, both edits together: `check crit4-red: 1 /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/implementation/check-crit4-red-1794916107685-1846296.log`, 11 pass 3 fail: `(fail) README, docs and skill links resolve to files and anchors` ("standing-design.md: missing file missing-file.md"), `(fail) shapes.md readiness.yaml example parses against readinessSchema` and `(fail) draft readiness.yaml gaps without state.yaml` (`invalid_value`). Both edits reverted with `git checkout`; worktree clean.
- Baseline at 7cecb045: `check crit4-base: 0 /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/implementation/check-crit4-base-1794916092841-1845474.log`, 14 pass 0 fail. An earlier run, `check-crit4-base-1794916084935-1844951.log`, failed with "Cannot find package 'zod'" because the worktree had no `node_modules`; the configured `setup` fixed it. That red had no cause in any diff and is not a product result.

### Criterion 5: what stays unproven

- Observation: both reviewing seats read `## Unproven`: whether the next real charts and leaves stop producing proxies, which only later work shows; the change reaches doors only at the next release link (D13). Command: none.

## Guard (not a criterion)

D3's pinned literals: `bun test tests/run-units.test.ts -t "^skills name"` through `akrogon run-check`. Baseline green: `check pinned-literals: 0 /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/implementation/check-pinned-literals-1794916170270-1850187.log` (2 tests, 0 fail). Both tests are inside the `test` check, so `akrogon verify` at implement end also runs them.

## Verification at implement end

1. `akrogon run-check --name crit4 -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` on the committed head.
2. The pinned-literal guard above.
3. `akrogon verify` in the worktree on the committed head (implement-issue rule; runs format, test, typecheck).
4. A rereads each owned file whole, then writes `implementation/report.md` (D5 to D8).
