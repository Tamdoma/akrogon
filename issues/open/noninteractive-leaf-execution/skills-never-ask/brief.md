# Brief: skills-never-ask

## What
Every lifecycle skill in `skills/` (plan-issue, implement-issue, check-issue, merge-issue, broadcast-issue) states one rule in its own words: the seat never asks the operator anything and never waits. In the four phase skills (plan, implement in leaf mode, check, merge), when a step physically requires the operator (a permission it cannot grant, a missing env value it cannot obtain), the seat writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason "<one line naming the blocker and the artifact>" --slot <its seat from the dispatch prompt>`, and ends the pass. broadcast-issue and standalone implement-issue carry the no-questions rule and their existing terminal error and report behaviour only, since they run after completion or outside a leaf. Engineering choices inside the locked design are made by the seat. `skills/implement-issue/SKILL.md:39` ("tell the operator ... and wait") and `skills/plan-issue/SKILL.md:55` (credentials under operator actions) are rewritten to this rule; `skills/AREA.md` names the rule once.

## Why
Operator rule 2026-09-19: "it shouldn't be asking me questions anyways. No questions after chart-issues". The pi ask tool is removed at launch by the harness template (operator config step), and this leaf removes the prose that still invites asking (Tamdoma/akrogon#19, #20 item 7).

## Done-criteria
1. `grep -rn -i "ask the operator\|wait for the operator\|and wait" skills/` returns no instruction to ask or wait in any lifecycle skill.
2. Each of the four phase skills contains the stop instruction naming `akrogon phase <slug> failed --reason ... --slot`; broadcast-issue and the standalone implement path state the no-questions rule without a stop command.
3. `bun test` passes.
