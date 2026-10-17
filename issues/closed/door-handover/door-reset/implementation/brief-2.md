# Brief 2: handover documentation (U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-reset-u2` (detached at the leaf's committed HEAD `61727e0`).

## 1. Goal

Document the autopilot self-handover in the three affected docs. Plan decision D6. Criterion C6.

## 2. Acceptance criteria

- `skills/chart-issues/SKILL.md` `## Autopilot` gains one paragraph: handover happens when switching to the next runnable handed chart, after the outgoing chart's records and closed span; old A creates the next chart's folder when absent (INTAKE.md + CHART.md with mode record), appends `handover <time> <log>: handed <remaining list>; consultants <surviving>` to the mode record of every handed chart still open, runs `bun <skill-folder>/scripts/door-reset.ts <A pane> <A session> <log> <start prompt>` and ends its turn. The fresh session whose latest mode entry is that handover appends `continue autopilot (handover <time>)` and continues the same handed list; any other new session starts attended. Supported kinds: claude (`/clear`), codex and pi (`/new`); other kinds keep same-session behavior.
- `## Printed footer` gains the wording: `Next: none handover queued to a fresh A in <pane>` for the pass that queued the handover.
- `skills/chart-issues/assets/shapes.md` mode-record line gains the two entry forms (`handover <time> <log>: handed ...; consultants ...` and `continue autopilot (handover <time>)`) plus one sentence explaining they are appended during autopilot switch.
- `docs/guide/chart.md` `## Autopilot` gains a short paragraph: after the first handed chart the door can hand itself to a fresh conversation in the same pane to keep context small; works for claude, codex and pi; anything else keeps today's behavior.
- The literal strings `handover`, `continue autopilot (handover`, `handover queued`, `/clear`, `/new` must appear in SKILL.md; `handover` + `continue autopilot (handover` in shapes.md; `handover` in chart.md (asserted by `tests/door-reset.test.ts` docs test — do not edit the test).
- Attended-mode text stays byte-identical.

## 3. Read-first

- `skills/chart-issues/SKILL.md` `## Autopilot` (end of the mode paragraph, before `## Printed footer`)
- `skills/chart-issues/assets/shapes.md` `## Chart records` mode record block
- `docs/guide/chart.md` `## Autopilot` (after the consultant/record paragraphs)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned paths: the three files above only. Minimal additive edits, matching each file's existing tone and sentence style — dense, rule-like prose for SKILL.md/shapes.md; plainer prose for the guide.

## 5. Do-not

- No rewrites of existing sentences; additive edits only where needed.
- No new sections/headings; extend existing `## Autopilot`, `## Printed footer`, mode-record line and guide `## Autopilot`.
- Do not edit `tests/door-reset.test.ts` or any other test.
- Return a mismatch instead of widening scope; exception: revised brief from A.

## 6. Ordered steps

1. Edit `SKILL.md` (autopilot paragraph + footer wording).
2. Edit `shapes.md` mode-record line + sentence.
3. Edit `docs/guide/chart.md` autopilot paragraph.
4. Verify: `bun test tests/door-reset.test.ts -t "docs"` (the docs test passes; other tests fail until U1 lands — ignore them).
5. Commit once, message `docs: describe door self-handover`.

## 7. Commands

- `akrogon run-check --name door-reset-docs -- bun test tests/door-reset.test.ts -t docs --timeout=30000`

## 8. Done-when, evidence and report

Docs test green; diff touches only the three files; attended-mode lines unchanged.

Changed files and reasons:
Tests run:
Known limitations:
Unverified criteria:
