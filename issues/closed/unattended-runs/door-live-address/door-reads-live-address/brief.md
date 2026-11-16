# Brief: door-reads-live-address

## What

skills/chart-issues/SKILL.md `## Open` defines the door's address as `$HC_TERMINAL_ID`, as A reads it at the moment of each use. A recorded address in a summary, seats.yaml or the Mode record is history, never routing. A resolves the value and writes the literal, never the variable name, into briefs and helper arguments. Every rule in skills/chart-issues/SKILL.md, assets/questions.md and assets/handover.md that names the door address or A address uses that definition. That covers the column helper calls including `--save` and `--restart`, each brief's report step, A's `transcript.ts` lookup, Mode and seat entries, the door-reset.ts target argument and the handover start prompt. The "door not in a tab" rule keeps its behavior and states its precondition: the helper was called with the live address.

## Why

Report Tamdoma/akrogon#138. A framework door restarted into terminal t1xr kept using t1tm from its compaction summary and seats.yaml. The consultant column failed with "door not in a tab", which the skill treats as harmless, and consultant briefs sent their reports to the dead terminal.

## Done-criteria

1. skills/chart-issues/SKILL.md `## Open` states that the door's address is `$HC_TERMINAL_ID` read at each use, that recorded addresses are history, and that A writes the resolved literal into briefs and helper arguments.
2. Every place in skills/chart-issues/SKILL.md, skills/chart-issues/assets/questions.md and skills/chart-issues/assets/handover.md that tells A to use the door or A address points to that definition or uses it, with no rule naming a summary, seats.yaml or the Mode record as the address source.
3. The "door not in a tab" rule in `## Open` keeps "recorded once and the round continues" and states the live-address precondition.

Criteria 1 to 3 are judged by reading the changed skill files at the leaf's head.
