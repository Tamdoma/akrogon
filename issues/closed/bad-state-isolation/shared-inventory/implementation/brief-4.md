# Brief 4 (unit U4): src/phase.ts owner-scope on the shared inventory

## 1. Goal

Implement plan decision D7: owner completion reads its subtree through `readInventory`; a failure inside the owner's subtree blocks completion (owner does not close), failures elsewhere are invisible. Leaf slug: shared-inventory. You own exactly `src/phase.ts`.

## 2. Numbered acceptance criteria

AC1 `OwnerScope` gains the failures from each subtree walk: `ownerScope` calls `readInventory(issue, open)` and `readInventory(owner, open)` (same paths as the old `leavesUnder` calls) and carries `{ issueLeaves, ownerLeaves, failures: LeafFailure[] }` where `failures = [...issueInv.unreadable, ...issueInv.unknown, ...(owner !== issue ? [...ownerInv.unreadable, ...ownerInv.unknown] : [])]` — every failure inside the owner's subtree, each exactly once.

AC2 `completeOwner` returns `null` early (no move, no `.closing`, no sources closed) when `scope.failures.length > 0` or `!issueLeaves.every(merged)`. The bad leaf is not re-thrown — the pass reports it via its normal channel (`dispatchLeaf`/`findLeaf` reporting outside this file).

AC3 `ownerCompletion`/`completion` mirror the same rule: an owner holding a subtree failure never computes `CompletedOwner`. Keep `ownerCompletion` behavior for `within(leaf.path, issues/closed)` unchanged.

AC4 The `allLeaves(repo)` call in `phaseCommand`'s merge-turn gate stays (it is now the safe readable alias): a merge leaf with a bad sibling still holds its turn; a bad leaf is never the holder because it is absent from `allLeaves` output.

AC5 `findLeaf` calls in this file (`phaseCommand`, `landClaim`, `restack`, `finishPush`, `phase merged` paths) get the new folder-name `findLeaf` for free via the import — no call-site change needed; verify `status wrong-key`/foreign handling surfaces `RepoMismatchError`.

AC6 `bun test tests/phase.test.ts` all green — completion tests (`completion prints only when the owner finishes…`), the twin-guard merge-refusal cases, and `invalid sources … fail at load` must pass. `src/phase.ts` needs no `state.yaml`/`stateSchema` literal (it has none today — keep it that way; `leavesUnder` import may be removed if unused).

## 3. Read-first list

- `src/phase.ts:190–260` (`ownerScope`, `completion`, `ownerCompletion`, `completeOwner`), `:800–815` (merge-turn `allLeaves`), `:610–700` (`landClaim`/`restack`/`finishPush` `findLeaf` uses).
- `src/state.ts` — `readInventory`, `LeafFailure`, `allLeaves`, `findLeaf` (landed version).
- `src/reconcile.ts:252–260` — `ownerCompletes` mirrors `ownerScope` (lands in U5; your phase.ts side must match its rule: failures inside the subtree block).
- `tests/phase.test.ts:250–330, 400–445, 630–700` — completion + merge-gate expectations.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

File owned: `src/phase.ts` only.

Interfaces consumed (landed in src/state.ts):

```ts
export function readInventory(path: string, areaRoot: string): Inventory;
export type LeafFailure = { path: string; error: string };
```

`OwnerScope` becomes `{ issue: string; issueLeaves: Leaf[]; owner: string; ownerLeaves: Leaf[]; failures: LeafFailure[] }`.

## 5. Do-not, reasons and exceptions

- Do not edit files outside `src/phase.ts`. Exception: none.
- Do not throw the failure error from `completeOwner` — blocking (returning null) is the semantic; throwing re-creates the repo-wide failure. Exception: none.
- Do not let a failure inside `issue` but outside `owner` (impossible — `owner` contains `issue`) or inside `owner` pass; a failure anywhere in the walked subtrees blocks. Failures outside `owner` are never walked. Exception: none.
- Do not write or edit tests — a red planned test returns a mismatch. Exception: none.
- Do not change merge-gate/batch/land logic beyond the `allLeaves` alias staying callable. Exception: none.

Restating: single-file diff, block-not-throw for owner completion, no test edits; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 1 file, under 10 turns.

1. `ownerScope` → `readInventory` + `failures` collection (AC1); `completion`/`ownerCompletion`/`completeOwner` gate on failures (AC2–AC3).
2. Verify `allLeaves`/`findLeaf` uses still compile and behave (AC4–AC5); drop dead `leavesUnder` import if unused.
3. `bun run typecheck`; `bun test tests/phase.test.ts` via run-check (AC6).
4. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u4-phase -- bun test tests/phase.test.ts`
- `bun run typecheck` (report residual errors outside src/phase.ts verbatim)

`bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

`tests/phase.test.ts` green; owner completion blocked on subtree failure without throwing; diff touches only `src/phase.ts`. Report commit ID, files and reasons, tests run with results, residual errors, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
