# Design: docs-impact-rule

## Binding decisions, verbatim

Round 1, Q1 (taken 2026-09-19, operator "1a"): When the planning agent writes the plan, it adds one line per affected doc, agent and human, found by reading the index and README. The implementer treats those lines as tasks. The reviewer checks them against the diff. Reason: three sentences in three skills, no config, no code. Foreclosed: a config list of doc paths.

Round 1, Q2 (taken 2026-09-19, operator "2a"): The reviewer starts from what the code change did, opens the doc page that describes that behavior even if it wasn't changed, and files a Fix if a claim is now wrong or a path is dead. If nothing documented changed, the report says so in one line. The "open no area file outside that diff" restriction is revised. Foreclosed: implementer-only wording.

Round 1, Q3 (taken 2026-09-19, operator "3a"): Two small leaves, one in pi-extensions and one in mdcny, each fixing its own index. Foreclosed: deferring the repair.

Round 1, Q4 (operator 2026-09-19: "4 - the init command must establish the docs structure if it doesn't exist. Akrogon attaches to the repo by creating the docs/, the reference-index file and mapping out AREA.md files. Otherwise it can't work efficiently. Challenge me and ask slot B if this is good", then after the challenge "4a"): The init-issues skill must produce the map (reuse or create a top index linking real entry points, AREA files only where one index line is not enough, verify targets, put the index path in the proposal) before reporting setup complete. `akrogon init` refuses a declared index that is not a readable non-empty regular file, before writing config, scaffolding or registering, naming the path and pointing to init-issues. `.default('none')` is removed so `none` is only ever explicit. Boulevard is re-grounded by the operator running init-issues again. Foreclosed: the command creating docs/, the index or AREA files itself; a recursive mandatory AREA inventory; a new config key; automatic repair of consumer docs; rejecting existing explicit `none` configs.

Session locks: no watchers, hooks or programs that edit docs; leaf branches carry code only, never `issues/`; `.env` and `.env.*` are never opened, printed or written by a tool.

Applicable here: Q1, Q2, Q4 in full; Q3 excluded, it belongs to the pi-extensions and mdcny leaves.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no auth, secrets or user-visible browser flow. Negative tests are mandatory: the refusal cases in criterion 7 are the edge cases. The verification command exercising the flow end to end is `bun test tests/init.test.ts` against a temporary git repo fixture, as the existing init tests do. No env values.

## Leaf architecture

Owned surfaces: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/init-issues/SKILL.md`, `src/init.ts`, `src/config.ts` (grounding schema and `effectiveConfig` only (B)), `tests/init.test.ts`, `tests/config.test.ts`, (B) the grounding lines of `tests/helpers.ts` and of the sync, pull, phase, next and state tests that write a repo config, `README.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`, plus any AREA.md or index row those changes make stale.

Interfaces:
- `src/init.ts` `initialize(cwd, proposal, toolkit)`: after `repoSchema.parse` (line 18) and before `writeRepoConfig` (line 31), when `config.grounding !== 'none' && config.grounding.index !== undefined`, read `resolve(root, index)` with `readFileSync`; (B) a filesystem error (ENOENT, EISDIR, EACCES) or empty contents becomes `Error(\`Grounding index is not a readable non-empty file: <path>. Complete setup with the init-issues skill.\`)`, the only place in this leaf where a caught error is rethrown, and it carries the original code. One small function in `src/init.ts`; no new module. (A, held) No unreadable-file test is required: `readFileSync` proves readability by construction and a chmod-based test depends on the runner's privileges.
- `src/config.ts`: `grounding: z.union([z.literal('none'), z.object({...})])` with no `.default`. The object's `index` stays optional so an index-less object remains legal; the command checks only a declared index. (B) `effectiveConfig` (src/config.ts:123) parses `{ grounding: 'none' }` instead of `{}` for an unregistered directory, so machine-only configuration stays readable without accepting omitted grounding in a persisted repo config.
- Skill prose: one to three sentences per skill, in the existing paragraphs at plan-issue:25 and :55, implement-issue:27, check-issue:33-35, init-issues:56-60 and the Initialize and verify section. No new sections, no new files.

Existing behavior kept: repeat init reuses the existing `issues/config.yaml`, which already carries an explicit grounding value written by earlier runs, so it still parses. `init-issues` remains the only mapper; the command never creates docs/, an index or AREA files.

Exclusions: `grounding.docs`, `surfaces`, `indexed_scopes` stay unread and unchanged; no consumer for them. No hook, watcher or program. No edits to `chart-issues`, `merge-issue`, `seed-issue`, `broadcast-issue`, `watch-issues`, `plugin/`, `config.yaml`, `issues/`. No change to `akrogon status`, `next` or routing. No re-grounding of boulevard inside this leaf.

Dependencies: none.
