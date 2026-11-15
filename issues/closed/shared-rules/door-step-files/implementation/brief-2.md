# Brief 2 — door-step-files U2: repoint citations in questions.md and shapes.md

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-step-files-u2` (detached at leaf HEAD, `bun install` first).

## 1. Goal

Repoint the four citations of door rules that moved into step files (plan D5). The step files are being created in parallel by another worker; your change is citation-only.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/assets/questions.md` line ~39: `SKILL.md` `## Autopilot` (the autopilot pick exception — "The one exception is an autopilot session…") → names `autopilot.md`.
2. `skills/chart-issues/assets/questions.md` line ~62: `SKILL.md` `## Autopilot` (consultant drops under autopilot) → names `autopilot.md`.
3. `skills/chart-issues/assets/shapes.md` line ~95: `SKILL.md` `## Handover` (the `handover` and `continue <mode>` mode-record entries appended on a chart switch) → names `handover.md`.
4. `skills/chart-issues/assets/shapes.md` line ~384: `SKILL.md` `## Autopilot` (autopilot answer counting at handoff audit) → names `autopilot.md`.
5. `../SKILL.md#open` in questions.md and every other citation in both files unchanged.

Use sibling-relative names since these files live in `assets/` (e.g. `` `autopilot.md` `` or `[autopilot.md](autopilot.md)`, matching surrounding style). No other edits in these files.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md` — the files you edit.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- `/home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/plan.md` — D5.

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`. Must land first: nothing (your citations name files a parallel worker creates). Shared test resources: none. Sibling workers edit `SKILL.md`, the three new `assets/` step files, `skills/AREA.md`, `docs/reference/files.md` — never touch them.

## 5. Do-not, reasons and exceptions

- Do not create the step files or touch any other path.
- Do not change the cited words' meaning — only the citation target changes.
- Do not edit any test.
- A citation you cannot map to the lists above is a mismatch: return it with the line, do not guess.
- Mismatch path: name the conflict with evidence; stop.

## 6. Ordered steps

1. `bun install`.
2. Apply the four repoints in section 2.
3. Commit both files as one commit.
Advisory size: 2 files, under 10 turns.

## 7. Commands

`akrogon run-check --name u2-docs-links -- bun test tests/docs-links.test.ts -t 'resolve to files and anchors'`. Expected red in your worktree: the sibling's `assets/direct-route.md` etc. do not exist yet — if the only reported breaks are missing `assets/<step-file>.md` targets or the two `chart-issues` literal tests are out of scope for this filtered run, that is expected; report the result as-is and do not repair the missing files. Any OTHER broken link is yours to report as a mismatch.

## 8. Done-when, evidence and report

Commit ID returned; check line cited; note which breaks were expected-missing step files. End with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
