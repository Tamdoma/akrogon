# Implementation report: known-red-filing

## Changed files and reasons

- `skills/seed-issue/SKILL.md` — added `## Lifecycle filing` (the filing contract: one report per defect, common-cause grouping only, required fields, failure-location routing clause, evidence reuse, final two lines into the caller's pass record); added the closed-report coverage sentences to `## Report`'s coverage paragraph (criteria 5, 6).
- `skills/implement-issue/SKILL.md` — appended the filing clause to the Shared context known-red paragraph: both triggers, `implementation/report.md` record, exclusions, no-status-change, `gh` failure not an operator blocker (criterion 1).
- `skills/check-issue/SKILL.md` — appended the same clause inside the check.review known-red paragraph, `review-<slot>.md`; opening words "During check.review, a red test or check" unchanged so check.repair's reference still resolves (criterion 2).
- `skills/merge-issue/SKILL.md` — appended the clause to the red verify paragraph, `review-B.md`, "adds no proof run" (criterion 3).
- `skills/chart-issues/SKILL.md` — extended landing step 3's known-red sentence with the clause, `<chart>/direct/report.md`, "adds no proof run" (criterion 4).

Serial-solo: plan.md's single wave holds one unit, so A implemented it directly (implement-issue serial-solo rule). Branch refreshed before the unit; already at origin/main, base 63c20f98, no rebase move.

## Commands run

- `check plan-red-seat-skills: 1` — planning red evidence: no lifecycle-filing text in the four seat skills before the edit.
- `check plan-red-seed-sections: 1` — `## Lifecycle filing` absent before the edit.
- `check plan-red-closed-coverage: 1` — only "closed" hit was the root-cause guard; no coverage rule.
- `check plan-diff-listing: 0` — baseline diff listing, empty on clean tree.
- `check crit7-diff-listing: 0` — post-commit `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly `skills/chart-issues/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/seed-issue/SKILL.md`.
- `akrogon verify` on head `f85cc67` — green (format, test, typecheck; 1219 tests pass). Receipt: `verify leaf f85cc67067752ca0e3d3557cee594ec75093d6ed: green`.
- `git fetch`/`rebase` — branch up to date, no move.

## Done-criteria proof

Base `63c20f98`, committed head `f85cc67`. No tests: each criterion is a stated rule proven by reading its section (locked design); red-before evidence above.

1. implement-issue Shared context known-red paragraph (line 40) states both triggers (agreeing judgment on a configured command; completed base run of an outside-`checks` command failing the same tests), `implementation/report.md` record of URL or failing command+error, all three exclusions, no-status-change, `gh`-failure-not-blocker. Read post-edit: all clauses present.
2. check-issue check.review paragraph (line 69) states the same for either reviewing slot with `review-<slot>.md`; check.repair line 91 still references the paragraph by its intact opening words. Read post-edit: present and intact.
3. merge-issue red verify paragraph (line 79) states both triggers including "the pass holds that evidence", `review-B.md` record, "adds no proof run". Read post-edit: present; nothing else in the paragraph changed (edit is an insert between existing sentences).
4. chart-issues landing step 3 (line 113) states both triggers including "the attempt holds that evidence", `<chart>/direct/report.md` record, "adds no proof run". Read post-edit: present.
5. seed-issue `## Lifecycle filing` holds one report per defect, common-cause grouping only, required fields, "claims nothing about the default branch beyond the compared SHA", evidence reuse, final two lines into the caller's pass record, plus the failure-location routing clause (plan D3). Read post-edit: present.
6. seed-issue `## Report` coverage paragraph states a closed report covers only through an open report it names that covers it; supported recurrence or no open covering report posts with the closed report on its `Related reports` line, never reopening or commenting. Open-report coverage text unchanged. Read post-edit: present.
7. `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the five skill files (`check crit7-diff-listing: 0`).

## Known limitations

None. No unverified criteria.

## Open plan questions resolved

- Operator-blocker paragraph needed no added clause (plan D4): it covers steps physically requiring the operator; a `gh` failure is a command error the seat records, and criterion 1 states the exclusion where the filing is introduced.
- Failure-location routing clause added to `## Lifecycle filing` (plan D3): the report's failure location is the failing test file or command path relative to the consumer root, not skill paths cited as context, so a consumer-repo red does not reroute to akrogon's tracker.
