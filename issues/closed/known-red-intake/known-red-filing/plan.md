# Plan: known-red-filing

## Scope

Skill text only. Add one lifecycle-filing contract to `skills/seed-issue/SKILL.md` and point the four seat skills at it at their existing known-red judgment points. No `src/`, `tests/`, `docs/`, `issues/` change; no test is added (locked design: every criterion is a stated rule proven by reading its named section, criterion 7 by the diff listing). No live run, outside call or model stage runs during implementation. Not a slow-run leaf; no restart boundaries needed.

## Decisions

- **D1** One filing contract lives in `skills/seed-issue/SKILL.md` as a new `## Lifecycle filing` section placed between `## Report` and `## Submit and finish` (the footer it amends comes last). The four seat skills reference it by name and keep only their trigger and record file.
- **D2** The new section states the brief's wording exactly: one report per observed defect, commands and failing tests grouped only when evidence supports a common cause, otherwise separate reports; the report names the exact command and scope, the head and compared base SHAs, the retry result, a short failing excerpt, the kept log paths and the leaf; the filing claims nothing about the default branch beyond the compared SHA; it reuses the evidence the calling pass already holds and starts no extra verification; and the final two lines of `## Submit and finish` (created/found URL or failure) go into the caller's pass record while the pass continues to its own phase action and footer.
- **D3** Open for the plan, routing: the new section states that the report's failure location is the failing test file or command path relative to the consumer root, not the skill files it cites as context. Reason: `## Destination`'s owner test reroutes to akrogon only for a named path absent under the consumer root; naming `skills/*/SKILL.md` as the failure's location would reroute a framework leaf's red to akrogon's tracker.
- **D4** Open for the plan, operator-blocker: `skills/implement-issue/SKILL.md` Shared context operator-blocker paragraph gets no added clause. That paragraph covers steps that physically require the operator; a `gh` failure is a command error the seat records, and criterion 1 states the exclusion in the known-red paragraph itself, the only place the two rules intersect. Adding a second exclusion would duplicate.
- **D5** The check.review known-red paragraph's opening words ("During check.review, a red test or check") stay unchanged so check.repair's existing reference keeps resolving; the filing text is appended inside that paragraph.
- **D6** The closed-report coverage rule (criterion 6) goes inside `## Report`'s coverage paragraph where coverage is judged by mechanism, as added sentences: a closed report covers a failure only through an open report it names that covers it (closed as a duplicate); a supported recurrence of a defect whose closed report's fix was delivered, or a current defect with no open covering report, posts fresh with the closed report on its Related line, never reopening or commenting on it. Open-report coverage is unchanged; the existing "never commenting, labeling or changing state on a linked issue" sentence already enforces the never-reopen half.
- **D7** Each seat skill's filing clause carries both triggers and all exclusions inline (not by cross-reference): files when the known-red judgment agrees for a configured command, or, for a command outside `checks`, when the seat's own completed base run of the same command fails the same tests; records the created or found URL, or the failing command and its error, in that pass's record file; a green retry (`inconsistent`), a disagreeing judgment, or a killed or incomplete base run is not filed as a base red; filing changes no verification status, so a red done-criterion stays blocking. Implement-issue additionally states a `gh` failure while filing is not an operator blocker (the only skill whose text contains that stop rule).
- **D8** One unit, one wave: the section name, wording and record files must agree across five files, so one seat makes all edits in one pass. Serial-solo run: every wave holds one unit, so implement runs with no workers (implement-issue serial-solo rule).
- **D9** Record file per route (from the brief): implement end and check.fix write `implementation/report.md`; check.review writes `review-<slot>.md`; merge writes `review-B.md`; the direct route writes `<chart>/direct/report.md`. Merge and chart-issues add no proof run and relax no proof requirement — the filing clause is appended to existing step text only.

## Read-first

- `skills/seed-issue/SKILL.md` — `## Destination` owner test, `## Report` coverage paragraph, `## Submit and finish` final two lines.
- `skills/implement-issue/SKILL.md` — Shared context known-red paragraph (the long paragraph starting "During implement end and check.fix").
- `skills/check-issue/SKILL.md` — check.review known-red paragraph (starts "During check.review, a red test or check") and check.repair's reference to it.
- `skills/merge-issue/SKILL.md` — `### Shared endings` red verify paragraph ("On a red verify, judge the cause").
- `skills/chart-issues/SKILL.md` — `## Direct route` landing step 3.
- `docs/reference-index.md`, `docs/reference/checks.md` `## Known red` — verified already deferring to the skills; no change needed.
- `learnings/LESSONS.md` — read; no lesson binds this text-only leaf.
- `issues/chart/known-red-intake/forks/filing-rule.md` `## Taken` — source of the binding decisions (recorded in design.md).

## Needed interfaces

Existing (no code change): `akrogon verify --known-red`, `akrogon run-check`/`akrogon log`, `gh issue list/create/view` under seed-issue's routing. New name shared across files: seed-issue's `## Lifecycle filing` section title, the reference the four seat skills make.

## Checklist

Wave 1 (one unit, serial-solo):

| Unit | Owned paths | Shared test resource | Waits on |
|---|---|---|---|
| U1: filing contract and seat clauses | `skills/seed-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md` | none | none |

Edit outline:
1. seed-issue: insert `## Lifecycle filing` per D2/D3 between `## Report` and `## Submit and finish`; add closed-coverage sentences to the `## Report` coverage paragraph per D6.
2. implement-issue: append the D7 filing clause to the Shared context known-red paragraph.
3. check-issue: append the D7 clause inside the check.review known-red paragraph, keeping its first words (D5).
4. merge-issue: append the D7 clause to the red verify paragraph, recorded in `review-B.md`, no proof run added.
5. chart-issues: extend landing step 3's known-red sentence with the D7 clause, recorded in `<chart>/direct/report.md`, no proof requirement relaxed.

Docs affected: none beyond the five skill files — `docs/reference/checks.md` `## Known red` already defers seat rules to these skills; `skills/AREA.md` describes skills by role and needs no new line; `skills/learn-issues/SKILL.md` and `skills/lesson-rule.md` touch seed-issue's destination rule, which is unchanged.

## Verification

Criteria 1–6 prove by reading the named section post-edit; each was shown absent (red) at planning, exit 1, through `akrogon run-check`. Post-edit, A reads each named section and confirms every clause below.

| # | Boundary | Before (red, recorded) | After | Failure caught | Command | Size | Rerun trigger |
|---|---|---|---|---|---|---|---|
| 1 | `skills/implement-issue/SKILL.md` known-red paragraph | `check plan-red-seat-skills: 1` (no lifecycle-filing text in any seat skill) | Paragraph states triggers, exclusions, `implementation/report.md` record, no-status-change, `gh`-failure-not-blocker | A seat judges a red as base's and moves on with no lasting record; a `gh` failure wrongly stops the pass as operator blocker | read the paragraph; clauses per D7 | seconds | any edit to the paragraph |
| 2 | `skills/check-issue/SKILL.md` check.review paragraph | same `check plan-red-seat-skills: 1` | Paragraph states same rule, `review-<slot>.md`; check.repair's "paragraph beginning" reference still resolves | reviewers file nothing; check.repair loses its retry rule if the opening words change | read the paragraph and the check.repair reference line | seconds | any edit to the paragraph or its first words |
| 3 | `skills/merge-issue/SKILL.md` red verify paragraph | same | Paragraph states both triggers, `review-B.md` record, no added proof run | a merge-time base red lands unfiled | read the paragraph | seconds | any edit to the paragraph |
| 4 | `skills/chart-issues/SKILL.md` landing step 3 | same | Step 3 states both triggers, `<chart>/direct/report.md` record, no proof relaxed | a direct-landing base red goes unfiled | read step 3 | seconds | any edit to step 3 |
| 5 | `skills/seed-issue/SKILL.md` `## Lifecycle filing` | `check plan-red-seed-sections: 1` (section absent) | Section holds all D2 clauses plus the failure-location routing clause (D3) | 38 one-cause reds filed as 38 reports; filing claims more about main than the compared SHA; the pass's own footer lost | read the section | seconds | any edit to the section |
| 6 | `skills/seed-issue/SKILL.md` `## Report` coverage paragraph | `check plan-red-closed-coverage: 1` (the only "closed" hit is the root-cause guard; no coverage rule) | Closed-report rule per D6 present; open-report coverage text untouched | a closed report hides a defect that came back | read the coverage paragraph | seconds | any edit to the paragraph |
| 7 | branch diff | `check plan-diff-listing: 0` (empty listing on clean tree — baseline receipt) | `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the five skill files | an out-of-scope file slips into the leaf | `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` | seconds | every commit |

## Condition trace

Done-criteria conditions are text conditions; they are checked by naming each required clause and reading the section after the edit. No decision below can violate a condition at runtime because nothing executes.

| Condition (criterion) | Decisions that could break it | Case or traced reason |
|---|---|---|
| C1 triggers + all three exclusions + record file + no-status-change + `gh`-not-blocker (crit 1) | D7 clause written incompletely | Read-back check above names every clause; an absent clause is a fail at implement-end read. |
| check.repair keeps reaching the rule (crit 2) | D5 violated by rewriting opening words | The check.repair line references the literal opening; read-back confirms "During check.review, a red test or check" is intact. |
| No added proof run, no relaxed proof (crits 3, 4) | merge/chart edits extending into other steps | Edits are appends inside the named paragraph/step only; the diff (crit 7's command plus `git diff` of the files) shows nothing else changed. |
| One report per defect, grouping only on common-cause evidence (crit 5) | D2 drafted loosely | The clause is the brief's wording verbatim in the section. |
| Claims nothing about main beyond compared SHA (crit 5) | D2 | Same verbatim clause; a "red on main" claim without the SHA scope is a fail at read-back. |
| Footer goes to caller's record; pass continues (crit 5) | D2 | Section states the final two lines enter the caller's pass record, not end the turn. |
| Closed covers only through an open named covering report; recurrence/no-cover posts fresh with Related line; never reopen/comment (crit 6) | D6 phrased as "any closed report covers" | The D6 sentences state the through-open-report condition explicitly; "never commenting… on a linked issue" already in the file covers reopen/comment. |
| Only the five files in the diff (crit 7) | any stray edit | `git --no-pager diff --name-only` lists the set; a sixth file is a fail by inspection. |

## Env

No credentials; `akrogon status known-red-filing` printed no `Missing:` lines.

## Notes for review

- Brief and locked design agree; no conflict recorded.
- `proofs` in readiness.yaml show `gh` read access and prior creates on both routed repos; the leaf itself runs no `gh` call.
- Design rejects (verify calling `gh`, local `issues/` record, one-report-per-test, today's closed-report rule, blocking on filing) are preserved: nothing here adds any of them.
