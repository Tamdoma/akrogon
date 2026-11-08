# Brief: option-drawings

## What

Add the drawing rule to the chart door's round shape. Text only, in `skills/chart-issues/assets/questions.md` ("Operator questions and peer exchange") and `docs/use/plan-work.md` ("Answer one fork per round").

## Why

Tamdoma/akrogon#125: in herdr-panels round 3 (2026-11-03) the operator asked for an ASCII drawing per option, placed under each question's options, and said it made the choices much easier. Today the round template is text only, so the operator has to ask and the door redraws the round, one extra exchange per round. The first drawn round also dropped required parts, and the drawings that decided picks were not kept in the fork files.

## Done-criteria

1. A reader of questions.md "Operator questions and peer exchange" learns that a question carries drawings when its options differ in something a person sees or follows (a screen, layout, state change, flow, file or tree shape) and a drawing makes the choice much easier, and none otherwise; that the drawings sit in one fenced text block directly after that question's option bullets and before How to choose, one per option captioned with its option code, side by side when both fit the door pane's width (about 60 columns) and stacked otherwise; that a drawing replaces no required round part; and that A's pre-send read covers it.
2. The round template in questions.md shows one such drawing block under question 1's options and still renders as one template block (the inner fence differs from the outer one) and fits 60 columns.
3. A reader of questions.md learns that the rule holds for autopilot rounds and that the signposts light round may carry drawings under the same test, and that a fork's Taken keeps the chosen option's drawing verbatim beside its avoidance mechanisms.
4. `docs/use/plan-work.md` "Answer one fork per round" says in one sentence that a question whose options look different comes with a small drawing of each when the drawings make the choice much easier.
5. `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists only the files named in What; `src/`, `tests/` and `issues/` are unchanged.
