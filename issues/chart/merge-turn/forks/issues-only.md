# Issues-only main moves

## Question
Q1. When main moves only by commits touching `issues/` while a leaf is checking, what must the leaf do before pushing: reuse its green run on a mechanical tree-equality rule, wait for those commits to be held back, or rerun?

### Carries
- Lock: issues/chart/check-reruns/forks/check-scheduling.md:22-24 (check-record runner Off route because safe reuse needs declared inputs).
- `issues/config.yaml` defines the checks and lives under `issues/`.
- Related: forks/merge-order.md (taken: 1d merge turn plus batching; one check run on the batch top in the holder's worktree; fast-forward-only push stays as the backstop; binding shape slots/merge-order-1d-merged.md).
- Operator commits issues records with plain commits and `akrogon sync` (`src/sync.ts:136`), and merge seats write evidence into tracked `issues/` (slots/map-C.md F13).

## Findings
See ../slots/map-merged.md M3-M5.

Rounds: ../slots/issues-only-A.md, -B.md, -C.md, -merged.md (with "After rebuttals"), -rebuttal-B.md, -rebuttal-C.md.

## Taken
Operator 2026-10-05, verbatim: "1a | 2a |".

- Q1 1a: reuse the green batch run without rerunning when, after a refused push and command-owned restack, (i) old main and new main are equal outside the record folders, (ii) tested top and new top are equal outside the record folders, (iii) `issues/config.yaml` is equal; any restack conflict, including `learnings/history/*`, falls back to resolve then rerun, and a resolved conflict never qualifies. The command decides and prints; the seat only acts; both SHAs and the result are recorded in the evidence; `merged --check` still runs on the new top. Reason: operator record commits stop costing a run while code that lands equals code tested. Accepted cost: pushed SHA differs from tested SHA, reading the check-scheduling lock's "final rebased commit" as same code outside record folders. Foreclosed: holding publication (B's preference, held disagreement: a local command cannot stop plain `git push`), always rerun.
- Q2 2a: record folders are `issues/` except `issues/config.yaml`, plus `learnings/`, fixed in akrogon with no setting. Operator-approved rule: checks must not read tracked files in those folders except `issues/config.yaml` as the check list; documented next to `checks` in `docs/guide/setup.md`. Reason: `add issues` commits carry `learnings/` (akrogon a2e8241, e99801d, 8ebb3f6, b1bdde3; framework 55f002467). Foreclosed: `issues/` only, per-repo setting.
- Probe 2026-10-05: no check or merge_check reads tracked `issues/` or `learnings/` files. akrogon `tests/init.test.ts` (lines 22, 105) reads `learnings` only under a fixture root `f.root`. Framework hooks and scripts reference neither folder. Framework `.claude/skills/admin-factory-update/test/*` matches only write fixture files into temp repos (`protected-paths.fixtures.ts:36-42`, `fixture-harness.ts:319`, `replay-consumer.ts:472`). Limit: a text search, not a runtime file-access trace.
- Done-criteria: a record-only commit during a batch run ends in one check run total and a push; a one-line code commit ends in a second run; a main commit matching part of the leaf's change fails condition (i).
