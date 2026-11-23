# Signposts: lean-akrogon

## Question

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


Consultant angles: slots/signposts-B.md (B1-B8), slots/signposts-C.md (seven bullets plus ordering).

## Taken

A's picks (full autopilot, A answers the signposts), 2026-11-22:

1. Priority (changed from 1a after B1 and C1): reds, queue time, host load and spend are one loop around the serial merge lane. Rules: (a) host headroom is a floor, no change may raise overload to buy speed; (b) the land run gets first claim on CPU, IO and scratch inside akrogon.slice over leaf checks and seats; (c) inside that, land reliability, then queue time, then LLM spend. Whether new work is admitted by merge-queue depth (B1b, C2) is an opening-map question.
2. Any PC and any repo (2a plus B6, C3, C4): limits come from the host's own size and degrade to concurrency 1 or disk when the host is small or cgroup controls are missing. Causes inside a target repo's tests (framework full clones, big installs, tests that leave files) are seeded to that repo, not absorbed by a permanent akrogon part.
3. Reversals (3a plus B3): bringing back a removed mechanism needs the new fact that defeats its removal reason, from slots/history-reversals.md. Each chart names one figure, the script or ledger that reads it, its baseline before landing, and the value that would undo it.
4. Part count (4a plus B4, B5, C5): a change removes at least what it adds where it can. Anything akrogon creates dies with its owner's end, not by a later sweep. A sweep acts only on names carrying this home's id; the #151 naming fix lands before any new sweep (K5, P12).
5. Route 5a: direct, A implements, D reviews, one chart lands before the next. Each chart keeps state and ledgers readable by the previous and the new release and is safe for runs in flight at the release switch (B8).
6. Review-rule changes 6a, measure first (B7, C8): before P3 or P8, audit existing review-B.md files for the share of first-round Fix findings that are product defects vs record or proof-command gaps, and whether A's first review finds anything B lacks. A mechanical exit check at implement that removes a class beats moving the class to another seat.

Hard limits (A, with C6): no new daemon or long-lived service; no paid or grant-needing run; approvals stay the operator's; no change outside akrogon's repo except akrogon-owned systemd units; seed decisions are not reopened; every shortcut (rerun, auto-leave failed, reuse) has a finite cap and writes each use to a ledger a script can count.

Order (A, from B2 and C's ordering; final after the map): chart 1 land reliability = P1 plus its minimal cause and rerun record (part of P11), #151 naming, #150; then #148 (K1 first) with P5 merge priority; then bookkeeping cost (P9, P13 parts); then seat rounds after the review audit (P3, P7, P8); P6, P10, P14 only after re-measuring on the fixed lane.

Account: the session puts merge reliability and a non-overloaded host ahead of raw throughput, and gives up stateful speed parts (warm worktrees, lane sharding, stacking) until lands are measured reliable.

## Needs

none (A, 2026-11-22: no foreseeable operator-only need; a row is added if a chart needs a host change outside akrogon-owned units)

Copy; original in issues/chart/lean-akrogon/forks/signposts.md.
