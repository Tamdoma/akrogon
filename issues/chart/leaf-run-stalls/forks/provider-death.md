# Provider death of a worker or seat

## Question
Q1. How long should pi keep retrying a provider overload (503 `service_overloaded`) before a worker or seat gives up, and where is that set?
Q2. When a worker still dies on a provider error, how does A recover it without hand-writing a remainder brief?
Q3. Should workers commit as their steps land, so a death leaves commits instead of an uncommitted tree?
Q4. What happens when the same unit dies on the provider again, given the operator's goal of no overnight stalls?

### Carries
- Intake: ../INTAKE.md (#46 verbatim, operator note).
- Map: ../slots/map-merged.md M3, rebuttals ../slots/map-rebuttal-B.md F3, ../slots/map-rebuttal-C.md R4-R6.
- Lock: no clocks, watchdogs, polling or elapsed triggers (issues/chart/seat-stall-detection, stuck-seat-recovery). A retry inside an external API client is not such a clock (C Q5 reading, unconfirmed by the operator).
- Lock (red-criterion 2a): an unmeetable criterion ends the pass `failed`, using the existing failed path.
- Operator intent, verbatim: "The intent is to have a smooth implementation process that doesn't get stuck like this over night, because I lose hours and hours."
- User rule for external APIs: retry with warnings, then raise the last error with full context.

## Findings
Exchange: blind rounds ../slots/provider-death-B.md and provider-death-C.md. A worked independently from the session logs and the SDK. Merged below, with rebuttals in ../slots/provider-death-rebuttal-*.md.

Evidence
- (A,B,C) One U11 death = 4 x 503 in 22s (22:30:59, :05, :12, :22), matching pi defaults `retry.maxRetries` 3 and `baseDelayMs` 2000 (pi docs/settings.md:123-129). `~/.pi/agent/settings.json` has no `retry` key. Children load the same agent dir (tamdoma-subagents/child-session.ts:583), so one setting covers seats and workers.
- (C) The overload lasted at least 9m07s and was intermittent (22:30:59 to 22:40:06Z). The 503 text matches pi's retryable pattern (pi-ai/dist/utils/retry.js:20-22).
- (A,B,C) pi 0.99.1 caps the delay at `retry.maxAgentDelayMs` (default 60s). The extension's local SDK copy (0.85.1) has no cap (agent-session.js:2297). pi docs/packages.md:79-88 says the host supplies `@earendil-works/pi-coding-agent` to extensions (A), so the cap most likely applies, but it is unproven. Uncapped, 12 retries would sleep 2h16m and 20 would sleep 30 days (B, C). A real probe must settle this before any raise.
- (C) The first U11 worker had run 21 minutes when it died. The 3h was the later devin run. A fresh rerun loses minutes of context, not hours.
- (B,C) No pi tool continues a failed child (tools.ts:140-242). pi itself can resume sessions (`--session`), but the extension always creates a new session (child-session.ts:691).
- Outside practice: Marc Brooker, AWS Builders' Library "Timeouts, retries, and backoff with jitter": capped exponential backoff, retry at one layer only (B, C). Claude Code `CLAUDE_CODE_RETRY_WATCHDOG` retries capacity errors indefinitely "for unattended sessions" (C, code.claude.com/docs/en/env-vars). Codex defaults are 4 request and 5 stream retries (C). Pi's 3 is an attended default used overnight.

Merged recommendations
- Q1 (A,B,C) raise the budget in settings.json, keep `retry.provider.maxRetries` 0, after probe V1. Size disagreement: B `maxRetries` 12 / base 2s, about 8 min. C `maxRetries` 64 / base 5s, about 61 min. A sides with C: nothing else can progress while the provider is down, and dying costs a rerun.
- Q2 (A,B,C) 2a: relaunch a provider-killed worker in its retained worktree with the original brief plus one fixed line ("A previous worker died here. Start from `git status` and `git log`, keep what is correct, finish the brief."). worker-protocol.md:17 changes for provider deaths only. Turn-budget and output-limit stops keep the remainder rule. pi-extensions resume (2b) is deferred.
- Q3 (A,B,C) 3a: no change. The retained dirty tree serves the rerun as well as commits would.
- Q4 (A,B,C) 4a: one rerun. A second provider death of the same unit ends the pass `failed` naming the provider, the error and both transcripts. C: only an operator-requested fallback model (4c) keeps moving through a long outage.
- Lock (B,C): the operator should confirm that backoff inside the API client is not a forbidden clock.
- Probe V1 (B,C): a local stub provider returning the meta 503 body N times, then success. Run a seat and a child. Check that the gaps stop at the cap, that the counter resets after a success, and that the parent gets `failed` + error + transcript on exhaustion. Record and clean up.

Rebuttals
- (B F1) Still 12 retries. Other providers keep working (seat B is codex), the observed overload was 9 minutes, and retries add load (Brooker p.4). C's budget with one rerun means about 2 hours of sleep before `failed`. (C R3) A's reason was too broad: the cost of a long wait is one held wave slot while other leaves continue on B. A keeps 1a on that reason.
- (C R2, closed by A) `STALL_MS` (src/next.ts:182,201) only sends one herdr "Busy leaf" notification after 60 minutes busy. Crossing it is harmless.
- (B F2) The rerun line must say: check what is already done (criteria, commits, evidence, external effects such as uploads) before repeating work, and the old worker must be gone before the new one writes. git status/log cannot show an upload. Probe the rerun on a dirty tree, an already-committed tree and a repeated external write.
- (C R6) A tells a provider death from a budget stop by the error text in the failed result (tamdoma-subagents/completion.ts:200-205). The changed sentence says so.
- (C R5) 2b trigger: open it as new intake if a provider death recurs after Q1 lands and the rerun costs over an hour.
- (C R1) 4a stops the leaf after about 2 hours of outage and it then waits all night. Only a fallback model (4c) keeps going. The operator did 4c by hand that night (framework emdash-conversion/implementation/stop-note.md). This is an operator question, not an aside.
- (C R7, B F3) Seat death is separate. A seat that exhausts its retries goes idle and is re-prompted by `akrogon next` after the 2-minute grace (src/next.ts:410-416). It does not count toward 4a. A dead seat cannot record `failed` itself, so probe seat exhaustion separately and record what `next` does.
- (C R4) Probes: V1 cap and counter reset (seat and child). V2 rerun in the same worktree finishes and reports (dirty, committed, external write). V3 exhaustion: the parent gets `failed` + error + transcript, and a seat's own exhaustion is followed by a re-prompt.
- (C R8) pi has no jitter, so workers in one wave retry together. At one request a minute this is harmless.

## Taken
Q1 1b, sized by the operator: at most 10 minutes. "I can't let it stay idle for an hour." Settings in `~/.pi/agent/settings.json`: `"retry": {"enabled": true, "maxRetries": 13, "baseDelayMs": 2000, "maxAgentDelayMs": 60000}`, with `retry.provider.maxRetries` left at 0. Waits are 2, 4, 8, 16, 32s, then 8 x 60s: 9m02s of sleep plus about 3s per request, about 9m45s. Choosing an in-client retry budget accepts that this wait is not a forbidden akrogon clock. Probe V1 (cap and counter reset in seat and child) is still required before handoff.
Operator question "is there a simple way to tell a real provider issue from something else": existing mechanism, nothing new. pi retries only errors whose text matches its provider pattern (overloaded, 429/500/502/503/504, rate limit, service unavailable, network and stream drops), and never quota, billing or context overflow errors (pi-ai/dist/utils/retry.js:4-78, agent-session.js:2248-2253). The counter resets after every successful reply (agent-session.js:408-416), so the budget is 10 minutes of the provider failing in a row. Other failures (a bad brief, failing tests, tool errors) are not provider errors and never use it. A reads the same error text from the failed result (tamdoma-subagents/completion.ts:200-205) to choose the Q2 path.
Q2 2a with B F2 safeguards: same worktree, original brief plus the fixed line (check what is already done, including commits, files and external effects; keep what is correct; finish the brief), after the old worker has ended. worker-protocol.md:17 changes for provider deaths only. 2b is off route with the C R5 trigger.
Q3 3a: no change.
Q4 4a: a second provider death of the same unit ends the pass `failed`, naming the provider, the error and both transcripts. With the Q1 budget that is about 20 minutes of outage. Seat deaths do not count, and probe V3 records what `akrogon next` does after a seat's own exhaustion.
Probes before handoff: V1, V2 (rerun on dirty, committed and external-write cases), V3.
Operation proof 2026-10-01, pi 0.99.1, local stub provider with the meta 503 `service_overloaded` body, an isolated `PI_CODING_AGENT_DIR`, scaled settings (`maxRetries` 4, `baseDelayMs` 1000, `maxAgentDelayMs` 2500). Full record: ../slots/probe-pi-retry.md.
- V1 seat: gaps 1.0, 2.0, 2.5s (capped). After a success the next burst restarted at 1.0s (counter reset).
- V1 child (tamdoma-subagents): gaps 1.0, 2.0, 2.5s. Children run the host's 0.99.1 core, not the extension's 0.85.1 copy.
- V2: a child spawned with `cwd` set to a same-repo git worktree ran there and returned `completed`.
- V3: an always-failing child made 5 attempts. The parent's `subagent_wait` result carried `status: failed`, the full 503 error text and an existing transcript path.
- Cleanup: stub stopped, scratch dir deleted, real extension files and `~/.pi/agent` untouched.
- Limits: not the production values (about 9m45s), not hangs, 429/529 or mid-stream errors, not the devin provider extension, not interactive seats or concurrent children. The V2 dirty, committed and external-write variants test the rerun worker's judgment against the added line, which a stub provider cannot prove. They stay a limit of the seat-exit-rules prose.
