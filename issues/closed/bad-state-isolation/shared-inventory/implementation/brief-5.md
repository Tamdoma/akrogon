# Brief 5 (unit U5): src/reconcile.ts on the shared inventory

## 1. Goal

Implement plan decision D6 (+IN2): `reconcile` treats a failure leaf's folder basename as owned — its worktree, tab and slice are kept; an unreadable directory (`unknown`) makes the repo inventory unprovable and the pass conservative. `collectSlugs`'s private walk is deleted. Leaf slug: shared-inventory. You own exactly `src/reconcile.ts`.

## 2. Numbered acceptance criteria

AC1 Signature (IN2, required by embedded test calls): `reconcile(repo: Repo, leaves: Leaf[], live: Pane[] | null, failures?: { ownedNames: ReadonlySet<string>; incomplete: boolean })`. `reconcileNeedsPanes(repo, leaves)` is unchanged. Callers in `next.ts` pass `inventoryFailures(discover(repo, inv))`.

AC2 `collectSlugs` is deleted. `knownSlugs` = `new Set(leaves.map(l => l.state.slug))` plus `failures?.ownedNames` entries. `matchSlug`/`leafBySlug` keep working on the same sets; `failures.incomplete === true` forces the conservative keep wherever the code would otherwise drop an unproven candidate — the precise behavior is: the `unknown directory`/`unknown leaf ownership` keep applies to `!leafSlugs.has(name) && knownSlugs.has(name)` exactly as today, and `incomplete` adds `keep(path, 'leaf inventory unavailable: <dirs>', 'restore readable repository leaf records and retry cleanup')` (same wording as `reconcileHost`'s `inventoryErrors` branch) for unregistered candidate entries that have no leaf claim, replacing `dropUnowned`/unmanaged decisions. Unreadable leaf folders themselves are owned: their `<basename>`-named store entries take the `unknown directory` keep branch (already the designed wording for an owned-but-unproven entry).

AC3 `ownerCompletes(repo, leaf)`: the `leavesUnder` calls become `readInventory(issue, open)`/`readInventory(owner, open)`; any `unreadable`/`unknown`/`foreign` entry inside the owner's subtree returns `false` (same blocking rule U4 lands in `src/phase.ts`).

AC4 `reconcileHost`: the `allLeaves(repo)` loop becomes `repoInventory(repo)`; `leafOf` is populated from `inventory.leaves` keyed by `leafSlice(repo, slug)`; a separate `badSlices` set gets `leafSlice(repo, basename(f.path))` for each `f` in `inventory.unreadable` (folder basename is the unreadable leaf's only name). `inventoryErrors` collects a message per repo with any `unreadable`/`unknown`/`foreign` entries (join each `f.path: f.error`). Slice rules: `leafOf` match → existing `sliceKeepReason`; `badSlices` match → `keep(slice, 'unreadable leaf state', 'restore the leaf state.yaml and retry cleanup')`; then `own`, then `inventoryErrors.length > 0` conservative keep as today.

AC5 `src/reconcile.ts` contains no `state.yaml`/`stateSchema` literal and no `readdirSync` walk over `issues/open|closed` — `readdirSync` stays for `/proc`, worktree store, scratch, `.claude/worktrees`, `.owner` files etc.; only the leaf-state walk goes. `readState` import stays (state writes).

AC6 `bun test tests/reconcile.test.ts tests/store-sweep-safety.test.ts tests/release-any-phase.test.ts` all green — the embedded `reconcile(r, allLeaves(r), …)` calls must still run under the new optional parameter.

## 3. Read-first list

- `src/reconcile.ts:245–260` (`ownerCompletes`), `:383–445` (`reconcileNeedsPanes`), `:444–515` (`reconcile` head + `collectSlugs`), `:855–1000` (candidate loop using `knownSlugs`/`matchSlug`/`leafBySlug`), `:1140–1240` (`reconcileHost` + `inventoryErrors`).
- `src/state.ts` — `readInventory`, `repoInventory`, `inventoryFailures`, `allLeaves`, `Inventory`, `LeafFailure` (landed version).
- `tests/reconcile.test.ts:95–140` (helpers `dispatchLeaf`, `keptReport`), `:1030–1090` (embedded `reconcile` subprocess call — signature compatibility proof).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

File owned: `src/reconcile.ts` only.

Interfaces consumed (landed in src/state.ts):

```ts
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function readInventory(path: string, areaRoot: string): Inventory;
export function repoInventory(repo: Pick<Repo,'name'|'root'>, areas?: readonly string[]): Inventory;
export function inventoryFailures(inv: Inventory): { ownedNames: Set<string>; incomplete: boolean };
```

`reconcile` third-arg shape: `{ ownedNames: ReadonlySet<string>; incomplete: boolean }`.

## 5. Do-not, reasons and exceptions

- Do not edit files outside `src/reconcile.ts`. Exception: none.
- Do not remove a keep branch or weaken cleanup for readable leaves — only add ownership for failure entries; existing kept/removed behavior for healthy leaves is pinned by tests. Exception: none.
- Do not throw on a bad leaf — a failure entry changes ownership, never aborts the pass. Exception: none.
- Do not write or edit tests — embedded-call compatibility is the design; a red planned test returns a mismatch. Exception: none.
- Do not change `Pane`, `KeptEntry`, `Reconciled`, `writeKeptReport` shapes. Exception: none.

Restating: single-file diff, additive ownership, no throws, no test edits, no shape changes; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 1 file, under 16 turns.

1. Delete `collectSlugs`; build `knownSlugs`/`leafSlugs`/`leafBySlug` from `leaves` + `failures?.ownedNames`; thread `incomplete` into the candidate loop's conservative keeps (AC1–AC2).
2. `ownerCompletes` → `readInventory` + failure gate (AC3).
3. `reconcileHost` → `repoInventory` + `badSlices` + `inventoryErrors` (AC4).
4. Remove the dead leaf-walk imports/usages (AC5); `bun run typecheck`.
5. `bun test tests/reconcile.test.ts tests/store-sweep-safety.test.ts tests/release-any-phase.test.ts` via run-check (AC6).
6. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u5-reconcile -- bun test tests/reconcile.test.ts tests/store-sweep-safety.test.ts tests/release-any-phase.test.ts`
- `bun run typecheck` (report residual errors outside src/reconcile.ts verbatim)
- `akrogon run-check --name u5-grep -- grep -n "state.yaml\|stateSchema" src/reconcile.ts` (expect no output, exit 1)

`bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

The three test files green; no `state.yaml`/`stateSchema` literal in `src/reconcile.ts`; bad-leaf basenames join `knownSlugs`; diff touches only `src/reconcile.ts`. Report commit ID, files and reasons, tests run with results, residual errors, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
