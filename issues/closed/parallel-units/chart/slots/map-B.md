# B: #31 territory map

Read 2026-09-27. Scope: independent implement units only. Effort remains max.

Path keys: A=`/home/ivan/Work/infra/akrogon`; E=`/home/ivan/.pi/agent/extensions`; F=`/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-network-simplify`; S=`/home/ivan/.pi/agent/sessions`.

## Measured baseline

**F1.** Intake is an earlier snapshot. Completed content-batch children 1–7 span 11.0, 15.4, 27.5, 45.5, 31.2, 31.5, 51.5 minutes: 214 minutes total. Pairing {1,2}, then {4,5} after prerequisites saves approximately **42 minutes**, before isolation/integration overhead. Evidence: S/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-content-batch--/2026-09-27T01-47-21-014Z_01a0e08b-9c36-7465-837f-61487e14656f.jsonl:105–181, including child transcript pointers. Children record `swe-2-max`, unlike the Muse parent (first child transcript:2).

**F2.** Plan-script units 5/6 took 14.4/23.1 minutes, yielding another **14.4-minute** pairing opportunity. Their briefs explicitly disclaim implementation dependencies (F/satellite-foundation/plan-script/implementation/brief-5.md:5, brief-6.md:5). Timing: S/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-plan-script--/2026-09-26T19-39-24-439Z_01a0df3a-bf97-74f0-afa7-4ac7179cb810.jsonl:1–146 and 2026-09-26T19-53-54-940Z_01a0df48-07fc-74f0-afa7-4ac842737fec.jsonl:1–173.

**F3.** Manual brief audit identifies at least **8/23 sampled original units** with an independent partner after prerequisites: content-batch 1–3 and 4–5, plan-script 5/6/8, satellite-build none. This is a conservative candidate count, not an observed parallel success rate. Content evidence: F/satellite-content/content-batch/implementation/brief-{1,2,3}.md:24–30 and brief-{4,5}.md:17–30. Plan-script brief-8.md:5 pins shared shapes. Satellite-build brief-4.md:21 explicitly consumes brief-2/3 renderer outputs. No justified “halve implement time” claim.

## Forks and recommendations

**D1.** Have B judge dependency waves from interfaces, required outputs and verification needs. Record predecessors and edit ownership in existing briefs. Do not parse prose into a new scheduler. Planning already requires actual ordering dependencies (A/skills/plan-issue/SKILL.md:55–57).

**D2.** Use separate worker worktrees, one accepted base per wave, parent-owned integration. Prefer explicit checkpoint commits plus worker commits over importing the old patch machinery. Git supports separate working trees and indexes ([worktree docs](https://git-scm.com/docs/git-worktree), read 2026-09-27). The old helper starts from HEAD despite allowing dirty parent work, so later waves can miss prior edits (E/issues/.scripts/lifecycle/packet-scratch-worktree.ts:71,107).

**D3.** Start with two concurrent workers per implement seat, preserving serial execution for dependent units. Extend existing Pi admission, not akrogon lifecycle states (E/tamdoma-subagents/manager.ts:327,1205; A/src/config.ts:32). Retain B’s final integrated checks (A/skills/implement-issue/SKILL.md:45).

## Practitioner questions and pitfalls

**Q1.** Can each worker pass its checks without another worker’s unmerged output? **Q2.** Who owns shared schemas, manifests and fixtures? **Q3.** What accepted base and unfinished edits survive interruption?

[Wilson Lin](https://cursor.com/blog/scaling-agents) ran hundreds of agents and rejected flat locking in favor of planners/workers. [Nicholas Carlini](https://www.anthropic.com/engineering/building-c-compiler) ran sixteen with task claims and independent clones. Both need separable work and strong verification. They disagree on coordination hierarchy. Existing B already supplies ownership, so retain it. Both read 2026-09-27.

**R1.** Disjoint files do not prove independence. Old policy also serializes every declared dependency, even satisfied ones (E/issues/.scripts/lifecycle/packet-parallel-policy.ts:80–107).

**R2.** Worktrees are not sandboxes (E/tamdoma-subagents/README.md:78). Preserve partial work and retirement accounting. Closed admission history explicitly excluded concurrency (E/issues/closed/subagent-admission-stall/chart/CHART.md:18–30).

## Ranked changes

**A1.** Add dependency-wave instructions to plan, brief and worker protocol. **A2.** Add minimal worktree/checkpoint/integration handling. **A3.** Enable two-worker Pi admission with cancellation, waiting and retirement tests, then measure elapsed time including integration on a real leaf.
