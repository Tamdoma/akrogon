# Map A: round-drawings (#125), written before reading B and C

## Surface

- `skills/chart-issues/assets/questions.md` "Operator questions and peer exchange": the round template lists text parts only; "a concrete example where needed" is the nearest rule; the register rules ("each part saying only what the decision needs") apply to every part. No mention of drawings anywhere in skills/chart-issues or docs/use (grep "drawing|ascii|diagram": none).
- `docs/use/plan-work.md` "Answer one fork per round": "Each round brings one fork with its options, a recommendation and its reason, and the research behind it." One sentence could name the drawing.
- `SKILL.md` "Shared context": rounds go in printed chat text, never a question tool, so a drawing is a fenced text block in the chat.

## Forks

F1. When a question gets drawings.
- a (recommended) When its options differ in something a person sees or follows (a screen or panel, a layout, a state change, a flow or sequence, a file or tree shape) and a drawing makes the choice much easier; otherwise none. Signpost 4a: the family, not only UI panels; operator rule: "only where they make the operator's decision much easier".
- b UI options only. Narrower than the operator's rule.

F2. Where and how.
- a (recommended) Directly under that question's options, one small fenced text drawing per option, labelled with the option code (1a, 1b), side by side when they fit the chat width, stacked otherwise; every required round part stays and the drawing replaces none. The operator asked for exactly this placement.
- b A separate drawings section after the round. Rejected: the operator moved them under the options.

F3. Autopilot and the signposts round.
- a (recommended) Same rule everywhere: A writes the round the same way whoever answers it, and the signposts light round may carry a drawing under the same test. One rule, no mode switch.
- b Skip drawings when A answers itself. Saves a few lines, adds a mode branch.

## Pitfalls

- Drawings become decoration: the "much easier" test plus the read-against-rules check A already runs before sending a round.
- Wide side-by-side drawings wrap in a narrow pane: stack when they do not fit.
- Docs drift: one sentence in plan-work.md.

## Split

One akrogon text leaf: `skills/chart-issues/assets/questions.md` (template and rule) and `docs/use/plan-work.md` (one sentence).
