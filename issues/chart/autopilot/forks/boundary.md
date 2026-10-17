# Boundary

## Question
Q1 Which decision points may an autopilot door answer itself, and which must it hold for the operator (leaving that chart waiting and moving on)? Candidates to hold: live-change grants, needs sheets and outside-account keys, human-only prerequisites, the direct route, work outside the intake named at switch-on, changes to the door's own rules, questions needing a fact only the operator has, reopening an earlier operator answer.

### Carries
- Intake: charting only, every step kept, A answers (INTAKE.md, operator 2026-10-16).
- skills/chart-issues/SKILL.md Take (grants, needs, human-only prerequisites, proofs; no waiver), Direct route (push authority).
- skills/chart-issues/assets/questions.md:31 "Recommendations and silence cannot supply an operator answer."
- History: slots/history-repos-A.md, slots/history-transcripts-A.md (09-26 cross-repo sweep; E3 operator-only inputs not listed; E8/E9 unasked overnight changes).
- Opening map: slots/map-merged.md fork 1.

## Findings
Notes: slots/boundary-A.md, slots/boundary-B.md, slots/boundary-C.md. Merged: slots/boundary-merged.md. Rebuttals: slots/boundary-rebuttal-B.md, slots/boundary-rebuttal-C.md.

- operator · INTAKE.md 2026-10-16 · charting only, every step kept, A answers; several doors at once (A,B,C).
- operator via agent history · slots/history-transcripts-A.md E3, E8, E9; slots/history-repos-A.md 09-26 · regret came from operator-only inputs not listed, unasked overnight changes, and autonomy past what the operator started (A,B,C).
- better-than-training · skills/chart-issues/SKILL.md at f7baddc :57 no narrowing to dodge a proof; :61 grant limits (identity, account, targets, operations, expiry); :65 save approval is the operator's; :69 narrowing for absent machinery happens "with the operator at this review"; :73 seed matches "act only on operator confirmation"; :99 direct includes push authority (A,B,C).
- practitioner · Anthropic, "Building effective agents", anthropic.com/engineering/building-effective-agents, read 2026-10-16 · "Agents can then pause for human feedback at checkpoints or when encountering blockers"; autonomy brings "the potential for compounding errors" · supports gating by kind of action rather than one global switch (A).
- Rebuttal outcomes: B F1 holds apply when authority is absent, exceeded or expired, not as blanket bans; B F3 a fixed list breaks as the skill changes, use a test; C 1 proof-dodge narrowing is already locked, only machinery narrowing is a real choice; C 4 existing grant covers only the same leaf, identity, targets, operations, unexpired; C 5 main steps that change code or rules are a hold candidate; C 6 seed matches need confirmation, fit is not confirmation; C 7 input holds resume, answer holds wait for an operator answer.
- Differences for the operator: direct route (A,C hold vs B decide); scope edges (A,C hold vs B decide); machinery narrowing and model block (C hold, A moved to C, B decide); changes to chart-issues itself (C hold vs B decide unless authority rules).

- Medin material (operator source, INTAKE.md): notes slots/medin-A.md, medin-B.md, medin-C.md, merged slots/medin-merged.md, rebuttals slots/medin-rebuttal-B.md, medin-rebuttal-C.md.
- practitioner · Cole Medin, github.com/coleam00/ai-software-factory README at 54f1c4a, :1-11 and :318, read 2026-10-16 · "You plan the release... You test it in staging"; "Review does not reliably notice an agent editing the files that govern it (a reviewed delivery once rewrote engineering.md and merged)", fixed with path-based holds needing a human · moves Q6 recommendation to hold by path (C), and adds an intent hold (A,B,C).
- practitioner · Dex Horthy, "Why Software Factories Fail", ai.engineer/talks/harness-engineering-is-not-enough-why-software-factories-fail and github.com/humanlayer/advanced-context-engineering-for-coding-agents wsff.md (2026-07-22), read 2026-10-16 · human judgment moves earlier: product review, architecture, program design; small obvious fixes exempt (A,B).
- practitioner · Dan Shapiro, "The Five Levels" (2026-01-23); StrongDM factory.strongdm.ai (2026-02-06), read 2026-10-16 by B,C · the human writes and argues the spec, then leaves (B,C).
- Intent hold difference: hold at that fork, nothing downstream drafted (A,C; C rebuttal 1, SKILL.md:55 answers reshape later forks) vs draft and hold at handoff (B).

## Taken
- 2026-10-16 operator, verbatim in INTAKE.md "Boundary answer": "if this is gonna be autopilot, then it's gonna be autopilot... I don't want the middle ground." Taken: inside autopilot A answers every question, with the consultants named for that session (none, one or several), judged by the operator's universals (simplicity, function over form, removing over adding, systems thinking, speed, price). Earlier round questions 1-7 collapse into this. Purpose: incoming, non-original work such as bug fixes. Shape and peer checks: slots/boundary-shape.md, slots/boundary-final-check-B.md, -C.md.
- Binding from the checks: existing checks still stop a handoff and A repairs (K1). A alone has no direct route (K2).
- 2026-10-16 operator follow-up, verbatim in INTAKE.md "Boundary follow-up answer": 1a, 2a, 3a. Taken (shape slots/boundary-shape-2.md, checks slots/boundary-final-check-2-B.md no disagreement, -C.md F1-F2 applied):
  - Autopilot charts only the work handed at switch-on and pulls in nothing new during the run. Where new incoming work enters is not assigned here; charting is the first part and separate.
  - Approvals for live outside-account changes (grant approval, fixture retention, secret-save approval) wait for the operator. That chart waits and the door moves on (SKILL.md:47).
  - Right after the operator starts /chart-issues in autopilot, once the handed work is read (SKILL.md:33), A shows a best-guess list of things to supply (logins, API keys, files), each with purpose and destination. Approvals are not on it and stay with the operator. The later needs sheet and presence check (SKILL.md:59) still run. A missing need found later makes that chart wait.
  - Autopilot never changes its own switch or limits. Only the operator does.
