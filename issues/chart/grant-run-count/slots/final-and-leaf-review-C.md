# Final-shape check and leaf review, chart grant-run-count, slot C

Read: forks/grant-count.md "Taken", forks/signposts.md "Taken" (identical to the round-drawings original), the handoff ISSUE.md, brief.md, design.md, readiness.yaml, state.yaml; plan-issue "plan.synthesis", check-issue "check.review" and "check.repair", merge-issue "Shared context" and the verify paragraph, implement-issue "Shared context" for the checks below. Disagreements only.

## Part 1: final shape

S1. Pick 2 widens signpost 2b from paid runs to every repeat bound. Signpost question 2 is "Money limit: may a paid run ever go past the run limit you approved?" and the Taken reads "a paid run past an approved bound". The merged map's scope line (fork 2, B K4a) kept "only repeat-count bounds of a paid operation". The Taken pick 2 says "leaf seats and repeat-count bounds only" and pick 5 says "every covered operation (paid launches and live changes) counts by its bound's unit", so a live-change grant's repeat bound (chart-issues "Take" grant paragraph: "explicit destructive, public, billing, DNS and retention effects; repeat and recovery bounds", media-range-live's "at most one pass rerun after a failure") now warns and runs. A second destructive pass is not a money limit; 2b does not cover it. Brief criterion 2 carries the same gap ("a launch past a repeat-count bound"). Fix: "a repeat-count bound of a paid operation" in pick 2 and criterion 2; live-change repeat bounds keep the stop.

S2. Pick 3's check.review launch owner has no hook. "In check.review no seat launches a covered operation unless `plan.md` names the seat that runs that live proof": plan-issue "plan.synthesis" has no sentence that assigns a proof to a review seat (grep for seat, live proof, check.review: none), and the brief owns only plan-issue's "Shared context" grant sentence. As written, the clause either forces the implementer to add a plan field in an unowned section or is dead text that reads as "never". check-issue "check.repair" already gives planned live proofs to B. Simplest ruling with no new part: check.review launches no covered operation; the live proof runs in check.repair by B as today, or in implement by A. If A wants the plan hook, own one clause in plan-issue "plan.synthesis".

S3. Pick 3 leaves unknown prior use under a spend cap unruled. "Prior use that cannot be established is written as unknown ... and the next launch carries the warning" (warn and run), while pick 2 says a spend cap keeps its stop and "the stop wins when both apply". With unknown prior use the seat cannot tell whether the spend cap applies, so "the stop wins" cannot be evaluated. One sentence rules it: unknown prior use under a grant with a spend cap or other stop-type bound is a stop. Low confidence that A wants the stop rather than the warning; either way the case needs a ruling.

S4. Pick 4's "an Operator action when the next launch needs a renewed grant" has no trigger under warn and run. For a repeat bound the next launch never "needs" a renewed grant: it warns and runs. The clause only fires for stop-type bounds, which pick 2 already covers. Either say so (an Operator action when a stop-type bound or `stop_line` blocks the next launch) or drop the clause from pick 4 and criterion 3.

No pick breaks 1c, 3a, 4a, 5a or 6a. Picks 1, 5 and the carried lines stand.

## Part 2: leaf review as implementer

L1. Criterion 3 cannot be met inside the owned surfaces as written (S2). The "unless `plan.md` names the seat" condition needs plan-issue "plan.synthesis" text the brief does not own, or it must go.

L2. Criterion 2 inherits S1: "a launch past a repeat-count bound" with no "paid" qualifier makes the implementer choose between the signpost's wording and the brief's. Add "of a paid operation".

L3. The merge seat's pass artifact is a guess. design.md "Leaf architecture" lists "the merge record" among the four artifacts; merge-issue names no such file. The merge seat writes its verify output "in review-B.md" (merge-issue, the `akrogon verify --attempt` paragraph). Name `review-B.md` for the merge seat, or the four copies will not say "the same rule in the same words, adjusted only for the seat and its artifact".

L4. Criterion 3's audit sources presume every covered launch went through run-check, and no criterion states it. The merged map's pitfall line ("covered operations run through `run-check`, current practice, stated") did not reach the Taken or the brief. Existing text only says kept output goes through run-check (implement-issue "Shared context": "A seat keeps command output only through `akrogon run-check`"; plan-issue "plan.synthesis" has the same sentence). A launch outside run-check leaves no `check-<name>-*.log` and no `timings.jsonl` row, so the audit cannot see it, and under criterion 3 "unexplained paid activity" has no source to be found in. Add to criterion 1: a covered launch runs through `akrogon run-check`, so its log and timing row exist for the audit.

L5. Criterion 2 and criterion 1 together put nine clauses into one "Shared context" sentence per skill. Observable and met inside the owned surface, but the brief's own words ("The same sentence says ...") fix the shape to one sentence; the implementer should be free to use the paragraph. Say "the same paragraph" or "the grant rule in Shared context".

Everything else holds: criteria 4 to 7 are observable, name no test file or count, and sit inside owned surfaces; readiness.yaml with empty grants and proofs is right for a text-only leaf; every Taken decision has a home or an exclusion (3a's proof rule, old grants, provider cap, release copy); the coverage-audit overlap is stated as different paragraphs.
