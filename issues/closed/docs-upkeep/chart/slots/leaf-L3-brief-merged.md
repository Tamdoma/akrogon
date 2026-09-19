# Brief: index-entry-points

## What
`docs/reference-index.md` in mdcny-ghl-data-pulls links the repository's real entry points, one line per area, and no longer points at a folder that does not exist.

## Why
The index is still the three-line scaffold from setup (config, `issues/open/`, lessons). `issues/open/` does not exist, and none of the code (`src/run.ts`, `src/dispatch.ts`, `src/ghl`, `src/grid`, `src/sheets`, `scripts/`, `docs/user`) is reachable from it, so planning agents start blind.

## Done-criteria
1. The index has one row per area that exists today: the run entry (`src/run.ts`, `src/index.ts`), dispatch and week logic, `src/ghl`, `src/grid`, `src/sheets`, `scripts/`, `docs/user`, `issues/config.yaml`, `learnings/LESSONS.md`; each row is one line saying what the area is for and links a real path.
2. The `issues/open/` row is removed, or retargeted to `issues/` if that folder is worth a row.
3. One shell command from the repo root proves every linked path exists; command and output are in the report.
4. An `AREA.md` is added only for a folder that one index line cannot explain (the report says which, or that none was needed), with the four sections Commands, Key files, Non-obvious patterns and See also and at most 40 lines.
5. No other file changes. The configured checks pass.

Env values needed: none.
