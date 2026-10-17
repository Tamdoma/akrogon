# Adopt a classifier

## Question
Q1 Should akrogon use Jev (or a similar decision API) anywhere now: do nothing, run one discarded offline measurement first, or integrate?
Q2 Should the two plain-code moves found during mapping (a structured failure cause written by seats, and repeat counting in watch-issues log-tail.ts) be charted now, or recorded as not now?

### Carries
- Intake: INTAKE.md, operator 2026-10-17: remove rather than add, no loss of quality or speed, "pretty happy where we are".
- Autopilot locks: issues/chart/autopilot/forks/boundary.md (switch is operator-only), loopholes.md (no direct route in autopilot), CHART.md Off route (no new timers, daemons or polling).

## Findings
Opening maps: slots/map-A.md, map-B.md, map-C.md. Merged: slots/map-merged.md.
Rebuttals: slots/adopt-rebuttal-B.md (F1 cost claim qualified, F2 busy-loop scope limited; both applied to map-merged.md), slots/adopt-rebuttal-C.md (no disagreement).

- operator · INTAKE.md 2026-10-17 · remove rather than add; current state satisfactory (A,B,C).
- better-than-training · repo at f7baddc, read 2026-10-17 · no model API call in src or skill scripts; fuzzy decisions sit inside agent turns that also produce reasons (A,B,C); issues/log.jsonl volumes (C).
- better-than-training · docs.typesafe.ai primitives, models, model-jaggedness/jev-1.13; typesafe.ai launch post; read 2026-10-17 · labels and probabilities only, $0.042/M input, 70-500 ms, early access, jev-1.14.0 on 2026-10-14 with jev-latest still 1.13.0, weak counting, multi-hop and adversarial input (A,B,C).
- practitioner · inovex (Werner, Herreros Alonso), 2026-09-29 · prepare decisions, not make them; related answers contradict; calibrate on own data (A,B,C).
- practitioner · Fabio Akita benchmark, 2026-10-10 · rules stay in code, the model turns free text into fact; Microsoft Decision-1 ties Jev at a third of the price (A,B,C).
- All slots: do nothing now. Measurement optional (B,C). Code moves separate and unmeasured (B,C).

## Taken
- 2026-10-17 operator, verbatim: "1a | 2 - seed them as issues"
- Q1 1a: no Jev or other decision API in akrogon now. Reason: every fuzzy decision sits inside an agent turn that must run anyway and write reasons; volume is small; adding it brings a key, network, vendor and a second copy of each rule while removing nothing. Foreclosed: 1b offline measurement, 1c integration. Revisit when a decision moves into akrogon's own code at real volume, or a labelled set of past decisions with outcomes exists.
- Q2 free text: both plain-code ideas seeded as GitHub intake, not charted here: Tamdoma/akrogon#96 (structured failure class), Tamdoma/akrogon#97 (loop counts in log-tail.ts). Foreclosed: charting them in this chart.
