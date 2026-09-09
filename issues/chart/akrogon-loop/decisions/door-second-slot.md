# Door Second Slot

Chart skill version: 4

Status: resolved
Type: grilling

## Question

During chart-issues and create-issue, slot B takes part blind. Which shape: B answers single questions blind as they come, or B works the whole territory once and hands everything to A at the end? Learnings from this chart so far: category-by-category blind prompting yielded 3 new forks of 11 and 9 new items of 36. And where does the yes-or-no for B in this phase get asked, skill or config?

From # Bootstrap 2026-09-09: the first automated leaves are elected without debate, so the door must allow "no debate" as a plain answer with no extra state.

## Findings

Carry check 2026-09-09 (both slots): the Bootstrap carry holds for the implementation debate field, which Debate Count locked; it does not decide the door. The create-issue mention is stale, Skill Rewrite combined the doors. This decision is chart-issues only.

Slot A (Claude, blind): per-decision blind pass as run in this chart; B always on when a second pane exists; focused check before recording when the operator reshapes in chat; A owns the interview.

Slot B (Codex, blind): elect once at chart open, recorded in Notes; per-decision blind pass against current locks, not a whole-territory pass; B gets intake, question, locks and verbatim operator corrections, never A's draft; one focused check on a material operator change; full first batch then disagreement-only rebuttal. Rebuttal: pane presence is not an election; passing the whole decision file can leak A's draft through Findings; B may answer the operator's direct requests.

Evidence of record: learnings/charting/process-so-far.md lines 26-60 (tier 1, first-hand): B found forks A missed in Bootstrap (3) and Multi Chart Layout (4), caught a stale carry in Status View, moved docs ownership in Index Levels, gave seven taken points on GitHub Intake, fixed the staleness rule in Handoff Location.

Operator answers 2026-09-09: 1-A, 2-A, 3-A, 4-A, 5-A, 6-A. Challenge accepted as stated: one blind batch, one rebuttal, one focused check on late changes.

## Resolution

Slot B joins chart-issues when the operator names its pane at chart open; no pane named means single slot, and the skill says so in its first reply. No config key, no election question. The implementation debate field stays Debate Count's. Shape: a blind map at open, then for every decision one blind B pass against the current locks, run in the background while A writes its own view. B receives the intake, the decision's Question section with its carries, the related decision paths, the locks, and the operator's corrections verbatim; never A's draft or the Findings section until both passes are done. B returns a full batch; A merges with (A), (B), (both) tags; B replies once with disagreements only on the merged file; A presents one batch with the rebuttal under the challenge check. When the operator adds a mechanism or changes a contract in chat, B checks the final shape once before A records; restatements need no check. A owns the interview and the recording; B answers the operator's direct requests in its own pane.

Why: this chart's own record shows B finding forks and errors in every decision at two to four background minutes each, and the whole-territory shape would have missed the late catches. Naming the pane is the smallest election that identifies B without state.

Forecloses: a config key or open question for the door's second slot, one-shot territory passes by B, B reading A's draft before its own pass, B addressing the operator's batch, unlimited rebuttal rounds.
