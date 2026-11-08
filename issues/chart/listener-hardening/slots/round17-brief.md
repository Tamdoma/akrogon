# Round 17 (door A): is the warm-up the wrong design? Attack this hypothesis

Operator: "Is there any other solution to this? Maybe the current system is wrong in some way. Look at the potential systemic fix without necessarily needing to add new mechanisms that could easily break. But only if possible."

Context: round 12 (warm-up ended by claude's /clear turn), round 16 (warm-up reply flushed ~100 ms after `done`, no later event). Both bugs come from the helper watching A's transcript from OUTSIDE right after the reset, racing the harness's writes. The round-16 candidates (heartbeat re-check, B's hc-message handshake) each add a mechanism to win that race.

## Door A's hypothesis (S1): stop observing from outside after the reset

Read `skills/chart-issues/SKILL.md:159-165` and `skills/chart-issues/scripts/door-reset.ts:108-155` on akrogon main.

1. The helper's post-reset checks duplicate a check fresh A already does. SKILL.md:163: fresh A continues only when "its own transcript path from `bun <skill-folder>/scripts/transcript.ts <A address>` differs from the path on that entry; an unknown path (`-`) never continues". It runs that inside its own turn, when its own start prompt is already persisted, so it cannot race a flush.
2. So the helper could be: wait for A's turn end, operator-input check (unchanged), reset keys, send the start prompt (enter once if unsubmitted). Delete the warm-up send, the code, `replySchema`, `answered`, the reply wait, the `code-lookup` / `differing-path` / `label` stages, and probably `transcriptByCode`/`resetCandidates` if nothing else uses them. One paid warm-up turn per handover goes too.
3. A failed reset then lands the start prompt in old A's conversation, whose own SKILL.md:163 check sees the same path and does not continue: the handover stays unconsumed, visible in the conversation instead of in the log. Same end state as today's helper stop.
4. Label: `transcriptFor` relabels whenever the process names its conversation (claude record, codex open rollout, agy lock), so fresh A's own transcript.ts call sets it.

## Weak spot door A sees: pi

`src/transcript.ts` `fromProcess` answers pi from argv `--session-id`, which names the pre-`/new` file forever, and a process-named path beats the label. So either today's pi handover is already broken end to end (the helper labels the new file, then fresh A's transcript.ts call relabels the old one and the SKILL.md:163 check fails), or I misread it. A pi door started without `--session-id` resolves null and falls back to the label, which under S1 nobody would set. Candidates: the start prompt carries a helper-generated code and transcript.ts finds the file holding it (the start prompt is persisted before fresh A's tool call runs); or the script reads the harness's own per-tool-call env when the caller is the seat itself (B round 16: `PI_SESSION_FILE`, `CLAUDE_CODE_SESSION_ID`, `CODEX_THREAD_ID`, `ANTIGRAVITY_CONVERSATION_ID`).

## Questions

1. Attack S1. What does the outside warm-up protect that S1 loses? Look for a concrete failure: start prompt typed while claude's `/clear` turn runs, codex/pi/agy `/new` timing, `send`'s `started` meaning right after a reset, operator input between input check and send, a reset that half-happened, the watcher's steer check relying on the label (skills/watch-issues/SKILL.md:44), usage/seat records.
2. Confirm or refute the pi finding with file:line, and give the smallest fix that keeps S1 (or shows S1 cannot work for pi).
3. If S1 is wrong, is there another design that removes the race class instead of adding a mechanism? Old herdr-era helper for comparison: `git show af28d63e^:skills/chart-issues/scripts/door-reset.ts`.
4. Verdict: S1, heartbeat, handshake, or other, with what each removes and adds.

Read-only. Write round17-<letter>.md with file:line. Reply with the path.
