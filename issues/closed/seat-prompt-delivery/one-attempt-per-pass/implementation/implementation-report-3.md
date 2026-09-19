# Implementation report 3: session-file and one-attempt dispatchSlot

All criteria green under the changed-tests command.

Changed files and reasons:
- src/session-file.ts (new): sessionFile path/id resolution and deliveredAfter exact user-text check past offset, partial tail ignored, missing file absent.
- src/next.ts: rewrote dispatchSlot straight-line per brief section 4. One agent start and one agent prompt per pass, delivery_error recording with offset only for timeout settlement miss, charge on failure only, third failure fails in-pass, unreachable fails without throw, success clears error and resets attempts.
- tests/next.test.ts: 17 new tests for criteria 1-6 plus criterion-7 rewrites. Successful prompts now expect attempts 0. Resumed tab creation and stale prompt rewritten to fail after three failing passes. Blocked start charges nothing.

Tests run:
- `export AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090 && bun test --changed="$AKROGON_BASE"` -> 265 pass, 0 fail, 2344 expects, 11 files, 66.24s.
- `bun run typecheck` -> clean.
- `bun run format` -> clean (reformatted tests/next.test.ts only).

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
265 pass, 0 fail
```

Known limitations: none known.
Unverified criteria: none.
