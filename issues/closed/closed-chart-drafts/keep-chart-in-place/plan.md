# Plan: keep-chart-in-place

Direct synthesis (debate: no). Sources: brief.md, design.md, live checkout. No brief/design conflict found; no note for review.

## Mechanism (concrete scenario)

Tamdoma/akrogon#39: chart at `issues/chart/<owner>/` holds a draft at `slots/leaf-draft/<slug>/state.yaml` copying a real leaf's state (same slug). On owner completion, `completeOwner` renames the chart into `issues/closed/<owner>/chart`. Then `discover` (src/next.ts visit) and `leavesUnder` (src/state.ts) scan `issues/closed`, find the draft state.yaml at depth 5 (`<owner>/chart/slots/leaf-draft/<slug>`), and throw `Invalid leaf depth`. The repo inventory becomes unreadable: `akrogon next` stalls and `akrogon phase` fails for every leaf. Depth is checked before slug dedup in both readers, so this placement fails via invalid depth, never duplicate slug.

Fix: the chart stays in `issues/chart/<owner>/` permanently; only the completed lifecycle record moves to `issues/closed/<owner>/`.

## Decisions

- D1: In `completeOwner` (src/phase.ts:173-174 live) remove only the `chart` binding and the guarded `renameSync` into `issues/closed/<owner>/chart`. No other phase.ts change; `existsSync`, `basename`, `resolve` imports stay (all used elsewhere: requireClean, destination check, path joins).
- D2: No reader exclusions in `discover`/`leavesUnder`/status/park, no `Closed` marker, no migration of existing `issues/closed/*/chart` folders (locked by archive-boundary).
- D3: The new regression test lives in tests/phase.test.ts (completion-adjacent; the file already imports `fixture`, `cli`, `leaf`, `fakeHerdr`), not tests/next.test.ts.
- D4: Update only the two existing chart-move assertions to assert the chart stays: the completion test (tests/phase.test.ts:169-185) and the closure-retry loop (tests/phase.test.ts:638-683). No other existing-test edits.
- D5: "Byte-identical chart tree" means a recursive map of relative path to file bytes under `issues/chart/<owner>/`, snapshotted after fixture setup before the first merge, compared with `toEqual` after completion.
- D6: In the regression, `next --all` runs with `fakeHerdr` env; assert stderr contains neither `Invalid leaf depth` nor `Duplicate leaf slug`; assert `status <merged-slug>` exits 0.
- D7: No separate duplicate-slug positive test. The same-slug draft placement fails on current code via invalid depth (D-readers check depth first); criterion 3's no-`Duplicate leaf slug` assertion plus criterion 4's preserved tests cover the edge. Reader behavior belongs to sibling leaf unreadable-capacity.
- D8: Demonstrate the regression fails on current code before the fix (run new test pre-edit), then passes after. Setup and preserved-behavior assertions need not fail pre-fix. No vanity tests.

## Read-first

- src/phase.ts (`completeOwner`, lines 138-175)
- src/state.ts (`validateLeafDepth`, `leavesUnder`, `allLeaves`)
- src/next.ts (`discover`/visit, duplicate handling)
- tests/helpers.ts (`fixture`, `cli`, `leaf`, `fakeHerdr`)
- tests/phase.test.ts (completion test ~169-185, retry loop ~638-683)
- tests/next.test.ts (invalid-depth tests ~2102-2133, `next --all` usage)
- src/AREA.md, tests/AREA.md, docs/reference-index.md (area entry points)
- learnings/LESSONS.md (run code in temp repos, don't review by reading only)

## Needed interfaces

None new. The regression uses existing `fixture()`, `leaf()`, `cli()`, `fakeHerdr()` plus `node:fs` walk (`readdirSync`, `statSync`, `readFileSync`) for the D5 snapshot; add `readdirSync`/`statSync` to the phase.test.ts `node:fs` import.

## Acceptance criteria

- C1: `src/phase.ts` no longer renames the chart during owner completion; the completed owner still moves to `issues/closed/<owner>/`.
- C2: tests/phase.test.ts completion and retry tests assert the chart stays at `issues/chart/<owner>/CHART.md` after completion and `issues/closed/<owner>/chart` does not exist.
- C3: New regression in tests/phase.test.ts: epic fixture whose chart holds `slots/leaf-draft/<slug>/state.yaml` with bytes copied from a real leaf's state.yaml (same slug); merge every leaf via real `phase <slug> merged`; assert D5 snapshot equal, `next --all` stderr has no `Invalid leaf depth` and no `Duplicate leaf slug`, `status <slug>` for a merged leaf exits 0. Fails pre-fix, passes post-fix.
- C4: Invalid-depth negative behavior preserved: tests/state.test.ts:114-135 and tests/next.test.ts:2102-2133 pass unchanged (verified: depth refusal surfaces as ZodError carrying `Invalid leaf depth` plus path).
- C5: `bun run format`, `bun run typecheck`, `bun test` pass.

## Checklist (ordered)

1. src/phase.ts: apply D1 (C1).
2. tests/phase.test.ts completion test: flip chart assertions per D4 (C2).
3. tests/phase.test.ts retry loop (both `standalone`/`epic` scopes): flip chart assertions per D4 (C2).
4. tests/phase.test.ts: add C3 regression per D3/D5/D6; confirm it fails on current code, then passes (C3).
5. Run: full `tests/phase.test.ts` file with stdout+stderr saved to a retained file outside the fixture and repository, preserving exit status; record command, exit result, artifact path in the implementation report. Then `bun run format`, `bun run typecheck`, `bun test` (C5). Confirm C4 tests pass untouched.
6. No agent or human doc is affected: docs/guide never described the chart move (verified by grep over docs/guide), and the design excludes skill/docs edits.

## Open limitation

Already-archived charts under `issues/closed/*/chart` stay where they are (no migration, D2). If such a chart holds a draft state.yaml, the inventory stays unreadable until the operator removes that folder by hand.

## Dependencies

None. Runs in parallel with unreadable-capacity (that leaf owns `activeCount`/`allLeaves` strictness; this leaf does not touch them).

## Credentials

None named by the design; no env check required.
