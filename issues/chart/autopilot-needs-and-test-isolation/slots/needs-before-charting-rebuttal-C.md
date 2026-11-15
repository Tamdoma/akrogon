# Rebuttal: needs-before-charting, slot C

Mostly agreement. The merge adopted park+notify with `akrogon notice --attention`, once per park, notice path on the `wait:` line, stated outside-hc limit, and "the notice reports a blocker, not a new ask" — which correctly keeps the operator's cutoff intact since a `wait:` line is already what asks. Disagreements and gaps in A's proposed final shape:

1. **Criterion (2) is internally inconsistent on the close.** The shape says "closes stay the door's own step", but #129's fourth parked chart (workers-bindings-go-live #540) parked exactly on an operator yes to `akrogon close` — an operator-only close approval, which the Autopilot wait list names "an operator approval that is not a grant". Treating all closes as the door's own step deletes that approval class from the sheet and re-creates the reported park. Fix: the sheet carries *closes needing an operator decision* (not delivered-identity closes the door runs itself). Criterion (2)'s parenthetical "(or, for the close, the door's own step)" only works if it reads as door-run closes, not the approval-gated kind.
   Evidence: intake #129 reproduction item 4; SKILL.md `## Autopilot` wait list ("an operator approval that is not a grant"); better-than-training, read 2026-11-09.

2. **Sheet scope per session vs per chart is unstated.** The signposts round runs once per door session across all its charts; the moved sheet is per-chart in Take's text today. The shape must say whether the session's one sheet covers every handed chart (my read of "asks the operator before charting" — yes), and what happens for a chart handed mid-session or created by handover (the operator's changed-list yes adds a chart after signposts). An implementer otherwise guesses per-chart sheets mid-session — re-introducing post-cutoff asks.
   Evidence: SKILL.md `## Open` ("the signposts round ... runs once per door session"), `## Autopilot` changed-list handover path; better-than-training, read 2026-11-09.

3. **A pending row never re-asks — stated, good — but the shape should also name where pending rows live.** A sheet row pending at pass end needs a recorded home (the `wait:` line exists for misses; a foreseen-but-unsupplied row isn't a "miss"). Suggest: pending rows join the same `wait:` record with the sheet as their provenance, so `## Autopilot`'s waits list stays complete and the pass-end summary covers both kinds. Minor — a reader could infer it — but a leaf design naming it explicitly prevents two parallel wait records.
   Evidence: assets/shapes.md `## Autopilot` wait line + `## Open` pending-state semantics; better-than-training, read 2026-11-09.

4. **Q3's scenario list should add "chart handed mid-session / changed-list chart"** to force point 2's answer into a stated outcome rather than an edge an implementer invents.

Everything else holds: scenario-walk + semantic review judgment (no exact-phrase checks) is right for skill text; the stale-sentence sweep is retained; one real `akrogon notice --attention` at the registered root proves publication, which is all a charting proof can show.
