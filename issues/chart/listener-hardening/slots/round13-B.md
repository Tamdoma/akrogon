# Round 13 B

Verdict: changes needed. Reviewed `5431a0b78a7215cc4f251ab9bb411ff15047b893` in scratchpad/k4.

## F1: idle is checked before the asynchronous lookup

`skills/chart-issues/scripts/door-reset.ts:132` evaluates `idle(t)`, then awaits `transcriptByCode()`. That lookup awaits a fresh hc terminal read (`src/transcript.ts:214`). During it, Claude can move from reset-idle to warm-up-working and write its assistant reply before reporting warm-up completion. The predicate then accepts the reply using the old reset-idle snapshot. `waitFor()` processes events serially and returns that captured snapshot (`src/hc.ts:396,468–469`), so a queued working event cannot correct it before settlement.

Reproduced by importing the actual helper with memory-only hc/filesystem mocks: give its predicate a reset-idle snapshot, advance the live terminal to working during the awaited lookup, and expose the assistant nonce reply. Result:

```json
{"action":"predicate","accepted":true,"capturedStatus":"idle","liveStatus":"working"}
{"action":"label","liveStatus":"working"}
{"action":"start-prompt","liveStatus":"working"}
```

Re-read current terminal state after the reply proof succeeds, and require live idle/done before completing the wait. Add a controlled test holding the warm-up working after its assistant record is written while an earlier reset-idle lookup is pending. Neither labeling nor the start prompt should happen until warm-up idle.

## Other checks

The exact committed reply schemas accepted all 206 assistant records read from the real Codex rollout `~/.codex/sessions/2026/11/06/rollout-2026-11-06T12-12-04-01a1b08f-01f0-7372-b8e5-052bcb86926a.jsonl` (first matching record line 15), and all 105 assistant records read from pi's `~/.pi/agent/sessions/--home-ivan-Work-infra-akrogon--/2026-11-08T12-07-12-859Z_01a1bb0e-34db-72e7-b900-53464e9726b5.jsonl` (first matching record line 6). Claude's actual nonce reply was accepted while its user, last-prompt and api-request-blob copies were rejected.

`tests/door-agent.ts:129–159` now gates reset completion on the next input and emits a separate reset work/idle cycle. That reproduces the original counter race. It does not cover F1: the fake writes its assistant record and idle status together without a controllable gap (`tests/door-agent.ts:118–119`).

Full `tests/door-reset.test.ts`: **9 pass / 0 fail**. The test terminal was removed. No live inputs, labels or implementation files were changed.

## Re-check of 5b94fee6

Verdict: ready. F1 is fixed at `skills/chart-issues/scripts/door-reset.ts:137`: current terminal status is read after the reply proof succeeds.

Re-ran the controlled in-memory probe against the actual helper. With a captured reset-idle snapshot and live warm-up-working state, the predicate now returns false and performs no label write or start send. After warm-up idle, it returns true and both actions occur while idle. `tests/door-reset.test.ts`: **9 pass / 0 fail**. Temporary test resources were removed. This verdict covers F1 only.
