# Wave plan

## Question
Q1. Keep the no-clock lock for this chart?
Q2. Which lever goes first against serial worker time: the plan writes an explicit wave table and "one at a time when unsure" is deleted (C), one leaf per wave at charting (A), or both?

### Carries
- leaf-run-stalls Off route: "Any clock, watchdog, elapsed trigger or numeric size gate (locks, A,B,C)."
- stuck-seat-recovery Off route: "A time limit or restart verb for hangs with no known cause."
- Operator (leaf-run-stalls failed-stop-race): "I want to be removed as much as possible from the entire process."
- Operator 2026-10-01 (INTAKE.md): sessions over 2 hours to merge "is not how it's supposed to work".

## Findings
See ../slots/map-merged.md M1-M5 and the rebuttal corrections.
- skills/plan-issue/SKILL.md:55 "ordered file/criterion checklist". skills/implement-issue/worker-protocol.md:11 "waves of up to 3 ... one at a time when unsure". tamdoma-subagents has no concurrency cap (manager.ts:29).
- 84% of worker wait in long implement phases is single-worker waits. Part of that is real dependency depth (one-client-link, emdash-kit after U6), so the wave table removes only the fallback part (B F1, C R3).
- Research 2026-10-01. Practitioner: Anthropic engineering, "How we built our multi-agent research system" (https://www.anthropic.com/engineering/multi-agent-research-system): parallel subagents with clearly divided responsibilities cut research time by up to 90%, at higher token use. Practitioner: Walden Yan, Cognition, "Don't Build Multi-Agents" (2025-06-12, https://cognition.com/blog/dont-build-multi-agents): parallel agents on one task make conflicting implicit decisions, so default to one linear agent. The condition that flips Yan's advice is shared decisions made explicit before the split. akrogon already has that: plan.md D1..Dn, sub-briefs with owned paths, and a serial cherry-pick with changed tests after each pick (worker-protocol.md:11). That favours waves here.

## Taken
Operator 2026-10-01, verbatim: "1a | 2a".
- Q1 1a: the no-clock lock stays. Fix the cause, and accept that a leaf with a long real dependency chain can still run over 2h. Foreclosed: 1b, a phase ceiling that ends `failed`.
- Q2 2a: plan.md groups its checklist into waves. Each unit lists owned paths, shared test resources (a live fixture counts) and the units that must land first. Units with disjoint paths, no shared resource and no prerequisite share a wave of up to 3. implement-issue and worker-protocol drop "one at a time when unsure" and run each plan wave whole. check.fix repair briefs follow the same rule. Wording only, with no code, state field or clock. Foreclosed: 2b, one leaf per wave (a numeric size gate, already locked off route, C R4), and 2c, no change. Success is measured afterwards as worker wait width per phase (C R3, P4), not phase wall time.
