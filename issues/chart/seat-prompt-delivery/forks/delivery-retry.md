# Prompt delivery retry

## Question

### Q1 · Pacing: does one `akrogon next` pass make at most one delivery attempt per seat, leaving a retryable failure for the next pass, or keep the immediate resend loop?
Recommended A: one attempt per pass. A pre-send rejection (`agent_blocked`, `agent_not_ready`, a retryable `agent start` failure) is retried on the next pass after the pane is observed fresh. An ambiguous `timeout` is never blindly resent: the pass checks the seat's session file for the unique prompt line before counting the prompt as undelivered. Three failed passes fail the leaf. Foreclosed: sleeps, a watcher, a longer immediate loop.
B: keep the loop but split start and prompt accounting.

### Q2 · Budget: one attempts counter per slot, or separate start and prompt counters?
Recommended A: one counter, since a pass makes at most one attempt and three passes must fail. B: split counters with no precharge before a defined outcome.

### Q3 · Unreachable seat (non-retryable herdr error): fail the leaf visibly, or preserve the peer's verdict and re-deliver only the failed seat?
Recommended A: fail the leaf with reason `seat <slot> unreachable: <code> <message>`; recovery restarts the phase for both seats (commitMove already clears done, verdict, prompted and attempts on every move). B: checkpoint the peer's verdict and reuse it on recovery when head and artifacts match.

### Carries
- Related: `../../closed/noninteractive-leaf-execution/failed-with-cause/brief.md` (failure record shape, reason text), `../../closed/noninteractive-leaf-execution/failure-attention/` (failed announcement). Both merged; their contracts are interfaces here, not edited.
- Lock: no clocks, no watchers, no automatic pass (operator 2026-09-18 and 2026-09-19).

## Findings
- (both) `dispatchSlot` (origin/main src/next.ts:348-428): one counter charged before start or prompt; immediate `continue` on retryable failure; `prompted` set only on success; the herdr error is discarded after a `console.warn`.
- (both) `--timeout 5000` makes herdr return `timeout`, never `agent_prompt_stalled`; `agent_blocked` and `agent_not_ready` precede any input.
- (B) `src/log.ts:12-15` prefers `HERDR_PANE_ID`, so a B failure is logged under A's session; caller and target identities must be kept apart in any recorded evidence.
- (B) commitMove clears done/verdict/prompted/attempts on every move, so a failed delivery to B discards A's verdict.
- (A) The seat side: the same pane accepted a prompt before and after the incident; the condition was transient; input handlers (subagents `sa-N:`, request-user-input pending batch) ruled out.

## Taken
2026-09-19 operator: "1a | 2a | 3a". Q1-A one attempt per pass, pre-send rejections retry next pass, `timeout` checked against the seat session file before a resend counts, three failed passes fail the leaf. Q2-A one counter. Q3-A unreachable seat fails the leaf with a reason naming the seat and code; recovery restarts the phase for both seats.

## Measurements
None.
