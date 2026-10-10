# Opening territory map brief, slot B

You are slot B in a chart-issues door (A = w8:pCT). Work blind: do not read other slots' maps (map-A.md, map-B.md, map-C.md) until told. Do not edit any repo file. Write only your return file.

## Operator intake, verbatim
"Okay, we just pulled another set of issues. This has mainly to do with how the merging process and the whole optimization of the merging process goes, but eerything else is also inside. We need to make sure that this process is faster while keeping the same quality so we can merge more things at the same time. Look at all of the issues and think about them from the system's thinking perspective. Look at the stock and flow of the entire Akrogon system. Look at what the reinforcing loops and balancing loops are and how to trigger the least amount of change possible so nothing else gets messed up. So the least amount of changes that are the most elegant that will move the needle the most."

## Intake reports (unverified, GitHub Tamdoma/akrogon #62 to #73)
/home/ivan/Work/infra/akrogon/issues/seeds/62-*.md through 73-*.md (12 files).

## Live surface
Read code ONLY from the origin/main checkout: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/78c4491c-31d3-4545-8910-84c9e1f29556/scratchpad/ref (HEAD 083264e). The root checkout /home/ivan/Work/infra/akrogon is 8 commits behind; do not cite its lines.
Key paths: src/turn.ts, src/next.ts, src/phase.ts, src/batch.ts, src/routing.ts, src/state.ts, src/log.ts, src/config.ts, src/pause.ts, skills/merge-issue/SKILL.md, skills/check-issue/SKILL.md, skills/implement-issue/SKILL.md, skills/plan-issue/SKILL.md, skills/learn-issues/SKILL.md, docs/guide/. Consumer evidence: /home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl and its issues/config.yaml (read only).

## Existing locks (handed-off charts; read their CHART.md Forks taken and Off route)
/home/ivan/Work/infra/akrogon/issues/chart/{merge-turn,merge-covers,check-reruns,test-runs,repo-pause,failed-leaf-routing,realistic-fix-bar,lessons-merge-conflicts}/CHART.md

## Task
Produce your own independent territory map:
1. Stock-and-flow model of the akrogon leaf pipeline (stocks: leaves per phase, merge queue, red-main state, lessons; flows: dispatch, review, merge, bounce). Cite file:line for each rule that sets a flow.
2. Reinforcing and balancing loops, each with the code or skill line that closes it, and which seeds it explains.
3. Leverage: the smallest set of changes that moves throughput most at equal quality. Rank them. For each: what it could break or invite later, not only now.
4. Material forks the operator must decide (questions a practitioner would ask), with options and your pick plus reason and cost.
5. Which seeds are symptoms of the same cause, which are independent, which you would put Off route and why.
6. Pitfalls over the work's lifetime and what removes each.
Use evidence tiers: practitioner (named source, URL, date read), primary docs/code (file:line), model knowledge only with the searches that found nothing better. Be concrete and short. Plain words.

## Return
Write to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/78c4491c-31d3-4545-8910-84c9e1f29556/scratchpad/map/map-B.md
