# Provider-death round, slot C (blind)

Paths: `AK` = /home/ivan/Work/infra/akrogon, `PI` = ~/.pi/agent/extensions/tamdoma-subagents, `CORE` = PI/node_modules/@earendil-works/pi-coding-agent/dist/core, `DOCS` = ~/.local/share/mise/installs/pi/0.99.1/pi/docs, `U11` = ~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-emdash-conversion-u11--.

## Shared evidence (read 2026-10-01)

- E1. The overload lasted at least 9m07s. First 503 at 22:30:59Z (`U11/2026-09-30T22-09-33*.jsonl` entry 253), last seen 22:40:06Z (`U11/2026-09-30T22-40-04*.jsonl` entry 5). It was intermittent: the second run got calls through between 22:34:07 and 22:38:24 and still died.
- E2. One death is 4 errors in 22 seconds: 22:30:59, 22:31:05, 22:31:12, 22:31:22 (same file, entries 253-259). That is 3 retries at 2s, 4s, 8s plus about 3s per failed request. It matches the defaults `retry.maxRetries` 3 and `retry.baseDelayMs` 2000 (`DOCS/settings.md:124-125`).
- E3. `~/.pi/agent/settings.json` has no `retry` key. Children build settings from the same agent directory (`PI/child-session.ts:583`), so one global setting covers seats and workers.
- E4. The 503 text contains "overloaded", which the retryable pattern lists first (`PI/node_modules/@earendil-works/pi-ai/dist/utils/retry.js:20-22`). This closes the "not verified" item in my map.
- E5. Delay is `baseDelayMs * 2 ** (attempt - 1)` (`CORE/agent-session.js:2298`). pi 0.99.1 caps it at `retry.maxAgentDelayMs`, default 60000 (`DOCS/settings.md:126`, CHANGELOG.md:253). The copy under `PI/node_modules` is 0.85.1 and has no cap (no `maxAgentDelayMs` in `CORE`). Which copy runs inside a child is not verified. See V1.
- E6. The first U11 run had worked 21 minutes when it died (22:09:33 to 22:31:22). The 3 hours came later, on the devin run. So a fresh worker loses minutes of context, not hours. This weakens my rebuttal R4.

## Q1. How long does pi retry an overload, and where is that set?

Today pi gives up after about 22 seconds (E2) against an overload of 9 minutes or more (E1). The budget is three keys in `~/.pi/agent/settings.json` and applies to seats and workers alike (E3). No akrogon file is involved.

Research: practitioner · Marc Brooker, AWS Builders' Library, "Timeouts, retries, and backoff with jitter" (aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter, 2026-10-01; the page did not render, read through the Lumigo summary at lumigo.io/blog/amazon-builders-library-in-focus-1-timeouts-retries-and-backoff-with-jitter) · use capped exponential backoff, retry at one layer of the stack only, retries add load to an overloaded server · keeps `retry.provider.maxRetries` at 0 and puts the whole budget in the agent layer.
Research: primary docs · Claude Code env vars (code.claude.com/docs/en/env-vars, 2026-10-01) · default 10 retries. `CLAUDE_CODE_RETRY_WATCHDOG=1` is "for unattended sessions" and "retries 429 and 529 capacity errors indefinitely", with other transient errors at 300 retries, "roughly three hours of backoff" · an unattended harness waiting out an overload for hours is an accepted vendor practice. It moved my recommendation from 30 minutes to 60.
Research: primary docs · Codex config reference (learn.chatgpt.com/docs/config-file/config-reference, 2026-10-01) · `request_max_retries` default 4, `stream_max_retries` default 5 · pi's default of 3 is normal for attended use. The defect is using an attended default overnight.
Research: primary docs · `DOCS/settings.md:131` · "Keep `retry.provider.maxRetries` at `0` unless provider-level retries are required" · confirms the single layer.

Values use `baseDelayMs` 5000 and `maxAgentDelayMs` 60000. Delays run 5, 10, 20, 40, then 60 seconds each. Wait = 75s + 60s x (maxRetries - 4), plus about 3s per attempt.

- 1a (recommended). `"retry": {"enabled": true, "maxRetries": 64, "baseDelayMs": 5000, "maxAgentDelayMs": 60000}`. Total wait 61m15s. That is over 6 times the observed overload. Cost: a worker on a dead provider holds its wave slot for an hour before it fails. Load on the provider is one request a minute per worker.
- 1b. `maxRetries` 34. Total wait 31m15s. Over 3 times the observed overload. Cheaper slot hold, less margin.
- 1c. `maxRetries` 244. Total wait 4h01m. Covers most of a night. A hard outage then looks like work for 4 hours.
- 1d. No change (B's rebuttal F3 position: the retries worked as designed). Every overload longer than 22 seconds kills the worker. Rejected by E1.

Pitfalls:
- If children run the 0.85.1 code (E5), the delay is uncapped. Attempt 20 would sleep 30 days. This must be settled by V1 before any value above about 8 is set.
- pi has no jitter. Three workers of one wave retry in step. At one request a minute this is harmless.
- The counter must reset after a success, or a long worker spends its budget across unrelated blips. Not verified, see V1.
- The retry sleep is inside the API client. I read it as outside the no-clocks lock. The operator has not confirmed that reading (fork Carries).
- akrogon's `STALL_MS` is 60 minutes (`AK/src/next.ts:183`). A seat retrying for 61 minutes can cross it. I did not check what that constant triggers today.

## Q2. How does A recover a dead worker without writing a remainder brief?

`AK/skills/implement-issue/worker-protocol.md:17` makes A list what the brief still owes and write a new sub-brief, "never the original brief again". For a provider death the original brief is still correct, and the retained worktree holds the work. pi has no tool to continue a failed child (`PI/tools.ts:140-242`: spawn, wait, cancel, check, list, reply).

Research: primary docs · `DOCS/sessions.md:10-14,54` · pi continues a saved session with `--continue`, `--resume` or `--session <path>` · resume from the transcript is possible in pi, but the subagent extension always calls `SessionManager.create` (`PI/child-session.ts:691`), so it needs new code.
Research: primary code · `CORE/agent-session.js:2305-2309` · pi's own retry drops the error message from agent state and continues · a session that ended on a provider error is a state pi already continues from.
Research: training knowledge · no practitioner source found for "resume versus restart from repo state" in agent harnesses (searched AWS Builders' Library, Codex and Claude Code docs) · the choice rests on E6.

- 2a (recommended). Change the one sentence. A provider-failed worker is relaunched in its retained worktree with its original brief and one fixed extra line: "A previous worker died here. Start from `git status` and `git log`, keep what is correct, finish the brief." Turn-budget and output-limit stops keep the remainder rule, because there the brief was too large. Cost: the new worker rereads the code, about 20 minutes on U11 (E6). Works on every harness.
- 2b. pi-extensions adds `subagent_resume` that reopens the failed child's transcript. Keeps full context. Cost: a new tool, a new child state path, tests, and a second repo in this chart. Only pi gets it.
- 2c. 2a now, 2b as a later pi-extensions leaf.

I recommend 2a alone. With 1a, deaths become rare, and E6 shows the context loss is small. 2b is promoted if a provider death recurs after 1a lands and the rerun costs more than an hour. This revises my rebuttal R4.

Pitfalls:
- The new worker may trust a half-written edit. The fixed line must say "keep what is correct", as brief-11r did ("no blind revert, no blind keep").
- A must still tell a provider death from a budget stop. The failed result carries the 503 text (`PI/completion.ts:200-205`), so A reads it from the return.

## Q3. Should workers commit as steps land?

Today a worker makes one commit for its chunk and returns one commit ID, and A cherry-picks it (`AK/skills/implement-issue/worker-protocol.md:11`). U7 died with 1,270 uncommitted lines (#46).

Research: primary code/docs · `worker-protocol.md:11,17` · the worktree is retained on death, so uncommitted work is not lost · the only gain from step commits is a cleaner starting point.
Research: training knowledge · no practitioner source searched for this question.

- 3a (recommended). No change. Under 2a the next worker continues in the same worktree, and a dirty tree serves it as well as commits do. U5, U7 and U11 were all recovered from dirty trees.
- 3b. Workers commit after each green step. A picks a range per worker. Cost: the pick step changes, and partial commits can land red.
- 3c. Workers commit steps, then squash to one commit before returning. Keeps the pick step. Cost: one more rule every worker must follow.

This reverses my map Q7. My rebuttal R6 named the pick cost, and 2a removes the need.

Pitfall: with 3a, a successor that damages good uncommitted work leaves no way back. No case of that is on record.

## Q4. What happens when the same unit dies on the provider again?

U11 died, U11r died 7 minutes later, and a third run was started (E1). Nothing in the protocol bounds this. Under 1a each death already means the provider was down for an hour.

Research: operator rule (fork Carries) · "retry with warnings, then raise the last error with full context" · after the retry budget, the error is raised, not swallowed.
Research: primary docs · Claude Code `CLAUDE_CODE_RETRY_WATCHDOG` (same page as Q1) · the alternative practice is to wait without limit.
Research: lock · red-criterion 2a and `AK/skills/implement-issue/SKILL.md:31` · a blocker the seat cannot clear ends the pass `failed` with the operator action named.

- 4a (recommended). One rerun (2a). A second provider death of the same unit ends the pass `failed`. The reason names the provider, the error text and both transcripts, and the operator action is "switch provider or wait". With 1a that is about 2 hours of outage before the leaf stops. Cost: a failed leaf waits for the operator.
- 4b. Rerun without limit. The leaf never fails and resumes by itself when the provider returns. Cost: a dead provider or a revoked key looks like work all night, and nothing tells the operator.
- 4c. On the second death the worker moves to a fallback model in pi-extensions. No stall. Cost: a fallback path, which the operator's coding rules forbid unless requested, and a model the leaf was not planned for.

Pitfalls:
- 4a still stalls the leaf overnight in a 2-hour outage. Only 4c avoids that. The operator did exactly 4c by hand (stop-note.md), so this is the question to put to the operator plainly.
- Seat A runs on the same provider. If A itself dies, an idle seat whose phase did not move is prompted again (`AK/src/next.ts:410-416`). The fork should say whether that counts toward 4a. I recommend no: 4a counts worker deaths of one unit only.

## What I would verify with a real call before handoff

- V1 (blocks Q1). Register a local custom provider (`DOCS/custom-provider.md`) backed by a small server that returns the exact meta 503 body N times and then a normal reply. Set the 1a values with `maxRetries` 6 for the test. Run one seat (`pi --model local/x -p "say ok"`) and one subagent child. Read the session files for: attempt count, the gaps between errors (must stop growing at 60s, which proves the cap applies to children), and a second burst after a success (proves the counter resets). Record pi version, date, command, result, and delete the provider entry after.
- V2 (Q2). In a scratch repo, spawn a worker, kill the stub provider mid-run so it fails, then relaunch with the same brief plus the fixed line in the same worktree. Check that it finishes and returns the four report contents.
- V3 (Q4). With the stub returning 503 forever and `maxRetries` 2, confirm the parent receives `failed` with the error text and transcript path for both deaths.
- Limits: the stub proves pi's behavior, not that meta's overloads stay under 61 minutes.

## Challenge check

- Is the retry budget the real fix, or a guard? It removes the observed failure: every death on record was a 22-second budget against a 9-minute overload. Q2 to Q4 handle what is left.
- Does 1a break the no-clocks lock? Open. It is a client retry, not an akrogon timer, but it is an elapsed wait. The operator should confirm.
- Am I recommending 2a because it is cheap? Partly. E6 is the evidence: 21 minutes lost, not 3 hours. If the operator weights context loss higher, 2c is the answer.
- Weakest point: 4a conflicts with "doesn't get stuck over night" in a long outage. 4c is the only option that keeps moving, and it needs the operator to ask for a fallback.
- Not verified: which pi core runs in children (E5), counter reset, what `STALL_MS` triggers, and the AWS article text itself (read through a summary).
