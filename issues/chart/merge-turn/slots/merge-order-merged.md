# merge-order, merged A, B, C

## Q1 · How should merges in one repo be ordered?
Evidence (A,B,C): `skills/merge-issue/SKILL.md:37,39,49` order is decided by push refusal after the run; `src/next.ts:627` prompts every merge seat at once. (B,C) lane-orphan-check: four rejected pushes after clean rebases (`fw:.../lane-orphan-check/review-B.md:89,102,115,128`); spec-mutation-anchors: core runs of about 1815-1847 s each (`fw:.../spec-mutation-anchors/review-B.md:105-113`). Attribution corrected per rebuttal B.
Research (A,B,C): Jane Street (Minsky, 2014): serial avoids invalidation, costs m x n. (B,C) Zuul, GitLab trains: speculation rebuilds downstream on failure, needs spare capacity. (C) bors: batch then fast-forward to the tested commit. (A) firstmate#4453: serial queue is enough for one machine.

- 1a (A,B,C recommend) Command-owned merge turn per repo. Only the earliest-entered leaf in `merge` gets B prompted; it fetches, rebases, checks and pushes as today. FIFO by a time stamp written into `state.yaml` at the move into `merge` (A,C; `src/state.ts:35-58` has no such field today). No lock file, no clock; holder is derived from state on every pass (A). Fast-forward-only push and retry at `SKILL.md:49` stay as the backstop for operator pushes and hand-built leaves (C, binding). Cost: the m x n wait stays; one stuck holder blocks the repo's merges (turn-release fork).
- 1b (B,C) Speculative train: more parallel suites on the same machine, restart cascade.
- 1c (A,C) Batch: one run for all waiting leaves; red batch needs ejection rule or bisection, multi-leaf owner, trailer guard reads leaves below. C: can be added later on top of 1a.
- Rejected (A,C): skill-held lock (dies with the seat); keep race and fetch earlier (polling, removes nothing).

Done-criterion (C): two leaves put into `merge` together produce one check run each and two fast-forward pushes with no rejected push.

## Q2 · Where does a waiting leaf wait, and does it keep its tab and `max_active` slot?
Evidence (A,B,C): `src/next.ts:309-312,334-337` counts any leaf with a live pane. (C) B's session is the reviewer's session (`fw:issues/log.jsonl:1554,1608`); `allocate` wipes scratch when no tab is live (`src/next.ts:369-370`). (C) Stall notices fire only for busy panes (`src/next.ts:210-215`), so an unprompted waiting seat is not flagged.

- 2a (B,C recommend) Stay in `merge`, unprompted, keep tab, panes and slot. `akrogon status` names the holder and each waiting leaf's place. Cost: waiting leaves hold capacity (akrogon global `max_active: 12`).
- 2b (A recommends) Same as 2a but a waiting leaf does not count toward `max_active` while unprompted. New leaves can start planning during a long queue. Cost: more live idle harness sessions than `max_active`.
- 2c (B,C) Close the tab and free the slot, reallocate at its turn. Cost: B loses review context, scratch wiped, the holder can be refused a tab.
- Rejected (C): new `merge.wait` phase (routing, docs, migration cost for no gain over status).

Shared pitfalls (A,B,C): completion wakes only `blocked-by` dependents (`src/next.ts:681-692`), so the next waiting leaf needs a wake path, pending in turn-release.

## Disagreement held
Q2: A (2b) vs B,C (2a). B,C reason: no new capacity rule, and a new leaf would eventually join the same queue. A reason: idle waiting seats use no CPU, and planning or implementing other leaves during a 3-hour queue is useful work.

## After rebuttals (B, C)
- Q1 1a gains a binding enforcement part (C): the command refuses merge work for a non-holder. Withholding the prompt alone does not stop a manual prompt, a resumed pass, or the check.repair seat that moves into `merge` and continues (`SKILL.md:16,25`, `src/routing.ts:33`). The holder check runs at the start of the merge pass and in `merged --check` (`SKILL.md:47`). Done-criterion: on a waiting leaf the check is refused and names the holder.
- Q1 1a FIFO is fully specified (B): stamp at the move into `merge`, ties broken by slug, leaves already in `merge` at ship time ordered by their last `to: merge` entry in `issues/log.jsonl`, then slug.
- Q2 2b cost restated (B,C): uncounted while waiting, counted once prompted, so live sessions can exceed `max_active` by the queue length and a resumed or check.fix leaf is never re-checked against the limit.
- Q2: A withdraws 2b. With `max_active: 12` and the worst observed queue of six, six slots stayed free; the operator can raise one number if needed (C). Recommendation is now 2a (A,B,C).
- SIGTERM (C): two merge-check kills at about 10 minutes, cause unknown. Under a turn, a harness time limit would fail every holder in turn. Kept in Fog, to become a probe before handoff: one solo `framework:verify` run by a merge seat, observed to finish.
