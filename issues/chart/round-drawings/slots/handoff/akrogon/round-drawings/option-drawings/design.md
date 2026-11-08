# Design: option-drawings

## Binding decisions, verbatim

### signposts (issues/chart/round-drawings/forks/signposts.md)

Question:

1. Rule or check: when a fix could be skill text the agent must follow, or the akrogon command itself refusing, which do we pick?
   - 1a (recommended, A,C) The command refuses when it already holds the data to check (run counts, recorded fields). Skill text keeps only what needs judgment.
   - 1b The command shows the problem, and the agent or you decide.
   - 1c Skill text only. The agent counts for itself.
   - Steers: #126 (a counted run limit vs prose), #127 (a handoff step that refuses vs a paragraph), #125 (stays text, no test pinning the round shape).
2. Money limit: may a paid run ever go past the run limit you approved?
   - 2a (recommended, A,B) Never. The run is refused, even if the leaf then stops and waits for you.
   - 2b Warn and let it run.
   - Steers: #126 refuse vs warn, and how careful #127 is with paid checks.
3. Unknowns that cost money to check: who pays to find out whether a promised result really works?
   - 3a (recommended, B,C) The chart door, before handoff, with one small capped check you approve. If you don't approve, the promise is narrowed to what was already proven.
   - 3b Hand off with the gap written down, and the leaf finds out while building.
   - 3c Narrow or defer the promise before asking for any more paid work.
   - Steers: #127 how strict the handoff check is, and #126 whether chart-time checks count against a limit.
4. Scope: fix the reported case or the whole kind of problem?
   - 4a (recommended, A) The whole kind, when it adds no more parts. For example, count every paid operation and not only recorder runs.
   - 4b The reported case only.
   - Steers: leaf size in #126 and #127, and whether #125 drawings cover any visible option or only UI panels.
5. Existing work: do the fixes apply to leaves already open or handed off?
   - 5a (recommended, C) New grants and new handoffs only. No migration and no re-check of old handoffs.
   - 5b Open leaves too, with a migration for the old format.
   - Steers: #126 (replace the free-text limit or add a counted field beside it), #127 (re-check past handoffs or not).
6. The herdr-app move: should new work stay out of code the move will replace?
   - 6a (recommended, A) Yes. New checks go in engine code the move keeps (`readiness.ts`, `run-check`, the handoff check), never in herdr-only scripts.
   - 6b Ignore the move.
   - Steers: where the #126 and #127 checks live.
7. Order of the three charts, and is any dropped this session?
   - 7a (recommended, A,C) #127, then #126, then #125. #127 cost the most (about 10 paid sessions, 3 stops), and its answer sets what #126 must count.
   - 7b (B) #126, then #127, then #125, so spend control comes first.
   - 7c #127, #126, and drop #125 to a later manual session, since under autopilot nobody reads the round drawings this session.
   - Steers: session order, and whether #125 is charted now.

Answer and reason:

Operator 2026-11-04, door t15, verbatim: "1c | 2b | 3a | 4a | 5a | 6a | 7a |"

Read as (asked in the simpler wording of the same round):
- 1c: written rules only; the agent keeps its own count. No new command refusals.
- 2b: a paid run past an approved bound is allowed with a warning.
- 3a: the chart door checks a key promise before handoff with one small paid test the operator approves; without approval the promise is cut to what is already proven.
- 4a: fix the whole family of the bug when it adds no parts.
- 5a: new grants and handoffs only; no migration of open leaves.
- 6a: new work lives in akrogon parts the herdr-app move keeps.
- 7a: order proof-limits-handoff (#127), grant-run-count (#126), round-drawings (#125); none dropped.

What the session prioritizes and gives up (A): written skill rules over command checks, a whole bug family over the single case, charting-time proof over discovery during the build, and only parts that survive the herdr-app move. It gives up command-enforced refusals and a hard cap on paid runs: overspend past a bound can still happen, with a warning.

Exclusions: 2b, 3a and 7a have no home in this leaf (paid runs, charting proofs and chart order).

### drawings (issues/chart/round-drawings/forks/drawings.md)

Question:

1. When does a round question carry drawings?
2. Where and in what form?
3. Do autopilot rounds and the signposts round follow the same rule?
4. Does the fork record keep the drawing?

### Carries

- Signposts (forks/signposts.md, Taken): 1c written rules only; 4a whole family when no extra parts; 5a; 6a.
- Operator rule (intake #125): drawings only where they make the operator's decision much easier; every required round part stays.

Answer and reason:

A's picks under autopilot, 2026-11-04 (not operator words).

1. A question carries drawings when its options differ in something a person sees or follows (a screen, layout, state change, flow, file or tree shape) and a drawing makes the choice much easier; otherwise none. Reason: the operator's rule and signpost 4a. Rejected: UI only (narrower than 4a); every visible difference (invites decoration).
2. One fenced text block directly after that question's option bullets and before How to choose, one drawing per option captioned with its option code, side by side when they fit about 80 columns, otherwise stacked; the drawing replaces no required part, and A's pre-send read covers it. Reason: the operator's placement; narrow panes. Rejected: drawings inside bullets (breaks the list), a later section (separates picture and options).
3. Same rule for every presented round, autopilot included, and the signposts light round may carry drawings under the same test (one word in its exception sentence). Reason: one rule, no mode branch (simplicity). Standing dissent: C would leave the signposts round without drawings.
4. The fork's Taken keeps the chosen option's drawing verbatim, beside the recorded avoidance mechanisms. Reason: the herdr-panels drawings that decided picks were lost (C).

Carried: the template's own fence must still render with a drawing inside it; the Needs-you parser note stays with that leaf (recorded only).

### Corrections adopted 2026-11-04 (A's picks; slots/review-B.md, review-C.md)

- Pick 2 (C 1): side by side when both drawings fit the door pane's width (about 60 columns; this session's pane is 67), otherwise stacked; the template example fits 60 columns.
- Docs (B): the plan-work.md sentence keeps the "much easier" condition.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Skill and docs text only: no secrets, auth, backend or browser surface. No vanity tests: no test pins the round shape; review reads the text against the done-criteria and renders the template once by eye.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/assets/questions.md` "Operator questions and peer exchange": the round template (a drawing block under question 1's options, with an inner fence that differs from the template's own), the "Every round uses this shape" paragraph (when, where, form, kept parts, pre-send read), the signposts exception sentence (one word allowing drawings under the same test), and the sentence on what the fork records (keeps the chosen option's drawing).
- `docs/use/plan-work.md` "Answer one fork per round": one sentence.

Consumers: the chart door (A) writing every round; the operator reading it; consultants reading process text by section.

Exclusions: `src/`, `tests/`, `issues/` unchanged; `SKILL.md` unchanged (rounds stay printed chat text, which a fenced text drawing already is); the Needs-you parser note belongs to that leaf; image or SVG drawings are out (rounds are chat text).
