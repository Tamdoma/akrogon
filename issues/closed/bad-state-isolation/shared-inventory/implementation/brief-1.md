# Brief 1 (unit U1): the shared leaf inventory in src/state.ts

## 1. Goal

Implement plan decisions D1–D3: one leaf-state inventory in `src/state.ts` returning readable leaves plus retained failures; every other walk in the repo is deleted in later units. Leaf slug: shared-inventory. You own exactly `src/state.ts`.

## 2. Numbered acceptance criteria

AC1 `readInventory(path, areaRoot)` walks a subtree: a directory containing an entry named `state.yaml` is a leaf folder — `validateLeafDepth(areaRoot, path)` then `readState(path)` are attempted; on success the leaf appends to `leaves`, on any thrown error the folder appends `{path: <leaf folder>, error: <message>}` to `unreadable` and the walk does not throw. A directory `readdirSync` throws on appends `{path: <dir>, error: <message>}` to `unknown` and recursion skips it. A missing path returns an empty inventory.

AC2 `repoInventory(repo, areas)` walks each named area (`'open'`, `'closed'`, `'parked'` — default `['open','closed']`) under `resolve(repo.root, 'issues', area)`, with the area root as `areaRoot`. A parsed leaf with `state.repo !== repo.name` moves to `foreign` as `{path: <leaf folder>, stored: state.repo}` instead of `leaves`. Readable slugs appearing more than once across the result are removed from `leaves` and each such folder appends to `unreadable` with error `Duplicate leaf slug: <slug>`.

AC3 `allLeaves(repo)` returns `repoInventory(repo).leaves`; `leavesUnder(path, areaRoot)` returns `readInventory(path, areaRoot).leaves`. Both keep their exported signatures and never throw on a bad leaf.

AC4 `findLeaf(repo, slug)` finds leaf folders whose folder name equals `slug` under `issues/open` then `issues/closed` without reading their states, reads exactly those folders, and: no match → `missingLeafMessage(repo, slug)` (which keeps its parked suffix via the existing `isParked`); more than one match → `Duplicate leaf slug: <slug>`; a bad `state.yaml` → that leaf's own `readState` error propagates; `state.repo !== repo.name` → `RepoMismatchError`; `state.slug !== slug` → `Leaf slug mismatch at <path>: folder "<name>", state slug "<slug>"` (IN4). A bad sibling is never read.

AC5 `readState` deletes the 4-key filter (`priority`, `slot`, `failed_notified`, `solo`) and the `withoutEmptyMembers` helper and shim entirely — strict `stateSchema` rejects them. `readFileSync` errors become `Cannot read state at <file>: <msg>`; YAML parse errors become `Invalid state <file>: <msg>` (IN3); the existing `Invalid state ${file}` Zod wrap stays.

AC6 `inventoryFailures(inv: Inventory): { ownedNames: Set<string>; incomplete: boolean }` returns `ownedNames = new Set(inv.unreadable.map(f => basename(f.path)))` and `incomplete = inv.unknown.length > 0`. Consumers (next.ts, reconcile.ts) use it in later units.

AC7 The rewritten tests pass: `bun test tests/state.test.ts` — retired-key cases now throw the leaf's own error naming its file; depth cases read `repoInventory(repo).unreadable`; `allLeaves`/`leavesUnder`/`findLeaf` parked cases stay green.

## 3. Read-first list

- `src/state.ts` (whole file — the file you edit).
- `src/next.ts:109–190` — today's `Inventory`/`discover` walk; your `readInventory`/`repoInventory` is this same walk plus per-entry failures and the repo/duplicate checks. Copy its traversal semantics (entries-named-state.yaml leaf detection, unknown on `readdirSync` failure and on area-root stat failure, missing area skipped silently).
- `tests/state.test.ts` — rewritten expectations including `repoInventory` import.
- `src/config.ts` `type Repo` (`{name, root, config}`) — accept `Pick<Repo,'name'|'root'>` in `repoInventory`.
- `skills/implement-issue/ponytail.md` (in the worktree checkout at `skills/implement-issue/ponytail.md`).

## 4. Change list and needed interfaces

File owned: `src/state.ts` only.

Add and export:

```ts
export type LeafFailure = { path: string; error: string };
export type ForeignLeaf = { path: string; stored: string };
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function readInventory(path: string, areaRoot: string): Inventory;
export function repoInventory(repo: Pick<Repo, 'name' | 'root'>, areas?: readonly string[]): Inventory;
export function inventoryFailures(inv: Inventory): { ownedNames: Set<string>; incomplete: boolean };
```

Rewrite `allLeaves`, `leavesUnder`, `findLeaf`, `readState` per AC3–AC5. Reuse `hasSlugFolder` internals (a recursive folder-name matcher that does not read state) for `findLeaf` — extract `slugFolders(repo, slug)` used by both `hasSlugFolder` and `findLeaf`; `readdirSync` failures inside it count as no match. Keep `isParked`, `hasLeafFolder`, `missingLeafMessage`, `validateLeafDepth`, `saveState`, `withLock`, schemas unchanged.

## 5. Do-not, reasons and exceptions

- Do not edit any file outside `src/state.ts` — later units own their files; touching them collides with parallel workers. Exception: none; a need outside returns a mismatch.
- Do not make `repoInventory` or `readInventory` throw on a bad leaf — contained failures are the point; exceptions are only for programming errors (non-`Error` throws propagate, matching `discover` today). Exception: none.
- Do not keep any strip/migration code in `readState` — Taken 2a deletes it; silent passthrough violates the brief. Exception: none.
- Do not write or edit tests — planned tests belong to A. A planned test that cannot pass returns a mismatch with the failing output, never a test edit.
- Do not rename exported symbols other than additions listed — call sites migrate in later units. Exception: none.

Restating: contained failures, deleted shims, single-file diff, no test edits, no renames; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 1 file, under 12 turns.

1. `src/state.ts`: add types + `readInventory` + `repoInventory` + `inventoryFailures` (AC1, AC2, AC6); extract `slugFolders` helper shared with `hasSlugFolder`.
2. `src/state.ts`: rewrite `allLeaves`, `leavesUnder`, `findLeaf` (AC3, AC4); rewrite `readState` (AC5) deleting `withoutEmptyMembers` and the key filter.
3. Run `bun test tests/state.test.ts` (AC7) and `bun run typecheck` — note typecheck will still fail in untouched callers (`status.ts` references `stateSchema`, `next.ts` has its own `Inventory`); that is expected until later units land, but `src/state.ts`'s own code must typecheck cleanly. Use `bunx tsc --noEmit` on the file if easier, and report the remaining caller errors verbatim.
4. Run `bun test tests/state-inventory.test.ts -t 'no module outside'` — still red (other files unchanged); not yours to fix.
5. Commit your change on the branch; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u1-state -- bun test tests/state.test.ts`
- `bun run typecheck` (informational; report remaining errors outside src/state.ts verbatim)

The leaf worktree is the checkout you run in; `bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

`tests/state.test.ts` all green through run-check; `src/state.ts` has no throw paths for bad leaves in the walk functions; the diff touches only `src/state.ts`. Report the commit ID, changed files and reasons, tests run with results, remaining typecheck errors outside `src/state.ts`, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
