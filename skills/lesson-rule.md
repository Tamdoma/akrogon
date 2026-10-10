# Lesson rule

How a seat writes a lesson.

- **Match**: before adding a line, check the active list for a lesson with the same failure cause and scope; shared keywords are not a match, and an unsure match gets a new line. On a match, append the new case to that lesson's history file and add no line.
- **Seed**: a lesson meeting the first clause of the Checkable definition in [learn-issues/SKILL.md](learn-issues/SKILL.md), new or matched, gets `/seed-issue` run for it unless its history already links a report; the created or returned report URL is appended to the history file. A judgment lesson files nothing. Whether a running guard already covers the mechanism is left to charting.
- **Home**: a lesson about akrogon's own skills or command is written into akrogon's `learnings/`, with the root located by [seed-issue's owner rule](seed-issue/SKILL.md); the write is left for the operator to commit. When the root cannot be found, the seat says so and writes locally.
- **Retire**: the leaf that delivers a running mechanical guard covering a lesson's mechanism on every reachable path removes the lesson's line from `learnings/LESSONS.md` and appends `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` to its history file in the same diff; a leaf that touches a lesson without fully guarding it keeps the line. Report closure, duplicate or rejection never removes a line.
