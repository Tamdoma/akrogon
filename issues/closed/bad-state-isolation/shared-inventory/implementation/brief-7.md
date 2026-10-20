# Brief 7 (unit U7): worktree matching + watch-issues observe on the shared inventory

## 1. Goal

Implement plan decisions D11–D12 (+IN6): `config`/`run-check`/`verify` match a leaf worktree through `repoInventory` (a bad leaf can only match by folder basename), and `observe.ts` reports each unreadable leaf beside healthy ones via the shared inventory. Leaf slug: shared-inventory. You own exactly `src/config.ts`, `src/run-check.ts`, `src/verify.ts`, `skills/watch-issues/scripts/observe.ts`.

## 2. Numbered acceptance criteria

AC1 `src/config.ts` `effectiveConfig`: the `allLeaves(repo).find(worktree match)` becomes `repoInventory(repo)`. On no healthy match: if `basename(realTop)` equals `basename(f.path)` for some `f` in `unreadable`/`foreign`, throw an error naming `resolve(f.path,'state.yaml')` and `f.error`. This error path only applies when `top !== repo.root` — a run from the repo root never errors and keeps `leafPath` undefined (today's behavior preserved exactly).

AC2 `src/run-check.ts` `leafTarget`: same inventory; after the healthy match fails and the `-u\d+` worker lookup fails, if `basename(top)` matches a failure's folder basename, throw `Invalid state <file>: <error>` naming the failure's `state.yaml`; otherwise keep the existing `holder === undefined → 'No leaf worktree matches cwd; pass --leaf or --holder'` path.

AC3 `src/verify.ts` `verifyCaller`: `allLeaves` is already the safe alias — verify the `attempt` lookup still finds only readable merge leaves (a bad leaf is never found, which is correct).

AC4 `skills/watch-issues/scripts/observe.ts`: delete local `leavesUnder`, `readState`, `validateLeafDepth`, the retired-key filter and the local `stateSchema` import; main calls `repoInventory({name: repoKey, root}, ['open'])` (import from `../../../src/state`). Print sorted healthy leaves exactly as today, then failure lines sorted by path: `unreadable=<resolve(folder,'state.yaml')> error=<f.error>` for `unreadable` entries, the same shape with `error=Leaf repo mismatch at <folder>: stored key "<stored>", registered key "<repoKey>"` for `foreign`, and `unreadable=<dir> error=<f.error>` for `unknown`. IN6: when `leaves.length === 0` and failures exist, still print the failure lines and exit 0 without calling herdr; when the inventory is completely empty keep the existing early `return` (no output). Exit stays 0 with failures present.

AC5 None of the four files keeps a leaf-state walk, `stateSchema` use, or a `=== 'state.yaml'` marker comparison; `resolve(f.path, 'state.yaml')` for failure reporting is allowed; `readdirSync`/`existsSync` may stay for non-leaf uses (`codexSessionPaths` etc.).

AC6 `bun test tests/config.test.ts tests/run-check.test.ts tests/verify.test.ts` all green, and `cd skills/watch-issues && bun test scripts` all green — the five rewritten cases expect exit 0 + `unreadable=<state.yaml>` lines beside a healthy leaf line.

## 3. Read-first list

- `src/config.ts:354–378` (`effectiveConfig` leaf match), `src/run-check.ts:96–125` (`leafTarget`), `src/verify.ts:265–285` (`verifyCaller`).
- `skills/watch-issues/scripts/observe.ts:75–125` (locals to delete) and `:255–290` (`main`), `skills/watch-issues/scripts/observe.test.ts` (rewritten expectations).
- `src/state.ts` — `repoInventory`, `Inventory`, `LeafFailure`, `ForeignLeaf`, `allLeaves`, `RepoMismatchError` (landed version).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files owned: `src/config.ts`, `src/run-check.ts`, `src/verify.ts`, `skills/watch-issues/scripts/observe.ts`.

Interfaces consumed (landed in src/state.ts):

```ts
export type Inventory = { leaves: Leaf[]; unreadable: LeafFailure[]; unknown: LeafFailure[]; foreign: ForeignLeaf[] };
export function repoInventory(repo: Pick<Repo,'name'|'root'>, areas?: readonly string[]): Inventory;
export function allLeaves(repo: Repo): Leaf[]; // safe readable alias for verifyCaller
```

`observe.ts` imports `repoInventory`, type `Leaf`, type `State` from `../../../src/state` — `stateSchema`/`Leaf`/`State` keep their import site but only types remain.

## 5. Do-not, reasons and exceptions

- Do not edit files outside the four owned files. Exception: none.
- Do not match a bad leaf by anything except `basename` equality — the folder name is the only name an unreadable leaf has (plan limitation). Exception: none.
- Do not print `unreadable=` to stderr in observe — output goes to stdout after the healthy lines (IN6); a consumer of healthy lines is unaffected. Exception: none.
- Do not write or edit tests — the five rewritten observe cases are the criterion; a red one returns a mismatch. Exception: none.
- Do not change `constructedEnv`, `checkedRun`, `ownerRefusal`, or the config YAML output shape. Exception: none.

Restating: four owned files only, basename-only failure matching, stdout failure lines, no test edits; only a revised brief from A changes these.

## 6. Ordered steps

Advisory size: 4 files, under 20 turns.

1. `src/config.ts` + `src/run-check.ts` + `src/verify.ts` on `repoInventory`/`allLeaves` (AC1–AC3).
2. `skills/watch-issues/scripts/observe.ts` rewrite (AC4–AC5): delete local walk/parser/filter, `repoInventory` + failure lines.
3. `bun run typecheck` (repo root) and `cd skills/watch-issues && bun run typecheck`; run the test commands (AC6).
4. Commit; return commit ID + report.

## 7. Commands

- `akrogon run-check --name u7-worktree-match -- bun test tests/config.test.ts tests/run-check.test.ts tests/verify.test.ts`
- `akrogon run-check --name u7-observe -- sh -c 'cd skills/watch-issues && bun test scripts'`
- `bun run typecheck` and `cd skills/watch-issues && bun run typecheck` (report residual errors verbatim)
- `akrogon run-check --name u7-grep -- grep -nE "===\s*.state.yaml.|!==\s*.state.yaml.|stateSchema" src/config.ts src/run-check.ts src/verify.ts skills/watch-issues/scripts/observe.ts` (expect no output, exit 1; `resolve(folder, 'state.yaml')` for reporting is allowed)

`bun install --frozen-lockfile` in the worktree root and `cd skills/watch-issues && bun install --frozen-lockfile` first if `node_modules` is absent.

## 8. Done-when, evidence and report

Both test commands green; no `state.yaml`/`stateSchema` literal in the four files; diff touches only the owned files. Report commit ID, files and reasons, tests run with results, residual errors, limitations and unverified criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
