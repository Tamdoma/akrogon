# Design: lesson-write-rule

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

Exclusions: lifecycle 4a and draft-review-repairs 1a (retirement and merge re-removal) belong to guard-retires-lesson; lifecycle 1a routing and draft-review-repairs 2a belong to seed-owner-routing and are consumed here.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- No vanity tests: proof is the fresh-agent case run on recorded framework evidence, with one deliberately broken variant; link resolution is proven by tests/docs-links.test.ts inside the configured `bun test` check; no test asserting the rule's wording.
- Writer and checker share one rule: the rule lives in one file; the five write sites and docs point to it; the fixed-pattern clause stays defined only in learn-issues, and the writer never traces guard coverage (promotion-trigger 1a).
- Seeds are filed by seats after delivery, not during implementation; case runs decide outcomes without posting.

## Leaf architecture
- Owned: the five write-site lines, the shared rule file under skills/ (planner picks its home), docs/guide/learn.md lesson paragraphs, docs/guide/cheat.md:149, skills/AREA.md if a key file is added.
- Interface: match = same failure cause and scope; unsure = new line. Report link lives in the history file. LESSONS.md line format unchanged. Concurrent writers may add one extra line or seed; the next match folds it in (CHART Off route).
- Exclusions: /learn-issues unchanged; no seed ranking; no new command, pass, state or format; plan-issue read rule (:25-27) unchanged; the applying half of implement-issue:31 belongs to guard-retires-lesson.
