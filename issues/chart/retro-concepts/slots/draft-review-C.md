# Draft review C: learn-issues

## Part 1. Disagreements (drafts unchanged since my first review, so these stand)

D1. Criterion 4 cannot be met for cheat.md. brief.md:20 wants a row "linking the skill" in both tables. README rows link (README.md:182-190). The cheat table uses plain names (docs/guide/cheat.md:116-126). Replace criterion 4's second sentence with: "The `README.md` skill table has a `learn-issues` row linking the skill, and the `docs/guide/cheat.md` skill table has a `learn-issues` row in that table's existing form." Replace "says ten" with "matches the number of skill folders". Replace criterion 6's second sentence with: "The docs link test in `checks` proves the new README link resolves."

D2. Missing surface. docs/guide/cheat.md:128 lists what the operator invokes by hand ("setup, intake, charting and watching"). Add to design.md:28 and criterion 4: "The sentence under the cheat table that lists operator-invoked skills includes lesson triage."

D3. Ambiguous removal. design.md:25 says "show the operator the full sorted list with evidence before any edit". brief.md:5 says only "removes the active line". The binding accept or decline covers seeds only. The registered LESSONS.md can hold uncommitted lines from seats (skills/check-issue/SKILL.md:59), so a wrong removal is restored by hand. Add to brief.md:9: "It shows the sorted list with each guard's file:line, then removes already-guarded lines without a further question. The uncommitted diff is the operator's review." If the operator wants a pause, say that instead. The draft must say which.

D4. docs/guide/learn.md:18 says charting can propose "removing stale entries". The new skill has no stale outcome, so criterion 4's "where it describes pruning stale entries" would describe something the skill does not do. Replace that clause with: "`docs/guide/learn.md` says `/learn-issues` removes a lesson once a guard covers it and offers a seed when a check could."

## Part 2. Retro ideas for the skill text

Belong (three additions, none changes a binding decision):

P1. The test for "checkable" (source-retro-SKILL.md:19). The draft says "a deterministic check could cover the mechanism" and gives the implementer no test for that. Proposed skill text: "A lesson is checkable when its mechanism is a fixed pattern a command can detect: a banned call or schema shape, a path or file-location rule, a required state before a step. A lesson that needs judgment stays." Akrogon evidence: LESSONS.md:17 (`.min(1)` without trim) and :9 (unguarded stderr JSON parse) are fixed patterns. LESSONS.md:7 (review by running, not reading) is judgment.

P2. Look at existing guards first (source-retro-SKILL.md:18). Proposed skill text: "Before sorting, read the repo's `checks` and `merge_checks` in `issues/config.yaml` and the guards the lesson's code path already has. A check that exists but is not in blocking `checks` does not count as a guard. The lesson is checkable and the seed line names that unwired check as the reachable case." Akrogon evidence: this exact failure recurred, a criterion citing a command outside blocking `checks` (issues/chart/leaf-run-stalls/CHART.md:9, :14). It stays inside X4, because it names an observed gap and not a check to build.

P3. Order by consequence (source-retro-SKILL.md:25). Proposed skill text: "Show already-guarded lines first, then checkable lines ordered by consequence today, then the lines that stay." "Consequence today" is check-issue's own term (skills/check-issue/SKILL.md:51), so it adds no vocabulary.

Do not belong:

N1. "Default to building the check over writing the rule" (:19). Changes binding decision 2: a seed is unverified intake and a later chart weighs the per-pass cost (design.md:9, skills/seed-issue/SKILL.md:26).
N2. Navigation pointers (:17). Some lessons are really non-obvious patterns, for example LESSONS.md:19 (hook cwd). Moving them to an AREA.md would add a fourth outcome, which changes binding decision 1. It also breaks an existing rule: AREA authorship belongs to init and the implementing seat (skills/init-akrogon/SKILL.md:62, skills/check-issue/SKILL.md:59).
N3. No-op instructions (:22). Applied here it means removing lessons whose referent is gone, for example LESSONS.md:8 names `init-issues` and :12 names `docs/limits.html`, and neither exists now. That is a fourth outcome, so it changes binding decision 1. The mechanism in each line still holds, so "stays" is correct. Flagged for the operator because today's prune could remove such lines and the new skill cannot.
N4. Session-log reading, tool economy, information access (:13, :21, :23). They are about a session, not a lesson list. Off route (design.md:16).
N5. Reviewer-owned standards and steering-file size (:20, :29-35, :41-44). Akrogon has no steering file, and review judges against plan, brief and design (skills/check-issue/SKILL.md:39).
N6. "A repo with no guardrail is itself a finding" (:18). Checks are proposed at init (skills/init-akrogon/SKILL.md:42). Reporting it here widens the skill past lessons.
