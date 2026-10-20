# stack-fate merged notes

## Options

- O1 delete member stacking; every merge turn is the holder alone (A,B,C). The holder rebase onto main in disposable state, lesson retirement, attempt record, receipts, fast-forward push, restack on a refused push and lost-push recovery all stay; they already form the complete solo path that follows every red stack today (A,B,C). Reopens the 2026-10-15 all-or-holder batching decision itself (A,B,C). Adds no cap, bisection, culprit, train or fill wait (A,B,C). Cost: one verify per leaf, so a green backlog drains at about one observed solo span per leaf, typically 12-13 min, not a hard floor (A,B,C); if the solo red rate later falls, stacking would pay again and would have to come back as a new chart with evidence (A,C).
- O2 keep stacking, mark a red head per head instead of per (head, base) (A,B,C). Smallest edit: drop `record.built_on === builtOn` from `redMemberHeads` plus one skill sentence and tests. Reopens only the red-skip key, whose stated purpose (let innocent members re-stack after main moves) earned nothing: 0 of 470 re-stacks landed (C). On history, 70.4 of 210.3 red minutes sat in stacks it would empty (C); a historical classification, not a guaranteed saving, because skipping them changes later queue state (B). Keeps all member code, every new head can still enter a red stack (B rebuttal), a red still names no culprit, and after the first red most waiting heads are excluded, so it drifts to holder-only anyway (A,B,C).
- O3 status quo per (head, base), rejected (A,B,C): the same heads re-stack red after every merge.
- O4 caps, bisection, culprit, trains, fill waits: still foreclosed (A,B,C). C notes a stack of 1-2 members only breaks even (about +3 min over the sample), so even a cap would not pay; not recommended.

## Measured, framework merge-attempts.jsonl, read 2026-10-19

- Full file, 333 attempts to 2026-10-19T03:00Z: 77 stacks with members, 4 merged, 72 red, 1 ejected. Red stack time 480 min, median about 2.8 min (A,B,C).
- Stacks landed 5 extra leaves ever (A,B,C), about 61-64 min of solo work saved, an estimate that assumes each would have passed alone (A,B,C).
- Brief snapshot, 267 attempts: net about -156 min (C). Full file: about -431 min illustrative, not a replay (B).
- Stacks of 8-18 members: 39 tries, 0 merged (C). Solo red rate about 24%, so an 11-leaf stack is all-green at most about 5% even with no interaction failures (C).
- The members were innocent: 51 of 53 red-stack slugs later merged as holder (A); 32 of 44 in the snapshot (C). No unchanged head ever landed as a member after a red stack (C).
- Re-stacking: 62 heads red on more than one base, 571 repeated member appearances (A,B,C); one head red on 21 bases (B).
- Every red stack is followed by the same holder solo; 51 of 72 merged (B).
- A member rebase conflict is skipped and does not turn a stack red (B,C). Red cause per stack (verify failure vs trailer refusal) is not established (A).

## What O1 deletes (A,B,C)

- src/batch.ts: `pickMembers`; the member loop and `tips` in `buildStack`. Keep the file, the holder rebase and lesson retirement.
- src/attempts.ts: `redMemberHeads`; new records stop writing `members`. Old lines must still parse (A,B,C).
- src/state.ts: `batchMemberSchema`, `BatchMember`, `batch.members`.
- src/next.ts: member pick, the drift/rebuild loop (so `mergeTurn` builds once, applies, dispatches) (C), member moves and closable tabs in `reconcileBatch`, `members=` in `mergeContext`.
- src/phase.ts: member checks in `batchCheck`, member drift refusals and moves in `batchPush`/`finishPush`, the membered `restack` branch, the membered `check.fix` special case and its `stack red; holder turn restarts alone` line (B,C).
- src/timing.ts: writer side only; old timing lines with `members` must stay readable (B,C).
- merge-issue skill: `members=` prompt form, stacking paragraph, member rules in attempt top, all-owner brief gathering, member drift and red-stack endings. Memberless rules become the only rules (A,B,C).
- Tests: member cases rewritten to "two waiting leaves stay independent" (B,C).

## Evidence, outside (read 2026-10-19)

- GitHub's own account, Smythe and Gripper 2024-03-06 (practitioner): large trains caused long waits; groups remove incompatible PRs (B). GitHub docs: failing PR removed, later groups rebuilt without it, never the same failing set unchanged (B,C).
- Rust rollup procedure (practitioner): batch by risk, remove the culprit on failure (B).
- bors-ng: batch all ready PRs, split on red (B); a max batch size was added later (C).
- Zuul, James Blair and current docs (practitioner): window halves on each failure (B,C); C reads that as falling toward serial testing at a high failure rate, B notes the default floor still keeps some parallel testing (B rebuttal).
- Mergify (practitioner): small batches with bisection, savings depend on failure rate (Danjou 2026-07-29, B; batch docs, C); a dynamic batch of at most 2 helped bursts but not daily volume (Maurin 2026-07-06, B).
- Synthesis: batching pays with parallel CI and culprit removal or splitting (A,C). Serial batching can also save checks when failures are rare; isolation and concurrency handle failures, they are not a precondition for savings (B rebuttal). Practitioners favor batching for long checks with rare failures (B); that is the condition that would reverse O1. Here failures are not rare (about 24% solo red) and the locks forbid splitting (A,B,C).

## Pitfalls and what removes them

- Removing too much breaks solo safety: delete member paths only; keep attempt ownership, receipts, refused and lost push handling; a test with two waiting leaves proves only the holder lands (A,B,C).
- A leaf mid-merge holds `batch.members` when the new release installs (A,B,C). Handling differs, see below.
- Code and skill skew: ship src and skill together; tests pin the two prompt forms `top=` and `solo` (C).
- Holder branch on a red solo top: today the restore to `holder.head` runs only with members; a criterion pins where `check.fix` finds the branch (C).
- Old history lines with `members` (attempts, timing) parse in every repo (A,B,C).
- A red holder used to look like a member failure; now every red is the holder's own and goes to `check.fix` (A,C).

## Open questions (fog)

- The solo turn itself is about 12-13 min and red about 24%, even though every leaf passed check first. No fork owns that; it is most of the queue drain time (C), and the map named holder check time as a separate problem.
- Record which check command went red in merge-attempts (C).
- "Without slowing solo merges": the holder's current behavior, or also a future mostly-green backlog (B)? O1 meets the first only.

## Where slots differ

- In-flight `batch.members` at upgrade: A, clear or reject loudly, never ignore. B, finish every old in-flight batch on the old release first and never silently discard on read, because a holder may already carry member commits or a candidate may be remote. C, discard `members` on parse, then continue solo only when the holder branch is restored to its pre-stack head and no remote candidate exists, otherwise clear the record and rebuild the holder alone; never throw (C rebuttal, current restore at src/next.ts reconcileBatch).
- Attempt record schema: A and B keep `members` optional; C drops it from the schema since `z.object` strips it. Both keep old lines parseable.
