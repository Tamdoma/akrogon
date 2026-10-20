# Brief: solo-turns

## What

Every merge turn lands the holder alone. The command stops stacking waiting leaves onto the holder: no member snapshot, no member rebase, no member tips, no red-member skip, no "stack red" restart. The turn keeps everything the holder already gets today: the disposable rebase of the holder onto the fetched remote base, the retired-lesson fixup on the top, the `attempt=<id> top=<sha>` prompt (or `attempt=<id> solo` when the holder cannot be rebased mechanically), `merged --check`, the fast-forward push, the non-fast-forward restack of the holder, and crash recovery of a landed push. A red merge verify moves the holder to `check.fix` as the memberless red path does today. Leaves waiting in `merge` are never touched by another leaf's turn and each takes its own turn in merge-queue order.

## Why

Stacking costs more than it saves. Framework `issues/merge-attempts.jsonl`, 2026-10-10 to 2026-10-19: 77 stacks landed 5 extra leaves and spent 480 min on 72 red stacks; 51 of 53 leaves from red stacks later merged alone; 62 heads went red again on another base. Solo merge red rate is about 27%, so a stack of several leaves is almost always red, and each red stack costs a full merge verify with no leaf landed. Deleting it also deletes the member code paths in the batch record, the push, the restack, the reconcile and the merge skill. Operator 2026-10-19 took 1a (delete member stacking) on chart issues/chart/merge-stacks.

## Done-criteria

1. Two or more leaves wait in `merge`: the holder's turn prompts only the holder's B with no `members=` part, one merge verify runs on the holder's rebased top, the push lands only the holder, and every other waiting leaf's branch, worktree and phase are unchanged until its own turn.
2. A red merge verify on the holder ends with `check.fix --slot B --attempt <id>` moving the holder to `check.fix` and recording one red line in `merge-attempts.jsonl`; no "stack red" restart exists.
3. A non-fast-forward push refusal restacks only the holder onto the new remote tip and prints the existing `rerun tested=... pushed=...` or `rerun rebase <slug> onto <sha>` line; a crash after a landed push still moves the holder to `merged` exactly once on the next run.
4. History written before this change still reads: `merge-attempts.jsonl` and `timings.jsonl` lines carrying `members` parse in every reader that reads them (`src/attempts.ts` attempt history and the timing readers in `src/timing.ts` / `src/timing-report.ts`). (C) A leaf `state.yaml` whose `batch` carries an empty `members` list reads exactly as if the key were absent and resumes as the same holder attempt. (B,C) A `batch.members` that is non-empty or malformed is refused loudly, and the error names that `state.yaml` path. (B,C)
5. No member stacking code remains in `src/`: no `pickMembers`, no `redMemberHeads`, no `BatchMember` type, no `members` field on the state batch record (`batchSchema`), and `buildStack` takes the holder only. The history schemas (`attemptRecordSchema`, the timing batch event) keep accepting `members` on old lines per criterion 4. (C)
6. `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md` and `src/AREA.md` describe a merge turn as the holder alone, with no members, member tips or stack-red ending.
