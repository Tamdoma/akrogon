# Merge gate

## Question
Q1. Does the merge turn adopt the same rule (merge when the stack adds no new failures against the target it stands on), replacing the #67 hold that stops every merge while main is red?
Q2. What happens to existing `held.yaml` records and the `hold-fix`/`unhold` commands?

### Carries
- Merge hold today: src/phase.ts:797-801,844-877, src/next.ts:1044-1072, src/hold.ts. Lesson 2026-10-10 red-main-hold stale clear.
- B final check F4/F5: evaluate the actual stack and its target; removing #67 is an explicit operator change; keep pause/freeze controls.

## Findings
- Merged: slots/merge-gate-merged.md (A, B, rebuttal B). Q1, Q2 agreed (A,B) after corrections R1-R3.

## Taken
Operator, 2026-10-10: "1a | 2a |"

Decision:
- Q1 1a: a red merge run takes comparison Taken (one same-command retry, then per-test comparison against the exact target the whole stack stands on, ordinarily batch.built_on). The stack pushes through the normal tested-top/check/push flow only when every remaining failure is known-red on that target, the seat judges no cause in the whole-stack diff, and no required coverage is unverified. Any stack-caused failure, including one inside a test also red on base, keeps today's culprit/split/repair path. The command validates the comparison record bound to the attempt and tested revision pair before stamping `--check`; tested-top, attempt-id and fast-forward guards stay. merge-issue SKILL.md:55 unconditional fix-forward and :73 base-red ending are rewritten.
- Q2 2a: retire the repo hold: no reads or writes of held.yaml, hold-fix routing removed from mergeHolder, `hold-fix` and `unhold` removed with stale calls rejected by a clear error, status hold line and unpause hold print removed, docs/guide/next.md:119 and merge.md:29 updated. Normal queue ordering and pause stay. An existing held.yaml (today /home/ivan/Work/infra/akrogon/held.yaml, `{}`) is left as inert history, never read, never converted, never deleted at runtime. A legacy nonempty hold fixture proves it is ignored.
- The 2026-10-10 red-main-hold stale-clear lesson stays active; the red record's update and clear paths carry lock-then-revalidate.
- Deployment step: active merge seats are refreshed when the new skill lands (owner named in the leaf contract).
Reason: keeping the hold moves the pile-up to merge; the operator already removed waiting before merge.
Limit: a new failure inside an already-red test can stay hidden when output and review cannot expose it.
Foreclosed: keep the hold; optional hold switch; reshape held.yaml into the red record; repurpose hold-fix/unhold.


Note 2026-10-10 (slots/from-chart-framework.md): merge-time base runs are logged by `akrogon base-run` under the merge attempt's issue folder with the parent attempt id; the merge comparison record references that log. Compatible with Q1.
