# Case 6 — akrogon lesson when the akrogon root cannot be found

Same consumer repo as case 4: a check.review pass in Tamdoma/tamdoma-framework produced a lesson naming `skills/check-issue/SKILL.md`, a path absent under the framework root but owned by akrogon.

Environment facts for the decision: `command -v akrogon` prints nothing; no `akrogon` binary exists on PATH, so the akrogon root cannot be resolved and no `~/.config` or sibling checkout supplies one. No matching active line exists in the consumer repo's LESSONS.md, and the new history file links no report.

Decide where the lesson is written, what the seat says, and what happens with the seed.
