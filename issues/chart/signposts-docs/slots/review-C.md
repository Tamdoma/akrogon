# Review C: signposts-docs, rebuttal and leaf review

Disagreements only. Read: slots/map-merged.md, forks/docs-scope.md "Taken", the draft ISSUE.md, brief.md, design.md, readiness.yaml, state.yaml; checked against docs/reference/where-things-go.md "One home per fact", forks/signposts.md "Taken", SKILL.md "Drain" and "Autopilot", docs/reference/limits.md "What Akrogon does not do" and "What stays your job", docs/start/why-it-works.md "A contract comes before code", docs/pictures/ways-to-run.svg (rect and text elements).

## Merged map

None. Every merged line matches the sources I inspected.

## Picks against a signpost or a docs rule

- R1 Pick 4 and brief done-criterion 4 restate the mode rule on four pages (words.md "Chart door" and "Fork", limits.md two bullets, why-it-works.md "A contract comes before code", what-it-is.md "The words" Chart entry): "say who answers forks per mode, and that approvals stay the operator's in every mode". where-things-go.md "One home per fact": "Other pages link to that page instead of repeating the fact." The mode rule's home is autopilot.md "Switch it on" (and plan-work.md "Set the signposts" repeats it already, pre-existing). As worded, criterion 4 produces six copies of the three-mode sentence, which is the pitfall the merged map itself lists. Fix in the criterion: those pages stop claiming the operator answers every fork and link [Autopilot](../use/autopilot.md) for who answers per mode; only the approvals-stay-yours clause is stated locally where the bullet is about approvals (limits.md "What stays your job", "Choose the work"). Same outcome, no copies.

## Implementer review (forces a guess or cannot be met)

- R2 Criterion 5, ways-to-run.svg: the autopilot box is `rect x=360 width=240`, the label is one 14px `.muted` text centered at x=480. A mode-aware label ("you set signposts, A answers forks" or similar, about 33 to 37 characters) runs about 230 to 260px at 14px, at or past the 240px box. Design "Owned surfaces" allows "label text only; no layout or coordinate change beyond what a longer label needs inside its existing box", which does not say whether a second `<text>` line (new element, new y) inside the 60px-high box counts as allowed. Fix: criterion 5 names a length bound (one line, at most about 30 characters, for example "you set signposts, A picks") or allows a second text line inside the box. Without one the implementer guesses.
- R3 Criterion 3, "the next chart follows the signposts order": SKILL.md "Drain" is "the chart the operator names, else the first chart not waiting in the session's signposts order, else a chart whose wait has cleared", and "Autopilot" moves to the next runnable handed chart. A literal reading of the criterion lets a page say the order is fixed, which is wrong when the first chart in that order is waiting. Fix: "the next chart not waiting, in the signposts order". Low weight, wording only.

None else. ISSUE.md, readiness.yaml (empty like the two prior docs leaves) and state.yaml are fine; `$AKROGON_BASE` in criterion 6 is a settings value the lifecycle skills already use.
