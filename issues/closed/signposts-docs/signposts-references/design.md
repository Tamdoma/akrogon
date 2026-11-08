# Design: signposts-references

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

Exclusions: 2b, 3a and 7a have no home in this leaf.

### docs-scope (issues/chart/signposts-docs/forks/docs-scope.md)

Question:

1. How much of the signposts rule do the user pages carry?
2. Which pictures change?
3. How far does the files.md chart row go?
4. Does the mode-aware wording fix reach pages outside the signposts sections?
5. Where does the TAKEN count meaning live, and does skills/AREA.md get a chart-issues line?

### Carries

- Signposts (forks/signposts.md, Taken): 1c written rules only; 4a the whole family when no extra parts; 5a; 6a.
- Operator words (INTAKE.md): "the akrogon documentation and file references update. We haven't done it since introducing signposts."

Answer and reason:

A's picks under autopilot, 2026-11-04 (not operator words).

1. User pages carry what the operator sees and does, and link the skill for records and procedure: plan-work "Set the signposts" gains the missed-angles exchange, the light round and the account line, original and copies, corrections and conflicts, chart order and drops, what a door session is and the autopilot unanswered rule; "Open a chart" names the mode in the first reply and that `forks/signposts.md` is the session record; autopilot.md gains mid-chart switch-on, presented-not-a-wait, the full-autopilot drop rule, the signposts order and the `signposts:` record line. Reason: where-things-go.md "One home per fact" (removing over adding). Rejected: the whole rule in docs (copies the skill); file references only (leaves stale pages).
2. chart-door.svg stays (its caption already states the order). ways-to-run.svg changes its autopilot label text only, no layout. Reason: fewest parts.
3. The files.md `chart/<chart>/` row lists the whole chart folder from shapes.md "Chart records" (`CHART.md`, `INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/` with `signposts.md` as the session record, `slots/`, `direct/`). Reason: the operator's "file references"; one row, no new part.
4. Yes: words.md "Chart door" and "Fork", limits.md "What stays your job" and its product-questions bullet, why-it-works.md "A contract comes before code" and what-it-is.md "The words" Chart entry become mode-aware; approvals stay operator-only. Reason: signpost 4a; these pages contradict the three modes.
5. TAKEN's meaning lives in the commands.md `akrogon status` row (one clause: `--charts` TAKEN counts every fork file with a non-empty Taken, the signposts record included). skills/AREA.md gains one Key files line for chart-issues and its assets. Reason: one home per fact; the agent index had no route to the chart door.

### Corrections adopted 2026-11-04 (A's picks; slots/review-C.md)

- Pick 4 (C R1): the four pages stop claiming the operator answers every fork and link autopilot.md for who answers per mode; only limits.md states that approvals stay the operator's. One home per fact.
- Pick 2 (C R2): the ways-to-run.svg label stays one line of at most about 30 characters in its existing box.
- Autopilot.md order wording (C R3): the next chart not waiting, in the signposts order.
- Files reference (B F1): files.md also says a handover entry in the Mode record carries the signposts path, linking the skill's Handover section.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Docs and index text only: no secrets, auth, backend or browser surface. No vanity tests: no test pins prose; `tests/docs-links.test.ts` (an existing check run by `bun test`) proves links and anchors still resolve. Review reads each page against the skill sections named below.

## Leaf architecture

Source of truth the pages must match (read, never edited): `skills/chart-issues/SKILL.md` "Open", "Drain", "Autopilot", "Handover"; `skills/chart-issues/assets/shapes.md` "Chart records"; `skills/chart-issues/assets/questions.md` (the signposts paragraph); `src/status.ts` `chartRow` (TAKEN counts every `forks/*.md` with a non-empty `## Taken`).

Owned surfaces: the files and sections named in the brief's What. Every edit says what the operator sees and links the skill for procedure (`docs/reference/where-things-go.md` "One home per fact"). `docs/pictures/ways-to-run.svg`: label text only; no layout or coordinate change beyond what a longer label needs inside its existing box.

Exclusions with owners:
- `docs/use/plan-work.md` "Answer one fork per round": leaf round-drawings/option-drawings adds its sentence there; "Review the handoff": changed by proof-coverage/coverage-audit (merged 5499e3da). This leaf edits neither section.
- `docs/pictures/chart-door.svg`: unchanged; the plan-work caption already states that the signposts round runs before any map.
- `docs/examples/*` and `docs/start/one-change.md`: real earlier cases, unchanged.
- `src/AREA.md`, `docs/README.md`, `docs/reference-index.md`, root `README.md`: no wrong claim found; unchanged.
- `skills/chart-issues/*`: the source, unchanged.
