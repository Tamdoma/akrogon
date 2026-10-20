# Implementation report: shared-inventory

Leaf: shared-inventory (slot A, implement). Mode: delegated — 7 units, wave 1 serial (U1), wave 2 parallel (U2–U4), wave 3 parallel (U5–U7).

## Base and head

- Base at start: `96a96979d15bc355115a70f409ec297a9fa81587`
- Refresh: rebased the leaf branch onto `origin/main` `21422a68` cleanly (no conflicts); new `AKROGON_BASE: 21422a68da2dd676f7e97077f18e4321ea7064f3`. Prior base `96a96979`, prior head `014527a3`.
- Committed head: `d7f05174abbd90e6358c57caac69ddc8b70b99d5` on `shared-inventory`.

## Units and worker commits

| Unit | Files | Worker commit | Result |
|------|-------|---------------|--------|
| U1 | `src/state.ts` | `9fa38d0d` → `3152fc19` | Inventory types + `readInventory`/`repoInventory`/`inventoryFailures`, strict `readState`, folder-name `findLeaf`, aliases. `tests/state.test.ts` 40/40. |
| U2 | `src/next.ts` | `62b74b79` → `0ce38b31` | `discover` on `repoInventory`, per-entry `report()` dedup kept, foreign aggregate kept, `reconcile(..., inventoryFailures(inv))`. `tests/next.test.ts` 242/242. |
| U3 | `src/status.ts` | `1d845e2d` → `5d8ef04f` | `scanRepo` on `repoInventory`, `{unreadable, path, error}` per failure, exit 1; `unpackedLines` via `readInventory`. 37/39 at unit time; 2 red from retired-key fixtures A corrected. |
| U4 | `src/phase.ts` | `759b914c` → `65780c63` | `ownerScope` failures; `completeOwner`/`ownerCompletion`/`completion` block (return null, no throw) on subtree failure. `tests/phase.test.ts` 67/67. |
| U5 | `src/reconcile.ts` | `21c8b73a` → `7e006d67` | `failures?` param (positional, embedded-call compatible); bad basename joins `knownSlugs`; `badSlices` + `inventoryErrors` in `reconcileHost`; `ownerCompletes` failure gate. 63/63. |
| U6 | `src/park.ts`, `src/stop.ts`, `src/timing-report.ts` | `ca13b1cb` → `7baa31b4` | Owner-scoped move refusal; `stop --all` reports and continues; `flowReport` refuses incomplete inventories. 54/55 (1 retired-key fixture red, A-corrected). |
| U7 | `src/config.ts`, `src/run-check.ts`, `src/verify.ts`, `skills/watch-issues/scripts/observe.ts` | `b187b036` → `2c52bee1` | Basename failure matching for worktree identity; observe prints `unreadable=` lines via `repoInventory`. 73/74 + 47/48 (stale fixtures, A-corrected). |

## A-side commits

- `8aeacdb2` — red-first criterion tests (plan phase).
- `03b3b869` — narrowed the criterion-7 scan to walks/parses (`Test-Change` trailer).
- `30445190` — retired-key fixture corrections (`Test-Change` trailers ×4 files).
- `b36a0925` — removed the `batch.members`-shim and `solo`-key-drop assertions; narrowed the tab assertion to the bad leaf's own tab (`Test-Change` trailers ×2).
- `d7f05174` — prettier format for the configured format check (`Test-Change` trailer for `tests/batch-dispatch.test.ts`).

## Checks run

| Command | Result | Log |
|---------|--------|-----|
| `akrogon verify` (head `d7f05174`) | **green** — format 0, `bun test` 1084/1084, typecheck 0 | `check-format-…/check-test-1792432823883-4008944.log`, `check-typecheck-1792432826162-4008944.log`, run `9d79ed65` |
| `bun test` (lane, head `b36a0925`) | 1068/1084 — 16 `peer-wait` 5 s timeouts, identical on base `96a96979` and `21422a68`; pre-existing environmental red, resolved under verify's fresh checkout | `check-test-1792430753127-2042241.log` |
| `cd skills/watch-issues && bun test scripts` | 48/48 | inline |

Proof-of-criteria: `tests/state-inventory.test.ts` 8/8 green at head (isolation ×4 variants, named-leaf error, dispatch/queue/ownership, criterion-7 source scan). Rewritten `tests/state.test.ts` 40/40, `observe.test.ts` 48/48.

## Known limitations

- `findLeaf` and failure matching bind by folder basename only (planned).
- `peer-wait.test.ts` fails in-session (16 × 5 s timeouts) on both base and head; environmental — green inside `akrogon verify` twice.
- `status.test.ts` "multiple repos" asserts `0h 23m` elapsed and flakes to `0h 22m` at a minute boundary; green on reruns and inside verify.
- In-session test runs flake under leftover zombie `bun test` processes (one stray run held the box at load 14).

## Unverified criteria

None. All plan criteria have green proofs at `d7f05174`; the verify receipt `9d79ed65` covers the head.

## Next

`check-issue shared-inventory slot=B phase=check.review leaf=/home/ivan/Work/infra/akrogon/issues/open/bad-state-isolation/shared-inventory`
