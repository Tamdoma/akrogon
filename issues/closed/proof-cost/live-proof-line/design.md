# Design: live-proof-line

## Binding decisions, verbatim

### proof-run (issues/chart/proof-cost/forks/proof-run.md)
Operator 2026-10-10, verbatim: "1a | 2a"
Binding decisions:
- Q1 1a: the handoff review shows one line per leaf with live-run proof: session count, how many run at once (rounds counted), an estimated elapsed time, and the worst case if sessions hit their timeout, labelled estimate; a recorded measured case replaces the timeout basis; "unknown" with a reason when no basis exists. Information only: never times out a leaf, never waives a criterion; the operator approves or narrows scope. (A,B,C; rounds per B)
- Q2 2a: a live-run done-criterion requires its sessions to run side by side, each with its own working root and log, unless the brief names the shared resource that forces serial. A seat that finds an unnamed shared resource cannot meet the criterion as written and ends the pass `failed` with the reason (existing red-criterion 2a exit, leaf-run-stalls). More sessions at the same width proceed. The count stays in the review line, never in the criterion (audit test-count rule). (A,C)
Foreclosed: 1b close #75 with no rule; 1c minute numbers in plan only; 2b disclosure only (B); any enforced budget, timer or numeric gate (locked).

Off route (not this leaf): enforced budgets (leaf-run-stalls lock); framework SESSION_TIMEOUT_MS (consumer repo, its own seed); the untraced `notified=` gap; the live framework leaf formspark-build-wiring.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

This leaf edits that file. Interpretation for the leaf itself: it changes text only, so no test is added. No vanity tests means no test asserting skill or guide wording; review checks the text. The existing blocking `checks` (including the docs-link and chart-shapes tests) must still pass after the edit.

## Leaf architecture
- Owned: skills/chart-issues/SKILL.md `## Handoff` (one sentence beside the chart-usage line), skills/chart-issues/assets/shapes.md `## Preflight and validation` audit paragraph, skills/chart-issues/assets/standing-design.md slow or live-run lines, docs/guide/chart.md handoff review paragraph.
- The installed skill path /home/ivan/.claude/skills/chart-issues links to the repo's skills/chart-issues, so the repo edit is the installed text after deploy.
- Exclusions: no command code, no new script, no state or readiness field, no number in any rule. leaf-run-stalls red-criterion exit is reused, not changed.
- Wording stays one rule per place: the review line lives in SKILL.md, the side-by-side rule in standing-design.md, the audit refusal in shapes.md; the guide describes, it does not restate the rules.
