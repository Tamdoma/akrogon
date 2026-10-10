# Brief: live-proof-line

## What
Two text rules in the chart door. No command code changes.

1. The handoff review shows one line per leaf whose done-criteria need a live run (real model sessions). The line gives the session count, how many run at once (rounds counted), an estimated elapsed time, and the worst case if sessions hit their timeout. It is labelled an estimate. The timeout basis is the destination's session timeout, which the chart names by file and value. A recorded measured case replaces the timeout basis. (A,C) "unknown" with a reason is allowed when no basis exists. The line is door prose, not chart-usage script output, so a missing basis is not a failed measurement. (A,C) The line is information only: it never times out a leaf or waives a criterion, and the operator approves or narrows scope.
2. A live-run done-criterion requires its sessions to run side by side, each with its own working root and log, unless the brief names the shared resource that forces them to run one after another. The side-by-side requirement is part of the criterion, so a seat that finds an unnamed shared resource records a criterion that cannot pass within the leaf and ends the pass `failed` with the reason, through the existing exit for a criterion still failing (implement-issue SKILL.md:36). (A,C) The session count stays in the review line, never in the criterion.

Owned text: skills/chart-issues/SKILL.md (Handoff section), skills/chart-issues/assets/shapes.md (handoff audit), skills/chart-issues/assets/standing-design.md (the slow or live-run lines), docs/guide/chart.md (handoff review description).

## Why
Tamdoma/akrogon#75. Live-run leaves cost far more time than others (framework: 85 of 343 closed leaves carry a live-run proof, implement median 103 min against 26 min), and the operator only sees that after handoff. The seat's "30-60 min" figure was the session timeout, not a measurement. Live sessions that share one root or log run one at a time without anyone deciding that.

## Done-criteria
1. The Handoff section of skills/chart-issues/SKILL.md tells the door to show the live-run line in the handoff review as door prose, with every field listed in What item 1, the estimate label, the named timeout source, the measured-case and "unknown" rules, and the information-only rule. (A,C)
2. skills/chart-issues/assets/standing-design.md states the side-by-side rule as part of every live-run done-criterion, the named shared-resource exception, and that an unnamed shared resource makes the criterion one that cannot pass within the leaf, so the pass ends `failed`. (A,C)
3. skills/chart-issues/assets/shapes.md's handoff audit refuses a live-run done-criterion that runs sessions one after another without naming the shared resource, refuses a live-run criterion that names a session count, and keeps the test-count refusal. (A,C)
4. docs/guide/chart.md describes the live-run line in the handoff review.
5. No new number, budget, timer or duration gate appears in any of the four files. The audit refusals in criterion 3 and the existing `failed` exit are allowed. (A,B)
