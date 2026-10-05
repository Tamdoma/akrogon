# Final-shape check C: chart-grouping

Shape checked: no change to chart-issues. Existing rules carry the grouping.

No objection to the shape. It breaks no lock. Two records need a matching edit, and one gap should be recorded as an accepted cost next to the one already named.

## Locks

- The discovery-role lock says chart-issues "verifies the cause against live code with its own file:line evidence and groups seeds under one completion owner only after operator confirmation". Existing rules do this: imported text stays verbatim and apart from agent findings (`skills/chart-issues/SKILL.md:31`), mechanism claims need file:line (`:47`), matches act only on operator confirmation (`:69`), and one owner carries many identities with partial matches left open (`skills/chart-issues/assets/shapes.md:244-246`). The lock holds without new text.
- My rebuttal points D1 and D2 (is #128 a full or partial match) no longer need a rule. The operator confirms each match under `:69`, so that call is made per case.
- My rebuttal point D3 (cap evasion by moving workflow into `shapes.md`) is void. Nothing is added.

## Record edits needed

- R1. The discovery-role lock carries a done-criterion for the door: "symptoms that do not share one cause (door reassesses, never copies)" (`forks/discovery-role.md`, Taken, Binding). With chart-issues unchanged, no leaf edits the door, so this criterion has no owner. It should be recorded as dropped, or kept as a behavior check run against the unchanged skill (replay the #124 to #128 seeds and confirm the door does not put them under one owner on #128's word). Left as it is, the handoff audit will find a criterion no leaf can meet.
- R2. `INTAKE.md:4` states the scope as "chart-issues verifies and groups at import". That still describes behavior, but a leaf author will read it as work on chart-issues. The scope line should say the door side is existing behavior and out of the leaf.

## Gap the existing rules cover late, not at open

- G1. A door opened with a note about one symptom ("fix #124") imports only that seed (`skills/chart-issues/SKILL.md:31`). The linked root report #128 is not read at open. The `:69` comparison does catch it, because it compares every destination seed against the scoped work, in either link direction. But `:69` runs "at destination selection and again right before the handoff review". By then the forks may already be shaped around the symptom, and the operator learns of the root report late. This is rework, not a wrong result, since handoff cannot pass without the comparison. I do not ask for a rule. I ask that it be listed with the accepted cost, in these terms: related seeds surface at the `:69` checkpoints, not at open.

Nothing else is left uncovered. The new Suspected cause and Related lines reach the door inside the verbatim seed body (`src/pull.ts:67`), and the closed-report and cross-repo cases were already assigned to existing behavior in the related-search lock.
