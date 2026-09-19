# Intake: seat-prompt-delivery

## Scope
akrogon's dispatch of a seat prompt: how many times one pass tries, what a retryable herdr failure leaves behind, when a leaf fails for undeliverable prompts, and what the failure record says. Owns no GitHub identity; the observation was made by the operator and A in this pass. The seat side (why a pi pane rejected input) is not charted here; no same-version reproduction exists.

## Provenance
- Operator: 2026-09-19, this chart-issues pass, answer to the handoff question: "operator note no seeding needed. We need to resolve it".
- Agent observation (A, this pass): issues/log.jsonl entries at 07:38:57 and 07:42:45 on 2026-09-19 for leaf failed-with-cause (later merged by hand), slot B attempts 3 both times; the B pane held a live pi with an empty input box and no check-issue message in its session file; the same pane took the implement prompt at 07:21 and a benign probe at ~09:58.

## Source: operator note, verbatim
"operator note no seeding needed. We need to resolve it"

## Agent findings
See `slots/map-merged.md` (A and B maps, B rebuttal, operator round-1 answers). Dispatch code on origin/main `src/next.ts:348-428` (`dispatchSlot`): a `while (true)` loop charges one attempt before start or prompt, `continue`s immediately on a retryable herdr error, sets `prompted` only on success, and at three attempts moves the leaf to `failed` with reason `attempts exhausted` (:362-368). The prompt call passes `--timeout 5000`, so herdr returns `timeout`, never `agent_prompt_stalled`. `agent_blocked` and `agent_not_ready` are returned before any input is sent. `src/log.ts:12-15` prefers the caller's `HERDR_PANE_ID`, so the log line for a B failure names A's session.
