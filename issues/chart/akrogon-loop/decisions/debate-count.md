# Debate Count

Chart skill version: 4

Status: resolved
Type: grilling

## Question

July 28 ran two full slot A and B debates before code: planning (P-draft, P-synth) and implementation (I-draft, I-synth). The door now locks decisions. Do both debates stay, does planning fold into the door leaving only the implementation debate, or something else? Whether the rebuttal round stays a per-repo flag. Hierarchy: simplicity, cost, quality, speed.

Coverage pass 2026-09-08 adds: the fixed roles, slot A strategist and planning synthesis, slot B implementer and implementation synthesis, slot A audits (intake 119, 127). Two switches, not one: the consult election at the door turns the whole debate on or off per issue and is locked (151), the rebuttal round is a separate per-repo flag (263).

## Findings

Slot A research 2026-09-08 (tier 1 and 2, sources in the text). July 28: planning debate 5 passes, implementation debate 6, both 11 top-model passes before code, 15 with round two, plus an operator approval in the middle (new-beginning/skills-jul28/consult-issue/SKILL.md:165-205, 380). With the door locking decisions, planning's unique outputs are decision IDs, codebase grounding and the execution checklist, which are plan authoring and can move into the implementation synthesis. Blind independent positions: Kahneman, Sibony, Sunstein, Noise (2021), mediating assessments protocol; Anthropic building effective agents, voting pattern. Rebuttal rounds: Khan et al. ICML 2024 and Du et al. ICML 2024 measure gains on answer-picking tasks; Smit et al. ICML 2024 and "Stop overvaluing multi-agent debate" 2025 find gains vanish at equal compute. Anthropic: evaluator loops only when criteria are clear and the first attempt falls short. Rebuttal per repo vs per issue: no practitioner evidence; July 28 `auto` already fires round two only on a real fork.

Slot B round 2026-09-08 (blind): one implementation debate; one rebuttal round as a per-repo on/off flag default on; fixed roles A strategist, audit, merge and B implementation synthesis, execution. Pitfalls: election and rebuttal are two switches; code must not read disagreement prose.

Operator answers 2026-09-08: 1-A one debate, with the note that every issue must still get an implementation plan even without the debate. 2-A one rebuttal round, per-repo flag, default on. 3-A fixed roles, with the lock that any slot can be any harness at any time, Claude, Codex or pi, nothing is slot-dependent.

Operator refinement 2026-09-08 (chat): the implementation plan is debated by default and skipped only for very small issues. The skip is decided at the door, one question beside the consult election, one field in state. An issue without the debate still gets an implementation plan written by slot B alone. Architecture accepted by the operator, no challenge raised.

Reshape 2026-09-08: 11 open Questions redrawn (config-shape, model-tiering, skill-rewrite, repeat-safety, status-view, handoff-location, peer-questions, parallel-merge, quality-layers, distribution, implementer-brief), none ruled out, no new fork.

## Resolution

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

Handoff 2026-09-09 (operator 7-A, 8-A): consult `no` on every leaf; debate `yes` on pull-close and chart-issues only; the two bootstrap leaves are operator-owned with `hand_built: true`; tree accepted: epic akrogon-loop, issues bootstrap, takeover, github, doors, finish, eight leaves.

Operator 2026-09-10 (F1-A): the consult election and the debate question are one question and one field. `consult` leaves state.yaml; `debate: yes|no` is the whole election, asked once at the door with a recommendation from the settled design, default no, read by plan-issue. Intake 151's requirement, one question and one field, is met by `debate` alone; the second field arrived when the planning debate was cut and had no reader.
