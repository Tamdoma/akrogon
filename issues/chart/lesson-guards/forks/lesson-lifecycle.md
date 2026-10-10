# Lesson lifecycle

## Question
Q1. Which GitHub repo receives the seed when the lesson is about a shared akrogon skill or command but was found in a consumer repo (seed-issue routes by the consumer's akrogon.yaml issues_repo, e.g. framework -> Tamdoma/tamdoma-framework)?
Q2. What happens to the active lesson line once its seed is filed: stays until a guard is delivered and verified, links to the seed, or leaves at filing? And what counts as applied: a running mechanical guard only (learn-issues today, skills/learn-issues/SKILL.md:20) or also a brief/skill rule with retained behavior evidence?

### Carries
- forks/promotion-trigger.md Taken: 1a seat files at write time, 2a intake only.
- docs/guide/learn.md: "A report about an Akrogon skill belongs in Akrogon."
- B evidence: framework history 2026-10-05-analytics-guard-proof.md:5-13 (35 tests passed with guards inverted).

## Findings
- Full exchange: slots/lesson-lifecycle-A.md, -B.md, -merged.md, -rebuttal-B.md.
- Q1 route by mechanism owner (A,B). Q2 line stays until verified guard (A,B); link in history file (B, A conceded). Applied standard: A mechanical only, B also rules with outcome evidence (held). Retirement owner raised by (A,B); B: closure is not delivery, consumer must run the delivered revision.

## Taken
Operator 2026-10-10: "1a | 2a | 3a - I'm not sure I will be using learn issues a lot of the time. Can you look at it from a systemic point of view? Is there a way to automate this stock and flow part of the process? re there any reinforcing loops or and balancing feedback loops that can help with automating this while not increasing the complexity of the system at all? We need a simple and elegant solution, so think about it. Use slot C, which is active, as well as slot B to come up with a solution for this. But only if it doesn't increase the complexity of the system and doesn't slow it down or sacrifice quality or cost. | 4a |"

- 1a: a seed for a shared akrogon skill or command goes to akrogon's issue repo, located through the installed akrogon command; everything else routes as today. The seed names the origin repo and lesson history path. Invalid target fails visibly and the lesson stays. Duplicate search runs against the receiving repo. Foreclosed: always current repo.
- 2a: the seed link (or matched existing report) is appended to the lesson's history file; the LESSONS.md line format is unchanged. Foreclosed: link on the active line.
- 3a: a lesson is applied only by a running mechanical guard covering every reachable case. Foreclosed: instruction lines with behavior evidence.
- 4a: the leaf that builds the guard removes the lesson line and appends Applied to history in the same diff, written into its brief by charting; closure alone never removes a line. The cross-repo remainder previously assigned to /learn-issues is reopened: the operator will not rely on /learn-issues, see forks/stock-flow.md.
