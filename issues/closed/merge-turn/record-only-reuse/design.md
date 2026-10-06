# Design: record-only-reuse

## Binding decisions, verbatim

### issues-only (issues/chart/merge-turn/forks/issues-only.md)
Operator 2026-10-05, verbatim: "1a | 2a |".

- Q1 1a: reuse the green batch run without rerunning when, after a refused push and command-owned restack, (i) old main and new main are equal outside the record folders, (ii) tested top and new top are equal outside the record folders, (iii) `issues/config.yaml` is equal; any restack conflict, including `learnings/history/*`, falls back to resolve then rerun, and a resolved conflict never qualifies. The command decides and prints; the seat only acts; both SHAs and the result are recorded in the evidence; `merged --check` still runs on the new top. Reason: operator record commits stop costing a run while code that lands equals code tested. Accepted cost: pushed SHA differs from tested SHA, reading the check-scheduling lock's "final rebased commit" as same code outside record folders. Foreclosed: holding publication (B's preference, held disagreement: a local command cannot stop plain `git push`), always rerun.
- Q2 2a: record folders are `issues/` except `issues/config.yaml`, plus `learnings/`, fixed in akrogon with no setting. Operator-approved rule: checks must not read tracked files in those folders except `issues/config.yaml` as the check list; documented next to `checks` in `docs/guide/setup.md`. Reason: `add issues` commits carry `learnings/` (akrogon a2e8241, e99801d, 8ebb3f6, b1bdde3; framework 55f002467). Foreclosed: `issues/` only, per-repo setting.
- Probe 2026-10-05: no check or merge_check reads tracked `issues/` or `learnings/` files. akrogon `tests/init.test.ts` (lines 22, 105) reads `learnings` only under a fixture root `f.root`. Framework hooks and scripts reference neither folder. Framework `.claude/skills/admin-factory-update/test/*` matches only write fixture files into temp repos (`protected-paths.fixtures.ts:36-42`, `fixture-harness.ts:319`, `replay-consumer.ts:472`). Limit: a text search, not a runtime file-access trace.
- Done-criteria: a record-only commit during a batch run ends in one check run total and a push; a one-line code commit ends in a second run; a main commit matching part of the leaf's change fails condition (i).

Excluded: merge-order, turn-release and dependency-setup decisions belong to merge-turn-order, merge-batch, nits-before-merge and check-setup. B's preference for holding publication is a held disagreement, foreclosed above.

## Standing design
/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

- Tests run the batch push against a local bare remote, with a commit landed on it during the run, and count check runs by a fixture check that appends to a file outside the repo. Each criterion is its own case.
- The decision is mechanical (`git diff --quiet` with pathspec excludes), so it gets tested at the CLI boundary, not by unit-testing the pathspec builder.
- A deliberate break (drop the `issues/config.yaml` condition) must turn criterion 4 red.

## Leaf architecture
- Owned: the reuse fields in merge-batch's batch record in `src/state.ts` (new main, decision), with the publication candidate updated to the restacked top on `reuse` (A,B,C); the refused-push branch of merge-batch's command-owned push (fetch, restack, the three equality checks, print the decision); `skills/merge-issue/SKILL.md` lines about the printed decision; `docs/guide/setup.md` rule next to `checks`.
- Condition checks, literal (A,B,C), independent of the caller's directory:
  - `git diff --quiet M1 M2 -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`
  - `git diff --quiet T1 T2 -- ':(top)' ':(top,exclude)issues' ':(top,exclude)learnings'`
  - `git diff --quiet M1 M2 -- ':(top)issues/config.yaml'`
  
  M1 is the tested main, M2 the new main, T1 the tested top and T2 the restacked top. M1 and T1 stay the original tested values for every later refusal.
- Not owned: building the batch, the attempt id and fences, conflict handling (merge-batch).
