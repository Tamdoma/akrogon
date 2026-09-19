# Implementation report 4: status note and docs

All criteria green under the changed-tests command.

Changed files and reasons:
- src/status.ts: note() adds one `<slot> prompt <code>` token per seat with delivery_error and busy_since unset, placed after done, before attempts; existing token order unchanged.
- tests/status.test.ts: new test writes delivery_error via saveState and asserts idle shows token, mixed busy shows only idle seat token plus busy, busy seat hides token, legacy shows no prompt.
- docs/reference-index.md: Command line names one attempt per pass with timeout settlement.
- src/AREA.md: Non-obvious patterns bullet names one attempt per pass per seat and timeout settlement via the seat session file; file stays 4 sections, 28 lines.

Tests run:
- `export AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090 && bun test --changed="$AKROGON_BASE"` -> 266 pass, 0 fail, 2352 expects, 11 files, 64.48s.
- `bun test tests/status.test.ts -t 'delivery errors surface'` -> red before fix (NOTE ""), pass after.
- `bun run typecheck` -> clean.

Pasted results tail:
```
(pass) retryable prompt failure charges one attempt, records delivery_error, and sends one prompt
(pass) three consecutive prompt failures fail the leaf during the third pass
(pass) a successful prompt between failures resets attempts
(pass) a pass that starts the agent then observes it not idle charges nothing
(pass) timeout settlement records delivery when exact user text lands after the offset
(pass) timeout settlement ignores the same text before the offset
(pass) timeout settlement ignores prompt text inside assistant and tool records
(pass) timeout settlement ignores a trailing partial line but keeps earlier records
(pass) a record appended after a timeout is recognized by the next pass without resending
(pass) timeout with a missing session file records a plain error without offset
(pass) timeout settlement resolves id-kind references under HOME
(pass) timeout with an unresolvable id records a plain error without offset
(pass) a retryable agent start failure charges once without prompting, then recovers
(pass) a non-retryable prompt code fails unreachable without throwing and siblings still dispatch
(pass) non-JSON prompt stderr fails unreachable with exit code and trimmed message
(pass) malformed prompt error JSON fails unreachable with exit code
(pass) a successful prompt clears delivery_error and resets attempts
266 pass, 0 fail
```

Known limitations: none known.
Unverified criteria: none.
