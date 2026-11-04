<!-- Verbatim copy of issues/chart/round-drawings/forks/signposts.md, which holds the original. -->
# Signposts: round-drawings

Original for the session opened 2026-11-04T08:58:05Z in door t15 (charts round-drawings, grant-run-count, proof-limits-handoff). Angles merged from slots/signposts-A.md, slots/signposts-B.md, slots/signposts-C.md. No earlier signposts record exists on this repo, so no answers were proposed from one.

## Question

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

## Taken

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
