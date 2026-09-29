# Review-B: keep-chart-in-place

Base: 53508e807128de2a77b22cf4874e266224cf4f0e
Reviewed head: 62b0b1e55a6a28dd5924d6cd303a5e4d1a46c196
Mode: initial review, blind. No debate artifacts exist (debate: no, expected).

## Diff scope

`git diff base..HEAD --name-only`: src/phase.ts, tests/phase.test.ts only. HEAD is ahead of base; `git status --porcelain` empty before verdict. No `issues/` paths on the branch. No AREA.md in the diff.

## Criteria

- C1/D1: exact 2-line deletion in `completeOwner` (chart binding + guarded rename); owner move untouched, completion test still asserts closed paths. Met.
- C2/D4: both flips assert the chart stays at `issues/chart/<owner>/CHART.md` and `issues/closed/<owner>/chart` is absent, covering standalone and epic scopes. Met.
- C3/D3/D5/D6: regression matches the spec: epic with two leaves, draft bytes copied from the real `alpha` state.yaml (same slug), every leaf merged via real `phase merged`, recursive path-to-bytes snapshot compared with `toEqual`, `next --all` exit 0 with stderr free of both literal error strings, `status alpha` exit 0. Real CLI processes, herdr replaced at one boundary, no mocks of the unit under test; stderr assertions target literal error strings (fixed references). Met.
- C4/D2/D7: tests/state.test.ts and tests/next.test.ts untouched; no reader, marker, migration, or docs/skill edits. Met.
- C5: report records `bun run format` (no changes), `bun run typecheck` (clean), `bun test` (327 pass, 0 fail) with artifacts /tmp/keep-chart-in-place-phase-run.log and /tmp/keep-chart-in-place-full-run.log (both exist); I re-ran the phase file (32 pass) and typecheck (clean) on the reviewed head. Met.

## Docs

No documented behavior changed: docs/guide/merge.md describes completion as "Completed records move to the closed store" with no chart-move claim; no other guide page describes the move.

## Verification evidence (this seat)

- Red reproduced: base src/phase.ts + new test via `bun test tests/phase.test.ts -t 'same-slug draft'` → 0 pass, 1 fail; worktree restored clean after.
- Green on reviewed head: targeted run 1 pass; full file 32 pass, 0 fail; `bun run typecheck` clean; worktree clean.
- Ponytail: deletion-only source change, smallest sufficient test helper, no new abstractions or dependencies.

## Findings

None. The report's calibration (pre-fix red comes from the snapshot assertion, the root-cause mechanism itself) is accurate and needs no action.

## Verdict

ready
