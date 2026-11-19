# Signposts draft (A), operator-decisions, 2026-11-18

1. What comes first when they conflict?
   - 1a (recommended) Operator time first: a decision the operator recorded is never asked again; trust is kept by a marker the door can check plus one cheap confirmation, not by re-research.
   - 1b Trust first: the door re-verifies every recorded decision against live code before accepting it.
   - Steers: how strict the entry check is, what the door researches, autopilot behavior.
2. What does a recorded decision lock?
   - 2a (recommended) Exactly what it states (design, out of scope, done test). Everything it is silent on stays chartable: leaf split, proofs, grants, gaps, needs. A fact the door finds that contradicts the decision (a cited line moved, a named file gone) is shown to the operator as a fact, never turned into a fork the door answers.
   - 2b Everything: a seed with a decision goes straight to handoff.
   - Steers: every fork, the direct route, done-criteria wording.
3. What may the change add?
   - 3a (recommended) Rule text in existing skill files only (seed-issue Report, chart-issues Open and Take, questions.md, shapes.md, autopilot.md); no new command, parser or record kind.
   - 3b A small code change in the command too (for example pull or status recognizing the decision section).
   - Steers: leaf count, proofs, what done-criteria can check.
4. What may proofs cost?
   - 4a (recommended) Free only: reads, temp repos, existing tests; no paid model launches.
   - 4b A small paid budget for one real door run on a seed with a decision.
   - Steers: every proof and grant.
5. What is in this session?
   - 5a (recommended) #144 in akrogon only; Tamdoma/tamdoma-framework#714 is the worked example, read only, not charted here.
   - 5b Also chart #714 in the framework as the first live use.
   - Steers: chart order, destinations, closes.
