# Map merged: #33 and #34

Read 2026-09-28. Raw maps: map-A.md, map-B.md, map-C.md in this folder. The #34 half also serves chart-peer-panes.

## #33 failed leaf names a defect in a merged sibling

Cause (A,B,C):
- `skills/watch-issues/SKILL.md:38` sends a reason naming an operator decision or external step to notify-only. `:39` only re-runs the same phase. A blocker naming an owning leaf fits neither usefully.
- `SKILL.md:53` forbids editing `issues/`, so the watch cannot open a fix leaf. The chart door is attended and operator-invoked (`skills/chart-issues/SKILL.md:3,10`).
- `src/phase.ts:186` makes merged terminal. There is no reopen verb (`src/akrogon.ts`). Framework `live-replay/design.md:46` promises "the owning leaf reopens" with no command behind it.
- `SKILL.md:45` stops only when every remaining leaf is a notified human-prerequisite failure. A blocked dependent (update-replay) keeps the cron alive forever. `src/next.ts:536-539` will never dispatch it while a prerequisite is unmerged. (A,B,C) B adds that the Waiting rule at `:36` may call `next` on it and get a predictable dependency error each tick.
- It recurs. live-replay was resumed by hand at 09:47Z and failed again at 10:25Z on a second upstream defect (content-batch provenance). Resuming without a fix is the unproductive cycle `:39` already counts. (A,C)
- The owner is not always settled. The first report names content-batch, research-pools and arch-differentiate-satellite-anatomy, and says the seat cannot decide whether the data or the gate should change (`live-replay/implementation/report.md:81`). (B)

Forks:
- K1 No reopen. A defect in merged work becomes a new fix leaf with its own review. (A,B,C) Source: `phase.ts:171,186`, `next.ts:564-565` removes the merged worktree. The framework design line is a consumer edit, off route. (C)
- K2 Stop rule counts dependents. A leaf whose unmerged prerequisites all lead to a notified human-prerequisite failure counts as waiting on that failure, so the watch notifies once and stops. The final notice names how to restart the watch. (A,B,C) Pitfalls (B): an unreadable inventory, a runnable independent leaf, or a running repair prevents stopping. An earlier `delivery=shown` does not prove a new routing notice was sent.
- K3 Who turns the blocker into a fix leaf. The operator decision that reshapes the rest.
  - (C) Watch escalates once with the owner and exact action, counts it as needs-you, and stops. The operator charts the fix. No `issues/` write.
  - (B) Same escalation, plus a sanctioned repair door the watch may use only for an already-settled repair, reusing a matching fix leaf first. Needs an explicit authorization contract that neither skill grants today.
  - (A) The failing leaf fixes a small sibling defect inside its own branch when its brief owns "make the live run pass". No new leaf. B's `report.md:81` evidence cuts against this: the seat would be choosing policy (data vs gate).
  - Foreclosed by all: the watch runs the chart door unattended, or an `akrogon reopen` verb.
- K4 Structured owner field. (C) `akrogon phase <slug> failed --owner <slug>` so the watch reads a field, not a sentence. Only needed if K3 routes automatically.

Practitioner: Erlang supervisors restart children and never rewrite the supervision tree (C). Idempotent retries need a durable repair identity so two ticks never open two fixes (B, Featonby, AWS Builders' Library). No tick counter or elapsed limit, per the no-clock lock. (C)

Destination: one akrogon watch-issues leaf for K2 plus the K3 escalation. A repair door, if chosen, is a separate later destination. (B,C)

## #34 consultant panes layout

Cause (A,B,C): nothing creates peer panes. `skills/chart-issues/SKILL.md:23` and `assets/questions.md:44` expect the operator to supply them.

Live surface (A,B,C): `herdr pane split <A> --direction right --ratio 0.5 --cwd <root> --no-focus`, then `herdr pane split <B> --direction down --ratio 0.5 --cwd <root> --no-focus`. With only B, skip the second split. No `pane move` needed. akrogon already does the same for seats in `src/next.ts:280-330` `allocate`. (C) Split order matters: A first, then the right pane, or the ratios come out 25/75. (C)

Forks:
- K5 Who creates B and C.
  - (B,C) The door creates them when the operator asks for peers, starts each harness with `herdr agent start`, and names them. Supplied panes still work, as a separate branch.
  - (A) Keep supplied panes and add the two split commands to the skill.
  - Pitfall (B,C): the door must know each peer's harness and model. `akrogon config` has lifecycle seats a and b only, so ask once at open. `herdr agent start` needs a shell prompt, which a fresh split gives.
- K6 Rearranging an existing wrong layout. (B,C) Out of scope. Guarantee layout only for panes the door creates. Never move unrelated panes. A same-tab move would be a herdr feature.
- B-only layout: B takes the whole right half. (B,C)

Destination: one small chart-issues skill leaf. (A,B,C)
