# Brief: merged-siblings-rule

## What
Rewrite the "Merged still under open" rule in the watch-issues Judge section so a merged leaf whose top-level owner folder still holds an unmerged leaf is reported as waiting on siblings with no `akrogon next`, and `next` runs once, followed by re-observation and the existing command-error rule, only when every leaf of the owner is merged and the folder still sits under `issues/open`. Prose only.

## Why
Completion is per top-level owner (`src/phase.ts:138-176`), so a merged leaf legitimately stays under open until its siblings merge. The current rule runs `next` every tick, which returns silently and then sweeps dispatch across every registered repo (`src/next.ts:525-527,664-672`), and reports a completion error that does not exist. Tamdoma/akrogon#28.

## Done-criteria
1. `skills/watch-issues/SKILL.md` Judge section: the "Merged still under open" bullet is replaced by prose stating, in this order: read the state files beneath the leaf's top-level owner folder under `issues/open` (an issue or an epic); if any is not merged, report waiting on siblings and run no `next` for this leaf; if all are merged, run `akrogon next <slug>` once this fire, re-observe, and use the command-error rule for a failure; remaining under open alone is not an error; unreadable sibling state is reported as a gap, not treated as complete.
2. The wording names the top-level folder as the owner, so an epic's leaf is grouped with leaves of sibling issues, not only its immediate issue.
3. `skills/watch-issues/scripts/observe.ts`, its test, `src/`, `tests/`, `docs/` and every other skill are unchanged; the observe line format is unchanged.
4. No new heading, field, command or file; the Never list is unchanged and the new prose does not conflict with it (read-only tree read, no `issues/` edits).
5. `bun test` from the repo root and `bun test` inside `skills/watch-issues` pass; the docs-links test passes.

Credentials: none.
