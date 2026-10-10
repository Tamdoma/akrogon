# Design: seed-owner-routing

## Binding decisions, verbatim

### promotion-trigger
Operator 2026-10-10: "1a | 2a |"

- 1a: the seat that writes a lesson files a seed for it in the same step when a simple check could catch the mechanism, after a duplicate search. It does not trace existing guard coverage; charting does. Foreclosed: 1b separate completion pass, 1c timed sweep.
- 2a: the automatic step only files a seed. Charting decides scope and fix. Foreclosed: 2b editing checks or skills inside the finding leaf.
- Binding avoidance steps: duplicate search before filing (seed-issue's existing search); a real `gh` filing probe with the seat identity before handoff (pending); a seed is intake only, so a workaround lesson does not become a rule without charting.


### lesson-lifecycle
Operator 2026-10-10: "1a | 2a | 3a - I'm not sure I will be using learn issues a lot of the time. Can you look at it from a systemic point of view? Is there a way to automate this stock and flow part of the process? re there any reinforcing loops or and balancing feedback loops that can help with automating this while not increasing the complexity of the system at all? We need a simple and elegant solution, so think about it. Use slot C, which is active, as well as slot B to come up with a solution for this. But only if it doesn't increase the complexity of the system and doesn't slow it down or sacrifice quality or cost. | 4a |"

- 1a: a seed for a shared akrogon skill or command goes to akrogon's issue repo, located through the installed akrogon command; everything else routes as today. The seed names the origin repo and lesson history path. Invalid target fails visibly and the lesson stays. Duplicate search runs against the receiving repo. Foreclosed: always current repo.
- 2a: the seed link (or matched existing report) is appended to the lesson's history file; the LESSONS.md line format is unchanged. Foreclosed: link on the active line.
- 3a: a lesson is applied only by a running mechanical guard covering every reachable case. Foreclosed: instruction lines with behavior evidence.
- 4a: the leaf that builds the guard removes the lesson line and appends Applied to history in the same diff, written into its brief by charting; closure alone never removes a line. The cross-repo remainder previously assigned to /learn-issues is reopened: the operator will not rely on /learn-issues, see forks/stock-flow.md.

### stock-flow
Operator 2026-10-10: "1a | 2a | 3a | My note: We need an automatic systemic process to fix this without bloating or increasing the mental model for how it works. Is there current machinery in the current system based on your stock and flow analysis and based on reinforcing and balancing loops that can do this without any additional cost to speed, quality, and elegance?"

- 1a: before writing a lesson the seat checks the list for the same failure cause (not shared keywords); on a match it appends the case to that lesson's history file and adds no line; a matched checkable lesson without a seed gets one (promotion 1a). Unsure means a new line. Foreclosed: always a new line.
- 2a: a lesson about an akrogon skill or command is written into akrogon's learnings/, left for the operator to commit; akrogon not found means visible notice and a local write. Foreclosed: keep in the consumer repo.
- 3a: one-time /learn-issues run per repo for the existing backlog. Foreclosed: leave the backlog. The operator note asks whether existing machinery can replace even this; see focused check in slots/stock-flow-final-check-*.md.
- Operator note answered 2026-10-10 after focused checks (slots/stock-flow-final-check-B.md, -C.md): A proposed "relevance is recurrence" (planner files seeds for relevant unseeded lessons). B and C rejected it: relevance is not a repeat failure, it adds gh calls to the plan pass on every leaf's critical path, needs plan-issue:27 widened and one filer in debate mode, turns guarded lines into seeds instead of deletions, and leaves reader cost unchanged. A withdrew it. No existing machinery drains the backlog for free; the chosen rules (write-time match and seed, guard-leaf removal) are the automatic loop, and 3a stays a required one-time operator step.

### draft-review-repairs
Operator 2026-10-10: "1a | 2a |"

- 1a: before push, the merge path checks each lesson whose history file gained an Applied entry in the pushed range and removes its LESSONS.md line again if the union merge brought it back. Applies in both merge modes (solo rebase by B, and stack top built by the command, where B commits nothing, so the planner places the step where the stack is built or checked). Foreclosed: dropping merge=union.
- 2a: when seed-issue's lookup finds a report covering the same failure, it posts nothing and prints that report's URL as the outcome, for every run including manual ones. Foreclosed: a lesson-only mode.

Exclusions: promotion-trigger, stock-flow and draft-review-repairs 1a are context only. This leaf owns lifecycle 1a (routing), the akrogon-root rule used by stock-flow 2a, and draft-review-repairs 2a (existing report returned).

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- No vanity tests: seed-issue is skill text; proof is the fresh-agent case run, and link resolution is proven by tests/docs-links.test.ts inside the configured `bun test` check; no test asserting phrases.
- Writer and checker share one rule: lesson-write-rule references this leaf's owner and root rules, never a copy.
- No live call during implementation: GitHub filing is proven at charting (readiness proofs); case runs decide targets without posting.

## Leaf architecture
- Owned: skills/seed-issue/SKILL.md Destination, lookup and Submit sections; docs routing and always-create lines.
- Interface: owner test = a named path that exists relative to the current repo root routes as today; otherwise it is akrogon-owned when it exists relative to the akrogon root or resolves under it after readlink -f. Akrogon root = Git root of readlink -f of the akrogon command. Akrogon repo = root akrogon.yaml issues_repo, else origin. Existing-report outcome = final Last operation line prints the found URL, nothing posted.
- Exclusions: no edits to consumer akrogon.yaml, no hardcoded repo identity, no new command or flag, no lesson-only mode.
