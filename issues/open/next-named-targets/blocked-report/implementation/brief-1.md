# Brief U1: blocker detail

## 1. Goal

Add dep and block detail beside `eligibility` without changing its truth value, per plan D3, D4, D6. This unit enables U3 dispatch reporting.

## 2. Numbered acceptance criteria

1. `isParked` returns true exactly when `missingLeafMessage` today appends ` (parked)`, for open, nested, and absent slugs.
2. `hasLeafFolder` returns true when a directory named for the slug under `issues/open` or `issues/closed` contains `state.yaml`, false otherwise.
3. `unmergedDeps` lists every blocked-by slug whose inventory entry is absent or not merged, in blocked-by order, each with label phase or `parked`, `missing` or `unreadable` per D3. Merged open or closed never appears.
4. `blockDetail` returns null exactly when `eligibility` returns null, `deps` when eligibility says deps, `inputs` with the same `gaps()` otherwise.
5. `eligibility`, `mergeQueue`, and `missingLeafMessage` outputs are unchanged for all existing callers.

## 3. Read-first list

- `src/turn.ts` (eligibility 1-20, mergeQueue), `src/state.ts` (missingLeafMessage 146-158, readState, Leaf), `src/readiness.ts` (gaps, Gap), `src/park.ts` (issueFolders).
- Pattern to copy: `missingLeafMessage` parked walk in `src/state.ts`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Chunks that must land first: none. Paths owned: `src/turn.ts`, `src/state.ts`. Shared test resource: none. Consumed output: none.

- `src/state.ts`: `export function isParked(repo: Repo, slug: string): boolean` extracted from `missingLeafMessage`. `missingLeafMessage` calls it, output unchanged.
- `src/state.ts`: `export function hasLeafFolder(repo: Repo, slug: string): boolean` scanning `issues/open` and `issues/closed` for a directory named `slug` containing `state.yaml`. Return false when areas are absent.
- `src/turn.ts`: `export type DepDetail = { slug: string; label: string }`. `export function unmergedDeps(repo: Repo, leaf: Leaf, leaves: Leaf[]): DepDetail[]` in blocked-by order. For each dep: when inventory has it and phase is not `merged`, label is that phase; else when `isParked`, label `parked`; else when `hasLeafFolder`, label `unreadable`; else label `missing`.
- `src/turn.ts`: `export function blockDetail(global: GlobalConfig, repo: Repo, leaf: Leaf, leaves: Leaf[]): { kind: 'deps'; deps: DepDetail[] } | { kind: 'inputs'; missing: Gap[] } | null` checking deps via `unmergedDeps` length, then inputs via `readReadiness` plus `gaps`, mirroring `eligibility`. Do not edit `eligibility` body.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, tests, or docs. Reason: U3 owns dispatch, U4 owns tests, U2 owns docs. Exception: none.
- Do not change `eligibility` truth, `mergeQueue` order, or `missingLeafMessage` text. Reason: D10 locks them. Exception: none, return mismatch with evidence instead.
- Do not add committed tests. Reason: U4 owns `tests/next.test.ts` and proves C2-C3 at the CLI. Exception: none; use a temp probe under `$TMPDIR` and delete it.
- Mismatch rule: return a mismatch with evidence to A instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in the two owned files, keep locked outputs byte-identical, prove with a deleted temp probe, and mismatch rather than widen scope, unless A revises this brief.

## 6. Ordered steps

1. In `src/state.ts`, extract `isParked` for criterion 1, keep `missingLeafMessage` output identical.
2. In `src/state.ts`, add `hasLeafFolder` for criterion 2.
3. In `src/turn.ts`, add `DepDetail` plus `unmergedDeps` for criterion 3.
4. In `src/turn.ts`, add `blockDetail` for criterion 4, mirroring `eligibility` without editing it.
5. Run a temp probe under `$TMPDIR` against a scratch repo covering parked, missing, unreadable, phased, merged-open, and merged-closed deps plus deps-before-inputs, for criteria 1-5, then delete the probe.

Advisory size: 2 files, under 8 turns.

## 7. Commands

Run only this changed-test command from the worker worktree, after `bun install` there when `node_modules` is absent:

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold, the temp probe is deleted, only the two owned files differ, and the changed-test command result is pasted. For akrogon command work, temp probes use temporary repos with no real panes or install roots. No end-to-end artifact is required; U4 proves the CLI.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
