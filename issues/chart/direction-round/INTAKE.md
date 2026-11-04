# Intake: direction-round

## Scope

A direction round in the chart door (akrogon `skills/chart-issues`): chart-level intent and priority questions asked before fork rounds; mandatory when attended; under autopilot answered by the operator or by A, per the operator's first message.

## Provenance

- GitHub Tamdoma/akrogon#128, imported 2026-11-04 by the door (pane t15), full match, no existing owner.
- Operator: 2026-11-04, door session in pane t15 (words below, also inside the report).

## Source: Tamdoma/akrogon#128

Title: Chart door has no direction round: operator intent and priorities are never asked before fork rounds, and autopilot picks use fixed generic values

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

During chart `issues/chart/tasks-hierarchy` (2026-11-04, door pane t15, A session acb047ee-5b0d-44f9-91d9-101e77575049) the operator switched the door to autopilot after round 1 and asked for high-level direction questions before A answered later rounds itself:

> "Use autopilot mode. Give me the general direction questions so you can know what categories and forks to open up in general. Then you can do it yourself. Just so I can give you my intent and priorities from the high level."

A then asked an ad-hoc "direction round" of seven intent and priority questions that no fork asks on its own: what the board is mainly for, how much text per row, whether the producer (`akrogon status`) may change, colors, width, who starts the next seat, must keep / must go. Answers were recorded in `issues/chart/tasks-hierarchy/forks/direction.md` and now steer every later fork pick. When asked, consultant C (claude fable 5.1) found six more direction angles that A had not asked (brief `slots/direction-brief-C.md`, return `slots/direction-C.md`): where the operator reads a problem (board, pane, notification), whether the panel is open all day or opened on the red dot, whether age alone may turn a row loud, ordering when several rows need the operator, the scope of "needs you", and how long the work will live (weeks, a year, a prototype for a successor).

The operator then asked for this to be part of akrogon:

> "Also, I like this way of work. In fact, I would like to have teh general directions and priority like this to be a part of akrogon (optional, I have to mention it in the initial post when calling chart-issues)"

and refined it:

> "So seed the issue to akrogon. In fact, for non-autopilot mode, it needs to be mandatory before we start answering individual forks. This will impact how the initial mapping will start looking like, of course. For autopilot mode, I would say it's also necessary, but it's done either by me, or by the agent automatically, depending on what I say in the initial prompt (example: "/chart-issues bla bla. Autopilot mode. Autopilot for general direction as well" or something like that. Make the seed-issue file detailed with these detailes."

The second statement supersedes the "optional" in the first for attended mode.

## Location

akrogon `skills/chart-issues` (the chart door): `SKILL.md` sections Drain, Take and Autopilot, and `assets/questions.md` (operator round format and blind peer exchange). Installed copy read through `~/.claude/skills/chart-issues` → `~/.akrogon/releases/7f697eee…/skills/chart-issues` (not the destination source; same commit as main 7f697eee at reading time).

## Reproduction

1. Open the chart door on any intake, attended or with "Autopilot mode." in the first message.
2. Observe: after the opening map, the first operator round is already a single fork; no step asks the operator's intent and priorities for the chart as a whole.
3. Under autopilot, observe: A answers each fork by "the evidence and the operator's values: simplicity, function over form, removing over adding, systems thinking, speed and price" (`SKILL.md` Autopilot), a fixed list not specific to the chart.

Frequency: every chart.

## Expected behavior

As stated by the operator (requirements, not a design):

- Attended mode: a direction round is mandatory before any individual fork round. It asks the chart-level intent and priorities that reshape many forks at once.
- The direction round shapes the opening map ("This will impact how the initial mapping will start looking like"), so it sits at or before the map rather than after it.
- Autopilot mode: the direction round is also required, but who answers it depends on the operator's first message: the operator answers it, or A answers it automatically when the first message says so (operator's example: "/chart-issues bla bla. Autopilot mode. Autopilot for general direction as well").
- With named consultants, consultants can be asked for direction angles A has not asked, as in the observed case (C's return dropped angles already settled and gave, per angle: the question in plain words, 2–3 options, the forks it reshapes, and why evidence cannot settle it).
- The answers are recorded once per chart and steer later picks (in the observed case, `forks/direction.md` with the operator's verbatim reply).

Not provided: the exact answer format, where the record lives, how the direction round interacts with an already-answered round when autopilot is switched on mid-chart, and whether a direction round carries over across charts in one pass.

## Urgency

Impact: without it, attended rounds start at a single fork with no shared priorities, and autopilot picks rest on a generic value list, so the operator's intent for the specific chart (for example "the board is for spotting problems", "little text per row", "the producer may change") is missing unless the operator asks ad hoc. Workaround: the operator asks for direction questions in words, as done here.

## Suspected cause

No defect: the door has no such step. `SKILL.md` Drain goes from the territory map straight to "A round takes one fork, the next answerable fork first"; `SKILL.md` Autopilot supplies a fixed value list for A's picks; `assets/questions.md` defines only fork rounds, the research tiers, the blind peer exchange and optional measurement, with no chart-level priorities round.
Whose view: reporter (operator) for the requirement; agent for the file reading.
Files read: installed `skills/chart-issues/SKILL.md` (Drain, Take, Autopilot), installed `skills/chart-issues/assets/questions.md` (whole); chart record `issues/chart/tasks-hierarchy/forks/direction.md`, `CHART.md`, `slots/direction-C.md`.
Not inspected: `skills/chart-issues/assets/shapes.md` (where a direction record would fit in the chart folder), scripts under `skills/chart-issues/scripts/`, tests for the skill.
Related reports: Tamdoma/akrogon#125 (operator round format: drawings under questions; same round format, different change). Searched Tamdoma/akrogon, state all: own reports created since 2026-11-02 (limit 30), "chart-issues direction" (limit 10), "autopilot direction" (limit 10); no covering report found.


## Source: operator 2026-11-04 (autopilot)

The chart was added to the autopilot handed list by the operator's reply "7a" to direction round 2 of chart tasks-hierarchy ("Chart it right after this chart, in the same autopilot run").

## Source: operator 2026-11-04 (main intent)

"I would do only one priority/session per entire session across all charts that will be a part of the session"

"The main intent is this: to have a procedure that allows me (or you on autopilot) to pick the priorities and steer the whole process in the right direction and to get important impact and steering votes"

## Source: operator 2026-11-04 (name)

"also, come up with a name for this phase that fits the whole akrogon charting motiffs"

## Source: operator 2026-11-04 (name and modes)

"signposts is good, but the mechanism doesn't have anything to do with forks? It's got all to do with general direction steering of the entire epic, issue, series of issues, whatever we're doing in the session. Is that clear? Challenge me if I'm correct."

"No, that's not correct. I do all decisions in manual mode, but when it comes to autopilot, you do all of them or I do them only once, all the other post-forks and post-deicions are done by the agent if full autopilot, and autopilot signposts."

## Agent findings

- Operator 2026-11-04, verbatim: "Let me vote on it. Ask the agent consultants to help, too". The name goes to an operator vote; candidates from A, B and C.
- Name candidate (A, 2026-11-04): **bearing**. In chart vocabulary (chart, map, territory, fork, fog, drain, take, off route, handoff) a bearing is the direction a navigator fixes before reading the map and steering by it. The step is "take the bearing"; the record is the session's bearing. "Heading" was rejected (collides with markdown headings in every chart file); "compass" and "true north" name instruments or ideals, not a step. Grep of skills/chart-issues found no existing use of "bearing".

none yet
