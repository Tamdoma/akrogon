## 1. Goal
Implement plan D6: chart handoff refuses a completion owner whose top-level folder already exists under issues/closed.

## 2. Numbered acceptance criteria
1. C5: both shapes.md preflight and chart-issues SKILL.md audit require closed-owner collision checking before any handoff write.
2. Collision uses issues/closed/<top-level-owner-folder-name>, blocks empty closed owner folders too, and distinguishes an epic owner from its nested issue names. Name the conflicting destination.

## 3. Read-first list
Read ../plan.md D6/C5/R1, skills/chart-issues/assets/shapes.md tree/preflight, skills/chart-issues/SKILL.md Handoff, src/phase.ts completeOwner for semantics, and /home/ivan/.codex/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces
Edit only the existing preflight paragraph in skills/chart-issues/assets/shapes.md and audit sentence in skills/chart-issues/SKILL.md. No code/interface changes or new documentation.

## 5. Do-not, reasons and exceptions
Do not alter runtime completion or add wording tests because this is a two-paragraph agent instruction fix. Do not commit or expand surrounding guidance. Return mismatch with evidence before changing scope, except with B's revised brief. These exclusions preserve ownership and avoid testing wording; brief revision is the exception.

## 6. Ordered steps
Read existing semantics, edit both paragraphs, manually evaluate standalone collision, epic collision, empty-folder collision, free owner, and equal nested child name under another owner. Run configured changed tests and fill report. Advisory scope: two files and about five turns. No fail-first automated test is needed for this prose change.

## 7. Commands
AKROGON_BASE=a6b53fdceca8e54b7618f59cffd0beb53c2d882b bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
Save output and exit code beside this brief as worker-3-green.txt. B owns full suite and blocking checks.

## 8. Done-when, evidence and report
Return changed files/reasons, command result, manual scenario results, known limitations and unverified criteria. R1 remains: manually bypassed or concurrently invalidated preflight still relies on existing runtime completion refusal.

Changed files and reasons: skills/chart-issues/assets/shapes.md preflight paragraph and skills/chart-issues/SKILL.md audit sentence now require checking issues/closed/<top-level-owner-folder-name> before any handoff write. Both refuse existing destinations including empty folders, name the collision, and identify standalone issues and epics as owners rather than nested child issues. No runtime changes or commits.
Tests run: Section 7 changed-test command against a6b53fdceca8e54b7618f59cffd0beb53c2d882b passed: 161 pass, 0 fail, 1546 assertions across 10 files, exit 0. Output saved in worker-3-green.txt. Manual evaluation of both paragraphs against completeOwner semantics passed all five scenarios: standalone owner alpha conflicts with issues/closed/alpha; epic alpha conflicts with issues/closed/alpha; an empty issues/closed/alpha also blocks; an absent owner destination passes this check; issues/closed/other/alpha as a nested child does not conflict with proposed top-level alpha when issues/closed/alpha is absent, subject to existing independent leaf-slug checks.
Known limitations: R1 remains: manually bypassed or concurrently invalidated preflight still relies on existing runtime completion refusal. These are agent instructions, evaluated manually rather than with wording tests.
Unverified criteria: None within this brief. Full suite and blocking checks belong to B.
