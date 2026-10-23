# Brief 2: autopilot story (unit U2)

Read `common.md` in this folder first. Its rules are part of this brief.

## 1. Goal
Write `docs/examples/autopilot-story.md`: autopilot charting a batch of website speed work in a company website project (P1), then the lifecycle building and reviewing the leaves. Plan D1, D2, D3, D5-D9.

## 2. Acceptance criteria
1. The story matches the P1 `website-speed` chart record (CHART.md, USAGE.md, forks/, slots/) and the child leaves named in provenance.md under P1 `issues/closed/`. Before writing, `git -C <P1 root> fetch origin`, then for each named leaf confirm `phase: merged` in its state.yaml and that its merge landed on P1 `origin/main` (find the merge commit with `git -C <P1 root> log origin/main --oneline --grep <leaf slug>` or the leaf report, then `merge-base --is-ancestor`). Tell only leaves that pass. Report only "landed" per leaf.
2. Privacy rules in common.md hold. The project and its client are not named. The intake names a client repo: never quote it.
3. It tells what happened: autopilot switched on, the door answering forks, the handoff into leaves, A and B per leaf, merges. Each step links `../use/autopilot.md`, `../use/run-work.md`, `../use/merge-and-announce.md` and the matching `../reference/` pages (`commands.md`, `state-and-phases.md`). Generic leaf slugs (for example `brand-raster-webp`) may appear if they reveal nothing private.

## 3. Read first
- `docs/use/autopilot.md`, `docs/use/run-work.md`, `docs/use/merge-and-announce.md`, `docs/reference/commands.md`, `docs/reference/state-and-phases.md`
- `skills/chart-issues/SKILL.md` (autopilot part)
- P1 records listed above
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list
Owns `docs/examples/autopilot-story.md` only. No prerequisites. No shared test resource.

## 5. Do-not
See common.md. Do not name the client, the site's domain or any business detail that identifies them.

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
