# Merge gate, merged notes (A: merge-gate-A.md, B: merge-gate-B.md)

## Q1 adopt the same rule at merge
- Pick (A,B): yes. A red merge run (uncovered `checks` then `merge_checks` on the stack, skills/merge-issue/SKILL.md:41,51,71) takes comparison Taken: one same-command retry, then per-test comparison against the exact target the whole stack stands on (B: ordinarily batch.built_on, not a member's merge-base). Nothing new and nothing unverified: record the comparison and push through the normal tested-top/check/push flow. Any new failure keeps today's culprit/split/repair path (:73). The `--red-on-base` ending and repo hold are removed.
- (B) The command validates the comparison record bound to the attempt and tested revision pair before stamping `--check`; tested-top, attempt-id and fast-forward guards stay (src/phase.ts:409-447,487-499). Replace merge-issue SKILL.md:55 unconditional fix-forward on a broken default branch.
- Rejected (A,B): keep the hold (pile-up moves to merge); skip red commands without running; compare holder against its own old base; command-exit comparison; file-overlap holds (A).
- Cost (A,B): main can stay red longer; red-record must give each red an owner. A new failure inside an already-red test is hidden.
- Open for design (B): does the record cover all required merge checks or only red ones with separate completion evidence; how a green retry satisfies merge; retry budget per new candidate after restack.

## Q2 held.yaml and hold-fix/unhold
- Pick (A,B): retire the hold and its controls: no reads or writes of held.yaml, no hold-fix routing in mergeHolder, `hold-fix`/`unhold` removed and stale calls rejected with a clear error, docs/guide/next.md:119 and merge.md:29 updated, status hold line removed. Normal queue ordering and pause/unpause stay. An existing held.yaml is left in place as inert history, never converted into known-red evidence and never deleted at runtime (B; A had proposed a one-time status report).
- Live (B): held.yaml resolves under the akrogon home (`/home/ivan/Work/infra/akrogon/held.yaml`), absent; readHeld() returns {} today.
- Rejected (A,B): reshape held.yaml into the red record; keep consulting it until `unhold`; repurpose `unhold`/`hold-fix` for red-record.
- Pitfalls (A,B): remove every consumer (next gate, phase authorization src/phase.ts:822, status, unpause src/akrogon.ts:131-136); keep mergeQueue selection; a legacy nonempty hold fixture proves it is ignored. (A) The 2026-10-10 red-main-hold stale-clear lesson retires with the hold, with a criterion naming its history path. (B) Active merge seats are refreshed when the new skill lands, named as a deployment step.

## Corrections after rebuttal (merge-gate-rebuttal-B.md)
- R1 accepted: acceptance needs the seat's causal judgment against the whole-stack diff; a stack-caused defect blocks even in a test also red on base. Masking is a stated limitation, not permission.
- R2 accepted: /home/ivan/Work/infra/akrogon/held.yaml exists with an empty map ({}); ~/.config/akrogon/held.yaml is absent. Retirement must handle an existing file.
- R3 accepted: the stale-clear lesson stays active; the new red record's update and clear paths carry the lock-then-revalidate guard; retire the lesson only when every reachable path is guarded.
