# Direct plan: consultant-recipe

Task: chart fork forks/refusal-boundary.md `## Taken` items 1-6 (no separate brief or design; the direct route reads the chart in place). One unit, serial-solo, A implements.

1. Tests first, committed: fixtures with a consultant recipe (tests/helpers.ts and every machine config built from scratch, incl. e2e tiers), new refusal case in tests/config.test.ts (red on base), hc-core missing-recipe test removed from tests/watch-consult.test.ts.
2. Code: `globalSchema` requires `slots.consultant`; `superRefine` iterates `config.slots` with no undefined guard; `effectiveConfig` prints consultant plainly; `src/akrogon.ts` seat throw deleted (and its now-unused imports).
3. Docs and skill: docs/reference/config.md, docs/reference/commands.md, docs/start/install.md, skills/watch-issues/SKILL.md `## Consult` sentence.
4. Proof: targeted tests, then `akrogon verify --holder <chart>/direct`.

## Implementation notes

- 2026-11-25: tests/rollback.test.ts builds a pinned pre-2026-11-21 release (6121559e) whose strict `slots` schema refuses `consultant`; the case strips the key before that release's install, as tests/deploy-fixture.ts already strips `prefixes` for the same reason. Refines Taken item 4 (fixtures), no decision changed.
