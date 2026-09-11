# Brief: dead-fields

## What
`priority` and `slot` are removed from the state schema, from every writer, from the chart door templates and from status output. `readState` drops exactly these two legacy keys before the strict parse so existing files keep loading, and every later `saveState` writes them out without the keys.

## Why
Nothing reads either field; keeping them is machinery with no consumer (operator decision dead-fields-delete). Leaf branches may not edit `issues/`, and the root binary keeps running during merge, so files migrate on their next write instead of by a bulk edit.

## Done-criteria
1. `grep -rn "priority" src skills/chart-issues tests` returns no hits, and `slot` survives only as the CLI `--slot` flag, the lifecycle `Slot` type and log/verdict fields; a test proves a file with `priority` and `slot` parses and is rewritten without them, and a file with any other unknown key is still rejected.
2. `skills/chart-issues/assets/shapes.md` state template and `skills/chart-issues/SKILL.md` handoff batch sentence no longer mention priority.
3. `akrogon status` against the fixtures and this repo's existing state files runs clean.
4. `bun run format`, `bun run typecheck`, `bun test` pass.
