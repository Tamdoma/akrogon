# Opening map C: bearing

Name: the step is the **bearing** (A's pick, INTAKE.md Agent findings): the door takes the session's bearing before the map, and the record is the bearing. Proposed new record path: `forks/bearing.md`; existing records named `direction` (this chart's forks/direction.md, tasks-hierarchy's) keep their names below.

Read: INTAKE.md (including the operator's main intent and the per-session correction), forks/direction.md as corrected, CHART.md and seats.yaml of this chart; skills/chart-issues/SKILL.md whole; assets/questions.md whole; assets/shapes.md whole; scripts/chart-usage.ts (operator-turn summary); tests/docs-links.test.ts (link and string-presence tests on SKILL.md), tests/chart-shapes.test.ts (test names only); observed case: issues/chart/tasks-hierarchy forks/direction.md, slots/direction-brief-C.md, slots/direction-C.md, CHART.md Mode record and Autopilot, slots/map-merged.md head. Skipped: standing-design.md, the peer scripts, chart-usage.test.ts bodies.

Tier of every claim below: `operator` for intake words, the two locks, the per-session correction and the main intent; `better-than-training` for inspected skill text and records; `model-knowledge` where marked. No outside search was run; nothing here rests on a practitioner source.

## What the operator's words fix before any fork

- Main intent (INTAKE.md, verbatim): "to have a procedure that allows me (or you on autopilot) to pick the priorities and steer the whole process in the right direction and to get important impact and steering votes". So the round is a steering step over the whole run, not a per-chart questionnaire, and its answers must be the thing later picks are judged against.
- Correction (replaces 3a): "only one priority/session per entire session across all charts that will be a part of the session". One round per door session, covering every chart the session charts.
- Locks: mandatory before any fork round when attended; required under autopilot, answered by the operator or by A when the first message says so.

Together these move the round to Open. A per-session round cannot follow each chart's map, and the operator is present at the first message, which removes the autopilot wait problem a per-chart round would have had.

## Where the round sits, and what already does the work

Today's order (SKILL.md Open, Drain): Open (peers, pull, resources, intake import, seats) → shared opening map → first fork round. With the correction, the order becomes: Open through intake import → bearing, one per session, drawn from the imported intakes and the operator's note → the maps, each cut under the answers → fork rounds. The observed case wrote bearing questions from a map ("only the ones that reshape many later forks", 1a); under a session round the material is the intakes and the handed or imported list, so the questions are about priorities among and across charts, and chart-specific angles that only the operator can answer become ordinary first fork questions.

Existing machinery that carries most of the requirement:

- Handoff refusal on a fork without an answer (shapes.md Preflight) enforces "mandatory" once every chart holds `forks/direction.md` (5a). No new refusal.
- Handover entries already carry "instructions <verbatim with provenance and scope>" (SKILL.md Handover, shapes.md Mode record), so a session's bearing survives a fresh A without a new record kind.
- Drain's chart order already has an operator-named slot first ("the chart the operator names"); a bearing answer naming priorities is that naming, made once.
- The peer map's fifth part ("any question the peer would ask that the fork does not ask", questions.md) carries 2a's consultant angles with one added sentence, if the maps run before the round; see F1 for the ordering cost.
- The Autopilot mode line already records the operator's verbatim first words, so "who answers the bearing" needs no new record.

## Forks that change the outcome

F1 When in Open the round is asked, relative to the peer maps. Options: (a) after intake import and before any map, from intakes alone, A drafting the questions and the peers adding angles in one short exchange before the operator sees it (2a); (b) after the first chart's map, covering all charts; (c) before the maps with no peer exchange, A alone. Recommend (a): the operator's main intent is steering the whole run, which the intakes show and a single chart's map does not; (b) biases the session's priorities to whichever chart happens to be first; (c) drops 2a, which found six missed angles in the observed case. Cost of (a): one extra peer exchange at open, before the restart that precedes the shared map (Open: "one run before a shared opening map covers the map"); the text must say the bearing exchange sits before that restart or after it, and after is simpler (restart once, then bearing brief, then map brief).

F2 What a session is, across handovers and resumed charts. Options: (a) the door run from the first operator message to pass end or mode end, surviving handovers through the handover entry, so a fresh A asks nothing again; (b) each A session asks once, so every handover re-asks. Recommend (a): the operator said "entire session", the handover already carries instructions verbatim, and re-asking on every chart switch is the per-chart rule by another name. A chart held and resumed in a later run gets the later run's answers; the earlier answers stay in its `forks/direction.md` as the earlier correction, last appended binding (shapes.md fork rules).

F3 Where the session answers live. Options: (a) copied verbatim into every chart's `forks/direction.md` at chart folder creation, with the session reference and the chart-specific reading A draws from it; (b) one session file under `issues/chart/` referenced by each chart; (c) a section in each CHART.md. Recommend (a): each chart stays self-contained for resume (SKILL.md: "resume from CHART.md and the selected fork's linked context"), the fork-answer refusal keeps working, and a chart created by a handover is created with the file by old A. (b) adds a record kind outside the chart folder that chart-usage, pack and the shapes do not know. Cost of (a): the same text in several files; it is a verbatim reply, so divergence is impossible by rule.

F4 Who answers under autopilot, from words. Lock: operator by default, A when the first message says so. Options: (a) A judges the words and records them verbatim in the mode line, no fixed phrase; (b) a fixed token. Recommend (a): the mode already starts from words, and a token breaks on paraphrase. Later words in the same run ("You answer the directions", this chart's direction.md) are a mode change entry, which the mode record already takes.

F5 What the round asks. Given the intent, the questions are priorities and steering across the run: what the run is for, which charts or intakes come first and which are dropped, what must not change, how much the operator wants to be asked later, what a good outcome is. Options: (a) a definition only, 4 to 7 questions (1a), each one that would change several later forks across charts if answered differently and that evidence cannot settle; (b) the definition plus a seed list in the skill; (c) a fixed checklist. Recommend (a), with the observed case kept as a history example. (c) is the generic-value defect the intake names; (b) tempts A to answer the list instead of the intakes.

F6 Round shape. 4a drops the research, pitfalls-avoided and how-to-choose lines that questions.md says every round uses. Options: (a) name the bearing in questions.md as the one round whose research line is one sentence on why evidence cannot settle it, keeping the reply key and a challenge check that holds the peers' unasked angles; (b) full shape. Recommend (a); it is what the observed C return did.

F7 How the answers steer later picks. Options: (a) bearing answers are carried into every chart as binding decisions by the existing fork rules, Drain's chart order takes the operator's named priority from them, and under autopilot A's pick rule reads "by the evidence, the session's bearing answers, and where those are silent the operator's values: ..." (7a); (b) bearing answers are advisory. Recommend (a): the intent is "steer the whole process", which an advisory record does not do. Pitfall: when A answered the bearing itself, its bearing picks are A's guesses about intent feeding its own fork picks; the `## Autopilot` section must label it `bearing: A` so no later reader takes guessed intent for the operator's.

F8 Skip for a run with nothing to steer. Options: (a) the round is asked at every attended open, since it is once per run and cheap; a run of one settled direct item still gets it; (b) skip when no intake has a fork. Recommend (a): the lock says mandatory, and the skip judgment is A's to game. Cost: one operator turn on a trivial run.

F9 6a is mostly dead. With a session round at open, a mid-chart switch to autopilot always finds the bearing taken unless the run predates the rule. Recommend one clause: a run with no bearing answers at switch-on asks it first.

## Questions a workflow designer would ask

Q1 Should the bearing also let the operator set how much they want to be asked afterwards (every fork, only forks that touch a named thing, or none), since that is the "steering votes" part of the intent? Today only the autopilot words carry that. Recommend yes as one of the questions; the answer becomes a mode entry when it switches to autopilot, and otherwise a carry in every fork.

Q2 Should the round show the previous run's bearing answers as the default when a held chart resumes, so the operator can answer "same"? Recommend yes in text, no new record: the previous answers are already in the chart's `forks/direction.md`.

Q3 Should the round ask chart order and drops explicitly, or leave order to Drain's rule? Recommend one question with the list, since "pick the priorities" names it.

Q4 Under autopilot with A answering, do consultants still add angles? Yes; same exchange, and their dissent goes into Taken like any autopilot pick.

## Pitfalls over the work's lifetime

R1 Generic drift: a seed list of angles in the skill becomes what A asks (F5). Removed by defining the bearing by its test, not a list.

R2 Shape conflict: "every round uses this shape" versus 4a, unless the exception is written where the shape rule lives (F6).

R3 Mandatory enforced by prose: the mechanical teeth are the fork-answer refusal and the Open forks order, which only bite if `forks/direction.md` exists. Removed by one sentence: every chart folder is created with `forks/direction.md` holding the session answers. A string-presence test in the repo's style (tests/docs-links.test.ts "chart-issues skill names akrogon pack at every end-marker site") can check SKILL.md names the file in Open, Drain, Handover and Autopilot; obedience stays judgment.

R4 Stale steering: a long run where the first answers no longer fit the later charts. The operator can correct in words at any time; the correction is appended to every open chart's `forks/direction.md` with its date (shapes.md fork rules), and the handover entry carries the latest. Say so in text; no timer.

R5 Usage: the round adds one operator turn to the first chart's USAGE.md only (chart-usage.ts counts operator turns in A's session within the chart's spans; the first chart's first span covers the opening). Record, no fix.

R6 Legacy charts: open charts without `forks/direction.md` hit F9 only. The rule applies to runs opened after it lands.

## Records and tests that change

- SKILL.md Open: the round after intake import and before the maps; the peer angle exchange; `forks/direction.md` written into every chart folder at creation; the first reply under autopilot names who answers the bearing.
- SKILL.md Drain: chart order takes the bearing's named priorities first; the maps are cut under the answers.
- SKILL.md Handover: the handover entry's instructions carry the bearing path or text; a next-chart folder created by old A holds `forks/direction.md`.
- SKILL.md Autopilot: who answers from the words; 7a's wording; the `## Autopilot` line `bearing: <operator | A>`; the switch-on clause F9.
- questions.md: the bearing as the named exception to the round shape; the bearing brief as one more peer task under `<chart>/slots/` or the temporary path before folders exist.
- shapes.md: `- bearing:` line in the `## Autopilot` template; `forks/direction.md` named in the chart records tree. No readiness or state shape changes, so tests/chart-shapes.test.ts is untouched.
- Tests: one presence test in tests/docs-links.test.ts if the leaf wants mechanical teeth (R3); link anchors must resolve if questions.md links a new SKILL.md section.
- Scripts: none.

## Mechanical versus judgment

Mechanical: every chart folder holds `forks/direction.md` with a Taken before any other fork's Taken; the handoff refusal on an unanswered fork (exists); the mode line names who answers the bearing; SKILL.md and questions.md name the round in the sections above (string presence, repo style).

Judgment: which questions belong to the bearing rather than fork questions; the 4 to 7 bound; whether a later operator word is a bearing correction; whether A's own bearing picks under autopilot are honest guesses rather than the built-in values restated.

## Challenge to the taken picks

C1 1a's "reshape many later forks" was written for a per-chart round after a map. Under the session round the test must read "across the run's charts", and A will often not know the forks yet; the brief for peers should say the material is the intakes.

C2 5a per chart plus the per-session correction means copies (F3). If A prefers one file, the handoff refusal and resume rules need a new reference, which is the larger change.

C3 6a is dead text under the session round (F9); keep one clause, not a procedure.
