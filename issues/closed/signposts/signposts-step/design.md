# Design: signposts-step

## Binding decisions, verbatim

### direction

Question: Seven chart-level questions on the direction round itself: questions per round, consultant angles, scope across charts, detail, where answers are saved, mid-chart autopilot, relation to autopilot's built-in values.

Answer and reason:

Operator 2026-11-04, verbatim: "You answer the directions." A's picks under that instruction, not operator words:

- 1a: 4 to 7 questions, only the ones that reshape many later forks. Reason: simplicity; today's two rounds of 7 and 6 worked.
- 2a: consultants always add missed angles before the operator sees the round. Reason: today C found six angles A missed (tasks-hierarchy slots/direction-C.md).
- 3 (operator 2026-11-04, overrides A's 3a), verbatim: "I would do only one priority/session per entire session across all charts that will be a part of the session". One direction round per door session, covering every chart charted in that session.
- 4a: light format: question, 2–3 options, recommendation, forks it reshapes. Reason: direction is intent, not evidence; the full research format belongs to fork rounds.
- 5a: own fork file `forks/direction.md` with the reply verbatim. Reason: it is answered like a fork and handoff already requires every fork to be answered.
- 6a: asked when autopilot is switched on mid-chart, before A answers anything. Reason: the observed case.
- 7a: direction answers first; the built-in values fill gaps. Reason: the built-ins are generic and still needed where direction is silent.

## Round 2: consultant angles (slots/direction-B.md, slots/direction-C.md)

A's picks under the operator's "Ok, ask the consultants (you already have?) and do the directions yourself." Steered by the main intent: "pick the priorities and steer the whole process in the right direction and to get important impact and steering votes".

- B-G1 a: the votes improve the work's impact first; operator time and up-front certainty come after. Reason: the main intent names impact.
- B-G2 a / C-G2 a: the bearing ranks priorities (an order plus any hard limits, no invented budgets) and may also order and drop the session's charts. Reason: "pick the priorities and steer the whole process"; Drain already takes an operator-named chart first.
- B-G3 a: the bearing settles intent, priorities and limits; technical choices stay in their fork rounds. Reason: keeps the bearing short and the fork record honest.
- C-G1 b: the bearing marks which kinds of forks stay the operator's votes (for example a producer change, a look, money); A answers the rest and records them as its picks. Reason: this is the "steering votes" half of the intent: the operator spends attention only where it steers. Dissent: none recorded yet (asked in the map rebuttal).
- B-G4 a: after the answers, one short account of what the run will prioritize and give up; later recommendations name the steering priority when it decides the pick.
- C-G3: a later operator word that conflicts with a taken fork is shown in one line and asked; a plain addition is appended with its date (existing correction rule).
- C-G4 a: when A answers the bearing, its picks are echoed in the first reply and the run continues; the operator can correct any time.
- C-G5 a: the latest earlier bearing on the same repo is offered as proposed answers; the operator answers "same" or changes. Still one round per session.
- C-G6 b: an unanswered bearing question stays open and is asked once more before the first fork round (questions.md: an omitted material answer stays open). Rejected C's a (A decides): it records guessed intent as if given. B agrees (direction-B pick 1 and its note on tasks-hierarchy question 7).
- Revisions to round 1 accepted from C: 1a's test reads "changes several picks across the session's charts and evidence cannot settle it", drawn from the intakes; 2a runs as one exchange at open after the consultant restart and before the map briefs; 6a is one clause (a session with no bearing at autopilot switch-on asks it first).
- 5a, storage: the bearing is copied verbatim into each chart folder of the session at folder creation (handovers included), naming the chart that holds the original (C). Rejected one file with links (B): the handoff refusal, resume rule and pack would need a new path; a verbatim copy cannot drift. Standing dissent: B.

## Operator corrections 2026-11-04 (verbatim)

- "signposts is good, but the mechanism doesn't have anything to do with forks? It's got all to do with general direction steering of the entire epic, issue, series of issues, whatever we're doing in the session."
- "No, that's not correct. I do all decisions in manual mode, but when it comes to autopilot, you do all of them or I do them only once, all the other post-forks and post-deicions are done by the agent if full autopilot, and autopilot signposts."

Effect:
- Name: **signposts** (the session's general direction for everything charted in it).
- Modes: manual: the operator answers the signposts and every fork. Autopilot: the operator answers the signposts once, A answers every fork after. Full autopilot ("autopilot signposts"): A answers the signposts and every fork.
- No reserved kinds of forks (A's C-G1 pick removed). The signposts hold general direction only: ranked priorities, hard limits, and the order or drop of the session's charts.

### signposts-rules

Question: How the signposts step works in the door: what a session is, where the record lives and how corrections reach it, how the mode is read, what happens to unanswered questions, conflicts, A's signposts under full autopilot, the round's shape and position, usage, tests and docs.

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words. Steered by the operator's main intent and corrections (forks/direction.md).

1. Position: the signposts round runs at Open after intake import and the consultant restart, before any map; consultants add missed angles in one exchange first; every map brief carries the answers (A,B,C). Under autopilot (operator answers the signposts) it is a presented round, not a wait: no chart parks on it and no chart work starts before it is answered (C).
2. Session: the logical door session, from the operator's first message until the operator starts a new door run; it survives pass end while autopilot waits, replies, compaction and same-session or fresh-A handovers; none of these asks again (B, A, C). A chart resumed in a later door run gets that run's signposts; reusing a chart folder never selects another run's (B).
3. Mode from the operator's words with their scope, judged, recorded verbatim in the mode line: manual, autopilot, or full autopilot ("autopilot signposts"). Words that delegate only the signposts while the operator keeps the forks match none of the three modes; the door asks which mode is meant (B F3, C leaf review 6). No fixed phrase (A,B,C).
4. Record: `forks/signposts.md` in the chart where the round ran is the original and authoritative; every other chart of the session gets a verbatim copy at folder creation naming the original, including folders old A creates at a handover (an exception to the handover rule that old A creates only CHART.md, B and C leaf reviews). Every copy keeps the fork shape with the reply under `## Taken`, so `akrogon status --charts` (src/status.ts chartRow) counts it taken (C leaf review 4). A correction is appended to the original with its date and then copied to every open chart of the session; map briefs name the original (B F2 correction behavior, C copy). Rejected: links only (B): the fork-answer refusal, resume and pack would need a new path. Standing dissent: B prefers one record with links.
5. Unanswered: in manual mode a material signposts question stays open until the operator answers it or removes it as immaterial, and is asked again before the first fork round (B F4). In autopilot the operator answers the signposts once (operator: "I do them only once"): an unanswered question is recorded as unanswered and the built-in values fill that gap; it is not asked again (C leaf review 1). Under full autopilot A answers it.
6. Corrections and conflicts: an explicit operator correction is recorded with its scope without re-asking (B F6). An unresolved conflict between operator statements about the signposts is shown in one line and asked, in every mode, because the signposts are the operator's in manual and autopilot (C leaf review 2); under full autopilot A resolves it and labels it. An unresolved conflict about a fork becomes a fork answered per mode. Approvals stay operator-only.
7. Full autopilot: A's signposts are echoed in the first reply and the run continues; recorded as `signposts: A` in `## Autopilot`, never as operator values (B,C). They may order the handed charts but never drop one; a drop A would make is recorded only, for the operator (C, SKILL.md Autopilot).
8. Content: ranked priorities, hard limits, order or drop of the session's charts (the order feeds Drain's selection as the operator-named order; a dropped chart or seed is not charted this session and is listed as dropped in the original `forks/signposts.md`, seeds staying seeds, C leaf review 5); 4–7 questions, each one changing several picks across the session's charts where evidence cannot settle it; drawn from the intakes; no seed list in the skill (A,C; direction 1a revised).
9. Shape: questions.md names the signposts round as the light exception to the round shape: question, 2–3 options, recommendation, what it steers; reply key and challenge check kept; no research line (B,C). After the answers, one short account of what the session will prioritize and give up (direction B-G4).
10. Autopilot pick rule: "by the evidence, the session's signposts, and where they are silent the operator's values: simplicity, function over form, removing over adding, systems thinking, speed and price"; a recommendation names the signpost when it decides the pick (A,B,C).
11. Previous signposts: at Open the latest earlier signposts on the same repo are offered as proposed answers; "same" or change (A's pick of C-G5).
12. Direct single item first in a session pays the round (A,C). The rule applies to door sessions opened after it lands (C).
13. Usage: `chart-usage.ts` unchanged; the first chart's first span covers the round (B,C).
14. Tests: no new prose-string test (B F5; function over form); `bun test` including `tests/docs-links.test.ts` passes; a shapes example is parsed only if one is added (B,C). Rejected: string-presence test for "signposts" in SKILL.md sections (C): it cannot show the step works.
15. Docs: `skills/AREA.md` if it describes the door's order, and the `docs/` pages that describe the door's order or autopilot: `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/words.md` (Autopilot entry and a new Signposts entry), `docs/start/what-it-is.md`, `docs/use/a-working-day.md` (B, C leaf reviews; README has no chart-issues row).

Standing design: /home/ivan/.akrogon/releases/7f697eee16682629d75754ef90d74686ecabc565/skills/chart-issues/assets/standing-design.md
Interpretation: no auth, secrets, backend mutations or outside calls. The product is skill and doc text; its proof is reading the changed sections against the criteria plus `bun test` (which runs `tests/docs-links.test.ts` over doc links). No new test: a prose-string test cannot show the step works (signposts-rules 14). No machinery.

## Leaf architecture

Owned surfaces: `skills/chart-issues/SKILL.md` (Open, Drain, Take where it says research precedes every question, Autopilot, Handover), `skills/chart-issues/assets/questions.md` (round shape paragraph, blind peer exchange where the consultant angle exchange is named), `skills/chart-issues/assets/shapes.md` (Chart records: a signposts record and the `## Autopilot` line), `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/words.md`, `docs/start/what-it-is.md`, `docs/use/a-working-day.md`, `skills/AREA.md` only if it describes the door's order (README has no chart-issues row) (B,C).

Consumers of changed text:
- Take says "Research precedes every question": the signposts round is the named exception (no research line); Take's sentence must not contradict it.
- questions.md "Every round uses this shape, on every harness and at every effort level": the signposts round is the one named exception.
- Preflight "Refuse the handoff while any fork file lacks an operator answer — under autopilot, an answer recorded as A's ... counts": `forks/signposts.md` is a fork file, so the existing refusal covers it; under full autopilot A's recorded signposts count.
- Open's consultant restart ("one run before a shared opening map covers the map"): the signposts exchange runs after that restart and before the map briefs; no extra restart.
- Autopilot "The door never turns autopilot on, extends the handed list, changes the consultants or raises an existing bound": A's signposts never drop handed charts.
- `scripts/chart-usage.ts`: unchanged; the first chart's first span covers the round.
- Handover "When the next chart has no folder, old A creates only its CHART.md", Autopilot's handover folder contents ("carries INTAKE.md plus CHART.md with its mode record") and shapes.md Chart records' next-chart paragraph: each gains the signposts copy as the one added file; INTAKE.md and seats.yaml stay deferred as today (B,C).
- `src/status.ts` chartRow counts a fork file taken only when `## Taken` has text under it: the signposts record and its copies keep that shape, so no `src/` change is needed (C).
- Drain's chart selection ("the chart the operator names, else ..."): the signposts' chart order counts as the operator-named order; dropped charts and seeds are skipped for the session and listed in the original record (C).
- `docs/pictures/chart-door.svg` and `ways-to-run.svg` describe the door; Open for the plan: whether a picture must change for criterion 8's "one procedure", or the page text alone carries it (pictures are not owned unless the plan finds them contradictory).

Exclusions: no `src/` or `tests/` change; no change to the leaf lifecycle, seats or phases; legacy charts and this repo's open charts are not migrated (the rule applies to sessions opened after it lands).
