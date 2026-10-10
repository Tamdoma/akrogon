# Brief 1 — U1: live-proof-line text edits

Text-only leaf: two rules in the chart door across four files. No code, no new files, no new tests.

## 1. Goal

Implement plan D1–D5 for leaf `live-proof-line`: a live-run estimate line in the handoff review and a side-by-side requirement on live-run done-criteria.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md` `## Handoff` tells the door to show the live-run line in the handoff review as door prose (not chart-usage script output), with: session count, how many run at once (rounds counted), estimated elapsed time, worst case if sessions hit their timeout, the estimate label, the named timeout source (destination's session timeout named by file and value), the measured-case-replaces-timeout rule, the "unknown" with a reason rule, and the information-only rule (never times out a leaf, never waives a criterion, operator approves or narrows scope).
2. `skills/chart-issues/assets/standing-design.md` states the side-by-side rule as part of every live-run done-criterion, the named shared-resource exception, and that an unnamed shared resource makes the criterion unable to pass within the leaf so the pass ends `failed` (existing red-criterion exit).
3. `skills/chart-issues/assets/shapes.md` handoff audit adds two refusals: a live-run done-criterion that runs sessions one after another without naming the shared resource, and a live-run criterion that names a session count. The existing test-count refusal is kept unchanged.
4. `docs/guide/chart.md` handoff review description mentions the live-run line; it describes, it does not restate rules.
5. No new number, budget, timer or duration gate in any added line: zero numeral characters, no budget/timer/duration/deadline word. `timeout` may appear only as the D1 basis field. Quantities are expressed as field names ("one line per leaf", "session count"), never constants.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — `## Handoff` first paragraph, especially the chart-usage sentence (the new sentence goes beside it).
- `skills/chart-issues/assets/standing-design.md` — the cheapest-test line ("a slow or live run names what no smaller test could prove") and the "A slow or live-run leaf" line; the rule lives in these live-run lines.
- `skills/chart-issues/assets/shapes.md` — `## Preflight and validation`, the "Read the briefs as an implementer" paragraph whose sentence lists audit refusals ("the audit refuses a criterion naming a test file, assertion or test count, citing a `merge_checks` command or claiming repo health outside leaf ownership").
- `docs/guide/chart.md` — the handoff review paragraph around "Before handoff the door also checks the source repo...".
- `ponytail.md` in this skill folder (`/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`).

## 4. Change list and needed interfaces

- `skills/chart-issues/SKILL.md`: append one sentence beside the chart-usage sentence in the `## Handoff` first paragraph covering every element in criterion 1.
- `skills/chart-issues/assets/standing-design.md`: extend the live-run lines (append a sentence to the "A slow or live-run leaf" line or the cheapest-test line) stating the side-by-side rule, the named shared-resource exception, and the `failed` consequence per criterion 2.
- `skills/chart-issues/assets/shapes.md`: extend the audit-refusal sentence in the implementer-audit paragraph with the two new refusals per criterion 3.
- `docs/guide/chart.md`: add one describing sentence in the handoff review paragraph per criterion 4.
- Owned paths: exactly these four files. No shared test resources. No prerequisites.

## 5. Do-not, reasons and exceptions

- Do not add or edit any test. Design locks "no vanity tests" — no test asserting skill or guide wording. Exception: none.
- Do not write numeral characters or budget/timer/duration/deadline words in added lines. Criterion 5 forbids gates; quantities stay as field names. Exception: `timeout` as the D1 basis field name; the criterion-3 refusals and the existing `failed` exit are allowed.
- Do not restate rules in `docs/guide/chart.md` — the guide describes only. Reason: design says one rule per place. Exception: none.
- Do not edit any file outside the four owned paths, including `implementation/` artifacts (those live in the leaf folder, not the worktree). Exception: none.
- Do not commit under `issues/`. Reason: `akrogon phase` rejects `issues/` diffs. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.

Restated: no tests, no numerals/gates, no rule restatement in the guide, no edits outside the four files, nothing under `issues/`; the only exception to any exclusion is a revised brief from A.

## 6. Ordered steps

1. Read each of the four files' target sections. Criteria 1–4.
2. Edit `standing-design.md` first (the rule definition), then `shapes.md` (the refusals that enforce it), then `SKILL.md` (the review line), then `chart.md` (the description). Keep one consistent term set: "live-run done-criterion", "side by side", "own working root and log", "named shared resource".
3. `git diff` the whole worktree; confirm exactly the four files changed and criterion 5 holds (no numerals, no gate words) in added lines.
4. Commit the four-file diff in one commit on the detached worktree HEAD with message `feat: live-run review line and side-by-side criterion rule`; no `Test-Change:` trailer (no test file touched).
5. Fill in the report lines at the end of this brief.

Advisory size: 4 files, under 20 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Changed-test runner from config: `AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed="$AKROGON_BASE" --timeout=30000` in the worktree. With no test files changed it may select nothing to run — report its actual output.

## 8. Done-when, evidence and report

All five criteria hold in the committed diff; `git status --porcelain` empty except nothing untracked inside the worktree; the changed-test command's real output reported. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
