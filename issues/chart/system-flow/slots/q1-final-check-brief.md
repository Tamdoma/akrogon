# Brief: focused final-shape check (Q1) and B re-review

Operator answer to Q1, verbatim: "I don't want them mixed up, but are you thinking about going jumping to the next chart as soon as the first one is handed off? Because I want the charts to be handed off one by one so we can start working while we are charting the other chart." Then: "1 ok" to this shape: one chart at a time; a settled chart hands off at once; the door then goes to the next chart itself, the waiting-longest first unless the operator names one. Mixed batching across charts is dropped.

Change, akrogon commit d063067 in `/home/ivan/.claude/jobs/6a0d8d81/tmp/wt-akro-2a` (on top of 23abf2f):
- `skills/chart-issues/SKILL.md:47`: "When every chart still holds an open fork, stop the seed drain for the operator to select one;" becomes "Rounds work one chart at a time and never mix charts: when the current chart hands off, closes or is held, the door moves on without asking for a selection to the chart the operator names, else the open chart that has waited longest, else the next seed;". The rest of the line (settled charts hand off without waiting; all-taken charts hand off in order) is unchanged.
- `skills/chart-issues/SKILL.md:131` footer: drops "chart selection" from the awaiting list.
- `docs/guide/phases.md:104` (B's F1 on 23abf2f): "required live runs" becomes "new or widened live runs".

All seats: does the new :47 sentence match the operator's shape, conflict with any other line in `skills/chart-issues/SKILL.md` or its `assets/` (shapes.md, questions.md: "A round takes one fork", the drain and handoff text), or leave a case where the door could stall or mix charts? Disagreements only, with path:line. Under 20 lines. If none, one line saying so.

B only: also re-review the guide fix against your F1 and end with `Verdict: ready` or `Verdict: fix` for 23abf2f..d063067.

Return path by seat:
- B: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/q1-final-check-B.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/q1-final-check-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/q1-final-check-E.md`
