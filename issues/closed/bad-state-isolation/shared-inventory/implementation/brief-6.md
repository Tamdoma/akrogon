# Brief 6 (unit U6): park/stop/timing-report on the shared inventory

## 1. Goal

Implement plan decisions D8–D10: the remaining leaf walks in `src/park.ts`, `src/stop.ts`, `src/timing-report.ts` go through `readInventory`/`repoInventory`. Leaf slug: shared-inventory. You own exactly `src/park.ts`, `src/stop.ts`, `src/timing-report.ts`.

## 2. Numbered acceptance criteria

AC1 `src/park.ts` — upfront refusal: `parkCommand` builds `repoInventory(repo)` once. When `verb === 'park'` or `'unpark'` and a `names`-listed (or `--all`-enumerated) owner folder's subtree contains any failure (`unreadable`/`unknown`/`foreign` under that owner's path), the command throws `Invalid state <state.yaml path>: <error>`-shaped error naming the failure's own error text — the action is blocked. For `park --all`, an owner containing a failure is excluded from `candidates` and reported as `unreadable <name>` (same stdout pattern as `running  <name>`/`needed  <name>`), never moved.

AC2 `running`/`stranded`/`settle`/`appendTiming` walk via `readInventory(folder, openRoot)`/`readInventory(closedRoot, closedRoot)`. `stranded`'s `known` set includes `basename(f.path)` for each `unreadable` entry inside its walked folders plus all readable slugs — a dependency on an unreadable leaf stays unmet but is not called dangling (matches `unmergedDeps`' `unreadable` label); a readable open leaf blocked-by a bad leaf is `stranded` only if the bad basename isn't in `known` — it is, so no false dangling. `running` on an owner containing failures: the upfront AC1 refusal has already fired for named owners; for `park --all` such an owner is already excluded, so `running` sees only readable leaves.

AC3 `src/stop.ts` `stop --all`: `repoInventory(repo, ['open'])`; the slug list comes from `inv.leaves` (same filters as today); each `inv.unreadable`/`inv.unknown`/`inv.foreign` entry prints one `console.error('failed: <repo>/<basename(path)> <error>')`-style line and sets `process.exitCode = 1`, then the readable stops proceed. `stop <slug>`/`start <slug>` keep `findLeaf` — bad target errors with its own `state.yaml` message.

AC4 `src/timing-report.ts`: `flowReport`'s `[...allLeaves(repo), ...leavesUnder(parked, parked)]` becomes `repoInventory(repo, ['open','closed','parked'])`, and any failure in `unreadable`/`unknown`/`foreign` throws `new Error` naming the first bad `state.yaml` path and its error — the report is refused when leaf data is incomplete (the whole report reads the whole tree, so no partial output). The `timing <slug>` path keeps `findLeaf`.

AC5 None of the three files gains a `state.yaml`/`stateSchema` literal; `leavesUnder` imports are replaced by `readInventory`/`repoInventory` where failures matter; `issueFolders` stays (folder names, not state).

AC6 `bun test tests/park.test.ts tests/timing-report.test.ts tests/leaf-stop.test.ts tests/pause.test.ts tests/pause-next.test.ts tests/pause-status.test.ts` all green.

## 3. Read-first list

- `src/park.ts` (whole file — `issueFolders`, `running`, `stranded`, `parkCommand`, `settle`), `src/stop.ts:56–90`, `src/timing-report.ts:435–500` + its `timing <slug>` path.
- `src/state.ts` — `readInventory`, `repoInventory`, `Inventory`, `LeafFailure`, `findLeaf` (landed version).
- `tests/park.test.ts`, `tests/timing-report.test.ts`, `tests/leaf-stop.test.ts` — parked/running/stop expectations.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files owned: `src/park.ts`, `src/stop.ts`, `src/timing-report.ts`.

Interfaces consumed (landed in src/state.ts):

```ts
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function readInventory(path: string, areaRoot: string): Inventory;
export function repoInventory(repo: Pick<Repo,'name'|'root'>, areas?: readonly string[]): Inventory;
```

`readInventory(path, areaRoot)` on a subtree (`resolve(root,'issues/open',issue)` with `resolve(root,'issues/open')` as areaRoot) mirrors the old `leavesUnder` calls.

## 5. Do-not, reasons and exceptions

- Do not edit files outside the three owned files. Exception: none.
- Do not move or park a leaf folder containing a failure — blocked actions throw or exclude per AC1; silent moves re-create the bug. Exception: none.
- Do not make `stop --all` abort on a bad leaf — readable stops proceed, the failure is reported (criterion: one bad leaf stops only itself). Exception: none.
- Do not write or edit tests — a red planned test returns a mismatch. Exception: none.
- Do not change `issueFolders`, `ParkVerb`, the `parked  `/`unparked ` print format, or `stop`/`start` CLI behavior beyond AC3. Exception: none.

Restating: owned files only, refuse moves containing failures, report-and-continue for stop --all, no test edits; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 3 files, under 18 turns.

1. `src/park.ts` AC1–AC2: `parkCommand` inventory + refusal/exclusion; `running`/`stranded`/`settle`/`appendTiming` on `readInventory`; `known` gains bad basenames.
2. `src/stop.ts` AC3; `src/timing-report.ts` AC4.
3. `bun run typecheck`; run AC6's test command via run-check.
4. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u6-park-stop-timing -- bun test tests/park.test.ts tests/timing-report.test.ts tests/leaf-stop.test.ts tests/pause.test.ts tests/pause-next.test.ts tests/pause-status.test.ts`
- `bun run typecheck` (report residual errors outside your three files verbatim)

`bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

The named test files green; the three files walk only via the inventory; diff touches only `src/park.ts`, `src/stop.ts`, `src/timing-report.ts`. Report commit ID, files and reasons, tests run with results, residual errors, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
