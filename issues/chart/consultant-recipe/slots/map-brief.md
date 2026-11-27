# Opening map brief (chart consultant-recipe)

You are a consultant for the chart door in hc terminal t126. Map blind: do not read other seats' map files. Edit no repo file except your return file.

Reading rule (binds you): read process text by named section for the step you answer. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, or content lost to compaction stays readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Inputs

- Intake: issues/chart/consultant-recipe/INTAKE.md
- Signposts (binding direction for this chart): issues/chart/consultant-recipe/forks/signposts.md
- Live surface: src/config.ts (globalSchema, readGlobal, the config printer), src/akrogon.ts (case 'seat'), src/init.ts, src/state-home.ts (migrateStateHome), skills/watch-issues/SKILL.md (## Consult), skills/watch-issues/scripts/, docs/reference/config.md, docs/reference/commands.md, tests/watch-consult.test.ts, tests/config.test.ts, tests/helpers.ts, docs/reference/releases-and-updates.md.
- Locks: none from seeds. Earlier A autopilot pick (not an operator answer) that made the key optional: issues/chart/watch-consultants/forks/fix-and-config.md items 6, 7, 7'.

## Task

Write an independent territory map, proportional to a small fix: the material forks that change the outcome (start with where the missing key is refused), the options for each with what each could break or invite later, the pitfalls over the change's lifetime and what removes each, every surface (code, tests, docs, skill text) the change must touch, and any question a practitioner would ask. Cite file and function for each claim.

## Return

Write issues/chart/consultant-recipe/slots/map-<your slot letter lowercase>.md, then run:
hc send t126 "done <your slot letter>: <return path>"
