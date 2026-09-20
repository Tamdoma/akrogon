# Merged map: repo-slots

## Destination (both)
Optional `slots` field in issues/config.yaml with optional `a` and `b`, each a full {harness, model, effort}. Omitted seat inherits global. Repos without the field behave as today.

## Settled by evidence (no operator question)
- Harness templates, herdr integration install, max_active, toolkits stay global (both). install.ts:51 installs every global key, so a repo may pick any installed harness even if no global seat uses it (B).
- One shared resolver produces the effective A/B pair for both `akrogon config` and launch; the current shallow spread in effectiveConfig would hide the non-overridden seat (both).
- Validate the repo's harness key against the global registry in that resolver, so init refuses before its first write and dispatch refuses before allocating a worktree or tab (B; A had proposed launch-time only, B's argument that a bad config should not get past allocation wins).
- An override applies at the next agent start; running seats keep their session (B). No restart machinery.
- init.ts passes a proposal through repoSchema unchanged, so /init-issues can propose slots; the skill must preserve an existing stored override and never copy inherited effective values into the file (B, R1).
- Tests: fake herdr start argv for A and B, two repos with different overrides, no override, one seat, both, empty object, unknown harness, incomplete triple, wrong seat key, from main and from a linked worktree (B). Docs: setup.md, cheat.md, README config mention (both).

## Operator forks
Q1 Full triple per overridden seat (both recommend) vs field-level merge. Only convenience argues for merge; a harness swap inheriting a foreign model argues against.
Q2 Harness/model/effort selection only (both recommend) vs repo-specific launch flags too. Flags would need per-repo templates and install scanning.

## One leaf (both)
Owns src/config.ts, src/next.ts, src/init.ts, tests, skills/init-issues/SKILL.md, README, docs/guide/setup.md, docs/guide/cheat.md, AREA/index entries touched. Debate: no.
