# Pane record

## Question

Q1. How should `allocate` (src/next.ts) stop an interrupted seat allocation from leaving an unrecorded pane in the leaf tab (#116)? Candidates from the maps: (a) save each pane id to state right after it is created (A after split, before `box`), so a later pass finds it and the existing entry sweep closes a recorded pane outside its scope (C); (b) on bootstrap reuse an existing unrecorded tab member as B instead of splitting (A; B flags that it could adopt an operator's hand-split pane); (c) reconcile the tab's unrecorded members before splitting, with an ownership rule (B).

### Carries

- src/next.ts allocate comment: "Boxed before any save records it, so a later throw never leaves an unboxed recorded pane." allocate's entry closes recorded panes found outside their scope.
- docs/guide/next.md: panes split by hand in a leaf tab are not boxed (operator panes can exist).

## Findings

Maps: [A](../slots/map-A.md) (G3), [B](../slots/map-B.md) (C6), [C](../slots/map-C.md) (G4). Fork notes: [A](../slots/pane-record-A.md), [B](../slots/pane-record-B.md), [C](../slots/pane-record-C.md); [merged](../slots/pane-record-merged.md); rebuttals [B](../slots/pane-record-rebuttal-B.md), [C](../slots/pane-record-rebuttal-C.md).

- All three slots pick (a) (A,B,C). C withdrew "no consumer assumes recorded implies boxed": broadcastPass prompts a live recorded B through dispatchSlot with no scope check (A,B,C).
- Residual gap, wording from B and C rebuttals: herdr creates the pane but its id is never durably saved (process killed during the split call, lost response, or failed saveState). No in-process ordering closes it; (b) and (c) cannot tell such a pane from an operator's (A,B,C).
- Tests: existing outside-pane, recorded-authoritative and interrupted-tab tests pass (B ran 6); none fails a box after a successful B split (B).
- Proofs: none. The leaf adds no external operation; it reorders existing herdr calls and state saves, proven with the repo's fake herdr in tests.

## Taken

A's pick (autopilot, 2026-10-22): (a).

Binding decisions:
1. allocate saves each seat pane id to state as soon as it has it, before boxing that pane. A after `first` is resolved, B after `second` is resolved; the B save carries A and can replace the final save.
2. No save drops a live recorded seat: the repair path saves `{A: first, B: recordedB}`.
3. broadcastPass loses its live-B shortcut; every pending broadcast obtains its state through allocate (today's dead-B path), so dispatchSlot is reached only after allocation boxed both seats.
4. The comment "Boxed before any save records it" is replaced by the new invariant: a recorded pane may be unboxed only until the entry sweep or the box step runs; dispatch follows successful boxing.
5. Stated limit: a pane herdr creates whose id is never durably saved (kill during the split call, lost response, failed saveState) stays unrecorded; operators close it by hand. No ownership marker is built.

Reason: recording at creation removes the orphan class on every allocate path (bootstrap, repair-A, missing-B) and relies on existing recovery (entry sweep closes a recorded outside pane), moving saves rather than adding a mechanism. Deleting the broadcast shortcut removes code and the one consumer of the old ordering.

Rejected: (b) bootstrap-only, adopts operator hand-split panes, picks by position. (c) needs a new ownership marker and /proc probe for a millisecond window. (d) catch/finally close misses process death and can mask the error. (e) rebuild tab destroys operator panes. Clearing stale ids on sweep close (C Q1): not needed, consumers re-resolve against live panes.

Standing dissent: none.
