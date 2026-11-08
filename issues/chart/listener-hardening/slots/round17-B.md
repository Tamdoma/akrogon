# Round 17 B

Verdict: **S1 with an authoritative self-identity check and the pi resolver fix. Not S1 unchanged.** It removes more failure paths than heartbeat or the handshake I proposed in round 16. The warm-up is not required if the actual continuation turn verifies its own identity before doing chart work.

## Attack on S1

- **F1: The outside check is not purely a duplicate.** Today a failed reset cannot receive the start prompt: the helper requires a different transcript before sending it (`door-reset.ts:142–151`). Under S1 the old conversation deliberately receives that prompt and must refuse it itself. That moves the failure barrier from code into the skill's entry procedure. `SKILL.md:163` must apply to **every handover continuation request**, including one received by old A, and run before Open, mutations, a new span or seat entry. Saying only “a fresh session” leaves the failed-reset recipient outside the stated case. The unconsumed Mode entry is then the failure evidence. The helper's “sent” log must not be presented as reset confirmation.
- **F2: Pi really breaks the current continuation check.** `piStart()` uses the startup `--session-id` (`src/transcript.ts:146–149`). Its answer beats the helper's new label and overwrites it (`:210–215`). A memory-only probe against the actual resolver, with both `PI_SESSION_FILE` and the label naming the new session, returned the old file and relabeled it old. Thus today's successful helper test is not an end-to-end proof that fresh pi can satisfy `SKILL.md:163`.
- **F3: “Inside its turn” does not prove a transcript flush.** `scripts/transcript.ts:12` still calls the same external-process resolver. It does not consult the caller's tool-session environment. Claude's PID record can be caught mid-rewrite (`src/transcript.ts:110–118`); Codex's current selector uses file mtimes (`:159–162`). Moving the command into A's turn does not make those observations authoritative. Crucially, S1 needs **identity**, not proof that the start-prompt text has reached disk. Do not replace the warm-up with another nonce search in the start prompt's file.

The timing attacks do not establish another existing protection that must retain the warm-up:

- Sending while Claude's `/clear` is working is already what the current warm-up does (`door-reset.ts:111–115`), and the round-12 transcript showed that input reaching the new conversation. S1 substitutes the start prompt at that same transport boundary. This is evidence for Claude, not a proof for every reset/UI state of all four harnesses.
- `hc schema` defines `started` as observing working within a few seconds. The work can belong to the reset. It does not prove the start prompt was consumed. Keep the single unsubmitted-input Enter recovery, and use fresh A's existing `continue ...` Mode entry as evidence of continuation, rather than interpreting `started:true` as that evidence.
- Operator input after the one input check is already outside today's cancellation check (`door-reset.ts:103–115`). The warm-up does not recheck it. Keep the existing guard and stated limit; do not credit the warm-up with closing that window.
- A changed identity does not independently prove that a harness cleared all context. Both designs trust the harness's reset operation for that property. A half-reset retaining the same identity must be refused by the continuation gate.

## Smallest pi fix and identity authority

For a **self lookup only**, prefer the caller's current `PI_SESSION_FILE`, then publish that real path through the existing `akrogon.transcript` label. Scope self lookup to the requested hc seat/session so A inspecting B cannot publish A's environment as B's identity. Pi 1.5.0's installed `resolveSpawnContext` supplies `PI_SESSION_FILE` from the current session manager on each shell-tool call, including after `/new`.

That one branch fixes the self-call but is **not sufficient for the watcher**. External pi lookups must treat argv as a startup seed, not a current-conversation fact that overrides an owner-published label. Otherwise observe immediately puts the old label back, and `watch-issues/SKILL.md:44` can compare an old log with that old label while stopping the new conversation. Invalidate the old pi transcript label during reset, suppress startup reseeding while it is unknown, and have the first self lookup publish the current file before chart work. This uses the existing label, not a new file or timer.

For the general gate, prefer native per-tool identity (`CLAUDE_CODE_SESSION_ID`, `CODEX_THREAD_ID`, `PI_SESSION_ID`/`PI_SESSION_FILE`, `ANTIGRAVITY_CONVERSATION_ID`) over a process-global inference. If a path cannot be supplied without waiting for persistence, record the native conversation ID in the existing Mode entry and compare that ID on continuation; keep the transcript path for logs/usage. Unknown identity must refuse continuation. This removes the need to assume any particular start-prompt flush order.

Keep historical seat paths unchanged. Fresh A appends its new seat and opens its span only after the gate (`SKILL.md:39,153,163`). Label publication remains a resolver responsibility even though the helper's post-warm-up label stage goes away.

## Comparison and checks

The herdr-era helper already had a warm-up **only for Codex** (`af28d63e^:door-reset.ts:212–231`), then compared herdr's owner-reported session identity (`:176–184,233–235`). It polled that identity. This supports separating identity from transcript contents; restoring its polling is unnecessary.

**S1** deletes one model turn, nonce/reply parsing, the post-reset reply wait and failure-prone outside lookup. `transcriptByCode`/`resetCandidates` have no other production caller, so they can go. **Heartbeat** keeps those parts and adds periodic reads, violating the no-polling constraint. **Handshake** gives a causal owner acknowledgement but retains a warm-up, an extra tool command and a message receiver. I prefer the simpler continuation gate now that S1 makes the real start turn perform that work.

Required functional proof before declaring an implementation ready: **T1** successful first-turn identity/continuation on all four harnesses; **T2** a reset that does nothing refuses chart work and leaves the entry unconsumed; **T3** delayed assistant persistence does not matter; **T4** pi with an old argv ID and a new self path stays correctly labeled after an external observe lookup. No live reset or paid agent probe was performed here. Only the pi resolver reproduction used mocks; no labels or implementation files were changed.
