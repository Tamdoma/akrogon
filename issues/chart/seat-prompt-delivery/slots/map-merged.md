# Merged map · seat prompt loss (dispatch)

## Evidence
- (both) log.jsonl: failures at 07:38:57 and 07:42:45, B attempts 3 both times, A's nits verdict in the second. (A) A's pane got a fresh pi at 07:38:39 and its prompt at 07:38:42; B's pane held the implementer's live pi and has no review message; input box empty. (A) A benign probe at ~09:58 with the same arguments landed; the condition was transient.
- (both) akrogon passes `--timeout 5000`, so herdr returns plain `timeout`, never `agent_prompt_stalled` (cli-reference.mdx:305; B: wait.rs:232-246, 632-655). `agent_blocked` and `agent_not_ready` are returned before any input is sent, which matches the empty session.
- (B) E3: log.ts:12-15 prefers HERDR_PANE_ID, so the log line for B's failure names A's session; keep caller and target identities apart.
- (both) dispatchSlot: one counter charged before start or prompt (:383-388), immediate `continue` on retryable failure (:406-409, :440-444), `prompted` only on success (:429-436), error discarded (:441). (B) commitMove clears done/verdict/prompted/attempts on every move (phase.ts:26-34), so a failure discards A's verdict.
- (A) input handlers ruled out: subagents needs `sa-N:`, request-user-input needs a pending batch.

## Hypotheses (open, all need the persisted code)
- (both) H1 pre-send rejection while akrogon's own read said idle: two status sources disagree at turn end.
- (both) H2 timeout at exactly 5 s with a large session.
- (B) H3 delivery landed but acknowledgment late (less consistent with the empty session).

## Forks
- K1 pacing (both): remove the tight resend loop; a retryable failure records its evidence and returns; the next event pass or timed pass retries after observing the pane fresh. (B) an ambiguous `timeout` is never blindly resent; a definite pre-send rejection may retry once immediately. (A) simpler: never retry inside a pass. Foreclosed: sleeps, a watcher.
- K2 budget: (B) split start and prompt accounting, no precharge before a defined outcome; (A) one counter is enough once a pass makes at most one attempt, since three passes must fail. Presented to the operator.
- K3 evidence (both): persist the last herdr error (operation, target pane and session, phase, slot, exit code, code, message) before returning, and carry it into `failure.reason`; caller identity separate (E3). Foreclosed: generic "attempts exhausted" alone.
- K4 unreachable seat: (B) preserve A's verdict as a checkpoint and re-deliver only B; on recovery reuse A's verdict only if head and artifacts match. (A) simpler: fail visibly with reason "seat B unreachable: <code>", whole-phase restart on recovery, chosen openly. Presented to the operator.
- (A) timeout above 5 s so herdr's stall code is observable; (B) a longer deadline is not proof of receipt. Both: it only changes what K3 records.

## Ownership
- (both) new akrogon leaf(s) after failed-with-cause and failure-attention; their emitted contracts are interfaces, not edited. (B) herdr or pi transport fix only after a same-version reproduction; no fallback input path in akrogon.

## Operator answers 2026-09-19 (round 1)
Verbatim: "1a | 2a | 3a". Taken: Q1-A one attempt per pass, pre-send rejections retry next pass, timeout checked against the seat session file before resend, three failed passes fail the leaf. Q2-A one attempt counter. Q3-A unreachable seat fails the leaf with reason naming the seat and code; recovery restarts the phase for both seats.
