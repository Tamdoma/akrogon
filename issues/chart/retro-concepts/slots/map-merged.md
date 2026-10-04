# Merged map: retro-concepts

## What retro does (A,B,C)
Operator-invoked and read-only. It reads one coding session and proposes changes to the agent's environment, ranked by severity, through seven lenses: navigation, automated checks, coding standards, steering size, tool economy, no-op instructions, information access (source-retro-SKILL.md:7-25). Its core routing rule: a mechanical mistake becomes a deterministic check, and only a judgment call becomes a written rule enforced by the reviewer (source-retro-SKILL.md:19, 28-35). It runs after a build, before context is cleared (source-ask-matt-SKILL.md:32-36).

## Already covered in Akrogon (A,B,C)
- Lesson capture in every phase seat, written in-session (plan-issue:39, implement-issue:31, check-issue:59, merge-issue:35).
- Class-level prevention as doctrine (learnings/history/README.md:3-5).
- Reviewer owns standards: check-issue judges against plan, brief and standing design. A CODING_STANDARDS.md would be a second authority.
- Navigation: grounding index plus AREA.md files.
- Checks: `checks`, `merge_checks`, `akrogon phase` guards.
- Tool economy and information access: handled on demand by charts (akrogon-slow-phases, check-reruns, long-implement, leaf-run-stalls). (C) The chart door with blind slots already works as a retro. (B) Charting supports retrospectives, but has no deliberate environment scan.

## Gaps
G1 (A,C). The chart-open prune only removes (chart-issues/SKILL.md:29) and never asks whether a lesson is applied or could become a check. (B) Applying a lesson already removes its line (implement-issue:31, LESSONS.md:5), so the route exists but is not checked. Evidence: LESSONS.md:10 (clean worktree before verdict) is enforced at src/phase.ts:270-271 and still active. (C, corrected) LESSONS.md:17 (blank reason) is fixed only at src/phase.ts:327 and src/state.ts:15, while src/config.ts:9 still uses an untrimmed `.min(1)`, so it is checkable, not guarded.
G2 (B). Discovery depends on the operator noticing friction. When a chart investigates a session or process incident, the door has no prompt to ask what environment change would have prevented it or to check for an existing unwired check first.
G3 (C). Skill prose has no no-op check (17,513 words across skills). C recommends against acting on it: skills are verbatim contracts that tests and leaves cite.

## Options
O1 (A,C recommend). Lesson triage at chart open. The existing prune offer sorts each active lesson: already guarded (cite guard file:line, remove line), checkable (offer a seed), or stays an observation. One sentence in an existing step.
O2 (B recommends). Conditional prevention scan inside chart-issues, only when intake asks to investigate a session or process incident: inspect the run's artifacts, ask what environment change prevents the demonstrated waste, check existing mechanisms first, rank only supported candidates.
O3 (A,B,C). Adopt nothing. Defensible. Cost: stale and mechanical lessons accumulate.
O4 (A,B,C reject). Retro skill, retro phase, lesson class field, CODING_STANDARDS.md, whole-session log-tail mode, or a seven-lens checklist at merge. Duplicates the chart door, adds a tenth workflow, and repeats what an earlier chart rejected (leaf-run-stalls/CHART.md:4), though that lock does not bind this chart (B). A multi-seat leaf has no single session to read (B,C).

## Sub-forks if O1
- Output of a checkable lesson: seed for later intake (A,C) versus a fork in the current chart. A fork drags an unrelated destination into the current chart.
- Who routes: the door at open (A,C) versus the writing seat. Seats know least about existing guards at write time.

## Pitfalls (merged)
- Check sprawl: every mechanical lesson becoming a `checks` entry raises the cost of every pass (C). Removed by routing through a seed that charting weighs.
- Lessons read as rules (B,C). Removed by keeping "stays" as a named outcome.
- Prune fatigue (A,C). Removed by keeping the offer optional with default "stays".
- False "already guarded" (C). (B,C) Citing a file:line is not enough, since a fixed instance has one too. A line counts as already guarded only when the guard covers the lesson's mechanism wherever it can recur, verified on the relevant path. A fixed instance with the pattern still reachable is checkable. History file stays.
- Vocabulary creep (C). Write the change in existing words only: lesson, seed, check.
- Generic checklist drift (B). O2 limited to requested investigations.

## Worth it? (A,B,C)
Small yes for one narrow change. Not worth anything bigger.
