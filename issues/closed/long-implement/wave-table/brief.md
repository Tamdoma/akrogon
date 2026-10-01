# Brief: wave-table

## What
The plan names which worker units run together, and seat A runs them together.
1. `skills/plan-issue/SKILL.md` plan.synthesis (line 55, "ordered file/criterion checklist"): the checklist is grouped into waves. Each unit lists the paths it owns, any shared test resource it uses (a live fixture, account or test site counts) and the units that must land first. Units with disjoint owned paths, no shared test resource and no dependency on another member of the same wave share a wave, up to 3 per wave. A unit whose prerequisite is in an earlier wave goes in a later wave; units needing the same landed prerequisite can share that later wave. (A,B,C)
2. `skills/implement-issue/worker-protocol.md` (line 11) and `skills/implement-issue/SKILL.md` (line 44): in delegated mode A runs each plan wave whole, up to 3 workers at once, once its prerequisites have landed, and waits on all of them together. The fallback "one at a time when unsure" is deleted. A unit leaves a wave only for a recorded reason: an unmet prerequisite puts it in a later wave, and a shared owned path or shared test resource keeps it out of the wave of the unit it shares with. No other reason splits a wave. (B,C) A plan without a wave grouping (written before this change) is grouped by A from the sub-brief records. Inline mode follows wave order, then listed order inside a wave. (C)
3. `skills/implement-issue/brief-template.md:21`, closing sentence "A uses these records to pick wave members and judge independence": the records carry the plan's wave values into the sub-brief, and A groups from them only when the plan has no wave grouping. (C)
4. check.fix (`skills/implement-issue/SKILL.md`, the paragraph at line 66): repair sub-briefs are grouped by the same rule, so findings with disjoint paths and no shared resource repair in one wave.
5. `skills/AREA.md:21`, `docs/guide/phases.md:77` (the plan's "ordered checklist") and `docs/guide/phases.md:87` describe the wave-grouped checklist and planned waves, matching items 1-2. (A,B,C)

## Why
Tamdoma/akrogon#51: 19% of framework implement phases exceed 2h. Implement time tracks worker count (Spearman 0.74 over 244 phases; 7-9 workers median 164m, 81% over 2h). In 46 long phases, single-worker waits hold 84% of worker wait time, and 29 of 46 never waited on more than one worker. The plan carries only an ordered checklist and the protocol falls back to "one at a time when unsure", so independent units run serially (emdash-kit U1-U6 had "no prerequisites"; site-nav ran four serial units after two waves). Evidence: issues/chart/long-implement/slots/map-merged.md.

## Done-criteria
1. `skills/plan-issue/SKILL.md` states What item 1: a wave-grouped checklist, each unit's owned paths, shared test resources and prerequisites, the shared-wave condition, the later-wave placement for prerequisites and the cap of 3.
2. `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md` and `skills/implement-issue/brief-template.md` state What items 2-3, including the only reasons a unit leaves a wave, the fallback grouping and the inline order, and the phrase "one at a time when unsure" appears nowhere under `skills/` or `docs/`.
3. The check.fix paragraph of `skills/implement-issue/SKILL.md` states What item 4.
4. `skills/AREA.md:21`, `docs/guide/phases.md:77` and `docs/guide/phases.md:87` agree with items 1-2.
5. Every configured blocking `checks` command passes, including the resolved changed-tests command.
