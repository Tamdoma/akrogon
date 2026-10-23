# Pane record, merged notes

## Options
- (a) Record each pane id in state when allocate has it, before `box`; the entry sweep closes a recorded pane outside its scope (A,B,C). Covers bootstrap, repair-A and missing-B paths. Cost: drops the "boxed before any save" comment invariant; residual orphan only if the process dies between herdr creating the pane and saveState (A,B,C).
  - Save rule: never drop a live recorded seat. Repair path saves `{A: first, B: recordedB}`; the B save carries the new A (B,C). The B save can replace today's final save (C).
- (b) Bootstrap reuses an unrecorded member as B: rejected. Bootstrap-only, adopts operator hand-split panes (same tab, cwd, idle), picks by position (A,B,C).
- (c) Reconcile unrecorded members with an ownership rule: rejected. No observable rule separates orphan from operator pane; a marker env plus /proc environ probe is new machinery for a millisecond window (A,B,C).
- (d) Close the fresh pane in catch/finally: rejected. Misses process death, can mask the original error (A,B,C).
- (e) Rebuild the tab wholesale: rejected, destroys operator panes (C).

## Evidence
- src/next.ts allocate at 92dddada: tab saved, split, box(first), box(second), then pane save (A,B,C).
- src/next.ts broadcastPass skips allocate when recorded B is live and calls dispatchSlot, which prompts without a scope check (A,B).
- Other readers (log.ts, reconcile broadcastInProgress, observeBusy, ownsPane, merged hook, stop) read ids or act on the slice only (A,B,C).
- Existing tests: outside-pane recreate, recorded seats authoritative, interrupted tab with operator pane preserved; 6 pass (B ran them). None covers a failure after a successful B split (B).

## Pitfalls and removal
- Broadcast prompting an unboxed early-recorded B: remove broadcastPass's live-B shortcut so every broadcast goes through allocate, an existing path today when B is dead (B); A had left the route to the plan.
- Repair path stranding a live recorded B: pair save rule above (B,C).
- Residual split-return-to-save window: stated limit, documented manual close (B,C); no ownership mechanism (A,B,C).

## Open questions
- Absolute interruption guarantee vs bounded one (B Q2, C Q2). A: bounded; the window is one herdr round trip.
- Clear stale ids when the sweep closes a pane (C Q1): optional.
- Split lands in the source pane's tab (C Q3): existing code already assumes it.

## Where slots differ
- C holds that no consumer assumes recorded implies boxed; A and B name broadcastPass as that consumer.
