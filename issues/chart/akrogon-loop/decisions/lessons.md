# Lessons

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Keep a learning mechanism: one or two lines per lesson on what went wrong and what to improve in mechanisms already running, pruned, never a new mechanism. Where do lessons live, who writes them and when, and what stops them becoming permanent instructions?

Coverage pass 2026-09-08 adds: pruning active guidance must never delete history, the record of what happened stays (intake 75, 251).

## Findings

Carry check 2026-09-09 (both slots): no carries to retire. Later locks that bind: the performance log holds mechanical facts only; no code reads prose; Index Levels selective reading.

Slot A (Claude, blind): active list `learnings/LESSONS.md` plus `learnings/history/`; merge-issue writes per completed issue; 20-line cap and operator prune at chart open; plan-issue and chart-issues read the list; old folder moved to history unchanged.

Slot B (Codex, blind): lessons stay beside their evidence, no separate list; the discovering agent writes during its pass, failures and successes; improvements land in the owning doc or skill; pruning preserves the record with a dated correction; log analysis on demand; claims checked in the existing review. Rebuttal: history must stay open to targeted reads; no numeric cap or mandatory pruning duty; the cap trades relevance for count; the migration must fix relative links and may derive guidance where a mechanism survives.

Operator answers 2026-09-09: 1-A, asked how the transfer works (recorded below). 2-A with the rule: "make sure that these findings and learnings are abstract. They can contain the specific case, but the abstract learning has to benefit the entire repo. The entire mechanism should never pose itself as being the canon. These are just the learnings, what happened, not necessarily what's true." 3-A. 4-A "but never as canon, just another learning resource". 5-A. 6-A.

Operator explanation, the two files. There is no transfer step. The agent that finds a lesson writes the history file `learnings/history/<date>-<slug>.md` with the specific case, the evidence and the abstract lesson, then adds one line to `learnings/LESSONS.md` stating the abstract lesson, the mechanism it concerns, the date and a link to the history file. When a later leaf applies the improvement to a skill, doc or command, that leaf's implementer deletes the line and appends "Applied <date> in <leaf>" to the history file. When the operator prunes at chart open, chart-issues deletes the line and appends "Pruned <date>". The list is only pointers into history; history only grows.

## Resolution

Each repo keeps `learnings/LESSONS.md`, the active list, one line per lesson naming the abstract learning, the mechanism it concerns, the date and its history file, under a header that says these are learnings about what happened, not what is true. Each lesson also has `learnings/history/<date>-<slug>.md` with the specific case, evidence and the abstract lesson; history is never pruned or rewritten, is on no pass's reading list, and may be opened to check a lesson's evidence. The agent that finds a reusable lesson writes both in its own pass, from failed and successful work alike; the checker verifies the claim while reviewing the change it rides on. A line leaves the list when its improvement lands in the owning skill, doc or command (the implementing leaf deletes it and dates the history file) or when the operator prunes at chart open; no numeric cap. plan-issue and chart-issues read the list as one resource beside the reference index, never as a rule; implement, check and merge do not read it. Performance-log analysis happens on demand. The old lessons folder moves to `learnings/history/` unchanged in the last bootstrap leaf, relative links fixed, no active lines derived.

Why: the intake wants one or two lines per lesson, always updated, pruned, about mechanisms already running, and history kept. Two files give a short list that shapes work and a record that never shrinks, and the line leaving the list when applied is what keeps the list from becoming instructions.

Forecloses: lessons as canon or as a gate, a numeric cap, a lessons pass at every leaf end, every pass reading the list, distilling the old folder into active lines, a separate learning review.
