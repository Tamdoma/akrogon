# Signposts draft (A, before consultant angles)

Proposed answers come from the latest earlier record on this repo (issues/chart/model-judgment/forks/signposts.md), which bind only where they still apply.

1. How are the three reports grouped?
   - 1a (recommended) One chart, three independent issues side by side, each its own completion owner (closes its own report). Steers the split, handoff tree, closes.
   - 1b Three charts with a handover between each.
   - 1c One issue with three leaves (one owner, all three reports close together).
2. When a code guard and a rule line both could fix a report, which wins?
   - 2a (recommended) The smallest change that stops the failure on every reachable path at the point of use (removal or loud refusal), so the lesson can retire under lesson-rule Retire. A prose line only where no code path reaches the action. Steers #141 and #142 fixes.
   - 2b Prose only: tell seats and workers what to do.
   - 2c Both, prose plus guard.
3. Which repo does the work touch?
   - 3a (recommended) akrogon only. Retiring the framework's own lesson lines and Tamdoma/tamdoma-framework#650 stay framework work, recorded only. Steers scope, done-criteria, cross-repo claims.
   - 3b akrogon plus the framework's LESSONS.md edits.
4. What may the #143 change add?
   - 4a (recommended) Rule text only in existing files (learn-issues SKILL.md Sort, the shared lesson-rule.md Transfer and Retire), no new script, registry or scanner, carried from model-judgment's hard limits. Steers the #143 fork.
   - 4b A new record kind or command that marks a lesson covered.
5. What may proofs cost?
   - 5a (recommended) Free only: local git repos, temp repos and existing tests; no paid model launches this session. Steers every proof and grant.
   - 5b Allow a small paid launch budget.
