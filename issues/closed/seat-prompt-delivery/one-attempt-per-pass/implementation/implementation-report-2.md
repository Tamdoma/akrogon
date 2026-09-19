# Implementation report 2: fake-herdr scripted failures and session-file support

Changed files and reasons:
- tests/fake-herdr.ts: added scriptEntrySchema plus startScript/promptScript with defaults, scriptedFailure helper for structured/raw stderr exit 1, kind id on agent start, append to path-kind session file on prompt before success or failure exit.
- tests/next.test.ts:236: added kind id to agent_session literal so it parses under paneSchema. Line 1492 needs no edit (null/undefined session, already valid).

Tests run:
- `export AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090 && bun test --changed="$AKROGON_BASE"` -> 248 pass, 0 fail, 2193 expect calls, 11 files, 54.45s.
- `bun run typecheck` -> clean (tsc --noEmit).
- Manual fixture checks via FAKE_HERDR temp db: start structured failure exits 1 with error JSON, saves, appends .calls, no pane mutation; start raw stderr exits 1; start success emits kind id; prompt append writes file on success (exit 0, prompts recorded) and on scripted failure (exit 1, .calls recorded); append ignored when kind is id; failPrompts with empty script still pushes then fails, missing script fields parse via defaults.

Known limitations: none known.

Unverified criteria: none.
