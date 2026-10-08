# Layout scope merged notes
- Pick (A,B): local repair only when recorded A is absent and recorded B survives: split B right, swap new A with B by explicit IDs; keep B's pane and session; leave other panes and present A/B as they are. Rejected (A,B): enforce on every allocation, split left; (B) relabel B as A, recreate the tab.
- Bootstrap and B-only replacement already put A left of B; no change (B, src/next.ts:416-431).
- Evidence: src/next.ts:410-435; tests/next.test.ts:1856-1888; fake-herdr has no geometry or swap (:123,:136,:202) (A,B); herdr pane layout exposes rect.x (B read-only, A live probe). Live probe: /home/ivan/Work/infra/akrogon/issues/chart/seat-a-left/forks/layout-scope-probe.md.
- New from A's probe: pane swap moves the operator's focus to the leaf tab and workspace (no --no-focus); restore with tab focus <previous> proven.
- Pitfalls:
  - Fake must model parent-relative order and swap; assert A.rect.x + width <= B.rect.x, not a command string (A,B).
  - Failed or lost-ack swap (B question). A's proposal: after split, swap, then read layout; on any swap or verify failure close the new A pane and propagate the error before any pane ID is saved, so the next pass starts from "A absent" again: no orphan pane, no duplicate, and no double-swap reversal. No blind retry helper on swap (B, src/shell.ts:54).
  - Focus: read the focused tab before swap and tab focus it after, also on failure (A).
- Differ: none on the pick. For B to check: the failure sequence and focus restore above.
