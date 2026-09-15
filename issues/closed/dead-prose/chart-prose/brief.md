# Brief: chart-prose

## What
Prose only, inside `skills/chart-issues/`. Line numbers are origin/main at 735cd63, which already carries the operator's Research edits to `SKILL.md` and `assets/questions.md`.

1. Small rounds. questions.md:27 is replaced by the design's wording: the same list of parts, then a small round keeps the parts that carry the decision, the reply key and the challenge check, then the unchanged continuous-numbering sentence.
2. Corrections. In shapes.md:80, the sentence from "A taken fork is never reopened" through "binding decision." is replaced by: "Append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes." The rest of the paragraph stays.
3. Forks open. Delete the `## Forks open` heading and its sample line from the CHART template at shapes.md:26-27. shapes.md:80 gains: a fork file with no operator answer under `## Taken` is open, and CHART.md lists none. The preflight paragraph at shapes.md:166 gains: refuse the handoff while any fork file lacks an operator answer or `## Fog` is not empty.
4. Standing block. shapes.md:142 placeholder becomes the installed path of standing-design.md followed by the current interpretation paragraph, how those rules apply to this leaf. standing-design.md last line becomes: each leaf design names this file's installed path and writes its own interpretation. The sentence at shapes.md:148 about copying binding decisions stays.
5. Write order. The state.yaml sample at shapes.md:150-157 gets `# plan.positions when debate: 'yes'` on the phase line. shapes.md:170 gains: write brief.md and design.md before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml.

## Why
Astra audit F6: a small operator question should be small. This session every chart listed Forks open then emptied it, copied nine standing rules into every design, and hand-wrote dated corrections with no rule for them. The sample phase line already carries the right value but nothing marks the debate-yes case. Operator answers 2026-09-14: 24a, 25a, 26a, 27a, 28a.

## Done-criteria
1. `grep -n "never cut" skills/chart-issues/assets/questions.md` is empty.
2. `grep -rn "Forks open" skills/chart-issues/` is empty and `grep -c "^## Fog$" skills/chart-issues/assets/shapes.md` prints 1.
3. `grep -n "binding only for the answer it changes" skills/chart-issues/assets/shapes.md` prints one line.
4. `grep -n "verbatim into each leaf design" skills/chart-issues/assets/standing-design.md` is empty; `grep -n "installed path" skills/chart-issues/assets/shapes.md skills/chart-issues/assets/standing-design.md` prints one line in each file.
5. `grep -n "before state.yaml" skills/chart-issues/assets/shapes.md` prints one line and `grep -n "plan.positions when debate" skills/chart-issues/assets/shapes.md` prints the sample phase line.
6. `git diff origin/main --stat` lists only files under `skills/chart-issues/`.
7. `bun test`, `bun run typecheck` and `bun run format` pass.
