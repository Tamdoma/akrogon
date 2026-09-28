# Intake: chart-peer-panes

Provenance: Tamdoma/akrogon#34, imported 2026-09-28 from issues/seeds/34-chart-issues-consultant-panes-b-and-c.md. Verbatim below.

## chart-issues: consultant panes B and C should open as a right-side stack beside slot A

Source: Tamdoma/akrogon#34
URL: https://github.com/Tamdoma/akrogon/issues/34

Unverified intake.

### Observation
When the chart-issues consultant panes for slots B and C are set up in herdr, they don't come out in a consistent layout. The operator had to rearrange them by hand: slot A (the main charting pane) on the left, and B and C stacked on the right. Herdr's `pane move` refuses to move a pane within its own tab (`changed: false`, `reason: same_tab`). Getting this layout by hand meant moving the pane to a new tab and then back with `--split down --target-pane <right pane> --ratio 0.5`.

Right now `skills/chart-issues/SKILL.md` (Open) and `skills/chart-issues/assets/questions.md` expect the operator to supply the B and C panes. Nothing in the skill creates or places them.

### Location
akrogon `chart-issues` skill (`skills/chart-issues/`), the herdr pane layout of consultant slots B and C when a chart opens.

### Reproduction
1. Open a chart with chart-issues in herdr using consultant panes B and C.
2. The panes are not arranged as the layout below. They have to be rearranged by hand.

Frequency: every chart session that uses B and C.

### Expected behavior
When the consultant slots B and C are created, the tab uses this layout:
- Slot A: left half, 50% width and 100% height.
- Slot B: right half, top, 50% height.
- Slot C: right half, bottom, 50% height.

With only B, it presumably takes the whole right half (Not provided).

### Urgency
Low. It's a layout annoyance on every chart session. Workaround: move the pane to a new tab (`herdr pane move <pane> --new-tab --no-focus`), then back (`herdr pane move <pane> --tab <tab> --split down --target-pane <right pane> --ratio 0.5 --no-focus`).

## Agent findings

See ../failed-leaf-routing/slots/map-merged.md (#34 half) and its rebuttals.
