# Design: coverage-audit

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

Exclusions: 7a (chart order) and 2b (paid runs past a bound, not restated in this leaf's text, owned by chart grant-run-count, Tamdoma/akrogon#126) have no home in this leaf.

### proof-coverage (issues/chart/proof-limits-handoff/forks/proof-coverage.md)

Question:

1. Where does the check that a proof reached a promise's key part live, and what record does it leave?
2. Which key parts need a charting observation, and how is it chosen?
3. When the observing call is declined or no safe one exists, what happens to the promise (signpost 3a against SKILL.md "Take": "scope is not narrowed. There is no waiver")?

### Carries

- Signposts (issues/chart/round-drawings/forks/signposts.md, Taken): 1c written rules only; 2b; 3a door checks a key promise before handoff with one small paid test the operator approves, else the promise is cut to what is proven; 4a whole family when no extra parts; 5a new handoffs only; 6a parts the herdr-app move keeps.
- Intake: Tamdoma/akrogon#127.

Answer and reason:

A's picks under autopilot, 2026-11-04 (not operator words).

1. The existing implementer audit (shapes.md "Preflight and validation") gains one step: for each done-criterion, every clause whose pass rests on something that exists before the leaf builds (an outside system's acceptance, an existing checker's verdict, existing data or recordings) names the proof or charting observation that reached it. The rule is stated once in SKILL.md "Take" by generalizing the existing sentence: a proof counts only for the property it observed, which `limits` records. The handoff review gets one line per leaf listing those pre-existing key parts with the proof that reached each, and anything cut (signpost 3a). No per-criterion line for parts the leaf builds, no fixed phrases, no schema field.
   - Reason: signposts 1c and 4a; the existing dry-run and config-key rules become one general rule (removing over adding); C R3 shows the line is the only durable record under autopilot, and B F3's boilerplate concern is met by listing only pre-existing key parts.
   - Rejected: a proof that stops early counts as no proof (over-refuses proven parts); operator reads limits at review (no reader under autopilot); a `proves:` field (signpost 1c, breaks 5a).
   - Standing dissent: B on the review line format (accepts a semantic audit, not a new reporting line). A keeps the line because it is the record, not a gate.
2. Observed by the smallest call that reaches the key part, free before paid; the one operator-approved paid test of signpost 3a is the ceiling. A compound criterion has one key part per such clause (C R2). Stale recordings against a newer checker are existing data under this rule, so no separate pointer.
   - Reason: signposts 3a, 4a; C Q2; B F1 shows the free check covers only part, so the paid ceiling stays.
   - Rejected: external operations only (misses #127's case).
3. One rule (B): every operation and key part kept in the contract needs its proof before handoff; a declined probe, or no safe one, cuts the contract to what is proven at the handoff review, naming what was cut, and the cut removes that proof obligation with it. If the cut removes the chart's useful outcome, it is a scope question, not a vacuous contract. "There is no waiver" stays: nothing unproven is handed off as promised. A cut part goes to a prerequisite leaf only under the existing missing-machinery rule. questions.md "Optional measurement" keeps "never replaces required proof". A paid probe still waits for the operator's grant approval under autopilot.
   - Reason: signpost 3a as the operator's words; one rule instead of an operation/property exception (simplicity); the old "scope is not narrowed" sentence is what contradicts 3a.
   - Rejected: keep the hold for operations and narrow only promises (A's map; two rules for one idea); hold only (contradicts 3a); narrowing replaces "no waiver" (would let unproven promises through).

Carried into the leaf: the fix reaches doors only at the next release link; the handoff review says so (C R4). New handoffs only (signpost 5a).

### Final-shape check, adopted 2026-11-04 (A's picks; slots/proof-coverage-final-check-B.md, -C.md)

- Pick 2 (B F1): "ceiling" becomes the approved test budget. Signpost 2b stands: a run past the approved bound is allowed with a warning; grant counting is #126's.
- Pick 1 (B F2): a clause that needs an existing checker to accept output the leaf builds is split: the existing input or contract assumption (here: the checked-in fixture and the current verify checks) is observed at charting; acceptance of the new output stays the leaf's done-criterion proof. Neither the finished product before handoff nor labelling the existing-data assumption as new work satisfies the rule.
- Pick 1 (C K1): every observation a kept key part rests on, free ones included, is a `proofs` entry in `readiness.yaml` with its own `limits` (`cleanup` may say none); the review line cites those entries.
- Pick 3 (C K2): `assets/questions.md` "Optional measurement" sentence "Declining a required probe holds the handoff under the Take operation-proof rule" is replaced by the cut rule; "never replaces required operation proof" stays.
- Pick 3 (C K3): a cut that removes the chart's useful outcome parks the chart for the operator under the existing non-grant approval wait, with the cut and its reason recorded; A never answers it (A never drops a handed chart).
- Pick 3 (C K4): a cut names where it lands: a prerequisite leaf under the machinery rule, an exclusion in each dependent's design, or an Off route entry in CHART.md; the brief's What drops a cut operation, so the existing missing-proof refusal stays consistent.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. This leaf changes skill text only: no secrets, auth, backend or browser surface, so those lines do not apply. No vanity tests: no test pins the new prose; review reads it against the done-criteria. The new rule itself restates two standing-design lines for charting ("cheapest sufficient test", "an input whose effect on a model stage is unknown is investigated"); the leaf points to them rather than copying them.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/SKILL.md` "Take": the paragraph beginning "Every external operation a brief names" (the general proof rule, the key-part rule, the cut rule replacing "when no safe sufficient probe exists the handoff is held and scope is not narrowed"). The two special-case sentences (provider dry-run, locked outside-tool setting) fold into the general rule; their specifics (real identity and target; same key, location and value) stay.
- `SKILL.md` "Handoff": one sentence beside the existing live-run review line, for the key-part line and the release-link note.
- `skills/chart-issues/assets/shapes.md` "Preflight and validation": the implementer-audit paragraph beginning "Read the briefs as an implementer" gains the per-criterion key-part step; the sentence "Refuse the handoff when a brief names an external operation with no recorded proof" stays and gains the key-part refusal beside it.
- `skills/chart-issues/assets/questions.md` "Optional measurement": its last sentence ("Declining a required probe holds the handoff under the Take operation-proof rule") is replaced by the cut rule; "never replaces required operation proof" stays.
- `docs/use/plan-work.md` "Review the handoff": one sentence.

Consumers of the changed rule: the chart door (A) reading "Take" and the shapes audit at every handoff; consultants reviewing leaf drafts. `SKILL.md` "Autopilot" wait list: a cut that removes the chart's useful outcome uses the existing "operator approval that is not a grant" wait; the leaf adds a pointer there only if the plan finds the existing wording does not cover it. No code reads `limits`: `src/readiness.ts` `proofSchema` stays as is (signpost 1c; schema field rejected in proof-coverage).

Exclusions:
- Grant run counting and bounds: chart grant-run-count (#126).
- Round drawings: chart round-drawings (#125).
- Signposts docs and file references: chart signposts-docs.
- `src/`, `tests/`, `issues/`: unchanged.
- The installed release copy (`~/.akrogon/current`): updated by the normal release, not by this leaf.

The review line is written as decided. B's standing dissent on its format (fork proof-coverage, pick 1) is recorded and changes nothing in this leaf.

Docs inventory (A, 2026-11-04, B leaf review): `grep -rn -i "handoff review|operation proof|real call|probe|waiver|not narrowed" docs README.md` finds only `docs/use/plan-work.md` "Review the handoff" listing what the review shows; `docs/use/quick-fix.md`, `docs/examples/quick-fix-story.md`, `docs/examples/autopilot-story.md` and `docs/start/one-change.md` mention the review without restating the proof rule or its contents, so they stay unchanged. No other docs page is in scope; a hit the plan finds elsewhere is reported under known limitations, not edited.
