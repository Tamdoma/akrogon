# Brief U3: dispatch report

## 1. Goal

Carry the picked flag through typed invocations and report picked waits per plan D1, D2, D5, D6, D7. Covers C1, C4 dispatch, C5 sameness, C6 classification, C7 silence, C8 silence.

## 2. Numbered acceptance criteria

1. Selection single-leaf, selection sweep, and both `--all` sweeps pass picked true; `--resume`, hook, tab_closed, `mergePass`, `mergeWake`, and `dispatchDependents` pass picked false.
2. A picked leaf at dispatch attempt completes merged with no line, else failed reports recovery substrings, else deps reports every dep with label, else inputs reports every gap, else normal dispatch with merge turn, capacity and busy silent.
3. An automatic leaf with failed, deps, or inputs returns waiting silently; unreadable records, foreign summary, debate refusal, invalid readiness, and delivery failures still report.
4. One-leaf and multi-leaf picks of the same leaf produce the same report line through the same code path.

## 3. Read-first list

- `src/next.ts` (report 111-118, dispatchLeaf 593-667, sweep 698-717, selectLeaves 1160-1200, nextCommand 1236-1341), `src/turn.ts` (U1 `unmergedDeps`, `blockDetail`), `src/state.ts` (U1 helpers).
- Pattern to copy: the existing explicit-throw plus catch-to-`report` shape in `dispatchLeaf`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Chunks that must land first: U1. Paths owned: `src/next.ts`. Shared test resource: none. Consumed output: U1 `blockDetail(global, repo, leaf, leaves)` plus `DepDetail` shape.

- Change `dispatchLeaf(global, repo, identity, picked: boolean, invocation, mergeContext?)`. Keep the missing-identity report and merged completion first. Replace `if (state.phase === 'failed') return 'waiting'` with a picked throw containing slug, `failed`, and `phase recovery`, else waiting. Delete the `missing !== undefined && !explicit` throw. Replace the deps and inputs blocks with: when `blockDetail` says deps and picked, throw `Leaf dependencies are not merged: <slug>: <dep> (<label>), ...` in blocked-by order; when inputs and picked, throw `Leaf inputs are missing: <slug>: <kind> <name> in <holder>, ...`; when non-picked, return waiting. Import `blockDetail` from `./turn`. Leave merge turn, capacity, busy, debate, and catch paths unchanged.
- Change `sweep(global, repo, leaves, invocation, picked: boolean)` to pass picked through. Change `dispatchDependents` to call sweep with false. Update every `dispatchLeaf` and `sweep` caller in `nextCommand`, `mergePass`, `mergeTurn`, hook, tab_closed, `--resume`, selection, and `--all` branches per criterion 1. Do not edit `selectLeaves`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/turn.ts`, `src/state.ts`, tests, docs, or `selectLeaves`. Reason: U1 owns detail, U4 owns tests, U2 owns docs, sibling owns target resolution. Exception: none.
- Do not change eligibility truth, merge order, capacity, or `report` dedupe. Reason: D10 locks them. Exception: none, return mismatch with evidence instead.
- Do not add committed tests. Reason: U4 owns `tests/next.test.ts` and proves C1-C8 at the CLI. Exception: none; use temp probes under `$TMPDIR` and delete them.
- Mismatch rule: return a mismatch with evidence to A instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in `src/next.ts`, keep locked behavior identical, prove with deleted temp probes, and mismatch rather than widen scope, unless A revises this brief.

## 6. Ordered steps

1. In `src/next.ts`, rewire `dispatchLeaf` plus `sweep` plus `dispatchDependents` signatures and bodies for criteria 2-4.
2. In `src/next.ts`, update every caller branch in `nextCommand`, `mergePass`, and `mergeTurn` for criterion 1.
3. Run temp CLI probes under `$TMPDIR` with isolated repos plus fake herdr for one picked dep-blocked leaf, one automatic `--resume` wait, and one dependent-not-picked completion, for criteria 1-4, then delete the probes.

Advisory size: 1 file, under 6 turns.

## 7. Commands

Run only this changed-test command from the worker worktree, after `bun install` there when `node_modules` is absent:

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold, temp probes are deleted, only the owned file differs, and the changed-test command result is pasted. For akrogon command work, probes use temporary repos with herdr replaced at one boundary and no real panes. No end-to-end artifact is required; U4 proves the CLI.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
