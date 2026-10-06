# merge-order rebuttal, slot C

Read only `slots/merge-order-merged.md`. Three disputes. Everything else in the merged round stands.

## 1 · 1a enforces the turn only by not prompting, and that is not enough

The merged 1a says "Only the earliest-entered leaf in `merge` gets B prompted". A withheld prompt stops a seat that waits for prompts. It does not stop these:

- A manual prompt. `skills/merge-issue/SKILL.md:16` supports "a manual prompt naming a slug without `leaf=`", so the operator or a watcher can start a merge pass on a waiting leaf.
- A seat that keeps going. Seat B itself makes the move into `merge` from `check.repair` (`src/routing.ts:33`), in the same session that then merges. Nothing in the command stops that session from continuing into the merge steps.
- A resumed pass. `SKILL.md:25`: "a resumed merge inspects the existing rebase, diff and remote ancestry to complete remaining work."

In each case a second leaf runs the suite and pushes, and the race is back with no signal. The fix belongs in 1a as a binding part: the command refuses for a leaf that does not hold the turn. The existing pre-push call is the place, `akrogon phase <slug> merged --slot B --check` (`SKILL.md:47`, `src/phase.ts:232-235`), and merge-issue makes the same check its first step, so a non-holder stops before the 35-minute run and not after it. Add a done-criterion: `merged --check` on a waiting leaf is refused and names the holder.

## 2 · Q2: slot C still holds 2a, and withdraws one of its own reasons

A's point is fair that an idle seat uses no CPU, and the merged line "a new leaf would eventually join the same queue" is weak. A new leaf takes hours to plan and implement, and the queue may be empty by then. Slot C withdraws that reason.

2a still wins on the merged file's own number. It states akrogon's global `max_active: 12`. The worst observed queue was six leaves in `merge` (`fw:issues/log.jsonl:1547-1560`). Six slots stayed free, so under 2a new leaves could still start that day. 2b adds a second meaning to `max_active` for a shortage that did not occur. If it does occur, the operator raises one number, which `docs/guide/in-practice.md:75` already describes.

2b also has a cost the merged round does not state. Under 2b a leaf is uncounted while waiting and counted once prompted, so the count can sit above the limit with no check at that point, and the limit no longer bounds live harness sessions. The merged cost line says "more live idle harness sessions than `max_active`" and should add that the number is unbounded by any setting: it is the limit plus the queue length.

## 3 · The unexplained SIGTERM kills are missing from the merged round

Slot C's round raised it and the merged file dropped it. Two merge checks on 2026-10-05 were killed by SIGTERM with no cause found (`fw:issues/open/skill-rewrite-tooling/spec-mutation-anchors/review-B.md:67-71`, `slice-boundary-anchors/review-B.md:91,104`). `spec-mutation-anchors` left `merge` about 10 minutes after entering it (`fw:issues/log.jsonl:1547,1555`), which fits a harness time limit on one command as well as it fits contention.

This matters more under 1a than today. If a time limit kills a 35-minute run, each holder fails in turn and the queue never drains. It should be a named probe before handoff: one solo `framework:verify` run by a merge seat in the way the skill tells it to run checks, observed to finish. If the probe fails, how the seat runs long checks becomes its own question.
