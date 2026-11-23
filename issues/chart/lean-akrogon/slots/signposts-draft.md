# Signposts draft (A, before consultant angles)

Session: full autopilot over Tamdoma/akrogon#148, #149, #150, #151 and the operator note (INTAKE.md). Locks: seed-148-decision, seed-149-decision (forks/).

1. What wins when two goals conflict?
   - 1a Land reliability first: a land run fails only for the leaf's own code; then queue time; then host load; then LLM spend. (recommended: a red land costs a whole lane turn plus a repair seat round, so it multiplies every other cost)
   - 1b LLM spend first.
   - 1c Host load first.
   Steers: chart order, and which side every trade-off fork picks.
2. Which PC do designs target?
   - 2a Any PC: limits are derived from the host's own size (RAM, cores, tmpfs size), never fixed numbers tuned to the 123 GB host. (recommended: operator said "any PC")
   - 2b This host only.
   Steers: #148 K4 budget, P5 weights, max_active defaults.
3. How do we treat a proposal that brings back something removed before?
   - 3a Allowed only when the chart names the new fact that defeats the reason it was removed, from the history file. (recommended: stops flip-flops)
   - 3b Judge each on its merits only.
   Steers: P1 (rerun), P14 (stacking), K2 (tmpfs), K3 (red evidence).
4. What does a change have to do to the part count?
   - 4a Remove at least as much as it adds where it can; a new mechanism needs the measured cost it removes. Prefer deleting a gate over tuning it. (recommended)
   - 4b Part count is secondary to speed.
   Steers: P6 lanes, P10 warm worktrees, P11 ledger fields, P12 test slice parent.
5. What route?
   - 5a Direct route, A implements, D reviews, per the operator's words; one chart lands before the next starts. (recommended: operator's explicit words)
   - 5b Lifecycle leaves.
   Steers: chart size; each chart must fit a direct attempt (12 review rounds).
6. Review-rule changes (P3 B repairs test expectations, P8 mechanism binding) touch how seats work on every repo.
   - 6a In scope; A picks with consultant evidence; the change is reported to the operator in the pass-end line. (recommended: operator said "everything is open")
   - 6b Hold for the operator.
   Steers: whether the LLM-spend chart exists this session.

Hard limits (A): no new daemon or long-lived service; no paid or grant-needing run; approvals stay the operator's; no change outside akrogon's repo except akrogon-owned systemd units it already writes; seed decisions are not reopened.

Order (proposed, A finalizes after the map): land reliability (P1, #151, #150) → run scratch (#148 K1-K5) → host and bookkeeping (P5, P9, P10, P12, P13) → seat rounds and LLM spend (P3, P7, P8, P11) → later (P6, P14).

Needs sheet (operator only): none foreseen. A row is added if a chart needs a host change outside akrogon-owned units (for example a tmpfs mount on a PC without one).
