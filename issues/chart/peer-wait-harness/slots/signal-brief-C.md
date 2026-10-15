# Fork notes brief, slot C: turn end signal

You are slot C in the peer-wait-harness chart (akrogon repo /home/ivan/Work/infra/akrogon, origin/main f3557d8). Write your own notes blind; do not read other slots' files in slots/ for this pass.

Intake: /home/ivan/Work/infra/akrogon/issues/chart/peer-wait-harness/INTAKE.md (Tamdoma/akrogon#91, lesson learnings/history/2026-10-15-peer-wait-antigravity-idle.md).
Current fork: /home/ivan/Work/infra/akrogon/issues/chart/peer-wait-harness/forks/turn-end-signal.md (Question, Carries, Findings).
Code: skills/chart-issues/scripts/peer-wait.ts, peer-ask.ts, tests/peer-wait.test.ts, tests/fake-herdr.ts.

New facts since the Findings were written (A, 2026-10-15):
- The machine harness config (`akrogon config` `harnesses:`) now lists only claude, codex and pi. agy is not configured. The operator replaced the agy seat with pi today.
- Live peers today: codex (w8:pNQ) and pi (w8:pPY) finished every peer-ask exchange this session with outcome `done`; none returned `failure`.

Questions to answer, each with file:line or outside-source evidence:
1. Is agy still in scope? If agy is out, what remains of #91's destination: does codex or pi show idle or done inside one open turn (subagents, long tool calls, silent thinking)? Cite herdr's detection for codex and pi (manifests, hook authority) and any recorded false failure.
2. Q1 as reshaped: for a non-Claude peer seen idle with no return file, should peer-wait (a) never report failure on idle and wait out the budget, (b) use a per-harness turn check where one is proven (pi hook state, codex rollout `task_complete`), or (c) something else? What does each option break or invite later (dead peer cost, new harness added, session replacement)?
3. Q2: should `done` (process exited) still give `failure` while `idle` does not? What does herdr report for an exited pi or codex process?
4. Any proof call needed before handoff (exact command), and any machinery a leaf would need that is missing (for example a status sequence in fake herdr).

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/peer-wait-harness/slots/signal-C.md: picks with reasons, evidence, pitfalls. Edit no other file.
