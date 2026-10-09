# Design: seat-a-replacement

## Binding decisions, verbatim

### Layout scope (issues/chart/seat-a-left/forks/layout-scope.md)
Operator 2026-10-08: `1a | 2a |`
- 1a: local repair only: when recorded A is absent and recorded B survives, split B right, save the new A pane ID at once, then `herdr pane swap --source-pane <B> --target-pane <new A>` with no retry helper. On swap error, keep the recorded A ID, report the error and do not retry or close; its position may be right if the swap was unapplied or left if only the reply was lost (B final check). No duplicate, no reversal. Other allocation paths (bootstrap, B-only replacement, present seats) unchanged. Fake herdr models parent-relative left/right geometry and swap; tests assert positions. Foreclosed: 1b enforce A-left on every pass.
- 2a: before the swap read the operator's focused tab; after the swap, also on failure, `herdr tab focus <prev>` when it differs from the leaf tab. Costs carried into the contract: an operator switching tabs during the ~0.1 s window is sent back once; an operator already in the leaf tab with an extra (non-seat) pane focused ends with B focused, because herdr pane focus is direction-only and cannot restore a pane by ID (B final check, confirmed at handoff review). Foreclosed: 2b accept the focus jump.
- Handoff review 2026-10-08: operator `1a` approved the handoff with the extra-pane focus cost written into the contract.
Exclusions: none; this is the only leaf of the chart.

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: no auth, secrets or chains. The real herdr calls (split, swap, layout, tab list, tab focus) were proven live at charting (issues/chart/seat-a-left/forks/layout-scope-probe.md); leaf tests use the fake herdr at the `akrogon next` CLI boundary. The fake gains the minimum parent-relative geometry for `right` splits, `pane swap` by explicit IDs, `pane layout` rects, a focused tab, and `tab focus`; tests assert resulting positions and focus, never only the command strings. The bug fix shows the replacement test failing before (A right of B) and passing after. No live run is required.

## Leaf architecture
- Owned: src/next.ts `allocate` (the `recordedA` absent / `recordedB` present branch, ~src/next.ts:417-433), tests/next.test.ts allocation cases (~1851-1900), tests/fake-herdr.ts geometry, swap, layout and tab focus support.
- Sequence: read focused tab (herdr tab list `.focused`); split B right with the existing placement flags; save the new A pane ID in state.yaml; `herdr pane swap --source-pane <B> --target-pane <new A>` via a single call, not the retry helper (src/shell.ts:54); `herdr tab focus <prev>` when prev differs from the leaf tab, also after a swap error; then the existing final save.
- Excluded: bootstrap, B-only replacement and present-seat paths; chart peer pane layout (#34); any normalisation of operator-arranged panes.
