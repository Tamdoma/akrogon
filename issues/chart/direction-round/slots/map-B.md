# Independent territory map B

## Binding direction and evidence

The operator's main intent is to select priorities and obtain important steering votes that change the process's direction, whether answered by the operator or A on autopilot. Judge this step by its effect on the maps and later choices, not by whether a questionnaire was completed. Source: E1, operator's main-intent correction.

The operator's latest correction governs: **one direction round per door session, across all its charts**, not once per chart. It supersedes A's 3a. Other settled choices remain: consultants add missed angles before presentation, aim for 4–7 material questions, use a light direction format, record in `forks/direction.md`, direction precedes generic autopilot values, and supply missing direction before A begins making mid-chart autopilot picks. The interaction between that last rule and an already completed direction round needs clarification, not a second compulsory round.

Sources inspected on 2026-11-04:

- E1 · operator: `issues/chart/direction-round/INTAKE.md`, Observation and Expected behavior, plus `forks/direction.md` Taken, including the latest session-wide correction. Intake's older per-chart requirement is superseded.
- E2 · primary code/process: `skills/chart-issues/SKILL.md`, Open (line 23), Drain (41), Take (51), Handoff (69), Autopilot (131), Handover (153). These establish the existing sequencing, records, approval boundaries and fresh-session continuation.
- E3 · primary process: `skills/chart-issues/assets/questions.md`, opening round format, Research (33), Blind peer exchange (44). Current text requires the full format for every round and forbids treating silence as an answer.
- E4 · primary process: `skills/chart-issues/assets/shapes.md`, Chart records (5), including Mode record (49), Autopilot (59), and the fork template. Open answers, appended corrections, provenance and chart resume links already exist.
- E5 · operator case material: `issues/chart/tasks-hierarchy/forks/direction.md`, Taken and Round 2; `slots/direction-brief-C.md`; `slots/direction-C.md`, Angles not yet asked and Dropped; CHART.md, Mode record and Autopilot. This is a recorded case, not evidence that seven questions always suffice.
- E6 · primary code/tests: `skills/chart-issues/scripts/chart-usage.ts`, main; `tests/chart-usage.test.ts` test names; `tests/chart-shapes.test.ts` whole; `tests/door-reset.test.ts`, “docs describe the handover entries and footer wording”; chart references located with `rg` in tests. Usage consumes seat sessions, spans and transcripts, not direction files. Shapes tests currently validate readiness, not direction quality.

The recommendations below are B's design judgments from those sources. No external tool or outside workflow claim needs an additional outside source.

## Forks that change the outcome

### F1 · Where does direction sit relative to Open and the independent map?

- O1a (recommended): do Open's intake and relevant surface reading, collect independent direction angles from the active consultants, settle the single session direction round, then let A and consultants independently build the territory map with the same settled direction. Drain's individual fork rounds follow the merged map. Reading a surface to ask informed questions is not already publishing its map.
- O1b: build a provisional independent map, ask direction, then redo affected maps. This supplies examples early but repeats mapping and can anchor the operator to categories invented before priorities were known.

O1a removes the need to revise an opening map immediately. Do not restart consultants between direction and the map: Open's existing restart is at chart entry, not at every exchange. E1–E3 require direction to shape the opening map and already provide blind exchanges; this adds a named exchange, not a new coordination mechanism.

### F2 · What counts as the session when A is reset or work is added?

- O2a (recommended): the logical door run and its continuing chart list. Fresh A on an authorized handover consumes the same direction. Newly included charts use its scoped priorities, with their own maps and fork evidence.
- O2b: each harness conversation is a new priority session. Handover would repeatedly ask direction while traversing the same chart list, undermining the operator's correction.

Clarify that compaction, a chart switch, and a handover reset do not themselves start a new priority session. A truly new door run needs its own direction. Reuse of a chart folder alone must not select an unrelated previous run's priorities. Existing handover instructions with provenance and scope can carry the canonical record reference, so a new session-ID registry is unnecessary. E1, E2 Handover, E4 Mode record.

### F3 · Who answers, and what happens on a mid-chart autopilot switch?

- O3a (recommended): attended direction is operator-answered. Ordinary autopilot also leaves this first direction round to the operator unless direction itself is explicitly delegated. When switching later, ask direction only if the logical session has none. Reuse completed direction without asking it again.
- O3b: every autopilot switch asks a replacement direction round. This conflicts with the latest once-per-session instruction and could reopen priorities the operator already supplied.

The exact example phrase is illustrative, not a command string. “You answer the directions” is explicit authorization in this case. A's answers remain labelled A's, with reasons, and never become operator quotations. Direction delegation does not authorize grants, retention, new charts or other approvals. E1 latest correction supersedes any conflicting reading of A's 6a; E2 Autopilot preserves earlier operator answers and operator-only approvals. Resolve the textual conflict explicitly in the final shape.

### F4 · Where is the single answer stored and how does it reach every chart?

- O4a (recommended): keep one canonical `forks/direction.md` in the chart hosting the session's opening round. Other charts link to it with provenance and applicable scope. Carry that reference in handover instructions and into relevant fork carries and contract decisions.
- O4b: copy the answer into every chart's direction file. Copies make charts self-contained but create several records that can diverge after a correction.

O4a respects the selected file shape without adding a session directory or global mutable record. It needs an explicit link from every chart's resume context, including next-chart folders created before their map. Closing or handing off the host chart retains its files already. Keep direction authorship separate from Mode record, which tracks operating mode. Record the answer once, preserve the operator's words, and append scoped corrections to the canonical record. E2 Open/Handover, E4 Chart records and fork correction rules, E1 chosen record shape.

### F5 · How does the light round avoid invented choices and unfinished answers?

- O5a (recommended): ask only priorities whose alternatives change several later decisions. Use the chosen light format with explicit answer ownership, a reply key and unresolved answers kept open. Evidence establishes facts and feasibility, while the operator supplies intent unless delegated.
- O5b: require exactly 4–7 answers or apply every fork-round research field. This invites filler questions or recreates the expensive full round that A's light-format choice rejected.

Make the light direction round an explicit exception in questions.md so “every round” does not silently override it. Do not turn a missing answer into “no preference”: the observed board record does that for question 7, while E3's existing rule says omitted material answers stay open. Ask how a fully specified intake completes the required step without manufacturing preferences. This is a narrow edge case to settle, not grounds to skip direction. E1 chosen 1a/4a, E3, E5.

## Practitioner questions and lifetime pitfalls

- Q1 · Which answer would change several decisions, and which is merely a technical question evidence can settle? E5's C return explicitly separates reading habits, urgency tolerance and lifetime from producer mechanisms. Use that separation to prevent direction becoming implementation design.
- Q2 · Which priorities apply to all charts, and which apply only to the named board or issue? E5 mixes broad preferences with board-specific choices. Record scope beside the priority so “grey and white” does not become a rule for unrelated destinations.
- Q3 · Can a fresh A find the exact governing answers without reconstructing old chat? E2 Handover and E4 resume links should carry the canonical record reference. Copying prose across charts would invite drift.
- Q4 · What changes if a later answer contradicts direction? E4 already supports appended scoped corrections. A fork answer must not silently rewrite session-wide intent or previously handed contracts. Preserve the correction's scope and update affected live forks and maps when material.
- Q5 · What prevents the direction round itself from expanding the handed list? E2 Autopilot already reserves list changes to the operator. Keep discovered destinations as existing proposals or recorded-only work, rather than interpreting a broad priority as permission.

## Map, record and verification changes

- A1 · Change SKILL.md Open/Drain to name the one session direction step before the independent opening maps, and Take/Autopilot/Handover to consume it consistently. Map briefs carry the same direction reference and locks. Maps explain how priorities changed fork inclusion, recommendation or ordering, without inventing decisions from preferences. Later material recommendations identify the priority that steers them when it matters, so the record demonstrates the impact of the steering votes instead of merely retaining their wording.
- A2 · Change questions.md for direction-angle collection and the light-format exception. Reuse blind briefs, fresh return paths and the existing peer wait/drop rules. Change shapes.md to show the canonical direction link, session scope, answer provenance and continuation references. Do not introduce lifecycle phases or runtime enforcement merely for this prose step. E2–E4.
- A3 · Keep chart-usage.ts unchanged unless an actual measurement defect is demonstrated. Open the existing first span before direction work, and retain the first chart's shared-opening accounting so direction and mapping are counted once. Its “first turn in window” is a transcript measurement, not a promise that a multi-turn opening is entirely measured there. E2 Open/Handoff and E6.
- A4 · Mechanical checks can verify links, required existing record structure, nonempty answers and valid provenance fields where those are structurally represented, plus existing usage and readiness behavior. Reuse docs-link checks and relevant existing tests if touched. Do not add exact-phrase tests or a parser that claims to detect good priorities.
- A5 · Agent review must assess whether questions concern intent, reshape multiple forks, respect scoped priorities, collect consultant angles and preserve answer ownership. Review scenarios: attended first entry, ordinary autopilot waiting for direction, explicit direction delegation, mid-chart switching with and without existing direction, two unlike charts, and fresh-A handover. Observe maps and records, not exact words. Keep these as bounded review cases unless the chosen implementation actually needs live machinery; E6's current tests do not establish that agents follow the process. Any required live-run criterion must use Handoff's existing machinery/estimate rules rather than assume a missing evaluator exists.

One door-step change is sufficient. The central decision is the durable, session-wide direction reference that survives chart switches while shaping each chart's first map.
