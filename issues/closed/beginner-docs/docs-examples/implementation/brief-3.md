# Brief 3: recovery story (unit U3)

Read `common.md` in this folder first. Its rules are part of this brief.

## 1. Goal
Write `docs/examples/recovery-story.md`: in varhop (public, named), a failed leaf's work carried forward into a redo that landed. Plan D1, D2, D3, D4, D5-D9.

## 2. Acceptance criteria
1. The story matches the varhop records: `issues/chart/overlay-rework/` (CHART.md, forks/disposal.md, archive/overlay-plugin/ with `phase: failed`) and `issues/closed/overlay-rework/` (leaves `overlay-plugin` and `overlay-rework`, both `phase: merged`). varhop root is in provenance.md. Before writing, `git -C <varhop root> fetch origin` and `git -C <varhop root> merge-base --is-ancestor 0be8ca4 origin/main`, exit 0.
2. The failed-versus-merged conflict is told per plan D4: the first `overlay-plugin` leaf failed. Its folder moved to the chart's archive. The disposal fork retired it and kept its code. A successor leaf reused the slug `overlay-plugin` on the same branch and worktree and merged. Then `overlay-rework` landed and closed varhop#1. Confirm each point in the records.
3. Privacy rules in common.md hold. varhop named, links https://github.com/Tamdoma/varhop/issues/1 and at least one public commit. No home paths (the disposal fork contains some), no session or tab ids, no dates.
4. Each step links `../use/when-work-fails.md` (and its sections), `../use/plan-work.md` where the chart reopened, and the matching `../reference/` pages (`state-and-phases.md`, `commands.md`, `files.md`). It links the picture `../pictures/failure-recovery.svg` as an image with alt text describing what it shows. Check that what the story shows matches today's recovery path in `docs/use/when-work-fails.md` and `src/`. Where the record took a path today's tool handles differently, tell what happened in today's terms without history notes.

## 3. Read first
- `docs/use/when-work-fails.md`, `docs/use/plan-work.md`, `docs/reference/state-and-phases.md`, `docs/reference/commands.md`, `docs/reference/files.md`
- varhop records listed above, plus the leaves' brief.md and review files
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list
Owns `docs/examples/recovery-story.md` only. No prerequisites. No shared test resource.

## 5. Do-not
See common.md.

## 6. Steps
1. Landing check (criterion 1).
2. Read the records, confirm D4 point by point.
3. Check each command named against `src/akrogon.ts` and `docs/reference/commands.md`.
4. Write the page, about 60-120 lines.
5. Run the three proof commands. Commit.

Advisory size: 1 file, under 15 turns.

## 7. Commands
The three proof commands in common.md.

## 8. Report
As in common.md.
