# Brief 3 (unit U3): src/status.ts on the shared inventory

## 1. Goal

Implement plan decisions D5 + IN5: `scanRepo`'s hand-rolled walk is deleted; `status` lists healthy leaves plus one failure line per bad leaf and exits 1 while any failure exists. Leaf slug: shared-inventory. You own exactly `src/status.ts`.

## 2. Numbered acceptance criteria

AC1 `Scan` gains `failures: LeafFailure[]` on the `ok: true` arm. `scanRepo` calls `repoInventory(repo)` (open + closed); the walk/`stateSchema`/duplicate-slug/`validateLeafDepth`/`RepoMismatchError` code in the old `walk` is deleted. `mergeQueue` input stays `[...leaves, ...closed]` = `repoInventory(repo).leaves` (open+closed, readable only).

AC2 Failure lines (IN5): for each `unreadable` and `foreign` entry print `{unreadable: <repo.name>, path: resolve(folder,'state.yaml'), error}`; for each `unknown` entry print `{unreadable: <repo.name>, path: <dir>, error}`. Foreign error = the existing `RepoMismatchError` message shape: `Leaf repo mismatch at <folder>: stored key "<stored>", registered key "<name>"`. All lines go to stdout via the existing `console.log(JSON.stringify({unreadable, path, error}))` position (same ordering spot as today's `{ok:false}` lines). Exit rule: `process.exitCode = 1` whenever any scan has `failures.length > 0` or `!scan.ok`.

AC3 `unpackedLines`'s `leavesUnder(folder, open)` call becomes `readInventory(folder, open).leaves` — a `.closing` owner containing a bad leaf is skipped by that check rather than throwing (its failure is already reported by AC2 via `scanRepo`).

AC4 `status <slug>` detail keeps `findLeaf(repo, slug)` — now folder-name based; a bad target errors naming its `state.yaml`, a foreign target gives `RepoMismatchError`. No change needed beyond the import staying valid.

AC5 `src/status.ts` contains no `state.yaml`/`stateSchema` literals, no `readdirSync` leaf walk (keep `readdirSync` if still used for non-leaf purposes like `chartFolders`/`ownerKeeps` — remove only the leaf-walk usages and dead imports such as `validateLeafDepth`, `RepoMismatchError`, `stateSchema` if unused).

AC6 `bun test tests/status.test.ts` all green, including `incomplete repositories report exact paths before readable trees` (expects `{unreadable:'bad', path: <state.yaml>}` lines plus `visible` healthy leaf) and `repo mismatch identifies both keys` (detail stderr names stored+registered keys). `tests/dependents-first.test.ts` stays green (status output shape for rows unchanged).

## 3. Read-first list

- `src/status.ts:37–112` (`Scan`, `scanRepo`), `:356–400` (`unpackedLines`), `:432–445` (detail), `:485–500` (failure lines + exit).
- `src/state.ts` — `Inventory`, `LeafFailure`, `repoInventory`, `readInventory`, `RepoMismatchError`, `findLeaf`, `leavesUnder` (landed version).
- `tests/status.test.ts:349–470` — the diagnostic shapes that must stay green.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

File owned: `src/status.ts` only.

Interfaces consumed (landed in src/state.ts):

```ts
export type LeafFailure = { path: string; error: string };
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function repoInventory(repo: Pick<Repo,'name'|'root'>, areas?: readonly string[]): Inventory;
export function readInventory(path: string, areaRoot: string): Inventory;
```

## 5. Do-not, reasons and exceptions

- Do not edit files outside `src/status.ts`. Exception: none.
- Do not change row/render/table output — only the scan and failure reporting change; visual tests assert cell contents. Exception: none.
- Do not report foreign leaves as `foreign:` lines — IN5 keeps them in the `unreadable` shape with the stored+registered error text the tests assert. Exception: none.
- Do not write or edit tests — wrong expectations return a mismatch. Exception: none.
- Do not keep a hand-rolled walk "just for gaps" — gaps per leaf (`leafGaps`) keep running per readable leaf; failures skip gaps entirely. Exception: none.

Restating: single-file diff, existing diagnostic shapes kept, no test edits, no new walk; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 1 file, under 14 turns.

1. `Scan` type + `scanRepo` rewrite on `repoInventory` (AC1) including `mergeQueue` input and `parked` via `issueFolders` (unchanged).
2. Failure-line printing + exit rule (AC2); `unpackedLines` (AC3); dead-import cleanup (AC5).
3. `bun run typecheck`; `bun test tests/status.test.ts tests/dependents-first.test.ts` via run-check (AC6).
4. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u3-status -- bun test tests/status.test.ts tests/dependents-first.test.ts`
- `bun run typecheck` (report residual errors outside src/status.ts verbatim)
- `akrogon run-check --name u3-grep -- grep -n "state.yaml\|stateSchema" src/status.ts` (expect no output, exit 1)

`bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

`tests/status.test.ts` + `dependents-first` green; no `state.yaml`/`stateSchema` literal remains in `src/status.ts`; diff touches only `src/status.ts`. Report commit ID, files and reasons, tests run with results, residual errors, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
