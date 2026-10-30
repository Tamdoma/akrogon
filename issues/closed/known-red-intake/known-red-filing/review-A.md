# Review A: known-red-filing

Base `63c20f98`, reviewed head `f85cc67` (one commit, `git status` clean, branch ahead of base by that commit).

## Evidence

- `akrogon verify` green on f85cc67 per `implementation/report.md` (format, test, typecheck; 1219 tests). Receipt `verify leaf f85cc67067752ca0e3d3557cee594ec75093d6ed: green`.
- `check crit7-diff-listing: 0` — `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the five skill files; criterion 7 holds.
- Full diff read (5 files, +9/-5): every change is an append or inserted paragraph inside the named sections; nothing else touched.

## Criterion check

1. implement-issue Shared context known-red paragraph: both triggers, `implementation/report.md` record of URL or failing command+error, all three exclusions (`inconsistent` retry, disagreeing judgment, killed/incomplete base run), no-status-change, `gh`-failure-not-operator-blocker. Holds.
2. check-issue check.review paragraph: same rule for either slot recording in `review-<slot>.md`; check.repair's line-91 reference resolves because the opening words "During check.review, a red test or check" are unchanged. Holds.
3. merge-issue red verify paragraph: both triggers including "the pass holds that evidence", `review-B.md`, "adds no proof run". Insert sits between existing sentences; no proof requirement relaxed. Holds.
4. chart-issues landing step 3: both triggers including "the attempt holds that evidence", `<chart>/direct/report.md`, "adds no proof run". Holds.
5. seed-issue `## Lifecycle filing`: one report per defect with common-cause grouping only, exact command and scope, head and compared base SHAs, retry result, failing excerpt, kept log paths, the leaf, no claims beyond compared SHA, evidence reuse / no extra verification, final two lines into caller's pass record. All four seat skills point to this section by name. Holds.
6. seed-issue `## Report` coverage paragraph: closed report covers only through an open report it names that covers it; supported recurrence or no open covering report posts with the closed report on its `Related reports` line, never reopening or commenting. Open-report coverage sentence unchanged; pre-existing "never commenting, labeling or changing state on a linked issue" reinforces. Holds.
7. Diff lists only the five files (receipt above). Holds.

## AREA.md

None in the diff.

## Doc pages describing the changed behavior

`docs/reference/checks.md` `## Known red` already defers seat rules to the skills; still true. `docs/use/report-an-observation.md` describes the interactive flow, which is unchanged (the standalone footer still ends the turn).

## Findings

Fixes: none.

Nits:

- N1 `docs/reference/skills.md` `## seed-issue` "Who starts it" lists only "you" and checkable-lesson seats; lifecycle seats are now a third caller and the list reads incomplete. Deferred: this leaf's locked exclusions forbid any `docs/` change, so it cannot be repaired here, and the page's claim is not wrong, only short a starter. Promoting evidence: an operator call to lift the exclusion, or a reader-facing claim that only users run the skill.

## Verdict

`nits`
