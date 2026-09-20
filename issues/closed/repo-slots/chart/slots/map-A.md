# Map A: repo-slots

## Destination
A repo's issues/config.yaml may override the seat launch (harness, model, effort) for A and/or B. Repos without the field behave exactly as today.

## Forks
Q1 Where do harness templates live? Global only (recommended): src/install.ts:51 installs one herdr integration per global harness key, and next.ts:222 checks argv[0] equals the harness key. A repo override names a harness by key. Per-repo templates would need install to read every repo config. Cost of global-only: a repo cannot invent a new harness, it can only pick one.

Q2 Override shape? Nested `slots: { a?, b? }` each a full {harness, model, effort} (recommended): reuses slotConfigSchema from src/config.ts:9, one lookup `repo.config.slots?.a ?? global.slots.a`. Alternative: per-field merge (override only model). Fewer characters per repo but three-way merge logic and a config that is not readable on its own.

Q3 When is a bad harness reference rejected? At launch in next.ts (recommended): the only consumer, error names repo, seat and harness. Alternative: in readRepo, which lacks global today and is called from pull.ts and currentRepo; adding a parameter spreads the change across three files for a check that only matters at dispatch. Pitfall: launch-time means `akrogon status` does not warn. Acceptable, `akrogon config` shows the value.

Q4 What does `akrogon config` print? effectiveConfig at src/config.ts:117 spreads repoConfig over global, so a partial repo `slots` would hide the global seat it does not override. Print the merged seats (recommended) so the printed config is the config dispatch uses.

## Stays global (off route)
max_active is a machine seat cap across repos. toolkits are already used only by init. checks are already per repo.

## Pitfalls
- launch(global, slot) at next.ts:218 gains a repo argument; callers at dispatch already hold repo.
- tests: helpers.ts fixture unaffected (field optional); add a next test where repo b overrides and the fake herdr start args show the override, and one where a repo names an unknown harness and next fails naming it.
- docs: setup.md and cheat.md get the block, README config mention if any.
- init: proposal YAML passes through repoSchema unchanged, so /init-issues can propose slots with no init.ts change.
