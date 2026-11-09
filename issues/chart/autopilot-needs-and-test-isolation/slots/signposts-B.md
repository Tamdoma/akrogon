# Signposts angles, slot B

These are candidate session decisions, not answers attributed to the operator. Recommendations apply the current full-autopilot instruction. Evidence inspected on 2026-11-09 is local source and the supplied intake. No tests or live-core operations were run.

## Evidence that changes the questions

- F1: #129's stated timing is already operator direction: ask needs before charting, with signposts the latest point. Do not ask whether late requests are acceptable as if the operator had left that open. The unresolved choice is what work to retain when that timing cannot be satisfied. Current `Take` puts the needs sheet after forks; `Autopilot` excludes approvals from the initial supply list and permits needs to park a chart later.
- F2: #131's reported call is already replaced in this checkout. `tests/hc-identity.test.ts:133` creates an `hcCore(f)` and calls `core.hc(['schema'])`, with cleanup. Git status shows no local modification to that file. Verify the current mechanism before proposing another fix. This observation does not prove that the test passes or that every spawn is isolated.
- F3: #130 crosses real boundaries: `tests/hc-delivery.test.ts:127` deliberately leaves sends unstarted and invokes several CLI passes; `src/next.ts` records failed delivery and prevents resend until the turn changes; `src/hc.ts` delegates send to hc. The lesson index also records host slowdown from leaked hc shutdown units. Neither a timeout increase nor a production delivery change follows from the report alone.

## Candidate questions, in priority order

### Q1: Which outcome gets first use of this session's charting effort?

Options: O1, reliable verification first (#130/#131), then early needs (#129). O2, early needs first, then verification. O3, let whichever is immediately answerable go first without a standing priority.

Recommend O1. Verification reliability supports every later lifecycle leaf, including the skill change. Cost: the recurring operator interruption problem waits behind a bounded test investigation. This is chart order, not a fabricated `blocked-by` dependency. Independent outcomes can still hand off independently.

Steers: chart order, prerequisite placement, allocation of proof effort, and which useful outcome to preserve if the session hits a real blocker.

### Q2: What should win when a smaller patch conflicts with preserving existing behavior and proof strength?

Options: O1, preserve production behavior and meaningful integration coverage, changing only the mechanism shown to cause the failure. O2, accept a narrowly scoped production change if it makes verification simpler. O3, accept a larger test-environment redesign to eliminate host dependence broadly.

Recommend O1. The earlier signposts favor unchanged workflow, native hc mechanisms, and fewer moving parts. For this session that means no production timeout/retry changes solely to satisfy a test, no replacement of every real-core test with mocks, and no general harness rewrite without evidence it is necessary for the handed reports. Cost: reproducing the exact delay may take longer than raising a cap.

Steers: timing fixes, schema isolation, use of existing fixtures, proof design, and the acceptable size of each leaf. Exact test technique remains a later fork.

### Q3: How much possible work should the opening needs request cover?

Options: O1, only the useful route A recommends, with explicit limits on identity, operations, cost and resources. O2, all materially plausible routes, each with its own bounded request. O3, only the needs common to every route, leaving unsupported branches unavailable this session.

Recommend O1. It avoids asking the operator for speculative credentials or broad authority while still allowing a complete outcome. Where a later choice would need additional authority, that route is unavailable under the recorded bounds. Cost: the recommended route must be narrowed before its needs can be named, and an attractive alternative may be deferred.

Steers: opening supply/approval inventory, retained proof operations, option availability, grant bounds, and whether an upstream or paid route can be kept. Needs and approvals belong in the same early discovery pass but remain distinct records. Full autopilot supplies no approval by itself.

### Q4: If a genuinely unforeseen human need appears after signposts, which cost should the session accept?

Options: O1, continue an already authorized, independently useful reduced outcome. O2, stop the affected chart visibly and preserve its findings for a later operator-directed run. O3, end the whole session rather than complete other handed outcomes.

Recommend O1 only where the existing scope and approvals already permit that useful outcome; otherwise O2. Do not quietly remove the chart's purpose, invent approval, or ask a new mid-chart question. Cost: a handed chart can remain incomplete despite full autopilot. The early inventory is an obligation to investigate, not a promise that every discovery is predictable.

Steers: proof cuts, scope cuts, handling missing machinery, drain behavior, and what the pass-end report must make visible. This is the recovery policy missing from an absolute “nothing after signposts” requirement. A late operator ask is already excluded by the intake's direction.

### Q5: How much evidence is required before calling these outcomes ready for lifecycle handoff?

Options: O1, focused demonstrations of each retained assumption in private fixtures, with the configured suite required of the implementation leaf. O2, also require a bounded concurrent/load demonstration during charting for the timing report. O3, require a broad soak or paid real-agent run before handoff.

Recommend O2, scoped to #130, and O1 for the other reports. The failure appears under concurrency, so an idle standalone pass cannot establish its cause or cure. Cost: extra local proof effort and resource use. No finite run proves independence from arbitrary machine overload. The later fork should name the actual supported condition and observed limit rather than promise that.

Steers: test done criteria, minimal reproduction, proof budgets, grant needs, fixture cleanup, and whether a proof demonstrates the reported property. Carry forward private sessions and scratch paths from the earlier signposts, not that session's paid authorization. Never use an operator-core restart as test repair.

### Q6: What counts as finishing an intake whose reported mechanism is already corrected?

Options: O1, prove current behavior, retain the evidence and take the existing close/handoff route without manufacturing code work. O2, add a dedicated regression leaf even if current coverage already proves the report. O3, require deployment or release confirmation at the reporting installation before considering the outcome finished.

Recommend O1 for this session, with installation/release limits stated explicitly. A source fix and an installed consumer running that fix are different observed facts. #131 needs current verification first; #129's source change will reach installed skills through a release link. Cost: this session does not claim every existing door installation has received the change. Any issue-close authority needed by the chosen route must be resolved in the opening needs pass.

Steers: whether #131 needs implementation at all, source-versus-rollout completion criteria, evidence retention, closure approvals, and whether the skill work gains an unrequested deployment dependency.

## Earlier answers to carry as proposed standing limits

Keep the existing workflow, use hc events/messages where applicable, retain meaningful end-to-end proof, and prefer the smallest mechanism with fewer failure points. The earlier paid test budget was scoped to that earlier session. The present operator already chose full autopilot, lifecycle, B/C consultation and no direct implementation by the door. Do not spend signposts re-asking those choices. The 21 unrelated flaky tests remain recorded only under the handed-list limit.
