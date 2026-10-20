# Design: solo-turns

## Binding decisions, verbatim

### stack-fate (issues/chart/merge-stacks/forks/stack-fate.md), operator 2026-10-19

Goal carried from 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."

Operator 2026-10-19: "Okay, say say I didn't rule anything out. What would be the best possible solution? Consult with the consultants and tell e this is very important to me. If I'm stuck with only one at a time merge, that's fine, but I need to find something faster that is just as precise and as good. So do some deep research on this without me imposing any rules or restrictions. Of course consult with both consultants."

Operator 2026-10-19: "This was a part of the speed up because if they were running two full checks of test suites during their run and inside of the merge that just doubles the amount of time that takes to merge. Consider all the updates that we did in the past week. I am aiming for speed as well as accuracy.As well as the cost reductions."

Operator 2026-10-19: "1a | 2 - Explain to me how this works, who will commence the merging? I'm leaning towards A but I need you to explain it more, dumb it down for me. What are the gains gonna be in absolute and relative terms from this? | 3 - I'm leaning towards A, but I need more explanation. What is this? Dumb it down for me. | 4a | 5a"

- 1a: delete member stacking; every merge turn is the holder alone.
- 4a: parallel next-leaf testing (speculative prefix, depth 2) is deferred. Revisit trigger: after the command-only green merge and the framework suite reshaping land, a measured probe shows two full suites run at once on this host without slowing each other or adding flakes.
- 5a: no upgrade code for an in-flight stacked merge; drain merges before installing; the strict state parse refuses a leftover loudly.

Reason: on framework `issues/merge-attempts.jsonl` (333 attempts, 2026-10-10 to 2026-10-19) 77 stacks landed 5 extra leaves and spent 480 min on 72 red stacks; 51 of 53 red-stack leaves later merged alone; 62 heads went red again on another base. Outside queues that batch (GitHub merge queue, bors-ng, Zuul, Mergify, Rust rollups) pay off only with rare failures, splitting or parallel CI; here solo red is about 24-31% and splitting is foreclosed.

Foreclosed: keeping stacking with a better red-skip key; a stack-size cap, split, bisection or culprit search; batches checked once on top (a green top does not prove each leaf's prefix).

Superseded by this decision: from issues/closed/merge-batch/stacked-turn/design.md "Merge batching (issues/chart/overnight-recs/CHART.md D5)", operator 2026-10-15, the parts "all-or-holder batching ... Stack the holder and every waiting compatible leaf; green pushes all; red falls back to the holder alone; a head seen in a red stack is not stacked again until it changes" and the "Red-skip key" paragraph. Still binding from that decision: no `batch_limit` or any stack-size cap, no split or bisection search, no `--culprit` command, no waiting for a queue to fill.

Exclusion: 2a (command-only green merge) belongs to leaf green-merge, which is blocked by this leaf. This leaf keeps the B seat flow for every merge turn exactly as the memberless path runs it today.

### Standing design

/home/ivan/.akrogon/releases/b5a877c1c21d952e7ef86579e8eacecbd582aa5f/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: this is a deletion. Proof uses the repo's existing bun:test runner and helpers (`tests/helpers.ts`, `tests/fake-herdr.ts`) at the command boundary (`akrogon next`, `akrogon phase`) in temporary repos; no new machinery. Tests that only prove member stacking are deleted with this reason: the behavior is removed by operator 1a. A test that also guards a holder-path regression keeps that guard, rewritten without members. Criterion 1 is new behavior ("two waiting leaves stay independent"): one deliberate break (re-adding a second leaf to the turn) turns its test red. No live model run.

## Leaf architecture

Owned surfaces: `src/batch.ts`, `src/next.ts` (`mergeTurn`, `reconcileBatch`, `mergeContext`), `src/phase.ts` (`requireBatchTop`, `batchCheck`, `batchPush`, `restack`, `finishPush`, the `check.fix` branch of `phaseCommand`), `src/attempts.ts` (`redMemberHeads`, `appendAttempt`), `src/state.ts` (`batchMemberSchema`, `BatchMember`, `batchSchema.members`, the nested empty-list delete and file-naming parse error in `readState`) (B,C), any other `src/` reader of `batch.members`, `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md` line on "merge verifies the stack top", `src/AREA.md` `buildStack` line, and the tests under `tests/` that build or assert members.

Delete:
- `pickMembers` (its `memberBase` call goes with it; `memberBase` itself stays for the holder's base in `mergeTurn` and the retirement range in `buildStack`), `redMemberHeads`, `BatchMember`, `batchMemberSchema`, `batch.members`. (C)
- `buildStack`'s member loop and `tips` map; it takes `builtOn`, the holder head and the retirement head and returns `{ ok: true; top } | { ok: false }`. The retired-lesson removal keeps the holder range only.
- In `mergeTurn`: the member snapshot, the "kept members" drift check and its `'rebuild'` loop; the `members` field of the `batch` timing event.
- In `reconcileBatch`: the member move and member `commitMove` loop and the `closable` list built from members; the holder path stays.
- In `phase.ts`: `requireBatchTop`'s "equal when members" branch (HEAD must descend from the recorded top, as the memberless path does today); `batchCheck`'s per-member trailer, issue-file and non-empty checks (the holder range check from `built_on` to HEAD stays); `batchPush`'s member drift check, member moves and member `commitMove`; `restack`'s member re-pick; `finishPush`'s member moves; the `check.fix` "stack red; holder turn restarts alone" branch, so a red on the holder always takes the memberless `transition` path.
- `mergeContext` loses `members=`.

Keep unchanged: the batch record's holder fields (`attempt`, `started`, `pressure_start`, `recorded`, `built_on`, `holder`, `tools`, `top`, `tested_top`, `tested_main`, `decision`, `candidate`, `notified`, `applied`); the solo path when the holder cannot rebase (`top` undefined); `--attempt` checks; `requireGreenReceipt`; the fast-forward push; `restack` of the holder after a non-fast-forward refusal; lost-push recovery in `reconcileBatch` through `candidate` ancestry of the tracking ref; `appendAttempt` red and merged lines.

History compatibility: `attemptRecordSchema.members` stays optional for reading old lines and is no longer written. The timing batch event schema keeps accepting an old `members` field the same way. The readers of these two files are `src/attempts.ts` and the timing readers in `src/timing.ts` / `src/timing-report.ts`; `akrogon flaky` reads `issues/verify-runs.jsonl` and is not affected (`src/flaky.ts`). (C) They must still parse framework's existing `issues/merge-attempts.jsonl` and `issues/timings.jsonl`.

In-flight records (5a): `readState` deletes a nested `batch.members` key before the strict parse only when its value is exactly an empty list, and the key is never written again. The existing top-level legacy-key strip in `readState` cannot reach a nested key, so this is a new nested delete beside it. (C) An empty list carries no member commits or state, so this normalizes a memberless record and is not upgrade code for a stacked merge. (B,C) A non-empty or malformed `batch.members` stays a loud parse failure, and `readState` wraps a parse failure so the error names the leaf's `state.yaml` path; it never rebases, restores, pushes, moves phases or discards member information. (B,C) Reason: every batch record saved today carries `members` (`mergeTurn` builds it with the key, `src/next.ts`), and a failed holder keeps its batch record indefinitely (`reconcileBatch` saves `{ ...batch, notified, recorded: true }` on a failed holder), so without the empty-list delete a drained queue would still break on records nobody can drain. (C)

Deploy timing: akrogon deploys itself when an akrogon leaf merges (`src/self-update.ts` `selfUpdate`, called from `mergeWake` on `merged`). Before this leaf's own merge, no leaf in a registered repo may hold a batch record with non-empty `members`; on 2026-10-19 no open leaf in akrogon or framework holds any `batch` record. The leaf's report records the same read at its merge.

Other readers: `verify.ts` `verifyCaller` keeps resolving the holder by `batch.attempt`. Stack prompt construction and assertions are removed from `tests/next.test.ts` (the prompt helper) and `tests/batch-dispatch.test.ts`. Unrelated `members` names stay: `tests/fake-herdr.ts` pane-member arrays, `src/status.ts` pack-member terminology and the `src/timing-report.ts` cohort `Member` counts. `src/status.ts` prints no batch field. (B,C)

Exclusions: command-only verify and push, B wake rules and the broadcast owner are leaf green-merge's. Framework suite reshaping is a separate framework chart. Parallel next-leaf testing is off route (4a).
