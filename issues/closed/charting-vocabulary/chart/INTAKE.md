# Intake: charting-vocabulary

## Scope
One destination: rename the charting vocabulary in the chart-issues skill text without changing behavior. Proposed grouping: one issue, one leaf, in repo akrogon.

## Provenance
- Operator: issues/AKROGON-NAMING.md, 2026-09-13

## Source: operator issues/AKROGON-NAMING.md
# Akrogon naming: one land picture for charting

## What I want

The chart-issues skill should use one set of words, all from the same picture. Right now it mixes land words (territory, map, chart) with meeting words (decision, batch, open, resolved, Not Yet Specified, Out Of Scope). Every time I read a chart or a batch I translate between the two. New seats do the same. That is wasted attention on every pass.

Nothing about behavior changes. Same files, same preflight, same handoff, same footer. This is a mental model and prose change. The only thing that changes on disk is words.

## Why

I need to be able to hold the whole charting process in my head as one picture. Territory, map, fork, chart is a picture I can hold. Decision, batch, resolution, not-yet-specified is a list I have to memorize. When the picture is consistent I can tell at a glance where the route stands and what happens next without opening files.

Second reason: the skill has no name for two things that exist in practice. The fuzzy parts of the map that are not questions yet. And a group of related questions that only make sense answered together. Unnamed things get handled inconsistently.

## The words

Territory. The whole problem space for one destination. Everything that could matter, known or not.

Map. What the agent sees when it looks at the territory. Three parts: the forks, what a practitioner would ask, where a beginner trips. Drawn once at open, redrawn after every answer. Shown to me, never saved as its own file.

Fog. A part of the map the agent can see but cannot yet phrase as a sharp question. Lives in the chart as prose. Clears into forks as answers land. This replaces Not Yet Specified.

Fork. One place where the route splits and I pick a side. One file per fork. A fork can need several questions to settle, and those questions always travel together: one file, one screen. Example: a "session storage" fork holds cookie or table, lifetime, refresh rule. I answer all of them and the fork is taken. A fork is taken when I answer. The file records my answer verbatim, the reason, and the roads it closed. A taken fork is never reopened. This replaces decision. It changes one rule: "each file decides one thing" becomes "each file settles one split, with as many questions as that needs".

Question. One Q block inside a fork: explainer, evidence, options with one recommended, pitfalls. Same shape as today.

Round. One screen put to me: one or more forks, one reply key, one challenge check. This replaces batch.

Chart. The one page per destination. Forks taken, forks open, fog, off route. I read the chart to know where I am. Fork files get opened only when that fork is about to be taken.

Off route. Work deliberately left past the destination, with the reason. This replaces Out Of Scope.

Handoff, epic, issue, leaf, brief, design, and "binding decisions" inside a design keep their names. By the time a taken fork reaches an implementer it is a decision, not a fork. That word is right where it is.

## How it flows

Look at the territory, draw the map. Turn the sharp parts of the map into forks and leave the rest as fog. Put forks to me in rounds. Every answer redraws the map: fog clears into new forks, the challenge check can expose a fork nobody saw, inspecting a live surface can expose one too. New forks can show up at any round. That is already how the skill works and must stay. The chart records all of it. When no fork is open and no fog is left, the route is clear and the chart hands off.

## Example from today

Destination: a seat that quits mid-phase gets picked up without me diagnosing it.

The map showed three forks and one patch of fog. Forks: how to detect a quit seat, who triggers the re-prompt, what happens after repeated misses. Fog: whether charting should have prevented the credential stop in the first place.

Round 1, detection fork. Heartbeat, watcher, or elapsed time since the last prompt. I took elapsed time. A quit seat and a slow seat look identical, only time separates them. Closed: heartbeats, watchers.

Round 2, trigger fork. A systemd timer or reuse the events that already call dispatch. I took the events. No outside polling or watchers, complexity must not grow. Closed: any new process. Cost I accept: single-seat phases wait for a touch.

Round 3, repeated misses. Fail the leaf loudly after three. Taken without debate.

The fog cleared after round 1 into a fork: should briefs list needed keys up front. I took yes. The Operator inputs section in briefs is the result.

Chart at the end: four forks taken, none open, no fog, one thing off route by my choice (automatic healing in single-seat phases with nobody touching the leaf). Route clear, hand off.

## Scope

Prose and headings in skills/chart-issues/SKILL.md, assets/shapes.md, assets/questions.md, assets/standing-design.md.

One fork I leave open on purpose for the chart to take: whether the folder `decisions/` and the CHART.md section headings rename on disk. Existing charts under issues/chart and the implement-issue skill read them. Either rename with a migration, or keep the disk names and use the new words only in prose. I lean toward renaming if the migration is a handful of moves, and keeping disk names if it touches implement-issue.

## Operator inputs

None.

## Done-criteria

1. Territory, map, fog, fork, question, round, chart, off route each appear in the skill with the meaning above. No skill text uses decision, batch, Not Yet Specified or Out Of Scope for a concept a new word covers, except "binding decisions" in leaf designs.
2. One fork file may hold several questions and they are always presented on one screen. The skill says so.
3. Full test suite passes unchanged.
4. Existing charts under issues/chart still resolve from CHART.md, either untouched or migrated by the fork that decided the rename.

## Agent findings
- The disk dependency is the command, not implement-issue. `akrogon status --charts` (src/status.ts:238-252) reads the `decisions/` folder, a non-empty `## Resolution` heading per decision file, and bullet lines under `## Not Yet Specified` in CHART.md. tests/status.test.ts:460-482 writes those literals. src/phase.ts:103 moves `issues/chart/<owner>` to `issues/closed/<owner>/chart` at close.
- skills/implement-issue and skills/plan-issue do not reference chart files.
- docs/guide/files.html:106 says "The chart and its decision files".
- One live chart (issues/chart/status-empty-open) and eight closed charts use `decisions/` and the current headings.
- The current rule in assets/questions.md is "each question decides one thing", not "each file decides one thing".
- assets/questions.md requires blind exchange files under slots/; those are temporary peer files, not a saved map.
- Full maps: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/map-rebuttal-B.md.
