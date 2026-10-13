# Brief for slot C: no-line round (blind, write before reading other slots)

Write to slots/noline-C.md (akrogon issues/chart/permit-bypass). Under 60 lines, cite file:line or source per claim.

## Operator decisions, verbatim, 2026-10-13
1. "I don't want the line to even be there, but we need to optimize everything else, too. I just don't want the PC to blow up, but we need to make sure there's no clogging and everything's going fast, and the tests don't take up so much time."
2. "everythign else you had given me still stands, if it stands. challenge me on everything, just take my intent into account."

Recorded: forks/guarantee.md Taken (permit removed, akrogon.slice 16 cores/64G high/96G max/no swap is the only host limit). CHART.md reshaped. Framework test cost split to /home/ivan/Work/infra/tamdoma/framework/issues/chart/test-cost/.

## Your job
1. Challenge decision 1 against its intent (PC safe, no clog, fast, short tests). Where does no-line hurt that intent? Use real numbers: one verify:core = 15.9 GB, 409 Chrome, ~8.3 cores avg (host-test-load ceiling-values). max_active 20. Is there a no-queue mechanism that keeps the intent (e.g. per-run worker width scaled to load, memory-aware start, lane-level browser cap, dispatch WIP)? Say whether you would keep a line of any kind, and why.
2. Notes for forks/load-guard.md, forks/dispatch-wip.md, and test-cost forks subset-speed and always-floor: options, pick, what each breaks later, pitfalls.
3. Which fork should the operator answer next, and why (most reshaping first).
4. Anything in the earlier leverage list (slots/system-merged.md) that no longer stands after no-line.
