# Territory map B: round-drawings

Small written-rule change in akrogon. The signposts already settle broad eligibility beyond UI panels, no new command checks, no migration and no dependency on the herdr-app move. Do not reopen those choices.

## Inspected ground

- F1: `skills/chart-issues/assets/questions.md`, “Operator questions and peer exchange”, defines the complete round and a lighter signposts exception. It has no drawing guidance. Its existing pre-send read already checks the round, so another checking mechanism is unnecessary.
- F2: `issues/chart/herdr-panels/INTAKE.md`, “Round 3”, records the operator requesting drawings under each question's options and preserving every required part. The original round omitted Research, How to choose, Pitfalls avoided and Challenge check. This is evidence for keeping drawings additive.
- F3: `skills/chart-issues/SKILL.md`, “Shared context” and “Autopilot”, already require printed rounds and the full round before A's own pick. `docs/use/plan-work.md`, “Answer one fork per round”, describes that shared exchange. No separate autopilot visual mechanism is needed.

## Material forks

- Q1: **When must a question show drawings?** **1a (recommended):** whenever visible differences become substantially easier to choose with a small ASCII comparison, decided before presenting the round. **1b:** every question with visible differences. 1a respects both the operator's usefulness threshold and the whole-family lock, but leaves judgment to A. 1b reduces discretion but invites decorative diagrams and longer rounds. Pure policy or wording choices can remain text-only.
- Q2: **How constrained is the comparison layout?** **2a (recommended):** draw every option directly after that question's option list, using the existing option labels, with side-by-side or stacked drawings as space permits. **2b:** require side-by-side drawings. 2a preserves readable comparisons in narrow panes but allows variable presentation. 2b resembles the recorded example but invites wrapping and misleading alignment. Neither option permits moving drawings to a later reply or replacing explanatory text.
- Q3: **Does the light signposts round inherit useful drawings?** **3a (recommended):** apply the same usefulness rule while retaining its existing lighter parts. **3b:** reserve drawings for ordinary fork rounds. 3a covers visible cross-chart choices without adding another rule family. 3b is simpler to describe but leaves that class needing a second exchange.

## Practitioner questions and pitfalls

- P1: Can the operator match every drawing to its option without decoding new notation? Reuse option labels and depict the same scenario across alternatives.
- P2: Does the drawing reveal the actual difference, including a transition when the choice concerns flow? A static box that hides the deciding behavior does not meet Q1's usefulness threshold.
- P3: Can adding pictures drop required parts again? Preserve the existing round requirements, including the conditional How to choose line and the signposts exception, and use the existing pre-send read. No tests of exact Markdown shape.

## Proposed split

One leaf in akrogon for the written round guidance, centered on `questions.md`. Keep that file authoritative. No separate renderer, example library, tooling leaf or duplicated policy in Autopilot. The user guide needs at most a short pointer if the settled behavior requires explanation there.
