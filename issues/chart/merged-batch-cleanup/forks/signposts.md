# Signposts: merged-batch-cleanup

Original for the door session opened 2026-11-09T14:14:01Z in door t15 (chart merged-batch-cleanup). Full autopilot: A answers. Angles merged from slots/signposts-A.md and slots/signposts-B.md. Proposed answers from the latest earlier record (issues/chart/autopilot-needs-and-test-isolation/forks/signposts.md) are carried where they match (2a cause over limit, 3a reach, 6a proof spending).

Settled by the operator's words, not asked: full autopilot, lifecycle route, consultant B (codex), one handed report (#132), most elegant solution.

## Question

1. Completion: once a pass removes a merged leaf's last cleanup blocker, how directly must cleanup finish?
   - 1a (recommended, A,B) In that same invocation, through the existing cleanup path, keeping every existing safety veto and broadcast retention.
   - 1b Schedule a separate cleanup invocation.
   - 1c Periodic reconciliation (timer) as a safety net.
   - Steers: mechanism fork, lock boundaries, acceptance test (one releasing invocation suffices).

2. Reach: which release routes does the fix cover?
   - 2a (recommended, A,B) Every merged-leaf batch-release route in the orchestration (the already-merged holder and the `merge` holder `commandMerged` moves inside the pass).
   - 2b Only the observed already-merged route.
   - 2c All finished-leaf retention, failed leaves and listener behavior included.
   - Steers: fork coverage, regression cases.

3. Removing over adding: remove the transient state or add a second cleanup step?
   - 3a (recommended, A) Remove the window where safe; a second cleanup call only if removal is unsafe.
   - 3b Smallest diff wins.
   - Steers: mechanism options.

4. Interruption: must cleanup also survive a killed releasing pass?
   - 4a (recommended, B) No new durable work: a successful pass completes cleanup, existing startup/resume recovery covers interruption.
   - 4b Add durable cleanup work.
   - Steers: no new persisted flags or queues.

5. Visibility: also show a kept-for-batch merged leaf as a leftover in `akrogon status`?
   - 5a (recommended, A) No. Recorded only.
   - 5b Yes.
   - Steers: leaf count.

6. Proof spending.
   - 6a (recommended, A,B) No paid calls and no live mutations: deterministic local tests with isolated fixtures, plus required checks. The stale framework leftovers are not a completion requirement.
   - 6b A disposable private hc session rehearsal.
   - 6c Live replay on the framework leaf.
   - Steers: needs sheet, proofs, grants (none).

7. History: must the old herdr path be reconstructed?
   - 7a (recommended, B) No: a current-code reproduction and causal explanation suffice; history is read only where it changes the implementation.
   - 7b Yes, identify exactly how old herdr supplied the extra pass.
   - Steers: fork order.

Reply key: `1a 2a 3a 4a 5a 6a 7a`, or numbered free text.

Challenge check: none. B and A agree on every shared question; 3 and 5 are A-only angles, 4 and 7 B-only, with no contrary position from the other slot.

## Taken

A's picks under full autopilot (2026-11-09T14:19Z, door t15), not operator words: `1a 2a 3a 4a 5a 6a 7a`.

Reasons: 1a by the report's expected behavior ("should not depend on a later, unrelated pass") and the operator value removing over adding (no timer); 2a by evidence (both release branches run after cleanup); 3a by the operator's "most elegant solution"; 4a by simplicity, the report names no crash case; 5a by simplicity; 6a by evidence, nothing needs a paid or live call; 7a by evidence, the hc listener's event set (src/listen.ts) explains why no later pass came.

What the session prioritizes and gives up (A): a pass that finishes its own cleanup, by the smallest structural change, proven in local tests. It gives up a periodic safety pass, crash-durable cleanup, a leftover display change and an old-herdr reconstruction.

## Needs

none (asked with this round, 2026-11-09T14:19Z). No key, login, file, grant or paid approval is foreseen.
