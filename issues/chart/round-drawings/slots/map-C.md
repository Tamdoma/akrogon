# Map C: round-drawings (Tamdoma/akrogon#125)

Small text change. One destination, one leaf, no code, no test.

## Ground inspected

- `skills/chart-issues/assets/questions.md` "Operator questions and peer exchange": the fenced round template (opening paragraph, question, research line, options, how-to-choose, pitfalls avoided, reply key, challenge check) and the "Every round uses this shape" paragraph with the register rules and A's pre-send read. The file is 60 lines. No drawing or picture is mentioned anywhere in the skill (grep over `skills/chart-issues/` and `docs/use/plan-work.md` for drawing, ASCII, diagram: zero hits).
- `skills/chart-issues/SKILL.md` "Shared context": rounds are printed chat text, never a question tool. "Autopilot": A writes the full round in its pane and answers it itself.
- `docs/use/plan-work.md` "Answer one fork per round": the operator-facing description of what a round holds (options, recommendation, reason, research). Says nothing about drawings.
- Tests: no test reads questions.md or pins the round shape (grep over `tests/` for questions.md, "Challenge check", "reply key": zero hits; `tests/docs-links.test.ts` checks links only). Confirms lock 1c.
- Prior rounds: `issues/chart/herdr-panels/INTAKE.md` "Round 2" and "Round 3" record three drawings that settled picks (A5 placement, A8 sidebar, Tasks panel round 3 blended under the options). None of those drawings survives in a fork file: `forks/needs-you.md`, `forks/spaces.md` and `issues/chart/tasks-panel/forks/tasks-panel.md` hold no box characters, only the sentence "after A's drawing". The fenced blocks in `slots/tasks-panel-C.md` and `tasks-panel-D.md` are JSON and TypeScript schemas, not drawings. Consultant maps (`slots/map-A.md`, `map-D.md`) do contain box drawings, so consultants already draw in blind notes without a rule.
- `issues/chart/herdr-panels/forks/needs-you.md` Taken 2a: the planned Needs-you panel builds reply buttons by reading the agent's screen for "2+ options sharing a number, a (recommended) mark, or a Reply line". Option codes repeated inside a drawing are text that parser will see.

## Forks

### F1 Where the drawing sits in the round

- 1a (recommended) One fenced block per question, directly after the option bullets and before the how-to-choose line. Matches the operator's screenshot (question, options, then drawings). Every other part stays where it is. Cost: none.
- 1b A drawing inside each option bullet. Breaks the bullet list in rendered markdown and in the pane, and the Needs-you parser reads the list.
- 1c Drawings after the whole question, below pitfalls. Separates the picture from the options it compares, which is what the operator asked to fix.

Breaks or invites later: 1a and 1c keep the option bullets parseable. 1b invites a parser false-button problem once the Needs-you panel lands.

### F2 How the options are drawn inside the block

- 2a (recommended) Drawings side by side, each captioned with its option code (`1a`, `1b`) on the first line, when they fit in about 80 columns. Otherwise stacked, one under the other, same captions. Side by side is what the operator saw and liked. Cost: A judges the width, no measurement.
- 2b Always stacked. Simple, always fits a narrow pane, but loses the at-a-glance comparison.
- 2c Always side by side. Wraps in a narrow herdr pane and the drawing becomes noise.

Breaks or invites later: 2c wraps in narrow panes. 2b is the safe fallback 2a already contains.

### F3 When a drawing is required

- 3a (recommended) Under lock 4a: any question whose options differ in something visible (layout, screen state, flow, what a click opens), and none where they do not. Written as a sentence in the "Every round" paragraph, added to A's pre-send read so a missing or useless drawing is caught like any other failed part. Cost: a few words.
- 3b Only when the operator asks. That is today's workaround and costs an extra exchange per round (intake "Urgency").

### F4 Autopilot rounds

- 4a (recommended) The drawing rule applies to every presented round, autopilot included. The round A writes in its pane is the record the operator reads later and the consultants rebut; one rule, no mode branch. Cost: a few lines of tokens per visible-option question with nobody answering live. Signpost 7c already flagged that nobody reads round drawings this session, so the cost is known and accepted by 7a.
- 4b Skip drawings when A answers its own round. Saves tokens, adds a mode branch to the round rules, and the operator loses the picture when reviewing the fork afterwards.

### F5 Does the fork file keep the drawing

- 5a (recommended) The fork's Taken keeps the drawing of the chosen option, verbatim, under the operator's words. Evidence: all three herdr-panels drawings that settled picks are gone from the forks; the leaf design later rebuilds the layout from prose. Cost: a few lines per fork.
- 5b Pane only, as today. The drawing that decided the pick is lost at pass end.

## Questions a practitioner would ask

- Q1 Who draws: A, in the round. Consultants may draw in their blind notes already (herdr-panels map-A, map-D). No rule needed for consultants.
- Q2 Does the drawing replace any text: no. The option bullet still says what the option does and its cost. The drawing shows it. The intake's rule "every required round part stays" goes into the paragraph in those words.
- Q3 Does the register paragraph need a change: one clause. A drawing uses the same option codes as the bullets and no code scheme of its own (the existing "use no other code scheme" rule already covers this once drawings are named).
- Q4 Does plan-work.md change: one sentence under "Answer one fork per round" saying a question whose options look different comes with a small drawing of each. Docs describe rounds, and lock 1c is written rules.
- Q5 Does the signposts round get drawings: no. It is the light exception and its questions are about session values, not visible things. Say nothing, or one word in the exception sentence.

## Pitfalls

- P1 Nested fences. The round template in questions.md is itself a three-backtick `markdown` fence. A drawing block inside it needs a `~~~` fence or the outer fence must grow to four backticks, or the template breaks at the first drawing. The editor must check this by rendering or by eye.
- P2 Parser collision. Repeating `1a`/`1b` captions inside a drawing adds lines carrying option codes that the Needs-you button parser (herdr-panels fork needs-you, Taken 2a) will see. Likely harmless, since it counts options sharing a number and those already exist, but unproven. Record for that leaf's fixture set, not for this chart.
- P3 Width. Herdr panes are narrower than a full terminal. 2a's "about 80 columns, else stack" removes the wrap case without a measurement.
- P4 Drawings as decoration. Without 3a's "none where options do not differ visibly", drawings spread to every question and the round gets longer for no decision value. The operator's rule is the limit.
- P5 Lost record. 5b leaves the deciding picture in the pane only, as the three herdr-panels cases show.

## Split

One leaf, repo akrogon, written rules only (lock 1c):

- `skills/chart-issues/assets/questions.md`: add one drawing block to the template under question 1's options (captioned `1a` and `1b`, side by side), and two or three sentences to the "Every round uses this shape" paragraph: when a drawing is required (3a), its form (2a), every other part stays, A's pre-send read covers it. Fix the fence nesting (P1).
- `docs/use/plan-work.md` "Answer one fork per round": one sentence.
- Fork record rule (5a): one clause in questions.md where it says the fork records the chosen option's avoidance mechanisms, or in shapes.md's fork Taken description. Pick one place, not both.

Done-criteria: the template renders as one fence with a drawing inside it, the paragraph names the drawing rule and the kept parts, and no test changes. No seed, no code, no herdr work. P2 is recorded only, for the herdr-panels Needs-you leaf.

Off route: a test pinning the round shape (lock 1c); image or SVG drawings (rounds are printed chat text per SKILL.md "Shared context"); drawing tools or generators.

Fog: none.
