# Brief: whole-system flow map (blind, independent)

You are a consultant seat (B, D or E) in the chart door's tab. A (the door) is doing the same task on its own. Do not read other seats' map files in this folder until you have written yours.

## Operator request, verbatim

"I want you to go through the entire Accogon factory and the framework repos. After all the fixes that we've done, look at the whole system from the system's perspective mentioned in the PDF. ee if we can do further optimizations where we can cut down the production time even more, if possible, without sacrificing the quality and without ruining the stability of the system. Focus mostly on the biggest bottlenecks that we have today that are still lingering. Use the logs and data from the past week compared to past twenty-four hours after we've implemented everything. Also use the research process based on the charting process inside of Acargon."

Standing operator direction: simplest systemic fix, fewer moving parts, remove code where possible, no patches stacked on patches, no caps or slowdowns, no quality loss.

## Inputs

- The lens (operator material, top research tier): `/home/ivan/Work/infra/akrogon/issues/chart/sources/systems-thinking-field-manual.pdf` (text copy: `systems-thinking-field-manual.txt` in the same folder). Use its seven questions (page 3), stocks and flows (module 03), delays (06), limits and the Five Focusing Steps (09), traps (11) and the leverage ladder (12).
- Shared data pack: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/data-pack.md`. It lists the raw files. Recompute anything you doubt and say where your number differs.
- The factory: `/home/ivan/Work/infra/akrogon` (src/, skills/, docs/guide/). Skills the seats run: `/home/ivan/Work/infra/akrogon/skills/*/SKILL.md`. The chart door skill: `/home/ivan/.claude/skills/chart-issues/SKILL.md` and its `assets/`.
- The main product repo: `/home/ivan/Work/infra/tamdoma/framework` (issues/, tests, config at `issues/config.yaml`).
- Read-only. Write nothing except your return file. Run no lifecycle commands (`akrogon next`, `phase`, `verify`, `stop`).

## Research process (chart-issues tiers)

Tiers, highest first: operator (the manual), practitioner (named people or teams with a track record: e.g. Goldratt on constraints, Reinertsen on product-development flow and queues, Meadows, DORA/Accelerate, and recent 2026 first-hand write-ups on running multi-agent coding pipelines), better-than-training (this code, these logs, primary docs), model knowledge only together with the searches you ran that found nothing stronger. Cite each claim with tier, source (URL or path:line) and date read. Research shapes which interventions you rank and which pitfalls you design out. It never stands in for the data.

## Task

1. Answer the manual's seven questions for the whole system, from GitHub issue (seed) to merged on main, across both repos and the chart door:
   1. What does the system actually do over time (behavior, not intent)?
   2. Which stocks pile up, with their inflows and outflows (numbers from the data)?
   3. Which reinforcing and balancing loops run? For each balancing loop: goal, sensor, correction, and does the sensor see the real goal?
   4. Where are the delays and how long are they?
   5. What is the binding constraint now, and what binds next?
   6. Which traps from module 11 are active or likely within six months?
   7. Interventions ranked by leverage point (module 12), highest first.
2. Then give your top 3 to 5 interventions. For each:
   - the bottleneck it attacks, with the numbers;
   - expected gain in hours per leaf or per seed-to-merged, labelled an estimate, with how you got it;
   - leverage level (1 to 12);
   - quality risk and what keeps quality whole;
   - stability risk and what could break later (six months out);
   - complexity change: what is removed and what is added (rules, code paths, files);
   - the evidence (tier, source, date).
3. Name anything in the data that looks wrong or that you could not explain.

Keep it plain and short: under about 150 lines. Plain words, numbers where they matter, no decoration.

## Return

Write your answer to exactly this path, by your seat letter:
- B: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/map-B.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/map-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/map-E.md`
