# Intake: operator-decisions

## Scope

One destination in the akrogon repo: an operator decision recorded in a seed (as in Tamdoma/tamdoma-framework#714) enters charting as already taken, and the door charts only what the decision leaves open. Proposed grouping pending the opening map.

## Provenance

- GitHub: Tamdoma/akrogon#144
- Operator: door message 2026-11-18

## Source: Tamdoma/akrogon#144

# An operator's decided solution written into a seeded issue has no standing: seed-issue forbids fixes and chart-issues re-asks every fork

Source: Tamdoma/akrogon#144
URL: https://github.com/Tamdoma/akrogon/issues/144

Origin repo: Tamdoma/buffalo-exterminators

Unverified intake.

## Observation

On 2026-11-18, inside the consumer project Tamdoma/buffalo-exterminators and outside any chart-issues session, the operator spent a long time with several consultants (Fable 5.2 high, Gemini 4 Neon high, the session agent). Together they settled the fix for a framework defect. The operator then had the decided fix written into the seeded issue Tamdoma/tamdoma-framework#714 as an "Operator decision (Ivan Juras, 2026-11-18): settled, not open for redesign" section. It contains the exact design, what is out of scope and a done-test.

No akrogon rule gives that section standing:
- seed-issue tells the author to add "no recommended fixes or planning metadata" (`skills/seed-issue/SKILL.md:34`). So the decision had to be added against the skill's own rule.
- chart-issues imports a report's text verbatim, kept separate from agent findings and scope (`skills/chart-issues/SKILL.md:35`). That makes it intake, not answers.
- A fork is taken only by an operator answer given in a fork round. "Recommendations and silence cannot supply an operator answer" (`skills/chart-issues/assets/questions.md:39`). A fork file with no operator answer under `## Taken` is open (`skills/chart-issues/assets/shapes.md:167`).

So a door session charting #714 would research the design again and present it as open forks. That reopens a decision the operator has already made.

Operator statement (2026-11-18, paraphrased): when the operator decides the solution inside a specific project, outside the charting process, after consulting, that decision must be taken as the solution. Charting must chart around it, and it is no longer negotiable.

## Location

`skills/seed-issue/SKILL.md:34` (Report rule). `skills/chart-issues/SKILL.md:35` (intake import). `skills/chart-issues/assets/questions.md:39` (who answers a fork). `skills/chart-issues/assets/shapes.md:167` (fork Taken).

## Reproduction

1. In a consumer project, settle a fix with the operator outside chart-issues.
2. Record it in the seeded issue as an operator decision.
3. Open a chart-issues door on that issue.
Expected per the current text: the design is researched and asked again as forks. Frequency: every seed that carries an operator-decided solution. Not run end to end. This is from reading the skills.

## Expected behavior

Reporter: an operator decision recorded in a seed, and marked as the operator's, counts as already taken. Charting treats it as a binding constraint. It charts only what the decision leaves open, such as leaf split, proofs and gaps the decision does not cover, and does not re-litigate it. seed-issue has a sanctioned place for such a decision, distinct from agent recommendations.

## Urgency

High for operator time. A decision reached after several consultant rounds is otherwise asked again at the door. There is also a risk that the door's autopilot picks something else, because autopilot answers forks by evidence and signposts (`skills/chart-issues/assets/autopilot.md:5`). Workaround: the operator repeats the decision verbatim at each fork round.

## Suspected cause

Agent view, supported: the intake path has two kinds of text, reporter statement and agent findings, and the fork path has one kind of answer, the operator's reply in a round. Nothing maps a reporter-recorded operator decision onto a taken fork. seed-issue's no-fixes rule was written for unverified agent intake and does not tell an agent's guess apart from an operator's decision.
Files read: installed release 5efc625d `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md`, `assets/autopilot.md` (grep), `~/.claude/skills/seed-issue/SKILL.md`. Line numbers checked against the workspace checkout `/home/ivan/Work/infra/akrogon` at 5efc625d.
Not inspected: whether the `issues/seeds/*.md` mirror picks up later edits to a GitHub issue body (the decision was added by editing #714); the handover and direct-route assets.
Related reports: none found. Searched Tamdoma/akrogon all states: the filing account's reports since 2026-11-16 (#137-#143, none related), "operator decision intake", "settled solution seed", limit 8 each. Example seed: Tamdoma/tamdoma-framework#714.

## Source: operator door message 2026-11-18

I just pulled an issue. We need to chart it out. Use slot P consultant, which is Fable 5.2. High effort. Manual mode, ask me. Basically, the intent is to have a small gate to push the actual solution that was found very effective in a real Akrogon consumed repo. So that we don't have to chart about the actual solution, but we can chart about everything else around it.

## Agent findings

- Cited lines checked at 5efc625d (local main equals origin/main): `skills/seed-issue/SKILL.md:34` ends "adding no recommended fixes or planning metadata"; `skills/chart-issues/SKILL.md:35` imports reports verbatim separately from agent findings and scope; `skills/chart-issues/assets/questions.md:39` "Recommendations and silence cannot supply an operator answer"; `skills/chart-issues/assets/shapes.md:167` a fork without an operator answer under `## Taken` is open.
- The worked example Tamdoma/tamdoma-framework#714 (read with `gh issue view`, 2026-11-18) carries, after `Unverified intake.`, a section `## Operator decision (Ivan Juras, 2026-11-18): settled, not open for redesign` holding five numbered design points, a `Not in scope:` line and a `Done when:` line, plus later sections `## Proposed solution (operator-requested, 2026-11-18; agent and Fable 5.2 review)` and `## Second review (Gemini 4 Neon high, 2026-11-18)`. The decision section was added by editing the issue after filing.
- `src/pull.ts` `pullRepo` rewrites every open issue's mirror from the current body on each pull (writeFileSync over all desired names), so a body edit such as #714's added decision reaches the mirror at the next `akrogon pull`; a chart INTAKE.md copy made before the edit does not change.
- Reading "small gate" in the operator's note as: a narrow, explicit entry by which an operator-decided solution is pushed into the lifecycle as settled, with charting limited to everything around it. To be confirmed in the signposts round.
