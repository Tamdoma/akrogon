# Brief 1: quick-fix story (unit U1)

Read `common.md` in this folder first. Its rules are part of this brief.

## 1. Goal
Write `docs/examples/quick-fix-story.md`: a real direct-route fix in a web framework project (P1), told plainly. Plan D1, D2, D3, D5-D9.

## 2. Acceptance criteria
1. The story matches the P1 `script-lane-effort` chart record and its `direct/` folder (paths from provenance.md). Before writing, run `git -C <P1 root> fetch origin` and `git -C <P1 root> merge-base --is-ancestor <direct commit> origin/main` and confirm exit 0. Report only "landed".
2. Privacy rules in common.md hold. The project is not named.
3. It tells what happened: the operator's notes, the door offering the direct route, the draft brief and design, A implementing, B reviewing, repair rounds if any, landing on main. Each step links `../use/quick-fix.md` (and its sections) and the matching `../reference/` page. It links the picture `../pictures/ways-to-run.svg` as an image with alt text describing what it shows.

## 3. Read first
- `docs/use/quick-fix.md`, `docs/use/plan-work.md`, `docs/reference/commands.md`, `docs/reference/files.md`
- `skills/chart-issues/SKILL.md` (direct route part), `skills/implement-issue/SKILL.md` (Direct form)
- P1 chart folder: CHART.md, INTAKE.md (do not quote), USAGE.md, forks/, direct/ (plan.md, report.md, reviews)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list
Owns `docs/examples/quick-fix-story.md` only. No prerequisites. No shared test resource.

## 5. Do-not
See common.md. Do not describe what P1's code does in a way that names the project or a client.

## 6. Steps
1. Landing check (criterion 1).
2. Read the records, list the real sequence of events.
3. Check each command named against `src/akrogon.ts` and `docs/reference/commands.md`.
4. Write the page, about 60-120 lines.
5. Run the three proof commands. Commit.

Advisory size: 1 file, under 15 turns.

## 7. Commands
The three proof commands in common.md.

## 8. Report
As in common.md.
