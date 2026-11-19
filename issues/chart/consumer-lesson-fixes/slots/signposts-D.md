# Signposts angles, slot D

## 1. Missed angles

M1. Which Retire rule judges the #141 and #142 fixes: today's, or the one #143 leaves behind?
- M1a (pick) Today's rule (removal, loud refusal or running guard). #143 may not widen Retire in a way that lets a prose line count for #141 or #142.
- M1b The rule as #143 leaves it. #143 lands first and the other two are judged by it.
- Why it matters: draft 1a calls the three independent, but #143 edits the exits that draft 2a uses as the bar for the other two. M1b makes #143 a prerequisite and makes a prose line an acceptable #141 fix.
- Steers: issue order, #141 and #142 done-criteria, how far #143 may reach into Retire.

M2. When input or use breaks a git behaviour, does akrogon refuse it and name the cause, or change shape so the break cannot happen?
- M2a (pick) Remove the mechanism where one change does it, otherwise keep git's own definition and refuse with the cause named. Never a second parser or a lenient reading beside git's.
- M2b Accept more: akrogon parses wrapped trailers itself and tolerates stash.
- M2c Refuse only, never change shape.
- Steers: #142 (error text names the unindented wrap, versus an own trailer parser), #141 (worker checkouts that do not share `refs/stash`, versus a "do not stash" line), #143 (a lesson leaves by a recorded exit, versus the sort quietly skipping it).

M3. Must every fix hold in every harness that runs akrogon seats and workers (Claude Code, pi, codex)?
- M3a (pick) Yes. No fix may depend on one harness's hooks or tool settings. Fixes live in akrogon code, git state or skill text that every harness reads.
- M3b Allow a harness-specific guard, such as a Claude Code tool hook that blocks `git stash`.
- Steers: the #141 fix most, the wording of #143 rule text (read by three model families), and proofs (a harness hook needs a paid launch per harness to prove, which draft 5a forbids).

## 2. Disagreements

Draft 2, option 2a: I would pick it, with one correction. Worker-protocol "Launch and return" shows no akrogon code path reaches a worker's `git stash`. A creates the worktree and spawns the worker by following skill text, and the worker runs git itself. So 2a's fallback clause sends #141 straight to a prose line, and under today's Retire the lesson then stays. Reword 2a so the #141 fork must first test removal (worker checkouts with their own `refs/stash`) before it accepts prose, and must say plainly if the result does not retire the lesson.

Draft 5, option 5a: agree, with a stated consequence. Free proofs cannot show that a model follows new rule text. #143, and any prose part of #141, are proven by reading the text against the seven framework lines and lines 72 and 268, not by a run. Record that as the accepted proof so check-issue does not ask for a reproduction test.

Drafts 1, 3 and 4: no disagreement. For 4a, the intake names three `lesson-rule.md` files (learn-issues, chart-issues, implement-issue). The fork should name which ones change.

## 3. Needs

None for charting and landing in akrogon. The fixes reach the framework repo only after an akrogon release is installed there. That install and the framework's own lesson retirement are framework work under draft 3a and need no operator action in this session.
