# Brief: seat-override

## What
`issues/config.yaml` accepts an optional `slots` field with optional `a` and `b`, each a complete `{harness, model, effort}`. A seat present there replaces the global seat for that repo; an absent seat inherits. One resolver returns the effective A/B pair and is used by `akrogon config` and by dispatch launch. A repo seat naming a harness absent from the global `harnesses` registry is refused by `akrogon init` before any write and by `akrogon next` before any worktree, tab or pane allocation, naming repo, seat and harness. Repos without the field behave exactly as today.

## Why
The global config fixes one seat pair for every registered repo. Some repos need a different model, effort or harness for a seat without changing the machine default.

## Done-criteria
1. `repoSchema` in `src/config.ts` gains optional `slots: { a?, b? }` reusing the existing seat triple schema, strict: unknown seat keys, partial triples and null are rejected.
2. A single exported resolver in `src/config.ts` returns the effective `{a, b}` for a repo from global and repo config and throws naming repo, seat and harness when the repo harness key is not in `harnesses`.
3. `launch` in `src/next.ts` uses the resolver; `bun test tests/next.test.ts` shows fake-herdr start argv for A and B reflecting a repo override, including a model value that needs quoting, and inheritance for the non-overridden seat.
4. `akrogon config` inside a repo prints the merged `slots` pair (overridden seat plus inherited seat), from the main checkout and from a linked worktree; outside a repo it prints the global pair.
5. `akrogon init --from <proposal>` with an unknown harness in `slots` fails naming it and leaves `issues/config.yaml`, `.gitignore`, `issues/open`, `learnings` and the registration unchanged; repeat init without a proposal keeps an existing stored override.
6. `akrogon next` in a repo whose override names an unknown harness fails before creating a worktree, tab or pane.
7. Tests cover: no override, one seat, both seats, empty `slots: {}`, unknown harness, partial triple, wrong seat key, null seat, two repos with different overrides in one global config.
8. `skills/init-issues/SKILL.md` proposal block lists `slots` as optional, preserves an existing stored override on repeat setup, and never copies inherited effective seats into the proposal.
9. `docs/guide/setup.md` "Repo config" list and `docs/guide/cheat.md` show the field with an example and the next-start rule; `README.md` machine-config paragraph says a repo may override seats; `src/AREA.md` names the resolver; `bun test tests/docs-links.test.ts` passes.
10. Full suite `bun test` passes; no file under `issues/` changes on the leaf branch.

## Credentials
None.
