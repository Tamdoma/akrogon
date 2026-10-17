# Merged opening map (A, B, C)

Sources: map-A.md, map-B.md, map-C.md, written blind 2026-10-17.

## Agreed facts
- akrogon calls no model API. Only network fetch is the Discord webhook (A,C). Code decisions are exact rules: flaky red-then-green, verdict aggregation, turn eligibility, delivery checks (A,B,C).
- Every fuzzy decision sits inside an agent turn that also writes reasons, findings, notices or code. Jev removes a sub-judgment, not a turn (A,B,C).
- Jev returns labels and probabilities, no text. Fork files, Fix findings and the autopilot morning record require reasons (C; A,B agree in substance).
- Volume is small: ~29 transitions, ~5 merges, ~0.5 failures per day; watch max 72 ticks per day (C). Jev's token cost at this volume would be cents per day (C); current harness cost per judgment is unmeasured, and with flat-rate seats tokens saved need not cut the bill (B rebuttal F1).
- Vendor: early access; jev-1.14.0 shipped 2026-10-14 while jev-latest still points to 1.13.0 (B,C); vendor documents weak counting, dates, multi-hop, injection (B,C); calibration does not transfer to new data (inovex; A,B,C).

## Candidates and verdicts
- Direct vs lifecycle: four of five refusals are mechanical over the draft, one is door judgment; operator chooses the route; not a classifier job (A,B,C). A small draft-file check could remove door re-reading (C only).
- Autopilot vs attended: operator-only switch per autopilot boundary lock; a classifier either breaks the lock or advises an operator already present; not a classifier job (A,B,C).
- watch-issues failed-leaf class: best text-to-label fit, but a structured failure cause at the write site removes it exactly (C); same idea as "structured failure facts" (B).
- watch-issues busy-loop: code beats Jev for exact repeat, error and undo counts (B,C); whether work serves the brief or a tool is hung stays agent judgment, and a counting helper does not remove the watch turn (B rebuttal F2); savings unmeasured; low value (A).
- Seed duplicate matching: fit in form, but untrusted input, false duplicate suppresses a report, low volume (A,B,C). B names it the least disruptive measurement candidate.
- Review verdict, Fix vs Nit, lesson sort, merge red cause: need running code and reasons; no fit (A,B,C).

## Pitfalls with removal
- New key, network and vendor failure domain in an offline CLI: removed by not integrating (A,B,C).
- API-down behavior has no free option: block, fall back (two paths forever) or default label (C, B R1).
- Two copies of each rule (skill prose and classifier criteria) drift (C), matching the 2026-09-11 stale-rule lesson.
- Threshold rot on version change, run-to-run variance flips boundary cases (B R3, C R3).
- Confidence becomes accidental authority (B R1).
- Data leaving the machine from consumer repos (C F5).

## Recommendation
Do nothing; no key, no leaf (A,B,C). Optional: one discarded offline measurement on recorded cases before any charting (B,C). C adds two plain-code moves to revisit later (structured failure cause, hash counting in log-tail.ts); B frames them as separately scoped.

## Differences
- Measurement target: seed duplicates (B) vs failure reasons and seed duplicates against two or three APIs (C) vs past route choices (A).
- Whether the plain-code moves belong to this chart: C offers them, B calls them separate scope, A did not raise them.
