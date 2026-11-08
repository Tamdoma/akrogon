# Design: silent-parent-status

## Binding decisions, verbatim

### signposts (akrogon issues/chart/round-drawings/forks/signposts.md)

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

Exclusions: 2b, 3a, 5a and 7a concern akrogon grants, charting and chart order; 1c (written rules over command checks) concerns akrogon's own checks. They have no home in this mod leaf. 4a and 6a apply: the change stays in the mod, which survives the akrogon herdr-app move.

### silent-parent (akrogon issues/chart/agent-status-stale/forks/silent-parent.md)

Question:

1. Where does the fix live?
2. What does a silent parent show in the Agents list?
3. Does akrogon add a rule against backgrounding the door?

### Carries

- Session signposts (forks/signposts.md, Taken): 1c written rules over command checks; 4a whole family when no extra parts; 5a; 6a parts the herdr-app move keeps. This chart: full autopilot, A answers (operator 2026-11-04: "autopilot, autopilot signposts").

Answer and reason:

A's picks under full autopilot, 2026-11-04 (not operator words).

1. Three parts. (a) herdr-setup `agents-by-tab`: honest silence (pick 2), one leaf. (b) Operator step: report to Claude Code that a background job (`/bg`, `CLAUDE_CODE_SESSION_KIND=bg`) sends no OSC 7501 program status to its terminal and the viewer does not relay it, with the evidence in slots/map-C.md section 1. (c) akrogon step on main: one line in issues/chart/herdr-app/INTAKE.md that a backgrounded door reports no status to hc and appears as `agent: bash`, with the recovery "/stop, then claude --resume". Reason: the root fix belongs to the program that runs the job; the mod change is the only part under our lifecycle that makes the screen honest; signposts 1c, 6a. Rejected: a core status setter, a job-file reader, an OSC-writing hook (each adds a second status source).
2. A row the mod synthesizes for a silent ancestor (own status null, live sub-agents) shows a "no status" marker in the theme's `unknown` colour and no duration; in the priority view its family goes to a "No status" section between Working and Idle when no member is more urgent, so it never reads as Idle by its own silence; the folded group header's most-urgent state includes sub-agents. Plain shell panes without agent sub-agents stay as today; the viewer-closed case has no signal and stays out. Reason: function over form; honest over guessed. Rejected: show the children's state as today (the reported bug); guess working.
3. No rule against backgrounding: whether `/bg` was wanted is the operator's workflow choice, and the intake line in 1c records the effect and the recovery. Reason: removing over adding; a rule would forbid a feature the operator may use. Standing dissent: C (rule text plus recovery line).

Exclusions: parts 1(b) (the upstream Claude Code report, an operator step) and 1(c) (the akrogon intake line, made on akrogon main by the chart door) are not this leaf's.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. A local mod: no auth, secrets or backend. Each done-criterion is proven by the cheapest sufficient test: pure functions of the mod (ranking, section choice, folded-header state) tested in `tests/agents-by-tab.test.js` beside the existing ancestry tests, plus `herdr-app check` for load and render; new behaviour shows one deliberate break turning its test red. A screenshot is not required (no criterion asks for one), and a native frame can look right while describing a stale state (akrogon LESSONS 2026-11-03).

## Leaf architecture

Owned surfaces: `mods/agents-by-tab/main.js` (`RANK`, `SECTION`, `SECTION_STATUS`, the rank used for grouping, the `status()` marker, the duration shown for a row, the folded `header` most-urgent reduce); `mods/agents-by-tab/tree.js`, the mod's pure module (main.js imports `herdr`, `gpui-kit` and `gpui-base`, which exist only in the app, so tests cannot import it): it gains the pure helpers the criteria are proven on (family rank including a silent parent, section for a rank, folded-header most-urgent state), and `topLevel` keeps its ancestry behaviour; `tests/agents-by-tab.test.js`.

State the change alters and its consumers: the section a family lands in (consumer: `render` group building, `setAgentOrder` follows list order, so `agent.next`/`agent.prev` order changes with sections); the duration label (consumer: the row builder via `since(a)`, which reads the address's persisted `changed` stamp; a synthesized row never reaches `track`, so the row builder shows no duration when the row's status is null, and `track` is unchanged).

Observed at charting (readiness.yaml `proofs`): the `unknown` theme colour exists (herdr.d.ts `theme()` doc lists it; the shipped `spaces` mod and herdr-setup `spaces-list` use `t.unknown`). Open for the plan: the exact marker shape.

Exclusions: herdr-core and Claude Code (upstream); reading `~/.claude/jobs` (rejected); the case where the viewer closed and no row exists (no signal).
