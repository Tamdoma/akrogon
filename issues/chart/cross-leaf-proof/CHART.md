# Chart: akrogon cheapest sufficient proof

## Destination
akrogon's charting, standing design, planning and review guidance prove each property with the cheapest sufficient test in the leaf that owns it, so a multi-leaf pipeline epic finds cross-leaf defects near their cause with fewer reruns. No check removed. No `src/` change. At most 20 added lines in the whole diff, one line per rule where possible (operator 2026-09-29: "yes, cap it at 20 lines").

## Territory map
Merged from slots/map-A.md, map-B.md, map-C.md (slots/map-merged.md, corrections in slots/proof-selection-merged.md).
- M1 (A,B,C) live-replay's own locks multiplied each defect: design.md:48 "Fixing any defect the run finds. The run fails, and the owning leaf reopens." and design.md:119 "no source edit after". Each defect cost a new leaf lifecycle plus a from-scratch rerun.
- M2 (B,C) A spine existed (fixture-network brief.md:4) but no later leaf was required to swap its step to real; `per-site-content-weave` and `recorded-build` are still `recorded` (run-fixture-network.ts:648,653) and content prep/batch/verify are absent.
- M3 (A,B,C) Rehearsals that continued with stand-ins found several defects per pass (report.md:707-722). The history mixes harness defects, product defects and rehearsals (B).
- M4 (A,C) #13/#15/#17 (CSS), #16 (pigeonhole) and #10-#12/#14 (writer/checker drift) were catchable in the leaf that caused them without a live run.
- M5 (A,B,C) No akrogon skill ties a test to its cost or places integration proof.

## Forks taken
- [proof-selection](forks/proof-selection.md): 1a cheapest sufficient test rule in standing design, chart, plan and review; 2a no time budget, record wall time of slow commands
- [spine-growth](forks/spine-growth.md): 1a stage table and swap-in criterion checked at handoff; 2a applies to producer-consumer chains; 3a scripts real, model/outside recorded-from-real, re-record on change; 4c ponytail unchanged
- [proof-leaf-policy](forks/proof-leaf-policy.md): 1a in-branch fixes bounded by locked decisions, design change ends pass failed; 2a rerun changed stages and consumers; 3a collect all checkable failures; 4a final proof valid at final commit
- [review-rules](forks/review-rules.md): 1a one rule shared by writer and checker, second copy needs reason and agreement test; 2a size-dependent checks state their need and test at real size

## Open forks

## Fog

## Off route
- Fixing framework live-replay, #16 or #17: framework work already underway.
- New phases or `src/routing.ts` changes: the lifecycle already carries this; skills guide agents.
- Removing or loosening any check.
- Writes under `issues/` from a leaf.

Handed off 2026-09-29
