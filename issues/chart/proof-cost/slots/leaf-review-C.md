# Leaf review, slot C: live-proof-line

Disagreements only.

G1. Criterion 3 "still refuses a criterion naming a count" does not match the audit it cites. The audit today refuses "a test file, assertion or test count" (shapes.md:286); a session count is not a test count, so nothing refuses "13 sessions" in a criterion now. What item 2 says the session count never goes in the criterion, so this leaf is adding a refusal, not keeping one. Write criterion 3 as: refuses a live-run criterion that names a session count, and keeps the test-count refusal.

G2. The timeout basis has no source. Brief and design say the worst case is "if sessions hit their timeout" and a measured case "replaces the timeout basis", but nothing says where the door gets the timeout. It is a consumer value (framework `.claude/workflow/scripts/lib/session-trace.ts:12`, 30 min), and the door is in akrogon's chart folder with no consumer file named. The SKILL.md rule must say the chart names the destination's session timeout (file and value) or the line reads "unknown" with that reason every time. One sentence, but without it the line cannot be built.

G3. The `failed` exit relied on is not quite the one that exists. The brief says "through the existing red-criterion exit". implement-issue SKILL.md:36 covers a done-criterion "still failing ... after the repairs the protocol permits" and :34 a fix that needs a locked decision changed. A seat discovering an unnamed shared resource has no red test and no locked decision; it has a criterion it cannot meet as written. That is :36 only if standing-design's new text says the side-by-side requirement is part of the criterion and the seat records it as a criterion that cannot pass within the leaf. Make the standing-design line say that in those words, or own one clause in implement-issue SKILL.md:36. The leaf excludes implement-issue, so the first.

G4. Criterion 1 names "every field listed in What item 1" and the fork adds "rounds counted"; the brief's What item 1 says "how many run at once (rounds counted)". Fine. But the review line sits beside the chart-usage.ts line (design), and SKILL.md:69 says that script's output is shown and `outcome partial` does not hold a handoff. Say the live-run line is door prose, not script output, so a missing basis does not get read as a failed measurement.

No disagreement with criteria 2, 4, 5, the empty readiness, or state.yaml sources.
