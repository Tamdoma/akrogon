# Provider-death rebuttal C (disagreements only)

Line numbers refer to the Findings section of ../forks/provider-death.md.

R1. Q4 (line 16) hides the one real operator decision. 4a stops the leaf after about 2 hours of outage, and it then waits for the operator all night. That conflicts with the verbatim intent in Carries ("doesn't get stuck like this over night"). The merge records 4c as my aside. It should be a question on the operator screen: accept a `failed` leaf in a long outage, or request a fallback worker model. The operator did 4c by hand that night (framework `emdash-conversion/implementation/stop-note.md`).

R2. Q1 (line 13) drops my `STALL_MS` pitfall. `src/next.ts:183` sets `STALL_MS` to 60 minutes and my 1a waits 61m15s. I did not check what that constant triggers today. Until someone does, 1a should either use `maxRetries` 60 (57m15s, under the constant) or the fork should state that crossing it is harmless.

R3. A's reason on line 13 is too strong. "Nothing else can progress while the provider is down" holds for seat A and its workers only. Seat B runs codex on another provider (`akrogon config` slots), so reviews and merges of other leaves continue. The cost of a long retry is one held wave slot, which still supports the long budget. The stated reason should be that one.

R4. Probe list (line 18) folds my V3 into V1 and omits V2. V2 is the only probe of the Q2 change: kill the stub mid-run, relaunch the same brief with the fixed line in the same worktree, and check that the worker finishes and returns the four report contents. Without it 2a goes to handoff unproven, against the Take operation-proof rule (`skills/chart-issues/SKILL.md:53`).

R5. Q2 (line 14) says 2b is "deferred" with no trigger. My round gave one: promote 2b when a provider death recurs after the Q1 raise lands and the rerun costs more than an hour. Without a trigger, deferred means dropped. Record it under Off route with that promotion evidence.

R6. Q2 misses how A tells a provider death from a turn-budget or output-limit stop. The rule now branches on that. The failed result carries the error text (`tamdoma-subagents/completion.ts:200-205`), and the changed sentence should say A reads the cause from the return.

R7. Q4 misses the seat case. Seat A is on the same provider. When A itself dies, the idle seat is prompted again (`src/next.ts:410-416`). The fork should say whether that counts toward the "second death" in 4a. I recommend no: 4a counts worker deaths of one unit only.

R8. Minor, line 7: pi has no jitter, so the 3 workers of one wave retry in step. Harmless at one request a minute, but it belongs next to the Brooker citation, since jitter is half of that source's advice.

No other disagreements. The evidence lines, 2a, 3a and the 4a mechanism match my round.
