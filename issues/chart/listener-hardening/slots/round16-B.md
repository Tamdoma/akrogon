# Round 16 B

The current event-only predicate cannot correctly detect a later file write that produces no event. Keep the operator's constraints by moving the warm-up acknowledgement onto **hc communication**, rather than adding another transcript read schedule.

The incident log confirms the full-bound failure. The file now contains the nonce-bearing user and assistant records. Record timestamps describe the records, not when they became readable, so they cannot refute the measured post-done flush. The predicate depends on that flush (`door-reset.ts:123–138`), while `src/hc.ts:394` discards heartbeats and `:460–469` evaluates only on terminal facts.

## Candidates

| Option | Cost and correctness | Polling/watcher? |
| --- | --- | --- |
| **O1: transient fs.watch** | Adds a second wake source, setup/teardown and race-free initial recheck. For agy, watching only `.db` misses commits held in `.db-wal`; file replacement also matters. It can address the missing signal if implemented correctly. | Yes, a filesystem watcher. It violates the stated constraint even when short-lived. |
| **O2: bounded extra read** | One delayed read can still precede the flush. Repeating until success works only by adding scheduled reads. The existing bound limits duration, not write latency. | A single retry is a delay, not continuous polling, but is insufficient. Repeated retries are polling. |
| **O3: turn after observing the nonce's user record** | Removes the assistant-flush dependency only if the user record is guaranteed readable before that turn completes. The current hc contract supplies no such guarantee. If that record is also late, the same missing-wake failure remains. A counter alone still cannot distinguish `/clear` from warm-up. | Event-driven in form, but incomplete without an authoritative receipt acknowledgement. |
| **O4: another existing hc wait** | `hc schema` exposes terminal status/turn/output events, not transcript flush. `send --wait` and a fresh idle read do not strengthen that contract. Output matching can see the echoed prompt, and does not identify a new conversation or a disk commit. | Rechecking on 15-second heartbeats would be polling, despite using hc as its timer. |
| **O5: warm-up reports its identity through hc** | One warm-up tool command and a small message receiver in the existing helper. Replaces reply-file parsing and its missing wake source with an explicit, nonce-correlated acknowledgement. | No filesystem polling, watcher or new file. Uses the existing hc transport. Recommended local design. |

The smallest correction at the producer would be to flush transcript content before reporting done. That is an upstream harness guarantee, not something this helper can create by choosing another predicate.

## O5: concrete handover

Capture old A's **current native identity** from its tool environment in the existing launch command (`SKILL.md:159`). Pass it to the helper. The warm-up asks fresh A to execute a supplied `hc send <helper-address> <nonce-and-native-identity>` command, rather than merely print a reply.

The helper receives that message on stdin, validates the nonce/seat and requires an identity different from pre-reset. Then it obtains a fresh hc state and waits for warm-up idle/done if necessary. The acknowledgement was generated inside the warm-up, so the earlier `/clear` completion cannot satisfy it. Publish the actual new transcript path to the existing label and send the start prompt. Keep the existing pre-reset operator-input check. An absent acknowledgement or unchanged identity fails within the existing bound.

This changes `door-reset.ts:114–146` and the launch recipe, and removes the warm-up's dependency on `answered()`/`transcriptByCode()`. It is a protocol change, not a one-line wait adjustment. Four existing native identity sources are available:

- **Claude:** `CLAUDE_CODE_SESSION_ID` in tool context. Its installed binary updates the session environment on reset. Resolve its native current transcript independently of reply contents.
- **Codex:** `CODEX_THREAD_ID`. Verified present in this seat's tool environment and matching its rollout.
- **Pi:** `PI_SESSION_ID` and **`PI_SESSION_FILE`**. Installed 1.5.0 `dist/core/tools/bash.js`, `resolveSpawnContext` (binary offset about 120027890), fills them from the current session manager for each tool call. Preserve that current file as authoritative after `/new`; the launch-time `--session-id` is the old conversation (`src/transcript.ts:146–149`).
- **Agy:** `ANTIGRAVITY_CONVERSATION_ID`. An existing native tool-result step confirms the exported value equals its conversation DB filename: `conversations/0fd7ca39-6ebb-4594-8018-a62b61c20731.db`, step 30. Use the current presence-derived DB path.

Transport checked without an agent launch/reset: a temporary plain Bun helper received an `hc send` payload directly as a stdin line. It exited and was removed. The full proposed per-harness handshake has not been run here.

## Other harness write ordering

**Codex 0.167.0:** normal tasks await rollout flush **before** `on_task_finished` emits completion ([tasks/mod.rs:395–418](https://github.com/openai/codex/blob/rust-v0.167.0/codex-rs/core/src/tasks/mod.rs#L395)). A second flush after completion concerns the terminal event itself. That later flush does not establish that its assistant reply has Claude's ordering.

**Pi 1.5.0:** installed `SessionManager._persist` (binary offset 117545518) uses synchronous write/append calls. Its message-end handler appends the message before the later `agent_settled` notification, on which `ProgramStatusReporter` reports done. Normal reply persistence therefore precedes done in this implementation.

**Agy 1.5.3:** native SQLite/WAL data proves the records exist, not their commit order relative to the CLI's OSC idle report. No paired commit/status capture was available. I cannot claim the ordering either way. Current DB/WAL mtimes or protobuf record timestamps are insufficient proof.

## Fake

`tests/door-agent.ts:144–145` currently writes the assistant record before idle. Add an explicitly controlled mode that reports idle first, then commits the assistant record when released, with **no subsequent terminal status/title event**. Gate the commit through test control, not a 100 ms sleep. Cover both orderings. For O5, the identity acknowledgement and correct handover must work even while reply persistence remains gated; missing acknowledgements and unchanged identities must refuse continuation.

Read-only investigation. No live agent inputs, resets, labels or implementation edits.
