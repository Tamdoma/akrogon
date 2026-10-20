# Brief 2 (unit U2): src/next.ts on the shared inventory

## 1. Goal

Implement plan decision D4 (with D6 caller wiring): `src/next.ts`'s private `Inventory`/`discover` walk is deleted and rebuilt on `repoInventory`/`inventoryFailures` from `src/state.ts` (already landed). Leaf slug: shared-inventory. You own exactly `src/next.ts`.

## 2. Numbered acceptance criteria

AC1 `discover(repo, invocation)` becomes `repoInventory(repo)` plus one report pass: every `unreadable` and `unknown` entry goes through the existing `report(invocation, repo.name, entry.path, new Error(entry.error))` (dedup per invocation unchanged); `foreign` keeps the existing once-per-repo aggregate `console.error` block unchanged. Reporting code stays in `next.ts` — `Invocation`/`report`/`skipped` semantics are untouched.

AC2 `Inventory` type: local alias `type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] }` — or import `Inventory` from `./state`; every consumer compiles.

AC3 Capacity rule identical behavior: `activeCount` uses `inventory.unknown.length > 0 ? global.max_active : leaves.filter(active).length + inventory.unreadable.length`. `selectLeaves`'s `inventory.unreadable > 0` becomes `inventory.unreadable.length > 0` (same for `unknown`/`foreign.length`). Every other numeric/boolean use of `inventory.unreadable`/`unknown` adapts the same way — grep them all.

AC4 All `allLeaves(repo)` calls in `next.ts` (reconcileBatch fresh lookups, mergeTurn `leaves`, the `fresh`/`holderNow`/`remaining` re-reads) stay calling `allLeaves` — it is now the safe readable alias and must not throw on a bad sibling. Verify each site behaves when a leaf folder vanishes mid-pass exactly as before (find returns undefined → early return paths unchanged).

AC5 `reconcile(repo, leaves, live)` calls become `reconcile(repo, inventory.leaves, live, inventoryFailures(inventory))` at both call sites (`reconcileRepos` and the `tab_closed` event path); `reconcileNeedsPanes(repo, inventory.leaves)` unchanged signature. Import `inventoryFailures` from `./state`.

AC6 `mergeQueue(global, repo, discover(repo, invocation).leaves, …)`, `dispatchLeaf`'s `inventory.leaves.find`, `resolveName`, `sweep`, `sweepAll`, `mergePass`, `broadcastPass`, `dispatchDependents`, `paneOwners`, `landedWake` — all keep working on readable leaves only. A bad leaf is never dispatched or queued; `next <bad-slug>` reports its failure entry naming its `state.yaml` (the error string now contains the file path via the new `readState` messages).

AC7 `bun test tests/next.test.ts` all green; the private `visit`/`discover` walk and the `Inventory`/`leaves/unreadable:number/unknown:boolean` shape are gone; `src/next.ts` contains no `state.yaml` or `stateSchema` literals and no `readdirSync` walk over `issues/open|closed` (imports of `readdirSync`/`statSync` may remain only if still used for other purposes).

## 3. Read-first list

- `src/next.ts` — the file you edit; the `discover` body at :129–190 is what gets replaced.
- `src/state.ts` — `Inventory`, `LeafFailure`, `ForeignLeaf`, `readInventory`, `repoInventory`, `inventoryFailures`, `allLeaves`, `findLeaf` signatures (read the landed version).
- `src/reconcile.ts` — `reconcile` signature `(repo, leaves, live, failures?)` to confirm the call shape (may still be pre-landing; the planned signature in section 4 is authoritative).
- `tests/next.test.ts` — unreadable/foreign/capacity expectations that must stay green.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

File owned: `src/next.ts` only.

Interfaces consumed (landed in src/state.ts):

```ts
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function repoInventory(repo: Pick<Repo,'name'|'root'>, areas?: readonly string[]): Inventory;
export function inventoryFailures(inv: Inventory): { ownedNames: Set<string>; incomplete: boolean };
export function allLeaves(repo: Repo): Leaf[]; // readable alias, never throws on bad leaf
```

reconcile call shape (lands in U5; write calls now):

```ts
reconcile(repo, inv.leaves, live, inventoryFailures(inv))
reconcileNeedsPanes(repo, inv.leaves)
```

## 5. Do-not, reasons and exceptions

- Do not edit files outside `src/next.ts` — sibling units own them. Exception: none; a compile error originating elsewhere is reported, not fixed.
- Do not change `report`/`Invocation`/dedup semantics or the foreign aggregate text — tests assert both. Exception: none.
- Do not swallow or wrap `repoInventory` — let it be called directly; a per-invocation cache is out of scope. Exception: none.
- Do not write or edit tests — planned tests are A's; a planned test red because its expectation is wrong returns a mismatch. Exception: none.
- Do not remove `findLeaf` import if still used; remove only imports that become dead (e.g., `validateLeafDepth`, `readState` stays — dispatchLeaf re-reads state).

Restating: single-file diff, reporting untouched, no test edits, no new throws, no scope creep; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 1 file, under 15 turns.

1. Replace the local `Inventory`/`discover` body with `repoInventory(repo)` + the report pass (AC1–AC2); delete `visit`, the duplicate-slug block and the `readdirSync`/`statSync`/`Dirent` imports that become dead.
2. Fix every `.unreadable`/`.unknown` consumer (AC3) and `reconcile` calls (AC5); confirm AC4 sites compile unchanged.
3. `bun run typecheck`; `bun test tests/next.test.ts` via run-check (AC7).
4. `bun test tests/state-inventory.test.ts` — informational; remaining fails are other units' (status/config/phase/reconcile/park/observe).
5. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u2-next -- bun test tests/next.test.ts`
- `bun run typecheck` (report residual errors outside src/next.ts verbatim)
- `akrogon run-check --name u2-grep -- grep -n "state.yaml\|stateSchema" src/next.ts` (expect no output, exit 1)

`bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

`tests/next.test.ts` green; `src/next.ts` free of `state.yaml`/`stateSchema` literals; diff touches only `src/next.ts`. Report commit ID, files and reasons, tests run with results, residual cross-unit failures, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
