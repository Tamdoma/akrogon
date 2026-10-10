# Sub-brief 1: dependents-first code (unit U1)

## 1. Goal

Implement the plan's D1-D4 in `src/turn.ts` and `src/next.ts`: a shared `dependentCounts` function, the merge-queue sort by (batch record, dependent count desc, existing time/slug), and dispatch order by dependent count in `sweep`. Plan decisions: D1, D2, D3, D4. Leaf brief done-criteria this unit contributes to: C1-C5 (ordering semantics); the proving tests are a later unit, not yours.

## 2. Numbered acceptance criteria

1. `src/turn.ts` exports `dependentCounts(leaves: Leaf[]): Map<string, number>` returning, per leaf slug, the number of distinct leaves with `phase !== 'merged'` that wait on it through `blocked-by` directly or transitively. A leaf whose only dependents are `merged` has count 0.
2. `mergeQueue` places every leaf with `state.batch !== undefined` before every leaf without; among the rest it sorts by dependent count descending, then the existing `time` ordering (merge_stamp, else last `to: merge` log record, else last), then slug. `QueueEntry`'s shape, `eligibility`, and the log-fallback behavior are unchanged.
3. `sweep` in `src/next.ts` attempts leaves in order: merged phase first (existing key, unchanged), then dependent count descending, then the pre-existing list order (stable sort). Counts are computed once per `sweep` call over `discover(repo, invocation).leaves` (the full repo, not the swept subset).
4. Traversal terminates on cycles and never throws on missing/parked slugs: only slugs present in `leaves` can be counted or propagate edges.
5. `bun run typecheck` passes; `bun test --changed="2e78945849eed87c42abd56f224909f4d2050b36" --timeout=30000` passes.

## 3. Read-first list

- `src/turn.ts` (all ~75 lines: `unmergedDeps`, `eligibility`, `mergeQueue`)
- `src/next.ts` lines ~109-200 (`Inventory`, `discover`), ~636-720 (`dispatchLeaf`), ~757-783 (`sweep`, `sweepAll`)
- `src/state.ts` lines ~60-100 (`stateSchema`, `Leaf`, `batch` field)
- `src/status.ts` line ~83 and `src/phase.ts` line ~771 (the other `mergeQueue` callers — read to confirm they inherit the order unchanged; do not edit)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Existing pattern to copy: `unmergedDeps` in `src/turn.ts` — a leaf list in, a small pure function, flatMap over `blocked-by`.

## 4. Change list and needed interfaces

Owned paths: `src/turn.ts`, `src/next.ts`. Needs first: none. Shared test resource: none.

- `src/turn.ts`: add exported `dependentCounts`. Suggested implementation (adapt to house style): build `Map<slug, Leaf>` over `leaves.filter(l => l.state.phase !== 'merged')`; invert edges into `Map<slug, Set<slug>>` dependents-adjacency (for each unmerged leaf L, for each slug in `L.state['blocked-by']` that names an unmerged leaf, add L to that slug's dependent set); for each leaf, walk dependents from that slug collecting every reached slug — `count = reached.size` (a leaf can reach itself through a cycle; whether it counts itself is immaterial because cyclic leaves are never eligible, but keep the walk `seen`-guarded so it terminates). One traversal per leaf is fine — leaf sets are small.
- `src/turn.ts` `mergeQueue`: compute `const counts = dependentCounts(leaves)` once (use the full `leaves` argument, not `eligible`, so transitive edges through non-eligible leaves are included — a `plan` leaf blocked by a `merge` leaf is still a waiting dependent). Comparator order: `Number(b.batch !== undefined) - Number(a.batch !== undefined)`, then `counts.get(b.slug) - counts.get(a.slug)` desc, then the unchanged time/slug chain.
- `src/next.ts` `sweep`: compute `const counts = dependentCounts(discover(repo, invocation).leaves)` once, then extend the existing `ordered` sort with the count key after the merged key. Import `dependentCounts` from `./turn` — the file already imports `blockDetail, mergeQueue, type QueueEntry` from it.

Interfaces: `Leaf = { path: string; state: State }`; `State.phase` is a string union including `'merged'`; `State['blocked-by']: string[]`; `State.batch?: Batch`.

## 5. Do-not, reasons and exceptions

- Do not change `QueueEntry`, `mergeQueue` or `sweep` signatures, `eligibility`, `merge_stamp` writes (`src/phase.ts`), or any status/phase caller — the plan fixes interfaces and the other callers must inherit the new order untouched.
- Do not add an aging rule, priority field, or config option — foreclosed by the locked design.
- Do not write or edit tests — tests are unit U3 in a later wave.
- Do not touch docs — docs are unit U2.
- Do not filter dependents by phase other than `!== 'merged'` — failed/blocked/parked leaves still wait.
- If the acceptance criteria conflict with real code (e.g., `discover` is unusable inside `sweep`), return a mismatch naming the conflict, evidence, and the smallest correction instead of changing scope. The exception is a revised brief from A authorizing that change.

Restated: keep interfaces and exclusions as written; any conflict returns a mismatch, not a scope change.

## 6. Ordered steps

1. Read `src/turn.ts` fully, then implement `dependentCounts` (criterion 1) and the `mergeQueue` comparator (criterion 2).
2. Read `sweep` and `discover` in `src/next.ts`; add the import and the count key (criteria 3, 4).
3. Run `bun run typecheck` and the changed-test command in section 7 (criterion 5).

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

with `AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36`. Plus `bun run typecheck`.

## 8. Done-when, evidence and report

All five criteria hold; typecheck and changed tests pass with pasted results. Commit your chunk in one commit on top of the worktree HEAD and return the commit ID. No `Test-Change:` trailer needed — you change no existing test file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
