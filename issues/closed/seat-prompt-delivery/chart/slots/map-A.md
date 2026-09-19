# Map A · seat prompt loss fails a leaf in 22 seconds

## Evidence
- pi-extensions issues/log.jsonl: check.review entered 07:38:34 by slot B; failed 07:38:57 with attempts A:1 B:3; operator recovery 07:42:23; failed again 07:42:45 with B:3 and verdict A:nits.
- Slot A pane wB:p13 had no agent: fresh pi started 07:38:39, prompt landed 07:38:42 (session 07-38-39 jsonl). Slot B pane wB:p14 held the implementer's live pi (session 07-14-54): no check-issue message in that jsonl, input box empty. The three prompts never entered pi.
- herdr docs cli-reference.mdx:305 and agent-automation.mdx:76: `agent prompt --wait` submits immediately; a caller `--timeout` of five seconds or less returns the normal `timeout` error instead of `agent_prompt_stalled`; `agent_blocked` and `agent_not_ready` are returned before any input is sent. akrogon passes exactly `--timeout 5000` (src/next.ts:430-434), so it can never see the stall code, and a pre-send rejection leaves nothing in pi, which matches the empty session.
- Probe 2026-09-19 ~09:58: the same pane, same arguments, benign prompt: `agent_prompted`, status working, message present in the jsonl. The condition was transient and tied to the moment after B's own turn ended, and again during the recovery window.
- src/next.ts:369-445: `while (true)` retries a retryable error with no pause; `attempts[slot]` is shared by agent start and prompt; cap 3 at :383; the herdr error is `console.warn` only at :441; `retryableCodes` :348-355 include `timeout`, `agent_blocked`, `agent_not_ready`.

## Root-cause hypotheses
- H1 pre-send rejection (`agent_not_ready` or `agent_blocked`) while akrogon's own read said idle: two status reads disagree at turn end (pi's herdr-agent-state report vs herdr's readiness). Verify: persist the code (fork Q1) and reproduce by prompting a pi within a second of its turn end.
- H2 `timeout` at exactly 5 s because pi with a large session takes longer than 5 s to report working. Verify: same, plus a timeout above 5 s.
- H3 input swallowed by an extension: ruled out for the two `input` handlers (subagents needs `sa-N:`, request-user-input needs a pending batch).

## Forks
- Q1 Persist the cause: the last herdr error code and message go into `failure.reason` via the failed-with-cause shape (cause attempts) and into log.jsonl. Contract addition to a running leaf is new intake: new leaf, ordered after failed-with-cause.
- Q2 Pacing without a clock: one dispatch attempt per `akrogon next` pass; a retryable error records the attempt and returns; the next event-driven pass retries. No sleep, no loop. vs keep the loop with a fixed delay (a hidden clock, foreclosed by the lock).
- Q3 Budget: separate `attempts` for start and prompt vs one budget with the per-pass pacing. With Q2, one budget is enough: three separate passes must fail before the leaf fails.
- Q4 Timeout: raise the prompt `--timeout` above 5000 so herdr returns `agent_prompt_stalled` vs keep 5000 and lose the distinction. Small, and it changes what Q1 records.
- Q5 One unreachable seat: fail the leaf with reason "seat B unreachable: <code>" (resumable via failed-with-cause, visible via failure-attention) vs hold the leaf waiting for B (a wait, foreclosed).

## Pitfalls
- A retryable error must never re-send a prompt that may have landed; with pre-send codes it is safe, with `timeout` the text may be in pi (the 09:58 probe shows a timeout can still deliver). Record `prompted` only on success today; after Q2 the next pass observes the pane first, so a landed prompt shows as working and is not re-sent.
- Do not add a watchdog to detect the stall; the next pass is the retry.
- failed-with-cause is in flight in w8:pA0; its stop shape is the interface, not to be edited.
