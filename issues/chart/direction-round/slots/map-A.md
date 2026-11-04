# Opening map, slot A: direction round

Inspected: `skills/chart-issues/SKILL.md` (Open, Drain, Take, Handoff, Autopilot, Handover), `assets/questions.md` (whole), `assets/shapes.md` (Chart records, Mode record), `tests/chart-shapes.test.ts`; closed leaf `issues/closed/fork-rounds/fork-per-round/brief.md` (how skill-text leaves write criteria); the observed case in `issues/chart/tasks-hierarchy` (forks/direction.md, slots/direction-C.md, CHART.md Mode record).

## What changes

The door gains one step: a direction round of chart-level intent and priority questions, asked once per door session (operator correction, forks/direction.md 3) before any fork round, and shaping the opening map. Under autopilot the operator answers it, or A does when the first message says so.

## Main intent (operator, verbatim)

"to have a procedure that allows me (or you on autopilot) to pick the priorities and steer the whole process in the right direction and to get important impact and steering votes"

Reading: the round is a small set of high-leverage votes. Each question earns its place by how much of the later process it steers, and says so ("steers: forks X, Y; the map's emphasis on Z"). Priorities are ranked, not only picked, so later ties resolve.

## Forks

D1 · Where the round sits.
- a (A's lean) After Open's resource reads and intake import, before the opening map: A drafts from the intake alone, consultants add angles, the operator (or A) answers, and every map brief carries the answers. Matches "This will impact how the initial mapping will start looking like". Breaks: the questions are drafted with less evidence than a map gives.
- b After the map, before the first fork round. Questions are better informed, but the map is drawn without intent, which the operator ruled against.

D2 · What "session" means and where the answer lives across charts.
- a (lean) Door session = from the door's first reply until its pass ends, across same-session and fresh-A handovers. The answer lives in the first chart's `forks/direction.md`; later charts in the session get a one-line `direction:` entry in CHART.md naming that file, and the handover entry carries the path. Breaks: a chart folder depends on another chart's file; deleting or packing the first chart loses it (removed by copying the Taken text into later charts instead of linking).
- b A session file outside charts (scratch or a new `issues/chart/sessions/<id>.md`). New record type and lifetime rules; more parts.
- c Copy the full direction Taken into each chart's `forks/direction.md`, marked as carried from the first chart. Self-contained charts and leaf designs; duplicates text.

D3 · Charts with a different domain inside one session. One session-wide direction may not fit a later chart whose intent differs (a UI board, then a door rule). Options: a) the direction still binds and A notes gaps, filled by built-in values (7a); b) a short top-up round only for questions the first round did not cover. The operator said "only one"; b reopens it.

D4 · Autopilot trigger. How A tells "the operator answers the direction" from "A answers it": judgment over the first message's words (function over form, no exact phrase), with the mode record stating which, vs a fixed phrase. A fixed phrase fails the operator's own example wording "or something like that".

D5 · Consultant angles (2a). A drafts first, then each consultant adds missed angles from the intake and A's draft (not blind), one merged round, no rebuttal pass. Breaks: angles anchored on A's draft; but blind drafting doubles cost for a light round.

D6 · Record and handoff. The direction is a fork file whose Taken holds the reply verbatim (5a), so the existing preflight "refuse while any fork lacks an answer" covers it; leaf designs copy it under Binding decisions like other forks. Autopilot's value list sentence changes to "the session's direction answers, then the values" (7a).

D8 · Selection and ranking. a) Each question shows what it steers and is kept only if it steers several forks or the map; the answers include a priority order (for example "problems first, then speed, then looks") that A uses to break ties in later picks. b) Unranked picks only. Ranking is what lets one vote steer forks nobody asked about yet.

D7 · Direct single item and small charts. A chart whose map finds no fork still needs the session direction; under one round per session this costs nothing extra after the first chart. The first chart of a session that is a direct single item pays one round; accept.

## Practitioner questions

- Who is the reader? The operator at the start of a session, giving intent once; A and fresh A sessions consuming it across charts and handovers.
- What fails when intent is missing? Autopilot picks drift to generic values; attended rounds ask taste questions one fork at a time.
- How is it kept light? 4–7 questions (1a), light format (4a).

## Pitfalls

- Fresh A after a handover cannot see the conversation: the handover entry must name the direction file; removed by D2's handover carry.
- A direction answer later contradicted by an operator fork answer: the fork answer wins for that fork, recorded verbatim; no rule needed beyond "operator words win".
- Mechanical checks: shapes.md gains a direction record shape; a test can parse it like the readiness example (`tests/chart-shapes.test.ts`). Whether A asked it before the map stays judgment; the preflight's fork-answer refusal is the mechanical backstop.
- Docs that describe the door's order (`skills/AREA.md`, README) need the step; the closed fork-per-round leaf shows the pattern (criteria name the exact sentences changed, `bun test` passes, no `src/` change).

## Evidence

- better-than-training · SKILL.md Drain "Show a proportional territory map before grilling" and Autopilot value list, read 2026-11-04.
- better-than-training · questions.md has fork rounds only, read 2026-11-04.
- operator · intake (#128 words), forks/direction.md (3 corrected by operator).
- observed case · tasks-hierarchy direction rounds and C's six extra angles.
