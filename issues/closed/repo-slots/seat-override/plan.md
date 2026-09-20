# Plan: seat-override

## Decisions

- D1: Whole-seat override. `repoSchema` gains `slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }).optional()`. A repo seat is a complete `{harness, model, effort}` triple; no field-level merge (design Q1 "1a").
- D2: Selection only. The override picks harness, model and effort; the harness key must exist in the global `harnesses` registry. No per-repo launch templates or flags (design Q2 "2a").
- D3: One resolver `seats(global: GlobalConfig, repo: Repo): { a: SlotConfig; b: SlotConfig }` in `src/config.ts`: `repo.config.slots?.a ?? global.slots.a`, same for `b`; throws `Error` naming `repo.name`, the seat letter and the missing harness key when the chosen harness is absent from `global.harnesses`.
- D4: `launch` in `src/next.ts` becomes `launch(global, repo, slot)` reading `seats(global, repo)[slot === 'A' ? 'a' : 'b']` (`Slot` is uppercase at `src/routing.ts:14`, resolver keys lowercase). Template fill, `quote()` and the first-token check stay unchanged.
- D5: `effectiveConfig` prints `slots` as the resolver result inside a repo (main checkout and linked worktree), the global pair outside a repo.
- D6: `initialize` calls `seats(global, { name: repoName, root, config })` before `checkGrounding` so a bad harness fails before any write. `dispatchLeaf` calls `seats(global, repo)` before `allocate` so a bad harness fails before worktree, tab or pane creation; the throw is caught by the existing `report()` path and exits 1.
- D7: Locks. Repos without `slots` behave exactly as today; no new phase, command, watcher or file; harness templates, Herdr integration install, `max_active` and `toolkits` stay global; override applies at next agent start, running seats untouched; no file under `issues/` changes.

## Read first

- `src/config.ts` — `slotConfigSchema`, `globalSchema`, `repoSchema`, `Repo`, `effectiveConfig`.
- `src/next.ts` — `launch` (current signature `launch(global, slot)`), `dispatchSlot` call site, `dispatchLeaf` try/report path.
- `src/init.ts` — `initialize` ordering: parse, `readGlobal`, name check, `checkGrounding`, writes.
- `src/routing.ts` — `Slot` is `'A' | 'B'`.
- `src/shell.ts` — `quote()` wraps every value in single quotes; `writeYaml`.
- `tests/helpers.ts` — `fixture()` global config shape, `cli()`, `yaml()`, `fakeHerdr()`.
- `tests/fake-herdr.ts` — `db.starts` records full `herdr agent start` argv; `shell-quote` parse consumes quotes, so a quoted model lands as one argv element.
- `tests/next.test.ts`, `tests/config.test.ts`, `tests/init.test.ts` — existing patterns: `dispatchFixture`, `database(f)`, `snapshotInit`/`expectInitUnchanged`.
- `docs/guide/setup.md` ("Repo config" list), `docs/guide/cheat.md`, `README.md` (machine-config paragraph ~line 68), `skills/init-issues/SKILL.md` (proposal block), `src/AREA.md`, `tests/docs-links.test.ts`.

## Interfaces

```ts
// src/config.ts
repoSchema.slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }).optional()

export function seats(global: GlobalConfig, repo: Repo): { a: SlotConfig; b: SlotConfig }
// resolves repo.config.slots?.<seat> ?? global.slots.<seat>;
// throws Error naming repo.name, seat letter and harness key when harness not in global.harnesses

// src/next.ts
function launch(global: GlobalConfig, repo: Repo, slot: Slot): { kind: string; args: string[] }
```

## Checklist

1. `src/config.ts`: add `slots` to `repoSchema` (D1); export `seats` (D3); `effectiveConfig` prints `slots: seats(global, repo)` when `repo !== null`, else `global.slots` (D5). Criteria 1, 2, 4.
2. `src/next.ts`: `launch(global, repo, slot)` via `seats` (D4); update the `dispatchSlot` call site; call `seats(global, repo)` in `dispatchLeaf` immediately before `allocate` (D6). Criteria 3, 6.
3. `src/init.ts`: call `seats(global, { name: repoName, root, config })` after `readGlobal` and before `checkGrounding` (D6). Criterion 5.
4. `tests/config.test.ts`: schema negatives — unknown seat key, partial triple, `null` seat, plus `slots: {}` accepted; `akrogon config` prints merged pair (override + inherited seat) from root and a linked worktree, global pair outside; two repos with different overrides in one global config. Criteria 1, 4, 7.
5. `tests/next.test.ts`: repo override on both seats → `db.starts` argv for A and B reflect override, including a model with a space asserting it survives `quote()` as one argv element; non-overridden seat inherits global; unknown-harness override → `next` exits non-zero naming repo/seat/harness with no worktree, tab or pane. Criteria 3, 6, 7.
6. `tests/init.test.ts`: `init --from` with unknown harness in `slots` fails naming it and `expectInitUnchanged` holds; repeat `init` without proposal keeps a stored override. Criteria 5, 7.
7. `skills/init-issues/SKILL.md`: proposal block lists `slots` as optional; repeat setup preserves a stored override; never copies inherited effective seats into the proposal. Criterion 8.
8. `docs/guide/setup.md`: "Repo config" list gains a `slots` line with example and the next-start rule. `docs/guide/cheat.md`: show the field with example and next-start rule. `README.md`: machine-config paragraph says a repo may override seats. `src/AREA.md`: name the `seats` resolver. Criterion 9.
9. Verify: `bun test tests/config.test.ts tests/init.test.ts tests/next.test.ts tests/docs-links.test.ts`, `bun run typecheck`, `bun run format`, full `bun test`; `git status --porcelain issues/` empty. Criterion 10.

## Docs affected

- `skills/init-issues/SKILL.md` — proposal block and repeat-setup rule.
- `docs/guide/setup.md` — Repo config list.
- `docs/guide/cheat.md` — config field example.
- `README.md` — machine-config paragraph.
- `src/AREA.md` — resolver mention.
- `docs/reference-index.md` — only if a pointer changes; expected unchanged.

## Verification

- `bun test tests/config.test.ts tests/init.test.ts tests/next.test.ts` — new coverage green.
- `bun test tests/docs-links.test.ts` — doc links/anchors resolve.
- `bun run typecheck && bun run format` — clean.
- `bun test` — full suite green.
- `git status --porcelain issues/` — empty on the leaf branch.

## Open limitations

- Override applies at next agent start; already-running seats keep their launch config (locked).
- `akrogon next` surfaces an unknown-harness override through the per-leaf `report()` skip path (exit 1, stderr JSON naming repo/seat/harness), not a startup-fatal error.
