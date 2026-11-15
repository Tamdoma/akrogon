# Brief 3 — door-step-files U3: AREA.md assets line and docs repoint

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-step-files-u3` (detached at leaf HEAD, `bun install` first).

## 1. Goal

Name the three new door step files in `skills/AREA.md` and repoint the one docs link that names a moved rule's place (plan D5, done-criterion 7). Step files are created in parallel by another worker.

## 2. Numbered acceptance criteria

1. `skills/AREA.md` line for `skills/chart-issues/SKILL.md` names `direct-route.md`, `autopilot.md` and `handover.md` among the door's `assets/` — one line edit, keeping the line's existing style (`assets/` holds `shapes.md` … `standing-design.md` …); AREA.md keeps its Commands / Key files / Non-obvious patterns / See also shape.
2. `docs/reference/files.md` ~line 27: `[skill's Handover section](../../skills/chart-issues/SKILL.md#handover)` now points at `../../skills/chart-issues/assets/handover.md` — the handover procedure lives in the step file (keep the descriptive text, adjust link text/target so it lands on `handover.md`).
3. No other file touched.

## 3. Read-first list

- `skills/AREA.md` — the line to edit.
- `docs/reference/files.md` — the link to repoint.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- `/home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/plan.md` — D5, D7 context.

## 4. Change list and needed interfaces

Owned paths: `skills/AREA.md`, `docs/reference/files.md`. Must land first: nothing. Shared test resources: none. Sibling workers own `SKILL.md`, `assets/questions.md`, `assets/shapes.md` and the three new step files — never touch them.

## 5. Do-not, reasons and exceptions

- Do not touch other `docs/` pages — pages that merely link `SKILL.md` or describe behavior (quick-fix.md, autopilot.md, words.md, etc.) name no moved rule's place and stay unchanged.
- Do not edit any test or create files.
- An AREA.md structure conflict (sections beyond the four named) is a mismatch — return it.
- Mismatch path: name the conflict with evidence; stop.

## 6. Ordered steps

1. `bun install`.
2. Edit `skills/AREA.md` assets clause.
3. Edit `docs/reference/files.md` link.
4. Commit both files as one commit.
Advisory size: 2 files, under 10 turns.

## 7. Commands

`akrogon run-check --name u3-docs-links -- bun test tests/docs-links.test.ts -t 'resolve to files and anchors'`. Expected red: your files.md link targets `assets/handover.md`, which a parallel worker creates — a "missing file" report for `assets/handover.md` (or the other step files) is expected; report it as-is. Any OTHER broken link or missing anchor is a mismatch to report, not repair.

## 8. Done-when, evidence and report

Commit ID returned; check line cited; expected-missing breaks noted. End with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
