## Q1 Who starts handed-off leaves?

D1 Pick: preserve the existing seam. The door completes and validates handoff, records the result, then moves to its next assigned chart. It runs no `akrogon next`, starts no watcher and creates no timer. The operator’s existing watcher starts eligible waiting leaves on its normal tick. Other existing lifecycle triggers remain valid. Do not make watcher presence a prerequisite for a correct handoff.

Reason: this follows both the operator’s separation and today’s chart contract without adding coordination. Cost: handoff does not guarantee immediate execution. With no active dispatch source, valid leaves can remain waiting.

O1 Reject door dispatch “for speed”: it changes the explicit handoff boundary. Reject waiting for a watcher acknowledgement or repairing its job: that makes charting depend on watcher availability and expands scope.

E1 Evidence, read 2026-10-16: operator tier, INTAKE.md second scope correction and Boundary follow-up assign the watcher to the operator. The 2026-10-11 operator answer in night-flow/forks/keep-running.md explicitly rejects dependencies on the watch. Primary repository evidence: chart-issues/SKILL.md at f7baddc:85 forbids handoff dispatch. watch-issues/SKILL.md, Judge/Waiting, dispatches eligible leaves and respects prerequisites.

R1 Pitfalls: say “handed off,” not “started,” without execution evidence. The watcher’s 20-minute schedule is not a guaranteed start deadline: pause, blockers, expiry or session loss can prevent dispatch. Do not require waiting for its tick when another existing trigger can act.

Q1a Missing: none requiring a new mechanism. The handoff report should distinguish readiness from observed execution.

## Q2 Is morning review a gate?

D2 Pick: no additional review gate. Validly handed-off leaves become eligible for normal execution immediately, with existing dependencies and checks. They may merge to main before the operator reads the morning record. State that consequence plainly in this decision. The morning record supports later review and correction, not approval of an unpublished release.

Reason: A already answers the handoff decisions, and the operator requested autonomous completion after charting. Cost: a mistaken technical decision may already be merged and, for akrogon, deployed before review.

O2 Reject pausing the repository, adding staging, or withholding dispatch pending morning review. These alter other concurrent work or require machinery excluded by CHART.md. A stated wait in prose cannot stop dispatchable leaves.

E2 Evidence, read 2026-10-16: operator tier, Boundary Taken delegates decisions while retaining checks and outside-account approvals. Primary repository evidence: docs/guide/install.md:37-39 describes deployment of merged akrogon commits. CHART.md excludes lifecycle dispatch changes.

R2 Pitfalls: settle pending approvals and needs before handoff. Preserve existing review, proof and verification checks. Eligible direct-route work also can land before morning and is not dispatched by the watcher.

Q2a Missing: the consequence must cover both lifecycle and direct landings, without reopening direct eligibility or authority.

END watcher-seam-B
