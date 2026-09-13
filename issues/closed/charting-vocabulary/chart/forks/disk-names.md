# Do the disk names change with the words?

## Question
Q1 Keep `decisions/`, `## Resolution`, `## Not Yet Specified`, `## Out Of Scope` on disk and use the new words in prose only, or rename them on disk with a parser, test and chart migration?
Q2 If disk names stay, is fog written as bullets under the retained heading so `status --charts` counts it?
Q3 Does docs/guide/files.html:106 ("chart and its decision files") change?

### Carries
- Intake locks: behavior unchanged, same files, preflight, handoff, footer; binding decisions and plan D1…Dn keep their names; full test suite passes.
- Intake lean: rename if the migration is a handful of moves, keep if it touches implement-issue.

## Findings
- (both) src/status.ts:238-252 reads `decisions/`, `## Resolution`, `## Not Yet Specified`; tests/status.test.ts:460-482 writes them. A rename touches src and tests, so "suite passes unchanged" cannot hold literally.
- (both) implement-issue does not read chart files. The intake's stated dependency is wrong; the command is the dependency.
- (B) Renaming only the skill templates would silently zero the status counts.
- (B) Keeping names needs an explicit exemption of template literals from done-criterion 1; renaming needs an explicit exception to the four-file scope and criterion 3.
- (both) status counts bullet lines, so paragraph fog counts zero and a fog-only chart shows `empty`.
- (A) Lesson 2026-09-11 lock-vs-criterion: a grep-shaped criterion collided with verbatim template text once already.
- (A) Lesson 2026-09-11 stale-rule-in-docs: grep docs/ for a changed rule.

## Taken
Operator, round 1: "1b, 2a, 3b".
Q1: rename on disk. `decisions/` -> `forks/`; CHART.md `## Decisions So Far` -> `## Forks taken`, `## Open Decisions` -> `## Forks open`, `## Not Yet Specified` -> `## Fog`, `## Out Of Scope` -> `## Off route`; fork file `## Resolution` -> `## Taken`; `Handed off <date>` unchanged. src/status.ts chartRow and header (`DECIDED` -> `TAKEN`, `UNSPECIFIED` -> `FOG`) and tests/status.test.ts follow. Done-criterion 3 becomes "full suite passes". Migrate every existing chart: issues/chart/status-empty-open, issues/chart/charting-vocabulary (this one, B final check F1) and all issues/closed/*/chart, folder rename, heading rewrite, `decisions/` links, bodies otherwise byte-identical. Reason: the intake wants one picture on disk as well as in prose. Closed: prose-only rename.
Q2: fog is bullets, one patch per bullet, so status counts it. Closed: free prose.
Q3: docs change. docs/guide/files.html:106, docs/guide/in-practice.html:75 and docs/guide/create.html:58 (B final check F2) reword to forks, taken, fog. Closed: leaving docs stale.
