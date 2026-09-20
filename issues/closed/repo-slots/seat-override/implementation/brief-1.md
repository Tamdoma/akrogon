# Brief 1: seat-override code and tests

## 1. Goal

Implement per-repo seat overrides per plan.md D1–D6: a strict optional `slots` field on `repoSchema`, one exported `seats` resolver, and its use in `launch`, `dispatchLeaf`, `initialize` and `effectiveConfig`, with the test coverage the leaf criteria require.

## 2. Acceptance criteria

1. `repoSchema` accepts optional `slots: { a?, b? }`, each a complete `{harness, model, effort}`; unknown seat keys, partial triples and `null` seats are rejected; `slots: {}` is accepted.
2. `seats(global, repo)` returns `{ a, b }` where each seat is `repo.config.slots?.<seat> ?? global.slots.<seat>` and throws an `Error` naming the repo name, the seat letter and the harness key when the chosen harness is absent from `global.harnesses`.
3. `akrogon config` inside a repo prints `slots` as the merged pair (overridden seat plus inherited seat), from the main checkout and from a linked worktree; outside a repo it prints the global pair.
4. `launch(global, repo, slot)` uses the resolver; fake-herdr `db.starts` argv for seats A and B reflect a repo override, including a model containing a space surviving as exactly one argv element, and inheritance for a non-overridden seat.
5. `akrogon init --from <proposal>` with an unknown harness in `slots` fails naming it and leaves `issues/config.yaml`, `.gitignore`, `issues/open`, `learnings` and the global registration unchanged; repeat `init` without a proposal keeps a stored override.
6. `akrogon next` on a repo whose override names an unknown harness exits non-zero naming repo, seat and harness before any worktree, tab or pane exists.
7. Tests cover: no override (existing tests), one seat, both seats, `slots: {}`, unknown harness, partial triple, wrong seat key, null seat, two repos with different overrides in one global config.

## 3. Read-first list

- `src/config.ts` — `slotConfigSchema` (line ~8), `globalSchema`, `repoSchema`, `Repo` type, `effectiveConfig`.
- `src/next.ts` — `launch` (current signature `launch(global, slot)`), its call site in `dispatchSlot`, and `dispatchLeaf`'s try block ending in `allocate`.
- `src/init.ts` — `initialize` ordering: parse → `readGlobal` → toolkit check → `repoName` → registered-name check → `checkGrounding` → writes.
- `src/routing.ts` — `Slot` is `'A' | 'B'` (uppercase); resolver keys are lowercase.
- `src/shell.ts` — `quote()` wraps values in single quotes; `parse` from `shell-quote` consumes them, so a quoted model is one argv element.
- `tests/helpers.ts` — `fixture()` global config (`harnesses: { fake: ... }`, seats `strong-a`/`strong-b`), `cli()`, `yaml()`, `fakeHerdr()`.
- `tests/fake-herdr.ts` — `db.starts` holds full `agent start` argv arrays (`args[2]` is the agent name, `flag('--pane')` the pane id).
- `tests/next.test.ts` — `dispatchFixture`, `database(f)`, `skips(result)`, multi-repo pattern (`fixture()` twice + `configure(f, { repos: ... })`).
- `tests/init.test.ts` — `snapshotInit`/`expectInitUnchanged` helpers.
- `tests/config.test.ts` — existing config print and linked-worktree patterns.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

`src/config.ts`:
- Add to `repoSchema`: `slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }).optional()`.
- Export `type SlotConfig = z.infer<typeof slotConfigSchema>`.
- Export `function seats(global: GlobalConfig, repo: Repo): { a: SlotConfig; b: SlotConfig }` resolving `repo.config.slots?.a ?? global.slots.a` (same for `b`), throwing `Error(\`Missing harness template "${harness}" for seat ${seat} in repo ${repo.name}\`)` when the resolved harness is not a key of `global.harnesses` (`seat` is the lowercase letter).
- `effectiveConfig`: after the existing spreads add explicit `slots: repo === null ? global.slots : seats(global, repo)` so the printed value is the merged pair, not the raw repo field.

`src/next.ts`:
- Import `seats` and type `SlotConfig` from `./config`.
- `launch(global, repo, slot)`: `const config: SlotConfig = seats(global, repo)[slot === 'A' ? 'a' : 'b'];` — keep the template fill, `quote()` calls and first-token check byte-identical.
- `dispatchSlot`: pass `repo` into `launch`.
- `dispatchLeaf`: inside the existing try, immediately before `const allocated = await allocate(...)`, add `seats(global, repo);` so an unknown harness is reported through the existing `report()` skip path before any allocation.

`src/init.ts`:
- Import `seats` from `./config`.
- In `initialize`, immediately before `checkGrounding(root, config)`, add `seats(global, { name: repoName, root, config });`.

`tests/config.test.ts` — new test(s):
- Schema negatives via `cli(f, ['config'])` after writing bad `issues/config.yaml`: `slots: { c: {harness,model,effort} }` (wrong seat key), `slots: { a: { harness: 'fake', model: 'x' } }` (partial triple), `slots: { a: null }` (null seat) — each exits non-zero. `slots: {}` exits 0.
- Repo with `slots: { a: {harness:'fake',model:'repo-a',effort:'low'} }`: `akrogon config` at root prints `slots.a.model: 'repo-a'` and `slots.b.model: 'strong-b'`; same from a linked worktree (`git worktree add`); `cli(f, ['config'], f.home)` prints the global pair.
- Two repos in one global config (second `fixture()` registered as `other` with a different override): `cli(f, ['config'], g.root)` prints g's merged pair.

`tests/next.test.ts` — new test(s):
- Leaf at `plan.positions` with both seats overridden (use a model containing a space, e.g. `'repo model a'`): after `next`, find each seat's start in `db.starts` by matching `flag('--pane')` position to `readState(path).pane.A`/`.B`; assert the start argv contains the override model as one element and `--kind` value `fake`. Override only seat `a` in a second scenario and assert B's start contains `strong-b`.
- Leaf at `plan.synthesis` with `slots: { b: { harness: 'ghost', model: 'm', effort: 'e' } }`: `next(f, ['slug'])` exits non-zero, `skips(result)[0].error` contains `'ghost'`, `'repo'` and `'b'`; `database(f).tabs` is empty, `database(f).panes` is empty, `readState(path).worktree` is undefined, `existsSync(resolve(f.root, 'issues/worktrees'))` is false.

`tests/init.test.ts` — new test(s):
- Proposal `slots: { a: { harness: 'ghost', model: 'm', effort: 'e' } }` (plus `grounding: 'none'`): `init --from` exits non-zero, stderr contains `'ghost'`; `expectInitUnchanged` holds against a pre-init snapshot.
- Proposal with a valid `slots` override: init succeeds, `issues/config.yaml` keeps it, repeat `cli(f, ['init'])` leaves `slots` intact.

## 5. Do-not, reasons and exceptions

- No field-level merge (a repo seat is a whole triple — design Q1); exception: none.
- No per-repo launch templates or flags; harness must come from the global registry (design Q2); exception: none.
- Do not change `globalSchema`, harness template filling, `quote()`, the first-token check, `src/install.ts`, `src/routing.ts` or anything under `issues/` — locked scope; exception: none.
- No provider or model validation, no running-seat restart — locked exclusions; exception: none.
- Do not edit docs (`README.md`, `docs/`, `skills/`, `src/AREA.md`) — owned by a later brief; exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B.

Restated: whole-triple seats and global-registry selection are locked; the launch path internals stay byte-identical except the seat source; docs and `issues/` are out of scope; conflicts come back as a mismatch, not a local decision.

## 6. Ordered steps

1. `tests/config.test.ts` schema negatives + merged-pair prints (criteria 1, 3, 7) — write tests, watch them red.
2. `src/config.ts` schema field, `SlotConfig`, `seats`, `effectiveConfig` (criteria 1–3) — green step 1.
3. `tests/init.test.ts` unknown-harness refusal + repeat-init preservation (criteria 5, 7) — red.
4. `src/init.ts` resolver call (criterion 5) — green step 3.
5. `tests/next.test.ts` override argv, inheritance, unknown-harness refusal (criteria 4, 6, 7) — red.
6. `src/next.ts` launch signature, call site, `dispatchLeaf` guard (criteria 4, 6) — green step 5.

Advisory size: about 6 files and under 30 turns.

## 7. Commands

```sh
AKROGON_BASE=329e59d951969f49008a2d7c2fab99c867d133c5 bun test --changed="$AKROGON_BASE"
bun test tests/config.test.ts tests/init.test.ts tests/next.test.ts
```

Run from the worktree root. The second command is the targeted surface, not the full suite; B runs the full suite separately.

## 8. Done-when, evidence and report

All criteria green under the section 7 commands with pasted results. For akrogon command work, scenarios use temporary repositories, real files/processes and herdr replaced at the fake-herdr boundary — no real panes, install roots or herdr socket.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
