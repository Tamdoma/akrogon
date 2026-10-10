# Stock-flow, merged (A, B, C)

## Map
- Stock: active LESSONS.md lines. Akrogon 20 bullets (B) / 30 file lines (C); framework 145. (A,B,C)
- Inflow: five write points (plan-issue:39, chart-issues:31, implement-issue:31, check-issue:59,89), about 4 lines a day on framework, 67 in 17 days; none reads the stock before writing. (A,B,C; rate C)
- Outflow: implement-issue:31 removal almost never fires because implement does not read the stock (C); learn-issues is operator-only (A,B,C). Framework 3 Applied of 146 histories (C).
- Readers: plan-issue and chart-issues read the whole file each pass, roughly 15k tokens per plan on framework. Size costs only readers. (C)
- Taken 1a + 4a already close a balancing loop for checkable lessons: write -> seed -> chart -> guard leaf -> line removed. Delay is charting cadence. (A,B,C)
- Pending seeds become a second stock; faster filing can grow it. (B,C)
- Gaps: judgment lessons, already-guarded lines, cross-repo lines, backlog. (A,B,C)

## Options
- P1 Dedupe at inflow: the writing seat searches LESSONS.md for the same mechanism first; on a hit it appends the case to that lesson's history file and adds no line. Balancing loop on inflow. Cost: one search per write. Framework shows duplicates already: checksum 6, schema 6, receipt 3; three history files already hold more than one case. (A,C)
- P1b Recurrence ranks: a history file with several cases is the recurrence signal; a repeat of a checkable lesson gets its seed (A); charting ranks seeds by case count (C). No new state. (A,C)
- P2 Write the lesson where its guard will live: a lesson about a shared akrogon skill or command goes into akrogon's learnings/ (found the same way as the 1a seed), so 4a's same-diff retirement covers it and the cross-repo gap disappears. Left for the operator to commit, like check-issue:59 does today. (C)
- P3 Charting links relevant lessons to guard criteria and may retire a line when inspected evidence already proves coverage. (B)

## Judgment lessons and backlog
- No option meets the full bar: under 3a a judgment lesson can never be applied, so nothing automatic drains it. (A,B,C)
- Least cost for backlog: one bounded /learn-issues run per repo, once, not a standing dependency. (C) B: opportunistic treatment only, unless one-time work is authorized.
- Age-out: A raised as option; B and C reject (deletes unread lessons on a clock, needs a pass).

## Rejected (A,B,C)
- Timed sweep, completion pass, new command or database.
- Reader drains (planner traces all lessons every plan): slowdown. (B,C)
- Cap with eviction, removal at filing or closure. (A,B)
- Implementing guards inside the detecting leaf.

## Open questions
- Is stock size the cost, or only what readers consume? Narrowing plan-issue's read to matching lessons may be cheaper. (C)
- Literal zero cost vs no net increase: write-time search and GitHub calls are small but not zero. (B)
- Framework line format differs from akrogon's; P1 search and 1a seed both read it. (C)

## Differences
- Pick: A and C pick P1 (+ P2 from C). B picks P3, charting-led linking.
- Backlog: C one-time learn-issues run; B opportunistic; A age-out (now withdrawn in favour of B/C reasons).
