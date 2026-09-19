# Brief 1: foreign-leaf classification in `src/next.ts` + existing test updates

## 1. Goal

Implement plan decisions D1, D2, D4, D5, D7 for leaf `foreign-leaf-summary`: `akrogon next` classifies a leaf whose parsed `state.repo` differs from the registered key as foreign, emits one JSON summary line per repo per invocation, and excludes foreign leaves from dispatch, cleanup, dependency lookup and `max_active`. Update the two existing mismatch tests to the new diagnostic shape.

## 2. Numbered acceptance criteria

1. `Inventory` in `src/next.ts` is `{ leaves: Leaf[]; unreadable: number; unknown: boolean; foreign: { path: string; stored: string }[] }`. In `discover()`, a leaf that parses but has `state.repo !== repo.name` is pushed to `foreign` — no `RepoMismatchError` throw, no per-leaf `report()` call, no `unreadable` increment.
2. When `discover()` finishes a repo with `foreign.length > 0` and this invocation has not already reported that repo, it prints exactly one stderr line: `console.error(JSON.stringify({ repo, path, error, count, paths }))` where `repo` is the registered key, `path` is the first foreign path, `count` is `foreign.length`, `paths` is `[{ path, stored }]` for every foreign leaf, and `error` is a message naming the registered key and the count (e.g. `Foreign leaves in repo "repo": 3 leaves stored under other keys`). Dedup rides on `invocation.skipped`: add key `repo.name` plus each `${repo.name}/${path}`.
3. `selectLeaves()` quiet return becomes `if (inventory.unreadable > 0 || inventory.unknown || inventory.foreign.length > 0) return { repo, leaves: selected };` so `next <foreign-slug>` exits 1 with only the summary line instead of throwing `Missing leaf`.
4. `activeCount()` is not edited: foreign leaves sit outside `leaves`/`unreadable`, so they contribute 0 while malformed leaves still contribute `leaves.length + unreadable`.
5. `skipSchema` in `tests/next.test.ts` (~line 934) gains `count: z.number().int().optional()` and `paths: z.array(z.object({ path: z.string(), stored: z.string() })).optional()`; it stays non-strict.
6. The `for (const invalid of ['duplicate', 'mismatch'])` test (~line 1098) keeps both branches; the mismatch branch asserts the summary shape: a skip whose `paths` contains `{ path, stored: 'wrong' }`, `count` 1, `repo` 'repo', and no per-leaf line whose `error` contains 'repo mismatch'. It still proves only `healthy` is prompted.
7. The `wrong-key` selection/sweep test (~line 1117) is updated: both `selected` and `sweep` runs exit nonzero, each emits exactly one summary line for repo `repo` containing the leaf path in `paths` with `stored: 'other'`, no prompt is recorded, and the foreign `state.yaml` is byte-identical.
8. `bun test --changed="$AKROGON_BASE"` passes with the new code and updated tests green.

## 3. Read-first list

- `src/next.ts` — `Inventory` type, `report()`, `discover()` (the `throw new RepoMismatchError` site inside `visit`), `activeCount()`, `selectLeaves()`, `nextCommand()` tail (`invocation.skipped.size > 0` → `exitCode = 1`).
- `src/state.ts` — `RepoMismatchError` (stays for `allLeaves()`/`status.ts`; `next.ts` stops throwing it but keeps importing it only if still referenced — remove the import if unused).
- `tests/next.test.ts` — `skipSchema`/`skips()` ~934, mismatch tests ~1098-1140, `dispatchFixture`/`next()`/`configure()`/`database()`/`calls()` helpers at top and ~938.
- `tests/helpers.ts` — `leaf()` writes `repo: 'repo'` by default; `{ repo: 'wrong' }` in `extra` makes a foreign leaf.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/next.ts`: `Inventory` type; `discover()` — replace the `throw new RepoMismatchError(...)` line with `result.foreign.push({ path, stored: state.repo }); continue`-equivalent (the code is inside a `try` around `validateLeafDepth`/`readState`; restructure so a parsed-but-foreign state skips the `catch`/`unreadable` path entirely, e.g. `if (state.repo !== repo.name) { result.foreign.push({ path, stored: state.repo }); } else { result.leaves.push({ path, state }); }`); after the duplicate-slug pass, emit the summary per criterion 2; `selectLeaves()` quiet return.
- `tests/next.test.ts`: `skipSchema` fields; the two mismatch tests per criteria 6-7.
- No other file changes. `lookup()`, `sweep()`, `cleanupRepos()`, `paneOwners()`, `dispatchLeaf()` need no edits — they read `inventory.leaves` which already excludes foreign leaves.

## 5. Do-not, reasons and exceptions

- Do not modify `src/state.ts`, `src/status.ts`, `src/init.ts`, `src/phase.ts` — criterion 7 of the leaf brief locks them; `RepoMismatchError` must remain for `allLeaves()`.
- Do not change `activeCount()` — exclusion falls out of the `Inventory` shape; editing it adds a second mechanism for the same guarantee.
- Do not add persistent state, file deletion, or writes under the consumer's `issues/` — foreign files are never written.
- Do not emit per-leaf lines for foreign leaves, and do not emit one line per stored key — both are foreclosed by the locked design.
- Do not change `report()`'s existing per-leaf behavior for other unreadable causes (schema failure, bad depth, duplicate slug, I/O error).
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: locked files stay untouched, capacity logic stays untouched, foreign files are never written, one line per repo not per leaf or per key, other unreadable causes keep per-leaf lines; any conflict returns as a mismatch, not a scope change.

## 6. Ordered steps

1. Read `src/next.ts` `discover()`/`report()`/`selectLeaves()` and the two target tests. (criteria 1-3)
2. Edit `src/next.ts`: `Inventory` type, foreign collection in `visit`, summary emission at end of `discover()`, `selectLeaves` quiet return. Remove the `RepoMismatchError` import if it becomes unused. (criteria 1-4)
3. Edit `tests/next.test.ts`: `skipSchema` fields, then the two mismatch tests. (criteria 5-7)
4. Run `bun test --changed="$AKROGON_BASE"`. If it selects nothing (unlikely — `tests/next.test.ts` changed), run `bun test tests/next.test.ts` once and note it. (criterion 8)

Advisory size: 2 files, under 20 turns.

## 7. Commands

```sh
AKROGON_BASE=e624357e825e21b38a15c07a435b1ff066c6ba38 bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

All 8 criteria hold; the changed-tests run is pasted and green; the two updated tests still prove no arbitrary dispatch. Scenarios use temporary repos and the fake herdr boundary — no real panes or sockets.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
