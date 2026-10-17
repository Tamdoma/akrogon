# Operator autopilot history in session transcripts (A subagent, Opus, 2026-10-16)

Agent research, not a new operator answer. Times UTC, paths under ~/.claude/projects/ unless absolute. Coverage starts 09-02; July-August rebuilds are not in transcripts.

## Attempts
- E1 09-11..13 (`-home-ivan-Work-infra-akrogon-new/310b67d8-...jsonl`): "Fix all of those issues yourself." 26 merged, 6 stuck; a seat ran ~5,691 grep/sed over 7 h. Operator: "It should be as off hands as possible.", "it never told me it was gonna need the keys", "There should be NO regression in the behavior."
- E2 09-21/22 (framework `3475e9bd`): "/watch-issues ... I need to go to sleep." One leaf queued ~4 h, watch logged nothing 11 times. "Why did it take the entire night?"
- E3 09-29/30 (framework `c3ccb36d`): "When the drafts are done, use akrogon next... Please don't disappoint." Agent decided D1-D6 for the operator. A leaf failed on operator-only inputs never listed ("That's my miss"), held epic polished all night, /tmp out of inodes, watch self-deleted. "why did you spend so much money over night?", "$180 in token usage." Operator later answered "Yes, to all" to D1-D6.
- E4 10-01: one 193-file leaf took 8.5 h and blocked 6. "How many fix rounds is this? This is crazy."
- E5 10-04/05: 9 of 10 merged. "what's taking so much time?"
- E6 10-07..09: merge rate unchanged overnight, pi quota exhausted, watch would not switch models.
- E7 10-10/11: false red set a repo-wide hold for ~8 h; watch deleted itself. "Why did you delete the watch", "Shouldnt that be automatic?"
- E8 10-13/14: memory gate blocked every check 01:00-05:00; agent built a pi extension overnight. "Thisis a huge regression, setting up so many limitations... Im very unhappy about this."
- E9 10-14/15 (akrogon `6a0d8d81`): "Whatever the consultants give you, I give you the permission to pick the best options according to your taste, but only overnight until I take the control back." 13 merged. Morning: "What changes did you make and why? What about the pi-extensions change? Why did you do it?", "why are we returning non existing tests to A? Isn't this counter to what the intent is..."
- E10 10-15/16: autopilot charting night (source file). No morning verdict found; next messages: "It must not break anything else", "just do the handoff, don't start it."

## Recurring complaints
F1 stalls nobody notices. F2 watch stops while work is open. F3 operator-only inputs not flagged ahead ("The charting process MUST anticipate that it will need keys, logins, etc"). F4 overnight changes cause regressions. F5 cost and wasted effort. F6 oversized leaves and endless fix rounds. F7 steps that need him and should not. F8 over-engineering ("adding complexity just for the sake of it is not worth it", 09-19; "I just don't want to make this so deterministic that it always fails", 10-16).

## What autopilot must and must not do (operator words)
- C3 "only overnight until I take the control back" (E9).
- C5 values: "simplicity, function over form, better to delete code than just stack and stockpile, speed, cost" (0c42a11d 23:30).
- C8 watcher scope 09-19: "use this very rarely when I'm away... only react in the most extreme situations", "only the things that I start", "very light mold, not something that is core".
- C9 "it must not kill the working processes that are not idle".

## Flags
- R2 09-19 "I need to be pushing the next commands manually" vs later nights handing `next` and decisions to the agent.
- Merge counts show most nights delivered; what failed was being hands-off (stalls, watcher stopping, missing inputs, unasked overnight changes such as E8 and E9's pi-extensions change).
