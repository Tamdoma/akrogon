# Boundary final-shape check B

References below use revision `f7baddc`; S = `skills/chart-issues/SKILL.md`.

**F1. “What can still stop a chart” omits failed mandatory checks.** S1/S2 currently leave only physical inability and outside-account grants, while R2 says no hold list. Existing failures still block handoff: insufficient required proof (S:57), failed destination refresh (S:73), collisions/preflight (S:75; `assets/shapes.md:287`) and invalid emitted contracts (`assets/shapes.md:293`). These are not technical questions returned to the operator. **Fix:** say A decides and repairs autonomously, but cannot declare handoff complete until the existing checks pass. Preserve S:57's prohibition on narrowing merely to evade an unavailable required proof. R2's delegated narrowing applies where the process permits it, such as S:69.

**F2. Solo charting does not make solo direct execution eligible.** R3 correctly allows A alone, but R2's direct-route authority needs its eligibility qualifier. S:91-97 excludes direct when B is absent. **Fix:** A chooses among eligible routes; with no independent reviewer, lifecycle remains available. Also qualify R5's blind notes/merge/rebuttals as conditional on named peers, matching S:41,53,71. Do not invent consultants or simulate their checks to satisfy “every step.”

**F3. S2's unresolved authority question is too narrowly described.** Existing approval requirements also cover retaining proof fixtures (S:63) and the recorded, proven producer secret-save operation (S:65), which need not be a new live change to an outside account. **Fix:** include these in the same authority question, without introducing separate routine decision holds. Existing scoped approval remains usable; the shape must specify whether this delegation supplies any missing approval and what records its provenance. A label saying A approved is not itself evidence that the operator delegated that authority.

END boundary-final-check-B
