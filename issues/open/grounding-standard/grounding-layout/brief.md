# Brief: grounding-layout

## What
Set the grounding standard in this repo and in the skills that initialize and maintain others. The operator guide moves from `docs/` to `docs/guide/`. The planner index moves from `REFERENCE.md` to `docs/reference-index.md`. `src/`, `skills/` and `tests/` each get an `AREA.md` of 25 to 40 lines with four sections: Commands, Key files, Non-obvious patterns, See also. init-issues proposes `docs/reference-index.md` as the default index and writes an `AREA.md` for each area it cannot describe in one index line. implement-issue names `AREA.md` and its line cap in its existing update-affected-docs rule. check-issue gains a diff-scoped rule: for each `AREA.md` in the reviewed diff, list the paths it names and report the missing ones.

## Why
Planners today read code to build a read-first list because the index links bare folders. Measured results across four 2026 studies and Meta's production rollout put per-module files of this shape at 20 to 40 percent fewer tokens and tool calls per pass on repos an agent cannot read in one go, with no correctness change. Overviews and folder listings gave nothing, so the shape and cap are the point. Nobody owns per-directory docs, so the maintenance rule lives in the implementer that already updates affected docs, and the dead-path check lives in review with zero extra file reads.

## Done-criteria
1. `docs/guide/` contains every page and `style.css` formerly under `docs/`, pages link each other unchanged, and `docs/*.html` no longer exists.
2. The four Playwright specs under `tests/browser/` resolve `docs/guide/` and `bun run typecheck` plus `bun test` pass.
3. `docs/reference-index.md` exists with one line per area, linking `src/AREA.md`, `skills/AREA.md` and `tests/AREA.md` and the remaining folders; the root `REFERENCE.md` no longer exists.
4. `issues/config.yaml` `grounding.index`, the README index link and the setup page's example name `docs/reference-index.md`; a repo-wide search outside `issues/` and `learnings/` finds no other reference to the old index filename.
5. `src/AREA.md`, `skills/AREA.md` and `tests/AREA.md` each have exactly the four sections, at most 40 lines, and every path they name exists.
6. `skills/init-issues/SKILL.md` proposes `docs/reference-index.md` as the default index and instructs writing an `AREA.md` in the four-section shape, at most 40 lines, for each area it cannot describe in one index line; the sentence forbidding area documents is gone.
7. `skills/implement-issue/SKILL.md` line for updating affected docs names `AREA.md`, the four sections and the 40-line cap.
8. `skills/check-issue/SKILL.md` check.review section instructs: for each `AREA.md` present in the reviewed diff, list its named paths with one shell command and record missing ones as a Fix; area files absent from the diff are not opened.
9. Any guide page that describes the index, area docs or the docs location states the new layout; `docs/guide/setup.html` shows `docs/reference-index.md`.
